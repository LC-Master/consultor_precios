# QA de Resiliencia CDS/SSE (10 minutos)

Objetivo: validar que la app no se queda en blanco, no deja publicidad pegada cuando CDS cae, y se recupera sola al volver el servicio.

## Configuración recomendada

- NEXT_PUBLIC_CDS_RETRY_SECONDS=60
- NEXT_PUBLIC_FAILED_MEDIA_COOLDOWN_S=5
- NEXT_PUBLIC_TIME_ROTATE_IMAGE_S=8

## Criterios de aprobado

- Nunca aparece pantalla completamente en blanco.
- Si no hay contenido remoto, aparece pantalla de consulta.
- Si CDS vuelve, la app recupera playlist/placeholder sin recargar manualmente.
- No hay tormenta de requests por segundo hacia CDS.

## Caso 1: Arranque normal

1. Levanta la app y CDS.
2. Abre /check.
3. Verifica reproducción de campañas o placeholder remoto.

Esperado:
- Standby visible con contenido remoto.
- Sin errores críticos en consola.

## Caso 2: Caída total de CDS

1. Con la app reproduciendo, apaga CDS.
2. Espera 5-20 segundos.

Esperado:
- Se limpia contenido de playlist dinámico.
- No queda video congelado infinito.
- Aparece pantalla de consulta cuando no hay contenido remoto utilizable.

## Caso 3: Recuperación automática CDS

1. Con CDS apagado, vuelve a levantar CDS.
2. Espera hasta 1 ciclo de reconexión.

Esperado:
- Reintento automático cada NEXT_PUBLIC_CDS_RETRY_SECONDS (por defecto 60s).
- Si vuelve internet, también hay intento inmediato por evento online.
- Se restablece EventSource y vuelve contenido remoto sin refresh manual.

## Caso 4: Caída solo SSE (CDS arriba)

1. Simula que endpoint /events falla, pero /auth/login/device y /playlist responden.
2. Observa durante 2-3 minutos.

Esperado:
- App mantiene fallback de UI sin blanco.
- Reintenta bootstrap y reengancha SSE.
- Poll de playlist (5 min) queda como respaldo.

## Caso 5: Red del cliente offline/online

1. Con DevTools, simula offline.
2. Espera 10-20 segundos.
3. Vuelve a online.

Esperado:
- En offline no se queda pegado intentando reproducir medios remotos.
- Al volver online intenta recuperación automática y vuelve a contenido CDS.

## Telemetría manual sugerida durante QA

- Console: contar errores consecutivos de /api/auth/login/device y /api/playlist.
- Network: verificar que no hay flood; debe verse patrón de reintento controlado.
- Timestamp: medir tiempo de recuperación desde que CDS vuelve hasta primer render remoto.

## Resultado final

Marcar PASS solo si los 5 casos cumplen sin refresh manual de navegador.
