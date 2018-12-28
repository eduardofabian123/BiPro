import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectAgrupacionesPage } from './select-agrupaciones';

@NgModule({
  declarations: [
    SelectAgrupacionesPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectAgrupacionesPage),
  ],
  exports: [
    SelectAgrupacionesPage
  ]
})
export class SelectAgrupacionesPageModule {}
