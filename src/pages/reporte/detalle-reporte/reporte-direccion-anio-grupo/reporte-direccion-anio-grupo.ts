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
import * as account from 'accounting-js'
import {
	ProyectosAgrupadosAnioPage
} from '../.././../../pages/estadistica/proyectos-agrupados/por-anio/proyectos-agrupados-anio'
import {
	GraficoGrupo
} from '../../../../highcharts/modulo.reportes/GraficoGrupo'

@IonicPage()
@Component({
	selector: 'page-reporte-direccion-anio-grupo',
	templateUrl: 'reporte-direccion-anio-grupo.html',
})
export class ReporteDireccionAnioGrupoPage {

	grupo: string = ''
	options: Object
	monto_total: string = ''
	total_proyectos: number
	proyectos = []
	series = []
	categorias = []
	graficoGrupo: GraficoGrupo

	constructor(public navCtrl: NavController, public navParams: NavParams, private reporteService: ReportesDbService) {
		this.grupo = navParams.get('grupo')

	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad ReporteDireccionAnioGrupoPage');
		this.verReporteGrupo()
	}

	/* Funcion para ver el detalle del reporte segun el grupo seleccionado. */
	async verReporteGrupo() {
		var miglobal = this
		if (this.grupo === 'monto_total') {
			this.reporteService.distinctAnio()
				.then(response => {
					miglobal.categorias = response
				})
			await this.reporteService.distinctDirecciones()
				.then(response => {
					response.forEach(item => {
						miglobal.series.push({
							name: item.unidad_negocio,
							data: []
						})
					})
				})
			/*Obtener datos de la direccion de consultoria. */
			this.reporteService.getmontosDireccionesConsultoria()
				.then(response => {
					miglobal.series[0]['data'] = response
				})
			/*Obtener datos de la direccion de Desarrollo de sistemas */
			this.reporteService.getmontosDireccionesSistemas()
				.then(response => {
					miglobal.series[1]['data'] = response
				})
			/*Obtener datos de la direccion de Ingeniería */
			this.reporteService.getmontosDireccionesIngenieria()
				.then(response => {
					miglobal.series[2]['data'] = response
				})
			/*Obtener datos de la direccion de Sin referencia */
			this.reporteService.getmontosDireccionesSinReferencia()
				.then(response => {
					miglobal.series[3]['data'] = response
				})
			/*Obtener datos de la direccion de Sin Suramérica */
			this.reporteService.getmontosDireccionesSuramerica()
				.then(response => {
					miglobal.series[4]['data'] = response
					this.graficoGrupo = new GraficoGrupo(miglobal.categorias, miglobal.series, 'USD', 'Direcciones por monto total USD')
					this.options = this.graficoGrupo.graficaBasicColumn()
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
		} else {
			this.reporteService.reporteDireccionAnioGrupoNumeroProyectos()
				.then(response => {
					miglobal.categorias = [2017, 2016, 2015, 2014, 2013, 2012]
					response.forEach(item => {
						miglobal.series.push({
							name: item.unidad_negocio,
							data: [item[2017], item[2016], item[2015], item[2014], item[2013], item[2012]]
						})
					})

					this.graficoGrupo = new GraficoGrupo(this.categorias, this.series, '#', 'Direcciones por número de proyectos')
					this.options = this.graficoGrupo.graficaBasicColumn()

					/*Para obtener la informacion para visualizar la tabla informativa. */
					this.reporteService.reporteDireccionAnioGrupoNumeroProyectosTAbla()
						.then(response => {
							console.log(response)

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
	}

	/* Funcion para ver el detalle general. */
	verDetalle = (group_by, campo, monto) => {
		this.navCtrl.push(ProyectosAgrupadosAnioPage, {
			'anio': group_by,
			'monto_total': monto
		})
	}
}