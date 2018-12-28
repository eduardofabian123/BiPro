import { Component, NgZone } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController } from 'ionic-angular';
import { ReportesDbService } from '../../../../services/reportes.db.service'
import { Proyecto } from '../../../../interfaces/proyecto'
import { DetalleProyectoPage } from '../../../proyecto/DetalleProyecto'

@IonicPage()
@Component({
	selector: 'page-detalle-reporte-agrupado',
	templateUrl: 'detalle-reporte-agrupado.html',
})
export class DetalleReporteAgrupadoPage {

	proyectos = []
	campo: string = ''
	monto_total: number = 0
	groupBy: string = ''

	constructor(public navCtrl: NavController, public navParams: NavParams, public loadingCtrl: LoadingController,
		private reporteService: ReportesDbService, public zone: NgZone) {

		/* Recuperamos los parametros para el detalle del reporte. */
		this.campo = navParams.get('campo')
		this.monto_total = navParams.get('monto_total')
		this.groupBy = navParams.get('groupBy')
		this.groupBy === 'año' ? this.groupBy = 'anio' : this.groupBy === 'dirección' ? this.groupBy = 'unidad_negocio': ''
		
	}

	ionViewDidLoad() {
		this.detallePorCampo()
	}

	/* Funcion que nos ayudara a consultar el detalle de un reporte dado a un campo. */
	detallePorCampo = () => {
		let loading = this.loadingCtrl.create({
			content: 'Por favor espere',
		})
		loading.present()

		setTimeout(() => {
			this.reporteService.consultaXCampoAgrupado(this.campo, this.groupBy)
			.then(proyectos => {
				this.zone.run(() => {
					this.proyectos = proyectos
					loading.dismiss();
					console.log(this.proyectos)
				})
			})
			.catch(console.error.bind(console))
		}, 0)
	}

	// /* Funcion para ver el detalle de un proyecto. */
	detalleProyecto = (_proyecto: Proyecto): void => {
		this.navCtrl.push(DetalleProyectoPage, {
			id: _proyecto
		})
	}
}
