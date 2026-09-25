package com.apaprovado.service;

import com.apaprovado.model.ImportacaoPdf;
import com.fasterxml.jackson.databind.*;
import com.fasterxml.jackson.databind.node.*;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.*;

@Service
public class QuestionDrafts {
    private final ObjectMapper mapper;
    public QuestionDrafts(ObjectMapper mapper) { this.mapper = mapper; }

    public ArrayNode normalize(JsonNode input, ImportacaoPdf job, boolean publishing) {
        if (!input.isArray() || input.size() > 150 || input.toString().length() > 1500000)
            throw bad("A lista de questões é inválida ou excede o limite.");
        ArrayNode output = mapper.createArrayNode();
        Set<Integer> numbers = new HashSet<>();
        for (JsonNode q : input) {
            int n = q.path("numero_original").asInt(0);
            if (n < 1 || n > job.esperadas || !numbers.add(n)) throw bad("Confira a numeração: há números inválidos ou repetidos.");
            ObjectNode clean = mapper.createObjectNode();
            clean.put("numero_original", n);
            for (String field : List.of("enunciado", "texto_apoio", "materia", "conteudo", "dificuldade", "observacao")) {
                String value = q.path(field).asText("").trim();
                if (value.length() > (field.equals("texto_apoio") ? 30000 : field.equals("enunciado") ? 15000 : 600))
                    throw bad("Um campo da questão " + n + " é longo demais.");
                clean.put(field, value);
            }
            if (clean.path("dificuldade").asText().isBlank()) clean.put("dificuldade", "Média");
            JsonNode options = q.path("opcoes");
            if (!options.isArray() || options.size() < 2 || options.size() > 5) throw bad("Questão " + n + ": informe de 2 a 5 alternativas.");
            ArrayNode opts = clean.putArray("opcoes");
            for (JsonNode opt : options) {
                if (!opt.isTextual() || opt.asText().length() > 5000) throw bad("Alternativa inválida na questão " + n + ".");
                opts.add(opt.asText().trim());
            }
            boolean cancelled = q.path("anulada").asBoolean(false);
            clean.put("anulada", cancelled);
            JsonNode answer = q.path("resposta_correta");
            if (!cancelled && answer.isIntegralNumber() && answer.asInt() >= 0 && answer.asInt() < opts.size())
                clean.put("resposta_correta", answer.asInt());
            else clean.putNull("resposta_correta");
            int page = q.path("pagina").asInt(0);
            clean.put("pagina", page);
            clean.put("tem_imagem", q.path("tem_imagem").asBoolean(false));
            clean.put("revisada", q.path("revisada").asBoolean(false));
            if (publishing) {
                if (!clean.path("revisada").asBoolean()) throw bad("Revise e confirme a questão " + n + ".");
                for (String field : List.of("enunciado", "materia", "conteudo"))
                    if (clean.path(field).asText().isBlank()) throw bad("Preencha " + field + " na questão " + n + ".");
                if (!List.of("Fácil", "Média", "Difícil").contains(clean.path("dificuldade").asText())) throw bad("Dificuldade inválida.");
                for (JsonNode opt : opts) if (opt.asText().isBlank()) throw bad("Preencha as alternativas da questão " + n + ".");
                if (!cancelled && clean.path("resposta_correta").isNull()) throw bad("Confira o gabarito da questão " + n + ".");
                if (page < 1 || page > job.paginas) throw bad("Confira a página original da questão " + n + ".");
            }
            output.add(clean);
        }
        if (publishing && numbers.size() != job.esperadas)
            throw bad("São esperadas " + job.esperadas + " questões. Há " + numbers.size() + " no rascunho.");
        List<JsonNode> sorted = new ArrayList<>();
        output.forEach(sorted::add);
        sorted.sort(Comparator.comparingInt(q -> q.path("numero_original").asInt()));
        return mapper.createArrayNode().addAll(sorted);
    }
    private ResponseStatusException bad(String msg) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg); }
}
