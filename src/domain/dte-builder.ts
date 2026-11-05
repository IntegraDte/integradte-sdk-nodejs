import type { CreateDocumentRequest } from './types.js';
import type { Transporte } from './dte-common.js';
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

/**
 * normalizeChofer mueve el chofer plano al bloque Chofer y descarta NroLicencia.
 *
 * El esquema del SII exige <Chofer> como contenedor de RUTChofer y NombreChofer, y no declara
 * NroLicencia en ninguna version, asi que mandarlo hace rechazar el documento.
 */
function normalizeChofer(bloque: Transporte): Transporte {
  const normalizado: Transporte = { ...bloque };
  const { NombreChofer, RUTChofer } = normalizado;

  delete normalizado.NombreChofer;
  delete normalizado.RUTChofer;
  delete normalizado.NroLicencia;

  if (normalizado.Chofer === undefined && (NombreChofer !== undefined || RUTChofer !== undefined)) {
    normalizado.Chofer = { RUTChofer, NombreChofer };
  }
  return normalizado;
}

/**
 * normalizeTransporte deja el bloque de transporte en la forma que define el esquema del SII:
 * dentro de Encabezado y con el chofer en su bloque Chofer.
 *
 * Se acepta el bloque al tope del documento porque es donde lo pedian las versiones anteriores
 * del SDK, pero no es donde lo ubica el esquema. Normalizar aca, y no solo en el servidor, deja
 * el payload correcto en el cable sin depender de que version de la API este desplegada.
 *
 * No muta el objeto que recibe: devuelve una copia con el bloque movido.
 */
function normalizeTransporte<T>(dte: T): T {
  if (dte === null || typeof dte !== 'object') {
    return dte;
  }

  const documento = dte as Record<string, unknown>;
  const encabezado = documento.Encabezado as Record<string, unknown> | undefined;
  if (encabezado === undefined || encabezado === null || typeof encabezado !== 'object') {
    return dte;
  }

  const bloque = (encabezado.Transporte ?? documento.Transporte) as Transporte | undefined;
  if (bloque === undefined || bloque === null) {
    return dte;
  }

  const salida: Record<string, unknown> = {
    ...documento,
    Encabezado: { ...encabezado, Transporte: normalizeChofer(bloque) }
  };
  delete salida.Transporte;

  return salida as T;
}

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
    data_dte: JSON.stringify(normalizeTransporte(dte)),
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
