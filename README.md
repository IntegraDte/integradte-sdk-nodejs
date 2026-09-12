# @integradte/sdk

SDK en Node.js + TypeScript para consumir la API de [IntegraDTE](https://api.integradte.cl), siguiendo arquitectura hexagonal.

## Instalacion

```bash
npm install @integradte/sdk
```

## Estructura

- `src/domain`: modelos y estructuras DTE
- `src/ports`: contrato del API client
- `src/application`: capa de servicio
- `src/adapters/httpintegra`: adapter HTTP concreto

## Uso recomendado

```ts
import { randomUUID } from 'node:crypto';
import { Client, Service, encodeDataDTE } from '@integradte/sdk';

const adapter = new Client({
  apiKey: 'TU_X_API_KEY'
});

const service = new Service(adapter);

const dataDTE = encodeDataDTE({
  Encabezado: {
    IdDoc: {
      TipoDTE: 33,
      FchEmis: '2026-02-03'
    }
  }
});

// idempotencyKey es opcional: sin él, el SDK genera un UUID en cada llamada.
// Pasa el tuyo (un UUID) si necesitas reintentar la misma operación sin duplicarla.
const response = await service.createDocument({
  code_sii: '33',
  data_dte: dataDTE,
  idempotencyKey: randomUUID()
});

console.log(response);
```

## Primer uso: login y primera empresa (bootstrap)

Cuando un usuario todavía no tiene un `x-api-key` (recién creado, sin empresas),
usa `OnboardingClient` para el arranque. No requiere `apiKey`: se usa justo antes
de tener uno.

```ts
import { OnboardingClient, Client, Service } from '@integradte/sdk';

const onboarding = new OnboardingClient();

// 1) Login con email + password -> devuelve el x-user-key.
const login = await onboarding.login({
  email: 'user@empresa.cl',
  password: 'PasswordSeguro123'
});
const xUserKey = login.data.xUserKey;

// 2) Crear la PRIMERA empresa con el x-user-key -> devuelve el x-api-key.
//    Solo funciona si el usuario no tiene empresas (si no, la API responde 409).
const created = await onboarding.createFirstBusiness(
  {
    businessName: 'Empresa Ejemplo SpA',
    rut: '12345678-9',
    activity: 'Desarrollo de software',
    address: 'Av. Principal 123',
    commune: 'Providencia',
    city: 'Santiago',
    emailDte: 'dte@empresa.cl',
    emailContact: 'contacto@empresa.cl',
    rutLegalAgent: '17240862-1',
    fullNameLegalAgent: 'Alejandro Jesus Cea Perez',
    resolutionNumberDte: '0',
    resolutionDateDte: '1992-12-31',
    resolutionNumberTicket: '0',
    resolutionTicketDate: '2014-05-27'
  },
  xUserKey
);
const xApiKey = created.data.apiToken.xApiKey;

// 3) De aquí en adelante se opera con el x-api-key normal.
const service = new Service(new Client({ apiKey: xApiKey }));
```

## Construir `data_dte` con tipos

Incluye tipos completos para:

- `Dte33Data`
- `Dte34Data`
- `Dte39Data`
- `Dte41Data`
- `Dte46Data`
- `Dte52Data`
- `Dte56Data`
- `Dte61Data`

Y builders:

- `dte33ToRequest`
- `dte34ToRequest`
- `dte39ToRequest`
- `dte41ToRequest`
- `dte46ToRequest`
- `dte52ToRequest`
- `dte56ToRequest`
- `dte61ToRequest`

## Endpoints implementados

Los nombres de los métodos son los mismos en los SDK de Go y PHP.

### Salud

- `getHealth` — `GET /api/v1/health`, sin autenticación (no envía el `x-api-key`).
  Devuelve el JSON crudo (`service`, `version`, `started_at`, `uptime_seconds`...),
  sin el envelope `{ success, data }`

### Bootstrap (sin x-api-key, vía `OnboardingClient`)

- `login` — valida email + password y devuelve el `x-user-key` (`data.xUserKey`)
- `createFirstBusiness` — crea la primera empresa con el `x-user-key` y devuelve el
  `x-api-key` (`data.apiToken.xApiKey`)

Usa `OnboardingClient` para el bootstrap: no pide `apiKey`. Las respuestas vienen
tipadas (`LoginResponse`, `CreateFirstBusinessResponse`) y siguen siendo asignables
a `APIResponse`.

La 0.9.0 también agregó `login` y `createFirstBusiness` a `Client`, `Service` e
`IntegraDTEAPI`. Siguen funcionando, pero están **deprecados** en favor de
`OnboardingClient` y se quitarán en la próxima versión mayor.

### Usuarios y empresas

- `getMe`
- `listBusinesses`
- `createBusiness`
- `getBusiness`
- `updateBusiness`
- `enableProductionMode`
- `enableCertificationMode`

### Documentos, compras y cesiones

- `createDocument`
- `listDocuments`
- `getDocument`
- `updateDocument` — reemplaza el DTE de un documento que el SII aún no recibió
  (`data_dte` como string JSON, o `data_dte_json` como objeto)
- `getDocumentStats`
- `requeueDocument`
- `requeueOfflineDocumentStatus`
- `generatePDF`
- `createPurchase`
- `listPurchaseAcknowledgments`
- `requeuePurchase` — reencola un acuse de recibo (`purchase_id`)
- `createCession`
- `listCessions` — paginado; con `document_id` responde si el documento ya fue cedido
- `getCession`
- `requeueCession` — reencola una cesión (`cession_id`)

### Certificados

- `uploadCertificate`
- `getCertificateInfo` — indica si la empresa puede firmar (ver abajo)

### Numeraciones (folios)

- `getNumerationSummary`
- `getLastUsedFolio`
- `listNumerationRanges` — rangos CAF por tipo DTE (filtro opcional `code_sii`)
- `uploadNumeration`
- `deleteNumeration`
- `updateNumerationNextNumber` — fija el próximo folio de un rango CAF (el
  `ranges[].id` que devuelve `listNumerationRanges`)
- `updateLowStockConfig` — umbrales de folios bajos por `code_sii`; se mezcla con la
  configuración existente y devuelve la configuración completa
- `requestNumbers`

### Billing y consumo

- `getBillingBalance`
- `listBillingPayments`
- `listBillingCharges` — cargos de consumo (`status`, `pricing_key`, `from_date`,
  `to_date`, `page`, `limit`)
- `listBillingPlans` — planes activos
- `listBillingInvoices` — facturas (filtro opcional `status`)
- `previewSubscriptionUpgrade` — cotiza un upgrade de plan (id o `code` del plan);
  no cobra nada
- `getConsumption` — cupo y sobreconsumo del ciclo vigente
- `listConsumptionOverages` — operaciones por encima del cupo (paginado)
- `listConsumptionOperations` — detalle de operaciones de un período `YYYY-MM`
  (sin paginar)

## Idempotencia (`idempotency-key`)

Estas rutas exigen el header `idempotency-key` con un UUID (sirve cualquier
versión). Sin él la API responde 400:

| Método del SDK | Ruta |
|---|---|
| `createDocument` | `POST /api/v1/documents` |
| `updateDocument` | `PUT /api/v1/documents/:id` |
| `createBusiness` | `POST /api/v1/businesses` |
| `updateBusiness` | `PUT /api/v1/businesses/:id` |
| `uploadCertificate` | `PUT /api/v1/business/:id/certificate` |
| `uploadNumeration` | `PUT /api/v1/numerations` |
| `deleteNumeration` | `DELETE /api/v1/numerations/:id` |
| `updateNumerationNextNumber` | `PATCH /api/v1/numerations/:id/next-number` |
| `updateLowStockConfig` | `PATCH /api/v1/numerations/low-stock` |
| `createPurchase` | `POST /api/v1/purchase-acknowledgments` |
| `createCession` | `POST /api/v1/cessions` |

En esas rutas el SDK siempre envía el header. Si pasas `idempotencyKey` usa tu
clave; si no, genera un UUID nuevo en cada llamada (`crypto.randomUUID()`). En
`deleteNumeration` la clave va en un segundo argumento opcional:
`deleteNumeration(id, { idempotencyKey })`. El SDK no reintenta solo.

Cuándo conviene pasar tu propia clave:

- Para reintentar sin duplicar una operación que quizá llegó a la API (timeout,
  corte de red): repite la misma clave y la API devuelve la respuesta que guardó.
- La clave dura 24 horas por usuario y ruta, y la API **no compara el body**:
  reutilizarla con otro body devuelve la primera respuesta. Usa una clave distinta
  para cada operación.
- Si la API respondió con un error, reintenta con una clave nueva: repetir la
  anterior puede devolver 500 `failed to parse cached response`. `updateDocument`
  nunca guarda su respuesta, así que cada intento necesita una clave nueva.

Las demás rutas no usan el header. `generatePDF` lo sigue enviando solo si le
pasas `idempotencyKey`.

## Errores (`APIError`)

Ante un status que no es 2xx el SDK lanza `APIError`, con `statusCode`, `body`
(texto crudo), `parsed` (el JSON) y `apiMessage`.

`isValidationError()` es `true` cuando el request tiene datos que el integrador
puede corregir:

- **400** que trae el reporte del validador en `details` (validación del body):

  ```json
  {
    "success": false,
    "message": "Validation error",
    "details": {
      "success": false,
      "message": "Validation failed",
      "errors": [
        { "field": "email", "tag": "required", "value": "", "message": "Field 'email' is required" }
      ]
    }
  }
  ```

- **422** al validar el DTE en `createDocument`: `details` es un arreglo plano de
  `{ field, message }`.

Los demás 400 (`invalid request body`, `idempotency-key header is required`...) no
son errores de validación. `details` normaliza las dos formas a `FieldError[]`
(`field`, `message` y, en los 400, `tag` y `value`) y devuelve `[]` si no hay
detalle. En campos anidados, `field` puede venir con el nombre Go (`CodeSii`) en
vez del nombre JSON.

```ts
import { APIError } from '@integradte/sdk';

try {
  await service.updateLowStockConfig({ items: [{ code_sii: '99', threshold: 5, request_quantity: 10 }] });
} catch (err) {
  if (err instanceof APIError && err.isValidationError()) {
    for (const fieldError of err.details) {
      console.log(fieldError.field, fieldError.message);
    }
  }
}
```

## Estado del certificado

`getCertificateInfo` no devuelve datos del certificado: solo indica si la empresa
puede firmar. `data.has_valid_certificate` es `true` si la empresa tiene
certificado, abre con su contraseña guardada y no está vencido (la misma
validación que usa la emisión). Si la empresa no tiene certificado responde
`false`, no un error.

```ts
const info = await service.getCertificateInfo();

if (!info.data.has_valid_certificate) {
  // Subir un certificado vigente antes de emitir.
  await service.uploadCertificate(businessID, {
    certificate: 'BASE64_PFX',
    password: 'clave-del-certificado',
    expired_date: '2027-01-31'
  });
}
```

## Filtros y folios offline

```ts
const documents = await service.listDocuments({
  code_sii: '33',
  status: 'accepted',
  from_date: '2026-01-01',
  to_date: '2026-01-31',
  page: 1,
  limit: 20
});

const folioRanges = await service.requestNumbers({
  document_type: 33,
  quantity: 100
});
```

## Rangos CAF y folios bajos

```ts
// Rangos CAF de facturas (33). `ranges[].id` identifica cada rango.
const { data } = await service.listNumerationRanges({ code_sii: '33' });
const range = data.items[0]?.ranges[0];

if (range) {
  // El próximo documento de ese rango saldrá con el folio 150.
  await service.updateNumerationNextNumber(range.id, { next_number: 150 });
}

// Con 20 folios o menos disponibles de tipo 33, pedir 100 más. `code_sii` va como string.
const lowStock = await service.updateLowStockConfig({
  items: [{ code_sii: '33', threshold: 20, request_quantity: 100 }]
});
console.log(lowStock.data.items); // configuración completa de la empresa
```

## Scripts

```bash
pnpm build
pnpm test
pnpm typecheck
```

## Versionado y releases

El repo usa `release-please` con el workflow `./.github/workflows/release.yml`:

- Al hacer push a `main`, crea/actualiza un PR de release.
- Al mergear ese PR, crea tag + GitHub Release.
- Cuando la release se crea, publica automáticamente en npm.

Para que funcione:

- Debes usar Conventional Commits (`feat:`, `fix:`, `feat!:` o `BREAKING CHANGE:`).
- Debes tener el secret `NPM_TOKEN` configurado en GitHub.
