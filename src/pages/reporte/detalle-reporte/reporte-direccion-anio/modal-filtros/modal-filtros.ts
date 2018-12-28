import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import { ReportesDbService } from '../../../../../services/reportes.db.service'

@IonicPage()
@Component({
	selector: 'page-modal-filtros',
	templateUrl: 'modal-filtros.html',
})
export class ModalFiltrosPage {
	filtro: string
	opciones = []
	opciones_send = []

	constructor(public navCtrl: NavController, public navParams: NavParams, public viewCtrl: ViewController,
		private reporteService: ReportesDbService) {
		this.filtro = this.navParams.get('filtro')
	}

	ionViewDidLoad() {
		this.filtro === 'Direcciones' ? this.filtrarPorDireccion() : this.filtrarPorAnio()
	}

	/* Filtrar por anios. */
	filtrarPorAnio = () => {
		this.reporteService.distinctAnioFiltros()
		.then(response => {
			response.forEach(item => {
				this.opciones.push({
					'item': item
				})
			})
		})
	}

	/* Filtrar por direcciones. */
	filtrarPorDireccion = () => {
		this.reporteService.distinctDirecciones()
		.then(response => {
			response.forEach(item => {
				this.opciones.push({
					'item': item.unidad_negocio
				})
			})
		})
	}

	/* Funcion para el manejo de nuestros filtros individuales. */
	seleccionFiltros(event: any, opcion) {
		let encontrado: number
		/* Si se selecciono alguna opcion se almacena en un arreglo. */
		if(event.value == true) {
			this.opciones_send.push(opcion)
		}
		else {
			/* En caso de que se desactive la opcion la removemos de la data. */
			encontrado = this.opciones_send.indexOf(opcion)
			if(encontrado !== -1) {
				this.opciones_send.splice(encontrado, 1)
			}
			
		}

	}

	/* Funcion para cerrar la ventana de filtros. */
	cerrarFiltros() {
		/* Enviamos nuestras opciones para realizar la busqueda. */
		this.viewCtrl.dismiss(this.opciones_send)
	}

	/* Funcion para cancelar los filtros. */
	cancelar() {
		this.viewCtrl.dismiss()
	}
}
