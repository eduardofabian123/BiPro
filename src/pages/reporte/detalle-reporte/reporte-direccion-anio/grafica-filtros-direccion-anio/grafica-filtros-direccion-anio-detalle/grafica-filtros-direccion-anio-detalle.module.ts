import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GraficaFiltrosDireccionAnioDetallePage } from './grafica-filtros-direccion-anio-detalle';

@NgModule({
  declarations: [
    GraficaFiltrosDireccionAnioDetallePage,
  ],
  imports: [
    IonicPageModule.forChild(GraficaFiltrosDireccionAnioDetallePage),
  ],
  exports: [
    GraficaFiltrosDireccionAnioDetallePage
  ]
})
export class GraficaFiltrosDireccionAnioDetallePageModule {}
