import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReporteDireccionAnioGrupoPage } from './reporte-direccion-anio-grupo';

@NgModule({
  declarations: [
    ReporteDireccionAnioGrupoPage,
  ],
  imports: [
    IonicPageModule.forChild(ReporteDireccionAnioGrupoPage),
  ],
  exports: [
    ReporteDireccionAnioGrupoPage
  ]
})
export class ReporteDireccionAnioGrupoPageModule {}
