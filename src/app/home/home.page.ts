import { Component, ElementRef, ViewChild } from '@angular/core';

import { Geolocation } from '@ionic-native/geolocation/ngx';
import { Storage } from '@ionic/storage';
import { WifiWizard2 } from '@ionic-native/wifi-wizard-2/ngx';

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

  constructor(private geolocation: Geolocation, private wifiWizard2: WifiWizard2, private storage: Storage) {}

  ionViewWillEnter(){
    this.exibirMapa();
  }

  exibirMapa(){
    const posicao = new google.maps.LatLng(-29.7131, -52.4316);
    const opcoes = {
      center: posicao,
      zoom: 10,
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
    this.map.setZoom(13);
    this.getNetworks();
  }

  async getNetworks() {
    let SSID;
    let BSSID;
    let infoIp;
    let infoSubnet;
    let frequencia;
    let nivel;
    let seguranca;

    try {
      await this.wifiWizard2.getConnectedSSID().then( value => { 
        SSID = value; 
      });
      await  this.wifiWizard2.getConnectedBSSID().then( value => { 
        BSSID = value; 
      });
      await this.wifiWizard2.getWifiIPInfo().then( value => { 
        infoIp = value.ip;
        infoSubnet = value.subnet 
      });
      await this.wifiWizard2.scan().then( value => {
        value.forEach(element => {
          if(element.SSID == SSID){
            frequencia = element.frequency;
            nivel = element.level;
            seguranca = element.capabilities;
          }
       });
      });
      this.ssid = SSID;
      this.content = "<strong>Informações do Wifi conectado:</strong> <br><strong>SSID:</strong>" + String(SSID) + "<br> <strong>BSSID:</strong>" + String(BSSID) + 
      "<br> <strong>Wifi IP: </strong>" + String(infoIp) + "<br> <strong>Wifi Subnet:</strong> " + String(infoSubnet) +
      "<br><strong>Frequência:</strong>" + String(frequencia) + "<br><strong>Nivel do sinal</strong> " + String(nivel) + "<br><strong>Típos de segurança</strong> " + String(seguranca);
      this.gravarDados(this.ssid);
      this.addInfoWindow(this.marker, this.content);
    } catch (error) {
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

  gravarDados(SSID){
    try {
      this.dados.push(this.minhaPosicao,this.content);
      this.storage.set(SSID, this.dados);
      this.ondeEstive();
    }catch (error) {
      alert('Erro em gravar os dados :'+ error);
    }

  };

  ondeEstive(){
    try {
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
        } catch(error){
          alert('Erro em buscar onde estive :'+ error);
        }   
 }
}
