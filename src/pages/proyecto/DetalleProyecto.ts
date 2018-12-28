import { Component } from '@angular/core'
import { NavParams, NavController, ViewController } from 'ionic-angular'

@Component({
	selector: 'page-detalle-proyecto',
	templateUrl: 'detalle-proyecto.html'
})

/* Clase para el detalle de un proyecto. */
export class DetalleProyectoPage {
	proyecto = {}
	constructor(private navParams: NavParams,
		private navCtrl: NavController,
		private viewCtrl: ViewController) {
		this.proyecto = navParams.get('id')
	}
}
