package com.juanbenevento.ledger.user.domain.model;

import java.util.Objects;
import java.util.UUID;

/**
 * User aggregate root.
 * Manages user lifecycle, KYC status transitions, and PII encryption via value objects.
 */
public class User {

    private final UUID id;
    private final EmailAddress emailAddress;
    private final PhoneNumber phoneNumber;
    private final String firstName;
    private final String lastName;
    private UserStatus status;
    private Long version;

    private User(UUID id, EmailAddress emailAddress, PhoneNumber phoneNumber, String firstName, String lastName) {
        this.id = Objects.requireNonNull(id, "User ID must not be null");
        this.emailAddress = Objects.requireNonNull(emailAddress, "Email address must not be null");
        this.phoneNumber = Objects.requireNonNull(phoneNumber, "Phone number must not be null");
        this.firstName = validateName(firstName, "First name");
        this.lastName = validateName(lastName, "Last name");
        this.status = UserStatus.PENDING_KYC;
        this.version = 0L;
    }

    public static User create(UUID id, EmailAddress emailAddress, PhoneNumber phoneNumber, String firstName, String lastName) {
        return new User(id, emailAddress, phoneNumber, firstName, lastName);
    }

    public static User reconstitute(UUID id, EmailAddress emailAddress, PhoneNumber phoneNumber,
                                     String firstName, String lastName, UserStatus status, Long version) {
        User user = new User(id, emailAddress, phoneNumber, firstName, lastName);
        user.status = status;
        user.version = version;
        return user;
    }

    // --- Status transitions ---

    public void submitKyc() {
        if (this.status != UserStatus.PENDING_KYC) {
            throw new IllegalStateException(
                    "Cannot submit KYC from status: " + this.status + ". Expected PENDING_KYC.");
        }
        this.status = UserStatus.KYC_SUBMITTED;
    }

    public void approveKyc() {
        if (this.status != UserStatus.KYC_SUBMITTED) {
            throw new IllegalStateException(
                    "Cannot approve KYC from status: " + this.status + ". Expected KYC_SUBMITTED.");
        }
        this.status = UserStatus.KYC_APPROVED;
    }

    public void activate() {
        if (this.status != UserStatus.KYC_APPROVED) {
            throw new IllegalStateException(
                    "Cannot activate from status: " + this.status + ". Expected KYC_APPROVED.");
        }
        this.status = UserStatus.ACTIVE;
    }

    public void suspend(String reason) {
        if (this.status != UserStatus.ACTIVE) {
            throw new IllegalStateException(
                    "Cannot suspend from status: " + this.status + ". Expected ACTIVE.");
        }
        this.status = UserStatus.SUSPENDED;
    }

    // --- Getters ---

    public UUID getId() { return id; }
    public EmailAddress getEmailAddress() { return emailAddress; }
    public PhoneNumber getPhoneNumber() { return phoneNumber; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public UserStatus getStatus() { return status; }
    public Long getVersion() { return version; }

    private String validateName(String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(fieldName + " must not be null or blank");
        }
        return value.trim();
    }
}
