import {
	Component
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ViewController,
	Platform,
	ToastController,
	LoadingController
} from 'ionic-angular';
import {
	AppVersion
} from '@ionic-native/app-version';
import {
	DocumentViewer,
	DocumentViewerOptions
} from '@ionic-native/document-viewer';
import {
	File
} from '@ionic-native/file';
import {
	Device
} from '@ionic-native/device';
import {
	ApiService
} from '../../../services/api'
import {
	DbService
} from '../../../services/db.service'
import {
	TabsPage
} from '../../../pages/tabs/tabs';

@IonicPage()
@Component({
	selector: 'page-opciones',
	templateUrl: 'opciones.html',
})
export class OpcionesPage {
	versionApp: string = ''
	nombreApp: string = ''
	lastFechaSincronizacion: string = ''

	constructor(public navCtrl: NavController, public navParams: NavParams,
		private appVersion: AppVersion, private document: DocumentViewer, public viewCtrl: ViewController, public platform: Platform,
		private file: File, private device: Device, private apiService: ApiService, private toast: ToastController,
		public dbService: DbService, private loadinCtrl: LoadingController, ) {
		this.lastFechaSincronizacion = this.navParams.get('lastFechaSincronizacion')
			// this.lastFechaSincronizacion = '2017-10-21 11:49:28'
	}

	ionViewDidLoad() {
		console.log('ionViewDidLoad OpcionesPage');
		this.detalleApp()
	}

	/* Funcion para obtener el detalle de la app*/
	detalleApp = () => {
		this.appVersion.getVersionNumber().then(version => {
			this.versionApp = version
		})
		this.appVersion.getAppName().then(nombre => {
			this.nombreApp = nombre
		})
	}

	/* Funcion para ver archivo pdf*/
	muestraPdf = () => {
		/* Obtenemos el path absoluto */
		let path: string = this.file.applicationDirectory + 'www/assets/'

		const options: DocumentViewerOptions = {
				title: 'Manual de usuario'
			}
			/* Visualizamos el pdf en pantalla */
		this.document.viewDocument(path + 'BIPRO.pdf', 'application/pdf', options)
	}

	/* Funcion para cerrar la ventana de opciones */
	cerrarOpciones = () => {
		this.viewCtrl.dismiss()
	}

	/* Funcion para sincronizar nuevamente la informacion con el archivo excel.*/
	sincronizar = () => {
		let loader = this.loadinCtrl.create({
			content: 'Verificando información',
		})
		loader.present(),
			this.apiService.readerArchivoExcel(this.lastFechaSincronizacion)
			.then(response => {
				console.log(response)
				let msj
				response.status === 200 ? (
					loader.dismiss(),
					msj = this.toast.create({
						message: 'La información está actualizada',
						duration: 3000,
						position: 'middle'
					}),
					msj.present(),
					this.viewCtrl.dismiss()
				) : (
					this.apiService.fetch()
					.then(response => {
						this.dbService.delete()
						this.viewCtrl.dismiss()
							/* LLamar a la funcion que nos ayudara a registrar la informacion del endpoint a nuestra aplicacion movil. */
						this.apiService.regitrarData(response)
							/* Funcion para registrar un historial de la sincronizacion. */
						this.apiService.regitraSincronizacion()
							// construimos el origen de datos faltante para el modulo de reportes.
						this.dbService.creaTablaReportes()
						this.dbService.creaTablaReporteColumnas()
						this.dbService.creaTablaReporteFiltros()
						this.dbService.creaTablaReporteAgrupaciones()
						this.dbService.createTableAnios()
						this.dbService.createTableDireccionAnios()
						this.dbService.insertaDatosTablaReportes()
						this.dbService.insertaDatosTablaReportesColunas()
						this.dbService.insertaDatosTablaReportesAgrupacion()
						this.dbService.insertAnios()
						this.dbService.insertDireccionAnios()
						this.navCtrl.setRoot(TabsPage, {}, {
							animate: true,
							animation: 'ios-transition',
							direction: 'forward'
						})
					}),
					loader.dismiss()
				)
			})
	}
}