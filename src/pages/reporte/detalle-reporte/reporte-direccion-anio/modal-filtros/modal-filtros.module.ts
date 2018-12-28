import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ModalFiltrosPage } from './modal-filtros';

@NgModule({
  declarations: [
    ModalFiltrosPage,
  ],
  imports: [
    IonicPageModule.forChild(ModalFiltrosPage),
  ],
  exports: [
    ModalFiltrosPage
  ]
})
export class ModalFiltrosPageModule {}
