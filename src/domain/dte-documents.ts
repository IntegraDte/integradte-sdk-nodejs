import type {
  Comisiones,
  Detalle,
  DscRcgGlobal,
  Emisor,
  EmisorBoleta,
  IdDocBase,
  IdDocBoleta,
  IdDocGuia,
  OtraMoneda,
  Receptor,
  ReceptorBoleta,
  Referencia,
  SubTotInfo,
  Totales,
  TotalesBoleta,
  TotalesGuia,
  Transporte
} from './dte-common.js';

/**
 * @deprecated Usar `Encabezado.Transporte`, que es donde lo ubica el esquema del SII. Si se
 * manda al tope del documento, el SDK lo mueve al Encabezado al armar el request.
 */
type TransporteAlTope = Transporte;

export interface Dte33Data {
  Encabezado: Encabezado33;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  /** @deprecated Usar `Encabezado.Transporte`. */
  Transporte?: TransporteAlTope;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado33 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  /** Bloque de transporte, en la posicion que exige la secuencia del esquema del SII. */
  Transporte?: Transporte;
  Totales: Totales;
}

export interface Dte34Data {
  Encabezado: Encabezado34;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  /** @deprecated Usar `Encabezado.Transporte`. */
  Transporte?: TransporteAlTope;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado34 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  /** Bloque de transporte, en la posicion que exige la secuencia del esquema del SII. */
  Transporte?: Transporte;
  Totales: Totales;
}

export interface Dte39Data {
  Encabezado: Encabezado39;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  SubTotInfo?: SubTotInfo[];
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado39 {
  IdDoc: IdDocBoleta;
  Emisor: EmisorBoleta;
  Receptor: ReceptorBoleta;
  Totales: TotalesBoleta;
}

export interface Dte41Data {
  Encabezado: Encabezado41;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  SubTotInfo?: SubTotInfo[];
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado41 {
  IdDoc: IdDocBoleta;
  Emisor: EmisorBoleta;
  Receptor: ReceptorBoleta;
  Totales: TotalesBoleta;
}

export interface Dte46Data {
  Encabezado: Encabezado46;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  /** @deprecated Usar `Encabezado.Transporte`. */
  Transporte?: TransporteAlTope;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado46 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  /** Bloque de transporte, en la posicion que exige la secuencia del esquema del SII. */
  Transporte?: Transporte;
  Totales: Totales;
}

export interface Dte52Data {
  Encabezado: Encabezado52;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  /** @deprecated Usar `Encabezado.Transporte`. */
  Transporte?: TransporteAlTope;
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado52 {
  IdDoc: IdDocGuia;
  Emisor: Emisor;
  Receptor: Receptor;
  /** Bloque de transporte, en la posicion que exige la secuencia del esquema del SII. */
  Transporte?: Transporte;
  Totales: TotalesGuia;
}

export interface Dte56Data {
  Encabezado: Encabezado56;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  /** @deprecated Usar `Encabezado.Transporte`. */
  Transporte?: TransporteAlTope;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado56 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  /** Bloque de transporte, en la posicion que exige la secuencia del esquema del SII. */
  Transporte?: Transporte;
  Totales: Totales;
}

export interface Dte61Data {
  Encabezado: Encabezado61;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  /** @deprecated Usar `Encabezado.Transporte`. */
  Transporte?: TransporteAlTope;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado61 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  /** Bloque de transporte, en la posicion que exige la secuencia del esquema del SII. */
  Transporte?: Transporte;
  Totales: Totales;
}
