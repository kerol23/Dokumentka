package cz.dokumentka.repository;

import cz.dokumentka.entity.Document;
import cz.dokumentka.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import cz.dokumentka.entity.Category;

import java.util.List;

@Repository
public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByOwner(User owner);
    long countByOwner(User owner);
    List<Document> findByOwnerAndCategory(User owner, Category category);

    @Query("SELECT d FROM Document d WHERE d.owner = :owner AND (" +
            "LOWER(d.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(d.description) LIKE LOWER(CONCAT('%', :query, '%')))")
    List<Document> searchByOwnerAndNameOrDescription(
            @Param("owner") User owner,
            @Param("query") String query);

    Page<Document> findByOwner(User owner, Pageable pageable);
}