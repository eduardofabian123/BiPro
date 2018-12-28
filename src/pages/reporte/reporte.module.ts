import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { ReportePage } from './reporte';

@NgModule({
  declarations: [
    ReportePage,
  ],
  imports: [
    IonicPageModule.forChild(ReportePage),
  ],
  exports: [
    ReportePage
  ]
})
export class ReportePageModule {}
