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
} from '../../domain/types.js';
import type { IntegraDTEAPI } from '../../ports/api.js';

export const DEFAULT_BASE_URL = 'https://api.integradte.cl';

export interface ClientConfig {
  apiKey: string;
  baseURL?: string;
  fetchFn?: typeof fetch;
  userAgent?: string;
}

export class APIError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: string
  ) {
    super(`integradte: status=${statusCode} body=${body}`);
    this.name = 'APIError';
  }
}

export class Client implements IntegraDTEAPI {
  private readonly fetchFn: typeof fetch;
  private readonly baseURL: string;
  private readonly userAgent: string;

  constructor(private readonly config: ClientConfig) {
    if (!config.apiKey?.trim()) {
      throw new Error('integradte: API key is required');
    }

    this.baseURL = (config.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');

    if (!isValidURL(this.baseURL)) {
      throw new Error('integradte: invalid base URL');
    }

    this.fetchFn = config.fetchFn ?? fetch;
    this.userAgent = config.userAgent?.trim() || '@integradte/sdk/0.1.0';
  }

  async createDocument(req: CreateDocumentRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/documents', undefined, stripIdempotency(req), withIdempotency(req.idempotencyKey));
  }

  async listDocuments(filters?: DocumentFilters): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/documents', toQuery(filters));
  }

  async getDocument(id: string): Promise<APIResponse> {
    return this.doJSON('GET', `/api/v1/documents/${encodeURIComponent(id)}`);
  }

  async getDocumentStats(filters?: DocumentFilters): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/documents/stats', toQuery(filters));
  }

  async syncDocument(req: SyncDocumentRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/documents/sync', undefined, req);
  }

  async requeueDocument(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/documents/requeue', undefined, req);
  }

  async requeueOfflineDocument(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/documents/requeue/offline', undefined, req);
  }

  async requeueOfflineDocumentStatus(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/documents/requeue/status', undefined, req);
  }

  async createCession(req: CreateCessionRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/cessions', undefined, stripIdempotency(req), withIdempotency(req.idempotencyKey));
  }

  async generatePDF(req: GeneratePDFRequest, cedible: boolean): Promise<APIResponse> {
    return this.doJSON(
      'POST',
      '/api/v1/pdfs/generate',
      { cedible: String(cedible) },
      stripIdempotency(req),
      withIdempotency(req.idempotencyKey)
    );
  }

  async listBusinesses(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/businesses');
  }

  async createBusiness(req: CreateBusinessRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/businesses', undefined, stripIdempotency(req), withIdempotency(req.idempotencyKey));
  }

  async getBusiness(id: string): Promise<APIResponse> {
    return this.doJSON('GET', `/api/v1/businesses/${encodeURIComponent(id)}`);
  }

  async updateBusiness(id: string, req: UpdateBusinessRequest): Promise<APIResponse> {
    return this.doJSON(
      'PUT',
      `/api/v1/businesses/${encodeURIComponent(id)}`,
      undefined,
      stripIdempotency(req),
      withIdempotency(req.idempotencyKey)
    );
  }

  async enableProductionMode(req: ProductionModeRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/businesses/production-mode', undefined, req);
  }

  async enableCertificationMode(): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/businesses/certification-mode');
  }

  async uploadCertificate(businessID: string, req: UploadCertificateRequest): Promise<APIResponse> {
    return this.doJSON('PUT', `/api/v1/business/${businessID}/certificate`, undefined, req);
  }

  async getCertificateInfo(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/business/certificate-info');
  }

  async getCurrentCertificate(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/certificates/current');
  }

  async getMe(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/users/me');
  }

  async createPurchase(req: CreatePurchaseRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/purchases', undefined, stripIdempotency(req), withIdempotency(req.idempotencyKey));
  }

  async listPurchaseAcknowledgments(filters?: PurchaseAcknowledgmentFilters): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/purchase-acknowledgments', toQuery(filters));
  }

  async getBillingBalance(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/billing/balance');
  }

  async listBillingPayments(filters?: BillingPaymentFilters): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/billing/payments', toQuery(filters));
  }

  async getNumerationSummary(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/numerations/summary');
  }

  async getLastUsedFolio(codeSII: string): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/numerations/last-used-number', { code_sii: codeSII });
  }

  async uploadNumeration(req: UploadNumerationRequest): Promise<APIResponse> {
    return this.doJSON('PUT', '/api/v1/numerations', undefined, req);
  }

  async deleteNumeration(id: string): Promise<APIResponse> {
    return this.doJSON('DELETE', `/api/v1/numerations/${encodeURIComponent(id)}`);
  }

  async requestNumbers(req: RequestNumbersRequest): Promise<FolioRange[]> {
    return this.doJSON<FolioRange[]>('POST', '/v1/numbers/request', undefined, req);
  }

  async requestNumerations(req: RequestNumerationsRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/numerations/request-rabbitmq', undefined, req);
  }

  async createLicense(req: CreateLicenseRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/licenses', undefined, req);
  }

  async listLicenses(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/licenses');
  }

  async getLicense(id: string): Promise<APIResponse> {
    return this.doJSON('GET', `/api/v1/licenses/${encodeURIComponent(id)}`);
  }

  async listLicenseDevices(id: string): Promise<APIResponse> {
    return this.doJSON('GET', `/api/v1/licenses/${encodeURIComponent(id)}/devices`);
  }

  async enableLicense(id: string, req: LicenseActionRequest): Promise<APIResponse> {
    return this.doJSON('POST', `/api/v1/licenses/${encodeURIComponent(id)}/enable`, undefined, req);
  }

  async disableLicense(id: string, req: LicenseActionRequest): Promise<APIResponse> {
    return this.doJSON('POST', `/api/v1/licenses/${encodeURIComponent(id)}/disable`, undefined, req);
  }

  async revokeLicense(id: string, req: LicenseActionRequest): Promise<APIResponse> {
    return this.doJSON('POST', `/api/v1/licenses/${encodeURIComponent(id)}/revoke`, undefined, req);
  }

  async activateLicense(req: ActivateLicenseRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/licenses/activate', undefined, req);
  }

  async refreshLicense(req: RefreshLicenseRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/licenses/refresh', undefined, req);
  }

  private buildURL(route: string, query?: Record<string, string>): string {
    const url = new URL(route, `${this.baseURL}/`);
    if (query) {
      for (const [key, value] of Object.entries(query)) {
        url.searchParams.set(key, value);
      }
    }
    return url.toString();
  }

  private async doJSON<T = APIResponse>(
    method: string,
    route: string,
    query?: Record<string, string>,
    body?: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<T> {
    const headers: Record<string, string> = {
      'x-api-key': this.config.apiKey,
      Accept: 'application/json',
      'User-Agent': this.userAgent,
      ...extraHeaders
    };

    let payload: string | undefined;
    if (body !== undefined && body !== null) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    const response = await this.fetchFn(this.buildURL(route, query), {
      method,
      headers,
      body: payload
    });

    const rawBody = await response.text();

    if (!response.ok) {
      throw new APIError(response.status, rawBody);
    }

    if (!rawBody) {
      return {} as T;
    }

    try {
      return JSON.parse(rawBody) as T;
    } catch (error) {
      throw new Error(`integradte: decode response: ${(error as Error).message}`);
    }
  }
}

export function encodeDataDTE(value: unknown): string {
  return JSON.stringify(value);
}

function withIdempotency(idempotencyKey?: string): Record<string, string> | undefined {
  if (!idempotencyKey?.trim()) {
    return undefined;
  }
  return { 'idempotency-key': idempotencyKey };
}

function stripIdempotency<T extends { idempotencyKey?: string }>(value: T): Omit<T, 'idempotencyKey'> {
  const { idempotencyKey: _, ...rest } = value;
  return rest;
}

function toQuery(value?: object): Record<string, string> | undefined {
  if (!value) {
    return undefined;
  }

  const query = Object.fromEntries(
    Object.entries(value)
      .filter(([, item]) => item !== undefined && item !== null)
      .map(([key, item]) => [key, String(item)])
  );

  return Object.keys(query).length > 0 ? query : undefined;
}

function isValidURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
