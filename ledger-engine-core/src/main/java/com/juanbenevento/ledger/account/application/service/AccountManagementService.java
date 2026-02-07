package com.juanbenevento.ledger.account.application.service;

import com.juanbenevento.ledger.account.application.port.in.UpdateAccountStatusUseCase;
import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.account.domain.model.Account;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AccountManagementService implements UpdateAccountStatusUseCase {
    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public void freeze(UUID accountId, String reason) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(accountId));

        account.freeze(reason);

        accountRepository.update(account, "ADMIN_ACTION");

        log.warn("SECURITY ALERT: Account {} frozen. Reason: {}", accountId, reason);
    }

    @Override
    @Transactional
    public void activate(UUID accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new AccountNotFoundException(accountId));

        account.activate();
        accountRepository.update(account, "ADMIN_ACTION");

        log.info("AUDIT: Account {} activated", accountId);
    }
}
