import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { EstadisticaPage } from './estadistica';

@NgModule({
	declarations: [
		EstadisticaPage,
	],
	imports: [
		IonicPageModule.forChild(EstadisticaPage),
	],
})
export class EstadisticaPageModule {}