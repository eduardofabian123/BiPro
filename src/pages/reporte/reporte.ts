import {
	Component
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	App,
	ViewController
} from 'ionic-angular';
import {
	DetalleReportePage
} from './detalle-reporte/detalle-reporte'
import {
	NuevoReportePage
} from './nuevo-reporte/nuevo-reporte'
import {
	ReportesDbService
} from '../../services/reportes.db.service'
import {
	ReporteDireccionAnioPage
} from '../reporte/detalle-reporte/reporte-direccion-anio/reporte-direccion-anio'
import {
	LoginPage
} from '../../pages/login/login'
import {
	OpcionesPage
} from '../../pages/proyecto/opciones/opciones'

@IonicPage()
@Component({
	selector: 'page-reporte',
	templateUrl: 'reporte.html',
})
export class ReportePage {
	reportes = []
	lastFechaSincronizacion: string = ''

	constructor(public navCtrl: NavController, public navParams: NavParams,
		private reporteService: ReportesDbService, public viewCtrl: ViewController,
		public app: App) {}

	/* Cargamos los proyectos cuando la vista esta activa. */
	ionViewDidLoad() {
		this.getReportes()
		this.obtenerUltimaFechaSincronizacion()
	}

	ionViewWillEnter() {
		this.getReportes()
	}
	/* Funcion para mostrar el detalle de un reporte. */
	detalleReporte = (id: number, nombreReporte: string): void => {
		if (id !== 7) {
			this.navCtrl.push(DetalleReportePage, {
				'id': id,
				'nombre_reporte': nombreReporte
			})
		} else {
			this.reporteDireccionAnios()
		}
	}

	/* Funcion para consultar el reporte de direccion con anios. */
	reporteDireccionAnios() {
		this.navCtrl.push(ReporteDireccionAnioPage, {})
	}

	/* Funcion para crear nuevo reporte. */
	nuevoReporte = (): void => {
		this.navCtrl.push(NuevoReportePage, {})
	}

	/* Funcion para mostrar listado de reportes. */
	getReportes = (): void => {
		this.reporteService.getReportes()
			.then(response => {
				this.reportes = response
			})
	}

	/* Funcion para cerrar sesion. */
	logout = () => {
		this.app.getRootNav().setRoot(LoginPage, {}, {
			animate: true,
			animation: 'ios-transition',
			direction: 'forward'
		})
	}

	/* Funcion para mostrar las opciones de ayuda */
	mostrarOpciones = () => {
		let ventana = this.navCtrl.push(OpcionesPage, {
			lastFechaSincronizacion: this.lastFechaSincronizacion
		})
	}

	/* Funcion para obtener la ultima fecha de sincronizacion. */
	obtenerUltimaFechaSincronizacion = () => {
		this.reporteService.getLastDateSincronizacion()
			.then(response => {
				this.lastFechaSincronizacion = response[0].fecha_registro
			})
	}
}
