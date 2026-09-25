package com.apaprovado.repository;
import com.apaprovado.model.ImportacaoPdf;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface ImportacaoRepository extends JpaRepository<ImportacaoPdf, String> {
    Optional<ImportacaoPdf> findByFingerprint(String fingerprint);
    List<ImportacaoPdf> findByOwnerIdOrderByCriadoDesc(String ownerId);
    List<ImportacaoPdf> findByStatusOrderByCriadoDesc(String status);
    interface View {
        String getId(); String getStatus(); String getConcurso(); String getBanca(); String getModelo();
        int getAno(); int getEsperadas(); int getPaginas(); int getProgresso(); long getVersion();
        String getErro(); String getQuestoes(); java.time.Instant getCriado();
    }
    List<View> findAllProjectedByOwnerIdOrderByCriadoDesc(String ownerId);
    List<View> findAllProjectedByStatusOrderByCriadoDesc(String status);
}
