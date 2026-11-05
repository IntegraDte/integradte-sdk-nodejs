import { describe, expect, it } from 'vitest';

import { dte33ToRequest, dte52ToRequest } from '../src/domain/dte-builder.js';
import type { Dte33Data, Dte52Data } from '../src/domain/dte-documents.js';
import type { Transporte } from '../src/domain/dte-common.js';

const emisor = {
  RUTEmisor: '76326028-3',
  RznSoc: 'SERVICIOS INFORMATICOS SIGANET LIMITADA',
  GiroEmis: 'Servicios de desarrollo de software',
  DirOrigen: 'Av. Apoquindo 3000',
  CmnaOrigen: 'Las Condes'
};

const receptor = { RUTRecep: '18923860-6', RznSocRecep: 'Cliente' };

const detalle = [{ NroLinDet: 1, NmbItem: 'Aceite', MontoItem: 100000 }];

/** El bloque completo que exige la Res. Ex. SII N 144 de 2026, en la forma del esquema. */
const transporteCanonico: Transporte = {
  Patente: 'UVSS30',
  PatenteCarro: 'PPRR50',
  RUTTrans: '11111111-1',
  Chofer: { RUTChofer: '12000000-0', NombreChofer: 'Juan Perez' },
  DirDest: 'Av Destino 456',
  CmnaDest: 'Quilpue',
  CiudadDest: 'Quilpue',
  FchSalida: '2026-11-05',
  HraSalida: '08:30:00',
  FchLlegada: '2026-11-06'
};

/** El mismo bloque como lo pedian las versiones anteriores: chofer plano. */
const transporteLegado: Transporte = {
  Patente: 'UVSS30',
  PatenteCarro: 'PPRR50',
  RUTTrans: '11111111-1',
  NombreChofer: 'Juan Perez',
  RUTChofer: '12000000-0',
  DirDest: 'Av Destino 456',
  CmnaDest: 'Quilpue',
  CiudadDest: 'Quilpue',
  FchSalida: '2026-11-05',
  HraSalida: '08:30:00',
  FchLlegada: '2026-11-06'
};

function guia52(transporte: { enEncabezado?: Transporte; alTope?: Transporte }): Dte52Data {
  return {
    Encabezado: {
      IdDoc: { TipoDTE: 52, Folio: 1, FchEmis: '2026-11-05', TipoDespacho: 1, IndTraslado: 1 },
      Emisor: emisor,
      Receptor: receptor,
      Transporte: transporte.enEncabezado,
      Totales: { MntNeto: 100000, IVA: 19000, MntTotal: 119000 }
    },
    Detalle: detalle,
    Transporte: transporte.alTope
  };
}

function dataDte(req: { data_dte: string }): Record<string, unknown> {
  return JSON.parse(req.data_dte) as Record<string, unknown>;
}

describe('normalizacion del bloque Transporte', () => {
  it('deja el bloque dentro de Encabezado cuando viene al tope', () => {
    const req = dte52ToRequest('u1', 'b1', 'idem-1', guia52({ alTope: transporteCanonico }));
    const payload = dataDte(req);
    const encabezado = payload.Encabezado as Record<string, unknown>;

    expect(encabezado.Transporte).toBeDefined();
    expect(payload.Transporte).toBeUndefined();
  });

  it('las dos formas producen el mismo payload', () => {
    const desdeEncabezado = dte52ToRequest('u1', 'b1', 'idem-1', guia52({ enEncabezado: transporteCanonico }));
    const desdeElTope = dte52ToRequest('u1', 'b1', 'idem-1', guia52({ alTope: transporteLegado }));

    expect(dataDte(desdeElTope)).toEqual(dataDte(desdeEncabezado));
  });

  it('mueve el chofer plano al bloque Chofer', () => {
    const req = dte52ToRequest('u1', 'b1', 'idem-1', guia52({ alTope: transporteLegado }));
    const encabezado = dataDte(req).Encabezado as Record<string, unknown>;
    const bloque = encabezado.Transporte as Transporte;

    expect(bloque.Chofer).toEqual({ RUTChofer: '12000000-0', NombreChofer: 'Juan Perez' });
    expect(bloque.NombreChofer).toBeUndefined();
    expect(bloque.RUTChofer).toBeUndefined();
  });

  it('descarta NroLicencia, que el SII no declara en ningun esquema', () => {
    const req = dte52ToRequest('u1', 'b1', 'idem-1', guia52({
      alTope: { Patente: 'UVSS30', NroLicencia: 'A1234' }
    }));

    expect(req.data_dte).not.toContain('NroLicencia');
    expect(req.data_dte).toContain('UVSS30');
  });

  it('si vienen las dos formas, gana la del Encabezado', () => {
    const req = dte52ToRequest('u1', 'b1', 'idem-1', guia52({
      enEncabezado: { Patente: 'CANONICA' },
      alTope: { Patente: 'LEGADA' }
    }));

    expect(req.data_dte).toContain('CANONICA');
    expect(req.data_dte).not.toContain('LEGADA');
  });

  it('conserva los campos de fecha y hora de traslado', () => {
    const req = dte52ToRequest('u1', 'b1', 'idem-1', guia52({ alTope: transporteLegado }));
    const encabezado = dataDte(req).Encabezado as Record<string, unknown>;
    const bloque = encabezado.Transporte as Transporte;

    expect(bloque.FchSalida).toBe('2026-11-05');
    expect(bloque.HraSalida).toBe('08:30:00');
    expect(bloque.FchLlegada).toBe('2026-11-06');
    expect(bloque.PatenteCarro).toBe('PPRR50');
  });

  it('tambien normaliza la factura, que la Res. 144 cubre igual', () => {
    const dte: Dte33Data = {
      Encabezado: {
        IdDoc: { TipoDTE: 33, Folio: 10, FchEmis: '2026-11-05' },
        Emisor: emisor,
        Receptor: receptor,
        Totales: { MntNeto: 100000, IVA: 19000, MntTotal: 119000 }
      },
      Detalle: detalle,
      Transporte: { Patente: 'UVSS30', NombreChofer: 'Juan Perez', RUTChofer: '12000000-0' }
    };

    const payload = dataDte(dte33ToRequest('u1', 'b1', 'idem-1', dte));
    const encabezado = payload.Encabezado as Record<string, unknown>;
    const bloque = encabezado.Transporte as Transporte;

    expect(payload.Transporte).toBeUndefined();
    expect(bloque.Chofer).toEqual({ RUTChofer: '12000000-0', NombreChofer: 'Juan Perez' });
  });

  it('no toca el documento cuando no hay transporte', () => {
    const dte: Dte33Data = {
      Encabezado: {
        IdDoc: { TipoDTE: 33, Folio: 10, FchEmis: '2026-11-05' },
        Emisor: emisor,
        Receptor: receptor,
        Totales: { MntNeto: 100000, IVA: 19000, MntTotal: 119000 }
      },
      Detalle: detalle
    };

    const payload = dataDte(dte33ToRequest('u1', 'b1', 'idem-1', dte));
    const encabezado = payload.Encabezado as Record<string, unknown>;

    expect(encabezado.Transporte).toBeUndefined();
    expect(payload.Transporte).toBeUndefined();
  });

  it('no muta el objeto que recibe', () => {
    const dte = guia52({ alTope: transporteCanonico });
    dte52ToRequest('u1', 'b1', 'idem-1', dte);

    expect(dte.Transporte).toBeDefined();
    expect(dte.Encabezado.Transporte).toBeUndefined();
  });
});
