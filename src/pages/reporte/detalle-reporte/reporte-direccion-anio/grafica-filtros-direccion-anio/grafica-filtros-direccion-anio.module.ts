import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GraficaFiltrosDireccionAnioPage } from './grafica-filtros-direccion-anio';

@NgModule({
  declarations: [
    GraficaFiltrosDireccionAnioPage,
  ],
  imports: [
    IonicPageModule.forChild(GraficaFiltrosDireccionAnioPage),
  ],
  exports: [
    GraficaFiltrosDireccionAnioPage
  ]
})
export class GraficaFiltrosDireccionAnioPageModule {}
