export interface Emisor {
  RUTEmisor: string;
  RznSoc: string;
  GiroEmis: string;
  Telefono?: string;
  CorreoEmisor?: string;
  Acteco?: number[];
  CdgSIISucur?: number;
  DirOrigen: string;
  CmnaOrigen: string;
  CiudadOrigen?: string;
}

export interface EmisorBoleta {
  RUTEmisor: string;
  RznSocEmisor: string;
  GiroEmisor: string;
  Telefono?: string;
  CorreoEmisor?: string;
  CdgSIISucur?: number;
  DirOrigen: string;
  CmnaOrigen: string;
  CiudadOrigen?: string;
}

export interface Receptor {
  RUTRecep: string;
  CdgIntRecep?: string;
  RznSocRecep: string;
  GiroRecep?: string;
  Contacto?: string;
  CorreoRecep?: string;
  DirRecep?: string;
  CmnaRecep?: string;
  CiudadRecep?: string;
  DirPostal?: string;
  CmnaPostal?: string;
  CiudadPostal?: string;
}

export interface ReceptorBoleta {
  RUTRecep?: string;
  RznSocRecep?: string;
  GiroRecep?: string;
  Contacto?: string;
  CorreoRecep?: string;
  DirRecep?: string;
  CmnaRecep?: string;
  CiudadRecep?: string;
}

export interface ImptoReten {
  TipoImp?: string;
  TasaImp?: number;
  MontoImp?: number;
}

export interface Totales {
  MntNeto?: number;
  MntExe?: number;
  TasaIVA?: number;
  IVA?: number;
  IVAProp?: number;
  IVANoRet?: number;
  ImptoReten?: ImptoReten[];
  MntTotal: number;
  MontoNF?: number;
  TotalPeriodo?: number;
  SaldoAnterior?: number;
  VlrPagar?: number;
}

export interface TotalesGuia {
  MntNeto?: number;
  MntExe?: number;
  TasaIVA?: number;
  IVA?: number;
  ImptoReten?: ImptoReten[];
  MntTotal?: number;
}

export interface TotalesBoleta {
  MntNeto?: number;
  MntExe?: number;
  IVA?: number;
  ImptoReten?: ImptoReten[];
  MntTotal: number;
}

export interface IdDocBase {
  TipoDTE: number;
  Folio: number;
  FchEmis: string;
  IndServicio?: number;
  FmaPago?: number;
  PeriodoDesde?: string;
  PeriodoHasta?: string;
  TermPagoGlosa?: string;
  FchVenc?: string;
  MedioPago?: string;
  TpoCtaPago?: string;
  NumCtaPago?: string;
  MntBruto?: number;
  IndMntNeto?: number;
}

export interface IdDocBoleta {
  TipoDTE: number;
  Folio: number;
  FchEmis: string;
  IndServicio?: number;
  FmaPago?: number;
  MedioPago?: string;
  MntBruto?: number;
  IndMntNeto?: number;
}

export interface IdDocGuia {
  TipoDTE: number;
  Folio: number;
  FchEmis: string;
  TipoDespacho?: number;
  IndTraslado?: number;
  IndServicio?: number;
  FmaPago?: number;
  FchVenc?: string;
  PeriodoDesde?: string;
  PeriodoHasta?: string;
  TermPagoGlosa?: string;
  MntBruto?: number;
  IndMntNeto?: number;
}

export interface CdgItem {
  TpoCodigo?: string;
  VlrCodigo?: string;
}

export interface Detalle {
  NroLinDet: number;
  CdgItem?: CdgItem[];
  IndExe?: number;
  NmbItem: string;
  DscItem?: string;
  QtyItem?: number;
  UnmdItem?: string;
  PrcItem?: number;
  DescuentoPct?: number;
  DescuentoMonto?: number;
  RecargoPct?: number;
  RecargoMonto?: number;
  CodImpAdic?: string[];
  MontoItem: number;
}

export interface DscRcgGlobal {
  NroLinDR: number;
  TpoMov: string;
  GlosaDR?: string;
  TpoValor: string;
  ValorDR: number;
  IndExeDR?: number;
}

export interface Referencia {
  NroLinRef?: number;
  TpoDocRef?: string;
  FolioRef?: string;
  FchRef?: string;
  CodRef?: number;
  RazonRef?: string;
}

/**
 * Chofer identifica a quien conduce. El esquema del SII lo exige como bloque propio dentro de
 * Transporte, no como campos planos: un NombreChofer colgado directamente de Transporte se
 * rechaza con "This element is not expected".
 */
export interface Chofer {
  RUTChofer?: string;
  NombreChofer?: string;
}

/**
 * Transporte es el bloque de transporte del documento, que va DENTRO de Encabezado, entre
 * Receptor y Totales.
 *
 * PatenteCarro, FchSalida, HraSalida y FchLlegada los agrego el Formato DTE v2.5 (2026-02) y
 * la Res. Ex. SII N 144 de 2026 los volvio obligatorios para los documentos que amparan
 * traslado de bienes. Aca son opcionales porque la API todavia no los exige.
 *
 * El SII valida los formatos al caracter: FchSalida y FchLlegada en AAAA-MM-DD, y HraSalida en
 * HH:MM:SS con segundos y ceros a la izquierda. Tanto "08:30" como "8:30:00" se rechazan.
 */
export interface Transporte {
  Patente?: string;
  /** Patente del carro, sea remolque o semirremolque. */
  PatenteCarro?: string;
  RUTTrans?: string;
  Chofer?: Chofer;
  DirDest?: string;
  CmnaDest?: string;
  CiudadDest?: string;
  /** Fecha efectiva de inicio del traslado (AAAA-MM-DD). */
  FchSalida?: string;
  /** Hora de inicio del traslado (HH:MM:SS, con segundos). */
  HraSalida?: string;
  /** Fecha de llegada del traslado (AAAA-MM-DD). */
  FchLlegada?: string;

  /** @deprecated Usar `Chofer.NombreChofer`. Se acepta y se mueve al armar el request. */
  NombreChofer?: string;
  /** @deprecated Usar `Chofer.RUTChofer`. Se acepta y se mueve al armar el request. */
  RUTChofer?: string;
  /** @deprecated El SII no lo declara en ningun esquema. Se descarta al armar el request. */
  NroLicencia?: string;
}

/**
 * @deprecated Usar `Transporte`. El esquema del SII define un unico bloque de transporte,
 * igual para todos los tipos de documento que lo admiten.
 */
export type TransporteGuia = Transporte;

export interface SubTotInfo {
  NroSTI?: number;
  GlosaSTI?: string;
  OrdenSTI?: number;
  SubTotNeto?: number;
  SubTotExe?: number;
  SubTotIVA?: number;
  SubTotAdic?: number;
  SubTotTotal?: number;
}

export interface Comisiones {
  NroLinCom?: number;
  TipoMovim?: string;
  Glosa?: string;
  TasaComision?: number;
  ValComision?: number;
}

export interface OtraMoneda {
  TpoMoneda?: string;
  TpoCambio?: number;
  MntNetoOtrMnd?: number;
  MntExeOtrMnd?: number;
  IVAOtrMnd?: number;
  MntTotOtrMnd?: number;
}
