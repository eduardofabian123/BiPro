import {
	Component
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams
} from 'ionic-angular';
import {
	ReportesDbService
} from '../../../../../services/reportes.db.service'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'
import {
	GraficoGrupo
} from '../../../../../highcharts/modulo.reportes/GraficoGrupo'
import {
	GraficaFiltrosDireccionAnioDetallePage
} from '../.././../../../pages/reporte/detalle-reporte/reporte-direccion-anio/grafica-filtros-direccion-anio/grafica-filtros-direccion-anio-detalle/grafica-filtros-direccion-anio-detalle'
import * as highcharts from 'highcharts';

@IonicPage()
@Component({
	selector: 'page-grafica-filtros-direccion-anio',
	templateUrl: 'grafica-filtros-direccion-anio.html',
})
export class GraficaFiltrosDireccionAnioPage {
	direcciones = []
	anios = []
	options = {}
	data_direcciones = []
	title: string = ''
	proyectos = []
	reporte_tablero = []
	monto_total: string = ''
	total_proyectos: number
	graficoGrupo: GraficoGrupo
	segmento: number = 0

	constructor(public navCtrl: NavController, public navParams: NavParams, private reporteService: ReportesDbService) {
		this.direcciones = navParams.get('direccion')
		this.anios = navParams.get('anios')
		this.segmento = navParams.get('segmento')
		this.title = collect(this.anios).implode(',');
		console.log(this.segmento)

	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GraficaFiltrosDireccionAnioPage');
		this.cargaGrafica()
	}

	/* Funcion que nos ayuda a obtener las datos para graficar. */
	async cargaGrafica() {
		var miGlobal = this
		var series = []
		var cadena: string = ''
		let indicador: string = ''
		let title: string = ''
		series.splice(0, series.length)
		this.direcciones.forEach(item => {
			cadena += `'${item}',`
		})
		cadena = cadena.slice(0, -1)

		/*Iteramos las direcciones seleccionadas y vamos obteniendo la informacion necesaria para graficar.*/
		await this.direcciones.forEach(function callback(item, index) {
				var res = []

				/* Funcion para obtener la informacion por dirección selecconado. */
				miGlobal.dataDirecciones(item, miGlobal.anios, cadena).then(x => {
					x.forEach(item => {
						res.push(parseFloat(item))
					})
				})
				series.push({
						'name': item,
						'data': res
					})
					/* Funcion para obtener la informacion del tablero informativo*/
				miGlobal.tableroInfomativo(item, miGlobal.anios, cadena).then(response => {
					/* Obtenemos el total de proyectos.*/
					miGlobal.total_proyectos = collect(response).sum('numero_proyectos')
						/* Obtenemos la suma total del monto en USD*/
					miGlobal.monto_total = account.formatNumber(collect(response).sum('monto'))

					let ordenados = collect(response).sortByDesc('anio').all()
					let proyectos = ordenados.map(function(item) {
						return {
							'porcentaje': item.porcentaje,
							'anio': item.anio,
							'unidad_negocio': item.unidad_negocio,
							'monto': account.formatNumber(item.monto),
							'numero_proyectos': item.numero_proyectos,
							'total': item.total,
						}
					})
					miGlobal.proyectos = proyectos
				})
			})
			/* Validamos el indicador en donde actualmente nos encontramos. */
		this.segmento === 1 ? (indicador = '%', title = 'Direcciones por porcentaje de participación') :
			this.segmento === 2 ? (indicador = 'USD', title = 'Direcciones por monto total USD') :
			this.segmento === 3 ? (indicador = '#', title = 'Direcciones por número de proyectos') : ''

		/*Lamamos la funcion para graficar. */
		setTimeout(() => {
			this.showGrafica(this.anios.sort((function(a, b) {
				return b - a
			})), series, indicador, title)
		}, 2000)
	}

	/* Funcion realizar la consulta necesaria al origen de datos para obtener la data de las direccciones selecionadas.*/
	async dataDirecciones(direccion, anio, cadena) {
		var miGlobal = this

		this.data_direcciones.splice(0, this.data_direcciones.length)
			/* Funcion que nos ayudara a obtener la data por direccion y anio*/
		await this.reporteService.obtenerDataFiltracion(direccion, anio, cadena)
			.then(response => {
				let porcentajes = []
				let usd = []
				let numeroProyectos = []

				/* Para visualizar los proyectos en porcentaje. */
				if (this.segmento == 1) {
					porcentajes = collect(response).implode('porcentaje', ',');
					miGlobal.data_direcciones = JSON.parse('[' + porcentajes + ']');
				}

				/* Para visualizar los proyectos en monto total USD. */
				if (this.segmento == 2) {
					usd = collect(response).implode('monto', ',');
					miGlobal.data_direcciones = JSON.parse('[' + usd + ']');
				}

				/* Para visualizar los proyectos en numero de proyectos. */
				if (this.segmento == 3) {
					numeroProyectos = collect(response).implode('numero_proyectos', ',');
					miGlobal.data_direcciones = JSON.parse('[' + numeroProyectos + ']');
				}

			})

		return miGlobal.data_direcciones
	}

	/* Funcion para obtener la informacion del tablero informativo*/
	async tableroInfomativo(direcciones: string, anios: number[], cadena: string) {
		var miGlobal = this
		this.reporte_tablero.splice(0, this.reporte_tablero.length)
			/* Funcion para hacer la consulta al origen de datos y obtener la data para el tablero. */
		await this.reporteService.tableroDireccionAniosGeneral(direcciones, anios, cadena)
			.then(response => {
				response.forEach(item => {
					miGlobal.reporte_tablero.push({
						'porcentaje': item.porcentaje,
						'anio': item.anio,
						'unidad_negocio': item.unidad_negocio,
						'monto': item.monto,
						'numero_proyectos': item.numero_proyectos,
						'total': item.total,
					})
				})
			})
		return miGlobal.reporte_tablero
	}

	/* Funcion para ver el detalle general del reporte direccion anio filtrado(direccion, anio). */
	verDetalle = (direccion, anio, monto) => {
		this.navCtrl.push(GraficaFiltrosDireccionAnioDetallePage, {
			'direccion': direccion,
			'anio': anio,
			'monto': monto
		})
	}

	/* Funcion para visualizar la grafica. */
	showGrafica = (categorias: any[], serie: any[], indicador: string, title: string) => {
		highcharts.chart('containerFiltro', {
			chart: {
				type: 'column'
			},
			title: {
				text: title
			},
			xAxis: {
				categories: categorias,
				crosshair: true
			},
			yAxis: {
				min: 0,
				title: {
					text: title
				}
			},
			tooltip: {
				headerFormat: '<span style="font-size:10px">{point.key}</span><table>',
				pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y:,.2f} ' + indicador + '</b></td></tr>',
				footerFormat: '</table>',
				shared: true,
				useHTML: true
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0
				}
			},
			series: serie
		})
	}
}