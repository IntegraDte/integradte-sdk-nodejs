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
import type { IntegraDTEAPI } from '../ports/api.js';

export class Service {
  constructor(private readonly api: IntegraDTEAPI) {}

  createDocument(req: CreateDocumentRequest): Promise<APIResponse> {
    return this.api.createDocument(req);
  }

  getDocument(id: string): Promise<APIResponse> {
    return this.api.getDocument(id);
  }

  getDocumentStats(): Promise<APIResponse> {
    return this.api.getDocumentStats();
  }

  createCession(req: CreateCessionRequest): Promise<APIResponse> {
    return this.api.createCession(req);
  }

  generatePDF(req: GeneratePDFRequest, cedible: boolean): Promise<APIResponse> {
    return this.api.generatePDF(req, cedible);
  }

  createBusiness(req: CreateBusinessRequest): Promise<APIResponse> {
    return this.api.createBusiness(req);
  }

  updateBusiness(id: string, req: UpdateBusinessRequest): Promise<APIResponse> {
    return this.api.updateBusiness(id, req);
  }

  uploadCertificate(businessID: string, req: UploadCertificateRequest): Promise<APIResponse> {
    return this.api.uploadCertificate(businessID, req);
  }

  getCertificateInfo(): Promise<APIResponse> {
    return this.api.getCertificateInfo();
  }

  getMe(): Promise<APIResponse> {
    return this.api.getMe();
  }

  createPurchase(req: CreatePurchaseRequest): Promise<APIResponse> {
    return this.api.createPurchase(req);
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
}
