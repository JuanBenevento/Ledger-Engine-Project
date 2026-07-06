package com.juanbenevento.ledger.common.domain.model;

import com.juanbenevento.ledger.common.domain.exception.InvalidCurrencyException;

import java.util.Objects;

public record Currency(Code code) {
    public Currency {
        Objects.requireNonNull(code, "Currency code cannot be null.");
    }

    public static Currency of(String isoCode){
        if(isoCode == null || isoCode.isBlank()){
            throw new InvalidCurrencyException(isoCode);
        }

        try {
            return new Currency(Code.valueOf(isoCode.trim().toUpperCase()));
        }catch (IllegalArgumentException ex){
            throw new InvalidCurrencyException(isoCode);
        }
    }

    @Override
    public String toString() {
        return code.name();
    }

    public static Currency of(Code code){
        return new Currency(code);
    }

    public enum Code{
        ARS,
        USD,
        EUR,
        CLP,
        JPY,
        COP,
        MXN,
        BRL,
        PEN
    }
}
