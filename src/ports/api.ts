import type {
  ActivateLicenseRequest,
  APIResponse,
  BillingPaymentFilters,
  CreateBusinessRequest,
  CreateCessionRequest,
  CreateDocumentRequest,
  CreateLicenseRequest,
  CreatePurchaseRequest,
  DocumentFilters,
  FolioRange,
  GeneratePDFRequest,
  LicenseActionRequest,
  ProductionModeRequest,
  PurchaseAcknowledgmentFilters,
  RefreshLicenseRequest,
  RequeueDocumentRequest,
  RequestNumbersRequest,
  RequestNumerationsRequest,
  SyncDocumentRequest,
  UpdateBusinessRequest,
  UploadCertificateRequest,
  UploadNumerationRequest
} from '../domain/types.js';

export interface IntegraDTEAPI {
  createDocument(req: CreateDocumentRequest): Promise<APIResponse>;
  listDocuments(filters?: DocumentFilters): Promise<APIResponse>;
  getDocument(id: string): Promise<APIResponse>;
  getDocumentStats(filters?: DocumentFilters): Promise<APIResponse>;
  syncDocument(req: SyncDocumentRequest): Promise<APIResponse>;
  requeueDocument(req: RequeueDocumentRequest): Promise<APIResponse>;
  requeueOfflineDocument(req: RequeueDocumentRequest): Promise<APIResponse>;
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
  getCertificateInfo(): Promise<APIResponse>;
  getCurrentCertificate(): Promise<APIResponse>;
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
  requestNumerations(req: RequestNumerationsRequest): Promise<APIResponse>;
  createLicense(req: CreateLicenseRequest): Promise<APIResponse>;
  listLicenses(): Promise<APIResponse>;
  getLicense(id: string): Promise<APIResponse>;
  listLicenseDevices(id: string): Promise<APIResponse>;
  enableLicense(id: string, req: LicenseActionRequest): Promise<APIResponse>;
  disableLicense(id: string, req: LicenseActionRequest): Promise<APIResponse>;
  revokeLicense(id: string, req: LicenseActionRequest): Promise<APIResponse>;
  activateLicense(req: ActivateLicenseRequest): Promise<APIResponse>;
  refreshLicense(req: RefreshLicenseRequest): Promise<APIResponse>;
}
