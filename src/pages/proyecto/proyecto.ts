import {
	Component,
	NgZone
} from '@angular/core'
import {
	Proyecto
} from '../../interfaces/proyecto'
import {
	DetalleProyectoPage
} from './DetalleProyecto'
import {
	ModalController,
	LoadingController,
	NavController,
	Platform,
	NavParams,
	App,
	ViewController,
	AlertController
} from 'ionic-angular'
import {
	FiltrosPage
} from './filtros/filtros'
import {
	DbService
} from '../../services/db.service'
import {
	LoginPage
} from '../../pages/login/login'
import {
	ApiService
} from '../../services/api'
import {
	OpcionesPage
} from '../../pages/proyecto/opciones/opciones'
import {
	ReportesDbService
} from '../../services/reportes.db.service'
import * as collect from 'collect.js/dist'

@Component({
	selector: 'page-proyecto',
	templateUrl: 'proyecto.html'
})

/* Clase de mi componente proyecto.html */
export class ProyectoPage {
	lastFechaSincronizacion: string = ''

	constructor(
		public navCtrl: NavController,
		public modalCtrl: ModalController,
		public dbService: DbService,
		public loadingCtrl: LoadingController,
		public platform: Platform,
		public zone: NgZone, private apiService: ApiService,
		private navParams: NavParams,
		public viewCtrl: ViewController,
		public app: App,
		private alert: AlertController,
		private reporteService: ReportesDbService, ) {

	}

	proyectos = []
	proyectosBusqueda = []
	items = []
	opciones = []
	textoBusqueda: string = ''
	filtrosPreseleccionados = []

	ngOnInit() {
		this.getProyectos()
		this.obtenerUltimaFechaSincronizacion()
	}
	/* Obtenemos los proyectos del servicio db.service de proyectos. */
	getProyectos() {
		let loading = this.loadingCtrl.create({
			content: 'Cargando proyectos, por favor espere...'
		})
		loading.present()
		// Cuando mostramos la primera pantalla creaammos las tablas faltantes con registros para el manejo de los reportes.
		this.dbService.getProyectos()
			.then(proyectos => {
				this.zone.run(() => {
					collect(proyectos).sortBy(function(item, key) {
						return item['nombre_proyecto']
					})
					this.proyectos = proyectos
					this.proyectosBusqueda = proyectos
					loading.dismiss()
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
	/* Funcion para filtar los proyectos. */
	buscaProyectos = (event: any, filtros = this.opciones): void => {
		// Obtenemos el valor del input.
		let val = event.target.value

		// Cuando inicia la aplicacion establecemos valores definidos para la busqueda.
		filtros.length === 0 ? (
			filtros = [{
				'opcion': 'anio'
			}, {
				'opcion': 'contratante'
			}, {
				'opcion': 'datos_cliente'
			}, {
				'opcion': 'nombre_proyecto'
			}, {
				'opcion': 'pais'
			}, {
				'opcion': 'producto'
			}]

		) : ''

		// Si el valor no es vacio filtra los proyectos.
		val && val.trim() != '' ? (
			setTimeout(() => {
				this.dbService.openDatabase()
					.then(() => this.dbService.buscaProyecto(val, filtros))
					.then(proyectos => {
						this.proyectos = proyectos
					})
					.catch(e => console.log(e))
			}, 0)
		) : (
			/* Si no hay ningun valor en el campo muestra el listado de los proyectos. */
			this.getProyectos(),
			filtros.splice(0, filtros.length)
		)
	}

	/* Funcion que muestra los filtros de busqueda. */
	muestraFiltros = (): void => {
		/* Creamos una ventana modal.*/
		let filterModal = this.modalCtrl.create(FiltrosPage, {
			filtrosPreseleccccion: this.filtrosPreseleccionados
		})
		/* Mostramos la ventana modal. */
		filterModal.present()
		/* Cierra la ventana modal y recuperamos las opciones que se seleccionaron. */
		filterModal.onDidDismiss(data => {
			console.log(data);

			this.opciones = data.filtrosSeleccionados
			this.filtrosPreseleccionados = data.filtrosPreseleccccion
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
		this.navCtrl.push(OpcionesPage, {
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

	/*Funcion para buscar proyectos relacionados en texto que se tecleo. */
	busquedaProyectos = () => {
		let alert = this.alert.create({
			title: 'Advertencia',
			subTitle: 'El valor de la búsqueda no puede ser vacío, por favor introduce un valor',
			buttons: ['OK']
		})
		this.textoBusqueda === '' ? (alert.present()) :
			(
				this.buscaProyectos
			)
	}
}
