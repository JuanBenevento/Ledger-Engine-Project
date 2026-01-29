# 07 – Registro de Decisiones de Arquitectura (ADR)

Este documento registra las decisiones técnicas críticas tomadas durante el diseño del **Ledger Engine Core**, detallando su contexto, justificación y consecuencias.

---

## ADR-001: Persistencia de Snapshots de Balance

### Contexto
Calcular el saldo de una cuenta sumando millones de registros de `journal_entries` en tiempo real es inviable para operaciones de alta frecuencia.

### Decisión
Se decide mantener columnas de balance en la tabla `accounts`. Estos valores no son la fuente de verdad primaria, sino **snapshots de proyección** del ledger histórico.

### Justificación
Permite realizar validaciones de saldo disponible (RF-03) de forma inmediata, mejorando significativamente el tiempo de respuesta del sistema. La consistencia se garantiza mediante la actualización de estos campos dentro de la misma transacción atómica que registra el ledger.

---

## ADR-002: Control de Concurrencia (Optimistic Locking)

### Contexto
En un entorno concurrente, dos procesos podrían intentar debitar de la misma cuenta simultáneamente, causando el problema de la "actualización perdida".

### Decisión
Implementar un sistema de versión (`version` de tipo `BIGINT`) en la entidad `Account`.

### Justificación
El **Optimistic Locking** permite que la base de datos rechace automáticamente cualquier actualización basada en un estado de cuenta obsoleto, obligando al sistema a reintentar la operación con los datos más recientes.

---

## ADR-003: Inmutabilidad del Ledger (Append-Only)

### Contexto
La trazabilidad financiera exige que ningún registro de dinero sea modificado una vez emitido.

### Decisión
Las tablas `transactions` y `journal_entries` son de tipo **Append-Only**. No se implementarán funciones de `UPDATE` o `DELETE` sobre estos registros.

### Justificación
Garantiza que el historial contable sea una fuente de verdad absoluta para auditores. Cualquier corrección debe realizarse mediante un nuevo asiento de reversión o anulación, manteniendo el rastro del error y la corrección originales.

---

## ADR-004: Uso de BigDecimal para Precisión Financiera

### Contexto
Los tipos de coma flotante (`float`, `double`) presentan errores de redondeo acumulativos que son inaceptables en sistemas contables.

### Decisión
Uso obligatorio de `BigDecimal` con escala mínima de 4 decimales (`NUMERIC(19,4)` en DB).

### Justificación
Cumple con el **RNF-02**, asegurando que el motor sea preciso hasta la diezmilésima de unidad monetaria, eliminando discrepancias en balances de gran volumen.