package com.apaprovado.dto;

public class RedacaoRequest {
    private String tema;
    private String texto;
    private String banca;
    private Integer ano;
    private String criterios;

    // Getters e Setters
    public String getTema() { return tema; }
    public void setTema(String tema) { this.tema = tema; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public String getBanca() { return banca; }
    public void setBanca(String banca) { this.banca = banca; }
    public Integer getAno() { return ano; }
    public void setAno(Integer ano) { this.ano = ano; }
    public String getCriterios() { return criterios; }
    public void setCriterios(String criterios) { this.criterios = criterios; }
}
