import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import {
	ReportesDbService
} from '../../../../../../services/reportes.db.service'
import { DetalleProyectoPage } from '../../../../../proyecto/DetalleProyecto'
import { Proyecto } from '../../../../../../interfaces/proyecto'

@IonicPage()
@Component({
	selector: 'page-grafica-filtros-direccion-anio-detalle',
	templateUrl: 'grafica-filtros-direccion-anio-detalle.html',
})
export class GraficaFiltrosDireccionAnioDetallePage {
	direccion: string = ''
	anio: number = 0
	monto: string = ''
	proyectos = []

	constructor(public navCtrl: NavController, public navParams: NavParams,
		private reporteService: ReportesDbService, private ngZone: NgZone) {
		this.direccion = this.navParams.get('direccion')
		this.anio = this.navParams.get('anio')
		this.monto = this.navParams.get('monto')
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad GraficaFiltrosDireccionAnioDetallePage')
		this.detalleReporte()
	}

	/* Funcion para obtener los proyectos de una direccion y un ano de acuerdo al filtro. */
	detalleReporte = () => {
		this.reporteService.reporteDireccionAnioDetalle(this.anio, this.direccion)
		.then(response => {
			this.ngZone.run(() => {
				this.proyectos = response
			})
		})
		.catch(console.error.bind(console))
	}

	/* Funcion para ver el detalle de un proyecto. */
	detalleProyecto = (_proyecto: Proyecto): void => {
		this.navCtrl.push(DetalleProyectoPage, {
			id: _proyecto
		})
	}
}
