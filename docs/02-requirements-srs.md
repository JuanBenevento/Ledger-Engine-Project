# 02. Especificación de Requisitos de Software (SRS)

Este documento define de manera formal los **requisitos funcionales y no funcionales** que rigen el comportamiento, la calidad técnica y las restricciones del **Ledger Engine Core**. Su objetivo es servir como contrato entre el dominio de negocio, la arquitectura y la implementación técnica.

---

## 1. Requisitos Funcionales (RF)

Los requisitos funcionales describen **qué debe hacer el sistema** desde una perspectiva de negocio y dominio contable.

| ID        | Nombre                           | Descripción                                                                                                                                                                                             |
| :-------- | :------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **RF-01** | **Gestión de Cuentas**           | El sistema debe permitir la creación de cuentas financieras con un identificador único (UUID), un código de moneda conforme a ISO 4217 y un estado operativo inicial (`ACTIVE`, `INACTIVE`, `BLOCKED`). |
| **RF-02** | **Registro por Partida Doble**   | Cada operación financiera debe registrarse mediante al menos dos asientos contables (*Journal Entries*), garantizando que la suma algebraica de los importes sea exactamente cero.                      |
| **RF-03** | **Validación de Disponibilidad** | Antes de confirmar cualquier débito, el sistema debe verificar que la cuenta de origen disponga de **Saldo Disponible** suficiente, evitando sobregiros no autorizados.                                 |
| **RF-04** | **Inmutabilidad Histórica**      | Una vez persistida, ninguna transacción puede ser modificada ni eliminada. Las correcciones deben realizarse exclusivamente mediante nuevas transacciones de reversión o anulación.                     |
| **RF-05** | **Consulta de Balance Dual**     | El sistema debe exponer tanto el **Saldo Contable** (resultado histórico del ledger) como el **Saldo Disponible** (monto operable), garantizando coherencia entre ambos valores.                        |
| **RF-06** | **Trazabilidad de Auditoría**    | Cada operación debe registrar metadatos de auditoría obligatorios: timestamp preciso, IP de origen, usuario o sistema solicitante y un `correlationId` único para seguimiento end-to-end.               |

---

## 2. Requisitos No Funcionales (RNF)

Los requisitos no funcionales definen **cómo debe comportarse el sistema** en términos de calidad, robustez y estándares técnicos, especialmente en contextos de misión crítica.

| ID         | Nombre                              | Descripción                                                                                                                                                                                          |
| :--------- | :---------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **RNF-01** | **Integridad Transaccional (ACID)** | El motor debe garantizar atomicidad, consistencia, aislamiento y durabilidad. Ante cualquier fallo durante el procesamiento de una transacción, se debe ejecutar un *rollback* completo.             |
| **RNF-02** | **Precisión Numérica**              | Se prohíbe el uso de tipos de coma flotante. Todos los cálculos monetarios deben realizarse con `BigDecimal`, utilizando una escala mínima de 4 decimales para evitar errores de redondeo acumulado. |
| **RNF-03** | **Consistencia Concurrente**        | El sistema debe implementar *Optimistic Locking* mediante un atributo de versión en la entidad Account, mitigando el riesgo de actualizaciones perdidas en escenarios concurrentes.                  |
| **RNF-04** | **Arquitectura Hexagonal**          | El núcleo de negocio (Domain) debe permanecer completamente desacoplado de frameworks, librerías externas y mecanismos de persistencia, favoreciendo el testeo unitario y la evolución del sistema.  |
| **RNF-05** | **Calidad y Testabilidad**          | La capa de Dominio debe mantener una cobertura mínima del 80% en pruebas unitarias, asegurando que las reglas de negocio críticas estén verificadas de forma automática.                             |

---

## 3. Restricciones Técnicas y Decisiones Iniciales (ADR)

Esta sección documenta decisiones arquitectónicas tempranas que condicionan la implementación y evolución del sistema.

### 3.1. Stack Tecnológico

* **Lenguaje:** Java 21, aprovechando *Records* para inmutabilidad, *Pattern Matching* y mejoras de rendimiento en el runtime.
* **Persistencia:** PostgreSQL, seleccionado por su soporte robusto de transacciones ACID, locking a nivel de fila y tipos `NUMERIC` de alta precisión.

### 3.2. Idempotencia Operacional

Para prevenir ejecuciones duplicadas en entornos distribuidos o ante reintentos de red, el sistema debe garantizar idempotencia mediante un `correlationId` único por transacción. Cualquier solicitud que reutilice un identificador existente debe ser rechazada o responder con el resultado previamente registrado, sin volver a afectar el ledger.
