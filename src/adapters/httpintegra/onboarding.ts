import type { APIResponse, CreateFirstBusinessRequest, LoginRequest } from '../../domain/types.js';
import { APIError, DEFAULT_BASE_URL } from './client.js';

export interface OnboardingClientConfig {
  baseURL?: string;
  fetchFn?: typeof fetch;
  userAgent?: string;
}

/**
 * OnboardingClient cubre el flujo de arranque (bootstrap) de un usuario que aún
 * NO tiene un x-api-key:
 *
 *   1. `login(email, password)` -> devuelve un `x-user-key` (credencial de usuario).
 *   2. `createFirstBusiness(req, xUserKey)` -> crea la PRIMERA empresa y devuelve
 *      el `x-api-key` con el que se opera de ahí en adelante (usando `Client`).
 *
 * A diferencia de `Client`, no requiere apiKey: se usa justo antes de tenerlo.
 */
export class OnboardingClient {
  private readonly fetchFn: typeof fetch;
  private readonly baseURL: string;
  private readonly userAgent: string;

  constructor(config: OnboardingClientConfig = {}) {
    this.baseURL = (config.baseURL ?? DEFAULT_BASE_URL).replace(/\/+$/, '');

    if (!isValidURL(this.baseURL)) {
      throw new Error('integradte: invalid base URL');
    }

    this.fetchFn = config.fetchFn ?? fetch;
    this.userAgent = config.userAgent?.trim() || '@integradte/sdk/0.1.0';
  }

  /**
   * Valida email + password de un usuario existente y devuelve el x-user-key.
   * `data` sigue la forma de {@link LoginResponseData}.
   */
  async login(req: LoginRequest): Promise<APIResponse> {
    return this.doJSON('POST', '/api/v1/auth/login', req);
  }

  /**
   * Crea la primera empresa del usuario autenticado con su x-user-key. Solo
   * funciona si el usuario no tiene empresas todavía (si no, la API responde 409).
   * La respuesta incluye `data.apiToken.xApiKey`, el x-api-key para operar luego.
   */
  async createFirstBusiness(req: CreateFirstBusinessRequest, xUserKey: string): Promise<APIResponse> {
    if (!xUserKey?.trim()) {
      throw new Error('integradte: x-user-key is required');
    }
    return this.doJSON('POST', '/api/v1/onboarding/businesses', req, { 'x-user-key': xUserKey });
  }

  private async doJSON(
    method: string,
    route: string,
    body?: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<APIResponse> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': this.userAgent,
      ...extraHeaders
    };

    let payload: string | undefined;
    if (body !== undefined && body !== null) {
      headers['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
    }

    const url = new URL(route, `${this.baseURL}/`).toString();
    const response = await this.fetchFn(url, { method, headers, body: payload });
    const rawBody = await response.text();

    if (!response.ok) {
      throw new APIError(response.status, rawBody);
    }

    if (!rawBody) {
      return {};
    }

    try {
      return JSON.parse(rawBody) as APIResponse;
    } catch (error) {
      throw new Error(`integradte: decode response: ${(error as Error).message}`);
    }
  }
}

function isValidURL(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}
