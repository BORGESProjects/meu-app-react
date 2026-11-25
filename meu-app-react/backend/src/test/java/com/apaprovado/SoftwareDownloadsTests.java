package com.apaprovado;

import com.apaprovado.service.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.nio.file.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class SoftwareDownloadsTests {
    final SupabaseSessionAuth auth=mock(SupabaseSessionAuth.class);
    final AcessoComercial access=mock(AcessoComercial.class);
    final SoftwarePackageStorage packages=mock(SoftwarePackageStorage.class);
    @TempDir Path folder;
    void student(boolean active) throws Exception {
        when(auth.requireAuthenticated("Bearer token","key")).thenReturn(new ObjectMapper().readTree("{\"email\":\"student@example.com\",\"email_confirmed_at\":\"2026-01-01\"}"));
        when(access.status("student@example.com")).thenReturn(new AcessoComercial.Status(active,null,false,null,null));
    }
    @Test void downloadRechecksPaymentEveryTime() throws Exception {
        student(true);Path file=Files.writeString(folder.resolve("installer.exe"),"test installer");
        var service=new SoftwareDownloads(auth,access,file.toString(),"",packages);
        assertTrue(service.catalogo("Bearer token","key").get(0).disponivel());
        assertEquals("no-store",service.baixar("windows","Bearer token","key").getHeaders().getCacheControl());
        student(false);
        assertEquals(403,assertThrows(ResponseStatusException.class,()->service.baixar("windows","Bearer token","key")).getStatusCode().value());
    }
    @Test void noFileIsNotAdvertisedAsAvailable() throws Exception {
        student(true);var service=new SoftwareDownloads(auth,access,"","",packages);
        assertFalse(service.catalogo("Bearer token","key").get(0).disponivel());
        assertEquals(404,assertThrows(ResponseStatusException.class,()->service.baixar("../private","Bearer token","key")).getStatusCode().value());
    }
    @Test void freeAccountCannotSeeDownloadCatalog() throws Exception {
        student(false);var service=new SoftwareDownloads(auth,access,"","",packages);
        assertThrows(ResponseStatusException.class,()->service.catalogo("Bearer token","key"));
    }
}
