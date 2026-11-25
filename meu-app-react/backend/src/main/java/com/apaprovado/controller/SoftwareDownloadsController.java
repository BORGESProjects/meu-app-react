package com.apaprovado.controller;

import com.apaprovado.service.SoftwareDownloads;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/software/downloads")
public class SoftwareDownloadsController {
    private final SoftwareDownloads downloads;
    public SoftwareDownloadsController(SoftwareDownloads downloads){this.downloads=downloads;}
    @GetMapping public ResponseEntity<List<SoftwareDownloads.Instalador>> catalogo(
            @RequestHeader(value="Authorization",required=false) String token,
            @RequestHeader(value="X-Supabase-Key",required=false) String key) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(downloads.catalogo(token,key));
    }
    @GetMapping("/{plataforma}") public ResponseEntity<Resource> baixar(@PathVariable String plataforma,
            @RequestHeader(value="Authorization",required=false) String token,
            @RequestHeader(value="X-Supabase-Key",required=false) String key) {
        return downloads.baixar(plataforma,token,key);
    }
    @GetMapping("/{plataforma}/link") public ResponseEntity<SoftwareDownloads.DownloadLink> link(
            @PathVariable String plataforma,
            @RequestHeader(value="Authorization",required=false) String token,
            @RequestHeader(value="X-Supabase-Key",required=false) String key) {
        return ResponseEntity.ok().cacheControl(CacheControl.noStore()).body(downloads.link(plataforma,token,key));
    }
}
