import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { GraficaCircularPage } from './grafica-circular';

@NgModule({
  declarations: [
    GraficaCircularPage,
  ],
  imports: [
    IonicPageModule.forChild(GraficaCircularPage),
  ],
  exports: [
    GraficaCircularPage
  ]
})
export class GraficaCircularPageModule {}
