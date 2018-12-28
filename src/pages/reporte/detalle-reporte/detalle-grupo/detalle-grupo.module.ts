import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetalleGrupoPage } from './detalle-grupo';

@NgModule({
  declarations: [
    DetalleGrupoPage,
  ],
  imports: [
    IonicPageModule.forChild(DetalleGrupoPage),
  ],
  exports: [
    DetalleGrupoPage
  ]
})
export class DetalleGrupoPageModule {}
