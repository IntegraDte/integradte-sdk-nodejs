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
import type { IntegraDTEAPI } from '../ports/api.js';

export class Service {
  constructor(private readonly api: IntegraDTEAPI) {}

  createDocument(req: CreateDocumentRequest): Promise<APIResponse> {
    return this.api.createDocument(req);
  }

  listDocuments(filters?: DocumentFilters): Promise<APIResponse> {
    return this.api.listDocuments(filters);
  }

  getDocument(id: string): Promise<APIResponse> {
    return this.api.getDocument(id);
  }

  getDocumentStats(filters?: DocumentFilters): Promise<APIResponse> {
    return this.api.getDocumentStats(filters);
  }

  syncDocument(req: SyncDocumentRequest): Promise<APIResponse> {
    return this.api.syncDocument(req);
  }

  requeueDocument(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.api.requeueDocument(req);
  }

  requeueOfflineDocument(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.api.requeueOfflineDocument(req);
  }

  requeueOfflineDocumentStatus(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.api.requeueOfflineDocumentStatus(req);
  }

  createCession(req: CreateCessionRequest): Promise<APIResponse> {
    return this.api.createCession(req);
  }

  generatePDF(req: GeneratePDFRequest, cedible: boolean): Promise<APIResponse> {
    return this.api.generatePDF(req, cedible);
  }

  listBusinesses(): Promise<APIResponse> {
    return this.api.listBusinesses();
  }

  createBusiness(req: CreateBusinessRequest): Promise<APIResponse> {
    return this.api.createBusiness(req);
  }

  getBusiness(id: string): Promise<APIResponse> {
    return this.api.getBusiness(id);
  }

  updateBusiness(id: string, req: UpdateBusinessRequest): Promise<APIResponse> {
    return this.api.updateBusiness(id, req);
  }

  enableProductionMode(req: ProductionModeRequest): Promise<APIResponse> {
    return this.api.enableProductionMode(req);
  }

  enableCertificationMode(): Promise<APIResponse> {
    return this.api.enableCertificationMode();
  }

  uploadCertificate(businessID: string, req: UploadCertificateRequest): Promise<APIResponse> {
    return this.api.uploadCertificate(businessID, req);
  }

  getCertificateInfo(): Promise<APIResponse> {
    return this.api.getCertificateInfo();
  }

  getCurrentCertificate(): Promise<APIResponse> {
    return this.api.getCurrentCertificate();
  }

  getMe(): Promise<APIResponse> {
    return this.api.getMe();
  }

  createPurchase(req: CreatePurchaseRequest): Promise<APIResponse> {
    return this.api.createPurchase(req);
  }

  listPurchaseAcknowledgments(filters?: PurchaseAcknowledgmentFilters): Promise<APIResponse> {
    return this.api.listPurchaseAcknowledgments(filters);
  }

  getBillingBalance(): Promise<APIResponse> {
    return this.api.getBillingBalance();
  }

  listBillingPayments(filters?: BillingPaymentFilters): Promise<APIResponse> {
    return this.api.listBillingPayments(filters);
  }

  getNumerationSummary(): Promise<APIResponse> {
    return this.api.getNumerationSummary();
  }

  getLastUsedFolio(codeSII: string): Promise<APIResponse> {
    return this.api.getLastUsedFolio(codeSII);
  }

  uploadNumeration(req: UploadNumerationRequest): Promise<APIResponse> {
    return this.api.uploadNumeration(req);
  }

  deleteNumeration(id: string): Promise<APIResponse> {
    return this.api.deleteNumeration(id);
  }

  requestNumbers(req: RequestNumbersRequest): Promise<FolioRange[]> {
    return this.api.requestNumbers(req);
  }

  requestNumerations(req: RequestNumerationsRequest): Promise<APIResponse> {
    return this.api.requestNumerations(req);
  }

  createLicense(req: CreateLicenseRequest): Promise<APIResponse> {
    return this.api.createLicense(req);
  }

  listLicenses(): Promise<APIResponse> {
    return this.api.listLicenses();
  }

  getLicense(id: string): Promise<APIResponse> {
    return this.api.getLicense(id);
  }

  listLicenseDevices(id: string): Promise<APIResponse> {
    return this.api.listLicenseDevices(id);
  }

  enableLicense(id: string, req: LicenseActionRequest): Promise<APIResponse> {
    return this.api.enableLicense(id, req);
  }

  disableLicense(id: string, req: LicenseActionRequest): Promise<APIResponse> {
    return this.api.disableLicense(id, req);
  }

  revokeLicense(id: string, req: LicenseActionRequest): Promise<APIResponse> {
    return this.api.revokeLicense(id, req);
  }

  activateLicense(req: ActivateLicenseRequest): Promise<APIResponse> {
    return this.api.activateLicense(req);
  }

  refreshLicense(req: RefreshLicenseRequest): Promise<APIResponse> {
    return this.api.refreshLicense(req);
  }
}
