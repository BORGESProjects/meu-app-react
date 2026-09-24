package com.apaprovado.model;

import jakarta.persistence.*;

@Entity
@Table(name = "edital_itens")
public class EditalItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String concurso;      
    private String materia;       // Alinhado com o input do Front-end
    private String conteudo;      // Alinhado com o input do Front-end
    private String incidencia;    
    private boolean concluido;    

    public EditalItem() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getConcurso() { return concurso; }
    public void setConcurso(String concurso) { this.concurso = concurso; }
    
    public String getMateria() { return materia; }
    public void setMateria(String materia) { this.materia = materia; }
    
    public String getConteudo() { return conteudo; }
    public void setConteudo(String conteudo) { this.conteudo = conteudo; }
    
    public String getIncidencia() { return incidencia; }
    public void setIncidencia(String incidencia) { this.incidencia = incidencia; }
    
    public boolean isConcluido() { return concluido; }
    public void setConcluido(boolean concluido) { this.concluido = concluido; }
}