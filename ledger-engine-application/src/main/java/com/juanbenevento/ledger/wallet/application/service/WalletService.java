package com.juanbenevento.ledger.wallet.application.service;

import com.juanbenevento.ledger.account.application.port.output.AccountRepository;
import com.juanbenevento.ledger.account.domain.model.Account;
import com.juanbenevento.ledger.common.domain.model.Currency;
import com.juanbenevento.ledger.wallet.application.dto.CreateWalletRequest;
import com.juanbenevento.ledger.wallet.application.dto.WalletResponse;
import com.juanbenevento.ledger.wallet.application.port.input.CreateWalletUseCase;
import com.juanbenevento.ledger.wallet.application.port.input.GetWalletUseCase;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class WalletService implements CreateWalletUseCase, GetWalletUseCase {

    private final AccountRepository accountRepository;

    @Override
    @Transactional
    public WalletResponse execute(CreateWalletRequest request) {
        String accountNumber = generateAccountNumber(request.userId(), request.walletType());

        if (accountRepository.existsByAccountNumber(accountNumber)) {
            throw new IllegalArgumentException("Wallet already exists for this user and type");
        }

        Account account = Account.create(UUID.randomUUID(), accountNumber, Currency.of(request.currency()));

        String correlationId = "WALLET-" + UUID.randomUUID();
        accountRepository.save(account, correlationId, "WALLET_SERVICE");

        return toResponse(account, request.name(), request.walletType());
    }

    public WalletResponse create(CreateWalletRequest request) {
        return execute(request);
    }

    @Override
    @Transactional(readOnly = true)
    public WalletResponse execute(UUID walletId) {
        Account account = accountRepository.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found: " + walletId));

        return toResponse(account, "Wallet", "PRIMARY");
    }

    public WalletResponse getById(UUID walletId) {
        return execute(walletId);
    }

    private String generateAccountNumber(UUID userId, String walletType) {
        return "WALLET-" + userId.toString().substring(0, 8).toUpperCase() + "-" + walletType;
    }

    private WalletResponse toResponse(Account account, String name, String walletType) {
        return new WalletResponse(
                account.getId(),
                name,
                account.getCurrency().toString(),
                walletType,
                account.getStatus().name(),
                account.getAvailableBalanceSnapshot()
        );
    }
}
