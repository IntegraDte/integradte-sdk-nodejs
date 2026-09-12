export type APIResponse = Record<string, unknown>;

/**
 * Error de validación de un campo. La API lo manda en dos respuestas:
 *
 * - 400 al validar el body del request: dentro de `details.errors`, con `field`,
 *   `tag`, `value` y `message`. En campos anidados `field` puede traer el nombre Go
 *   (p. ej. `CodeSii`) en vez del nombre JSON.
 * - 422 al validar el DTE en POST /api/v1/documents: en `details`, como arreglo
 *   plano con `field` y `message`.
 *
 * `APIError.details` normaliza ambas formas a un arreglo de FieldError.
 */
export interface FieldError {
  field: string;
  message: string;
  /** Regla que falló (p. ej. `required`, `email`). Solo viene en los 400. */
  tag?: string;
  /** Valor recibido. Solo viene en los 400. */
  value?: unknown;
}

/** Reporte del validador que la API manda en `details` de un 400 de validación. */
export interface ValidationErrorDetails {
  success: boolean;
  message: string;
  errors: FieldError[];
}

/** Forma del body JSON que devuelve la API ante un error. */
export interface APIErrorBody {
  success?: boolean;
  message?: string;
  /**
   * Detalle del error. Ojo: el tipo declarado solo cubre el 422 de validación del DTE
   * (arreglo plano). En un 400 de validación viene un {@link ValidationErrorDetails}.
   * Para leer los errores por campo usa `APIError.details`, que entiende ambas formas.
   * El tipo se mantiene así por compatibilidad.
   */
  details?: FieldError[];
  /** Código de error opcional. */
  code?: string;
  /** Detalle de error crudo (solo en entornos no productivos). */
  error?: string;
}

export interface IdempotentRequest {
  idempotencyKey?: string;
}

export interface CreateDocumentRequest extends IdempotentRequest {
  user_id?: string;
  business_id?: string;
  code_sii: string;
  data_dte: string;
}

export interface CreateCessionRequest extends IdempotentRequest {
  document_id: string;
  factoring_code: string;
  factoring_name: string;
  factoring_address: string;
  factoring_email: string;
}

export interface GeneratePDFRequest extends IdempotentRequest {
  document_id: string;
  formato?: string;
  copia_cedible?: boolean;
}

export interface BusinessRequest {
  businessName: string;
  rut: string;
  activity: string;
  address: string;
  commune: string;
  /** La API pide `region` o `city` (al menos uno). */
  region?: string;
  city: string;
  emailDte: string;
  emailContact: string;
  rutLegalAgent: string;
  fullNameLegalAgent: string;
  resolutionNumberDte: string;
  resolutionDateDte: string;
  resolutionNumberTicket: string;
  resolutionTicketDate: string;
  /** Logo en base64 crudo, sin prefijo `data:`. */
  logo?: string;
  logoContentType?: string;
}

export type CreateBusinessRequest = BusinessRequest & IdempotentRequest;

export type UpdateBusinessRequest = CreateBusinessRequest;

/** Credenciales para POST /api/v1/auth/login (ruta pública, sin x-api-key). */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Forma de `data` que devuelve el login: el x-user-key para el bootstrap. */
export interface LoginResponseData {
  user_id: string;
  email: string;
  /** Credencial de usuario que se envía como header `x-user-key`. */
  xUserKey: string;
}

/**
 * Payload para crear la PRIMERA empresa del usuario (POST /api/v1/onboarding/businesses).
 * Mismo cuerpo que crear empresa, pero sin idempotencyKey: ese endpoint no usa idempotency.
 */
export type CreateFirstBusinessRequest = BusinessRequest;

export interface ProductionModeRequest {
  resolution_number_dte: string;
  resolution_date_dte: string;
  resolution_number_ticket: string;
  resolution_ticket_date: string;
}

export interface PaginationFilter {
  page?: number;
  limit?: number;
}

export interface DateRangeFilter {
  from_date?: string;
  to_date?: string;
}

export interface DocumentFilters extends PaginationFilter, DateRangeFilter {
  code_sii?: string;
  status?: string;
}

export interface BillingPaymentFilters extends PaginationFilter, DateRangeFilter {
  status?: string;
}

export interface PurchaseAcknowledgmentFilters extends PaginationFilter, DateRangeFilter {
  tipo_dte?: string;
  accion_doc?: string;
}

export interface UploadCertificateRequest extends IdempotentRequest {
  certificate: string;
  password: string;
  expired_date: string | Date;
}

/** Forma de `data` que devuelve GET /api/v1/business/certificate-info. */
export interface CertificateInfo {
  /**
   * true si la empresa tiene certificado, abre con su contraseña guardada y no está
   * vencido (la misma validación que usa la emisión). Sin certificado es false.
   */
  has_valid_certificate: boolean;
}

/** Respuesta completa de GET /api/v1/business/certificate-info. */
export interface CertificateInfoResponse {
  success: boolean;
  message: string;
  data: CertificateInfo;
}

export interface CreatePurchaseRequest extends IdempotentRequest {
  xml_base64: string;
  rut_emisor: string;
  razon_social_emisor: string;
  tipo_dte: string;
  folio: number;
  mnt_total: string;
  fecha_emision: string;
  email_emisor: string;
  accion_doc: string;
}

export interface UploadNumerationRequest extends IdempotentRequest {
  code_sii: string;
  start_number: number;
  end_number: number;
  caf_base64: string;
  creation_date: string;
  due_date: string;
}

export interface RequestNumbersRequest {
  document_type: number;
  quantity: number;
}

export interface FolioRange {
  document_type: number;
  folio_inicial: number;
  folio_final: number;
  folio_xml_base64: string;
}

export interface RequeueDocumentRequest {
  document_id: string;
}

/** Envelope estándar `{ success, message, data }` de la API. */
export interface APIEnvelope<T> {
  success: boolean;
  /** La API lo omite cuando viene vacío. */
  message?: string;
  data: T;
}

/** Respuesta sin datos: la API omite la clave `data` (no la manda en null). */
export interface APIMessageResponse {
  success: boolean;
  message?: string;
}

/** Evento del historial de estados de un documento o una cesión. */
export interface StatusHistoryEntry {
  status: string;
  /** "process" o "sii". */
  type: string;
  timestamp: string;
  details?: string;
}

// ---------------------------------------------------------------------------
// Salud y bootstrap
// ---------------------------------------------------------------------------

/**
 * Respuesta de GET /api/v1/health. Es JSON crudo, SIN el envelope
 * `{ success, message, data }` del resto de la API.
 */
export interface HealthResponse {
  service: string;
  commit?: string;
  version?: string;
  built_at?: string;
  env?: string;
  deployment?: string;
  started_at: string;
  uptime_seconds: number;
}

/** Respuesta de POST /api/v1/auth/login. */
export type LoginResponse = APIEnvelope<LoginResponseData>;

/** Empresa tal como la devuelve la API (JSON en camelCase). */
export interface Business {
  id: string;
  businessName: string;
  rut: string;
  logo?: string;
  logoContentType?: string;
  logoFileName?: string;
  logoUploadedAt?: string;
  certificateFileName?: string;
  certificateSubject?: string;
  certificateExpiredDate: string;
  certificateUploadedAt?: string;
  status: string;
  activityStartDate: string;
  activity: string;
  region: string;
  commune: string;
  address: string;
  emailDte: string;
  emailContact: string;
  web?: string;
  phone?: string;
  rutLegalAgent?: string;
  fullNameLegalAgent?: string;
  resolutionNumberDte: string;
  resolutionDateDte: string;
  resolutionNumberTicket: string;
  resolutionTicketDate: string;
  isProd: boolean;
  lowStockThresholds?: Record<string, number>;
  lowStockRequestQuantities?: Record<string, number>;
  webhookUrl?: string;
  webhookHeaders?: Record<string, string>;
  webhookActive: boolean;
  webhookEvents?: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

/** API token que se crea junto con la primera empresa (JSON en snake_case salvo `xApiKey`). */
export interface BusinessAPIToken {
  id: string;
  user_id: string;
  business_id: string;
  name: string;
  usage: number;
  limit: number;
  /** La API omite la clave cuando el token no vence. */
  expires_at?: string;
  status: string;
  created_at: string;
  updated_at: string;
  /** Valor para el header `x-api-key` (igual a `id`). */
  xApiKey: string;
}

/** `data` de POST /api/v1/onboarding/businesses: la empresa creada más su API token. */
export interface FirstBusiness extends Business {
  apiToken: BusinessAPIToken;
}

/** Respuesta de POST /api/v1/onboarding/businesses (status 201). */
export type CreateFirstBusinessResponse = APIEnvelope<FirstBusiness>;

// ---------------------------------------------------------------------------
// Documentos
// ---------------------------------------------------------------------------

/**
 * Body de PUT /api/v1/documents/:id. Debe venir al menos uno de los dos campos:
 * `data_dte` (el DTE serializado como string JSON) gana si no está vacío;
 * `data_dte_json` (objeto, o string con JSON) se usa solo si `data_dte` viene vacío.
 */
export interface UpdateDocumentRequest extends IdempotentRequest {
  data_dte?: string;
  data_dte_json?: unknown;
}

export interface DocumentBilling {
  chargeable: boolean;
  source?: string;
  courtesy_reason?: string;
}

/** Documento tributario tal como lo devuelve la API. */
export interface DTEDocument {
  id: string;
  user_id: string;
  business_id: string;
  user?: Record<string, unknown>;
  business?: Record<string, unknown>;
  code_sii: string;
  folio: number;
  /** El DTE; la API lo guarda y lo devuelve como string JSON. */
  data_dte: unknown;
  xml_for_email: string | null;
  xml_for_sii: string | null;
  status_process: string | null;
  processAttempts: number;
  status_sii: string | null;
  track_id?: string;
  tedDocument?: string;
  billing?: DocumentBilling;
  /** Ambiente con el que se emitió; ausente en documentos antiguos. */
  is_prod?: boolean | null;
  sii_verdict_at?: string;
  created_by: string;
  status_history?: StatusHistoryEntry[];
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

/** Respuesta de PUT /api/v1/documents/:id (sin `upload_status` ni `sii_verdict`). */
export type UpdateDocumentResponse = APIEnvelope<DTEDocument>;

// ---------------------------------------------------------------------------
// Numeraciones
// ---------------------------------------------------------------------------

export interface UpdateNumerationNextNumberRequest extends IdempotentRequest {
  /** Folio que recibirá el próximo documento (mínimo 1). */
  next_number: number;
}

/** Respuesta de PATCH /api/v1/numerations/:numerationId/next-number: no trae `data`. */
export type UpdateNumerationNextNumberResponse = APIMessageResponse;

/** Umbral de folios bajos para un tipo DTE. */
export interface LowStockSetting {
  /** String, no número: 33, 34, 39, 41, 46, 52, 56 o 61. */
  code_sii: string;
  /** Con `threshold` o menos folios disponibles se piden más. 0 es válido. */
  threshold: number;
  /** Folios a pedir cuando se cruza el umbral (mínimo 1). */
  request_quantity: number;
}

export interface UpdateLowStockConfigRequest extends IdempotentRequest {
  /** Se mezcla por `code_sii`: los códigos que no vienen conservan su configuración. */
  items: LowStockSetting[];
}

/** Configuración vigente de un tipo DTE. `null` significa que esa mitad nunca se configuró. */
export interface LowStockConfigItem {
  code_sii: string;
  threshold: number | null;
  request_quantity: number | null;
}

export interface LowStockConfig {
  items: LowStockConfigItem[];
}

/** Respuesta de PATCH /api/v1/numerations/low-stock: la configuración completa de la empresa. */
export type UpdateLowStockConfigResponse = APIEnvelope<LowStockConfig>;

export interface NumerationRangeFilters {
  code_sii?: string;
}

/** Un rango CAF. `id` es el que usa updateNumerationNextNumber. */
export interface NumerationRange {
  id: string;
  start_number: number;
  end_number: number;
  last_number: number;
  available: number;
  is_exhausted: boolean;
  due_date: string;
  is_expired: boolean;
  created_at: string;
}

export interface NumerationRangesItem {
  code_sii: string;
  total_folios: number;
  used_folios: number;
  /** Excluye los rangos vencidos. */
  available: number;
  ranges: NumerationRange[];
}

export interface NumerationRanges {
  /** El orden no es determinista. */
  items: NumerationRangesItem[];
}

/** Respuesta de GET /api/v1/numerations/ranges. */
export type ListNumerationRangesResponse = APIEnvelope<NumerationRanges>;

// ---------------------------------------------------------------------------
// Compras
// ---------------------------------------------------------------------------

export interface RequeuePurchaseRequest {
  purchase_id: string;
}

/** Respuesta de POST /api/v1/purchase-acknowledgments/requeue. */
export type RequeuePurchaseResponse = APIEnvelope<{ purchase_id: string }>;

// ---------------------------------------------------------------------------
// Billing
// ---------------------------------------------------------------------------

export interface BillingChargeFilters extends PaginationFilter, DateRangeFilter {
  /** p. ej. reserved, charged, reverted. */
  status?: string;
  /** emission, cession, purchase, read o pdf. */
  pricing_key?: string;
}

/** Cargo de consumo. Los montos van en micros (int64). */
export interface BillingCharge {
  id: string;
  request_id?: string;
  http_method?: string;
  route_path?: string;
  pricing_key: string;
  units: number;
  unit_cost_micros: number;
  total_cost_micros: number;
  status: string;
  bucket?: string;
  billing_mode?: string;
  response_status?: number;
  created_at?: string;
  charged_at?: string;
  reverted_at?: string;
  revert_reason?: string;
  document_id?: string;
}

export interface BillingChargesPage {
  items: BillingCharge[];
  page: number;
  limit: number;
  total_items: number;
  total_pages: number;
}

/** Respuesta de GET /api/v1/billing/charges. */
export type ListBillingChargesResponse = APIEnvelope<BillingChargesPage>;

/** Cupos del plan. 0 significa ilimitado. */
export interface PlanQuotas {
  documentos: number;
  consultas: number;
}

export interface PlanFeature {
  key: string;
  label: string;
  /** number, bool, enum, list, text, uf, percent (pueden aparecer otros). */
  type: string;
  value: unknown;
}

export interface BillingPlan {
  id: string;
  code: string;
  name: string;
  value_uf: number;
  /** Derivado del valor UF vigente al momento de la lectura. */
  price_clp: number;
  quotas: PlanQuotas;
  features: PlanFeature[];
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

/** Respuesta de GET /api/v1/billing/plans: `data` es un arreglo, sin paginación. */
export type ListBillingPlansResponse = APIEnvelope<BillingPlan[]>;

export interface BillingInvoiceFilters {
  /** open, paid o void. */
  status?: string;
}

export interface InvoiceLineItem {
  pricing_key: string;
  bucket: string;
  count: number;
  total_micros: number;
}

export interface BillingInvoice {
  id: string;
  business_id: string;
  business_name?: string;
  rut?: string;
  user_id: string;
  /** YYYY-MM. */
  period: string;
  status: string;
  currency: string;
  /** Bruto, sin descuento. */
  total_micros: number;
  /** Ya trae el descuento aplicado. */
  total_clp: number;
  charges_count: number;
  line_items: InvoiceLineItem[];
  total_bruto_clp?: number;
  descuento_clp?: number;
  descuento_tipo?: string;
  descuento_valor?: number;
  payment_id?: string;
  created_at?: string;
  closed_at?: string;
  paid_at?: string;
}

/** Respuesta de GET /api/v1/billing/invoices: `data` es un arreglo, sin paginación. */
export type ListBillingInvoicesResponse = APIEnvelope<BillingInvoice[]>;

/** Cotización de un upgrade de plan prorrateado por los días que quedan del ciclo. */
export interface SubscriptionUpgradePreview {
  current_plan_id: string;
  current_plan_name: string;
  current_price_clp: number;
  new_plan_id: string;
  new_plan_name: string;
  new_price_clp: number;
  period_start: string;
  period_end: string;
  days_total: number;
  days_remaining: number;
  delta_clp: number;
  amount_clp: number;
  /** 0 si no hay valor UF configurado. */
  value_uf: number;
  /** 0 si no hay valor UF configurado. */
  amount_uf: number;
  /** false cuando `amount_clp` es menor a 1. */
  payable: boolean;
}

/** Respuesta de GET /api/v1/billing/subscription/upgrade/preview. */
export type SubscriptionUpgradePreviewResponse = APIEnvelope<SubscriptionUpgradePreview>;

// ---------------------------------------------------------------------------
// Consumo
// ---------------------------------------------------------------------------

export interface ConsumptionPlan {
  id: string;
  code: string;
  name: string;
}

/** Consumo de un bucket. `limit` 0 es ilimitado y en ese caso `remaining` es -1. */
export interface ConsumptionBucket {
  limit: number;
  used: number;
  remaining: number;
  tope_total: number;
  excedente: number;
  tarifa_exc_uf: number;
  excedente_uf: number;
  proyeccion: number;
}

export interface Consumption {
  /** YYYY-MM. */
  period: string;
  /** Ausente si la empresa no tiene plan. */
  plan?: ConsumptionPlan;
  tope_sobreconsumo_pct: number;
  documentos: ConsumptionBucket;
  consultas: ConsumptionBucket;
}

/** Respuesta de GET /api/v1/consumption. */
export type ConsumptionResponse = APIEnvelope<Consumption>;

export type ConsumptionOverageFilters = PaginationFilter;

export interface ConsumptionOverage {
  period: string;
  /** documentos o consultas. */
  tipo: string;
  operacion_id: string;
  tarifa_uf: number;
  fecha?: string;
}

/** Página de excedentes. La cuenta viene en `total` y no hay `total_pages`. */
export interface ConsumptionOveragesPage {
  items: ConsumptionOverage[];
  page: number;
  limit: number;
  total: number;
}

/** Respuesta de GET /api/v1/consumption/overages. */
export type ListConsumptionOveragesResponse = APIEnvelope<ConsumptionOveragesPage>;

export interface ConsumptionOperationFilters {
  /** YYYY-MM (UTC). Por defecto, el mes en curso. */
  period?: string;
}

export interface ConsumptionOperation {
  charge_id: string;
  at: string;
  account_id: string;
  business_id: string;
  business_rut?: string;
  /** emission, cession, purchase, read o pdf (pueden aparecer otros). */
  operation: string;
  label: string;
  units: number;
  status: string;
  revert_reason?: string;
  /** false para operaciones revertidas o de certificación. */
  counted: boolean;
  document_id?: string;
  folio?: number;
  code_sii?: string;
  is_prod: boolean;
}

/** Todas las operaciones del período en una sola respuesta (sin paginar). */
export interface ConsumptionOperations {
  period: string;
  account_id: string;
  business_id: string;
  total: number;
  items: ConsumptionOperation[];
}

/** Respuesta de GET /api/v1/consumption/operations. */
export type ListConsumptionOperationsResponse = APIEnvelope<ConsumptionOperations>;

// ---------------------------------------------------------------------------
// Cesiones
// ---------------------------------------------------------------------------

export interface RequeueCessionRequest {
  cession_id: string;
}

/** Respuesta de POST /api/v1/cessions/requeue. */
export type RequeueCessionResponse = APIEnvelope<{ cession_id: string }>;

export interface CessionFilters extends PaginationFilter {
  /** Responde "¿este documento ya fue cedido?". */
  document_id?: string;
}

/** Cesión tal como la devuelve la API: mezcla snake_case y camelCase. */
export interface Cession {
  id: string;
  business_id: string;
  document_id: string;
  factoring_code: string;
  factoring_name: string;
  factoring_address?: string;
  factoring_email?: string;
  processAttempts: number;
  statusProcess?: string;
  /** String que suele traer JSON (p. ej. `{"Glosa":"Documento Cedido"}`). */
  statusSii?: string | null;
  xmlCession?: string;
  trackId?: string;
  status_history?: StatusHistoryEntry[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

/** Página de cesiones. La lista viene en `cessions` y la cuenta en `total`. */
export interface CessionsPage {
  cessions: Cession[];
  total: number;
  page: number;
  limit: number;
}

/** Respuesta de GET /api/v1/cessions. */
export type ListCessionsResponse = APIEnvelope<CessionsPage>;

/** Respuesta de GET /api/v1/cessions/:id. */
export type CessionResponse = APIEnvelope<Cession>;
