import {
	Component
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ModalController,
	AlertController
} from 'ionic-angular';
import {
	ReportesDbService
} from '../../../../services/reportes.db.service'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'
import {
	ReporteDireccionAnioGrupoPage
} from '../../../reporte/detalle-reporte/reporte-direccion-anio-grupo/reporte-direccion-anio-grupo'
import {
	ProyectosAgrupadosAnioPage
} from '../.././../../pages/estadistica/proyectos-agrupados/por-anio/proyectos-agrupados-anio'
import {
	ModalFiltrosPage
} from '../../../reporte/detalle-reporte/reporte-direccion-anio/modal-filtros/modal-filtros'
import {
	DbService
} from '../../../../services/db.service'
import {
	GraficaFiltrosDireccionAnioPage
} from '../../../reporte/detalle-reporte/reporte-direccion-anio/grafica-filtros-direccion-anio/grafica-filtros-direccion-anio'
import {
	GraficoGrupo
} from '../../../../highcharts/modulo.reportes/GraficoGrupo'
import * as highcharts from 'highcharts';

@IonicPage()
@Component({
	selector: 'page-reporte-direccion-anio',
	templateUrl: 'reporte-direccion-anio.html',
})
export class ReporteDireccionAnioPage {
	options: Object
	monto_total: string = ''
	total_proyectos: number
	proyectos = []
	direccion_filtro = []
	anio_filtro = []
	data_grafica = []
	data_direcciones = []
	graficoGrupo: GraficoGrupo
	porcentaje: string = 'porcentaje'
	categorias = []
	series = []
	segmento: number = 0

	constructor(public navCtrl: NavController, public navParams: NavParams,
		private reporteService: ReportesDbService, private modal: ModalController, public dbService: DbService,
		public alertCtrl: AlertController) {

		highcharts.setOptions({
			lang: {
				thousandsSep: ','
			}
		});
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ReporteDireccionAnioPage');
		this.reporteDireccionAnios()
	}

	/* Funcion para obtener la informacion para construir el reporte de direccicon con años. */
	reporteDireccionAnios() {
		this.segmento = 1
		var series = []
		var categorias = []
		this.reporteService.reportePorDireccion()
			.then(response => {
				categorias = [2017, 2016, 2015, 2014, 2013, 2012]
				response.forEach(item => {
					series.push({
						name: item.unidad_negocio,
						data: [item[2017], item[2016], item[2015], item[2014], item[2013], item[2012]]
					})
				})

				this.showGrafica(categorias, series, '%', 'Direcciones por porcentaje de participación')
					/*Para obtener la informacion para visualizar la tabla informativa. */
				this.reporteService.reportePorDireccionTAbla()
					.then(response => {
						let micollect = collect(response)

						this.total_proyectos = micollect.sum('numero_proyectos')
						this.monto_total = account.formatNumber(micollect.sum('monto'))

						let proyectos = micollect.map(function(item) {
							return {
								'campo': item.anio,
								'porcentaje': parseFloat(item.porcentaje).toFixed(2),
								'monto': account.formatNumber(item.monto),
								'numero_proyectos': item.numero_proyectos,
								'group_by': item.anio,
							}
						})
						this.proyectos = proyectos
					})
			})
	}

	// Funcion para ver detalle por monto total o por numero de proyectos. 
	verDetalleGrupo = (grupo: string) => {
		/* información de proyectos para la opcion de numero de proyectos*/
		if (grupo === 'numero_proyectos') {
			this.segmento = 3
			this.series.splice(0, this.series.length)
			this.reporteService.reporteDireccionAnioGrupoNumeroProyectos()
				.then(response => {
					this.categorias = [2017, 2016, 2015, 2014, 2013, 2012]
					response.forEach(item => {
						this.series.push({
							name: item.unidad_negocio,
							data: [item[2017], item[2016], item[2015], item[2014], item[2013], item[2012]]
						})
					})

					this.showGrafica(this.categorias, this.series, '#', 'Direcciones por número de proyectos')

					/*Para obtener la información para visualizar la tabla informativa. */
					this.reporteService.reporteDireccionAnioGrupoNumeroProyectosTAbla()
						.then(response => {
							let micollect = collect(response)
							this.total_proyectos = micollect.sum('numero_proyectos')
							this.monto_total = account.formatNumber(micollect.sum('monto'))

							let proyectos = micollect.map(function(item) {
								return {
									'campo': item.anio,
									'porcentaje': parseFloat(item.porcentaje).toFixed(2),
									'monto': account.formatNumber(item.monto),
									'numero_proyectos': item.numero_proyectos,
									'group_by': item.anio,
								}
							})
							this.proyectos = proyectos
						})
				})
		} else {
			/* información para la opcion por monto total. */
			this.segmento = 2
			this.series.splice(0, this.series.length)
			this.reporteService.distinctAnio()
				.then(response => {
					this.categorias = response
				})
			this.reporteService.distinctDirecciones()
				.then(response => {
					response.forEach(item => {
						this.series.push({
							name: item.unidad_negocio,
							data: []
						})
					})
				})
				/*Obtener datos de la direccion de consultoria. */
			this.reporteService.getmontosDireccionesConsultoria()
				.then(response => {
					let anios = [{
						anio: 2017,
						monto: 0,
					}, {
						anio: 2016,
						monto: 0
					}, {
						anio: 2015,
						monto: 0
					}, {
						anio: 2014,
						monto: 0
					}, {
						anio: 2013,
						monto: 0
					}, {
						anio: 2012,
						monto: 0
					}]
					response.forEach(function(response, index) {
						anios.forEach(anios => {
							if (anios.anio === response.anio) {
								anios.monto = response.montoUsd
							}
						})
					})
					this.series[0]['data'] = JSON.parse('[' + collect(anios).implode('monto', ',') + ']')
				})
				/*Obtener datos de la direccion de Desarrollo de sistemas */
			this.reporteService.getmontosDireccionesSistemas()
				.then(response => {
					let anios = [{
						anio: 2017,
						monto: 0,
					}, {
						anio: 2016,
						monto: 0
					}, {
						anio: 2015,
						monto: 0
					}, {
						anio: 2014,
						monto: 0
					}, {
						anio: 2013,
						monto: 0
					}, {
						anio: 2012,
						monto: 0
					}]
					response.forEach(function(response, index) {
						anios.forEach(anios => {
							if (anios.anio === response.anio) {
								anios.monto = response.montoUsd
							}
						})
					})
					this.series[1]['data'] = JSON.parse('[' + collect(anios).implode('monto', ',') + ']')
				})
				/*Obtener datos de la direccion de Ingeniería */
			this.reporteService.getmontosDireccionesIngenieria()
				.then(response => {
					let anios = [{
						anio: 2017,
						monto: 0,
					}, {
						anio: 2016,
						monto: 0
					}, {
						anio: 2015,
						monto: 0
					}, {
						anio: 2014,
						monto: 0
					}, {
						anio: 2013,
						monto: 0
					}, {
						anio: 2012,
						monto: 0
					}]
					response.forEach(function(response, index) {
						anios.forEach(anios => {
							if (anios.anio === response.anio) {
								anios.monto = response.montoUsd
							}
						})
					})
					this.series[2]['data'] = JSON.parse('[' + collect(anios).implode('monto', ',') + ']')
				})
				/*Obtener datos de la direccion de Sin referencia */
			this.reporteService.getmontosDireccionesSinReferencia()
				.then(response => {
					let anios = [{
						anio: 2017,
						monto: 0,
					}, {
						anio: 2016,
						monto: 0
					}, {
						anio: 2015,
						monto: 0
					}, {
						anio: 2014,
						monto: 0
					}, {
						anio: 2013,
						monto: 0
					}, {
						anio: 2012,
						monto: 0
					}]
					response.forEach(function(response, index) {
						anios.forEach(anios => {
							if (anios.anio === response.anio) {
								anios.monto = response.montoUsd
							}
						})
					})

					this.series[3]['data'] = JSON.parse('[' + collect(anios).implode('monto', ',') + ']')
				})
				/*Obtener datos de la direccion de Sin Suramérica */
			this.reporteService.getmontosDireccionesSuramerica()
				.then(response => {
					let anios = [{
						anio: 2017,
						monto: 0,
					}, {
						anio: 2016,
						monto: 0
					}, {
						anio: 2015,
						monto: 0
					}, {
						anio: 2014,
						monto: 0
					}, {
						anio: 2013,
						monto: 0
					}, {
						anio: 2012,
						monto: 0
					}]
					response.forEach(function(response, index) {
						anios.forEach(anios => {
							if (anios.anio === response.anio) {
								anios.monto = response.montoUsd
							}
						})
					})
					this.series[4]['data'] = JSON.parse('[' + collect(anios).implode('monto', ',') + ']')
					this.showGrafica(this.categorias, this.series, 'USD', 'Direcciones por monto total USD')
				})
				/*Para obtener la informacion para visualizar la tabla informativa. */
			this.reporteService.reportePorDireccionTAbla()
				.then(response => {
					let micollect = collect(response)

					this.total_proyectos = micollect.sum('numero_proyectos')
					this.monto_total = account.formatNumber(micollect.sum('monto'))

					let proyectos = micollect.map(function(item) {
						return {
							'campo': item.anio,
							'porcentaje': parseFloat(item.porcentaje).toFixed(2),
							'monto': account.formatNumber(item.monto),
							'numero_proyectos': item.numero_proyectos,
							'group_by': item.anio,
						}
					})
					this.proyectos = proyectos
				})
		}
	}

	/* Funcion para ver el detalle general. */
	verDetalle = (group_by, campo, monto) => {
		this.navCtrl.push(ProyectosAgrupadosAnioPage, {
			'anio': group_by,
			'monto_total': monto
		})
	}

	/* Funcion para mostrar la ventana para filtrar las direcciones. */
	filtrarDireccion(filtro: string) {
		/*Creamos un modal retornando un view. */
		let filtrarModal = this.modal.create(ModalFiltrosPage, {
				'filtro': filtro
			})
			/* Cierra la ventana modal y recuperamos las opciones que se seleccionaron. */
		filtrarModal.onDidDismiss(data => {
				this.direccion_filtro = data
			})
			/* Mostramos el modal. */
		filtrarModal.present()
	}

	/* Funcion para mostrar la ventana para filtrar los anios. */
	filtrarAnio = (filtro: string) => {
		// Creamos un modal retornando un view. 
		let filtrarModal = this.modal.create(ModalFiltrosPage, {
				'filtro': filtro
			})
			/* Cierra la ventana modal y recuperamos las opciones que se seleccionaron. */
		filtrarModal.onDidDismiss(data => {
				this.anio_filtro = data
			})
			/* Mostramos el modal. */
		filtrarModal.present()
	}

	/* Funcion para graficar. */
	graficar(direccion: any[], anios: any[]) {
		let alert: any
		this.direccion_filtro.length === 0 || this.anio_filtro.length === 0 ?
			(
				alert = this.alertCtrl.create({
					title: 'Advertencia!',
					subTitle: 'Por favor selecciona por lo menos una dirección y un año!',
					buttons: ['OK']
				}),
				alert.present()
			) : (
				/* Creamos una vista para visualizar la grafica. */
				this.navCtrl.push(GraficaFiltrosDireccionAnioPage, {
					'direccion': this.direccion_filtro,
					'anios': this.anio_filtro,
					'segmento': this.segmento
				})
			)
	}

	/* Funcion para visualizar la grafica. */
	showGrafica = (categorias: any[], serie: any[], indicador: string, title: string) => {
		highcharts.chart('contenido', {
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
				labels: {
					// format: `{value} ${grupo}`
					formatter: function () {
                    	return highcharts.numberFormat(this.value,2) + ' '+ indicador;
                	}   
				},

				min: 0,
				title: {
					text: 'Porcentaje total de participación por dirección'
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