import {
	Component
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams
} from 'ionic-angular';
import {
	Grafico
} from '../../../../../highcharts/modulo.reportes/Grafico'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'

@IonicPage()
@Component({
	selector: 'page-grafica-circular-filtrada',
	templateUrl: 'grafica-circular-filtrada.html',
})
export class GraficaCircularFiltradaPage {

	dataGrafica = []
	segmento: number = 0
	options: Object
	grafico: Grafico
	groupBy: string = ''
	subtituloSegmento: string = ''
	title: string = ''
	nombreReporte: string = ''
	proyectos = []
	monto_total: string = ''
	total_proyectos: number

	constructor(public navCtrl: NavController, public navParams: NavParams) {
		this.dataGrafica = navParams.get('data_grafica')
		this.segmento = navParams.get('segmento')
		this.groupBy = navParams.get('groupBy')
		this.title = collect(this.dataGrafica).implode('campo', ',');
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GraficaCircularFiltradaPage');
		console.log(this.segmento)
		this.muestraGrafica()
	}

	/* Funcion para visualizar la grafica con los filtros seleccionados. */
	muestraGrafica = () => {
		this.segmento === 3 ? (this.filtraNumeroProyectos()) : this.segmento === 2 ? (this.muestraGraficaPorUsd()) :
			this.segmento === 1 ? (this.muestraGraficaProcentajes()) : ''
	}
	/* Funcion para graficar por monto usd. */
	muestraGraficaPorUsd = () => {

		let data = []
		this.dataGrafica.forEach(items => {
			data.push({
				name: items.campo,
				y: parseFloat(items.monto)
			})
		})

		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		this.grafico = new Grafico(data, this.groupBy, 'Proyectos agrupados por ' + this.groupBy, ' USD', 'Monto total USD por ' + this.groupBy),
			this.options = this.grafico.graficaPie(this.subtituloSegmento = 'Monto total USD por ' + this.groupBy)

		/* Acomo la data para mostrar el tablero indicativo. */
		const collection = collect(this.dataGrafica)
		let monto_total = account.unformat(collection.sum('monto'))
		this.monto_total = account.formatNumber(monto_total)

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

	/* Funcion para graficar por numero de proyectos. */
	filtraNumeroProyectos = () => {
		let data = []

		this.dataGrafica.forEach(items => {
			data.push({
				name: items.campo,
				y: parseFloat(items.numero_proyectos)
			})
		})

		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		this.grafico = new Grafico(data, this.groupBy, 'Proyectos agrupados por ' + this.groupBy, ' #', 'Número de proyectos por ' + this.groupBy)
		this.options = this.grafico.graficaPie(this.subtituloSegmento = 'Número de proyectos por ' + this.groupBy)

		/* Acomo la data para mostrar el tablero indicativo. */
		const collection = collect(this.dataGrafica)
		let monto_total = account.unformat(collection.sum('monto'))
		this.monto_total = account.formatNumber(monto_total)

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

	/* Funcion para graficar por porcentajes. */
	muestraGraficaProcentajes = () => {
		let dataPie = []
		this.dataGrafica.forEach(item => {
			dataPie.push({
				name: item.campo,
				y: parseFloat(item.porcentaje)
			})
		})
		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		this.grafico = new Grafico(dataPie, this.groupBy, 'Proyectos agrupados por ' + this.groupBy, '%', 'Numero de proyectos')
		this.options = this.grafico.graficaPie(this.subtituloSegmento = 'Porcentaje total de participación por ' + this.groupBy)

		/* Acomo la data para mostrar el tablero indicativo. */
		const collection = collect(this.dataGrafica)
		let monto_total = account.unformat(collection.sum('monto'))
		this.monto_total = account.formatNumber(monto_total)

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