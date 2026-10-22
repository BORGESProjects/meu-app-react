package com.apaprovado;

import com.apaprovado.controller.EditalController;
import com.apaprovado.model.EditalItem;
import com.apaprovado.repository.EditalRepository;
import com.apaprovado.service.ImportAdmin;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import static org.mockito.Mockito.*;
import static org.junit.jupiter.api.Assertions.*;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.http.MediaType;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class EditalSecurityTests {
    @Test void httpRoutesRejectMissingLoginWith401() throws Exception {
        var repo=mock(EditalRepository.class);
        var auth=new ImportAdmin(new RestTemplateBuilder(),"https://trusted.supabase.co","admin@example.com");
        var mvc=MockMvcBuilders.standaloneSetup(new EditalController(repo,auth)).build();
        mvc.perform(post("/api/editais").contentType(MediaType.APPLICATION_JSON).content("{}"))
            .andExpect(status().isUnauthorized());
        mvc.perform(patch("/api/editais/1/toggle")).andExpect(status().isUnauthorized());
        mvc.perform(delete("/api/editais/1")).andExpect(status().isUnauthorized());
        verifyNoInteractions(repo);
    }
    @Test void rejectsAnonymousAndNonAdminWritesBeforeTouchingSharedRows() {
        for (String token : new String[]{null,"Bearer ordinary-user"}) {
            var repo=mock(EditalRepository.class);
            var auth=mock(ImportAdmin.class);
            when(auth.require(token,"public-key")).thenThrow(new ResponseStatusException(HttpStatus.FORBIDDEN));
            var controller=new EditalController(repo,auth);
            assertThrows(ResponseStatusException.class,()->controller.salvar(new EditalItem(),token,"public-key"));
            assertThrows(ResponseStatusException.class,()->controller.alternarConcluido(1L,token,"public-key"));
            assertThrows(ResponseStatusException.class,()->controller.deletar(1L,token,"public-key"));
            verifyNoInteractions(repo);
        }
    }
    @Test void authorizedAdminKeepsTemplateCreationAndPublicReads() {
        var repo=mock(EditalRepository.class);
        var auth=mock(ImportAdmin.class);
        when(auth.require("Bearer admin","key")).thenReturn("admin-id");
        var controller=new EditalController(repo,auth);
        var item=new EditalItem();
        when(repo.save(item)).thenReturn(item);
        assertSame(item,controller.salvar(item,"Bearer admin","key"));
        controller.listar("CPOR");
        verify(repo).save(item);
        verify(repo).findByConcurso("CPOR");
        verify(auth).require("Bearer admin","key");
    }
}
