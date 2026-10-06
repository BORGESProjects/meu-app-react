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
            if (q.path("numero_fonte").canConvertToInt()) clean.put("numero_fonte", q.path("numero_fonte").asInt());
            for (String field : List.of("enunciado", "texto_apoio", "materia", "conteudo", "dificuldade", "observacao", "banca", "concurso", "fonte", "modelo")) {
                String value = cleanExtractionMarkers(q.path(field).asText(""));
                if (value.length() > (field.equals("texto_apoio") ? 30000 : field.equals("enunciado") ? 15000 : 600))
                    throw bad("Um campo da questão " + n + " é longo demais.");
                clean.put(field, value);
            }
            int sourceYear=q.path("ano").asInt(0);
            if(sourceYear>=1900 && sourceYear<=2100) clean.put("ano",sourceYear);
            if (clean.path("dificuldade").asText().isBlank()) clean.put("dificuldade", "Média");
            JsonNode options = q.path("opcoes");
            if (!options.isArray() || options.size() < 2 || options.size() > 5) throw bad("Questão " + n + ": informe de 2 a 5 alternativas.");
            ArrayNode opts = clean.putArray("opcoes");
            for (JsonNode opt : options) {
                if (!opt.isTextual() || opt.asText().length() > 5000) throw bad("Alternativa inválida na questão " + n + ".");
                opts.add(cleanExtractionMarkers(opt.asText()));
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
            if(q.path("confianca_classificacao").isNumber())
                clean.put("confianca_classificacao",Math.max(0,Math.min(1,q.path("confianca_classificacao").asDouble())));
            if (publishing) {
                if (!clean.path("revisada").asBoolean()) throw bad("Revise e confirme a questão " + n + ".");
                for (String field : List.of("enunciado", "materia", "conteudo"))
                    if (clean.path(field).asText().isBlank()) throw bad("Preencha " + field + " na questão " + n + ".");
                for (String field : List.of("enunciado", "texto_apoio"))
                    if (hasBrokenGlyphs(clean.path(field).asText())) throw bad("A questão " + n + " contém texto ou equação ilegível. Confira o PDF original.");
                if (!List.of("Fácil", "Média", "Difícil").contains(clean.path("dificuldade").asText())) throw bad("Dificuldade inválida.");
                Set<String> uniqueOptions = new HashSet<>();
                boolean onlyOptionLabels = true;
                for (JsonNode opt : opts) {
                    String option = opt.asText().trim();
                    if (option.isBlank()) throw bad("Preencha as alternativas da questão " + n + ".");
                    if (option.length() > 500) throw bad("A questão " + n + " contém uma alternativa longa demais. Verifique se outra questão foi anexada por engano.");
                    if (hasBrokenGlyphs(option)) throw bad("A questão " + n + " contém uma alternativa ilegível. Confira o PDF original.");
                    String normalized = option.replaceAll("\\s+", " ").toLowerCase(Locale.ROOT);
                    if (!uniqueOptions.add(normalized)) throw bad("A questão " + n + " contém alternativas repetidas.");
                    if (!option.matches("(?i)[A-E]")) onlyOptionLabels = false;
                    if (hasAttachedQuestion(option)) throw bad("A questão " + n + " contém texto de outra questão dentro de uma alternativa.");
                }
                if (onlyOptionLabels) throw bad("A questão " + n + " perdeu o texto das alternativas. Confira o PDF original.");
                if (needsMissingSupport(clean)) throw bad("A questão " + n + " faz referência a um texto ou figura que não foi extraído.");
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
    private String cleanExtractionMarkers(String value) {
        return value.replaceAll("(?m)(?:^|\\s)#{3,}(?=\\s|$)", " ").replaceAll("[ \\t]+\\n", "\n").trim();
    }
    private boolean hasBrokenGlyphs(String value) {
        return value.matches("(?s).*[\\uE000-\\uF8FF\\uFFFD\\u25A0\\u25A1\\u0900-\\u0DFF\\u1200-\\u137F].*")
            || value.matches("(?is).*\\(cid:\\d+\\).*")
            || value.matches("(?s).*(?:\\?\\s*){4,}.*")
            || value.chars().anyMatch(c -> c < 32 && c != '\n' && c != '\r' && c != '\t');
    }
    private boolean hasAttachedQuestion(String value) {
        return value.matches("(?isu).*texto para (?:as )?(?:próximas|questões).*")
            || value.matches("(?isu).*(?:\\n| {2,})\\*?\\d{1,3}\\s*(?:\\*\\d{1,3}\\s*)?-\\s+.{12,}.*")
            || value.matches("(?isu).*\\ba\\)\\s.+?\\sb\\)\\s.+?\\sc\\)\\s.+?\\sd\\)\\s.*")
            || value.matches("(?isu).*PUC\\s*-\\s*DEMAIS CURSOS.*");
    }
    private boolean needsMissingSupport(ObjectNode question) {
        String prompt = question.path("enunciado").asText("");
        boolean referencesSupport = prompt.matches("(?isu).*(?:according to|de acordo com|conforme|segundo) (?:the |o )?(?:text|texto|tirinha|charge|figura|gráfico).*");
        return referencesSupport && prompt.length() < 180
            && question.path("texto_apoio").asText("").isBlank()
            && !question.path("tem_imagem").asBoolean(false);
    }
    private ResponseStatusException bad(String msg) { return new ResponseStatusException(HttpStatus.BAD_REQUEST, msg); }
}
