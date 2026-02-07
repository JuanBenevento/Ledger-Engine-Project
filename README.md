# Ledger Engine Core 🏦

> **Motor transaccional bancario de alta integridad diseñado bajo principios de Arquitectura Hexagonal, DDD y Contabilidad de Partida Doble.**

![Java 21](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk)
![Spring Boot 4](https://img.shields.io/badge/Spring_Boot-4.0.2-green?style=flat-square&logo=springboot)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=flat-square&logo=postgresql)
![Architecture](https://img.shields.io/badge/Architecture-Hexagonal-blueviolet?style=flat-square)
![Tests](https://img.shields.io/badge/Tests-Testcontainers-2596be?style=flat-square&logo=testcontainers)

---

## 🎯 Visión y Objetivo
Este proyecto no es un simple CRUD. Es una implementación de referencia de un **Core Bancario (Ledger)** diseñado para entornos de misión crítica donde la pérdida de datos o la inconsistencia numérica no son opciones aceptables.

El sistema garantiza:
1.  **Integridad Financiera:** Implementación estricta del principio de **Partida Doble** ($\sum \text{Débitos} = \sum \text{Créditos}$). El dinero nunca se crea ni se destruye, solo se transfiere.
2.  **Inmutabilidad:** Los movimientos financieros (`JournalEntry`) son "Append-Only". La historia no se reescribe; se compensa.
3.  **Agnosticismo Tecnológico:** Gracias a la **Arquitectura Hexagonal**, el dominio financiero está completamente desacoplado de la base de datos y del framework web.

---

## 🏗️ Arquitectura y Decisiones de Diseño (ADRs)

El diseño sigue estrictamente los principios de **Clean Architecture** y **Domain-Driven Design (DDD)**.

### 1. Arquitectura Hexagonal (Ports & Adapters)
El sistema está dividido en capas concéntricas para proteger las reglas de negocio:
*   **Domain Layer (Núcleo):** Entidades puras (`Account`, `Transaction`) que contienen la lógica de negocio y validaciones de invariantes (ej: `ensureActive()`). No tiene dependencias de Spring ni Hibernate.
*   **Application Layer:** Casos de uso (`TransferUseCase`, `DepositUseCase`) que orquestan los flujos de negocio y definen los puertos (interfaces) de entrada y salida.
*   **Infrastructure Layer:** Adaptadores que implementan los puertos.
  *   *Input:* REST Controllers (API Web).
  *   *Output:* Persistence Adapters (JPA/Hibernate) para PostgreSQL.

### 2. Gestión de Concurrencia y Seguridad
*   **Optimistic Locking:** Uso de versionado (`@Version`) para prevenir condiciones de carrera (Race Conditions) y "Lost Updates" en cuentas con alta concurrencia.
*   **Idempotencia:** Control estricto mediante `correlationId` para garantizar que los reintentos de red o duplicados no generen transacciones dobles.
*   **Domain Guards:** La entidad `Account` es responsable de su propia protección. Un intento de débito en una cuenta congelada es rechazado por el modelo mismo, no por el controlador.

### 3. Precisión Numérica
Uso exclusivo de `BigDecimal` con escala fija (4 decimales) y modos de redondeo `HALF_EVEN` (Banker's Rounding) para evitar errores de punto flotante típicos de los tipos `double` o `float`.

C4Component

    title Diagrama de Componentes (Nivel 3) - Ledger Engine Core

    ContainerDb(db, "PostgreSQL Database", "Relational Database Schema", "Almacena Tablas: accounts, transactions, journal_entries")

    Container_Boundary(api, "Ledger Engine Application") {
        
        Component(ctrl, "Web Adapter", "REST Controller", "Recibe HTTP, valida JSON y llama a Input Ports")
        
        Component_Boundary(app_layer, "Application Layer") {
            Component(in_port, "Input Port", "Interface (Use Case)", "Ej: DepositUseCase, TransferUseCase")
            Component(service, "Service Implementation", "Spring Service", "Implementa lógica de flujo, orquesta transacciones")
            Component(out_port, "Output Port", "Interface (Repository)", "Ej: AccountRepository, JournalEntryRepository")
        }

        Component_Boundary(domain_layer, "Domain Layer") {
            Component(model, "Domain Model", "Aggregate / Entity", "Ej: Account, Transaction. Contiene lógica de negocio pura")
        }

        Component_Boundary(infra_layer, "Infrastructure Layer") {
            Component(adapter, "Persistence Adapter", "JPA Repository / Mapper", "Implementa Output Ports y traduce a Entidades JPA")
        }
    }

    Rel(ctrl, in_port, "Usa", "Llama a")
    Rel(service, in_port, "Implementa")
    Rel(service, model, "Orquesta", "Usa métodos de negocio")
    Rel(service, out_port, "Usa", "Llama a interfaz")
    Rel(adapter, out_port, "Implementa")
    Rel(adapter, db, "Lee/Escribe", "JDBC/SQL")
    
---

## 🛠️ Stack Tecnológico

Selección de herramientas basada en robustez y soporte a largo plazo (LTS).

| Componente | Tecnología | Justificación |
| :--- | :--- | :--- |
| **Lenguaje** | **Java 21 (LTS)** | Uso de `Records` para DTOs inmutables y `Pattern Matching` para un código expresivo y moderno. |
| **Framework** | **Spring Boot 4.0.2** | Adopción temprana de la generación "Lean & Safe". Soporte nativo para Jakarta EE 11 y optimizaciones AOT (Ahead-of-Time). |
| **Base de Datos** | **PostgreSQL** | Motor relacional robusto, conforme a ACID, ideal para integridad referencial financiera [Source 146]. |
| **Testing** | **Testcontainers** | Pruebas de integración **herméticas** que levantan una base de datos real en Docker. Cero mocks en la capa de persistencia. |
| **API Docs** | **OpenAPI / Swagger** | Documentación viva y ejecutable de la API REST. |

---

## 🧪 Estrategia de Testing (Quality Gates)

La calidad se garantiza mediante una pirámide de pruebas invertida hacia la integración robusta:

1.  **Unit Tests:** Pruebas aisladas de la lógica de dominio (ej: reglas de saldo negativo, cambios de estado).
2.  **Integration Tests (E2E):** Pruebas de flujo completo usando **Testcontainers**.
  *   *Caso de estudio:* `AccountLifecycleIT` valida el ciclo completo: `Creación -> Depósito -> Bloqueo (Freeze) -> Intento de Transferencia (Fallo esperado) -> Desbloqueo -> Transferencia Exitosa`.
  *   *Valor:* Garantiza que el sistema funciona con una base de datos real, validando constraints de SQL y transaccionalidad ACID.

---

## 🚀 Cómo Ejecutar

### Prerrequisitos
*   Docker Desktop (requerido para la base de datos y los tests).
*   Java 21 SDK.
*   Maven.

### Pasos
1.  **Clonar el repositorio:**
    ```bash
    git clone https://github.com/JuanBenevento/ledger-engine-core.git
    cd ledger-engine-core
    ```

2.  **Compilar y Ejecutar Tests:**
    El comando `install` ejecutará automáticamente los tests con Testcontainers.
    ```bash
    ./mvnw clean install
    ```

3.  **Levantar la aplicación:**
    Puedes usar el `docker-compose.yml` incluido para la base de datos.
    ```bash
    docker-compose up -d
    ./mvnw spring-boot:run
    ```

4.  **Explorar la API:**
    Accede a la interfaz de Swagger UI para probar los endpoints:
    👉 `http://localhost:8080/swagger-ui.html`

---

## 🗺️ Roadmap & Estado del Proyecto

El proyecto se encuentra en estado **Release Candidate (RC)**. El núcleo transaccional es estable y funcional.

**Mejoras Futuras Planificadas:**
*   [ ] **Seguridad Perimetral:** Integración con OAuth2/OIDC (Keycloak) para autenticación de servicios.
*   [ ] **Event-Driven Architecture:** Publicación de eventos de dominio (`TransactionCreated`, `AccountFrozen`) en un bus (RabbitMQ/Kafka) para desacoplar notificaciones y analítica.
*   [ ] **CQRS:** Separación de modelos de lectura y escritura para optimizar consultas de historial masivas.
*   [ ] **Observabilidad:** Métricas con Micrometer y Prometheus para monitoreo de KPIs financieros en tiempo real.

---

## 📚 Referencias y Fundamentación Teórica

Este proyecto es una implementación práctica de conceptos académicos y patrones de la industria. Las decisiones de arquitectura se basan en la siguiente bibliografía:

1.  **Arquitectura Limpia & Hexagonal**
  *   *Martin, Robert C. (2017). Clean Architecture: A Craftsman's Guide to Software Structure and Design.*
  *   *Fundamento:* Separación de `Domain`, `Application` e `Infrastructure` para respetar la Regla de Dependencia [^1].

2.  **Modelado de Dominio (DDD)**
  *   *Evans, Eric (2003). Domain-Driven Design: Tackling Complexity in the Heart of Software.*
  *   *Fundamento:* Uso de Entidades ricas, Agregados para consistencia transaccional y Lenguaje Ubicuo [^2].

3.  **Sistemas Distribuidos y Datos**
  *   *Kleppmann, Martin (2017). Designing Data-Intensive Applications.*
  *   *Fundamento:* Diseño del Ledger como un sistema "Append-Only" inmutable para garantizar trazabilidad y auditoría [^3].

4.  **Patrones Empresariales**
  *   *Fowler, Martin (2002). Patterns of Enterprise Application Architecture.*
  *   *Fundamento:* Manejo de concurrencia (Optimistic Locking) y patrones de Mapeo Objeto-Relacional [^4].

[^1]: "El código fuente de las dependencias solo debe apuntar hacia adentro, hacia las políticas de alto nivel." — *Clean Architecture*.
[^2]: "Un objeto debe garantizar sus propios invariantes de negocio." — *Domain-Driven Design*.
[^3]: "La inmutabilidad de los datos financieros es crítica para la recuperación ante fallos y la auditoría." — *Designing Data-Intensive Applications*.

[^4]: "Optimistic Offline Lock previene conflictos de concurrencia sin bloquear recursos de base de datos." — *PoEAA*.

## 👨‍💻 Autor
**Juan Manuel Benevento** Backend Developer (Java).

[![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/juan-manuel-benevento-1870b5216/)


