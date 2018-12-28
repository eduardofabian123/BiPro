import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { DetalleReporteAgrupadoPage } from './detalle-reporte-agrupado';

@NgModule({
  declarations: [
    DetalleReporteAgrupadoPage,
  ],
  imports: [
    IonicPageModule.forChild(DetalleReporteAgrupadoPage),
  ],
  exports: [
    DetalleReporteAgrupadoPage
  ]
})
export class DetalleReporteAgrupadoPageModule {}
