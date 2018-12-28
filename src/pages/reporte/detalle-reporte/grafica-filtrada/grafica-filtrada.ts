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
} from '../../../../services/reportes.db.service'
import * as collect from 'collect.js/dist'
import {
	DetalleReporteAgrupadoPage
} from '../../../reporte/detalle-reporte/detalle-reporte-agrupado/detalle-reporte-agrupado'
import {
	Grafico
} from '../../../../highcharts/modulo.reportes/Grafico'
import * as account from 'accounting-js'
import * as highcharts from 'highcharts';

@IonicPage()
@Component({
	selector: 'page-grafica-filtrada',
	templateUrl: 'grafica-filtrada.html',
})

export class GraficaFiltradaPage {
	reportes = []
	options: Object
	title: string = ''
	monto_total: string = ''
	total_proyectos: number
	campo_agrupacion: string = ''
	id: number = 0
	categorias = []
	grafico: Grafico
	segmento: number = 0
	dataFiltrada = []

	constructor(public navCtrl: NavController, public navParams: NavParams, private reporteService: ReportesDbService) {
		this.dataFiltrada = navParams.get('data_grafica')

		this.campo_agrupacion = navParams.get('groupBy')
		this.categorias = navParams.get('categorias')
		this.id = navParams.get('id')
		this.segmento = navParams.get('segmento')
		this.reportes = collect(this.dataFiltrada).unique('campo').toArray()
		this.total_proyectos = collect(this.reportes).sum('numero_proyectos')
		this.monto_total = account.formatNumber(collect(this.reportes).sum('monto_filtrado'))

		/* Para visualizar el titulo de la vista activa.*/
		let titulo = collect(this.reportes).unique('campo').toArray()
		this.title = collect(titulo).implode('campo', ',')
		this.campo_agrupacion === 'anio' ? this.campo_agrupacion = 'año' : this.campo_agrupacion === 'unidad_negocio' ? this.campo_agrupacion = 'dirección' : this.campo_agrupacion === 'pais' ? this.campo_agrupacion = 'país' : ''
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GraficaFiltradaPage poncho')
		this.muestraGrafica()
	}
	ionViewDidLeave() {
		this.title = ''
	}

	/* Funcion para visualizar la grafica con los filtros seleccionados. */
	muestraGrafica = () => {
		this.segmento === 3 ? (this.filtraNumeroProyectos()) : this.segmento === 2 ? (this.filtraMontoUsd()) : this.segmento === 1 ? (this.filtraPorcentajes()) : ''
	}

	/* Funcion para graficar por porcentajes. */
	filtraPorcentajes = () => {
		let data = []
		this.reportes.forEach(items => {
			console.log(items)
			data.push({
				name: items.campo,
				y: (parseFloat(items.numero_proyectos) / this.total_proyectos) * 100
			})
		})

		this.campo_agrupacion === 'año' ? this.campo_agrupacion = 'anio' : this.campo_agrupacion === 'dirección' ? this.campo_agrupacion = 'unidad_negocio' : this.campo_agrupacion === 'país' ? this.campo_agrupacion = 'pais' : ''
		//console.log('mi campo' + this.campo_agrupacion)

		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		//this.showGraficaFiltrada(data, this.campo_agrupacion, 'Proyectos agrupados por ' + this.campo_agrupacion, ' %', 'Porcentaje total de participación por ' + this.campo_agrupacion)
		this.showGrafica(data, this.campo_agrupacion, 'Proyectos agrupados por ' + this.campo_agrupacion, '', 'Porcentaje total de participación por ' + this.campo_agrupacion)
	}

	/* Funcion para graficar por monto usd. */
	filtraMontoUsd = () => {

		let data = []
		this.reportes.forEach(items => {
			data.push({
				name: items.campo,
				y: parseFloat(items.monto_filtrado)
			})
		})
		this.campo_agrupacion === 'año' ? this.campo_agrupacion = 'anio' : this.campo_agrupacion === 'dirección' ? this.campo_agrupacion = 'unidad_negocio' : this.campo_agrupacion === 'país' ? this.campo_agrupacion = 'pais' : ''

		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		//this.grafico = new Grafico(data, this.campo_agrupacion, 'Proyectos agrupados por ' + this.campo_agrupacion, ' USD', 'Monto total USD por ' + this.campo_agrupacion),
		//	this.options = this.grafico.graficaBar()
		this.showGrafica(data, this.campo_agrupacion, 'Proyectos agrupados por ' + this.campo_agrupacion, '', 'Porcentaje total de participación por ' + this.campo_agrupacion)
	}

	/* Funcion para graficar por numero de proyectos. */
	filtraNumeroProyectos = () => {
		let data = []

		this.reportes.forEach(items => {
			data.push({
				name: items.campo,
				y: parseFloat(items.numero_proyectos)
			})
		})
		
		this.campo_agrupacion === 'año' ? this.campo_agrupacion = 'anio' : this.campo_agrupacion === 'dirección' ? this.campo_agrupacion = 'unidad_negocio' : this.campo_agrupacion === 'país' ? this.campo_agrupacion = 'pais' : ''
		this.showGrafica(data, this.campo_agrupacion, 'Proyectos agrupados por ' + this.campo_agrupacion, '', 'Porcentaje total de participación por ' + this.campo_agrupacion)


		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		//this.grafico = new Grafico(data, this.campo_agrupacion, 'Proyectos agrupados por ' + this.campo_agrupacion, ' #', 'Número de proyectos por ' + this.campo_agrupacion),
		//	this.options = this.grafico.graficaBar()
	}

	/* Funcion para ver el detalle de los proyectos segun la opcion que se escoja. */
	verProyectosAgrupados = (group_by: string, campo: string, monto_total: string): void => {
		this.campo_agrupacion === 'año' ? this.campo_agrupacion = 'anio' : this.campo_agrupacion === 'dirección' ? this.campo_agrupacion = 'unidad_negocio' : this.campo_agrupacion === 'país' ? this.campo_agrupacion = 'pais' : ''
		this.navCtrl.push(DetalleReporteAgrupadoPage, {
			'campo': campo,
			'monto_total': monto_total,
			'groupBy': this.campo_agrupacion
		})
	}

	/* Funcion para visualizar la grafica. */
	showGraficaFiltrada = (data: any[], serieName: string, titleName: string, grupo: string, indicador) => {
		highcharts.chart('filter', {
			chart: {
				type: 'column',
			},
			title: {
				text: titleName
			},
			xAxis: {
				type: 'category'
			},
			yAxis: [{
				labels: {
					format: `{value} ${grupo}`
				},
				title: {
					text: indicador
				},
			}],
			legend: {
				enabled: false
			},
			plotOptions: {
				series: {
					dataLabels: {
						enabled: true,
						format: `{point.y:,.2f} ${grupo}`,
					}
				}
			},

			tooltip: {
				headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
				pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:,.2f} ' + grupo + '</b> del total<br/>'
			},

			series: [{
				data: data,
				name: serieName,
			}],
		})
	}

	/* Funcion para visualizar la grafica. */
	showGrafica = (data: any[], serieName: string, titleName: string, grupo: string, indicador) => {
		console.log('show grafica')

		highcharts.chart('container100', {
			chart: {
				type: 'column',

			},
			title: {
				text: titleName
			},
			xAxis: {
				type: 'category'
			},
			yAxis: [{
				labels: {
					format: `{value} ${grupo}`
				},
				title: {
					text: indicador
				},
			}],
			legend: {
				enabled: false
			},
			plotOptions: {
				series: {
					dataLabels: {
						enabled: true,
						format: `{point.y:,.2f} ${grupo}`,
					}
				}
			},

			tooltip: {
				headerFormat: '<span style="font-size:11px">{series.name}</span><br>',
				pointFormat: '<span style="color:{point.color}">{point.name}</span>: <b>{point.y:,.2f} ' + grupo + '</b> del total<br/>'
			},

			series: [{
				data: data,
				name: serieName,
			}],
		})
	}

}