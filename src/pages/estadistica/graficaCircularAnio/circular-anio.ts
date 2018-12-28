import { Component } from '@angular/core'
import { NavParams, NavController } from 'ionic-angular'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'
import { ProyectosAgrupadosAnioPage } from '../proyectos-agrupados/por-anio/proyectos-agrupados-anio'
import { Bar } from '../../../highcharts/modulo.estadisticas/bar'

@Component({
	selector: 'page-circular-anio',
	templateUrl: 'circular-anio.html',
})

export class CircularAnioPage {
	proyectos = []
	monto_total: string = ''
	total_proyectos: number
	data_grafica = []
	options: Object
	bar: Bar

	constructor(private navParams: NavParams,
		private navCrtl: NavController) {
		this.proyectos = navParams.get('datos_circular')
		this.loadDatos()
	}

	loadDatos= () => {
		this.data_grafica.splice(0, this.data_grafica.length)
		this.proyectos.forEach(item => {
			this.data_grafica.push({
				name: item.anio,
				y: parseFloat(item.porcentaje)
			})
		})
		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		this.bar = new Bar(this.data_grafica, 'Años', 'Proyectos agrupados por año')
		this.options = this.bar.graficaPie()


		/* Para mostrar la tabla dinamica. */
		const collection = collect(this.proyectos)
		this.monto_total = account.formatNumber(collection.sum('monto'))
		this.total_proyectos = collection.sum('numero_proyectos')

		let proyectos = collection.map(function(item) {
			return {
				'anio': item.anio,
				'porcentaje': item.porcentaje,
				'monto': account.formatNumber(item.monto),
				'numero_proyectos': item.numero_proyectos
			}
		})
		this.proyectos = proyectos
	}
}
