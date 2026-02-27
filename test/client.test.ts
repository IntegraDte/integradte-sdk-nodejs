import { describe, expect, it } from 'vitest';

import { Client } from '../src/adapters/httpintegra/client.js';
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
});
