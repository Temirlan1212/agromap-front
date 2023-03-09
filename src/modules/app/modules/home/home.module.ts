import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { MapComponent } from 'src/modules/ui/components/map/map.component';
import { SidePanelComponent } from 'src/modules/ui/components/side-panel/side-panel.component';

@NgModule({
  declarations: [HomeComponent],
  imports: [CommonModule, HomeRoutingModule, MapComponent, SidePanelComponent],
})
export class HomeModule {}
