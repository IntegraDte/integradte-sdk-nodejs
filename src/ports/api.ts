import type {
  APIResponse,
  CreateBusinessRequest,
  CreateCessionRequest,
  CreateDocumentRequest,
  CreatePurchaseRequest,
  GeneratePDFRequest,
  UpdateBusinessRequest,
  UploadCertificateRequest,
  UploadNumerationRequest
} from '../domain/types.js';

export interface IntegraFacturacionAPI {
  createDocument(req: CreateDocumentRequest): Promise<APIResponse>;
  getDocument(id: string): Promise<APIResponse>;
  getDocumentStats(): Promise<APIResponse>;
  createCession(req: CreateCessionRequest): Promise<APIResponse>;
  generatePDF(req: GeneratePDFRequest, cedible: boolean): Promise<APIResponse>;
  createBusiness(req: CreateBusinessRequest): Promise<APIResponse>;
  updateBusiness(id: string, req: UpdateBusinessRequest): Promise<APIResponse>;
  uploadCertificate(businessID: string, req: UploadCertificateRequest): Promise<APIResponse>;
  getCertificateInfo(): Promise<APIResponse>;
  getMe(): Promise<APIResponse>;
  createPurchase(req: CreatePurchaseRequest): Promise<APIResponse>;
  getNumerationSummary(): Promise<APIResponse>;
  getLastUsedFolio(codeSII: string): Promise<APIResponse>;
  uploadNumeration(req: UploadNumerationRequest): Promise<APIResponse>;
  deleteNumeration(id: string): Promise<APIResponse>;
}
