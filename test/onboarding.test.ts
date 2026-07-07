import { describe, expect, it } from 'vitest';

import { APIError } from '../src/adapters/httpintegra/client.js';
import { OnboardingClient } from '../src/adapters/httpintegra/onboarding.js';
import type { CreateFirstBusinessRequest } from '../src/domain/types.js';

interface RecordedRequest {
  url: string;
  method: string;
  headers: Headers;
  body?: BodyInit | null;
}

function recordingClient(requests: RecordedRequest[], responseBody: unknown = { success: true }): OnboardingClient {
  return new OnboardingClient({
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

const firstBusiness: CreateFirstBusinessRequest = {
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

describe('OnboardingClient', () => {
  it('does not require an api key', () => {
    expect(() => new OnboardingClient()).not.toThrow();
  });

  it('posts credentials to /auth/login without any auth header', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests, {
      success: true,
      data: { user_id: 'u1', email: 'user@x.cl', xUserKey: 'the-user-key' }
    });

    const res = await client.login({ email: 'user@x.cl', password: 'secreta' });

    const request = requests[0];
    expect(request?.method).toBe('POST');
    expect(request?.url).toBe('https://example.test/api/v1/auth/login');
    expect(request?.headers.get('x-api-key')).toBeNull();
    expect(request?.headers.get('x-user-key')).toBeNull();
    expect(request?.body).toBe(JSON.stringify({ email: 'user@x.cl', password: 'secreta' }));
    expect((res.data as { xUserKey: string }).xUserKey).toBe('the-user-key');
  });

  it('sends the x-user-key header when creating the first business', async () => {
    const requests: RecordedRequest[] = [];
    const client = recordingClient(requests);

    await client.createFirstBusiness(firstBusiness, 'the-user-key');

    const request = requests[0];
    expect(request?.method).toBe('POST');
    expect(request?.url).toBe('https://example.test/api/v1/onboarding/businesses');
    expect(request?.headers.get('x-user-key')).toBe('the-user-key');
    expect(request?.headers.get('x-api-key')).toBeNull();
    expect(request?.body).toBe(JSON.stringify(firstBusiness));
  });

  it('throws when the x-user-key is missing', async () => {
    const client = new OnboardingClient({ baseURL: 'https://example.test' });
    await expect(client.createFirstBusiness(firstBusiness, '')).rejects.toThrow('x-user-key is required');
  });

  it('surfaces a 409 as an APIError when the user already has a business', async () => {
    const client = new OnboardingClient({
      baseURL: 'https://example.test',
      fetchFn: async () =>
        new Response(JSON.stringify({ success: false, message: 'user already has a business' }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        })
    });

    await expect(client.createFirstBusiness(firstBusiness, 'the-user-key')).rejects.toBeInstanceOf(APIError);
  });
});
