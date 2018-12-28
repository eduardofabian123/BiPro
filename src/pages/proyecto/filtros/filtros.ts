import {
	Component
} from '@angular/core'
import {
	ViewController,
	NavParams
} from 'ionic-angular'

@Component({
		selector: 'page-filtros',
		templateUrl: 'filtros.html',

	})
	/*
		Clase para el manejo de los filtros de busqueda de proyectos.
	 */
export class FiltrosPage {

	data_send = []
	//selectDefault: boolean
	//selectAll: boolean
	filtrosPreseleccionados = []
	filtrosSeleccionadosInit = []

	constructor(public navParams: NavParams, public viewCtrl: ViewController) {
		// this.selectDefault = true
		this.filtrosSeleccionadosInit = navParams.get('filtrosPreseleccccion')
	}

	ionViewDidLoad() {
			/* Filtros no seleccionados mostramos los default */
			if (this.filtrosSeleccionadosInit.length === 0) {
				this.items
			} else {
				/* En caso de que haya filtros preseleccionados mostramos estos valores. */
				this.items.forEach(item => {
					this.filtrosSeleccionadosInit.forEach(presellect => {
						if (item.opcion === presellect.opcion) {
							item.checked = true
						}
					})
				})
			}
		}
		/* Declaramos nuestros filtros a mostrar en pantalla. */
	items = [{
		'opcion': 'unidad_negocio',
		'texto': 'Unidad de negocio',
		'checked': false
	}, {
		'opcion': 'gerencia',
		'texto': 'Gerencia',
		'checked': false
	}, {
		'opcion': 'producto',
		'texto': 'Producto',
		'checked': true
	}, {
		'opcion': 'numero_propuesta',
		'texto': 'Número de propuesta',
		'checked': false
	}, {
		'opcion': 'contrato',
		'texto': 'Contrato',
		'checked': false
	}, {
		'opcion': 'anio',
		'texto': 'Año',
		'checked': true
	}, {
		'opcion': 'nombre_proyecto',
		'texto': 'Nombre de proyecto',
		'checked': true
	}, {
		'opcion': 'nombre_corto',
		'texto': 'Nombre corto',
		'checked': false
	}, {
		'opcion': 'contratante',
		'texto': 'Contratante',
		'checked': true
	}, {
		'opcion': 'datos_cliente',
		'texto': 'Datos de cliente',
		'checked': true
	}, {
		'opcion': 'fecha_inicio',
		'texto': 'Fecha de inicio',
		'checked': false
	}, {
		'opcion': 'fecha_fin',
		'texto': 'Fecha de término',
		'checked': false
	}, {
		'opcion': 'duracion',
		'texto': 'Duración',
		'checked': false
	}, {
		'opcion': 'pais',
		'texto': 'País',
		'checked': true
	}, ]


	/* Funcion para la opcion de que en caso seleccione todas las opciones. */
	// seleccionAll() {
	// 	this.selectAll = true
	// 		/* En caso de que se seleccione todas las opciones. */
	// 	if (this.selectAll) {
	// 		/* Activamos todas las opciones. */
	// 		this.items.forEach(item => {
	// 			item.checked = this.selectAll
	// 		})
	// 	} else {
	// 		console.log('select all else ' + this.selectAll),
	// 			 En caso de que la opcion de seleccionar todos sea desactivada. 
	// 			this.items.forEach(
	// 				(data) => {
	// 					/* Desactivamos todas las opciones. */
	// 					return (
	// 						data.opcion = data.opcion,
	// 						data.checked = this.selectAll

	// 					)
	// 				},
	// 				this.data_send = [],
	// 			)
	// 		console.log(this.items)

	// 	}
	// }

	/* Funcion para seleccionar opciones por default. */
	// seleccionDefault() {
	// 	console.log('init')

	// 	/* Activamos las opciones por default. */
	// 	if (this.selectDefault) {
	// 		console.log('select default ' + this.selectDefault);

	// 		this.items.forEach(item => {
	// 			item.checked = false
	// 		})

	// 		this.items.filter(item => {
	// 			return (
	// 				item.opcion == 'producto' ||
	// 				item.opcion == 'anio' ||
	// 				item.opcion == 'nombre_proyecto' ||
	// 				item.opcion == 'contratante' ||
	// 				item.opcion == 'datos_cliente' ||
	// 				item.opcion == 'pais'
	// 			)

	// 		}).map((map) => {
	// 			map.checked = this.selectDefault
	// 		})
	// 	} else {
	// 		/* En caso de que desactive la opcion de busqueda por opciones por default, desactivamos las opciones. */
	// 		this.items.forEach(
	// 			(data) => {
	// 				return (
	// 					data.opcion = data.opcion,
	// 					data.checked = this.selectDefault
	// 				)
	// 			},
	// 			this.data_send = []
	// 		)
	// 	}
	// }

	// Funcion para filtrar en forma personalizada
	// seleccionLibre = () => {
	// 	this.items.forEach(item => {
	// 		item.checked = false
	// 	})
	// }

	/* Funcion para cerrar la ventana de filtros. */
	cerrarFiltros() {
		let data_filter = this.items.filter(function(item) {
			return item.checked == true
		})

		data_filter.forEach(item => {
			/* almacenamos las opciones para realizar la busqueda.*/
			this.data_send.push({
				'opcion': item.opcion
			})

			// Almacenamos las opciones seleccionados para volver a mostrarlas en caso de que se cargue de nuevo la vista
			this.filtrosPreseleccionados.push({
				'opcion': item.opcion,
				'texto': item.texto,
				'checked': item.checked
			})
		})

		/* Enviamos nuestras opciones para realizar la busqueda. */
		this.viewCtrl.dismiss({
			'filtrosSeleccionados': this.data_send,
			'filtrosPreseleccccion': this.filtrosPreseleccionados
		})
	}

	/* Funcion para cancelar los filtros. */
	cancelar() {
		this.viewCtrl.dismiss()
	}
}