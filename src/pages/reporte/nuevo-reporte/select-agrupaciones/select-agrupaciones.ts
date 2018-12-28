import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, ViewController } from 'ionic-angular';
import * as collect from 'collect.js/dist'

@IonicPage()
@Component({
	selector: 'page-select-agrupaciones',
	templateUrl: 'select-agrupaciones.html',
})
export class SelectAgrupacionesPage {
	agrupaciones = []
	agrupacion_seleccionada = []
	active: boolean = false

	constructor(public navCtrl: NavController, public navParams: NavParams, private view: ViewController) {
		this.agrupaciones = navParams.get('agrupaciones')
		this.agrupaciones = collect(this.agrupaciones).sortBy('items').all()
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad SelectAgrupacionesPage');
	}
	/* Funcion para el manejo de la agrupacion seleccionado.*/
	seleccionAgrupacion = (agruacion: string): void => {
		this.agrupacion_seleccionada.splice(0, this.agrupacion_seleccionada.length)
		this.agrupacion_seleccionada.push(agruacion)
	}

	/* Funcion para enviar agrupaciones seleccionadas. */
	aceptar() {
		this.view.dismiss(this.agrupacion_seleccionada)
	}

	/* Funcion para cancelar los filtros. */
	cancelar() {
		this.view.dismiss()
	}

}