import {
	Component
} from '@angular/core';
import {
	LoadingController,
	NavController,
	Platform,
	AlertController,
	ToastController
} from 'ionic-angular';
import {
	TabsPage
} from '../../pages/tabs/tabs';

import {
	ApiService
} from '../../services/api'
import {
	DbService
} from '../../services/db.service'
import {
	ReportesDbService
} from '../../services/reportes.db.service'
import * as moment from 'moment'

@Component({
	selector: 'page-login',
	templateUrl: 'login.html',
})
/**
 * Componenete para el manejo de sesion.
 */
export class LoginPage {

	username: string = ''
	password: string = ''
	fechaActual = ''
	loader = this.loadinCtrl.create({
		content: 'Conectando ...',
	})

	constructor(
		public platform: Platform,
		private alertCtrl: AlertController,
		private loadinCtrl: LoadingController,
		private navCtrl: NavController,
		private apiService: ApiService,
		private reporteService: ReportesDbService,
		public dbService: DbService,
		private toast: ToastController) {
		this.fechaActual = moment().format('YYYY-MM-DD h:mm:ss')
	}

	/* Funcion para loguar al usuario */
	login = (): void => {
		// En caso de que no se introduzca datos mostramos un mensaje.
		if (this.username == '' || this.password == '') {
			let msj = this.alertCtrl.create({
				message: 'Debe completar el usuario y la clave de acceso',
				buttons: ['OK']
			})
			msj.present()
		} else {
			/* Resolvemos el api para loguer al usuario y obtener el token. */
			this.apiService.resolveApi(this.username, this.password)
				.then(response => {
					if (response === undefined) {
						/* En caso de error no autorizado mostramos una advertencia  */
						let msj = this.alertCtrl.create({
							message: 'Usuario o clave de acceso incorrectos',
							buttons: ['OK']
						})
						msj.present()
					} else {
						let lastFecha: string = ''
						/* Si hay un token valido obtenemos la ultima fecha de sincronizacion. */
						this.reporteService.getLastDateSincronizacion()
							.then(response => {
								if (response.length === 0) {
									lastFecha = ''
								} else {
									lastFecha = response[0].fecha_registro
								}
								/* Funcion para resolver el endpoint del api y para validar las fechas de modificaciones. */
								this.validarRecursos(lastFecha)
							})
					}
				})
				.catch(error => {
					console.error.bind(console)
				})
		}
	}

	/* Funcion para resolver el endpoint del api */
	validarRecursos(lastFecha: string) {
		this.loader.present()
		this.apiService.readerArchivoExcel(lastFecha)
			.then(response => {
				/*
				Si el status 200 no hay sincronisacion, en caso contrario sincronizamos
				 */
				if (response.status === 200) {
					setTimeout(() => {
						this.navCtrl.push(TabsPage, {}, {
							animate: true,
							animation: 'ios-transition',
							direction: 'forward'
						})
						this.loader.dismiss()
						// construimos el origen de datos faltante para el modulo de reportes.
						this.dbService.delete()
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
					}, 1000)
				} else {
					/**
					 * En caso de que haya actualizaciòn en el archivo excel sincronizamos la informaciòn
					 */
					this.sincronizar()
				}
			})
			.catch(error => {
				console.error.bind(console)
			})
	}

	/* Funcion para sincronizar la informacion con la aplicacion movil. */
	async sincronizar() {
		this.apiService.fetch()
			.then(response => {
				/* LLamar a la funcion que nos ayudara a registrar la informacion del endpoint a nuestra aplicacion movil. */
				this.apiService.regitrarData(response)
				/* Funcion para registrar un historial de la sincronizacion. */
				this.apiService.regitraSincronizacion()
				// construimos el origen de datos faltante para el modulo de reportes.
				this.dbService.delete()
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
				this.navCtrl.push(TabsPage, {}, {
					animate: true,
					animation: 'ios-transition',
					direction: 'forward'
				})
				this.loader.dismiss()
			})
	}
}
