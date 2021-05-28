import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { HomePage } from './home.page';

import { HomePageRoutingModule } from './home-routing.module';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HomePageRoutingModule
  ],
  declarations: [HomePage],
  providers: [Geolocation,WifiWizard2]
})
export class HomePageModule {}
