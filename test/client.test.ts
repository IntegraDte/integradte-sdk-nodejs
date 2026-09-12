import { describe, expect, it } from 'vitest';

import { APIError, Client } from '../src/adapters/httpintegra/client.js';
import { Service } from '../src/application/service.js';
import type { CreateDocumentRequest } from '../src/domain/types.js';

describe('Client', () => {
  it('sends required headers for createDocument', async () => {
    let headers: Headers | undefined;

    const client = new Client({
      apiKey: 'test-key',
      baseURL: 'https://example.test',
      fetchFn: async (_input, init) => {
        headers = new Headers(init?.headers as HeadersInit);

        return new Response(JSON.stringify({ ok: true }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    });

    const request: CreateDocumentRequest = {
      code_sii: '33',
      data_dte: '{"foo":"bar"}',
      idempotencyKey: 'idem-123'
    };

    await client.createDocument(request);

    expect(headers?.get('x-api-key')).toBe('test-key');
    expect(headers?.get('idempotency-key')).toBe('idem-123');
  });

  it('sends code_sii query for getLastUsedFolio', async () => {
    let calledURL = '';

    const client = new Client({
      apiKey: 'test-key',
      baseURL: 'https://example.test',
      fetchFn: async (input) => {
        calledURL = input.toString();
        return new Response(JSON.stringify({ last: 123 }), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        });
      }
    });

    await client.getLastUsedFolio('33');

    expect(calledURL).toContain('/api/v1/numerations/last-used-number');
    expect(calledURL).toContain('code_sii=33');
  });

  it('serializes document filters', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.listDocuments({
      code_sii: '33',
      status: 'accepted',
      from_date: '2026-01-01',
      page: 2,
      limit: 50
    });

    const request = requests[0];
    expect(request?.method).toBe('GET');
    expect(request?.url).toBe(
      'https://example.test/api/v1/documents?code_sii=33&status=accepted&from_date=2026-01-01&page=2&limit=50'
    );
    expect(request?.headers.get('x-api-key')).toBe('test-key');
  });

  it('sends production mode data as JSON', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.enableProductionMode({
      resolution_number_dte: '80',
      resolution_date_dte: '2014-08-22',
      resolution_number_ticket: '81',
      resolution_ticket_date: '2014-08-23'
    });

    expect(requests[0]).toMatchObject({
      method: 'POST',
      url: 'https://example.test/api/v1/businesses/production-mode',
      body: JSON.stringify({
        resolution_number_dte: '80',
        resolution_date_dte: '2014-08-22',
        resolution_number_ticket: '81',
        resolution_ticket_date: '2014-08-23'
      })
    });
  });

  it('supports the new read endpoints and filters', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.listBusinesses();
    await client.getBusiness('business/1');
    await client.enableCertificationMode();
    await client.getDocumentStats({ to_date: '2026-02-23' });
    await client.getBillingBalance();
    await client.listBillingPayments({ status: 'COMPLETED', page: 1 });
    await client.listPurchaseAcknowledgments({ tipo_dte: '33', limit: 20 });

    expect(requests.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: 'GET', url: 'https://example.test/api/v1/businesses' },
      { method: 'GET', url: 'https://example.test/api/v1/businesses/business%2F1' },
      { method: 'POST', url: 'https://example.test/api/v1/businesses/certification-mode' },
      { method: 'GET', url: 'https://example.test/api/v1/documents/stats?to_date=2026-02-23' },
      { method: 'GET', url: 'https://example.test/api/v1/billing/balance' },
      { method: 'GET', url: 'https://example.test/api/v1/billing/payments?status=COMPLETED&page=1' },
      { method: 'GET', url: 'https://example.test/api/v1/purchase-acknowledgments?tipo_dte=33&limit=20' }
    ]);
  });

  it('returns has_valid_certificate from getCertificateInfo', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests, {
      success: true,
      message: 'certificate info retrieved successfully',
      data: { has_valid_certificate: true }
    });

    const response = await client.getCertificateInfo();

    expect(requests[0]).toMatchObject({
      method: 'GET',
      url: 'https://example.test/api/v1/business/certificate-info'
    });
    expect(response.data).toEqual({ has_valid_certificate: true });
  });

  it('resolves getCertificateInfo with false when the business has no certificate', async () => {
    const client = recordingClient([], {
      success: true,
      message: 'certificate info retrieved successfully',
      data: { has_valid_certificate: false }
    });

    const response = await client.getCertificateInfo();

    expect(response.data.has_valid_certificate).toBe(false);
  });

  it('requests numbers and returns the flat array response', async () => {
    const requests: RecordedRequest[] = [];
    const ranges = [{ document_type: 33, folio_inicial: 100, folio_final: 103, folio_xml_base64: 'BASE64' }];
    const client = recordingClient(requests, ranges);

    const response = await client.requestNumbers({ document_type: 33, quantity: 4 });

    expect(response).toEqual(ranges);
    expect(requests[0]).toMatchObject({
      method: 'POST',
      url: 'https://example.test/api/v1/numerations/request',
      body: JSON.stringify({ document_type: 33, quantity: 4 })
    });
  });

  it('creates a purchase acknowledgment with its idempotency key', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.createPurchase({
      xml_base64: 'BASE64',
      rut_emisor: '76123456-7',
      razon_social_emisor: 'Proveedor SpA',
      tipo_dte: '33',
      folio: 1234,
      mnt_total: '119000',
      fecha_emision: '2026-09-01',
      email_emisor: 'dte@proveedor.cl',
      accion_doc: 'ACD',
      idempotencyKey: 'idem-purchase-1'
    });

    expect(requests[0]).toMatchObject({
      method: 'POST',
      url: 'https://example.test/api/v1/purchase-acknowledgments'
    });
    expect(requests[0]?.headers.get('idempotency-key')).toBe('idem-purchase-1');
    expect(JSON.parse(String(requests[0]?.body))).not.toHaveProperty('idempotencyKey');
  });

  it('supports document requeues', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.requeueDocument({ document_id: 'online-id' });
    await client.requeueOfflineDocumentStatus({ document_id: 'offline-id' });

    expect(requests.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: 'POST', url: 'https://example.test/api/v1/documents/requeue' },
      { method: 'POST', url: 'https://example.test/api/v1/documents/requeue/status' }
    ]);
  });
});

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CALLER_KEY = '0191d2f0-7c2a-7b3e-9f4a-2d6c8e1b5a90';

const businessRequest = {
  businessName: 'Empresa Ejemplo SpA',
  rut: '12345678-9',
  activity: 'Desarrollo de software',
  address: 'Av. Principal 123',
  commune: 'Providencia',
  city: 'Santiago',
  emailDte: 'dte@empresa.cl',
  emailContact: 'contacto@empresa.cl',
  rutLegalAgent: '17240862-1',
  fullNameLegalAgent: 'Alejandro Jesus Cea Perez',
  resolutionNumberDte: '0',
  resolutionDateDte: '1992-12-31',
  resolutionNumberTicket: '0',
  resolutionTicketDate: '2014-05-27'
};

const purchaseRequest = {
  xml_base64: 'BASE64',
  rut_emisor: '76123456-7',
  razon_social_emisor: 'Proveedor SpA',
  tipo_dte: '33',
  folio: 1234,
  mnt_total: '119000',
  fecha_emision: '2026-09-01',
  email_emisor: 'dte@proveedor.cl',
  accion_doc: 'ACD'
};

/** Sin clave no agrega la propiedad: es el caso "el integrador no pasó nada". */
function idem(idempotencyKey?: string): { idempotencyKey?: string } {
  return idempotencyKey === undefined ? {} : { idempotencyKey };
}

type IdempotentCall = (client: Client, idempotencyKey?: string) => Promise<unknown>;

// Rutas que montan IdempotencyMiddleware en la API (internal/routes/private.routes.go).
// Sin el header responden 400 "idempotency-key header is required".
const idempotentRoutes: Array<[method: string, path: string, call: IdempotentCall]> = [
  ['POST', '/api/v1/documents', (c, key) => c.createDocument({ code_sii: '33', data_dte: '{}', ...idem(key) })],
  ['PUT', '/api/v1/documents/doc-1', (c, key) => c.updateDocument('doc-1', { data_dte: '{}', ...idem(key) })],
  ['POST', '/api/v1/businesses', (c, key) => c.createBusiness({ ...businessRequest, ...idem(key) })],
  ['PUT', '/api/v1/businesses/biz-1', (c, key) => c.updateBusiness('biz-1', { ...businessRequest, ...idem(key) })],
  [
    'PUT',
    '/api/v1/business/biz-1/certificate',
    (c, key) =>
      c.uploadCertificate('biz-1', {
        certificate: 'BASE64_PFX',
        password: 'clave',
        expired_date: '2027-01-31',
        ...idem(key)
      })
  ],
  [
    'PUT',
    '/api/v1/numerations',
    (c, key) =>
      c.uploadNumeration({
        code_sii: '33',
        start_number: 1,
        end_number: 100,
        caf_base64: 'BASE64',
        creation_date: '2026-01-01',
        due_date: '2026-07-01',
        ...idem(key)
      })
  ],
  [
    'DELETE',
    '/api/v1/numerations/num-1',
    (c, key) => (key === undefined ? c.deleteNumeration('num-1') : c.deleteNumeration('num-1', { idempotencyKey: key }))
  ],
  [
    'PATCH',
    '/api/v1/numerations/range-1/next-number',
    (c, key) => c.updateNumerationNextNumber('range-1', { next_number: 150, ...idem(key) })
  ],
  [
    'PATCH',
    '/api/v1/numerations/low-stock',
    (c, key) =>
      c.updateLowStockConfig({ items: [{ code_sii: '33', threshold: 20, request_quantity: 100 }], ...idem(key) })
  ],
  ['POST', '/api/v1/purchase-acknowledgments', (c, key) => c.createPurchase({ ...purchaseRequest, ...idem(key) })],
  [
    'POST',
    '/api/v1/cessions',
    (c, key) =>
      c.createCession({
        document_id: 'doc-1',
        factoring_code: '76000000-0',
        factoring_name: 'Factoring SpA',
        factoring_address: 'Av. Siempre Viva 742',
        factoring_email: 'cesiones@factoring.cl',
        ...idem(key)
      })
  ]
];

describe('Client idempotency-key', () => {
  it.each(idempotentRoutes)('generates a UUID for %s %s when the caller gives no key', async (method, path, call) => {
    const requests: RecordedRequest[] = [];

    await call(recordingClient(requests));

    const request = requests[0];
    expect(request).toMatchObject({ method, url: `https://example.test${path}` });
    expect(request?.headers.get('idempotency-key')).toMatch(UUID_PATTERN);
    expect(request?.headers.get('x-api-key')).toBe('test-key');
    if (request?.body) {
      expect(JSON.parse(String(request.body))).not.toHaveProperty('idempotencyKey');
    }
  });

  it.each(idempotentRoutes)('honors the caller key on %s %s', async (method, path, call) => {
    const requests: RecordedRequest[] = [];

    await call(recordingClient(requests), CALLER_KEY);

    const request = requests[0];
    expect(request).toMatchObject({ method, url: `https://example.test${path}` });
    expect(request?.headers.get('idempotency-key')).toBe(CALLER_KEY);
    if (request?.body) {
      expect(JSON.parse(String(request.body))).not.toHaveProperty('idempotencyKey');
    }
  });

  it('generates a fresh key per call and when the caller key is blank', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.createDocument({ code_sii: '33', data_dte: '{}' });
    await client.createDocument({ code_sii: '33', data_dte: '{}' });
    await client.createDocument({ code_sii: '33', data_dte: '{}', idempotencyKey: '   ' });

    const keys = requests.map((request) => request.headers.get('idempotency-key'));
    for (const key of keys) {
      expect(key).toMatch(UUID_PATTERN);
    }
    expect(new Set(keys).size).toBe(3);
  });

  it('does not add the header to routes without IdempotencyMiddleware', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.generatePDF({ document_id: 'doc-1' }, false);
    await client.requeuePurchase({ purchase_id: 'purchase-1' });
    await client.requeueCession({ cession_id: 'cession-1' });
    await client.listDocuments();

    for (const request of requests) {
      expect(request.headers.get('idempotency-key')).toBeNull();
    }
  });
});

describe('Client: salud, bootstrap, billing, consumo y cesiones', () => {
  it('reads /health without auth headers and returns the raw JSON', async () => {
    const requests: RecordedRequest[] = [];
    const health = { service: 'integradte-api-client', started_at: '2026-09-12T10:00:00Z', uptime_seconds: 1234 };
    const client = recordingClient(requests, health);

    const response = await client.getHealth();

    expect(response).toEqual(health);
    expect(requests[0]).toMatchObject({ method: 'GET', url: 'https://example.test/api/v1/health' });
    expect(requests[0]?.headers.get('x-api-key')).toBeNull();
  });

  it('logs in without x-api-key', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests, {
      success: true,
      message: 'login successful',
      data: { user_id: 'u1', email: 'user@x.cl', xUserKey: 'the-user-key' }
    });

    const response = await client.login({ email: 'user@x.cl', password: 'secreta' });

    expect(requests[0]).toMatchObject({
      method: 'POST',
      url: 'https://example.test/api/v1/auth/login',
      body: JSON.stringify({ email: 'user@x.cl', password: 'secreta' })
    });
    expect(requests[0]?.headers.get('x-api-key')).toBeNull();
    expect(requests[0]?.headers.get('x-user-key')).toBeNull();
    expect(response.data.xUserKey).toBe('the-user-key');
  });

  it('creates the first business with x-user-key instead of x-api-key', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests, {
      success: true,
      message: 'business created successfully',
      data: { id: 'biz-1', apiToken: { id: 'token-1', xApiKey: 'token-1' } }
    });

    const response = await client.createFirstBusiness(businessRequest, 'the-user-key');

    const request = requests[0];
    expect(request).toMatchObject({
      method: 'POST',
      url: 'https://example.test/api/v1/onboarding/businesses',
      body: JSON.stringify(businessRequest)
    });
    expect(request?.headers.get('x-user-key')).toBe('the-user-key');
    expect(request?.headers.get('x-api-key')).toBeNull();
    expect(request?.headers.get('idempotency-key')).toBeNull();
    expect(response.data.apiToken.xApiKey).toBe('token-1');
  });

  it('rejects createFirstBusiness without x-user-key', async () => {
    const requests: RecordedRequest[] = [];

    await expect(recordingClient(requests).createFirstBusiness(businessRequest, ' ')).rejects.toThrow(
      'x-user-key is required'
    );
    expect(requests).toHaveLength(0);
  });

  it('updates a document with PUT /documents/:id', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);
    const dte = { Encabezado: { IdDoc: { TipoDTE: 33 } } };

    await client.updateDocument('doc/1', { data_dte_json: dte, idempotencyKey: CALLER_KEY });

    expect(requests[0]).toMatchObject({
      method: 'PUT',
      url: 'https://example.test/api/v1/documents/doc%2F1',
      body: JSON.stringify({ data_dte_json: dte })
    });
  });

  it('updates the next number and the low stock config of numerations', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests, {
      success: true,
      message: 'numeration range next number updated successfully'
    });
    const items = [
      { code_sii: '33', threshold: 0, request_quantity: 100 },
      { code_sii: '39', threshold: 50, request_quantity: 500 }
    ];

    const nextNumber = await client.updateNumerationNextNumber('range-1', { next_number: 150 });
    await client.updateLowStockConfig({ items });

    expect(nextNumber).toEqual({ success: true, message: 'numeration range next number updated successfully' });
    expect(requests.map(({ method, url, body }) => ({ method, url, body }))).toEqual([
      {
        method: 'PATCH',
        url: 'https://example.test/api/v1/numerations/range-1/next-number',
        body: JSON.stringify({ next_number: 150 })
      },
      {
        method: 'PATCH',
        url: 'https://example.test/api/v1/numerations/low-stock',
        body: JSON.stringify({ items })
      }
    ]);
  });

  it('lists numeration ranges, optionally filtered by code_sii', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.listNumerationRanges({ code_sii: '33' });
    await client.listNumerationRanges();

    expect(requests.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: 'GET', url: 'https://example.test/api/v1/numerations/ranges?code_sii=33' },
      { method: 'GET', url: 'https://example.test/api/v1/numerations/ranges' }
    ]);
  });

  it('requeues purchases and cessions by id', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.requeuePurchase({ purchase_id: 'purchase-1' });
    await client.requeueCession({ cession_id: 'cession-1' });

    expect(requests.map(({ method, url, body }) => ({ method, url, body }))).toEqual([
      {
        method: 'POST',
        url: 'https://example.test/api/v1/purchase-acknowledgments/requeue',
        body: JSON.stringify({ purchase_id: 'purchase-1' })
      },
      {
        method: 'POST',
        url: 'https://example.test/api/v1/cessions/requeue',
        body: JSON.stringify({ cession_id: 'cession-1' })
      }
    ]);
  });

  it('serializes billing and consumption filters', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.listBillingCharges({
      status: 'charged',
      pricing_key: 'emission',
      from_date: '2026-09-01',
      to_date: '2026-09-30',
      page: 2,
      limit: 50
    });
    await client.listBillingPlans();
    await client.listBillingInvoices({ status: 'open' });
    await client.previewSubscriptionUpgrade('pro');
    await client.getConsumption();
    await client.listConsumptionOverages({ page: 1, limit: 100 });
    await client.listConsumptionOperations({ period: '2026-08' });
    await client.listConsumptionOperations();

    expect(requests.map(({ method, url }) => ({ method, url }))).toEqual([
      {
        method: 'GET',
        url: 'https://example.test/api/v1/billing/charges?status=charged&pricing_key=emission&from_date=2026-09-01&to_date=2026-09-30&page=2&limit=50'
      },
      { method: 'GET', url: 'https://example.test/api/v1/billing/plans' },
      { method: 'GET', url: 'https://example.test/api/v1/billing/invoices?status=open' },
      { method: 'GET', url: 'https://example.test/api/v1/billing/subscription/upgrade/preview?plan_id=pro' },
      { method: 'GET', url: 'https://example.test/api/v1/consumption' },
      { method: 'GET', url: 'https://example.test/api/v1/consumption/overages?page=1&limit=100' },
      { method: 'GET', url: 'https://example.test/api/v1/consumption/operations?period=2026-08' },
      { method: 'GET', url: 'https://example.test/api/v1/consumption/operations' }
    ]);
    for (const request of requests) {
      expect(request.headers.get('x-api-key')).toBe('test-key');
    }
  });

  it('lists and gets cessions', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.listCessions({ document_id: 'doc-1', page: 1, limit: 20 });
    await client.listCessions();
    await client.getCession('cession/1');

    expect(requests.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: 'GET', url: 'https://example.test/api/v1/cessions?document_id=doc-1&page=1&limit=20' },
      { method: 'GET', url: 'https://example.test/api/v1/cessions' },
      { method: 'GET', url: 'https://example.test/api/v1/cessions/cession%2F1' }
    ]);
  });
});

describe('Service', () => {
  it('forwards the new endpoints to the adapter', async () => {
    const requests: RecordedRequest[] = [];
    const service = new Service(recordingClient(requests));

    await service.getHealth();
    await service.login({ email: 'user@x.cl', password: 'secreta' });
    await service.createFirstBusiness(businessRequest, 'the-user-key');
    await service.updateDocument('doc-1', { data_dte: '{}' });
    await service.updateNumerationNextNumber('range-1', { next_number: 10 });
    await service.updateLowStockConfig({ items: [{ code_sii: '33', threshold: 5, request_quantity: 50 }] });
    await service.listNumerationRanges();
    await service.requeuePurchase({ purchase_id: 'purchase-1' });
    await service.listBillingCharges();
    await service.listBillingPlans();
    await service.listBillingInvoices();
    await service.previewSubscriptionUpgrade('pro');
    await service.getConsumption();
    await service.listConsumptionOverages();
    await service.listConsumptionOperations();
    await service.requeueCession({ cession_id: 'cession-1' });
    await service.listCessions();
    await service.getCession('cession-1');
    await service.deleteNumeration('num-1', { idempotencyKey: CALLER_KEY });

    expect(requests.map(({ method, url }) => `${method} ${new URL(url).pathname}`)).toEqual([
      'GET /api/v1/health',
      'POST /api/v1/auth/login',
      'POST /api/v1/onboarding/businesses',
      'PUT /api/v1/documents/doc-1',
      'PATCH /api/v1/numerations/range-1/next-number',
      'PATCH /api/v1/numerations/low-stock',
      'GET /api/v1/numerations/ranges',
      'POST /api/v1/purchase-acknowledgments/requeue',
      'GET /api/v1/billing/charges',
      'GET /api/v1/billing/plans',
      'GET /api/v1/billing/invoices',
      'GET /api/v1/billing/subscription/upgrade/preview',
      'GET /api/v1/consumption',
      'GET /api/v1/consumption/overages',
      'GET /api/v1/consumption/operations',
      'POST /api/v1/cessions/requeue',
      'GET /api/v1/cessions',
      'GET /api/v1/cessions/cession-1',
      'DELETE /api/v1/numerations/num-1'
    ]);
    expect(requests.at(-1)?.headers.get('idempotency-key')).toBe(CALLER_KEY);
  });
});

interface RecordedRequest {
  url: string;
  method: string;
  headers: Headers;
  body?: BodyInit | null;
}

function recordingClient(requests: RecordedRequest[], responseBody: unknown = { ok: true }): Client {
  return new Client({
    apiKey: 'test-key',
    baseURL: 'https://example.test',
    fetchFn: async (input, init) => {
      requests.push({
        url: input.toString(),
        method: init?.method ?? 'GET',
        headers: new Headers(init?.headers as HeadersInit),
        body: init?.body
      });

      return new Response(JSON.stringify(responseBody), {
        status: 200,
        headers: { 'content-type': 'application/json' }
      });
    }
  });
}

describe('APIError', () => {
  it('exposes parsed message and field details for a 422 validation error', () => {
    const body = JSON.stringify({
      success: false,
      message: 'validation error',
      details: [{ field: 'Encabezado.IdDoc.TipoDTE', message: 'falta el campo TipoDTE' }]
    });
    const err = new APIError(422, body);

    expect(err.isValidationError()).toBe(true);
    expect(err.apiMessage).toBe('validation error');
    expect(err.details).toEqual([
      { field: 'Encabezado.IdDoc.TipoDTE', message: 'falta el campo TipoDTE' }
    ]);
  });

  it('returns null parsed and empty details when body is not JSON', () => {
    const err = new APIError(500, 'Internal Server Error');

    expect(err.isValidationError()).toBe(false);
    expect(err.parsed).toBeNull();
    expect(err.apiMessage).toBeUndefined();
    expect(err.details).toEqual([]);
  });

  it('returns empty details when a JSON error has no details array', () => {
    const err = new APIError(409, JSON.stringify({ success: false, message: 'business with rut already exists' }));

    expect(err.apiMessage).toBe('business with rut already exists');
    expect(err.details).toEqual([]);
  });
});
