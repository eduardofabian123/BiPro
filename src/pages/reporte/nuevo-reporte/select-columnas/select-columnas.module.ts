import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { SelectColumnasPage } from './select-columnas';

@NgModule({
  declarations: [
    SelectColumnasPage,
  ],
  imports: [
    IonicPageModule.forChild(SelectColumnasPage),
  ],
  exports: [
    SelectColumnasPage
  ]
})
export class SelectColumnasPageModule {}
