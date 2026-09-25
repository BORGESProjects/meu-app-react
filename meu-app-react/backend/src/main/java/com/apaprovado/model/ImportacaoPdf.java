package com.apaprovado.model;

import jakarta.persistence.*;
import java.time.Instant;

/** Private schema is intentionally not exposed by Supabase PostgREST. */
@Entity
@Table(name = "importacoes_pdf", schema = "acervo_privado")
public class ImportacaoPdf {
    @Id public String id;
    @Version public long version;
    @Column(nullable=false, unique=true, length=64) public String fingerprint;
    @Column(nullable=false) public String ownerId;
    @Column(nullable=false) public String status;
    public String concurso;
    public String banca;
    public String modelo;
    public int ano;
    public int esperadas;
    public int paginas;
    public int progresso;
    public Instant criado = Instant.now();
    public Instant atualizado = Instant.now();
    @Column(length=500) public String erro;
    @Column(columnDefinition="text") public String questoes = "[]";
    @Column(nullable=false, length=6291456) public byte[] prova;
    @Column(nullable=false, length=6291456) public byte[] gabarito;
}
