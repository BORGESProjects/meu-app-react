package com.apaprovado.service;

import jakarta.annotation.PreDestroy;
import java.io.IOException;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Pattern;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.exception.SdkException;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.HeadObjectRequest;
import software.amazon.awssdk.services.s3.model.ListObjectsV2Request;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.model.S3Exception;
import software.amazon.awssdk.services.s3.model.S3Object;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
public class R2AcervoStorage {
    private static final int MAX_KEYS_PER_REQUEST = 100;
    private static final long MAX_STORAGE_BYTES = 10_000_000_000L;
    private static final long MAX_UPLOAD_BATCH_BYTES = 3_800_000L;
    private static final Duration URL_TTL = Duration.ofMinutes(30);
    private static final Pattern ALLOWED_KEY = Pattern.compile(
        "(?:manifesto|visuais)\\.json|lotes/[A-Za-z0-9._-]+\\.json\\.gz|paginas/[A-Za-z0-9._-]+\\.webp"
    );

    private final String bucket;
    private final S3Client client;
    private final S3Presigner presigner;
    private final ExecutorService uploadExecutor = Executors.newFixedThreadPool(6);
    private StorageUsage cachedUsage;

    public R2AcervoStorage(
        @Value("${R2_ACCOUNT_ID:}") String accountId,
        @Value("${R2_ACCESS_KEY_ID:}") String accessKey,
        @Value("${R2_SECRET_ACCESS_KEY:}") String secretKey,
        @Value("${R2_BUCKET_NAME:acervo-extraido}") String bucket
    ) {
        this.bucket = bucket.trim();
        if (accountId.isBlank() || accessKey.isBlank() || secretKey.isBlank() || bucket.isBlank()) {
            this.client = null;
            this.presigner = null;
            return;
        }

        URI endpoint = URI.create("https://" + accountId.trim() + ".r2.cloudflarestorage.com");
        StaticCredentialsProvider credentials = StaticCredentialsProvider.create(
            AwsBasicCredentials.create(accessKey.trim(), secretKey.trim())
        );
        S3Configuration clientConfiguration = S3Configuration.builder()
            .pathStyleAccessEnabled(true)
            .chunkedEncodingEnabled(false)
            .build();
        this.client = S3Client.builder()
            .endpointOverride(endpoint)
            .credentialsProvider(credentials)
            .region(Region.of("auto"))
            .serviceConfiguration(clientConfiguration)
            .build();
        this.presigner = S3Presigner.builder()
            .endpointOverride(endpoint)
            .credentialsProvider(credentials)
            .region(Region.of("auto"))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .build();
    }

    public Map<String, String> presignExisting(List<String> requestedKeys) {
        ensureConfigured();
        if (requestedKeys == null || requestedKeys.isEmpty() || requestedKeys.size() > MAX_KEYS_PER_REQUEST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie de 1 a 100 arquivos por solicitação.");
        }

        Map<String, String> signedUrls = new LinkedHashMap<>();
        for (String key : requestedKeys) {
            validateKey(key);
            try {
                client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build());
                GetObjectRequest get = GetObjectRequest.builder().bucket(bucket).key(key).build();
                GetObjectPresignRequest request = GetObjectPresignRequest.builder()
                    .signatureDuration(URL_TTL)
                    .getObjectRequest(get)
                    .build();
                signedUrls.put(key, presigner.presignGetObject(request).url().toString());
            } catch (S3Exception e) {
                if (e.statusCode() == 404) continue;
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível consultar o arquivo no armazenamento.");
            } catch (SdkException e) {
                throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível acessar o armazenamento agora.");
            }
        }
        return signedUrls;
    }

    public synchronized StorageStatus storageStatus() {
        ensureConfigured();
        StorageUsage usage = readStorageUsageWithKeys();
        cachedUsage = usage;
        return toStatus(usage);
    }

    public synchronized PreflightResult preflight(List<UploadFileDescriptor> files) {
        ensureConfigured();
        if (files == null || files.isEmpty() || files.size() > 40_000) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O pacote precisa conter de 1 a 40.000 arquivos.");
        }

        Set<String> requestedKeys = new HashSet<>();
        long incomingBytes = 0L;
        for (UploadFileDescriptor file : files) {
            if (file == null) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A lista de arquivos é inválida.");
            validateKey(file.key());
            if (!requestedKeys.add(file.key())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O pacote contém caminhos repetidos.");
            }
            if (file.bytes() <= 0L) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O pacote contém um arquivo vazio.");
            incomingBytes = Math.addExact(incomingBytes, file.bytes());
        }

        StorageUsage current = readStorageUsageWithKeys();
        cachedUsage = current;
        if (current.bytes() > MAX_STORAGE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                "O bucket já está acima de 10 GB. O envio foi bloqueado antes de alterar qualquer arquivo.");
        }
        long projectedBytes = current.bytes();
        for (UploadFileDescriptor file : files) {
            long existingBytes = current.objectSizes().getOrDefault(file.key(), 0L);
            projectedBytes = Math.addExact(projectedBytes - existingBytes, file.bytes());
        }
        if (projectedBytes > MAX_STORAGE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                "O pacote completo ultrapassaria o limite de 10 GB do bucket. Nenhum arquivo foi enviado.");
        }
        return new PreflightResult(toStatus(current), projectedBytes, Math.max(0L, projectedBytes - current.bytes()), files.size(), incomingBytes);
    }

    /**
     * Sends a small multipart batch through the backend so every write is checked against
     * the full bucket usage. The old browser-to-R2 write-signing path is intentionally absent.
     */
    public synchronized Map<String, Object> uploadBatch(List<MultipartFile> files) {
        ensureConfigured();
        if (files == null || files.isEmpty() || files.size() > MAX_KEYS_PER_REQUEST) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Envie de 1 a 100 arquivos por lote.");
        }

        Set<String> keys = new HashSet<>();
        List<PendingObject> pending = new ArrayList<>();
        long incomingBytes = 0L;
        for (MultipartFile file : files) {
            String key = decodeObjectKey(file);
            validateKey(key);
            if (!keys.add(key)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O lote contém caminhos repetidos.");
            }
            long size = file.getSize();
            if (size <= 0L) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Arquivos vazios não podem ser publicados.");
            }
            incomingBytes = Math.addExact(incomingBytes, size);
            if (incomingBytes > MAX_UPLOAD_BATCH_BYTES) {
                throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE, "Cada lote deve ter no máximo 3,8 MB.");
            }
            pending.add(new PendingObject(file, key, 0L));
        }

        StorageUsage before = cachedUsage;
        if (before == null) {
            before = readStorageUsageWithKeys();
            cachedUsage = before;
        }
        long replacingBytes = 0L;
        long newObjects = 0L;
        List<PendingObject> resolved = new ArrayList<>(pending.size());
        for (PendingObject item : pending) {
            long existingBytes = before.objectSizes().getOrDefault(item.key(), 0L);
            replacingBytes = Math.addExact(replacingBytes, existingBytes);
            if (existingBytes == 0L) newObjects++;
            resolved.add(new PendingObject(item.file(), item.key(), existingBytes));
        }
        pending = resolved;
        if (before.bytes() > MAX_STORAGE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                "O bucket já está acima de 10 GB. O envio foi bloqueado antes de alterar qualquer arquivo.");
        }
        long projectedBytes = Math.addExact(Math.max(0L, before.bytes() - replacingBytes), incomingBytes);
        if (projectedBytes > MAX_STORAGE_BYTES) {
            throw new ResponseStatusException(HttpStatus.PAYLOAD_TOO_LARGE,
                "Este envio ultrapassaria o limite de 10 GB do bucket. Nenhum arquivo deste lote foi enviado.");
        }

        try {
            List<CompletableFuture<Void>> writes = pending.stream()
                .map(item -> CompletableFuture.runAsync(() -> uploadAndVerify(item), uploadExecutor))
                .toList();
            CompletableFuture.allOf(writes.toArray(CompletableFuture[]::new)).join();

            Map<String, Long> updatedSizes = new HashMap<>(before.objectSizes());
            for (PendingObject item : pending) updatedSizes.put(item.key(), item.file().getSize());
            StorageUsage after = new StorageUsage(projectedBytes, before.objects() + newObjects, Map.copyOf(updatedSizes));
            cachedUsage = after;
            return Map.of("enviados", files.size(), "enviadosBytes", incomingBytes, "armazenamento", toStatus(after));
        } catch (CompletionException e) {
            cachedUsage = null;
            Throwable cause = e.getCause();
            if (cause instanceof ResponseStatusException responseStatus) throw responseStatus;
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "O envio ao armazenamento falhou. O lote pode ser reenviado com segurança.");
        }
    }

    private void uploadAndVerify(PendingObject item) {
        MultipartFile file = item.file();
        String key = item.key();
        PutObjectRequest put = PutObjectRequest.builder()
            .bucket(bucket)
            .key(key)
            .contentLength(file.getSize())
            .contentType(contentTypeFor(key, file.getContentType()))
            .build();
        try (var input = file.getInputStream()) {
            client.putObject(put, RequestBody.fromInputStream(input, file.getSize()));
            long storedBytes = client.headObject(HeadObjectRequest.builder().bucket(bucket).key(key).build()).contentLength();
            if (storedBytes != file.getSize()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "A verificação do arquivo enviado não correspondeu ao tamanho original.");
            }
        } catch (IOException | SdkException e) {
            throw new CompletionException(e);
        }
    }

    private void ensureConfigured() {
        if (client == null || presigner == null) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "O armazenamento do acervo ainda não está configurado.");
        }
    }

    private StorageUsage readStorageUsageWithKeys() {
        try {
            long bytes = 0L;
            long objects = 0L;
            Map<String, Long> sizes = new HashMap<>();
            for (S3Object object : client.listObjectsV2Paginator(
                ListObjectsV2Request.builder().bucket(bucket).build()).contents()) {
                bytes = Math.addExact(bytes, object.size());
                sizes.put(object.key(), object.size());
                objects++;
            }
            return new StorageUsage(bytes, objects, sizes);
        } catch (SdkException e) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Não foi possível medir o uso atual do bucket.");
        }
    }

    private static StorageStatus toStatus(StorageUsage usage) {
        return new StorageStatus(usage.bytes(), MAX_STORAGE_BYTES,
            Math.max(0L, MAX_STORAGE_BYTES - usage.bytes()), usage.objects());
    }

    private static String contentTypeFor(String key, String supplied) {
        if (key.endsWith(".webp")) return "image/webp";
        if (key.endsWith(".json.gz")) return "application/gzip";
        if (key.endsWith(".json")) return "application/json; charset=utf-8";
        return supplied == null || supplied.isBlank() ? "application/octet-stream" : supplied;
    }

    private static String decodeObjectKey(MultipartFile file) {
        if (file == null || file.getOriginalFilename() == null || !file.getOriginalFilename().matches("[A-Za-z0-9_-]+")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome do arquivo não contém uma chave válida do acervo.");
        }
        try {
            return new String(Base64.getUrlDecoder().decode(file.getOriginalFilename()), StandardCharsets.UTF_8);
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O nome do arquivo não contém uma chave válida do acervo.");
        }
    }

    private static void validateKey(String key) {
        if (key == null || key.isBlank() || key.contains("..") || key.contains("\\")
            || key.startsWith("/") || !ALLOWED_KEY.matcher(key).matches()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O caminho solicitado não pertence ao acervo permitido.");
        }
    }

    public record StorageStatus(long usedBytes, long limitBytes, long remainingBytes, long objects) {}
    public record UploadFileDescriptor(String key, long bytes) {}
    public record PreflightResult(StorageStatus current, long projectedBytes, long additionalBytes, long files, long packageBytes) {}
    private record StorageUsage(long bytes, long objects, Map<String, Long> objectSizes) {}
    private record PendingObject(MultipartFile file, String key, long existingBytes) {}

    @PreDestroy
    public void close() {
        uploadExecutor.shutdown();
        if (client != null) client.close();
        if (presigner != null) presigner.close();
    }
}

