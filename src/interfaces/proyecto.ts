export interface Proyecto {
	id: number
	nombre_proyecto: string
	monto: string
	moneda: string
	gerencia: string
	pais: string
	unidad_negocio: string
	producto: string
	anio: string
	contratante: string
	datos_cliente: string
	fecha_inicio: string
	fecha_fin: string
	duracion: string
	numero_contrato: string
	anticipo: string
	costo_directo?: string
	numero_propuesta: string
	certificacion: string
	contrato: string
	iva: string
	CYM?: string
	['DOCUMENTOS AREA LEGAL']?: string
	ELECTRONICO?: string
	['ELECTRONICO 2']?: string
	['ESTATUS PROYECTO']?: string
	['monto_moneda_original']?: string
	montoUsd: string
	NOMBRE?: string
	nombre_corto: string
	['OTROS DOCUMENTOS']?: string
	['SOCIO']?: string
	['TIPO DE CAMBIO DE MONEDA']?: string
	['TIPO DE CAMBIO MX']?: string
	['VALOR DEL contrato CORRESPONDIENTE A C&M']?: string
}