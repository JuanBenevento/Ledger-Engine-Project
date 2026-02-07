package com.juanbenevento.ledger.transaction.application.port.output;

import com.juanbenevento.ledger.transaction.domain.model.LedgerMovement;

import java.util.List;
import java.util.UUID;

public interface JournalEntryRepository {
    List<LedgerMovement> findHistoryByAccountId(UUID accountId);
}
