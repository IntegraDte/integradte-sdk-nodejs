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
- `syncDocument`
- `requeueDocument`
- `requeueOfflineDocument`
- `requeueOfflineDocumentStatus`
- `createCession`
- `generatePDF`
- `createPurchase`
- `listPurchaseAcknowledgments`

### Certificados, billing y numeraciones

- `uploadCertificate`
- `getCertificateInfo`
- `getCurrentCertificate`
- `getBillingBalance`
- `listBillingPayments`
- `getNumerationSummary`
- `getLastUsedFolio`
- `uploadNumeration`
- `deleteNumeration`
- `requestNumbers`
- `requestNumerations`

### Licencias offline

- `createLicense`
- `listLicenses`
- `getLicense`
- `listLicenseDevices`
- `enableLicense`
- `disableLicense`
- `revokeLicense`
- `activateLicense`
- `refreshLicense`

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
