 import { Component } from '@angular/core'
import { NavParams, NavController } from 'ionic-angular'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'
import { ProyectosAgrupadosClientePage } from '../proyectos-agrupados/por-cliente/proyectos-agrupados-cliente'
import { ProyectosAgrupadosClienteMenoresPage } from '../proyectos-agrupados/por-cliente/por-cliente-menores/proyectos-agrupados-cliente-menores'
import { Bar } from '../../../highcharts/modulo.estadisticas/bar'

@Component({
	selector: 'page-circular-cliente',
	templateUrl: 'circular-cliente.html',
})

export class CircularClientePage {
	proyectos = []
	datos = []
	monto_total: string = ''
	total_proyectos: number
	proyectos_agrupados = []
	proyectos_agrupados_detalle = []
	data_grafica = []
	options: Object
	bar: Bar

	constructor(private navParams: NavParams,
		private navCrtl: NavController) {
		this.datos = navParams.get('datos_circular')
		this.loadDatos()
	}

	loadDatos = () => {
		let data_cliente = []

		let data = collect(this.datos)
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
		let suma_montos_menores_de_uno = menores_de_uno.sum('suma_monto')
		let suma_porcentajes_menores_de_uno = menores_de_uno.sum('porcentaje').toFixed(2)
		mayores_de_uno.toArray()

		/* Consigo el porcentaje y cliente para formar mi grafica. */
		this.data_grafica.splice(0, this.data_grafica.length)
		mayores_de_uno.map(function(contratante, monto) {
			data_cliente.push({
				name: contratante.contratante,
				y: parseFloat(contratante.porcentaje)
			})
		})

		this.data_grafica = data_cliente

		/*Realizamos la instancia a nuestra clase para contruir la grafica. */
		this.bar = new Bar(this.data_grafica, 'Clientes', 'Proyectos agrupados por cliente')
		this.options = this.bar.graficaPie()

		/* Para mostrar la tabla de informacion */
		this.monto_total = account.formatNumber(data.sum('monto'))
		this.total_proyectos = data.count()

		let proyectos = mayores_de_uno.map(function(item) {
			return {
				'contratante': item.contratante,
				'porcentaje': item.porcentaje,
				'monto': account.formatNumber(item.suma_monto),
				'numero_proyectos': item.numero_proyectos
			}
		})

		this.proyectos = proyectos
		this.proyectosAgrupados(menores_de_uno, suma_porcentajes_menores_de_uno)
	}

	/* Funcion para los proyectos que tienen menos de 1 porcentaje. */
	async proyectosAgrupados(menores_de_uno, suma_porcentajes_menores_de_uno) {
		/* Para mostras la informacion agrupada con los proyectos menores del 1 %. */
		/* Consigo el porcentaje y cliente para formar mi grafica. */
		menores_de_uno.toArray()

		this.data_grafica.push({
			name: 'Proyectos agrupados',
			y: parseFloat(suma_porcentajes_menores_de_uno)
		})

		/* Construyo la informacion para mi tablero. */
		this.proyectos_agrupados['suma_montos_menores_de_uno'] = account.formatNumber(menores_de_uno.sum('suma_monto'))
		this.proyectos_agrupados['porcentaje'] = suma_porcentajes_menores_de_uno
		this.proyectos_agrupados['numero_proyectos'] =  menores_de_uno.count()

		this.proyectos_agrupados_detalle = menores_de_uno
	}

	/* Funcion para visualizar los proyectos agrupados por contratante. */
	verProyectosAgrupadosCliente = (contratante: string, monto_total: string): void => {
		this.navCrtl.push(ProyectosAgrupadosClientePage, {
			'contratante': contratante,
			'monto_total': monto_total
		})
	}

	verProyectosAgrupadosClientePorcentajeMenosAUno = (monto_total: string): void => {
		let proyectos = this.proyectos_agrupados_detalle.map(function(item) {
			return {
				'id': item.id,
				'contratante': item.contratante,
				'porcentaje': item.porcentaje,
				'monto': account.formatNumber(item.suma_monto),
				'numero_proyectos': item.numero_proyectos
			}
		})

		this.navCrtl.push(ProyectosAgrupadosClienteMenoresPage, {
			'proyectos_agrupados_detalle': proyectos,
			'monto_total': monto_total
		})
	}
}
