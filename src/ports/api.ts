import type {
  APIResponse,
  BillingPaymentFilters,
  CertificateInfoResponse,
  CreateBusinessRequest,
  CreateCessionRequest,
  CreateDocumentRequest,
  CreatePurchaseRequest,
  DocumentFilters,
  FolioRange,
  GeneratePDFRequest,
  ProductionModeRequest,
  PurchaseAcknowledgmentFilters,
  RequeueDocumentRequest,
  RequestNumbersRequest,
  UpdateBusinessRequest,
  UploadCertificateRequest,
  UploadNumerationRequest
} from '../domain/types.js';

export interface IntegraDTEAPI {
  createDocument(req: CreateDocumentRequest): Promise<APIResponse>;
  listDocuments(filters?: DocumentFilters): Promise<APIResponse>;
  getDocument(id: string): Promise<APIResponse>;
  getDocumentStats(filters?: DocumentFilters): Promise<APIResponse>;
  requeueDocument(req: RequeueDocumentRequest): Promise<APIResponse>;
  requeueOfflineDocumentStatus(req: RequeueDocumentRequest): Promise<APIResponse>;
  createCession(req: CreateCessionRequest): Promise<APIResponse>;
  generatePDF(req: GeneratePDFRequest, cedible: boolean): Promise<APIResponse>;
  listBusinesses(): Promise<APIResponse>;
  createBusiness(req: CreateBusinessRequest): Promise<APIResponse>;
  getBusiness(id: string): Promise<APIResponse>;
  updateBusiness(id: string, req: UpdateBusinessRequest): Promise<APIResponse>;
  enableProductionMode(req: ProductionModeRequest): Promise<APIResponse>;
  enableCertificationMode(): Promise<APIResponse>;
  uploadCertificate(businessID: string, req: UploadCertificateRequest): Promise<APIResponse>;
  getCertificateInfo(): Promise<CertificateInfoResponse>;
  getMe(): Promise<APIResponse>;
  createPurchase(req: CreatePurchaseRequest): Promise<APIResponse>;
  listPurchaseAcknowledgments(filters?: PurchaseAcknowledgmentFilters): Promise<APIResponse>;
  getBillingBalance(): Promise<APIResponse>;
  listBillingPayments(filters?: BillingPaymentFilters): Promise<APIResponse>;
  getNumerationSummary(): Promise<APIResponse>;
  getLastUsedFolio(codeSII: string): Promise<APIResponse>;
  uploadNumeration(req: UploadNumerationRequest): Promise<APIResponse>;
  deleteNumeration(id: string): Promise<APIResponse>;
  requestNumbers(req: RequestNumbersRequest): Promise<FolioRange[]>;
}
