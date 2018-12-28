import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { FiltrarColumnasPage } from './filtrar-columnas';

@NgModule({
  declarations: [
    FiltrarColumnasPage,
  ],
  imports: [
    IonicPageModule.forChild(FiltrarColumnasPage),
  ],
  exports: [
    FiltrarColumnasPage
  ]
})
export class FiltrarColumnasPageModule {}
