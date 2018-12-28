import { Component, NgZone } from '@angular/core'
import { IonicPage, NavParams, LoadingController, NavController, ViewController } from 'ionic-angular'
import * as account from 'accounting-js'
import { DbService } from '../../../../../services/db.service'
import { ProyectosAgrupadosClientePage } from '../../../proyectos-agrupados/por-cliente/proyectos-agrupados-cliente'


// @IonicPage()
@Component({
	selector: 'page-proyectos-agrupados-cliente-menores',
	templateUrl: 'proyectos-agrupados-cliente-menores.html',
})

/* Clase para mi componente del detalle de proyecto por pais. */
export class ProyectosAgrupadosClienteMenoresPage {
	proyectos = []
	proyectos_agrupados: any
	monto_total: number = 0
	total_proyectos: number = 0
	proyectosNumero: number = 0

	constructor(private navParams: NavParams,
		public loadingCtrl: LoadingController,
		public navCtrl: NavController,
		private zone: NgZone,
		private dbService: DbService) {
		this.proyectos_agrupados = navParams.get('proyectos_agrupados_detalle')
		this.monto_total = navParams.get('monto_total')
		this.total_proyectos = this.proyectos_agrupados.count()
		this.proyectosNumero = navParams.get('proyectos')
	}
	
	/* Cuando la vista esta activa mostramos el detalle de un anio. */
	ionViewDidLoad () {
		console.log('mostrando el detalle')
		this.detalleProyectosMenores()
	}

	ionViewDidLeave() {
		console.log('removiendo la vista')
	}

	/* Funcion para obtener las proyectos de un cliente agrupado. */
	detalleProyectosMenores = () => {
		this.proyectos = this.proyectos_agrupados.toArray()
	}

	/* Funcion para visualizar los proyectos agrupados por contratante. */
	verProyectosAgrupadosCliente = (contratante: string, monto_total: string): void => {
		this.navCtrl.push(ProyectosAgrupadosClientePage, {
			'contratante': contratante,
			'monto_total' : monto_total,
		})
	}
}
