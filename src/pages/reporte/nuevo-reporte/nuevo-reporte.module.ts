import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { NuevoReportePage } from './nuevo-reporte';

@NgModule({
  declarations: [
    NuevoReportePage,
  ],
  imports: [
    IonicPageModule.forChild(NuevoReportePage),
  ],
  exports: [
    NuevoReportePage
  ]
})
export class NuevoReportePageModule {}
