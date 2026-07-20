package com.juanbenevento.ledger.p2p.infrastructure.adapter.output.persistence;

import com.juanbenevento.ledger.p2p.domain.model.LookupType;
import com.juanbenevento.ledger.p2p.domain.model.RecipientInfo;
import com.juanbenevento.ledger.p2p.domain.port.RecipientLookupPort;
import org.springframework.stereotype.Component;

import java.util.Optional;

/**
 * TODO: Replace with real implementation when P2P recipient lookup is implemented.
 */
@Component
public class RecipientLookupStub implements RecipientLookupPort {
    @Override
    public Optional<RecipientInfo> lookup(String identifier, LookupType lookupType) {
        return Optional.empty();
    }
}
