package com.juanbenevento.ledger.p2p.domain.port;

import com.juanbenevento.ledger.p2p.domain.model.LookupType;
import com.juanbenevento.ledger.p2p.domain.model.RecipientInfo;

import java.util.Optional;

/**
 * Output port for recipient lookup.
 * Resolves email/phone/QR to wallet and user IDs.
 */
public interface RecipientLookupPort {
    Optional<RecipientInfo> lookup(String identifier, LookupType lookupType);
}
