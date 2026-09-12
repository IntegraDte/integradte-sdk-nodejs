# Changelog

## [0.9.0](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.8.0...sdk-v0.9.0) (2026-09-12)


### Features

* **api:** cubre toda la API pública y siempre envía idempotency-key ([e4de512](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/e4de512870d6f10b49ecd0f1ea38cb7085eed825))
* **api:** cubre toda la API pública y siempre envía idempotency-key ([814d3aa](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/814d3aa6304e411355ed867ec58591769f7adbfb))

## [0.8.0](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.7.1...sdk-v0.8.0) (2026-09-12)


### ⚠ BREAKING CHANGES

* **api:** se eliminan requeueOfflineDocument y requestNumerations de Client, Service e IntegraDTEAPI, junto con el tipo RequestNumerationsRequest. Para pedir folios queda requestNumbers.

### Features

* **api:** fuera requeueOfflineDocument y requestNumerations, rutas que la API retira ([c306757](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/c3067577f9a64e3c99ddc3b6a4fe02f43f6b305b))

## [0.7.1](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.7.0...sdk-v0.7.1) (2026-09-11)


### Bug Fixes

* **api:** createPurchase y requestNumbers usan las rutas vigentes de la API ([791bc0b](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/791bc0bad5ab9fdc2ce3ddcc232fb9a65a4792ec))
* **api:** createPurchase y requestNumbers usan las rutas vigentes de la API ([4de6bff](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/4de6bff542c09e799fcd24c0f366bb277f3cc2ae))

## [0.7.0](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.6.0...sdk-v0.7.0) (2026-09-11)


### ⚠ BREAKING CHANGES

* **api:** se eliminan syncDocument, getCurrentCertificate, createLicense, listLicenses, getLicense, listLicenseDevices, enableLicense, disableLicense, revokeLicense, activateLicense y refreshLicense de Client, Service e IntegraDTEAPI, junto con sus tipos de request. getCertificateInfo ahora resuelve a CertificateInfoResponse ({ success, message, data: { has_valid_certificate } }) en vez del detalle del certificado, y sin certificado resuelve con false en vez de lanzar APIError 400.

### Features

* **api:** el SDK se alinea con la API: fuera licencias, sync y certificado actual ([d688a53](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/d688a534028c7c03d1a338db6955126906285b64))

## [0.6.0](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.5.0...sdk-v0.6.0) (2026-07-07)


### Features

* **onboarding:** OnboardingClient para login y primera empresa con x-user-key ([8a3bb67](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/8a3bb6762a470c20d13f7e61d2e3d5feaabe15fb))

## [0.5.0](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.4.0...sdk-v0.5.0) (2026-06-18)


### Features

* **APIError:** enhance error handling with detailed validation error information ([5b58fad](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/5b58fada50c398b90444adb199d73b20df11cda1))

## [0.4.0](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.3.1...sdk-v0.4.0) (2026-06-11)


### Features

* **api:** add new endpoints for businesses, documents, licenses, and billing ([2557e54](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/2557e54f1467a8480aea5d0ecac11c32c64eba21))

## [0.3.1](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.3.0...sdk-v0.3.1) (2026-03-18)


### Bug Fixes

* **package:** update homepage and repository URLs to reflect new ownership ([09e4d27](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/09e4d27fc18f1020acd2bc3beadb2248ab545e7f))

## [0.2.0](https://github.com/IntegraDte/integrafacturacion-sdk-nodejs/compare/sdk-v0.1.0...sdk-v0.2.0) (2026-02-28)

## [0.3.0](https://github.com/IntegraDte/integradte-sdk-nodejs/compare/sdk-v0.2.0...sdk-v0.3.0) (2026-03-18)

### Features

- **application:** create service layer for business logic. ([56c0475](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/56c047588683112e3bcd836db8f0a4698b2fd839))
- **code-changes:** implement new functionality for improved performance. ([9678bde](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/9678bde4a7809011656bb0c633ffcb41df3edfe4))
- **domain:** add DTE document types and builder functions. ([56c0475](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/56c047588683112e3bcd836db8f0a4698b2fd839))
- **httpintegra:** implement API client for Integra Facturacion service. ([56c0475](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/56c047588683112e3bcd836db8f0a4698b2fd839))
- **ports:** define IntegraFacturacionAPI interface for API interactions. ([56c0475](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/56c047588683112e3bcd836db8f0a4698b2fd839))

### Bug Fixes

- **api:** update package name and references from IntegraFacturacion to IntegraDTE ([070b0fe](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/070b0fef75b2c34086112fcff7980552c2b27907))
- **httpintegra:** update package name and user agent in README and client ([260292a](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/260292ac63c3acd1f9105875aff5e0709f5ffaa1))
- **package:** update version from 0.1.0 to 0.1.1 ([3113b44](https://github.com/IntegraDte/integradte-sdk-nodejs/commit/3113b44a29b8c94a5f06d97ad5fd721d5799588b))

## [0.2.0](https://github.com/JoseLuis21/integrafacturacion-sdk-nodejs/compare/sdk-v0.1.0...sdk-v0.2.0) (2026-02-28)

### Features

- **application:** create service layer for business logic. ([56c0475](https://github.com/IntegraDte/integrafacturacion-sdk-nodejs/commit/56c047588683112e3bcd836db8f0a4698b2fd839))
- **code-changes:** implement new functionality for improved performance. ([9678bde](https://github.com/IntegraDte/integrafacturacion-sdk-nodejs/commit/9678bde4a7809011656bb0c633ffcb41df3edfe4))
- **domain:** add DTE document types and builder functions. ([56c0475](https://github.com/IntegraDte/integrafacturacion-sdk-nodejs/commit/56c047588683112e3bcd836db8f0a4698b2fd839))
- **httpintegra:** implement API client for Integra Facturacion service. ([56c0475](https://github.com/IntegraDte/integrafacturacion-sdk-nodejs/commit/56c047588683112e3bcd836db8f0a4698b2fd839))
- **ports:** define IntegraFacturacionAPI interface for API interactions. ([56c0475](https://github.com/IntegraDte/integrafacturacion-sdk-nodejs/commit/56c047588683112e3bcd836db8f0a4698b2fd839))

### Bug Fixes

- **httpintegra:** update package name and user agent in README and client ([260292a](https://github.com/IntegraDte/integrafacturacion-sdk-nodejs/commit/260292ac63c3acd1f9105875aff5e0709f5ffaa1))
