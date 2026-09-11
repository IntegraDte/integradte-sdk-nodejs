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

const response = await service.createDocument({
  code_sii: '33',
  data_dte: dataDTE,
  idempotencyKey: 'mi-idempotency-key-1'
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
const xUserKey = (login.data as { xUserKey: string }).xUserKey;

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
const xApiKey = (created.data as { apiToken: { xApiKey: string } }).apiToken.xApiKey;

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

### Bootstrap (sin x-api-key, vía `OnboardingClient`)

- `login` — valida email + password y devuelve el `x-user-key`
- `createFirstBusiness` — crea la primera empresa con el `x-user-key` y devuelve el `x-api-key`

### Usuarios y empresas

- `getMe`
- `listBusinesses`
- `createBusiness`
- `getBusiness`
- `updateBusiness`
- `enableProductionMode`
- `enableCertificationMode`

### Documentos y compras

- `createDocument`
- `listDocuments`
- `getDocument`
- `getDocumentStats`
- `requeueDocument`
- `requeueOfflineDocument`
- `requeueOfflineDocumentStatus`
- `createCession`
- `generatePDF`
- `createPurchase`
- `listPurchaseAcknowledgments`

### Certificados, billing y numeraciones

- `uploadCertificate`
- `getCertificateInfo` — indica si la empresa puede firmar (ver abajo)
- `getBillingBalance`
- `listBillingPayments`
- `getNumerationSummary`
- `getLastUsedFolio`
- `uploadNumeration`
- `deleteNumeration`
- `requestNumbers`
- `requestNumerations`

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
