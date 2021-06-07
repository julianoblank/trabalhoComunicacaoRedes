import { Component, ElementRef, ViewChild } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { NativeStorage } from '@ionic-native/native-storage/ngx';
import { Storage } from '@ionic/storage';

declare var WifiWizard2: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  map: google.maps.Map;
  minhaPosicao: google.maps.LatLng;
  results = [];
  marker: google.maps.Marker;
  content: any;
  dados = [];
  ssid: any;
  ssids = [];
 
  @ViewChild('map', {read: ElementRef, static: false}) mapRef: ElementRef

  constructor(private geolocation: Geolocation, private nativeStorage: NativeStorage, private storage: Storage) {}

  ionViewWillEnter(){
    this.getNetworks();
    this.exibirMapa();
  }

  exibirMapa(){
    const posicao = new google.maps.LatLng(-22.194082, -48.778885);
    const opcoes = {
      center: posicao,
      zoom: 20,
      disableDefaultUI: true
    };
    this.map = new google.maps.Map(this.mapRef.nativeElement, opcoes);
    this.buscarPosicao();
  }

  buscarPosicao(){
    this.geolocation.getCurrentPosition().then((resp) => {
      this.minhaPosicao = new google.maps.LatLng(resp.coords.latitude, resp.coords.longitude);
      this.irParaMinhaPosicao();
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  irParaMinhaPosicao(){
    this.map.setCenter(this.minhaPosicao);
    this.map.setZoom(15);

    /*this.marker = new google.maps.Marker({
      position: this.minhaPosicao,
      clickable: true,
      title: 'Onde Estou',
      animation: google.maps.Animation.BOUNCE,
      map: this.map
    });*/

  }

  async getNetworks() {
    try {
      let SSID = await WifiWizard2.getConnectedSSID();
      this.ssid = SSID;
      let BSSID = await WifiWizard2.getConnectedBSSID();
      let info = await WifiWizard2.getWifiIPInfo();
      let scan = await WifiWizard2.scan();
      scan.forEach(element => {
        this.content = "<strong>Informações do Wifi conectado:</strong> <br><strong>SSID:</strong>" + String(SSID) + "<br> <strong>BSSID:</strong>" + String(BSSID) + 
      "<br> <strong>Wifi IP: </strong>" + String(info.ip) + "<br> <strong>Wifi Subnet:</strong> " + String(info.subnet) +
      "<br><strong>Frequência:</strong>" + String(element.frequency) + "<br><strong>Nivel do sinal</strong> " + String(element.level);
      });
      this.gravarDados(this.ssid);
      this.addInfoWindow(this.marker, this.content);
      
    } catch (error) {
      console.log('Error getting network', error);
    }
  }

  addInfoWindow(marker, content){

    let infoWindow = new google.maps.InfoWindow({
      content: content
    });
    //this.gravarDados(SSID);
    google.maps.event.addListener(marker, 'click', () => {
      infoWindow.open(this.map, marker);
    });
  }

  /*async gravarDados(content){
    await this.dados.forEach(element => {
      this.nativeStorage.setItem('ssids', {ssids: element})
    });
    
    await this.nativeStorage.getItem('ssids').then(
      data => {
        this.dados.forEach(element => {         
            this.nativeStorage.setItem(data.ssids, {dadosWifi: content, minhaPosicao: this.minhaPosicao})
        });
    });
  };*/

  gravarDados(SSID){
    this.dados.push(this.minhaPosicao,this.content);
    this.storage.set(SSID, this.dados);
    this.ondeEstive();

  };

  /*async ondeEstive(){
    await this.dados.forEach(element => {
      this.nativeStorage.getItem(element).then(
        data => {
          this.marker = new google.maps.Marker({
            position: data.minhaPosicao,
            clickable: true,
            title: 'Onde Estive',
            animation: google.maps.Animation.BOUNCE,
            map: this.map
          });
          this.addInfoWindow(this.marker,data.dadosWifi);
      });
    });
  }*/
  ondeEstive(){
    this.storage.forEach( (value, key) => {
     //alert(key); 
    // alert(value);//store these values as you wish
     
     let info = this.storage.get(key);
     info.then(
       data => {
           this.marker = new google.maps.Marker({
           position: data[0],
           clickable: true,
           title: 'Onde Estive',
           animation: google.maps.Animation.BOUNCE,
           map: this.map
         });
       this.addInfoWindow(this.marker,data[1]);
     });
     
    });
 }
}
