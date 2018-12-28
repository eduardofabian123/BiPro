import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GraficaFiltradaPage } from './grafica-filtrada';

@NgModule({
  declarations: [
    GraficaFiltradaPage,
  ],
  imports: [
    IonicPageModule.forChild(GraficaFiltradaPage),
  ],
  exports: [
    GraficaFiltradaPage
  ]
})
export class GraficaFiltradaPageModule {}
