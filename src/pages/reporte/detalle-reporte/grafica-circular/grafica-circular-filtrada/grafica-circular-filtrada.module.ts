import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GraficaCircularFiltradaPage } from './grafica-circular-filtrada';

@NgModule({
  declarations: [
    GraficaCircularFiltradaPage,
  ],
  imports: [
    IonicPageModule.forChild(GraficaCircularFiltradaPage),
  ],
  exports: [
    GraficaCircularFiltradaPage
  ]
})
export class GraficaCircularFiltradaPageModule {}
