import {
	Injectable
} from '@angular/core'
import {
	SQLite,
	SQLiteObject
} from '@ionic-native/sqlite'
import * as account from 'accounting-js'
import {
	ReportesDbService
} from './reportes.db.service'
import {
	SQLitePorter
} from '@ionic-native/sqlite-porter';
import * as moment from 'moment'

@Injectable()

/* Clase para crear la base de datos. */
export class DbService {
	db: SQLiteObject = null
	sqlite: SQLite = null;
	fetchData = {}

	constructor(public reporteService: ReportesDbService,
		private sqlitePorter: SQLitePorter) {
		this.sqlite = new SQLite();
	}

	/* Creamos la base de datos. */
	openDatabase() {
		// this.sqlite.deleteDatabase({
		// 	name: 'developer.db',
		// 	location: 'default',
		// }).then(() => {
		// 	console.log('database eliminada')

		// })
		return this.sqlite.create({
				name: 'developer.db',
				location: 'default',
				// createFromLocation: 1
			})
			.then((db: any) => {
				this.db = db

				/* Inicio mi servicio para los reportes. */
				this.reporteService.initDb(db)
			})

	}

	/* Creamos la tabla para almacenar los proyectos. */
	createTable() {
		let sql = ''
		sql = `
			create table if not exists proyectos(
				id integer primary key autoincrement,
				numero integer,
				nombre_proyecto text,
				nombre_corto text,
				contrato text,
				monto double(30,2),
				monto_moneda_original integer,
				moneda text,
				pais text,
				gerencia text,
				unidad_negocio text,
				numero_contrato text,
				producto text,
				anio integer,
				duracion text,
				contratante text,
				datos_cliente text,
				fecha_inicio date,
				fecha_fin date,
				numero_propuesta text,
				anticipo text,
				created_at numeric)`

		this.db.executeSql(sql, {})
			.then(() => {})
			.catch(e => console.log(e))

		// this.sqlitePorter.exportDbToSql(this.db)
		// 	.then(res => {
		// 		console.log(res)

		// 	})
		// 	.catch(e => console.error(e))
	}

	/* Insertamos los datos. */
	insertaDatos(proyectos) {
		let drop = 'delete from proyectos'
		this.db.executeSql(drop, {})
			.then(() => console.log('tabla proyectos elimianada'))
			.catch(e => console.log(e));

		proyectos.data.forEach(item => {
			let sql = `insert into proyectos(numero,
					nombre_proyecto, nombre_corto, contrato,
			 		monto, monto_moneda_original, moneda, pais,
			 		gerencia, unidad_negocio,
			 		numero_contrato, producto,
			 		anio, duracion, contratante,
			 		datos_cliente, fecha_inicio,
			 		fecha_fin, numero_propuesta,
			 		anticipo, created_at) values(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`

			this.db.executeSql(sql, [
					item.numero,
					item.nombre_proyecto,
					item.nombre_corto,
					item.contrato,
					parseFloat(item.montoUsd),
					parseFloat(item.monto),
					item.moneda,
					item.pais,
					item.gerencia,
					item.unidad_negocio,
					item.numero_contrato,
					item.producto,
					item.anio,
					item.duracion,
					item.contratante,
					item.datos_cliente,
					item.fecha_inicio,
					item.fecha_fin,
					item.numero_propuesta,
					item.anticipo,
					item.created_at,
				]).then(() => console.log('regustros insertados'))
				.catch(e => console.log(e))
		})
		// this.sqlitePorter.exportDbToSql(this.db)
		// 	.then(res => {
		// 		console.log(res)

		// 	})
		// 	.catch(e => console.error(e))
	}

	/* Obtenemos las datos de los proyectos. */
	getProyectos() {
		let proyectos = []
		let sql = 'select * from proyectos order by nombre_proyecto ASC'

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
						'anio': response.rows.item(index).anio.toString(),
						'duracion': response.rows.item(index).duracion,
						'contratante': response.rows.item(index).contratante,
						'datos_cliente': response.rows.item(index).datos_cliente,
						'fecha_inicio': moment(response.rows.item(index).fecha_inicio).format('YYYY-MM-DD'),
						'fecha_fin': moment(response.rows.item(index).fecha_fin).format('YYYY-MM-DD'),
						'numero_propuesta': response.rows.item(index).numero_propuesta,
						'anticipo': response.rows.item(index).anticipo,
						'created_at': response.rows.item(index).created_at,
					})
				}
				return proyectos
			})
	}

	/* Funcion para buscar los proyectos dado a los filtros seleccionados. */
	buscaProyecto = (val, filtros): any => {
		let proyectos = []

		for (let i in filtros) {
			let sql = `select * from proyectos where replace(${filtros[i].opcion}, 'á', 'a')
			|| replace(${filtros[i].opcion}, 'é', 'e')
			|| replace(${filtros[i].opcion}, 'í', 'i')
			|| replace(${filtros[i].opcion}, 'ó', 'o')
			|| replace(${filtros[i].opcion}, 'ú', 'u')
			like '%${val}%' order by nombre_proyecto ASC`
			console.log(sql)

			this.db.executeSql(sql, {})
				.then((response) => {
					for (let index = 0; index < response.rows.length; index++) {
						proyectos.push({
							'nombre_proyecto': response.rows.item(index).nombre_proyecto,
							'moneda': response.rows.item(index).moneda,
							'monto': account.formatNumber(response.rows.item(index).monto),
							'monto_moneda_original': account.formatNumber(response.rows.item(index).monto_moneda_original),
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
					Promise.resolve(proyectos)
				})
		}
		return proyectos
	}

	/* Funcion para consultar los proyectos por pais. */
	consultaXPais = (): any => {
		let proyectos = []
		let sql = `select pais, count(*) as numero_proyectos, sum(monto) as monto,
					(select count(*) from proyectos) as total
					FROM proyectos
					group by pais order by pais asc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					proyectos.push({
						'pais': response.rows.item(index).pais,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'monto': parseInt(response.rows.item(index).monto),
						'total': response.rows.item(index).total,
						'porcentaje': account.toFixed((response.rows.item(index).numero_proyectos / response.rows.item(index).total) * 100, 2)
					})
				}
				return Promise.resolve(proyectos)
			})
	}

	/* Funcion para traer los proyectos de un pais dado. */
	consultaPaisAgrupado = (pais: string): any => {
		let proyectos = []
		let sql = 'select * from proyectos where pais = ' + "'" + pais + "'"

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

	/* Funcion para la consulta de proyectos por anio. */
	consultaXAnio = (): any => {
		let proyectos = []
		let sql = `select anio, count(*) as numero_proyectos, sum(monto) as monto,
					(select count(*) from proyectos) as total
					FROM proyectos
					group by anio order by anio desc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					proyectos.push({
						'anio': response.rows.item(index).anio,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'monto': parseInt(response.rows.item(index).monto),
						'total': response.rows.item(index).total,
						'porcentaje': account.toFixed((response.rows.item(index).numero_proyectos / response.rows.item(index).total) * 100, 2)
					})
				}
				return Promise.resolve(proyectos)
			})
	}

	/* Funcion para traer los proyectos de un anio dado. */
	consultaAnioAgrupado = (anio: number): any => {
		let proyectos = []
		let sql = 'select * from proyectos where anio = ' + "'" + anio + "'"

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

	/* Funcion para la consulta de proyectos por gerencia. */
	consultaXGerencia = (): any => {
		let proyectos = []
		let sql = `select gerencia, count(*) as numero_proyectos, sum(monto) as monto,
					(select count(*) from proyectos) as total
					FROM proyectos
					group by gerencia order by gerencia asc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					proyectos.push({
						'gerencia': response.rows.item(index).gerencia,
						'numero_proyectos': response.rows.item(index).numero_proyectos,
						'monto': parseInt(response.rows.item(index).monto),
						'total': response.rows.item(index).total,
						'porcentaje': account.toFixed((response.rows.item(index).numero_proyectos / response.rows.item(index).total) * 100, 2)
					})
				}
				return Promise.resolve(proyectos)
			})
	}

	/* Funcion para traer los proyectos de un gerencia dado. */
	consultaGerenciaAgrupado = (gerencia: string): any => {
		let proyectos = []
		let sql = 'select * from proyectos where gerencia = ' + "'" + gerencia + "'"

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

	/* Funcion para la consulta de proyectos por cliente. */
	consultaXCliente = (): any => {
		let proyectos = []
		let sql = `select id, contratante, monto
					FROM proyectos
					order by contratante asc`

		return this.db.executeSql(sql, {})
			.then(response => {
				for (let index = 0; index < response.rows.length; index++) {
					proyectos.push({
						'id': response.rows.item(index).id,
						'contratante': response.rows.item(index).contratante,
						'monto': parseInt(response.rows.item(index).monto),
					})
				}

				return Promise.resolve(proyectos)
			})
	}

	/* Funcion para traer los proyectos de un cliente dado. */
	consultaClienteAgrupado = (contratante: string): any => {
		let proyectos = []
		let sql = 'select * from proyectos where contratante = ' + "'" + contratante + "'"

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

	/* Funcion para crear la tabla de reportes. */
	creaTablaReportes() {
		let sql = `
			create table if not exists reportes(
				id integer primary key autoincrement,
				nombre_reporte text,
				total_usd integer,
				total_proyectos integer
				)
		`;

		return this.db.executeSql(sql, {})
			.then(() => console.log('tabla de reportes creada'))
			.catch(e => console.log(e))
	}

	/* Funcion para crear la tabla de reportesColumnas. */
	creaTablaReporteColumnas() {
		let sql = `
			create table if not exists reportes_columnas(
				id integer primary key autoincrement,
				reporte_id integer,
				nombre_columna text,
				FOREIGN KEY(reporte_id) REFERENCES reportes(id)
			)`;

		return this.db.executeSql(sql, {})
			.then(() => console.log('tabla de reportes columnas creada'))
			.catch(e => console.log(e))
	}

	/* Funcion para crear la tabla de reportesFiltros. */
	creaTablaReporteFiltros() {
		let sql = `
			create table if not exists reportes_filtros(
				id integer primary key autoincrement,
				reporte_id integer,
				nombre_columna text,
				valor text,
				FOREIGN KEY(reporte_id) REFERENCES reportes(id)
			)`;

		return this.db.executeSql(sql, {})
			.then(() => console.log('tabla de reportes filtros creada'))
			.catch(e => console.log(e))
	}

	/* Funcion para crear la tabla de reporteAgrupaciones. */
	creaTablaReporteAgrupaciones() {
		let sql = `
			create table if not exists reportes_agrupacion(
				id integer primary key autoincrement,
				reporte_id integer,
				nombre_columna text,
				orden_agrupacion text,
				FOREIGN KEY(reporte_id) REFERENCES reportes(id)
			)`;

		return this.db.executeSql(sql, {})
			.then(() => console.log('tabla de reportes agrupacion creada'))
			.catch(e => console.log(e))
	}

	/* Funcion para crear el catalogo de anios. */
	createTableAnios() {
		let sql = `CREATE TABLE anios (
				id integer PRIMARY KEY AUTOINCREMENT,
				anio integer );`
		return this.db.executeSql(sql, {})
			.then(() => console.log('tabla de anios creada'))
			.catch(e => console.log(e))
	}

	createTableDireccionAnios() {
		let sql = `CREATE TABLE direccionAnio (
					id INTEGER PRIMARY KEY AUTOINCREMENT UNIQUE,
					anio INTEGER,
					unidad_negocio INTEGER,
					montoUsd INTEGER
				);`
		return this.db.executeSql(sql, {})
			.then(() => console.log('tabla de direccionnanios creada'))
			.catch(e => console.log(e))
	}

	insertDireccionAnios() {
		let insertAnios = `insert into direccionAnio (anio, unidad_negocio, montoUsd)
							select anio,  unidad_negocio, sum(monto)  as monto from proyectos group by unidad_negocio, anio order by anio desc`
		this.db.executeSql(insertAnios, {})
			.then(() => console.log('regustros insertados en tabla de direccion anios'))
			.catch(e => console.log(e))
	}

	// inserta los anios
	insertAnios() {
		let insertAnios = ` insert into anios(anio) select distinct(anio) from proyectos`
		this.db.executeSql(insertAnios, {})
			.then(() => console.log('regustros insertados en tabla de anios'))
			.catch(e => console.log(e))
	}
	/* Funcion para insertar datos en la tabla de reportes */
	insertaDatosTablaReportes() {
		let pais = ''
		let anio = ''
		let gerencia = ''
		let cliente = ''
		let producto = ''
		let diireccion = ''
		let direccion_anio = ''

		pais = `insert into reportes(nombre_reporte,total_usd, total_proyectos) values('Reporte por país', (select sum(monto) from proyectos), (select count(*) from proyectos));`
		this.db.executeSql(pais, {})
			.then(() => console.log('regustros insertados en tabla reportes'))
			.catch(e => console.log(e))

		anio = `
			insert into reportes(nombre_reporte,total_usd, total_proyectos) values('Reporte por año', (select sum(monto) from proyectos), (select count(*) from proyectos));`
		this.db.executeSql(anio, {})
			.then(() => console.log('regustros insertados en tabla reportes'))
			.catch(e => console.log(e))

		diireccion = `
			insert into reportes(nombre_reporte,total_usd, total_proyectos) values('Reporte por dirección',
			(select sum(monto) from proyectos), (select count(*) from proyectos));`
		this.db.executeSql(diireccion, {})
			.then(() => console.log('regustros insertados en tabla reportes'))
			.catch(e => console.log(e))

		gerencia = `
			insert into reportes(nombre_reporte,total_usd, total_proyectos) values('Reporte por gerencia', (select sum(monto) from proyectos), (select count(*) from proyectos));`
		this.db.executeSql(gerencia, {})
			.then(() => console.log('regustros insertados en tabla reportes'))
			.catch(e => console.log(e))

		producto = `
			insert into reportes(nombre_reporte,total_usd, total_proyectos) values('Reporte por producto',
			(select sum(monto) from proyectos), (select count(*) from proyectos));`
		this.db.executeSql(producto, {})
			.then(() => console.log('regustros insertados en tabla reportes'))
			.catch(e => console.log(e))

		cliente = `
			insert into reportes(nombre_reporte,total_usd, total_proyectos) values('Reporte por cliente',
			(select sum(monto) from proyectos), (select count(*) from proyectos));`
		this.db.executeSql(cliente, {})
			.then(() => console.log('regustros insertados en tabla reportes'))
			.catch(e => console.log(e))

		direccion_anio = `
			insert into reportes(nombre_reporte,total_usd, total_proyectos) values('Reporte por dirección y años',
			(select sum(monto) from proyectos), (select count(*) from proyectos));`
		this.db.executeSql(direccion_anio, {})
			.then(() => console.log('regustros insertados con datos direccion anios'))
			.catch(e => console.log(e))
	}

	/* Funcion para insertar datos en la tabla de reportes_columnas */
	insertaDatosTablaReportesColunas() {
		let pais = `insert into reportes_columnas(
				reporte_id, nombre_columna) values(?, ?)`
		this.db.executeSql(pais, ['1', 'pais'])
			.then(() => console.log('regustros insertados en tabla reportes columnas'))
			.catch(e => console.log(e))

		let anio = `insert into reportes_columnas(
				reporte_id, nombre_columna) values(?, ?)`
		this.db.executeSql(anio, ['2', 'anio'])
			.then(() => console.log('regustros insertados en tabla reportes columnas'))
			.catch(e => console.log(e))

		let direccion = `insert into reportes_columnas(
				reporte_id, nombre_columna) values(?, ?)`
		this.db.executeSql(direccion, ['3', 'unidad_negocio'])
			.then(() => console.log('regustros insertados en tabla reportes columnas'))
			.catch(e => console.log(e))

		let gerencia = `insert into reportes_columnas(
				reporte_id, nombre_columna) values(?, ?)`
		this.db.executeSql(gerencia, ['4', 'gerencia'])
			.then(() => console.log('regustros insertados en tabla reportes columnas'))
			.catch(e => console.log(e))

		let producto = `insert into reportes_columnas(
				reporte_id, nombre_columna) values(?, ?)`
		this.db.executeSql(producto, ['5', 'producto'])
			.then(() => console.log('regustros insertados en tabla reportes columnas'))
			.catch(e => console.log(e))

		let cliente = `insert into reportes_columnas(
				reporte_id, nombre_columna) values(?, ?)`
		this.db.executeSql(cliente, ['6', 'contratante'])
			.then(() => console.log('regustros insertados en tabla reportes columnas'))
			.catch(e => console.log(e))

		/* insercion para el reporte de direccion con años*/
		let direccion_anios = `insert into reportes_columnas(
				reporte_id, nombre_columna) values(?, ?)`
		this.db.executeSql(direccion_anios, ['7', 'unidad_negocio'])
			.then(() => console.log('regustros insertados epara el reporte dicreccion con anios'))
			.catch(e => console.log(e))

	}

	/* Funcion para insertar datos en la tabla de reportes_agrupacion */
	insertaDatosTablaReportesAgrupacion() {
		let pais = `insert into reportes_agrupacion(
				reporte_id, nombre_columna, orden_agrupacion) values(?, ?, ?)`
		this.db.executeSql(pais, ['1', 'pais', '1'])
			.then(() => console.log('regustros insertados en tabla reportes agrupacion'))
			.catch(e => console.log(e))

		let anio = `insert into reportes_agrupacion(
				reporte_id, nombre_columna, orden_agrupacion) values(?, ?, ?)`
		this.db.executeSql(anio, ['2', 'anio', '1'])
			.then(() => console.log('regustros insertados en tabla reportes agrupacion'))
			.catch(e => console.log(e))

		let direccion = `insert into reportes_agrupacion(
				reporte_id, nombre_columna, orden_agrupacion) values(?, ?, ?)`
		this.db.executeSql(direccion, ['3', 'unidad_negocio', '1'])
			.then(() => console.log('regustros insertados en tabla reportes agrupacion'))
			.catch(e => console.log(e))

		let gerencia = `insert into reportes_agrupacion(
				reporte_id, nombre_columna, orden_agrupacion) values(?, ?, ?)`
		this.db.executeSql(gerencia, ['4', 'gerencia', '1'])
			.then(() => console.log('regustros insertados en tabla reportes agrupacion'))
			.catch(e => console.log(e))

		let producto = `insert into reportes_agrupacion(
				reporte_id, nombre_columna, orden_agrupacion) values(?, ?, ?)`
		this.db.executeSql(producto, ['5', 'producto', '1'])
			.then(() => console.log('regustros insertados en tabla reportes agrupacion'))
			.catch(e => console.log(e))

		let cliente = `insert into reportes_agrupacion(
				reporte_id, nombre_columna, orden_agrupacion) values(?, ?, ?)`
		this.db.executeSql(cliente, ['6', 'contratante', '1'])
			.then(() => console.log('regustros insertados en tabla reportes agrupacion'))
			.catch(e => console.log(e))

		let direccion_anios = `insert into reportes_agrupacion(
				reporte_id, nombre_columna, orden_agrupacion) values(?, ?, ?)`
		this.db.executeSql(direccion_anios, ['7', 'unidad_negocio', '1'])
			.then(() => console.log('regustros insertados en tabla reportes agrupacion para el reporte direccion anios'))
			.catch(e => console.log(e))
	}

	delete() {
		// let proyectos = `drop table if exists proyectos`
		// this.db.executeSql(proyectos, {})
		// 	.then(() => console.log('proyectos eliminados'))
		// 	.catch(e => console.log(e))

		let anio = `drop table if exists reportes`
		this.db.executeSql(anio, {})
			.then(() => console.log('deleted'))
			.catch(e => console.log(e))

		let rc = `drop table if exists reportes_columnas`
		this.db.executeSql(rc, {})
			.then(() => console.log('deleted reportes_columnas'))
			.catch(e => console.log(e))

		let rf = `drop table if exists reportes_filtros`
		this.db.executeSql(rf, {})
			.then(() => console.log('deleted'))
			.catch(e => console.log(e))

		let ra = `drop table if exists reportes_agrupacion`
		this.db.executeSql(ra, {})
			.then(() => console.log('deleted'))
			.catch(e => console.log(e))

		let anios = `drop table if exists anios`
		this.db.executeSql(anios, {})
			.then(() => console.log('anios deleted'))
			.catch(e => console.log(e))

		let direccionAnio = `drop table if exists direccionAnio`
		this.db.executeSql(direccionAnio, {})
			.then(() => console.log('direccionAnio deleted'))
			.catch(e => console.log(e))

		// let sincronizaciones = `drop table sincronizaciones`
		// this.db.executeSql(sincronizaciones, {})
		// 	.then(() => console.log('sincronizaciones eleiminadasd'))
		// 	.catch(e => console.log(e))
	}

	/* Creamos la tabla para almacenar un log de las sincronizaciones. */
	createTableSincronixzaciones() {
		let sql = 'create table if not exists sincronizaciones(id integer PRIMARY KEY AUTOINCREMENT, fecha_registro numeric)'
		return this.db.executeSql(sql, {})
			.then(() => console.log('tabla creada sincronizaciones'))
			.catch(e => console.log(e))
	}

	busquedaProyectos = (busqueda: string) => {
		let proyectos = []
		let sql = `select * from proyectos where producto like '%${busqueda}%' or anio like '%${busqueda}%' or nombre_proyecto like '%${busqueda}%'
						or contratante like '%${busqueda}%' or datos_cliente like '%${busqueda}%'`

		return this.db.executeSql(sql, {})
			.then((response) => {
				for (let index = 0; index < response.rows.length; index++) {
					proyectos.push({
						'nombre_proyecto': response.rows.item(index).nombre_proyecto,
						'moneda': response.rows.item(index).moneda,
						'monto': account.formatNumber(response.rows.item(index).monto),
						'monto_moneda_original': account.formatNumber(response.rows.item(index).monto_moneda_original),
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
}
