import {
	Component
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ModalController,
	ViewController
} from 'ionic-angular'
import {
	SelectFilterPage
} from '../select-filter/select-filter'

@IonicPage()
@Component({
	selector: 'page-filtrar-columnas',
	templateUrl: 'filtrar-columnas.html',
})
export class FiltrarColumnasPage {

	filtros_seleccionadas = []
	prueba = []
	opcionesPreseleccion = []
	opcionAnterior: string = ''

	constructor(public navCtrl: NavController, public navParams: NavParams, public modal: ModalController,
		public view: ViewController) {
		/* Recuperamos las columnas para mostralas en la vista. */
		this.filtros_seleccionadas = navParams.get('filtros_seleccionadas')
	}

	/* Cuando cargue la vista mostramos los filtros seleccionados. */
	ionViewDidLoad() {}

	/* Funcion para seleccionas las opsiones del filtro.*/
	obtenerDataFiltrado = (item: {}) => {
		/* Creamos el modal para ver las opciones de un filtro. */
		let modalSelectFilter = this.modal.create(SelectFilterPage, {
			filtro: item,
			preseleccion: this.opcionesPreseleccion,
			opcionAnterior: this.opcionAnterior
		})
		/* mostramos el modal. */
		modalSelectFilter.present()

		/* Cuando cerramos la vista de los filtros recuperamos las opciones seleccionadas. */
		modalSelectFilter.onDidDismiss(data => {
			console.log(data);
			this.prueba.push(data[0])
			this.opcionesPreseleccion = data[1].preselect
			this.opcionAnterior = data[2].campo
		})
	}

	regresar = () => {
		this.view.dismiss(this.prueba)
	}

	// Funcion para cancelar los filtros.
	cancelar() {
		this.view.dismiss()
	}
}
