package com.juanbenevento.ledger.application.service;

import com.juanbenevento.ledger.application.dto.CreateAccountRequest;
import com.juanbenevento.ledger.application.dto.CreateAccountResponse;
import com.juanbenevento.ledger.application.mapper.AccountMapper;
import com.juanbenevento.ledger.application.ports.in.CreateAccountUseCase;
import com.juanbenevento.ledger.domain.exception.AccountAlreadyExistsException;
import com.juanbenevento.ledger.domain.model.Account;
import com.juanbenevento.ledger.domain.repository.AccountRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CreateAccountService implements CreateAccountUseCase {
    private final AccountRepository accountRepository;
    private final AccountMapper mapper;

    @Override
    @Transactional
    public CreateAccountResponse execute(CreateAccountRequest request) {
        Optional<Account> existingAccount = accountRepository.findByCorrelationId(request.correlationId());

        if(existingAccount.isPresent()){
            return mapper.toResponse(existingAccount.get());
        }

        if(accountRepository.existsByAccountNumber(request.accountNumber())){
            throw new AccountAlreadyExistsException(request.accountNumber());
        }

        UUID id = UUID.randomUUID();
        Account account = mapper.toDomain(id, request);

        accountRepository.save(account, request.correlationId(), request.requestSource());

        return mapper.toResponse(account);
    }
}
