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
import {
	ReportesDbService
} from '../../../../services/reportes.db.service'
import * as collect from 'collect.js/dist'

@IonicPage()
@Component({
	selector: 'page-select-filter',
	templateUrl: 'select-filter.html',
})
export class SelectFilterPage {
	filtro = {}
	opciones = []
	opcionesSelected = []
	preseleccion = []
	opcionesPreseleccionInit = []
	opcionAnterior: string = ''

	constructor(public navCtrl: NavController, public navParams: NavParams, private reporteDb: ReportesDbService,
		public view: ViewController, public loadingCtrl: LoadingController, public zone: NgZone) {
		/* Recuperamos los filtros. */
		this.filtro = navParams.get('filtro')
		this.opcionesPreseleccionInit = navParams.get('preseleccion')
		this.opcionAnterior = navParams.get('opcionAnterior')
	}

	/* Cuando la vista es activa cargamos los filtros de seleccion. */
	ionViewDidLoad() {
		this.getDataFilter(this.filtro)
	}
	/* Funcion para obtener la data del filtro seleccionado. */
	getDataFilter = (filtro: {}) => {
		var miglobal = this
		let loading = this.loadingCtrl.create({
			content: 'Por favor espere...'
		})
		loading.present()
		setTimeout(() => {
			this.reporteDb.getFilterData(filtro)
				.then(response => {
					if (this.opcionesPreseleccionInit.length === 0) {
						console.log('if')

						response.forEach(item => {
							this.opciones.push({
								campo: item.campo,
								checked: false
							})
						})
					} else {
						if (this.opcionAnterior !== this.filtro['columna']) {
							this.opcionesPreseleccionInit.splice(0, this.opcionesPreseleccionInit.length)
						}

						let misCampos = []
						for (let i of this.opcionesPreseleccionInit) {
							misCampos.push({
								campo: i,
								checked: true
							})
						}
						response.forEach(item => {
							misCampos.push({
								campo: item.campo,
								checked: false
							})
						})
						this.opciones = collect(misCampos).unique('campo').toArray()
					}
					loading.dismiss()
				})
		}, 4000)
	}

	/* Funcion para enviar columnas seleccionadas. */
	aceptar() {
		this.opciones.filter(function(item) {
			return item.checked === true
		}).map(item => {
			this.opcionesSelected.push(item.campo)
			this.preseleccion.push(item.campo)
		})

		this.view.dismiss([{
			[this.filtro['columna']]: this.opcionesSelected
		}, {
			'preselect': this.preseleccion
		}, {
			campo: this.filtro['columna']
		}])
	}

	/* Funcion para cancelar los filtros. */
	cancelar() {
		this.view.dismiss()
	}
}
