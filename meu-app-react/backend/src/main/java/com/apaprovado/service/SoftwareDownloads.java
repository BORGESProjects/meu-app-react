package com.apaprovado.service;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class SoftwareDownloads {
    private final SupabaseSessionAuth sessoes;
    private final AcessoComercial acessos;
    private final SoftwarePackageStorage packages;
    private final Map<String,String> arquivos;
    public SoftwareDownloads(SupabaseSessionAuth sessoes,AcessoComercial acessos,
            @Value("${app.downloads.windows-path:}") String windows,
            @Value("${app.downloads.android-path:}") String android,
            SoftwarePackageStorage packages) {
        this.sessoes=sessoes;this.acessos=acessos;this.packages=packages;
        this.arquivos=Map.of("windows",windows,"android",android);
    }
    private void validar(String authorization,String key) {
        var user=sessoes.requireAuthenticated(authorization,key);
        if(user.path("email_confirmed_at").asText("").isBlank()
                || !acessos.status(user.path("email").asText("")).liberado())
            throw new ResponseStatusException(HttpStatus.FORBIDDEN,"O download exige pagamento confirmado e acesso dentro da validade.");
    }
    public record Instalador(String plataforma,boolean disponivel,String versao,String descricao,
            String tamanho,String nomeArquivo) {}
    public List<Instalador> catalogo(String authorization,String key) {
        validar(authorization,key);
        return List.of(
            new Instalador("windows",disponivel("windows"),"0.3.17","Windows · x64","35,8 MB",
                "AP-Aprovado-0.3.17-Windows-x64-setup.exe"),
            new Instalador("android",disponivel("android"),"0.3.17","Android · ARM64 · versão de teste","257,1 MB",
                "AP-Aprovado-0.3.17-Android-ARM64-teste.apk")
        );
    }
    private boolean disponivel(String plataforma) {
        String arquivo=arquivos.get(plataforma);
        return arquivoLocalDisponivel(plataforma)||packages.available(plataforma);
    }
    private boolean arquivoLocalDisponivel(String plataforma) {
        String arquivo=arquivos.get(plataforma);
        return arquivo!=null&&!arquivo.isBlank()&&Files.isRegularFile(Path.of(arquivo))&&Files.isReadable(Path.of(arquivo));
    }
    public DownloadLink link(String plataforma,String authorization,String key) {
        validar(authorization,key);
        String filename=plataforma.equals("windows")?"AP-Aprovado-0.3.17-Windows-x64-setup.exe"
            :plataforma.equals("android")?"AP-Aprovado-0.3.17-Android-ARM64-teste.apk":null;
        if(filename==null)throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Plataforma de download inválida.");
        if(arquivoLocalDisponivel(plataforma))return new DownloadLink(filename,null);
        SoftwarePackageStorage.SignedPackage signed=packages.sign(plataforma);
        return new DownloadLink(signed.filename(),signed.url());
    }
    public record DownloadLink(String nomeArquivo,String url) {}
    public ResponseEntity<Resource> baixar(String plataforma,String authorization,String key) {
        validar(authorization,key);
        if(!disponivel(plataforma))throw new ResponseStatusException(HttpStatus.NOT_FOUND,"O instalador ainda não foi disponibilizado.");
        Path path=Path.of(arquivos.get(plataforma));
        String nome=plataforma.equals("windows")?"AP-Aprovado-Setup.exe":"AP-Aprovado.apk";
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).contentType(MediaType.APPLICATION_OCTET_STREAM)
            .header(HttpHeaders.CONTENT_DISPOSITION,ContentDisposition.attachment().filename(nome).build().toString())
            .body(new FileSystemResource(path));
    }
}
