export type APIResponse = Record<string, unknown>;

export interface CreateDocumentRequest {
  user_id?: string;
  business_id?: string;
  code_sii: string;
  data_dte: string;
  idempotencyKey?: string;
}

export interface CreateCessionRequest {
  document_id: string;
  factoring_code: string;
  factoring_name: string;
  factoring_address: string;
  factoring_email: string;
  idempotencyKey?: string;
}

export interface GeneratePDFRequest {
  document_id: string;
  formato?: string;
  copia_cedible?: boolean;
  idempotencyKey?: string;
}

export interface CreateBusinessRequest {
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
  idempotencyKey?: string;
}

export type UpdateBusinessRequest = CreateBusinessRequest;

export interface UploadCertificateRequest {
  certificate: string;
  password: string;
  expired_date: string | Date;
}

export interface CreatePurchaseRequest {
  xml_base64: string;
  rut_emisor: string;
  razon_social_emisor: string;
  tipo_dte: string;
  folio: number;
  mnt_total: string;
  fecha_emision: string;
  email_emisor: string;
  accion_doc: string;
  idempotencyKey?: string;
}

export interface UploadNumerationRequest {
  code_sii: string;
  start_number: number;
  end_number: number;
  caf_base64: string;
  creation_date: string;
  due_date: string;
}
