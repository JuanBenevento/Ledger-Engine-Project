# 04 – Arquitectura del Sistema

## 4.1 Visión General

El **Ledger Engine Core** adopta una **Arquitectura Hexagonal (Ports & Adapters)** para aislar el **Dominio Contable** de cualquier detalle tecnológico externo (frameworks, bases de datos, protocolos de comunicación).

El objetivo principal es garantizar que las **reglas de integridad financiera**:

* sean explícitas,
* estén centralizadas en el dominio,
* y no dependan de Spring, JPA ni de decisiones de infraestructura.

Esta arquitectura permite que el sistema escale en complejidad y en volumen sin comprometer su corrección contable.

---

## 4.2 Arquitectura Hexagonal (Ports & Adapters)

### Principio Rector

> El dominio no conoce el mundo exterior. El mundo exterior se adapta al dominio.

Esto se traduce en:

* **Dominio puro**: entidades, agregados y reglas sin anotaciones de framework.
* **Puertos**: interfaces que definen qué necesita el dominio (repositorios, servicios externos).
* **Adaptadores**: implementaciones concretas (Spring Data, REST Controllers, mensajería).

### Capas Lógicas

* **Domain Layer**

    * Account (Aggregate Root)
    * Transaction (Aggregate)
    * JournalEntry (Entity)
    * Currency (Value Object)
    * Reglas de negocio e invariantes

* **Application Layer**

    * Casos de uso (TransferService, AccountProvisioningService)
    * Orquestación transaccional
    * Control de idempotencia

* **Infrastructure Layer**

    * Persistencia (PostgreSQL, JPA)
    * API REST / Mensajería
    * Logging y auditoría

Esta separación permite:

* Testear el dominio sin infraestructura
* Cambiar adaptadores sin reescribir reglas críticas
* Evolucionar el sistema de forma controlada