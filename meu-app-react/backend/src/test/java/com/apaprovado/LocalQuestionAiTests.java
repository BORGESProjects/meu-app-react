package com.apaprovado;

import com.apaprovado.service.LocalQuestionAi;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import org.junit.jupiter.api.Test;
import org.springframework.boot.web.client.RestTemplateBuilder;
import static org.junit.jupiter.api.Assertions.*;

class LocalQuestionAiTests {
    final ObjectMapper mapper=new ObjectMapper();
    final LocalQuestionAi ai=new LocalQuestionAi(new RestTemplateBuilder(),mapper,"http://127.0.0.1:1","test-model");

    @Test void validatesACompleteOrderedBatch() throws Exception {
        ArrayNode input=(ArrayNode)mapper.readTree("[{\"numero_original\":4},{\"numero_original\":5}]");
        var response=mapper.readTree("""
        {"questoes":[
          {"numero_original":4,"materia":"Matemática","conteudo":"Álgebra","dificuldade":"Média","confianca":0.9},
          {"numero_original":5,"materia":"História","conteudo":"Brasil Colônia","dificuldade":"Fácil","confianca":0.8}
        ]}
        """);
        assertEquals(2,ai.validate(response,input).size());
    }

    @Test void rejectsChangedQuestionNumbers() throws Exception {
        ArrayNode input=(ArrayNode)mapper.readTree("[{\"numero_original\":4}]");
        var response=mapper.readTree("[{\"numero_original\":8,\"materia\":\"X\",\"conteudo\":\"Y\",\"dificuldade\":\"Média\"}]");
        assertThrows(IllegalStateException.class,()->ai.validate(response,input));
    }
}
