# Comité Finanzas

Dashboard web construido con React, TypeScript y Vite.

## Requisitos
- Node.js 20+ (recomendado)
- npm

## Desarrollo local
```bash
npm install
npm run dev
```

## Build y preview
```bash
npm run build
npm run start
```

## Despliegue en Railway
1. Conecta el repositorio en Railway.
2. Configura el `Root Directory` como `frontend`.
3. Build command: `npm run build`.
4. Start command: `npm run start`.

Railway provee `PORT` automáticamente y la app escucha en `0.0.0.0:$PORT` mediante `vite preview`.
