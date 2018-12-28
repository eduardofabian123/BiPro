import {
	Injectable
} from '@angular/core'
import {
	SQLiteObject
} from '@ionic-native/sqlite'

import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'

@Injectable()
/* Clase para el manejo de los reportes. */
export class ReportesDbService {

	db: SQLiteObject = null
	resultado = []
	whereNuevoReporte: string = ''

	constructor() {}

	/* Funcion que inisializa la base de datos para los reportes. */
	initDb(db: SQLiteObject) {
		this.db = db
	}

	/* Funcion para la consulta de los reportes. */
	getReportes = (): any => {
		let reportes = []
		let sql = `select * from reportes`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'id': response.rows.item(index).id,
						'nombre_reporte': response.rows.item(index).nombre_reporte,
						'total_proyectos': parseInt(response.rows.item(index).total_proyectos),
						'total_usd': account.formatNumber(response.rows.item(index).total_usd),
					})
				}
				return Promise.resolve(reportes)
			})
	}

	/* Funcion para obtener la agrupacion de un detalle de reporte a consultar. */
	obtenerAgrupacionDetalle = (id: number): any => {
		let agrupaciones = []
		let agrupacion = `select nombre_columna from reportes_agrupacion where reporte_id = ` + id
		return this.db.executeSql(agrupacion, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					agrupaciones.push({
						'nombre_columna': response.rows.item(index).nombre_columna,
					})
				}
				return Promise.resolve(agrupaciones)
			})
	}

	/* Funcion para obtener las columans de select de un detalle de reporte a consultar. */
	obtenerCamposDetalle = (id: number): any => {
		let campos_select = []
		let select = `select nombre_columna from reportes_columnas where reporte_id = ` + id
		return this.db.executeSql(select, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					campos_select.push({
						'nombre_columna': response.rows.item(index).nombre_columna,
					})
				}
				return Promise.resolve(campos_select)
			})
	}

	/* Funcion para obtener los filtros y columnas del reporte. */
	obtenerFiltros = (id: number): any => {
		let campos_filter = []
		let select = `select reporte_id, nombre_columna, valor from reportes_filtros where reporte_id = ${id}`

		return this.db.executeSql(select, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					campos_filter.push({
						'reporte_id': response.rows.item(index).reporte_id,
						'nombre_columna': response.rows.item(index).nombre_columna,
						'valor': response.rows.item(index).valor,
					})
				}
				return Promise.resolve(campos_filter)
			})
	}

	/* Funcion para la consulta del detalle de reportes. */
	detalleReporte = (campo: string, agrupacion: string, filtros: any[]): any => {
		agrupacion === 'año' ? agrupacion = 'anio' : agrupacion === 'dirección' ? agrupacion = 'unidad_negocio' : agrupacion === 'país' ? agrupacion = 'pais' :
			agrupacion === 'Número de propuesta' ? agrupacion = 'numero_propuesta' : agrupacion === 'datos de cliente' ? agrupacion = 'datos_cliente' : agrupacion === 'duración' ? agrupacion = 'duracion' :
			agrupacion === 'fecha de inicio' ? agrupacion = 'fecha_inicio' : agrupacion === 'fecha de término' ? agrupacion = 'fecha_fin' :
			agrupacion === 'Monto total original' ? agrupacion = 'monto_moneda_original' : agrupacion === 'Nombre corto' ? agrupacion = 'nombre_corto' :
			agrupacion === 'Nombre de proyecto' ? agrupacion = 'nombre_proyecto' : agrupacion === 'Número de contrato' ? agrupacion = 'numero_contrato' : ''

		let sql: string = ''
		let reportes = []
		if (filtros.length === 0) {
			sql = `select  ` + agrupacion + ` as campo, count(*) as numero_proyectos, sum(monto) as monto,
					(select count(*) from proyectos) as total, id
					FROM proyectos
					group by ` + agrupacion + ` order by ` + agrupacion + ` asc`
		} else {

			let opciones = []
			let columnas = []
			let misNuevasColumnas = []
			let values: string = ''
			let nuevoValues: string = ''
			let cadena: string = ''

			filtros.map(function(item, index) {
				columnas.push(item.nombre_columna)
			})
			opciones.push(collect(filtros).groupBy('nombre_columna').all())
			misNuevasColumnas = collect(columnas).unique().toArray()


			cadena = `select ${collect(columnas).unique().implode(',')}, ` + campo + ` as campo, count(*) as numero_proyectos, sum(monto) as monto,
					(select count(*) from proyectos) as total, id
					FROM proyectos where `

			var g = []
			opciones.forEach(function(item) {
				g.push(item)
			})
			var h = []
			g.forEach(function(item) {
				for (var i in misNuevasColumnas) {
					h.push({
						[misNuevasColumnas[i]]: item[misNuevasColumnas[i]],
					})
				}
			})

			h.forEach(item => {
				let keys = Object.keys(item)
				item[`${keys}`].forEach(items => {
					values += `'${items.valor}',`
					nuevoValues = values.slice(0, -1)
				})
				cadena += `${Object.keys(item)} in (${nuevoValues}) and `
			})
			sql = cadena.slice(0, -5) + ` group by ` + agrupacion + ` order by ` + agrupacion + ` ASC`
		}
		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'campo': response.rows.item(index).campo,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'monto': parseFloat(response.rows.item(index).monto),
						'total': response.rows.item(index).total,
						'id': response.rows.item(index).id,
						'group_by': agrupacion,
						'porcentaje': account.toFixed((response.rows.item(index).numero_proyectos / response.rows.item(index).total) * 100, 2)
					})
				}
				return Promise.resolve(reportes)
			})
	}

	/* Funcion para traer las columnas. */
	getColumnas = (): any => {
		let columnas = []
		let sql = `PRAGMA table_info('proyectos')`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					columnas.push(
						response.rows.item(index).name
					)
				}
				return Promise.resolve(columnas)
			})
	}

	/* Funcion para obtener los datos de las columnas que se selecciono en los filtros para el grid. */
	obtenerDataCampos = (columnas): any => {
		let campos_data = []
		let columns = collect(columnas).implode(',')

		let select = 'select ' + columns + ' from proyectos order by anio'

		return this.db.executeSql(select, {})
			.then((response) => {
				for (let index = 0; index < response.rows.length; index++) {
					campos_data.push(
						response.rows.item(index),
					)
				}
				return Promise.resolve(campos_data)
			})
			.catch(console.error.bind(console))
	}

	/* Funcion para obtener la data para registrar un reporte. */
	paraGuardarReporte = (agrupacion: string, where: string) => {
		agrupacion === 'año' ? agrupacion = 'anio' : agrupacion === 'dirección' ? agrupacion = 'unidad_negocio' : agrupacion === 'país' ? agrupacion = 'pais' :
			agrupacion === 'Número de propuesta' ? agrupacion = 'numero_propuesta' : agrupacion === 'datos de cliente' ? agrupacion = 'datos_cliente' : agrupacion === 'duración' ? agrupacion = 'duracion' :
			agrupacion === 'fecha de inicio' ? agrupacion = 'fecha_inicio' : agrupacion === 'fecha de término' ? agrupacion = 'fecha_fin' :
			agrupacion === 'Monto total original' ? agrupacion = 'monto_moneda_original' : agrupacion === 'Nombre corto' ? agrupacion = 'nombre_corto' :
			agrupacion === 'Nombre de proyecto' ? agrupacion = 'nombre_proyecto' : agrupacion === 'Número de contrato' ? agrupacion = 'numero_contrato' : ''
		let data = []
		let sql = `select sum(monto) as monto,
					count(*) as numero_proyectos
					FROM proyectos ${this.whereNuevoReporte.slice(0, -4)}
					group by ` + agrupacion + ``
		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					data.push({
						'monto': response.rows.item(index).monto,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
					})
				}
				return Promise.resolve(data)
			})
	}

	/* Funcion para guardar un reporte. */
	saveReporte = (title: string, monto_total: number, numero_proyectos: number): any => {
		let array_id = []

		let insert = `insert into reportes(
				nombre_reporte, total_usd, total_proyectos) values(?, ?, ?)`
		this.db.executeSql(insert, [title, monto_total, numero_proyectos])
			.then(() => console.log('nuevo reporte insertado'))
		.catch(e => console.log(e))

		let last_id = `SELECT max(id) as id from reportes`
		return this.db.executeSql(last_id, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					array_id.push({
						'id': response.rows.item(index).id
					})
				}
				return Promise.resolve(array_id)
			})
	}

	/* Funcion para insertar en reportes agrupacion*/
	insertarReporteAgrupado = (id: number, agrupacion: string): any => {
		agrupacion === 'año' ? agrupacion = 'anio' : agrupacion === 'dirección' ? agrupacion = 'unidad_negocio' : agrupacion === 'país' ? agrupacion = 'pais' : ''
		let insert_grupado = `insert into reportes_agrupacion(
				reporte_id, nombre_columna, orden_agrupacion) values(?, ?, ?)`
		return this.db.executeSql(insert_grupado, [id, agrupacion, '1'])
	}

	/* Funcion para insertar e reportes columans*/
	insertReporteColumnas = (id: number, agrupacion: string): any => {
		agrupacion === 'año' ? agrupacion = 'anio' : agrupacion === 'dirección' ? agrupacion = 'unidad_negocio' : agrupacion === 'país' ? agrupacion = 'pais' : ''
		let insert_grupado = `insert into reportes_columnas(
				reporte_id, nombre_columna) values(?, ?)`
		return this.db.executeSql(insert_grupado, [id, agrupacion])
	}

	/* Funcion para guardar los campos y los valores en la tabla reportes_filtros en la seccion nuevo reporte*/
	insertReporteFiltros = (campos: any[], id: number) => {
		let insert = 'insert into reportes_filtros (reporte_id, nombre_columna, valor) values('
		/* Recorremos el array de las opciones seleccionadas para insertar en el origen de datos. */
		for (var i in campos) { /* otenemos los campos de filtracion. */
			for (var rel in campos[i]) { /* Obtenemos array de los valores de la filtracion. */
				for (var t in campos[i][rel]) { /* Obtenemos Valores de los filtros, */
					let insertColumas = insert + `${id}, '${Object.keys(campos[i]).toString()}'` + ','

					let queryFinal = insertColumas + `'${campos[i][rel][t]}'` + ')'
					/* Registramos las opciones en el origen de datos */
					this.db.executeSql(queryFinal, {})
				}
			}
		}
	}
	/* Funcion consultar el detalle de un reporte dado a un campo. */
	consultaXCampoAgrupado = (campo: string, groupBy: string): any => {
		groupBy === 'año' ? groupBy = 'anio' : groupBy === 'dirección' ? groupBy = 'unidad_negocio' : groupBy === 'país' ? groupBy = 'pais' : ''
		let proyectos = []
		let sql = 'select * from proyectos where ' + groupBy + ' = ' + "'" + campo + "'"

		return this.db.executeSql(sql, {})
			.then((response) => {
				for (let index = 0; index < response.rows.length; index++) {
					proyectos.push({
						'nombre_proyecto': response.rows.item(index).nombre_proyecto,
						'monto': account.formatNumber(response.rows.item(index).monto),
						'monto_moneda_original': account.formatNumber(response.rows.item(index).monto_moneda_original),
						'moneda': response.rows.item(index).moneda,
						'pais': response.rows.item(index).pais,
						'gerencia': response.rows.item(index).gerencia,
						'unidad_negocio': response.rows.item(index).unidad_negocio,
						'numero_contrato': response.rows.item(index).numero_contrato,
						'producto': response.rows.item(index).producto,
						'anio': response.rows.item(index).anio,
						'duracion': response.rows.item(index).duracion,
						'contratante': response.rows.item(index).contratante,
						'datos_cliente': response.rows.item(index).datos_cliente,
						'fecha_inicio': response.rows.item(index).fecha_inicio,
						'fecha_fin': response.rows.item(index).fecha_fin,
						'numero_propuesta': response.rows.item(index).numero_propuesta,
						'anticipo': response.rows.item(index).anticipo,
					})
				}
				return proyectos
			})
	}

	/* Funcion para obtener los distintos valores de agruapcion. */
	selectDistinct = (agrupacion: string): any => {
		let reportes = []
		let sql = 'select distinct(' + agrupacion + ') as registros from proyectos order by ' + agrupacion + ' desc'

		return this.db.executeSql(sql, {})
			.then((response) => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'registros': response.rows.item(index).registros,
					})
				}
				return reportes
			})
	}

	/*Funcion para conseguir la informacion para construir la grafica. */
	paraGraficar = (columnas, agrupacion, where ? ): any => {
		columnas === 'año' ? columnas = 'anio' : columnas === 'dirección' ? columnas = 'unidad_negocio' : columnas === 'país' ? columnas = 'pais' : ''
		let sql = `select ` + columnas + ` as campo , count(*) as numero_proyectos, sum(monto) as monto,
							(select count(*) from proyectos) as total, sum(monto) as monto_filtrado
							FROM proyectos
							where ` + columnas + ` in ('` + where + `')` + ` group by ` + columnas + ` order by ` + columnas + ` asc`
		return this.db.executeSql(sql, {})
	}

	/* Funcion para ver el detalle para el grupo monto total. */
	detallePorMontoTotal = (select, agrupacion, id, filtros): any => {
		let reportes = []
		let filters = []
		let sql: string = ''
		let cadena: string = ''
		let nuevaCadena: string = ''
		let campo = []

		agrupacion === 'año' ? agrupacion = 'anio' : agrupacion === 'dirección' ? agrupacion = 'unidad_negocio' : agrupacion === 'país' ? agrupacion = 'pais' :
			agrupacion === 'Numero de propuesta' ? agrupacion = 'numero_propuesta' : agrupacion === 'datos de cliente' ? agrupacion = 'datos_cliente' : agrupacion === 'duración' ? agrupacion = 'duracion' :
			agrupacion === 'fecha de inicio' ? agrupacion = 'fecha_inicio' : agrupacion === 'fecha de término' ? agrupacion = 'fecha_fin' :
			agrupacion === 'Monto total original' ? agrupacion = 'monto_moneda_original' : agrupacion === 'Nombre corto' ? agrupacion = 'nombre_corto' :
			agrupacion === 'Nombre de proyecto' ? agrupacion = 'nombre_proyecto' : agrupacion === 'Número de contrato' ? agrupacion = 'numero_contrato' : ''

		// Recuperamos nuestros filtros
		filters = filtros.map(item => item.valor)
		campo = filtros.map(item => item.nombre_columna)

		if (filters.length === 0) {
			sql = `select ` + agrupacion + ` as campo , count(*) as numero_proyectos, sum(monto) as monto,
						(select sum(monto) from proyectos) as monto_total, (select count(*) from proyectos) as total_proyectos
						FROM proyectos group by ` + agrupacion + ` order by ` + agrupacion + ` asc`

		} else {
			filters.forEach(item => {
				cadena += `'${item}',`
				nuevaCadena = cadena.slice(0, -1)
			})

			sql = `select ` + agrupacion + ` as campo , count(*) as numero_proyectos, sum(monto) as monto,
						(select sum(monto) from proyectos) as monto_total, (select count(*) from proyectos) as total_proyectos
						FROM proyectos where ${campo[0]} in (${nuevaCadena}) group by ` + agrupacion + ` order by ` + agrupacion + ` asc`

		}

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'campo': response.rows.item(index).campo,
						'monto': response.rows.item(index).monto,
						'monto_total': response.rows.item(index).monto_total,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'total_proyectos': response.rows.item(index).total_proyectos,
						'porcentaje': account.toFixed((response.rows.item(index).numero_proyectos / response.rows.item(index).total_proyectos) * 100, 2)
						// 'porcentaje': account.toFixed((response.rows.item(index).monto / response.rows.item(index).monto_total) * 100, 2)
						// 'porcentaje': account.toFixed((response.rows.item(index).monto / response.rows.item(index).monto_total) * 100, 2)
					})
				}
				return Promise.resolve(reportes)
			})
	}

	/* Funcion para ver el detalle para el grupo numero de proyectos. */
	detallePorNumeroProyectos = (select, agrupacion, id, filtros): any => {
		let reportes = []
		let filters = []
		let sql: string = ''
		let cadena: string = ''
		let nuevaCadena: string = ''
		agrupacion === 'año' ? agrupacion = 'anio' : agrupacion === 'dirección' ? agrupacion = 'unidad_negocio' : agrupacion === 'país' ? agrupacion = 'pais' :
			agrupacion === 'Numero de propuesta' ? agrupacion = 'numero_propuesta' : agrupacion === 'datos de cliente' ? agrupacion = 'datos_cliente' : agrupacion === 'duración' ? agrupacion = 'duracion' :
			agrupacion === 'fecha de inicio' ? agrupacion = 'fecha_inicio' : agrupacion === 'fecha de término' ? agrupacion = 'fecha_fin' :
			agrupacion === 'Monto total original' ? agrupacion = 'monto_moneda_original' : agrupacion === 'Nombre corto' ? agrupacion = 'nombre_corto' :
			agrupacion === 'Nombre de proyecto' ? agrupacion = 'nombre_proyecto' : agrupacion === 'Número de contrato' ? agrupacion = 'numero_contrato' : ''
		// Recuperamos nuestros filtros
		filters = filtros.map(item => item.valor)
		if (filters.length === 0) {
			sql = `select ` + agrupacion + ` as campo , count(*) as numero_proyectos, sum(monto) as monto,
						(select sum(monto) from proyectos) as monto_total, (select count(*) from proyectos) as total_proyectos
						FROM proyectos group by ` + agrupacion + ` order by ` + agrupacion + ` asc`
		} else {
			filters.forEach(item => {
				cadena += `'${item}',`
				nuevaCadena = cadena.slice(0, -1)
			})

			sql = `select ` + agrupacion + ` as campo , count(*) as numero_proyectos, sum(monto) as monto,
						(select sum(monto) from proyectos) as monto_total, (select count(*) from proyectos) as total_proyectos
						FROM proyectos where ${agrupacion} in (${nuevaCadena}) group by ` + agrupacion + ` order by ` + agrupacion + ` asc`
		}

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'campo': response.rows.item(index).campo,
						'monto': response.rows.item(index).monto,
						'total_proyectos': response.rows.item(index).total_proyectos,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'porcentaje': account.toFixed((response.rows.item(index).numero_proyectos / response.rows.item(index).total_proyectos) * 100, 2)
					})
				}
				return Promise.resolve(reportes)
			})
	}

	/* Funcion para obtener los anios para el reporte de direccion  anio para el grupo monto total. */
	distinctAnio() {
		let reportes = []

		let sql = `select distinct(anio) as anio from direccionAnio where anio > 2011  order by anio desc`
		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push(response.rows.item(index).anio)
				}
				return Promise.resolve(reportes)
			})
	}

	/* Funcion para obtener los direcciones para el reporte de direccion  anio para el grupo monto total. */
	distinctDirecciones() {
		let reportes = []

		let sql = `select distinct(unidad_negocio) as unidad_negocio from direccionAnio order by unidad_negocio asc`
		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'unidad_negocio': response.rows.item(index).unidad_negocio
					})
				}
				return Promise.resolve(reportes)
			})
	}


	/* Funcion para obtener los montos de la direccion consultoria. */
	getmontosDireccionesConsultoria = (): any => {
		let reportes = []
		let sql = `select anio, montoUsd
				from direccionAnio
				where anio > 2011 and direccionAnio.unidad_negocio = 'Consultoría'
				group by unidad_negocio, anio
				order by unidad_negocio, anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						anio: response.rows.item(index).anio,
						montoUsd: response.rows.item(index).montoUsd
					})
				}
				return Promise.resolve(reportes)
			})
	}
	/* Funcion para obtener los montos de la direccion Sistemas. */
	getmontosDireccionesSistemas = (): any => {
		let reportes = []
		let sql = `select anio, montoUsd
				from direccionAnio
				where anio > 2011 and direccionAnio.unidad_negocio = 'Desarrollo de sistemas'
				group by unidad_negocio, anio
				order by unidad_negocio, anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						anio: response.rows.item(index).anio,
						montoUsd: response.rows.item(index).montoUsd
					})
				}
				return Promise.resolve(reportes)
			})
	}
	/* Funcion para obtener los montos de la direccion Ingeniería. */
	getmontosDireccionesIngenieria = (): any => {
		let reportes = []
		let sql = `select anio, montoUsd
				from direccionAnio
				where anio > 2011 and direccionAnio.unidad_negocio = 'Ingeniería'
				group by unidad_negocio, anio
				order by unidad_negocio, anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						anio: response.rows.item(index).anio,
						montoUsd: response.rows.item(index).montoUsd
					})
				}
				return Promise.resolve(reportes)
			})
	}
	/* Funcion para obtener los montos de la direccion Sin referencia. */
	getmontosDireccionesSinReferencia = (): any => {
		let reportes = []
		let sql = `select anio, montoUsd
				from direccionAnio
				where anio > 2011 and direccionAnio.unidad_negocio = 'Sin dato'
				group by unidad_negocio, anio
				order by unidad_negocio, anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						anio: response.rows.item(index).anio,
						montoUsd: response.rows.item(index).montoUsd
					})
				}
				return Promise.resolve(reportes)
			})
	}
	/* Funcion para obtener los montos de la direccion Suramérica. */
	getmontosDireccionesSuramerica = (): any => {
		let reportes = []
		let sql = `select anio, montoUsd
				from direccionAnio
				where anio > 2011 and direccionAnio.unidad_negocio = 'Suramérica'
				group by unidad_negocio, anio
				order by unidad_negocio, anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						anio: response.rows.item(index).anio,
						montoUsd: response.rows.item(index).montoUsd
					})
				}
				return Promise.resolve(reportes)
			})
	}

	/* Funcion para obtener el reporte de direccion. */
	reportePorDireccion = () => {
		let reportes = []
		let sql = `select proyectos.unidad_negocio,
						 cast(count(case when proyectos.anio = 2017 then proyectos.anio end) as double)/(select count(*) from proyectos)*100 as [2017],
						 cast(count(case when proyectos.anio = 2016 then proyectos.anio end) as double)/(select count(*) from proyectos)*100 as [2016],
						 cast(count(case when proyectos.anio = 2015 then proyectos.anio end) as double)/(select count(*) from proyectos)*100 as [2015],
						 cast(count(case when proyectos.anio = 2014 then proyectos.anio end) as double)/(select count(*) from proyectos)*100 as [2014],
						 cast(count(case when proyectos.anio = 2013 then proyectos.anio end) as double)/(select count(*) from proyectos)*100 as [2013],
						 cast(count(case when proyectos.anio = 2012 then proyectos.anio end) as double)/(select count(*) from proyectos)*100 as [2012]
					 from proyectos
					LEFT OUTER JOIN anios ON (proyectos.anio = anios.anio)
 					group by proyectos.unidad_negocio order by proyectos.anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'unidad_negocio': response.rows.item(index).unidad_negocio,
						'2012': response.rows.item(index)[2012],
						'2013': response.rows.item(index)[2013],
						'2014': response.rows.item(index)[2014],
						'2015': response.rows.item(index)[2015],
						'2016': response.rows.item(index)[2016],
						'2017': response.rows.item(index)[2017],
					})
				}
				return Promise.resolve(reportes)
			})
			.catch(console.error.bind(console))
	}

	/* Funcion para obtener tabla informativa del reporte por direccion con años. */
	reportePorDireccionTAbla = () => {
		let reportes = []
		let sql = `select proyectos.anio, sum(proyectos.monto) as monto, count(*) as numero_proyectos,
						 cast( count(*) as double )/(select count(*) from proyectos)*100 as porcentaje,
					 	 cast(count(case when proyectos.unidad_negocio = 'Consultoría' then proyectos.unidad_negocio end) as double)/1330*100 as [Consultoría],
						 cast(count(case when proyectos.unidad_negocio = 'Desarrollo de sistemas' then proyectos.unidad_negocio end) as double)/1330*100 as [Desarrollo de sistemas],
						 cast(count(case when proyectos.unidad_negocio = 'Ingeniería' then proyectos.unidad_negocio end) as double)/1330*100 as [Ingeniería],
						 cast(count(case when proyectos.unidad_negocio = 'Sin dato' then proyectos.unidad_negocio end) as double)/1330*100 as [Sin dato],
						 cast(count(case when proyectos.unidad_negocio = 'Sin datobonus' then proyectos.unidad_negocio end) as double)/1330*100 as [Sin datobonus],
						 cast(count(case when proyectos.unidad_negocio = 'Suramérica' then proyectos.unidad_negocio end) as double)/1330*100 as [Suramérica]
					 from proyectos
					LEFT OUTER JOIN anios ON (proyectos.anio = anios.anio)
 					group by proyectos.anio order by proyectos.anio desc`
		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'anio': response.rows.item(index).anio,
						'monto': response.rows.item(index).monto,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'porcentaje': response.rows.item(index).porcentaje,
						'Consultoría': response.rows.item(index)['Suramérica'],
						'Desarrollo de sistemas': response.rows.item(index)['Desarrollo de sistemas'],
						'Ingeniería': response.rows.item(index)['Ingeniería'],
						'Sin dato': response.rows.item(index)['Sin dato'],
						'Sin datobonus': response.rows.item(index)['Sin datobonus'],
						'Suramérica': response.rows.item(index)['Suramérica'],
					})
				}
				return Promise.resolve(reportes)
			})
			.catch(console.error.bind(console));
	}

	/* Funcion para ver el reporte de direcciones con anios y con el grupo monto total. */
	reporteDireccionAnioGrupoMontoTotal = () => {
		let reportes = []
		let sql = `select proyectos.unidad_negocio,
						 cast(count(case when proyectos.anio = 2012 then proyectos.anio end) as double)/(select sum(monto) from proyectos)*100 as [2012],
						 cast(count(case when proyectos.anio = 2013 then proyectos.anio end) as double)/(select sum(monto) from proyectos)*100 as [2013],
						 cast(count(case when proyectos.anio = 2014 then proyectos.anio end) as double)/(select sum(monto) from proyectos)*100 as [2014],
						 cast(count(case when proyectos.anio = 2015 then proyectos.anio end) as double)/(select sum(monto) from proyectos)*100 as [2015],
						 cast(count(case when proyectos.anio = 2016 then proyectos.anio end) as double)/(select sum(monto) from proyectos)*100 as [2016],
						 cast(count(case when proyectos.anio = 2017 then proyectos.anio end) as double)/(select sum(monto) from proyectos)*100 as [2017]
					 from proyectos
					LEFT OUTER JOIN anios ON (proyectos.anio = anios.anio)
 					group by proyectos.unidad_negocio order by proyectos.anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'unidad_negocio': response.rows.item(index).unidad_negocio,
						'2012': response.rows.item(index)[2012],
						'2013': response.rows.item(index)[2013],
						'2014': response.rows.item(index)[2014],
						'2015': response.rows.item(index)[2015],
						'2016': response.rows.item(index)[2016],
						'2017': response.rows.item(index)[2017],
					})
				}
				return Promise.resolve(reportes)
			})
			.catch(console.error.bind(console))

	}

	/* Funcion para ver el reporte de direcciones con anios y con el grupo numero proyectos. */
	reporteDireccionAnioGrupoNumeroProyectos = () => {
		let reportes = []
		let sql = `select proyectos.unidad_negocio,
						 cast(count(case when proyectos.anio = 2017 then proyectos.anio end) as double) as [2017],
						 cast(count(case when proyectos.anio = 2016 then proyectos.anio end) as double) as [2016],
						 cast(count(case when proyectos.anio = 2015 then proyectos.anio end) as double) as [2015],
						 cast(count(case when proyectos.anio = 2014 then proyectos.anio end) as double) as [2014],
						 cast(count(case when proyectos.anio = 2013 then proyectos.anio end) as double) as [2013],
						 cast(count(case when proyectos.anio = 2012 then proyectos.anio end) as double) as [2012]
						  from proyectos
					LEFT OUTER JOIN anios ON (proyectos.anio = anios.anio)
 					group by proyectos.unidad_negocio order by proyectos.anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'unidad_negocio': response.rows.item(index).unidad_negocio,
						'2012': response.rows.item(index)[2012],
						'2013': response.rows.item(index)[2013],
						'2014': response.rows.item(index)[2014],
						'2015': response.rows.item(index)[2015],
						'2016': response.rows.item(index)[2016],
						'2017': response.rows.item(index)[2017],
					})
				}
				return Promise.resolve(reportes)
			})
			.catch(console.error.bind(console))
	}

	/* Funcion para ver la tabla informativa del reporte de direcciones con anios y con el grupo numero proyectos. */
	reporteDireccionAnioGrupoNumeroProyectosTAbla = () => {
		let reportes = []
		let sql = `select proyectos.anio, sum(proyectos.monto) as monto, count(*) as numero_proyectos,
						 cast( count(*) as double )/(select count(*) from proyectos)*100 as porcentaje,
					 	 cast(count(case when proyectos.unidad_negocio = 'Consultoría' then proyectos.unidad_negocio end) as double)/(select count(*) from proyectos)*100 as [Consultoría],
						 cast(count(case when proyectos.unidad_negocio = 'Desarrollo de sistemas' then proyectos.unidad_negocio end) as double)/(select count(*) from proyectos)*100 as [Desarrollo de sistemas],
						 cast(count(case when proyectos.unidad_negocio = 'Ingeniería' then proyectos.unidad_negocio end) as double)/(select count(*) from proyectos)*100 as [Ingeniería],
						 cast(count(case when proyectos.unidad_negocio = 'Sin dato' then proyectos.unidad_negocio end) as double)/(select count(*) from proyectos)*100 as [Sin dato],
						 cast(count(case when proyectos.unidad_negocio = 'Sin datobonus' then proyectos.unidad_negocio end) as double)/(select count(*) from proyectos)*100 as [Sin datobonus],
						 cast(count(case when proyectos.unidad_negocio = 'Suramérica' then proyectos.unidad_negocio end) as double)/(select count(*) from proyectos)*100 as [Suramérica]
					 from proyectos
					LEFT OUTER JOIN anios ON (proyectos.anio = anios.anio)
 					group by proyectos.anio order by proyectos.anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push({
						'anio': response.rows.item(index).anio,
						'monto': response.rows.item(index).monto,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'porcentaje': response.rows.item(index).porcentaje,
						'Consultoría': response.rows.item(index)['Suramérica'],
						'Desarrollo de sistemas': response.rows.item(index)['Desarrollo de sistemas'],
						'Ingeniería': response.rows.item(index)['Ingeniería'],
						'Sin dato': response.rows.item(index)['Sin dato'],
						'Sin datobonus': response.rows.item(index)['Sin datobonus'],
						'Suramérica': response.rows.item(index)['Suramérica'],
					})
				}
				return Promise.resolve(reportes)
			})
			.catch(console.error.bind(console))
	}

	/* Funcion para obtener los anios para el reporte de direccion anio.*/
	distinctAnioFiltros() {
		let reportes = []

		let sql = `select distinct(anio) as anio from direccionAnio order by anio desc`
		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					reportes.push(response.rows.item(index).anio)
				}
				return Promise.resolve(reportes)
			})
	}

	/* Funcion para conseguir la data del filtrado de reporte direccion anios. */
	obtenerDataFiltracion = (direcciones, anios, cadena) => {
		let direccionAnio = []

		let sql = `select sum(monto) as monto, anio, unidad_negocio, count(*) as numero_proyectos, (select count(*)
					from proyectos where anio in (${anios}) and unidad_negocio IN (${cadena})) as total
					from proyectos where unidad_negocio in('${direcciones}')
					and anio in (${anios})
					group by unidad_negocio, anio
					order by anio desc;`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					direccionAnio.push({
						'porcentaje': account.toFixed((response.rows.item(index).numero_proyectos / response.rows.item(index).total) * 100, 2),
						'monto': response.rows.item(index).monto,
						'numero_proyectos': response.rows.item(index).numero_proyectos
					})
				}
				return Promise.resolve(direccionAnio)
			}).catch(console.error.bind(console))
	}
	/* Funcion para conseguir la información del tablero de reporte direccion, anio filtrado. */
	tableroDireccionAniosGeneral = (direcciones, anios, cadena) => {
		let direccionAnio = []

		let sql = `select sum(monto) as monto, anio, unidad_negocio, count(*) as numero_proyectos, (select count(*)
					from proyectos where anio in (${anios}) and unidad_negocio IN (${cadena})) as total
					from proyectos where unidad_negocio in('${direcciones}')
					and anio in (${anios})
					group by anio
					order by anio desc;`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					direccionAnio.push({
						'porcentaje': account.toFixed((response.rows.item(index).numero_proyectos / response.rows.item(index).total) * 100, 2),
						'anio': response.rows.item(index).anio,
						'unidad_negocio': response.rows.item(index).unidad_negocio,
						'monto': response.rows.item(index).monto,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'total': response.rows.item(index).total,
					})
				}
				return Promise.resolve(direccionAnio)
			}).catch(console.error.bind(console))
	}

	/* Funcion consultar el detalle de un reporte direccion, anio filtrado por direccion y anio . */
	reporteDireccionAnioDetalle = (anio: number, direccion: string): any => {
		let proyectos = []
		let sql = `select * from proyectos where anio = ${anio} and unidad_negocio = '${direccion}' order by unidad_negocio ASC`

		return this.db.executeSql(sql, {})
			.then((response) => {
				for (let index = 0; index < response.rows.length; index++) {
					proyectos.push({
						'nombre_proyecto': response.rows.item(index).nombre_proyecto,
						'monto': account.formatNumber(response.rows.item(index).monto),
						'monto_moneda_original': account.formatNumber(response.rows.item(index).monto_moneda_original),
						'moneda': response.rows.item(index).moneda,
						'pais': response.rows.item(index).pais,
						'gerencia': response.rows.item(index).gerencia,
						'unidad_negocio': response.rows.item(index).unidad_negocio,
						'numero_contrato': response.rows.item(index).numero_contrato,
						'producto': response.rows.item(index).producto,
						'anio': response.rows.item(index).anio,
						'duracion': response.rows.item(index).duracion,
						'contratante': response.rows.item(index).contratante,
						'datos_cliente': response.rows.item(index).datos_cliente,
						'fecha_inicio': response.rows.item(index).fecha_inicio,
						'fecha_fin': response.rows.item(index).fecha_fin,
						'numero_propuesta': response.rows.item(index).numero_propuesta,
						'anticipo': response.rows.item(index).anticipo,
					})
				}
				return Promise.resolve(proyectos)
			})
	}

	/* Funcion para obtener la informacion de acuerdo a un filtro en la seccion de nuevo reporte. */
	getFilterData = (filtro) => {
		let filtrado = []
		let sql = `select distinct(${filtro.columna}) as campo from proyectos order by ${filtro.columna} DESC`
		return this.db.executeSql(sql, {})
			.then((response) => {
				for (let index = 0; index < response.rows.length; index++) {
					filtrado.push({
						'campo': response.rows.item(index).campo,
					})
				}
				return Promise.resolve(filtrado)
			})
	}

	/* Funcion para obtener la informacion para llenar la grid de acuerdo a los filtros seleccoinados. */
	getDataGrid = (consulta: string, filtros: string[]) => {
		if (filtros.length === 0) {
			consulta = 'select * from proyectos'
		}

		let proyectos = []
		return this.db.executeSql(consulta, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					proyectos.push(response.rows.item(index))
				}
				return Promise.resolve(proyectos)
			})
			.catch(console.error.bind(console))
	}

	/*Funcion para conseguir la informacion para construir la grafica. */
	paraGraficarNuevoReporte = (columnas, agrupacion): any => {
		let sql = `select ` + columnas + `, ${agrupacion} as campo , count(*) as numero_proyectos, sum(monto) as monto,
						(select count(*) from proyectos) as total, sum(monto) as monto_filtrado,
						(select count(*) FROM proyectos ${this.whereNuevoReporte.slice(0, -4)}) as total_proyectos_filtrados
						FROM proyectos ${this.whereNuevoReporte.slice(0, -4)} group by ` + agrupacion + ` order by ` + agrupacion + ` asc`

		return this.db.executeSql(sql, {})
	}

	/* Funcion para registrar log de la sincronizacion */
	registraLog = () => {
		let sql = `insert into sincronizaciones(fecha_registro) values((select DATETIME('now', 'localtime')))`
		return this.db.executeSql(sql, {})
	}

	/* Obtenemos la ultima fecha de sincronizacion movil. */
	getLastDateSincronizacion = () => {
		let sincronizacion = []
		let sql = 'select * from sincronizaciones order by id DESC limit 1'
		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					sincronizacion.push({
						'fecha_registro': response.rows.item(index).fecha_registro
					})
				}
				return Promise.resolve(sincronizacion)
			})
			.catch(console.error.bind(console))
	}
}
