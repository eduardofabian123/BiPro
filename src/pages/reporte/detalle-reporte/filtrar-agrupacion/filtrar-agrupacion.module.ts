import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FiltrarAgrupacionPage } from './filtrar-agrupacion';

@NgModule({
  declarations: [
    FiltrarAgrupacionPage,
  ],
  imports: [
    IonicPageModule.forChild(FiltrarAgrupacionPage),
  ],
  exports: [
    FiltrarAgrupacionPage
  ]
})
export class FiltrarAgrupacionPageModule {}
