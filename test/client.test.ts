import { describe, expect, it } from 'vitest';

import { APIError, Client } from '../src/adapters/httpintegra/client.js';
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
