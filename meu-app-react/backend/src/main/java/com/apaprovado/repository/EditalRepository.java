package com.apaprovado.repository;

import com.apaprovado.model.EditalItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EditalRepository extends JpaRepository<EditalItem, Long> {
    List<EditalItem> findByConcurso(String concurso);
}