import {
	Component
} from '@angular/core';
import {
	IonicPage,
	NavController,
	NavParams,
	ViewController
} from 'ionic-angular'; 
import * as collect from 'collect.js/dist'

@IonicPage()
@Component({
	selector: 'page-select-columnas',
	templateUrl: 'select-columnas.html',
})
export class SelectColumnasPage {
	columnas_seleccionadas = []
	titles_segleccionadas = []
	columnas_preselecccionadas = []
	preseleccion = []

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
		'texto': 'Número de contrato',
		'checked': false,
		'title': 'Número de contrato'
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
		'texto': 'Número de propuesta',
		'checked': false,
		'title': 'Propuesta'
	}, {
		'opcion': 'anticipo',
		'texto': 'Anticipo',
		'checked': false,
		'title': 'Anticipo'
	}, ]
	ionViewDidLoad() {
		this.validaSeleccionInit()
	}
	constructor(public navCtrl: NavController, public navParams: NavParams,
		private view: ViewController) {
		this.columnas = collect(this.columnas).sortBy('texto').all()
		this.columnas_preselecccionadas = this.navParams.get('columnas_preselecccionadas')
	}

	/* Funcion para validar si hay columnas preseleccionadas anteriormente. */
	validaSeleccionInit() {
		this.columnas_preselecccionadas.length !== 0 ? (
			this.columnas.splice(0, this.columnas.length),
			this.columnas = this.columnas_preselecccionadas
		) : ''
	}

	/* Funcion para seleccionar las columnas. */
	seleccionColumnas = (event, columna: string, title: string): void => {
		event.value ? (
			this.columnas.forEach(item => {
				if(item.opcion === columna) {
					item.checked = true
				}
			})
		): (
			this.columnas.forEach(item => {
				if(item.opcion === columna) {
					item.checked =  false
				}
			})
		)
	}

	/* Funcion para enviar columnas seleccionadas. */
	aceptar() {
		this.columnas_seleccionadas.splice(0, this.columnas_seleccionadas.length)
		this.titles_segleccionadas.splice(0, this.titles_segleccionadas.length)

		// Extraemos las columnas seleccionadas
		this.columnas.filter(function(value, key) {
			return value.checked === true
		}).map(item => {
			this.columnas_seleccionadas.push(item.opcion)
			this.titles_segleccionadas.push(item.texto)
		})

		this.view.dismiss({
			columnas: this.columnas_seleccionadas,
			title: this.titles_segleccionadas,
			preseleccion: this.columnas
		})
	}

	/* Funcion para cancelar los filtros. */
	// cancelar() {
	// 	this.navCtrl.pop()
	// }
}