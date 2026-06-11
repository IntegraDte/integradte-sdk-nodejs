import { describe, expect, it } from 'vitest';

import { Client } from '../src/adapters/httpintegra/client.js';
import type {
  CreateDocumentRequest,
  OfflineLicensePayload,
  SignedOfflineLicense,
  SyncDocumentRequest
} from '../src/domain/types.js';

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
    await client.getCurrentCertificate();

    expect(requests.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: 'GET', url: 'https://example.test/api/v1/businesses' },
      { method: 'GET', url: 'https://example.test/api/v1/businesses/business%2F1' },
      { method: 'POST', url: 'https://example.test/api/v1/businesses/certification-mode' },
      { method: 'GET', url: 'https://example.test/api/v1/documents/stats?to_date=2026-02-23' },
      { method: 'GET', url: 'https://example.test/api/v1/billing/balance' },
      { method: 'GET', url: 'https://example.test/api/v1/billing/payments?status=COMPLETED&page=1' },
      { method: 'GET', url: 'https://example.test/api/v1/purchase-acknowledgments?tipo_dte=33&limit=20' },
      { method: 'GET', url: 'https://example.test/api/v1/certificates/current' }
    ]);
  });

  it('supports license lifecycle routes', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);
    const license = signedLicense();

    await client.createLicense({ name: 'Caja 01', device_fingerprint: 'machine-1' });
    await client.listLicenses();
    await client.getLicense('lic_01');
    await client.listLicenseDevices('lic_01');
    await client.enableLicense('lic_01', { reason: 'manual_enable' });
    await client.disableLicense('lic_01', { reason: 'payment_pending' });
    await client.revokeLicense('lic_01', { reason: 'device_compromised' });
    await client.activateLicense({
      license_key: 'ABCDE-12345-FGHIJ',
      device_id: 'machine-1',
      machine_fingerprint: 'machine-1',
      hostname: 'pc-01',
      platform: 'linux',
      arch: 'amd64',
      cli_version: '1.0.0'
    });
    await client.refreshLicense({
      device_id: 'machine-1',
      machine_fingerprint: 'machine-1',
      cli_version: '1.0.0',
      license
    });

    expect(requests.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: 'POST', url: 'https://example.test/api/v1/licenses' },
      { method: 'GET', url: 'https://example.test/api/v1/licenses' },
      { method: 'GET', url: 'https://example.test/api/v1/licenses/lic_01' },
      { method: 'GET', url: 'https://example.test/api/v1/licenses/lic_01/devices' },
      { method: 'POST', url: 'https://example.test/api/v1/licenses/lic_01/enable' },
      { method: 'POST', url: 'https://example.test/api/v1/licenses/lic_01/disable' },
      { method: 'POST', url: 'https://example.test/api/v1/licenses/lic_01/revoke' },
      { method: 'POST', url: 'https://example.test/api/v1/licenses/activate' },
      { method: 'POST', url: 'https://example.test/api/v1/licenses/refresh' }
    ]);
  });

  it('requests numbers and returns the flat array response', async () => {
    const requests: RecordedRequest[] = [];
    const ranges = [{ document_type: 33, folio_inicial: 100, folio_final: 103, folio_xml_base64: 'BASE64' }];
    const client = recordingClient(requests, ranges);

    const response = await client.requestNumbers({ document_type: 33, quantity: 4 });

    expect(response).toEqual(ranges);
    expect(requests[0]).toMatchObject({
      method: 'POST',
      url: 'https://example.test/v1/numbers/request',
      body: JSON.stringify({ document_type: 33, quantity: 4 })
    });
  });

  it('supports sync, numeration requests and document requeues', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);
    const syncRequest: SyncDocumentRequest = {
      document_id: 'DTE_33_1001',
      document_type: 33,
      folio: 1001,
      xml_base64: 'XML',
      generated_at: '2026-03-14T12:00:00Z',
      raw_payload: { Encabezado: {} },
      license: signedLicense()
    };

    await client.requestNumerations({ code_sii: '33', quantity: 120 });
    await client.syncDocument(syncRequest);
    await client.requeueDocument({ document_id: 'online-id' });
    await client.requeueOfflineDocument({ document_id: 'offline-id' });
    await client.requeueOfflineDocumentStatus({ document_id: 'offline-id' });

    expect(requests.map(({ method, url }) => ({ method, url }))).toEqual([
      { method: 'POST', url: 'https://example.test/api/v1/numerations/request-rabbitmq' },
      { method: 'POST', url: 'https://example.test/api/v1/documents/sync' },
      { method: 'POST', url: 'https://example.test/api/v1/documents/requeue' },
      { method: 'POST', url: 'https://example.test/api/v1/documents/requeue/offline' },
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

function signedLicense(): SignedOfflineLicense {
  const payload: OfflineLicensePayload = {
    license_id: 'lic_01',
    business_id: 'business_01',
    device_id: 'machine-1',
    device_fingerprint: 'machine-1',
    business: {
      business_name: 'Empresa Demo SPA',
      rut: '76000000-0',
      activity: 'Servicios',
      address: 'Av. Principal 123',
      commune: 'Santiago',
      region: 'Metropolitana',
      email_dte: 'dte@example.cl',
      email_contact: 'contacto@example.cl',
      resolution_number_dte: '80',
      resolution_date_dte: '2026-03-14T00:00:00Z',
      is_prod: true
    },
    features: ['dte', 'sync', 'signing'],
    issued_at: '2026-03-14T12:00:00Z',
    expires_at: '2026-03-29T12:00:00Z',
    last_validated_at: '2026-03-14T12:00:00Z',
    status: 'active',
    cli_min_version: '1.0.0'
  };

  return { payload, signature: 'BASE64_SIGNATURE' };
}
