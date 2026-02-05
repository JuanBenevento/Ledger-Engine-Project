package com.juanbenevento.ledger.common.exception;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.juanbenevento.ledger.account.domain.exception.AccountAlreadyExistsException;
import com.juanbenevento.ledger.account.domain.exception.AccountNotActiveException;
import com.juanbenevento.ledger.account.domain.exception.AccountNotFoundException;
import com.juanbenevento.ledger.common.domain.exception.DomainException;
import com.juanbenevento.ledger.common.domain.exception.InsufficientFundsException;
import com.juanbenevento.ledger.transaction.domain.exception.TransactionAlreadyProcessedException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(DomainException.class)
    public ResponseEntity<ApiErrorResponse> handleDomainException(DomainException ex) {
        HttpStatus status = HttpStatus.UNPROCESSABLE_ENTITY;
        Map<String, Object> details = null;

        switch (ex) {
            case InsufficientFundsException ife -> {
                // status se mantiene en 422
                details = Map.of(
                        "accountId", ife.getAccountId(),
                        "currentBalance", ife.getCurrentBalance(),
                        "attemptedAmount", ife.getAttemptedAmount()
                );
            }
            case AccountAlreadyExistsException aaee -> {
                status = HttpStatus.CONFLICT; // 409
                details = Map.of("accountNumber", aaee.getAccountNumber());
            }
            case AccountNotFoundException anfe -> {
                status = HttpStatus.NOT_FOUND;
            }
            case AccountNotActiveException anae -> {
                details = Map.of(
                        "accountId", anae.getAccountId(),
                        "currentStatus", anae.getStatus()
                );
            }
            case TransactionAlreadyProcessedException tape -> {
                status = HttpStatus.CONFLICT;
                details = Map.of("correlationId", tape.getCorrelationId());
            }
            default -> {
                log.debug("Generic domain exception caught: {}", ex.getClass().getSimpleName());
            }
        }

        ApiErrorResponse error = new ApiErrorResponse(
                ex.getCode(),
                ex.getMessage(),
                details
        );

        log.warn("Domain error: {} - {}", ex.getCode(), ex.getMessage());
        return ResponseEntity.status(status).body(error);
    }

    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiErrorResponse> handleOptimisticLocking(ObjectOptimisticLockingFailureException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                "LE_CONCURRENCY_001",
                "Resource was updated by another transaction. Please refresh and retry."
        );

        log.warn("Optimistic locking failure: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiErrorResponse> handleDataIntegrity(DataIntegrityViolationException ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                "LE_DATA_INTEGRITY_001",
                "Data integrity violation. Check for duplicate IDs or invalid references."
        );
        log.error("Database integrity violation", ex);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiErrorResponse> handleUnexpected(Exception ex) {
        ApiErrorResponse error = new ApiErrorResponse(
                "LE_INTERNAL_ERROR",
                "An unexpected internal error occurred."
        );
        log.error("Unexpected error", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @JsonInclude(JsonInclude.Include.NON_NULL)
    public record ApiErrorResponse(
            String code,
            String message,
            LocalDateTime timestamp,
            Map<String, Object> details
    ) {
        public ApiErrorResponse(String code, String message) {
            this(code, message, LocalDateTime.now(), null);
        }

        public ApiErrorResponse(String code, String message, Map<String, Object> details) {
            this(code, message, LocalDateTime.now(), details);
        }
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidationErrors(MethodArgumentNotValidException ex) {
        Map<String, Object> validationErrors = new HashMap<>();

        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            validationErrors.put(fieldName, errorMessage);
        });

        ApiErrorResponse error = new ApiErrorResponse(
                "LE_VALIDATION_ERROR",
                "Input validation failed",
                validationErrors
        );

        log.warn("Validation error: {}", validationErrors);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
    }
}
