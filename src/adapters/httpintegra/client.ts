import { randomUUID } from 'node:crypto';

import type {
  APIErrorBody,
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
  FieldError,
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
  private parsedBody?: APIErrorBody | null;

  constructor(
    public readonly statusCode: number,
    public readonly body: string
  ) {
    super(`integradte: status=${statusCode} body=${body}`);
    this.name = 'APIError';
  }

  /**
   * Body de error parseado como JSON (memoizado). Devuelve null si el body no es
   * JSON válido (p. ej. un 500 pelado sin cuerpo estructurado).
   */
  get parsed(): APIErrorBody | null {
    if (this.parsedBody === undefined) {
      try {
        this.parsedBody = JSON.parse(this.body) as APIErrorBody;
      } catch {
        this.parsedBody = null;
      }
    }
    return this.parsedBody;
  }

  /** Mensaje legible que devolvió la API, si vino. */
  get apiMessage(): string | undefined {
    return this.parsed?.message;
  }

  /**
   * Errores de validación campo a campo, normalizados. La API los manda de dos formas:
   *
   * - 400 (validación del body): en `details.errors`, con `field`, `tag`, `value` y `message`.
   * - 422 (validación del DTE en POST /documents): en `details`, arreglo plano de
   *   `field` y `message`.
   *
   * Devuelve [] si no hay detalle, para poder iterar sin chequear null.
   */
  get details(): FieldError[] {
    const details: unknown = this.parsed?.details;
    if (Array.isArray(details)) {
      return details as FieldError[];
    }
    if (APIError.isValidationReport(details)) {
      return details.errors;
    }
    return [];
  }

  /**
   * true si es un error de validación que el integrador puede corregir, con el
   * motivo en `details` y `apiMessage`:
   *
   * - 422: validación del DTE en POST /documents.
   * - 400 que trae el reporte del validador en `details` (`details.errors`).
   *
   * Otros 400 (p. ej. "invalid request body" o "idempotency-key header is required")
   * y los 5xx no son errores de validación.
   */
  isValidationError(): boolean {
    if (this.statusCode === 422) {
      return true;
    }
    return this.statusCode === 400 && APIError.isValidationReport(this.parsed?.details);
  }

  /** Reporte del validador (`ValidationErrorDetails`): un objeto con `errors` como arreglo. */
  private static isValidationReport(value: unknown): value is { errors: FieldError[] } {
    return typeof value === 'object' && value !== null && Array.isArray((value as { errors?: unknown }).errors);
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

  /** GET /api/v1/health, sin autenticación. Devuelve el JSON crudo, sin envelope. */
  async getHealth(): Promise<HealthResponse> {
    return this.send<HealthResponse>('GET', '/api/v1/health', undefined, undefined, {});
  }

  /**
   * Valida email + password y devuelve el x-user-key en `data.xUserKey`. Va sin
   * autenticación: no envía el x-api-key configurado.
   *
   * @deprecated Usa `OnboardingClient.login`, el punto de entrada del bootstrap: no
   * pide un x-api-key, que justamente todavía no se tiene. Se mantiene por
   * compatibilidad con 0.9.0 y se quitará en la próxima versión mayor.
   */
  async login(req: LoginRequest): Promise<LoginResponse> {
    return this.send<LoginResponse>('POST', '/api/v1/auth/login', undefined, req, {});
  }

  /**
   * Crea la primera empresa del usuario. Se autentica con el `xUserKey` de esta
   * llamada en vez del x-api-key configurado. La respuesta trae
   * `data.apiToken.xApiKey`, el x-api-key para operar desde ahí.
   *
   * @deprecated Usa `OnboardingClient.createFirstBusiness`, el punto de entrada del
   * bootstrap. Se mantiene por compatibilidad con 0.9.0 y se quitará en la próxima
   * versión mayor.
   */
  async createFirstBusiness(req: CreateFirstBusinessRequest, xUserKey: string): Promise<CreateFirstBusinessResponse> {
    if (!xUserKey?.trim()) {
      throw new Error('integradte: x-user-key is required');
    }
    return this.send<CreateFirstBusinessResponse>('POST', '/api/v1/onboarding/businesses', undefined, req, {
      'x-user-key': xUserKey
    });
  }

  async createDocument(req: CreateDocumentRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/documents', undefined, stripIdempotency(req), requiredIdempotency(req.idempotencyKey));
  }

  async listDocuments(filters?: DocumentFilters): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/documents', toQuery(filters));
  }

  async getDocument(id: string): Promise<APIResponse> {
    return this.doJSON('GET', `/api/v1/documents/${encodeURIComponent(id)}`);
  }

  /**
   * Reemplaza el DTE de un documento que el SII todavía no recibió. La API no guarda
   * esta respuesta para idempotencia: reintentar con la misma clave responde 500.
   */
  async updateDocument(id: string, req: UpdateDocumentRequest): Promise<UpdateDocumentResponse> {
    return this.doJSON<UpdateDocumentResponse>(
      'PUT',
      `/api/v1/documents/${encodeURIComponent(id)}`,
      undefined,
      stripIdempotency(req),
      requiredIdempotency(req.idempotencyKey)
    );
  }

  async getDocumentStats(filters?: DocumentFilters): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/documents/stats', toQuery(filters));
  }

  async requeueDocument(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/documents/requeue', undefined, req);
  }

  async requeueOfflineDocumentStatus(req: RequeueDocumentRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/documents/requeue/status', undefined, req);
  }

  async createCession(req: CreateCessionRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/cessions', undefined, stripIdempotency(req), requiredIdempotency(req.idempotencyKey));
  }

  async requeueCession(req: RequeueCessionRequest): Promise<RequeueCessionResponse> {
    return this.doJSON<RequeueCessionResponse>('POST', '/api/v1/cessions/requeue', undefined, req);
  }

  async listCessions(filters?: CessionFilters): Promise<ListCessionsResponse> {
    return this.doJSON<ListCessionsResponse>('GET', '/api/v1/cessions', toQuery(filters));
  }

  async getCession(id: string): Promise<CessionResponse> {
    return this.doJSON<CessionResponse>('GET', `/api/v1/cessions/${encodeURIComponent(id)}`);
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
    return this.doJSON('POST', '/api/v1/businesses', undefined, stripIdempotency(req), requiredIdempotency(req.idempotencyKey));
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
      requiredIdempotency(req.idempotencyKey)
    );
  }

  async enableProductionMode(req: ProductionModeRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/businesses/production-mode', undefined, req);
  }

  async enableCertificationMode(): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/businesses/certification-mode');
  }

  async uploadCertificate(businessID: string, req: UploadCertificateRequest): Promise<APIResponse> {
    return this.doJSON(
      'PUT',
      `/api/v1/business/${businessID}/certificate`,
      undefined,
      stripIdempotency(req),
      requiredIdempotency(req.idempotencyKey)
    );
  }

  /**
   * Indica si la empresa puede firmar: `data.has_valid_certificate` es true solo si tiene
   * certificado, abre con su contraseña guardada y no está vencido. Sin certificado
   * responde 200 con false (no lanza APIError).
   */
  async getCertificateInfo(): Promise<CertificateInfoResponse> {
    return this.doJSON<CertificateInfoResponse>('GET', '/api/v1/business/certificate-info');
  }

  async getMe(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/users/me');
  }

  async createPurchase(req: CreatePurchaseRequest): Promise<APIResponse> {
    return this.doJSON(
      'POST',
      '/api/v1/purchase-acknowledgments',
      undefined,
      stripIdempotency(req),
      requiredIdempotency(req.idempotencyKey)
    );
  }

  async requeuePurchase(req: RequeuePurchaseRequest): Promise<RequeuePurchaseResponse> {
    return this.doJSON<RequeuePurchaseResponse>('POST', '/api/v1/purchase-acknowledgments/requeue', undefined, req);
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

  async listBillingCharges(filters?: BillingChargeFilters): Promise<ListBillingChargesResponse> {
    return this.doJSON<ListBillingChargesResponse>('GET', '/api/v1/billing/charges', toQuery(filters));
  }

  async listBillingPlans(): Promise<ListBillingPlansResponse> {
    return this.doJSON<ListBillingPlansResponse>('GET', '/api/v1/billing/plans');
  }

  async listBillingInvoices(filters?: BillingInvoiceFilters): Promise<ListBillingInvoicesResponse> {
    return this.doJSON<ListBillingInvoicesResponse>('GET', '/api/v1/billing/invoices', toQuery(filters));
  }

  /** Cotiza un upgrade de plan. `planID` acepta el id del plan o su `code`. No cobra nada. */
  async previewSubscriptionUpgrade(planID: string): Promise<SubscriptionUpgradePreviewResponse> {
    return this.doJSON<SubscriptionUpgradePreviewResponse>('GET', '/api/v1/billing/subscription/upgrade/preview', {
      plan_id: planID
    });
  }

  async getConsumption(): Promise<ConsumptionResponse> {
    return this.doJSON<ConsumptionResponse>('GET', '/api/v1/consumption');
  }

  async listConsumptionOverages(filters?: ConsumptionOverageFilters): Promise<ListConsumptionOveragesResponse> {
    return this.doJSON<ListConsumptionOveragesResponse>('GET', '/api/v1/consumption/overages', toQuery(filters));
  }

  async listConsumptionOperations(filters?: ConsumptionOperationFilters): Promise<ListConsumptionOperationsResponse> {
    return this.doJSON<ListConsumptionOperationsResponse>('GET', '/api/v1/consumption/operations', toQuery(filters));
  }

  async getNumerationSummary(): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/numerations/summary');
  }

  async getLastUsedFolio(codeSII: string): Promise<APIResponse> {
    return this.doJSON('GET', '/api/v1/numerations/last-used-number', { code_sii: codeSII });
  }

  async listNumerationRanges(filters?: NumerationRangeFilters): Promise<ListNumerationRangesResponse> {
    return this.doJSON<ListNumerationRangesResponse>('GET', '/api/v1/numerations/ranges', toQuery(filters));
  }

  async uploadNumeration(req: UploadNumerationRequest): Promise<APIResponse> {
    return this.doJSON('PUT', '/api/v1/numerations', undefined, stripIdempotency(req), requiredIdempotency(req.idempotencyKey));
  }

  async deleteNumeration(id: string, options?: IdempotentRequest): Promise<APIResponse> {
    return this.doJSON(
      'DELETE',
      `/api/v1/numerations/${encodeURIComponent(id)}`,
      undefined,
      undefined,
      requiredIdempotency(options?.idempotencyKey)
    );
  }

  /**
   * Fija el folio que recibirá el próximo documento de un rango CAF. `numerationID` es el
   * `ranges[].id` de listNumerationRanges, no el id de la numeración.
   */
  async updateNumerationNextNumber(
    numerationID: string,
    req: UpdateNumerationNextNumberRequest
  ): Promise<UpdateNumerationNextNumberResponse> {
    return this.doJSON<UpdateNumerationNextNumberResponse>(
      'PATCH',
      `/api/v1/numerations/${encodeURIComponent(numerationID)}/next-number`,
      undefined,
      stripIdempotency(req),
      requiredIdempotency(req.idempotencyKey)
    );
  }

  /** Configura los umbrales de folios bajos. Se mezcla por `code_sii` con lo que ya había. */
  async updateLowStockConfig(req: UpdateLowStockConfigRequest): Promise<UpdateLowStockConfigResponse> {
    return this.doJSON<UpdateLowStockConfigResponse>(
      'PATCH',
      '/api/v1/numerations/low-stock',
      undefined,
      stripIdempotency(req),
      requiredIdempotency(req.idempotencyKey)
    );
  }

  async requestNumbers(req: RequestNumbersRequest): Promise<FolioRange[]> {
    return this.doJSON<FolioRange[]>('POST', '/api/v1/numerations/request', undefined, req);
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

  /** Request autenticada con el x-api-key configurado. */
  private doJSON<T = APIResponse>(
    method: string,
    route: string,
    query?: Record<string, string>,
    body?: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<T> {
    return this.send<T>(method, route, query, body, { 'x-api-key': this.config.apiKey, ...extraHeaders });
  }

  /**
   * Envía la request con los headers de autenticación que recibe: el x-api-key, el
   * x-user-key del bootstrap o ninguno (rutas públicas).
   */
  private async send<T>(
    method: string,
    route: string,
    query: Record<string, string> | undefined,
    body: unknown,
    authHeaders: Record<string, string>
  ): Promise<T> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': this.userAgent,
      ...authHeaders
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

/** Header opcional: solo se envía si el integrador pasó una clave. */
function withIdempotency(idempotencyKey?: string): Record<string, string> | undefined {
  if (!idempotencyKey?.trim()) {
    return undefined;
  }
  return { 'idempotency-key': idempotencyKey };
}

/**
 * Header para las rutas con IdempotencyMiddleware, que lo exigen (sin él responden 400).
 * Usa la clave del integrador si viene; si no, genera un UUID nuevo en cada llamada.
 */
function requiredIdempotency(idempotencyKey?: string): Record<string, string> {
  return { 'idempotency-key': idempotencyKey?.trim() ? idempotencyKey : randomUUID() };
}

/** La clave viaja como header, nunca en el body. */
function stripIdempotency<T extends IdempotentRequest>(value: T): Omit<T, 'idempotencyKey'> {
  const body: Partial<T> = { ...value };
  delete body.idempotencyKey;
  return body as Omit<T, 'idempotencyKey'>;
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
