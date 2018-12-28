import {
	Component,
	NgZone,
	EventEmitter,
	Output
} from '@angular/core'
import {
	NavController,
	NavParams,
	ModalController,
	AlertController,
	LoadingController,
	ToastController
} from 'ionic-angular'
import {
	ReportesDbService
} from '../../../services/reportes.db.service'
import * as collect from 'collect.js/dist'
import * as account from 'accounting-js'
import {
	SelectColumnasPage
} from '../nuevo-reporte/select-columnas/select-columnas'
import {
	SelectAgrupacionesPage
} from '../nuevo-reporte/select-agrupaciones/select-agrupaciones'
import {
	FiltrarColumnasPage
} from '../nuevo-reporte/filtrar-columnas/filtrar-columnas'
import {
	DbService
} from '../../../services/db.service'
import {
	Bar
} from '../../../highcharts/modulo.estadisticas/bar'

// @IonicPage()
@Component({
	selector: 'page-nuevo-reporte',
	templateUrl: 'nuevo-reporte.html',
})
export class NuevoReportePage {
	@Output() open: EventEmitter < any > = new EventEmitter
	@Output() close: EventEmitter < any > = new EventEmitter
	columnas_seleccionadas = []
	filtrar_seleccionadas = []
	agrupacion_seleccionada = []
	settings = {}
	data = []
	xy = []
	categories = []
	options = {}
	visible: boolean = true
	visible_boton: boolean = false
	bar: Bar
	whereGlobal
	camposGuardarReporte = []
	columnas_preseleccionadas = []
	columnasInit = []
	titleInit = []
	columnas = [{
		'opcion': 'nombre_proyecto',
		'texto': 'Nombre de proyecto',
		'checked': false,
		'title': 'Nombre de proyecto'
	}, {
		'opcion': 'nombre_corto',
		'texto': 'Nombre corto',
		'checked': false,
		'title': 'Nombre corto'
	}, {
		'opcion': 'contrato',
		'texto': 'Contrato',
		'checked': false,
		'title': 'Contrato'
	}, {
		'opcion': 'monto',
		'texto': 'Monto USD',
		'checked': false,
		'title': 'Monto USD'
	}, {
		'opcion': 'monto_moneda_original',
		'texto': 'Monto moneda original',
		'checked': false,
		'title': 'Monto moneda original'
	}, {
		'opcion': 'moneda',
		'texto': 'Moneda',
		'checked': false,
		'title': 'Moneda'
	}, {
		'opcion': 'pais',
		'texto': 'País',
		'checked': false,
		'title': 'País'
	}, {
		'opcion': 'gerencia',
		'texto': 'Gerencia',
		'checked': false,
		'title': 'Gerencia'
	}, {
		'opcion': 'unidad_negocio',
		'texto': 'Unidad de negocio',
		'checked': false,
		'title': 'Unidad de negocio'
	}, {
		'opcion': 'numero_contrato',
		'texto': 'Numero de contrato',
		'checked': false,
		'title': 'Numero de contrato'
	}, {
		'opcion': 'producto',
		'texto': 'Producto',
		'checked': false,
		'title': 'Producto'
	}, {
		'opcion': 'anio',
		'texto': 'Año',
		'checked': false,
		'title': 'Año'
	}, {
		'opcion': 'duracion',
		'texto': 'Duración',
		'checked': false,
		'title': 'Duracion'
	}, {
		'opcion': 'contratante',
		'texto': 'Contratante',
		'checked': false,
		'title': 'Contratante'
	}, {
		'opcion': 'datos_cliente',
		'texto': 'Datos de cliente',
		'checked': false,
		'title': 'Datos de cliente'
	}, {
		'opcion': 'fecha_inicio',
		'texto': 'Fecha de inicio',
		'checked': false,
		'title': 'Fecha de inicio'
	}, {
		'opcion': 'fecha_fin',
		'texto': 'Fecha de término',
		'checked': false,
		'title': 'Fecha de termino'
	}, {
		'opcion': 'numero_propuesta',
		'texto': 'Numero de propuesta',
		'checked': false,
		'title': 'Propuesta'
	}, {
		'opcion': 'anticipo',
		'texto': 'Anticipo',
		'checked': false,
		'title': 'Anticipo'
	}, ]

	constructor(public navCtrl: NavController, public navParams: NavParams,
		private reporteService: ReportesDbService, private modal: ModalController, public toastCtrl: ToastController,
		public zone: NgZone, public alertCtrl: AlertController, public loadingCtrl: LoadingController, private dbService: DbService) {}

	ionViewDidLoad() {
		this.muestraColumnasInit()
		this.visible = !this.visible

	}

	/* Carga las columnas cuando presentamos la pantalla. */
	muestraColumnasInit = () => {
		this.columnas.forEach(item => {
			this.columnasInit.push(item.opcion)
			this.titleInit.push(item.title)
		})
		/* Llamamos a la funcion para mostrar la grid. */
		this.manageGrid(this.columnasInit, this.titleInit)

		this.llenarGrid('select * from proyectos', [])
	}

	/* Funcion para mostrar las comunas y escoger*/
	selectColumnas = (): void => {
		var miGlobal = this
		/* Pasamos las columnas a la vista de seleeccion de columnas. */
		let modal_columnas = this.modal.create(SelectColumnasPage, {
			'columnas_preselecccionadas': miGlobal.columnas_preseleccionadas
		})
		/* Muestro el modal para seleccionar las columnas. */
		modal_columnas.present()
		/* Cuando cierro mi modal recupero mis columnas que seleccione. */
		modal_columnas.onDidDismiss(data => {

			this.visible = false
			/* Reseteamos los arreglos para actualizar las opciones seleccionadas. */
			this.options = {}
			this.columnas_seleccionadas.splice(0, this.columnas_seleccionadas.length)
			miGlobal.filtrar_seleccionadas.splice(0, this.filtrar_seleccionadas.length)
			this.columnas_preseleccionadas = data.preseleccion

			// Obtenemos las columnas seleccionadas
			let misColumnas = collect(data.columnas).implode(',')
			this.reporteService.getDataGrid(`select ${misColumnas} from proyectos`, [])
				.then(response => {

					/* Mostrarmos la grid. */
					this.manageGrid(data.columnas, data.title, response)
				})


			/* Hacemos una copia de data para filtrar las columnas */
			data.columnas.forEach(function(item, index) {
				miGlobal.filtrar_seleccionadas.push({
					columna: item,
					title: data.title[index]
				})
			})

		})
	}

	/* Funcion para filtar mis columnas seleccionadas.*/
	filtrarColumnas() {
		var miGlobal = this
		if (this.filtrar_seleccionadas.length === 0) {
			let alert = this.alertCtrl.create({
				title: 'Aviso!',
				subTitle: 'Por favor selecciona las columnas para visualizar la grafica!',
				buttons: ['OK']
			});
			alert.present();
		} else {
			/* Creamos la vista para mostrar los filtros*/
			let modalFilter = this.modal.create(FiltrarColumnasPage, {
				'filtros_seleccionadas': collect(this.filtrar_seleccionadas).unique('columna').toArray()
			})
			/* Muestro el modal para seleccionar las filtros. */
			modalFilter.present()
			/* Cuando cierro mi modal recupero mis columnas que seleccione. */
			modalFilter.onDidDismiss(data => {
				let misCampos = []
				let cadena: string = `select `
				let nuevaCadena: string = ``
				let values: string = ''
				let nuevoValues: string = ''
				let nuevaCadenaWhere: string = ''

				this.filtrar_seleccionadas.forEach(items => {
					misCampos.push(items.columna)
					cadena += `${items.columna},`
					nuevaCadena = cadena.slice(0, -1)
					nuevaCadena += ` from proyectos where `
					nuevaCadenaWhere = 'where '
				})

				data.forEach(function(items, index) {
					values = ''

					let keys = Object.keys(items)
					items[`${keys}`].forEach(item => {

						values += `'${item}',`
						nuevoValues = values.slice(0, -1)
					})

					nuevaCadena += `${Object.keys(items)} in (${nuevoValues}) and `
					nuevaCadenaWhere += `${Object.keys(items)} in (${nuevoValues}) and `
				})
				/* Obtenemos los campos de select para guardar el reporte en la table reportes_filtros */
				this.camposGuardarReporte = data
				miGlobal.whereGlobal = nuevaCadenaWhere
				this.reporteService.whereNuevoReporte = miGlobal.whereGlobal

				/* Llamar a la funcion que nos ayudara a realizar la consulta para llenar la grid. */
				this.llenarGrid(nuevaCadena.slice(0, -5), this.filtrar_seleccionadas)
			})
		}
	}

	/* Funcion para realizar la consulta y obtener los datos para llegar nuestra grid. */
	llenarGrid = (consulta: string, filtros) => {
		let filtrosNew = []
		let titleNew = []
		filtros.forEach(item => {
			filtrosNew.push(item.columna)
		})
		filtros.forEach(item => {
			titleNew.push(item.title)
		})
		this.reporteService.getDataGrid(consulta, filtrosNew)
			.then(response => {
				this.data = response
				/* Mostrarmos la grid. */
				/* En caso de que la gris carga por primera vez*/
				if (filtrosNew.length === 0 && titleNew.length === 0) {
					this.manageGrid(this.columnasInit, this.titleInit, response)
				}
				/* En caso de que la gris tenga filtros seleccionados. */
				else {
					this.manageGrid(filtrosNew, titleNew, response)
				}
			})
	}

	/* Funcion para administrar el grid.  */
	manageGrid = (columnas ? : Array < any > , title ? : Array < any > , data ? : Array < any > ): Object => {
		this.settings = {
			noDataMessage: 'Datos no encontrados',
			columns: {}
		}
		var miGlobal = this
		this.data = data
		let contador = 0
		for (let opcion of columnas) {
			miGlobal.settings['hideSubHeader'] = false
			miGlobal.settings['hideHeader'] = false

			miGlobal.settings['columns'][opcion] = {
				title: title[contador],
				filter: false
			}
			contador++
		}
		return miGlobal.settings
	}

	/* Funcion para mostrar las opciones para agrupar la grafica. */
	selectAgrupaciones() {
		if (this.filtrar_seleccionadas.length === 0) {
			let alert = this.alertCtrl.create({
				title: 'Aviso!',
				subTitle: 'Por favor selecciona las columnas y los filtros para visualizar la grafica!',
				buttons: ['OK']
			});
			alert.present();
		} else {
			/* Preparamos nuestras columnas para construir la grafica. */
			this.filtrar_seleccionadas.forEach(items => {
				this.columnas_seleccionadas.push(items.columna)
			})
			let modalAgrupaciones = this.modal.create(SelectAgrupacionesPage, {
				agrupaciones: collect(this.filtrar_seleccionadas).unique('columna').toArray()
			})
			/* Activamos la vista para seleccionar nuestra agrupacion. */
			modalAgrupaciones.present()

			/* Cuando cerramos la vista de agrapaciones recuperamos la agruapacion seleccionada. */
			modalAgrupaciones.onDidDismiss(response => {
				if (response.length === 0) {
					let alert = this.alertCtrl.create({
						title: 'Aviso!',
						subTitle: 'Por favor selecciona una agrupación para visualizar la grafica!',
						buttons: ['OK']
					});
					alert.present();
				} else {
					this.agrupacion_seleccionada = response
					// console.log('ver grafica  ' + !this.visible)

					this.visible = true
					/* Llamar a la funcion que se encarga de graficar. */
					this.graficar(this.columnas_seleccionadas, response)
				}
			})
		}
	}

	/* Funcion que nos servira para graficar la informacion. */
	graficar(columnas: Array < any > , agrupacion: Array < any > ) {

		this.agrupacion_seleccionada = agrupacion
		this.reporteService.paraGraficarNuevoReporte(columnas, agrupacion)
			.then(res => {
				/* refrescamos el arreglo de la grafica. */
				this.xy.splice(0, this.xy.length)

				let resultado = []
				/* Refactorizamos la data obtenida por la consulta. */
				for (var i = 0; i < res.rows.length; i++) {
					resultado.push({
						'campo': res.rows.item(i).campo,
						'monto': account.formatNumber(parseInt(res.rows.item(i).monto)),
						'total': res.rows.item(i).total,
						'numero_proyectos': res.rows.item(i).numero_proyectos,
						'monto_filtrado': res.rows.item(i).monto_filtrado,
						'porcentaje': account.toFixed((res.rows.item(i).numero_proyectos / res.rows.item(i).total_proyectos_filtrados) * 100, 2)
					})
				}
				/* Obtenemos la data final para construir la grafica */
				resultado.forEach(item => {
					this.xy.push({
						name: item.campo,
						y: parseFloat(item.porcentaje)
					})
				})
				this.zone.run(() => {
					this.agrupacion_seleccionada[0] === 'anio' ? this.agrupacion_seleccionada[0] = 'año' : this.agrupacion_seleccionada[0] === 'unidad_negocio' ? this.agrupacion_seleccionada[0] = 'dirección' : this.agrupacion_seleccionada[0] === 'pais' ? this.agrupacion_seleccionada[0] = 'país' :
						this.agrupacion_seleccionada[0] === 'numero_propuesta' ? this.agrupacion_seleccionada[0] = 'Número de propuesta' : this.agrupacion_seleccionada[0] === 'datos_cliente' ? this.agrupacion_seleccionada[0] = 'datos de cliente' : this.agrupacion_seleccionada[0] === 'duracion' ? this.agrupacion_seleccionada[0] = 'duración' :
						this.agrupacion_seleccionada[0] === 'fecha_inicio' ? this.agrupacion_seleccionada[0] = 'fecha de inicio' : this.agrupacion_seleccionada[0] === 'fecha_fin' ? this.agrupacion_seleccionada[0] = 'fecha de término' :
						this.agrupacion_seleccionada[0] === 'monto_moneda_original' ? this.agrupacion_seleccionada[0] = 'Monto total original' : this.agrupacion_seleccionada[0] === 'nombre_corto' ? this.agrupacion_seleccionada[0] = 'Nombre corto' :
						this.agrupacion_seleccionada[0] === 'nombre_proyecto' ? this.agrupacion_seleccionada[0] = 'Nombre de proyecto' : this.agrupacion_seleccionada[0] === 'numero_contrato' ? this.agrupacion_seleccionada[0] = 'Número de contrato' :
						this.agrupacion_seleccionada[0] === 'pais' ? this.agrupacion_seleccionada[0] = 'país' : ''

					/* Realizamos la instancia a nuestra clase para contruir la grafica. */
					this.bar = new Bar(this.xy, this.agrupacion_seleccionada[0], 'Proyectos agrupados por ' + this.agrupacion_seleccionada[0])
					this.options = this.bar.graficaBar()
					this.visible_boton = !this.visible_boton
				})
			})

	}
	/* Funcion para guardar un reporte. */
	guardarReporte = (): void => {
		let title = this.agrupacion_seleccionada[0]
		let confirmacion = this.alertCtrl.create({
			title: 'Registro de reporte',
			message: 'Introduce un nombre para este nuevo reporte',
			inputs: [{
				name: 'title',
				placeholder: 'Nombre del reporte'
			}, ],
			buttons: [{
				text: 'Cancelar',
				handler: () => {
					confirmacion.dismiss()
				}
			}, {
				text: 'Guardar',
				handler: data => {
					if (data.title === '') {
						this.verToast('middle')
					} else {
						/* Consigo el total del monto y numero de proyectos para registrar el reporte. */
						this.reporteService.paraGuardarReporte(title, this.whereGlobal)
							.then(response => {
								let mi_collect = collect(response)
								let monto_total = mi_collect.sum('monto')

								let numero_proyectos = mi_collect.sum('numero_proyectos')
								/* Registramos el reporte */
								this.reporteService.saveReporte(data['title'], monto_total, numero_proyectos)
									.then(response => {
										/* Obtenemos el id del reporte registrado*/
										let last_id = response[0]['id']
										/* Registramos en la tabla reporte agrupado.*/
										this.reporteService.insertarReporteAgrupado(last_id, title)
											.then(response => {
												/* Registramos en reportes columnas*/
												this.reporteService.insertReporteColumnas(response.insertId, title)
													.then(response => {
														/* Registramos los filtros del reporte y sus campos de seleccion. */
														this.reporteService.insertReporteFiltros(this.camposGuardarReporte, last_id)
														this.navCtrl.pop()
													})
											})
									})
							})
					}

				}
			}]
		})
		confirmacion.present()
	}
	/* Funcion para ver la advertencia en caso de que al guardar un reporte no se introduzca un titulo*/
	verToast(position: string) {
		let toast = this.toastCtrl.create({
			message: 'Por favor introduce un título para el reporte!',
			duration: 3000,
			position: position
		});
		toast.present();
	}

	cancelar = () => {
		this.options = {}
		this.visible = !this.visible
		this.visible_boton = !this.visible_boton
	}
}
