import type {
  APIResponse,
  BillingChargeFilters,
  BillingInvoiceFilters,
  BillingPaymentFilters,
  CertificateInfoResponse,
  CessionFilters,
  CessionResponse,
  ConsumptionOperationFilters,
  ConsumptionOverageFilters,
  ConsumptionResponse,
  CreateBusinessRequest,
  CreateCessionRequest,
  CreateDocumentRequest,
  CreateFirstBusinessRequest,
  CreateFirstBusinessResponse,
  CreatePurchaseRequest,
  DocumentFilters,
  FolioRange,
  GeneratePDFRequest,
  HealthResponse,
  IdempotentRequest,
  ListBillingChargesResponse,
  ListBillingInvoicesResponse,
  ListBillingPlansResponse,
  ListCessionsResponse,
  ListConsumptionOperationsResponse,
  ListConsumptionOveragesResponse,
  ListNumerationRangesResponse,
  LoginRequest,
  LoginResponse,
  NumerationRangeFilters,
  ProductionModeRequest,
  PurchaseAcknowledgmentFilters,
  RequeueCessionRequest,
  RequeueCessionResponse,
  RequeueDocumentRequest,
  RequeuePurchaseRequest,
  RequeuePurchaseResponse,
  RequestNumbersRequest,
  SubscriptionUpgradePreviewResponse,
  UpdateBusinessRequest,
  UpdateDocumentRequest,
  UpdateDocumentResponse,
  UpdateLowStockConfigRequest,
  UpdateLowStockConfigResponse,
  UpdateNumerationNextNumberRequest,
  UpdateNumerationNextNumberResponse,
  UploadCertificateRequest,
  UploadNumerationRequest
} from '../domain/types.js';
import type { IntegraDTEAPI } from '../ports/api.js';

export class Service {
  constructor(private readonly api: IntegraDTEAPI) {}

  getHealth(): Promise<HealthResponse> {
    return this.api.getHealth();
  }

  login(req: LoginRequest): Promise<LoginResponse> {
    return this.api.login(req);
  }

  createFirstBusiness(req: CreateFirstBusinessRequest, xUserKey: string): Promise<CreateFirstBusinessResponse> {
    return this.api.createFirstBusiness(req, xUserKey);
  }

  createDocument(req: CreateDocumentRequest): Promise<APIResponse> {
    return this.api.createDocument(req);
  }

  listDocuments(filters?: DocumentFilters): Promise<APIResponse> {
    return this.api.listDocuments(filters);
  }

  getDocument(id: string): Promise<APIResponse> {
    return this.api.getDocument(id);
  }

  updateDocument(id: string, req: UpdateDocumentRequest): Promise<UpdateDocumentResponse> {
    return this.api.updateDocument(id, req);
  }

  getDocumentStats(filters?: DocumentFilters): Promise<APIResponse> {
    return this.api.getDocumentStats(filters);
  }

  requeueDocument(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.api.requeueDocument(req);
  }

  requeueOfflineDocumentStatus(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.api.requeueOfflineDocumentStatus(req);
  }

  createCession(req: CreateCessionRequest): Promise<APIResponse> {
    return this.api.createCession(req);
  }

  requeueCession(req: RequeueCessionRequest): Promise<RequeueCessionResponse> {
    return this.api.requeueCession(req);
  }

  listCessions(filters?: CessionFilters): Promise<ListCessionsResponse> {
    return this.api.listCessions(filters);
  }

  getCession(id: string): Promise<CessionResponse> {
    return this.api.getCession(id);
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

  getCertificateInfo(): Promise<CertificateInfoResponse> {
    return this.api.getCertificateInfo();
  }

  getMe(): Promise<APIResponse> {
    return this.api.getMe();
  }

  createPurchase(req: CreatePurchaseRequest): Promise<APIResponse> {
    return this.api.createPurchase(req);
  }

  requeuePurchase(req: RequeuePurchaseRequest): Promise<RequeuePurchaseResponse> {
    return this.api.requeuePurchase(req);
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

  listBillingCharges(filters?: BillingChargeFilters): Promise<ListBillingChargesResponse> {
    return this.api.listBillingCharges(filters);
  }

  listBillingPlans(): Promise<ListBillingPlansResponse> {
    return this.api.listBillingPlans();
  }

  listBillingInvoices(filters?: BillingInvoiceFilters): Promise<ListBillingInvoicesResponse> {
    return this.api.listBillingInvoices(filters);
  }

  previewSubscriptionUpgrade(planID: string): Promise<SubscriptionUpgradePreviewResponse> {
    return this.api.previewSubscriptionUpgrade(planID);
  }

  getConsumption(): Promise<ConsumptionResponse> {
    return this.api.getConsumption();
  }

  listConsumptionOverages(filters?: ConsumptionOverageFilters): Promise<ListConsumptionOveragesResponse> {
    return this.api.listConsumptionOverages(filters);
  }

  listConsumptionOperations(filters?: ConsumptionOperationFilters): Promise<ListConsumptionOperationsResponse> {
    return this.api.listConsumptionOperations(filters);
  }

  getNumerationSummary(): Promise<APIResponse> {
    return this.api.getNumerationSummary();
  }

  getLastUsedFolio(codeSII: string): Promise<APIResponse> {
    return this.api.getLastUsedFolio(codeSII);
  }

  listNumerationRanges(filters?: NumerationRangeFilters): Promise<ListNumerationRangesResponse> {
    return this.api.listNumerationRanges(filters);
  }

  uploadNumeration(req: UploadNumerationRequest): Promise<APIResponse> {
    return this.api.uploadNumeration(req);
  }

  deleteNumeration(id: string, options?: IdempotentRequest): Promise<APIResponse> {
    return this.api.deleteNumeration(id, options);
  }

  updateNumerationNextNumber(
    numerationID: string,
    req: UpdateNumerationNextNumberRequest
  ): Promise<UpdateNumerationNextNumberResponse> {
    return this.api.updateNumerationNextNumber(numerationID, req);
  }

  updateLowStockConfig(req: UpdateLowStockConfigRequest): Promise<UpdateLowStockConfigResponse> {
    return this.api.updateLowStockConfig(req);
  }

  requestNumbers(req: RequestNumbersRequest): Promise<FolioRange[]> {
    return this.api.requestNumbers(req);
  }
}
