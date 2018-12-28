import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { OpcionesPage } from './opciones';

@NgModule({
  declarations: [
    OpcionesPage,
  ],
  imports: [
    IonicPageModule.forChild(OpcionesPage),
  ],
  exports: [
    OpcionesPage
  ]
})
export class OpcionesPageModule {}
