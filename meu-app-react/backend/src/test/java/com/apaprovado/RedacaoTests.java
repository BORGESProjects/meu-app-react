package com.apaprovado;
import com.apaprovado.dto.RedacaoRequest;
import com.apaprovado.service.*;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.*;
import org.springframework.test.web.client.MockRestServiceServer;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;
import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.test.web.client.match.MockRestRequestMatchers.*;
import static org.springframework.test.web.client.response.MockRestResponseCreators.*;
class RedacaoTests {
 final ObjectMapper mapper=new ObjectMapper();
 RedacaoRequest pedido(){var r=new RedacaoRequest();r.setTema("Educação pública");r.setTexto("A educação pública precisa de investimento e de professores valorizados. Isso amplia oportunidades.");r.setBanca("ENEM");return r;}
 ObjectNode valido(){var r=mapper.createObjectNode();r.put("resumo","Diagnóstico");var cs=r.putArray("criterios");for(var c:RedacaoService.rubrica("ENEM")){var n=cs.addObject();n.put("id",c.id());n.put("nota",160);n.put("justificativa","Evidência");n.put("sugestao","Revisar argumento");}r.putArray("pontos_fortes");r.putArray("prioridades").add("Desenvolver argumento");r.putArray("alertas");r.putArray("revisoes");return r;}
 MockRestServiceServer servidor(Object service){return MockRestServiceServer.bindTo((RestTemplate)ReflectionTestUtils.getField(service,"http")).build();}
 String resposta()throws Exception{return mapper.writeValueAsString(java.util.Map.of("candidates",java.util.List.of(java.util.Map.of("finishReason","STOP","content",java.util.Map.of("parts",java.util.List.of(java.util.Map.of("text",valido().toString())))))));}
 @Test void somaERejeitaNotasInconsistentes(){assertEquals(800,RedacaoService.normalizar(mapper,valido(),pedido()).path("nota").asInt());var r=valido();((ObjectNode)r.path("criterios").path(0)).put("nota",170);assertThrows(ResponseStatusException.class,()->RedacaoService.normalizar(mapper,r,pedido()));assertThrows(ResponseStatusException.class,()->RedacaoService.normalizar(mapper,null,pedido()));}
 @Test void eliminaCitacaoInventada(){var r=valido();var c=((ArrayNode)r.path("revisoes")).addObject();c.put("trecho","Nunca escrevi isso");var normal=RedacaoService.normalizar(mapper,r,pedido());assertTrue(normal.path("revisoes").isEmpty());assertEquals(1,normal.path("alertas").size());}
 @Test void cacheReutilizaApenasMesmaConta()throws Exception{var service=new GeminiService(new RestTemplateBuilder(),mapper,"segredo","modelo-teste");var server=servidor(service);server.expect(requestTo("https://generativelanguage.googleapis.com/v1beta/models/modelo-teste:generateContent")).andRespond(withSuccess(resposta(),MediaType.APPLICATION_JSON));server.expect(anything()).andRespond(withSuccess(resposta(),MediaType.APPLICATION_JSON));assertFalse(service.corrigir("A",pedido()).reutilizada());assertTrue(service.corrigir("A",pedido()).reutilizada());assertFalse(service.corrigir("B",pedido()).reutilizada());server.verify();}
 @Test void quotaNaoRepeteNemVazaDetalhes(){var service=new GeminiService(new RestTemplateBuilder(),mapper,"segredo","modelo-teste");var server=servidor(service);server.expect(anything()).andRespond(withStatus(HttpStatus.TOO_MANY_REQUESTS).body("SEGREDO"));var erro=assertThrows(ResponseStatusException.class,()->service.corrigir("A",pedido()));assertEquals(429,erro.getStatusCode().value());assertFalse(erro.getMessage().contains("SEGREDO"));server.verify();}
 @Test void indisponibilidadeTemUmaRetentativa()throws Exception{var service=new GeminiService(new RestTemplateBuilder(),mapper,"segredo","modelo-teste");var server=servidor(service);server.expect(anything()).andRespond(withStatus(HttpStatus.SERVICE_UNAVAILABLE));server.expect(anything()).andRespond(withSuccess(resposta(),MediaType.APPLICATION_JSON));assertEquals(800,service.corrigir("A",pedido()).relatorio().path("nota").asInt());server.verify();}
 @Test void autenticacaoExigeSessaoConfirmadaDeQualquerEstudante(){var auth=new RedacaoAuth(new RestTemplateBuilder(),"https://example.supabase.co");assertThrows(ResponseStatusException.class,()->auth.require(null,null));var server=servidor(auth);server.expect(anything()).andRespond(withSuccess("{\"id\":\"estudante\",\"email_confirmed_at\":\"2026-01-01\"}",MediaType.APPLICATION_JSON));assertEquals("estudante",auth.require("Bearer token","public-key"));server.verify();}
}
