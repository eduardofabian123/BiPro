import { Component, NgZone } from '@angular/core'
import { NavParams, LoadingController, NavController, ViewController } from 'ionic-angular'
import { DbService } from '../../../../services/db.service'
import { Proyecto } from '../../../../interfaces/proyecto'
import { DetalleProyectoPage } from '../../../proyecto/DetalleProyecto'

@Component({
	selector: 'page-proyectos-agrupados-cliente',
	templateUrl: 'proyectos-agrupados-cliente.html',
})

/* Clase para mi componente del detalle de proyecto por pais. */
export class ProyectosAgrupadosClientePage {
	proyectos = []
	contratante: string = ''
	monto_total: number
	
	constructor(private navParams: NavParams,
		private dbService: DbService,
		public loadingCtrl: LoadingController,
		public navCtrl: NavController,
		private zone: NgZone,
		private viewCtrl: ViewController) {
		this.contratante = navParams.get('contratante')
		this.monto_total = navParams.get('monto_total')
	}
	
	/* Cuando la vista esta activa mostramos el detalle de un anio. */
	ionViewDidLoad () {
		console.log('mostrando el detalle')
		// this.navCrtl.pop()
		this.detallePorCliente()
	}

	ionViewDidLeave() {
		console.log('removiendo la vista')
	}

	/* Funcion para obtener las proyectos de un anio. */
	detallePorCliente = () => {
		let loading = this.loadingCtrl.create({
			content: 'Por favor espere',
		})
		loading.present();

		setTimeout(() => {
			this.dbService.openDatabase()
			.then(() => this.dbService.consultaClienteAgrupado(this.contratante))
			.then(proyectos => {
				this.zone.run(() => {
					this.proyectos = proyectos
					loading.dismiss();
				})
			})
			.catch(console.error.bind(console))
		}, 0)
	}

	/* Funcion para ver el detalle de un proyecto. */
	detalleProyecto = (_proyecto: Proyecto): void => {
		this.navCtrl.push(DetalleProyectoPage, {
			id: _proyecto
		})
	}
}
