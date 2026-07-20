-- V1: Baseline schema generated from Hibernate entities
-- Accounts table
CREATE TABLE accounts (
    id uuid NOT NULL,
    account_number varchar(255) NOT NULL,
    currency varchar(3) NOT NULL,
    accounting_balance decimal(19,4) NOT NULL,
    available_balance decimal(19,4) NOT NULL,
    status varchar(255) NOT NULL,
    version bigint,
    correlation_id varchar(255) NOT NULL,
    created_by_system varchar(255) NOT NULL,
    created_at timestamp NOT NULL,
    last_modified_by varchar(255),
    updated_at timestamp,
    CONSTRAINT pk_accounts PRIMARY KEY (id),
    CONSTRAINT uk_accounts_account_number UNIQUE (account_number),
    CONSTRAINT uk_accounts_correlation_id UNIQUE (correlation_id)
);

-- Transactions table
CREATE TABLE transactions (
    id uuid NOT NULL,
    correlation_id varchar(255) NOT NULL,
    description varchar(255) NOT NULL,
    transaction_type varchar(255) NOT NULL,
    created_at timestamp NOT NULL,
    created_by varchar(255) NOT NULL,
    CONSTRAINT pk_transactions PRIMARY KEY (id),
    CONSTRAINT uk_transactions_correlation_id UNIQUE (correlation_id)
);

-- Journal entries table
CREATE TABLE journal_entries (
    id uuid NOT NULL,
    account_id uuid NOT NULL,
    amount decimal(19,4) NOT NULL,
    currency varchar(3) NOT NULL,
    type varchar(10) NOT NULL,
    transaction_id uuid NOT NULL,
    CONSTRAINT pk_journal_entries PRIMARY KEY (id),
    CONSTRAINT fk_journal_entries_account FOREIGN KEY (account_id) REFERENCES accounts (id),
    CONSTRAINT fk_journal_entries_transaction FOREIGN KEY (transaction_id) REFERENCES transactions (id)
);

-- Indexes for journal entries
CREATE INDEX idx_journal_entry_account ON journal_entries (account_id);
CREATE INDEX idx_journal_entry_tx ON journal_entries (transaction_id);