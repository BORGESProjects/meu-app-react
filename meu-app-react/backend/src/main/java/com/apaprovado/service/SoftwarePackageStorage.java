package com.apaprovado.service;

import java.net.URI;
import java.time.Duration;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.client.config.ClientOverrideConfiguration;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
public class SoftwarePackageStorage {
    private static final Duration LINK_TTL = Duration.ofMinutes(5);
    private static final Map<String, PackageFile> PACKAGES = Map.of(
        "windows", new PackageFile("software/releases/0.3.17/windows-x64-setup.exe",
            "AP-Aprovado-0.3.17-Windows-x64-setup.exe"),
        "android", new PackageFile("software/releases/0.3.17/android-arm64-teste.apk",
            "AP-Aprovado-0.3.17-Android-ARM64-teste.apk")
    );

    private final String bucket;
    private final S3Client client;
    private final S3Presigner presigner;

    public SoftwarePackageStorage(
            @Value("${R2_ACCOUNT_ID:}") String accountId,
            @Value("${R2_ACCESS_KEY_ID:}") String accessKey,
            @Value("${R2_SECRET_ACCESS_KEY:}") String secretKey,
            @Value("${R2_BUCKET_NAME:acervo-extraido}") String bucket) {
        this.bucket = bucket.trim();
        if (accountId.isBlank() || accessKey.isBlank() || secretKey.isBlank() || bucket.isBlank()) {
            this.client = null;
            this.presigner = null;
            return;
        }

        URI endpoint = URI.create("https://" + accountId.trim() + ".r2.cloudflarestorage.com");
        StaticCredentialsProvider credentials = StaticCredentialsProvider.create(
            AwsBasicCredentials.create(accessKey.trim(), secretKey.trim()));
        S3Configuration config = S3Configuration.builder().pathStyleAccessEnabled(true)
            .chunkedEncodingEnabled(false).build();
        ClientOverrideConfiguration timeout = ClientOverrideConfiguration.builder()
            .apiCallTimeout(Duration.ofSeconds(20)).apiCallAttemptTimeout(Duration.ofSeconds(8)).build();
        this.client = S3Client.builder().endpointOverride(endpoint).credentialsProvider(credentials)
            .region(Region.of("auto")).serviceConfiguration(config).overrideConfiguration(timeout).build();
        this.presigner = S3Presigner.builder().endpointOverride(endpoint).credentialsProvider(credentials)
            .region(Region.of("auto")).serviceConfiguration(config).build();
    }

    public boolean available(String platform) {
        PackageFile file = packageFor(platform);
        if (client == null) return false;
        try {
            client.headObject(HeadObjectRequest.builder().bucket(bucket).key(file.key()).build());
            return true;
        } catch (S3Exception error) {
            if (error.statusCode() == 404) return false;
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Não foi possível verificar o instalador agora.");
        } catch (SdkException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Não foi possível acessar o armazenamento de instaladores agora.");
        }
    }

    public SignedPackage sign(String platform) {
        PackageFile file = packageFor(platform);
        if (client == null || presigner == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "O instalador ainda não foi disponibilizado.");
        }
        if (!available(platform)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "O instalador ainda não foi disponibilizado.");
        }
        GetObjectRequest get = GetObjectRequest.builder().bucket(bucket).key(file.key())
            .responseContentType("application/octet-stream")
            .responseContentDisposition("attachment; filename=\"" + file.filename() + "\"").build();
        GetObjectPresignRequest request = GetObjectPresignRequest.builder()
            .signatureDuration(LINK_TTL).getObjectRequest(get).build();
        try {
            return new SignedPackage(file.filename(), presigner.presignGetObject(request).url().toString());
        } catch (SdkException error) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                "Não foi possível preparar o download agora.");
        }
    }

    private static PackageFile packageFor(String platform) {
        PackageFile file = PACKAGES.get(platform);
        if (file == null) throw new ResponseStatusException(HttpStatus.NOT_FOUND,
            "Plataforma de download inválida.");
        return file;
    }

    private record PackageFile(String key, String filename) {}
    public record SignedPackage(String filename, String url) {}
}
