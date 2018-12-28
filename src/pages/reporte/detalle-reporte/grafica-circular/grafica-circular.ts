import {
	Component
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ModalController,
	AlertController
} from 'ionic-angular'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'
import {
	ProyectosAgrupadosPage
} from '../../../estadistica/proyectos-agrupados/proyectos-agrupados'
import {
	ProyectosAgrupadosAnioPage
} from '../../../estadistica/proyectos-agrupados/por-anio/proyectos-agrupados-anio'
import {
	ProyectosAgrupadosGerenciaPage
} from '../../../estadistica/proyectos-agrupados/por-gerencia/proyectos-agrupados-gerencia'
import {
	DetalleReporteAgrupadoPage
} from '../../../reporte/detalle-reporte/detalle-reporte-agrupado/detalle-reporte-agrupado'
import {
	Grafico
} from '../../../../highcharts/modulo.reportes/Grafico'
import {
	ReportesDbService
} from '../../../../services/reportes.db.service'
import {
	FiltrarAgrupacionPage
} from '../../../reporte/detalle-reporte/filtrar-agrupacion/filtrar-agrupacion'
import {
	GraficaCircularFiltradaPage
} from '../../../reporte/detalle-reporte/grafica-circular/grafica-circular-filtrada/grafica-circular-filtrada'
import * as highcharts from 'highcharts';
import {
	ProyectosAgrupadosClienteMenoresPage
} from '../../../estadistica/proyectos-agrupados/por-cliente/por-cliente-menores/proyectos-agrupados-cliente-menores'


@IonicPage()
@Component({
	selector: 'page-grafica-circular',
	templateUrl: 'grafica-circular.html',
})
export class GraficaCircularPage {
	proyectos = []
	data_grafica = []
	options: Object
	monto_total: string = ''
	total_proyectos: number
	groupBy = ''
	grafico: Grafico
	proyectos_agrupados = []
	segmento: number = 0
	visible: boolean = false
	nombreReporte: string = ''
	subtituloSegmento: string = ''
	filtroPreseleccionado = []
	filtrosSeleccionados = []
	proyectos_agrupados_detalle = []

	constructor(public navCtrl: NavController, public navParams: NavParams, private reporteService: ReportesDbService,
		public modalCtrl: ModalController, public alert: AlertController) {
		this.proyectos = this.navParams.get('datos_circular')
		this.groupBy = this.navParams.get('groupBy')
		this.segmento = this.navParams.get('segmento')
		this.nombreReporte = this.navParams.get('nombreReporte')
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GraficaCircularPage');
		if (this.groupBy === 'contratante') {
			this.verGraficaContratante()
		} else {
			this.verGrafica()
		}
	}

	/* Funcion para ver la grafica para la seccion de contratante */
	verGraficaContratante = () => {
		/* para la seccion de por numero de proyectos*/
		if (this.segmento === 3) {
			var miglobal = this
			this.visible = true
			let data = collect(this.proyectos)

			/* monto total de todos los proyectos. */
			let monto_total = data.sum('monto')

			/* Agrupo mi data por contratante. */
			let agrupados = data.groupBy('contratante').toArray()

			let datos = agrupados.map(function(contratante, monto) {
				let num_proyectos = contratante.length

				let suma_montos = contratante.reduce(function(index, proyecto) {
					return index + parseInt(proyecto.monto)
				}, 0)

				return {
					id: contratante[0].id,
					contratante: contratante[0].contratante,
					suma_monto: suma_montos,
					porcentaje: parseFloat(((suma_montos / monto_total) * 100).toFixed(2)),
					numero_proyectos: num_proyectos
				}
			})
			/* Ordeno por porcentaje de mayor a menor. */
			let ordenados = collect(datos).sortByDesc('porcentaje')

			/* Clasifico los proyectos por porcentaje mayor a 1 y menores de 1. */
			let mayores_de_uno = ordenados.where('porcentaje', '>', 1)
			let menores_de_uno = ordenados.where('porcentaje', '<', 1)

			/* Suma de los montos y porcentajes de porcentaje  menores de 1. */
			let suma_porcentajes_menores_de_uno = menores_de_uno.sum('porcentaje').toFixed(2)
			let numero_proyectos = menores_de_uno.sum('numero_proyectos')
			mayores_de_uno.toArray()

			/* Consigo el porcentaje y cliente para formar mi grafica. */
			this.data_grafica.splice(0, this.data_grafica.length)
			mayores_de_uno.map(function(contratante, monto) {
				miglobal.data_grafica.push({
					name: contratante.contratante,
					y: parseInt(contratante.numero_proyectos)
				})
			})


			/* Para mostrar la tabla de informacion */
			this.monto_total = account.formatNumber(data.sum('monto'))
			this.total_proyectos = this.proyectos.length

			let proyectos = mayores_de_uno.map(function(item) {
				return {
					'campo': item.contratante,
					'porcentaje': item.porcentaje,
					'monto': account.formatNumber(item.suma_monto),
					'numero_proyectos': item.numero_proyectos,
					'group_by': 'contratante',
				}
			})
			this.proyectos = proyectos
			this.proyectosAgrupados(menores_de_uno, suma_porcentajes_menores_de_uno, numero_proyectos)
			/*Realizamos la instancia a nuestra clase para contruir la grafica. */
			this.graficar(this.data_grafica, 'Clientes', 'Proyectos agrupados por clientes', '#', 'Numero de proyectos', 'Número de proyectos por ' + this.groupBy)
		}
		/* para la seccion de por monto USD */
		if (this.segmento === 2) {
			var miglobal = this
			this.visible = true
			let data = collect(this.proyectos)

			/* monto total de todos los proyectos. */
			let monto_total = data.sum('monto')

			/* Agrupo mi data por contratante. */
			let agrupados = data.groupBy('contratante').toArray()

			let datos = agrupados.map(function(contratante, monto) {
				let num_proyectos = contratante.length

				let suma_montos = contratante.reduce(function(index, proyecto) {
					return index + parseInt(proyecto.monto)
				}, 0)

				return {
					id: contratante[0].id,
					contratante: contratante[0].contratante,
					suma_monto: suma_montos,
					porcentaje: parseFloat(((suma_montos / monto_total) * 100).toFixed(2)),
					numero_proyectos: num_proyectos
				}
			})
			/* Ordeno por porcentaje de mayor a menor. */
			let ordenados = collect(datos).sortByDesc('porcentaje')

			/* Clasifico los proyectos por porcentaje mayor a 1 y menores de 1. */
			let mayores_de_uno = ordenados.where('porcentaje', '>', 1)
			let menores_de_uno = ordenados.where('porcentaje', '<', 1)

			/* Suma de los montos y porcentajes de porcentaje  menores de 1. */
			let suma_porcentajes_menores_de_uno = menores_de_uno.sum('porcentaje').toFixed(2)
			let monto_menores_a_uno = menores_de_uno.sum('suma_monto').toFixed(2)
			// let numero_proyectos = menores_de_uno.sum('numero_proyectos')
			mayores_de_uno.toArray()

			/* Consigo el porcentaje y cliente para formar mi grafica. */
			this.data_grafica.splice(0, this.data_grafica.length)
			mayores_de_uno.map(function(contratante, monto) {
				miglobal.data_grafica.push({
					name: contratante.contratante,
					y: parseFloat(contratante.suma_monto)
				})
			})


			/* Para mostrar la tabla de informacion */
			this.monto_total = account.formatNumber(data.sum('monto'))
			this.total_proyectos = this.proyectos.length

			let proyectos = mayores_de_uno.map(function(item) {
				return {
					'campo': item.contratante,
					'porcentaje': item.porcentaje,
					'monto': account.formatNumber(item.suma_monto),
					'numero_proyectos': item.numero_proyectos,
					'group_by': 'contratante',
				}
			})

			this.proyectos = proyectos
			this.proyectosAgrupados(menores_de_uno, suma_porcentajes_menores_de_uno, monto_menores_a_uno)
			/*Realizamos la instancia a nuestra clase para contruir la grafica. */
			this.graficar(this.data_grafica, 'Clientes', 'Proyectos agrupados por clientes', 'USD', 'Numero de proyectos', 'Monto total USD por ' + this.groupBy)
		}
		/* para la seccion de por porcentaje*/
		if (this.segmento === 1) {
			var miglobal = this
			this.visible = true
			let data = collect(this.proyectos)

			/* monto total de todos los proyectos. */
			let monto_total = data.sum('monto')

			/* Agrupo mi data por contratante. */
			let agrupados = data.groupBy('contratante').toArray()

			let datos = agrupados.map(function(contratante, monto) {
				let num_proyectos = contratante.length

				let suma_montos = contratante.reduce(function(index, proyecto) {
					return index + parseInt(proyecto.monto)
				}, 0)

				return {
					id: contratante[0].id,
					contratante: contratante[0].contratante,
					suma_monto: suma_montos,
					porcentaje: parseFloat(((suma_montos / monto_total) * 100).toFixed(2)),
					numero_proyectos: num_proyectos
				}
			})
			/* Ordeno por porcentaje de mayor a menor. */
			let ordenados = collect(datos).sortByDesc('porcentaje')

			/* Clasifico los proyectos por porcentaje mayor a 1 y menores de 1. */
			let mayores_de_uno = ordenados.where('porcentaje', '>', 1)
			let menores_de_uno = ordenados.where('porcentaje', '<', 1)

			/* Suma de los montos y porcentajes de porcentaje  menores de 1. */
			let suma_porcentajes_menores_de_uno = menores_de_uno.sum('porcentaje').toFixed(2)
			let monto_menores_a_uno = menores_de_uno.sum('suma_monto').toFixed(2)
			mayores_de_uno.toArray()

			/* Consigo el porcentaje y cliente para formar mi grafica. */
			this.data_grafica.splice(0, this.data_grafica.length)
			mayores_de_uno.map(function(contratante, monto) {
				miglobal.data_grafica.push({
					name: contratante.contratante,
					y: contratante.porcentaje
				})
			})

			/* Para mostrar la tabla de informacion */
			this.monto_total = account.formatNumber(data.sum('monto'))
			this.total_proyectos = this.proyectos.length

			let proyectos = mayores_de_uno.map(function(item) {
				return {
					'campo': item.contratante,
			
					'porcentaje': item.porcentaje,
					'monto': account.formatNumber(item.suma_monto),
					'numero_proyectos': item.numero_proyectos,
					'group_by': 'contratante',
				}
			})

			this.proyectos = proyectos
			this.proyectosAgrupados(menores_de_uno, suma_porcentajes_menores_de_uno, suma_porcentajes_menores_de_uno)
			/*Realizamos la instancia a nuestra clase para contruir la grafica. */
			this.graficar(this.data_grafica, 'Clientes', 'Proyectos agrupados por clientes', '%', 'Numero de proyectos', 'Porcentaje total de participación por ' + this.groupBy)
		}
	}

	/* Funcion para mostrar la grafica. */
	verGrafica = () => {
		if (this.segmento === 3) {
			this.proyectos.forEach(item => {

				this.data_grafica.push({
					name: item.campo,
					y: parseFloat(item.numero_proyectos)
				})
			})

			/*Realizamos la instancia a nuestra clase para contruir la grafica. */
			this.graficar(this.data_grafica, this.groupBy, 'Proyectos agrupados por ' + this.groupBy, '#', 'Numero de proyectos', 'Número de proyectos por ' + this.groupBy)

			const collection = collect(this.proyectos)
			this.monto_total = account.formatNumber(collection.sum('monto'))
			this.total_proyectos = collection.sum('numero_proyectos')

			let proyectos = collection.map(function(item) {
				return {
					'campo': item.campo,
					'porcentaje': item.porcentaje,
					'monto': account.formatNumber(item.monto),
					'numero_proyectos': item.numero_proyectos
				}
			})
			this.proyectos = proyectos
		}

		if (this.segmento === 2) {
			this.proyectos.forEach(item => {

				this.data_grafica.push({
					name: item.campo,
					y: parseFloat(item.monto)
				})
			})

			/*Realizamos la instancia a nuestra clase para contruir la grafica. */
			this.graficar(this.data_grafica, this.groupBy, 'Proyectos agrupados por ' + this.groupBy, 'USD', 'Numero de proyectos', 'Monto total USD por ' + this.groupBy)
			const collection = collect(this.proyectos)
			this.monto_total = account.formatNumber(collection.sum('monto'))
			this.total_proyectos = collection.sum('numero_proyectos')

			let proyectos = collection.map(function(item) {
				return {
					'campo': item.campo,
					'porcentaje': item.porcentaje,
					'monto': account.formatNumber(item.monto),
					'numero_proyectos': item.numero_proyectos
				}
			})
			this.proyectos = proyectos
		}
		/* Para la seccion de porcentaje */
		if (this.segmento === 1) {
			this.proyectos.forEach(item => {

				this.data_grafica.push({
					name: item.campo,
					y: parseFloat(item.porcentaje)
				})
			})

			/*Realizamos la instancia a nuestra clase para contruir la grafica. */
			this.graficar(this.data_grafica, this.groupBy, 'Proyectos agrupados por ' + this.groupBy, ' %', 'Numero de proyectos', 'Porcentaje total de participación por ' + this.groupBy)
			const collection = collect(this.proyectos)
			this.monto_total = account.formatNumber(collection.sum('monto'))
			this.total_proyectos = collection.sum('numero_proyectos')

			let proyectos = collection.map(function(item) {
				return {
					'campo': item.campo,
					'porcentaje': item.porcentaje,
					'monto': account.formatNumber(item.monto),
					'numero_proyectos': item.numero_proyectos
				}
			})
			this.proyectos = proyectos
		}

	}
	/* Funcion para los proyectos que tienen menos de 1 porcentaje. */
	async proyectosAgrupados(menores_de_uno, suma_porcentajes, indicador) {
		/* Para mostras la informacion agrupada con los proyectos menores del 1 %. */
		/* Consigo el porcentaje y cliente para formar mi grafica. */
		this.data_grafica.push({
			name: 'Proyectos agrupados',
			y: parseInt(indicador)
		})

		/* Construyo la informacion para mi tablero. */
		this.proyectos_agrupados['suma_montos_menores_de_uno'] = account.formatNumber(menores_de_uno.sum('suma_monto'))
		this.proyectos_agrupados['porcentaje'] = suma_porcentajes
		this.proyectos_agrupados['numero_proyectos'] = menores_de_uno.sum('numero_proyectos')

		this.proyectos_agrupados_detalle = menores_de_uno
	}

	/* Funcion para ver el detalle de los proyectos segun la opcion que se escoja. */
	verProyectosAgrupados = (group_by: string, campo: string, monto_total: string): void => {
		console.log(group_by, campo);

		if (group_by === 'pais') {
			this.navCtrl.push(ProyectosAgrupadosPage, {
				'pais': campo,
				'monto_total': monto_total
			})
		} else if (group_by === 'anio') {
			this.navCtrl.push(ProyectosAgrupadosAnioPage, {
				'anio': campo,
				'monto_total': monto_total
			})
		} else if (group_by === 'gerencia') {
			this.navCtrl.push(ProyectosAgrupadosGerenciaPage, {
				'gerencia': campo,
				'monto_total': monto_total
			})
		} else {
			this.navCtrl.push(DetalleReporteAgrupadoPage, {
				'campo': campo,
				'monto_total': monto_total,
				'groupBy': this.groupBy
			})
		}
	}

	/* Funcion para filtrar la argrupacion de mi grafica. */
	filtrar = (): void => {
		this.groupBy === 'año' ? this.groupBy = 'anio' : this.groupBy === 'dirección' ? this.groupBy = 'unidad_negocio' : this.groupBy === 'país' ? this.groupBy = 'pais' : ''
		/* Hacemos una consulta para obtener los distintos valores de la agrupacion. */
		this.reporteService.selectDistinct(this.groupBy)
			.then(response => {
				let modal = this.modalCtrl.create(FiltrarAgrupacionPage, {
					'registros': response,
					'agrupacion': this.groupBy,
					'filtroPreseleccionado': this.filtroPreseleccionado
				})
				modal.present()
				modal.onDidDismiss(data => {
					/* Una vez cerrada la ventana de filtros validamos que se haya seleccionado alguna opcion. */
					this.filtrosSeleccionados = data.filtros_seleccionadas.map(item => item)
					this.filtroPreseleccionado = data.filtros_preseleccionadas
				})
			})
	}
	/* Funcion para validar los filtros selecccionados*/
	aplicarFiltro() {
		let alert: any
		let filter = []
		/*Validamos si hay filtros seleccionados */
		/* Filtros no seleccionados */
		if (this.filtrosSeleccionados.length === 0) {
			alert = this.alert.create({
					title: 'Advertencia!',
					subTitle: 'Por favor selecciona por lo menos un filtro para visualizar la grafica!',
					buttons: ['OK']
				}),
				alert.present()
		} else {
			/* En caso de que haya filtros seleccionados. */
			for (let index of this.filtrosSeleccionados) {
				this.proyectos.filter(function(value) {
					return value.campo === index;
				}).map(item => {
					filter.push({
						'campo': item.campo,
						'porcentaje': item.porcentaje,
						'monto': account.unformat(item.monto),
						'numero_proyectos': item.numero_proyectos,
					})
				})
			}
			this.graficarFiltrado(filter)
			/* En caso de que haya opciones seleccionadas nos vamos a graficar. */
		}
	}

	/* Funcion para mostrar la grafica. */
	graficarFiltrado = (filter: any[]) => {
		this.navCtrl.push(GraficaCircularFiltradaPage, {
			'data_grafica': filter,
			'segmento': this.segmento,
			'groupBy': this.groupBy,
		})

	}

	/* Funcion para visualizar la grafica. */
	graficar = (data: any[], serieName: string, titleName: string, grupo: string, indicador, subtitle: string) => {
		highcharts.chart('container1', {
			chart: {
				plotBackgroundColor: null,
				plotBorderWidth: null,
				plotShadow: true,
				type: 'pie',
			},
			title: {
				text: titleName
			},
			subtitle: {
				text: subtitle
			},
			tooltip: {
				pointFormat: '{series.name}: <b>{point.y:,.2f} ' + grupo + '</b>'
			},
			plotOptions: {
				pie: {
					allowPointSelect: true,
					cursor: 'pointer',
					dataLabels: {
						enabled: true,
						format: '<b>{point.name}</b>: {point.y:,.2f} ' + grupo,
					},
					showInLegend: true
				}
			},
			series: [{
				name: serieName,
				data: data
			}]

		})
	}

	/* Funcion para ver detalle de los proyectos agrupados que tienen menos de 1 %. */
	verProyectosAgrupadosClientePorcentajeMenosAUno = (monto_total: string): void => {
		console.log(this.proyectos_agrupados_detalle)
		let proyectos = this.proyectos_agrupados_detalle.map(function(item) {
			return {
				'id': item.id,
				'contratante': item.contratante,
				'porcentaje': item.porcentaje,
				'monto': account.formatNumber(item.suma_monto),
				'numero_proyectos': item.numero_proyectos
			}
		})

		console.log(this.proyectos_agrupados_detalle['numero_proyectos'])

		this.navCtrl.push(ProyectosAgrupadosClienteMenoresPage, {
			'proyectos_agrupados_detalle': proyectos,
			'monto_total': monto_total,
			'proyectos': this.proyectos_agrupados['numero_proyectos']
		})

	}
}
