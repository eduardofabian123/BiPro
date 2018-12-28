import { Component, NgZone } from '@angular/core'
import { DbService } from '../../services/db.service'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'
import { CircularPaisPage } from './circular-pais'
import { CircularAnioPage } from './graficaCircularAnio/circular-anio'
import { CircularGerenciaPage } from './graficaCircularGerencia/circular-gerencia'
import { CircularClientePage } from './graficaCircularCliente/circular-cliente'

import { ProyectosAgrupadosPage } from './proyectos-agrupados/proyectos-agrupados'
import { ProyectosAgrupadosAnioPage } from './proyectos-agrupados/por-anio/proyectos-agrupados-anio'
import { ProyectosAgrupadosClientePage } from './proyectos-agrupados/por-cliente/proyectos-agrupados-cliente'
import { ProyectosAgrupadosClienteMenoresPage } from './proyectos-agrupados/por-cliente/por-cliente-menores/proyectos-agrupados-cliente-menores'

import { ProyectosAgrupadosGerenciaPage } from './proyectos-agrupados/por-gerencia/proyectos-agrupados-gerencia'
import { Platform, NavController, LoadingController } from 'ionic-angular'
import { Bar } from '../../highcharts/modulo.estadisticas/bar'
import { LoginPage } from '../../pages/login/login'

@Component({
	selector: 'page-estadistica',
	templateUrl: 'estadistica.html',
})
export class EstadisticaPage {
	xy = []
	options: Object

	constructor(private dbService: DbService,
		private navCtrl: NavController, public zone: NgZone, public loadingCtrl: LoadingController,
		public platform: Platform) {
		console.log('constructor')
		
	}

	pais: string = 'pais'
	proyectos = []
	proyectos_agrupados = []
	proyectos_agrupados_detalle = []
	monto_total: string = ''
	total_proyectos: number
	dataCirular = []
	bar: Bar
	
	ionViewDidLoad(): void {
		console.log('ionViewDidLoad')
		this.getDatosXPais()
	}

	/* Funcion para conseguir los datos de poryectos por pais. */
	getDatosXPais() {
		this.dbService.openDatabase()
			.then(() => this.dbService.consultaXPais())
			.then(response => {
				this.zone.run(() => {
					/* Para mostrar la informacion de la grafica. */
					this.xy.splice(0, this.xy.length)
					response.forEach(item => {
						this.xy.push({
							name: item.pais,
							y: parseFloat(item.porcentaje)
						})
					})
				/*Realizamos la instancia a nuestra clase para contruir la grafica. */
				this.bar = new Bar(this.xy, 'Paises', 'Proyectos agrupados por país')
				this.options = this.bar.graficaBar()

				/* Para mostrar la tabla de informacion */
				const collection = collect(response)
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
				this.dataCirular = response
			})
		})
		.catch(console.error.bind(console))
	}

	/* Funcion para visualizar los proyectos agrupados por pais. */
	verProyectosAgrupados = (pais: string, monto_total: string): void => {
		this.navCtrl.push(ProyectosAgrupadosPage, {
			'pais': pais,
			'monto_total': monto_total
		})
	}

	/* Funcion para visualizar la grafica en modo circular. */
	modoCircular = (): void => {
		this.navCtrl.push(CircularPaisPage, {
			'datos_circular' : this.dataCirular
		})
	}

	/* Funcion para conseguir los datos de poryectos por anio. */
	getDatosXAnio = (): void => {
		this.dbService.openDatabase()
			.then(() => this.dbService.consultaXAnio())
			.then(response => {
				// Para mostrar la informacion de la grafica. 
				this.xy.splice(0, this.xy.length)
				response.forEach(item => {
					this.xy.push({
						name: item.anio,
						y: parseFloat(item.porcentaje)
					})
				})
				/*Realizamos la instancia a nuestra clase para contruir la grafica. */
				this.bar = new Bar(this.xy, 'Años', 'Proyectos agrupados por año')
				this.options = this.bar.graficaBar()

				/* Para mostrar la tabla de informacion */
				const collection = collect(response)
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
				this.dataCirular = response
			})
	}

	/* Funcion para visualizar los proyectos agrupados por anio. */
	verProyectosAgrupadosAnio = (anio: string, monto_total:string): void => {
		this.navCtrl.push(ProyectosAgrupadosAnioPage, {
			'anio': anio,
			'monto_total': monto_total
		})
	}

	/* Funcion para visualizar la grafica en modo circular por anio. */
	modoCircularAnio = (): void => {
		this.navCtrl.push(CircularAnioPage, {
			'datos_circular' : this.dataCirular
		})
	}

	/* Funcion para conseguir los datos de proyectos por gerencia. */
	getDatosXGerencia = (): void => {
		this.dbService.openDatabase()
			.then(() => this.dbService.consultaXGerencia())
			.then(response => {
				// Para mostrar la informacion de la grafica. 
				this.xy.splice(0, this.xy.length)
					response.forEach(item => {
						this.xy.push({
							name: item.gerencia,
							y: parseFloat(item.porcentaje)
						})
					})
				/*Realizamos la instancia a nuestra clase para contruir la grafica. */
				this.bar = new Bar(this.xy, 'Gerencias', 'Proyectos agrupados por gerencia')
				this.options = this.bar.graficaBar()

				/* Para mostrar la tabla de informacion */
				const collection = collect(response)
				this.monto_total = account.formatNumber(collection.sum('monto'))
				this.total_proyectos = collection.sum('numero_proyectos')

				let proyectos = collection.map(function(item) {
					return {
						'gerencia': item.gerencia,
						'porcentaje': item.porcentaje,
						'monto': account.formatNumber(item.monto),
						'numero_proyectos': item.numero_proyectos
					}
				})
				this.proyectos = proyectos
				this.dataCirular = response
			})
	}

	/* Funcion para visualizar los proyectos agrupados por gerencia. */
	verProyectosAgrupadosGerencia = (gerencia: string, monto_total:string): void => {
		this.navCtrl.push(ProyectosAgrupadosGerenciaPage, {
			'gerencia': gerencia,
			'monto_total' : monto_total
		})
	}

	/* Funcion para visualizar la grafica en modo circular por gerencia. */
	modoCircularGerencia = (): void => {
		this.navCtrl.push(CircularGerenciaPage, {
			'datos_circular': this.dataCirular
		})
	}

	/* Funcion para obtener los proyectos por cliente. */
	getDatosXCliente = (): void => {
		let data_cliente = []
		this.dbService.openDatabase()
			.then(() => this.dbService.consultaXCliente())
			.then(response => {
				this.zone.run(() => {
					let data = collect(response)

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
					mayores_de_uno.toArray()

					/* Consigo el porcentaje y cliente para formar mi grafica. */
					this.xy.splice(0, this.xy.length)
					mayores_de_uno.map(function(contratante, monto) {
						data_cliente.push({
							name: contratante.contratante,
							y: parseFloat(contratante.porcentaje)
						})
					})
					this.xy = data_cliente
					/*Realizamos la instancia a nuestra clase para contruir la grafica. */
					this.bar = new Bar(this.xy, 'Gerencias', 'Proyectos agrupados por cliente')
					this.options = this.bar.graficaBar()

					/* Para mostrar la tabla de informacion */
					this.monto_total = account.formatNumber(data.sum('monto'))
					this.total_proyectos = response.length

					let proyectos = mayores_de_uno.map(function(item) {
						return {
							'contratante': item.contratante,
							'porcentaje': item.porcentaje,
							'monto': account.formatNumber(item.suma_monto),
							'numero_proyectos': item.numero_proyectos
						}
					})

					this.proyectos = proyectos
					this.dataCirular = response
					this.proyectosAgrupados(menores_de_uno, suma_porcentajes_menores_de_uno)
				})
			})
	}

	/* Funcion para los proyectos que tienen menos de 1 porcentaje. */
	async proyectosAgrupados(menores_de_uno, suma_porcentajes_menores_de_uno) {
		/* Para mostras la informacion agrupada con los proyectos menores del 1 %. */
		/* Consigo el porcentaje y cliente para formar mi grafica. */
		this.xy.push({
			name: 'Proyectos agrupados',
			y: parseFloat(suma_porcentajes_menores_de_uno)
		})

		/* Construyo la informacion para mi tablero. */
		this.proyectos_agrupados['suma_montos_menores_de_uno'] = account.formatNumber(menores_de_uno.sum('suma_monto'))
		this.proyectos_agrupados['porcentaje'] = suma_porcentajes_menores_de_uno
		this.proyectos_agrupados['numero_proyectos'] = menores_de_uno.count()

		this.proyectos_agrupados_detalle = menores_de_uno
	}

	/* Funcion para visualizar los proyectos agrupados por contratante. */
	verProyectosAgrupadosCliente = (contratante: string, monto_total: string): void => {
		this.navCtrl.push(ProyectosAgrupadosClientePage, {
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

		this.navCtrl.push(ProyectosAgrupadosClienteMenoresPage, {
			'proyectos_agrupados_detalle': proyectos,
			'monto_total': monto_total
		})
	}

	/* Funcion para visualizar la grafica en modo circular por gerencia. */
	modoCircularCliente = (): void => {
		this.navCtrl.push(CircularClientePage, {
			'datos_circular': this.dataCirular
		})
	}

	/* Funcion para cerrar sesion. */
	logout = () => {
		this.navCtrl.setRoot(LoginPage)
	}
}