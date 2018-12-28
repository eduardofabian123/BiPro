import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReporteDireccionAnioPage } from './reporte-direccion-anio';

@NgModule({
  declarations: [
    ReporteDireccionAnioPage,
  ],
  imports: [
    IonicPageModule.forChild(ReporteDireccionAnioPage),
  ],
  exports: [
    ReporteDireccionAnioPage
  ]
})
export class ReporteDireccionAnioPageModule {}
