import type { CreateDocumentRequest } from './types.js';
import type {
  Dte33Data,
  Dte34Data,
  Dte39Data,
  Dte41Data,
  Dte46Data,
  Dte52Data,
  Dte56Data,
  Dte61Data
} from './dte-documents.js';

export function createDocumentRequestFromDTE(
  codeSII: string,
  userID: string,
  businessID: string,
  idempotencyKey: string,
  dte: unknown
): CreateDocumentRequest {
  if (!codeSII.trim()) {
    throw new Error('domain: code_sii is required');
  }

  return {
    user_id: userID,
    business_id: businessID,
    code_sii: codeSII,
    data_dte: JSON.stringify(dte),
    idempotencyKey
  };
}

export function dte33ToRequest(userID: string, businessID: string, idempotencyKey: string, dte: Dte33Data): CreateDocumentRequest {
  return createDocumentRequestFromDTE('33', userID, businessID, idempotencyKey, dte);
}

export function dte34ToRequest(userID: string, businessID: string, idempotencyKey: string, dte: Dte34Data): CreateDocumentRequest {
  return createDocumentRequestFromDTE('34', userID, businessID, idempotencyKey, dte);
}

export function dte39ToRequest(userID: string, businessID: string, idempotencyKey: string, dte: Dte39Data): CreateDocumentRequest {
  return createDocumentRequestFromDTE('39', userID, businessID, idempotencyKey, dte);
}

export function dte41ToRequest(userID: string, businessID: string, idempotencyKey: string, dte: Dte41Data): CreateDocumentRequest {
  return createDocumentRequestFromDTE('41', userID, businessID, idempotencyKey, dte);
}

export function dte46ToRequest(userID: string, businessID: string, idempotencyKey: string, dte: Dte46Data): CreateDocumentRequest {
  return createDocumentRequestFromDTE('46', userID, businessID, idempotencyKey, dte);
}

export function dte52ToRequest(userID: string, businessID: string, idempotencyKey: string, dte: Dte52Data): CreateDocumentRequest {
  return createDocumentRequestFromDTE('52', userID, businessID, idempotencyKey, dte);
}

export function dte56ToRequest(userID: string, businessID: string, idempotencyKey: string, dte: Dte56Data): CreateDocumentRequest {
  return createDocumentRequestFromDTE('56', userID, businessID, idempotencyKey, dte);
}

export function dte61ToRequest(userID: string, businessID: string, idempotencyKey: string, dte: Dte61Data): CreateDocumentRequest {
  return createDocumentRequestFromDTE('61', userID, businessID, idempotencyKey, dte);
}
