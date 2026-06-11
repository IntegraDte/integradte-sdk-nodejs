export type APIResponse = Record<string, unknown>;

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

export interface CreateLicenseRequest {
  name: string;
  device_fingerprint: string;
  license_key?: string;
  features?: string[];
  device_id?: string;
  cli_min_version?: string;
  validity_hours?: number;
}

export interface LicenseActionRequest {
  reason: string;
}

export interface OfflineLicenseBusiness {
  business_name: string;
  rut: string;
  activity: string;
  address: string;
  commune: string;
  region: string;
  email_dte: string;
  email_contact: string;
  resolution_number_dte: string;
  resolution_date_dte: string;
  is_prod: boolean;
}

export interface OfflineLicensePayload {
  license_id: string;
  business_id: string;
  device_id: string;
  device_fingerprint: string;
  business: OfflineLicenseBusiness;
  features: string[];
  issued_at: string;
  expires_at: string;
  last_validated_at: string;
  status: string;
  cli_min_version: string;
}

export interface SignedOfflineLicense {
  payload: OfflineLicensePayload;
  signature: string;
}

export interface ActivateLicenseRequest {
  license_key: string;
  device_id: string;
  machine_fingerprint: string;
  hostname: string;
  platform: string;
  arch: string;
  cli_version: string;
}

export interface RefreshLicenseRequest {
  device_id: string;
  machine_fingerprint: string;
  cli_version: string;
  license: SignedOfflineLicense;
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

export interface SyncDocumentRequest {
  document_id: string;
  document_type: number;
  folio: number;
  xml_base64: string;
  pdf_base64?: string;
  ted_xml_base64?: string;
  generated_at: string;
  raw_payload: Record<string, unknown>;
  license: SignedOfflineLicense;
}

export interface RequeueDocumentRequest {
  document_id: string;
}
