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

export interface IntegraDTEAPI {
  getHealth(): Promise<HealthResponse>;
  /** @deprecated Usa `OnboardingClient.login`. Se quitará en la próxima versión mayor. */
  login(req: LoginRequest): Promise<LoginResponse>;
  /** @deprecated Usa `OnboardingClient.createFirstBusiness`. Se quitará en la próxima versión mayor. */
  createFirstBusiness(req: CreateFirstBusinessRequest, xUserKey: string): Promise<CreateFirstBusinessResponse>;
  createDocument(req: CreateDocumentRequest): Promise<APIResponse>;
  listDocuments(filters?: DocumentFilters): Promise<APIResponse>;
  getDocument(id: string): Promise<APIResponse>;
  updateDocument(id: string, req: UpdateDocumentRequest): Promise<UpdateDocumentResponse>;
  getDocumentStats(filters?: DocumentFilters): Promise<APIResponse>;
  requeueDocument(req: RequeueDocumentRequest): Promise<APIResponse>;
  requeueOfflineDocumentStatus(req: RequeueDocumentRequest): Promise<APIResponse>;
  createCession(req: CreateCessionRequest): Promise<APIResponse>;
  requeueCession(req: RequeueCessionRequest): Promise<RequeueCessionResponse>;
  listCessions(filters?: CessionFilters): Promise<ListCessionsResponse>;
  getCession(id: string): Promise<CessionResponse>;
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
  requeuePurchase(req: RequeuePurchaseRequest): Promise<RequeuePurchaseResponse>;
  listPurchaseAcknowledgments(filters?: PurchaseAcknowledgmentFilters): Promise<APIResponse>;
  getBillingBalance(): Promise<APIResponse>;
  listBillingPayments(filters?: BillingPaymentFilters): Promise<APIResponse>;
  listBillingCharges(filters?: BillingChargeFilters): Promise<ListBillingChargesResponse>;
  listBillingPlans(): Promise<ListBillingPlansResponse>;
  listBillingInvoices(filters?: BillingInvoiceFilters): Promise<ListBillingInvoicesResponse>;
  previewSubscriptionUpgrade(planID: string): Promise<SubscriptionUpgradePreviewResponse>;
  getConsumption(): Promise<ConsumptionResponse>;
  listConsumptionOverages(filters?: ConsumptionOverageFilters): Promise<ListConsumptionOveragesResponse>;
  listConsumptionOperations(filters?: ConsumptionOperationFilters): Promise<ListConsumptionOperationsResponse>;
  getNumerationSummary(): Promise<APIResponse>;
  getLastUsedFolio(codeSII: string): Promise<APIResponse>;
  listNumerationRanges(filters?: NumerationRangeFilters): Promise<ListNumerationRangesResponse>;
  uploadNumeration(req: UploadNumerationRequest): Promise<APIResponse>;
  deleteNumeration(id: string, options?: IdempotentRequest): Promise<APIResponse>;
  updateNumerationNextNumber(
    numerationID: string,
    req: UpdateNumerationNextNumberRequest
  ): Promise<UpdateNumerationNextNumberResponse>;
  updateLowStockConfig(req: UpdateLowStockConfigRequest): Promise<UpdateLowStockConfigResponse>;
  requestNumbers(req: RequestNumbersRequest): Promise<FolioRange[]>;
}
