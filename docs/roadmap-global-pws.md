# Roadmap global PWs

Roadmap transversal para iniciativas que impactan a todas las apps hosteadas dentro de este repo.

## Alcance

- Aplica a cualquier app registrada en `docs/apps-active-registry.md`.
- Se centra en estandarizar operación, despliegue y observabilidad a nivel global.

## Prioridades

- **P0 (alta urgencia)**: automatización de despliegue y reducción de riesgo operativo.
- **P1 (media)**: consistencia entre apps y documentación de runbooks.
- **P2 (mejora continua)**: optimizaciones de DX/ops.

## P0

### 1) Runner de GitHub para autodeploy global
- **Objetivo**: disponer de un pipeline unificado que permita autodeploy para todas las apps hosteadas del repo, evitando configuración aislada por app.
- **Tareas**:
  - Definir estrategia global de workflows (por app, por entorno y por tipo de cambio).
  - Implementar pipelines con triggers claros (`push`, `workflow_dispatch`, tags/release cuando aplique).
  - Estandarizar secrets/variables (`SSH`, tokens, rutas de deploy, flags por app) para no duplicar lógica.
  - Añadir validaciones mínimas previas por app (checks rápidos/tests dirigidos) antes de ejecutar deploy.
  - Incluir rollback básico y comandos de verificación post-deploy en cada flujo.
- **Criterio de aceptación**:
  - Todas las apps activas del registry pueden desplegarse mediante GitHub Actions.
  - El resultado del deploy queda trazable en Actions y en logs del host.
  - Existe documentación operativa única para ejecutar, reintentar y revertir despliegues.

## P1

### 2) Plantilla común de CI/CD por app
- Crear una plantilla reutilizable (inputs por app) para no mantener workflows divergentes.
- Definir convención de nombres de jobs, artefactos y logs.

### 3) Checklist de onboarding operativo
- Exigir checklist mínimo para nuevas apps: puerto, dominio, scripts, logs y deploy entrypoint.
- Reflejar el onboarding en `docs/apps-active-registry.md` y `docs/hosting-playbook.md`.

## P2

### 4) Métricas operativas básicas
- Definir métricas mínimas por app (estado deploy, tiempo deploy, fallos/reintentos).
- Publicar una guía de lectura rápida para incidencias comunes.
