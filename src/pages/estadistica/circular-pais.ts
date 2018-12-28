import { Component } from '@angular/core'
import { NavParams, NavController } from 'ionic-angular'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'
import { ProyectosAgrupadosPage } from './proyectos-agrupados/proyectos-agrupados'
import { Bar } from '../../highcharts/modulo.estadisticas/bar'

@Component({
	selector: 'page-circular-pais',
	templateUrl: 'circular-pais.html',
})

export class CircularPaisPage {
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

	/* Funcion para cargar la informacion para la grafica en modo circular. */
	loadDatos= () => {
		this.data_grafica.splice(0, this.data_grafica.length)
		this.proyectos.forEach(item => {
			this.data_grafica.push({
				name: item.pais,
				y: parseFloat(item.porcentaje)
			})
		})

		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		this.bar = new Bar(this.data_grafica, 'Paises', 'Proyectos agrupados por pais')
		this.options = this.bar.graficaPie()

		const collection = collect(this.proyectos)
		this.monto_total = account.formatNumber(collection.sum('monto'))
		this.total_proyectos = collection.sum('numero_proyectos')

		let proyectos = collection.map(function(item) {
			return {
				'pais': item.pais,
				'porcentaje': item.porcentaje,
				'monto': account.formatNumber(item.monto),
				'numero_proyectos': item.numero_proyectos
			}
		})
		this.proyectos = proyectos
	}

}
