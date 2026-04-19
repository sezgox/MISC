# Modelo de datos local

Persistencia local con **Drift** (SQLite tipado). Los datos sensibles (passwords, claves privadas, tokens OAuth) **no** se almacenan aquí; se guardan en `flutter_secure_storage` y la base de datos sólo conserva una referencia opaca (`credentialRef`).

## Tablas

```mermaid
erDiagram
  REMOTE_HOSTS ||--o{ PROJECTS : has
  REMOTE_HOSTS ||--o{ AGENT_INSTALLATIONS : has
  REMOTE_HOSTS ||--o{ SESSIONS : hosts
  PROJECTS ||--o{ SESSIONS : on
  SESSIONS ||--o{ MESSAGES : contains
  SESSIONS ||--o{ HANDOFF_EVENTS : logs

  REMOTE_HOSTS {
    string id PK
    string alias
    string host
    int port
    string username
    string authKind
    string credentialRef
    string knownHostFingerprint
    datetime createdAt
    datetime lastUsedAt
  }
  PROJECTS {
    string id PK
    string hostId FK
    string path
    string label
    string color
    bool favorite
    datetime createdAt
  }
  AGENT_INSTALLATIONS {
    string id PK
    string hostId FK
    string agentKind
    string status
    string version
    datetime installedAt
    datetime lastCheckAt
  }
  SESSIONS {
    string id PK
    string hostId FK
    string projectId FK
    string agentKind
    string title
    datetime createdAt
    datetime updatedAt
    bool archived
  }
  MESSAGES {
    string id PK
    string sessionId FK
    string role
    string kind
    string content
    string metadataJson
    datetime createdAt
  }
  HANDOFF_EVENTS {
    string id PK
    string sessionId FK
    string fromAgent
    string toAgent
    string prompt
    datetime createdAt
  }
```

## Decisiones

- `id` como **TEXT (UUID v4)** en todas las tablas para permitir generación offline y eventual sincronización futura.
- `messages.kind` es un string libre con valores conocidos (`text`, `code`, `diff`, `log`, `terminal`, `handoff`) para evitar migraciones cuando aparezcan tipos nuevos. Los renderers desconocidos hacen fallback a texto plano.
- `metadataJson` es un campo de escape por mensaje (lenguaje del code block, path del diff, level del log, …). Mantiene el esquema estable cuando cambian las heurísticas.
- `handoff_events.prompt` se guarda **completo** para auditoría: nos permite reconstruir el contexto que recibió cada modelo.

## Migraciones

El campo `schemaVersion` empieza en `1`. Toda subida añade una `await m.alterTable(...)` o crea nuevas tablas en `onUpgrade`. Política: nunca borrar columnas de golpe — añadir columna nueva, migrar datos, deprecar.

## Secretos: convención de `credentialRef`

`credentialRef` es un UUID v4. En `flutter_secure_storage` guardamos un JSON:

```json
{
  "kind": "password" | "privateKey",
  "value": "...",
  "passphrase": "..."   // sólo si privateKey la requiere
}
```

Borrar un host implica un `delete` en la DB **y** un `wipeAll` selectivo del `credentialRef` correspondiente.
