export type APIResponse = Record<string, unknown>;

/** Error de validación campo a campo que devuelve la API (status 422). */
export interface FieldError {
  field: string;
  message: string;
}

/** Forma del body JSON que devuelve la API ante un error. */
export interface APIErrorBody {
  success?: boolean;
  message?: string;
  /** Presente en errores de validación (422): detalle por campo. */
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
  city: string;
  emailDte: string;
  emailContact: string;
  rutLegalAgent: string;
  fullNameLegalAgent: string;
  resolutionNumberDte: string;
  resolutionDateDte: string;
  resolutionNumberTicket: string;
  resolutionTicketDate: string;
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

export interface UploadCertificateRequest {
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

export interface UploadNumerationRequest {
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

export interface RequestNumerationsRequest {
  code_sii: string;
  quantity: number;
}

export interface RequeueDocumentRequest {
  document_id: string;
}
