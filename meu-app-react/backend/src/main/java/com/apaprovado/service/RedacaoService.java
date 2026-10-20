package com.apaprovado.service;

import com.apaprovado.dto.RedacaoRequest;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.springframework.stereotype.Service;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
public class RedacaoService {
    public record Criterio(String id,String nome,int maximo) {}
    public static List<Criterio> rubrica(String banca) {
        if("ENEM".equals(banca)) return List.of(new Criterio("C1","Norma-padrão",200),new Criterio("C2","Tema e repertório",200),new Criterio("C3","Argumentação",200),new Criterio("C4","Coesão",200),new Criterio("C5","Intervenção",200));
        if("FUVEST".equals(banca)) return List.of(new Criterio("tema","Tema e organização",40),new Criterio("articulacao","Coerência e articulação",30),new Criterio("linguagem","Gramática e vocabulário",30));
        return List.of(new Criterio("tema","Adequação ao tema",30),new Criterio("argumentacao","Argumentação",30),new Criterio("coesao","Estrutura e coesão",20),new Criterio("linguagem","Norma-padrão",20));
    }
    public static String perfil(String banca) {return Set.of("ENEM","FUVEST").contains(banca==null?"":banca.toUpperCase(Locale.ROOT))?banca.toUpperCase(Locale.ROOT):"GERAL";}
    public static void validar(RedacaoRequest r) {
        if(r==null || r.getTema()==null || r.getTema().strip().length()<3 || r.getTema().length()>500) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Informe um tema entre 3 e 500 caracteres.");
        if(r.getTexto()==null || r.getTexto().strip().length()<80 || r.getTexto().length()>20000) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"Envie um texto entre 80 e 20.000 caracteres para a análise.");
        if(r.getCriterios()!=null && r.getCriterios().length()>3000 || r.getBanca()!=null && r.getBanca().length()>120) throw new ResponseStatusException(HttpStatus.BAD_REQUEST,"As instruções ultrapassam o limite permitido.");
    }
    private static String texto(JsonNode n,int max) {
        String s=n.isTextual()?n.asText().strip():"";
        if(s.isBlank() || s.length()>max) throw invalida(); return s;
    }
    private static ResponseStatusException invalida() {return new ResponseStatusException(HttpStatus.BAD_GATEWAY,"A IA devolveu um relatório incompleto. Seu texto foi preservado; tente novamente.");}
    private static ArrayNode lista(ObjectMapper mapper,JsonNode n,int max) {
        if(!n.isArray()) throw invalida();var out=mapper.createArrayNode();
        for(JsonNode v:n) {if(out.size()>=max)break;out.add(texto(v,1200));}return out;
    }
    public static ObjectNode normalizar(ObjectMapper mapper,JsonNode raw,RedacaoRequest request) {
        if(raw==null || !raw.isObject())throw invalida();
        var out=mapper.createObjectNode();String perfil=perfil(request.getBanca());var rubrica=rubrica(perfil);
        out.put("versao",1);out.put("perfil",perfil);out.put("resumo",texto(raw.path("resumo"),2000));
        var notas=out.putArray("criterios");int total=0;
        if(!raw.path("criterios").isArray() || raw.path("criterios").size()!=rubrica.size())throw invalida();
        for(var c:rubrica) {
            JsonNode encontrado=null;
            for(var n:raw.path("criterios"))if(c.id().equals(n.path("id").asText())) {if(encontrado!=null)throw invalida();encontrado=n;}
            if(encontrado==null || !encontrado.path("nota").isIntegralNumber() || !encontrado.path("nota").canConvertToInt())throw invalida();
            int nota=encontrado.path("nota").asInt();
            if(nota<0 || nota>c.maximo() || "ENEM".equals(perfil) && nota%40!=0)throw invalida();
            var item=notas.addObject();item.put("id",c.id());item.put("nome",c.nome());item.put("nota",nota);item.put("maximo",c.maximo());
            item.put("justificativa",texto(encontrado.path("justificativa"),1500));item.put("sugestao",texto(encontrado.path("sugestao"),1200));total+=nota;
        }
        out.put("nota",total);out.put("maximo",rubrica.stream().mapToInt(Criterio::maximo).sum());
        out.put("escala","ENEM".equals(perfil)?"Estimativa pedagógica na escala ENEM":"Escala pedagógica normalizada; não é a nota oficial da banca");
        out.set("pontos_fortes",lista(mapper,raw.path("pontos_fortes"),3));out.set("prioridades",lista(mapper,raw.path("prioridades"),3));
        if(out.path("prioridades").isEmpty())throw invalida();
        var alertas=lista(mapper,raw.path("alertas"),4);out.set("alertas",alertas);
        var revisoes=out.putArray("revisoes");if(!raw.path("revisoes").isArray())throw invalida();
        boolean omitida=false;
        for(var n:raw.path("revisoes")) {
            if(revisoes.size()>=6)break;
            String trecho=texto(n.path("trecho"),500);int inicio=request.getTexto().indexOf(trecho);
            if(inicio<0){omitida=true;continue;}
            var item=revisoes.addObject();item.put("trecho",trecho);item.put("inicio",inicio);
            item.put("problema",texto(n.path("problema"),1200));item.put("sugestao",texto(n.path("sugestao"),1200));
        }
        if(omitida)alertas.add("Uma indicação sem correspondência literal no texto foi omitida.");
        return out;
    }
}
