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
  Transporte,
  TransporteGuia
} from './dte-common.js';

export interface Dte33Data {
  Encabezado: Encabezado33;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  Transporte?: Transporte;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado33 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  Totales: Totales;
}

export interface Dte34Data {
  Encabezado: Encabezado34;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  Transporte?: Transporte;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado34 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
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
  Transporte?: Transporte;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado46 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  Totales: Totales;
}

export interface Dte52Data {
  Encabezado: Encabezado52;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Transporte?: TransporteGuia;
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado52 {
  IdDoc: IdDocGuia;
  Emisor: Emisor;
  Receptor: Receptor;
  Totales: TotalesGuia;
}

export interface Dte56Data {
  Encabezado: Encabezado56;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  Transporte?: Transporte;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado56 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  Totales: Totales;
}

export interface Dte61Data {
  Encabezado: Encabezado61;
  Detalle: Detalle[];
  DscRcgGlobal?: DscRcgGlobal[];
  Referencia?: Referencia[];
  Comisiones?: Comisiones[];
  SubTotInfo?: SubTotInfo[];
  Transporte?: Transporte;
  OtraMoneda?: OtraMoneda;
}

export interface Encabezado61 {
  IdDoc: IdDocBase;
  Emisor: Emisor;
  Receptor: Receptor;
  Totales: Totales;
}
