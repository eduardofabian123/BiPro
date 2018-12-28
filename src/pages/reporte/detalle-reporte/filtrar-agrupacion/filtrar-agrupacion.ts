import {
	Component,
	NgZone
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ViewController,
	LoadingController
} from 'ionic-angular';
import * as collect from 'collect.js/dist'
import {
	DbService
} from '../../../../services/db.service'
import {
	Observable
} from 'rxjs/Observable';
import 'rxjs/add/observable/of';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/delay';

@IonicPage()
@Component({
	selector: 'page-filtrar-agrupacion',
	templateUrl: 'filtrar-agrupacion.html',
})
export class FiltrarAgrupacionPage {
	registros = []
	agrupacion: string = ''
	id: number
	campo_select: any
	campo_agrupacion: any
	filtros_seleccionadas = []
	columnas = []
	filter_menores_uno = []
	visible: boolean = false
	items = []
	clientes$
	filtroPreseleccionado = []

	constructor(public navCtrl: NavController, public navParams: NavParams, private view: ViewController,
		private dbService: DbService,
		public zone: NgZone, public loading: LoadingController) {
		this.agrupacion = navParams.get('agrupacion')
		this.columnas = navParams.get('registros')
		this.filtroPreseleccionado = navParams.get('filtroPreseleccionado')
	}

	ionViewDidLoad() {
			console.log('ionViewDidLoad')
			console.log(this.agrupacion);


			this.agrupacion === 'contratante' ? (this.visible = true) : ''
			this.agrupacion === 'contratante' ? (this.cargaOpcionesContratante()) : (this.loadOpciones())
				// console.log(this.filtroPreseleccionado)

		}
		/* Funcion para visualizar los valores de los filtros. */
	loadOpciones() {
		console.log('load opciones')
		if (this.filtroPreseleccionado.length === 0) {
			this.columnas.forEach(item => {
				this.registros.push({
					'registros': item.registros,
					'checked': false
				})
			})
		} else {
			this.registros = this.filtroPreseleccionado
		}
	}

	cargaOpcionesContratante(): any {
		console.log('por contratante')
			// para la opcion de contratante agrupamos por aquellos que tienen mayor a 1 % de participacion aplica el mismo proceso para graficar.
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
						let suma_montos = contratante.reduce(function(index, proyecto) {
							return index + parseInt(proyecto.monto)
						}, 0)

						return {
							id: contratante[0].id,
							contratante: contratante[0].contratante,
							suma_monto: suma_montos,
							porcentaje: parseFloat(((suma_montos / monto_total) * 100).toFixed(2)),
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

					/* Para visualizar los contratantes mayores de 1% */
					mayores_de_uno.map(item => {
						this.registros.push({
							'registros': item.contratante
						})
					})
				})
			})
	}

	/* Funcion para controlar los filtros seleccionados. */
	seleccionFiltros = (event: any, filtros: string) => {
			console.log('ffff ' + filtros);

			if (filtros === 'contratante-agrupado') {
				this.filtros_seleccionadas.push('contratante-agrupado')
			} else {
				event.value ? (
					this.registros.forEach(item => {
						if (item.registros === filtros) {
							item.checked = true
						}
					})
				) : (
					this.registros.forEach(item => {
						if (item.registros === filtros) {
							item.checked = false
						}
					})
				)
			}
		}
		/* Funcion para enviar columnas seleccionadas. */
	aceptar() {
		this.registros.filter(function(value, key) {
			return value.checked === true
		}).map(item => {
			this.filtros_seleccionadas.push(item.registros)
		})

		this.view.dismiss({
			'filtros_seleccionadas': this.filtros_seleccionadas,
			'filtros_preseleccionadas': this.registros
		})
	}

	/* Funcion para cancelar los filtros. */
	cancelar() {
		// this.filtroPreseleccionado.length = 0
		this.navCtrl.pop()
	}
}