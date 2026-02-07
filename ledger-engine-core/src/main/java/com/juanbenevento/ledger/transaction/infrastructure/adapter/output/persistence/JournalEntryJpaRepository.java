package com.juanbenevento.ledger.transaction.infrastructure.adapter.output.persistence;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface JournalEntryJpaRepository extends JpaRepository<JournalEntryEntity, UUID> {
    @Query("""
        SELECT j 
        FROM JournalEntryEntity j 
        JOIN FETCH j.transaction t 
        WHERE j.accountId = :accountId 
        ORDER BY t.createdAt ASC, t.id ASC
    """)
    List<JournalEntryEntity> findHistoryByAccountId(@Param("accountId") UUID accountId);
}
