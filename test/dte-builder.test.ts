import { describe, expect, it } from 'vitest';

import { dte33ToRequest } from '../src/domain/dte-builder.js';
import type { Dte33Data } from '../src/domain/dte-documents.js';

describe('dte33ToRequest', () => {
  it('builds data_dte without TED or TmstFirma', () => {
    const dte: Dte33Data = {
      Encabezado: {
        IdDoc: {
          TipoDTE: 33,
          Folio: 10,
          FchEmis: '2026-02-03'
        },
        Emisor: {
          RUTEmisor: '76326028-3',
          RznSoc: 'SERVICIOS INFORMATICOS SIGANET LIMITADA',
          GiroEmis: 'Servicios de desarrollo de software',
          DirOrigen: 'Av. Apoquindo 3000',
          CmnaOrigen: 'Las Condes'
        },
        Receptor: {
          RUTRecep: '18923860-6',
          RznSocRecep: 'Cliente'
        },
        Totales: {
          MntNeto: 100000,
          IVA: 19000,
          MntTotal: 119000
        }
      },
      Detalle: [
        {
          NroLinDet: 1,
          NmbItem: 'Servicio',
          MontoItem: 100000
        }
      ]
    };

    const req = dte33ToRequest('u1', 'b1', 'idem-1', dte);

    expect(req.code_sii).toBe('33');
    expect(req.data_dte.length).toBeGreaterThan(0);
    expect(req.data_dte).not.toContain('TED');
    expect(req.data_dte).not.toContain('TmstFirma');
    expect(req.data_dte).toContain('Encabezado');
  });
});
