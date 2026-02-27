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

export interface Transporte {
  Patente?: string;
  RUTTrans?: string;
  NombreChofer?: string;
  DirDest?: string;
  CmnaDest?: string;
}

export interface TransporteGuia {
  Patente?: string;
  RUTTrans?: string;
  NombreChofer?: string;
  RUTChofer?: string;
  NroLicencia?: string;
  DirDest?: string;
  CmnaDest?: string;
  CiudadDest?: string;
}

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
