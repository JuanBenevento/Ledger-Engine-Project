package com.juanbenevento.ledger.billpay.domain.model;

import java.util.Objects;
import java.util.UUID;

/**
 * Biller entity representing a utility company or service provider.
 * Billers are pre-configured and can be queried by users for bill payment.
 */
public class Biller {

    private final UUID id;
    private final String name;
    private final String category;
    private final String accountNumber;
    private final boolean isActive;

    public Biller(UUID id, String name, String category, String accountNumber, boolean isActive) {
        this.id = Objects.requireNonNull(id, "Biller ID must not be null");
        this.name = Objects.requireNonNull(name, "Biller name must not be null");
        this.category = Objects.requireNonNull(category, "Biller category must not be null");
        this.accountNumber = Objects.requireNonNull(accountNumber, "Account number must not be null");
        this.isActive = isActive;
    }

    public static Biller create(UUID id, String name, String category, String accountNumber) {
        return new Biller(id, name, category, accountNumber, true);
    }

    public static Biller reconstitute(UUID id, String name, String category, String accountNumber, boolean isActive) {
        return new Biller(id, name, category, accountNumber, isActive);
    }

    public void ensureActive() {
        if (!isActive) {
            throw new IllegalStateException("Biller is not active: " + name);
        }
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public String getName() { return name; }
    public String getCategory() { return category; }
    public String getAccountNumber() { return accountNumber; }
    public boolean isActive() { return isActive; }
}
