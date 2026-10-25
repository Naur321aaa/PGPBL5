import { Component, OnInit, inject } from '@angular/core';
import { NavController, AlertController } from '@ionic/angular';
import { DataService } from '../data.service';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { icon, Marker } from 'leaflet';

const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

const iconDefault = icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-createpoint',
  templateUrl: './createpoint.page.html',
  styleUrls: ['./createpoint.page.scss'],
  standalone: false
})
export class CreatepointPage implements OnInit {

  name = '';
  coordinates = '';
  description = '';

  map!: L.Map;

  editMode = false;
  pointKey: string | null = null;

  private navCtrl = inject(NavController);
  private alertCtrl = inject(AlertController);
  private dataService = inject(DataService);
  private router = inject(Router);

  constructor() {}

  ngOnInit() {

    setTimeout(() => {

      this.map = L.map('mapcreate').setView(
        [-7.7956, 110.3695],
        13
      );

      var osm = L.tileLayer(
        'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
        {
          attribution: '© OpenStreetMap contributors'
        }
      );

      // Esri World Imagery
      var esri = L.tileLayer(
        'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        {
          attribution: 'ESRI'
        }
      );

      osm.addTo(this.map);

      // Layer control
      var baseMaps = {
        "OpenStreetMap": osm,
        "Esri World Imagery": esri
      };

      L.control.layers(baseMaps).addTo(this.map);

      var tooltip =
        'Drag the marker or move the map to change the coordinates of the location';

      var marker = L.marker(
        [-7.7956, 110.3695],
        {
          draggable: true
        }
      );

      marker.addTo(this.map);
      marker.bindPopup(tooltip);
      marker.openPopup();

      // Dragend marker
      marker.on('dragend', (e) => {

        let latlng = e.target.getLatLng();

        let lat = latlng.lat.toFixed(9);
        let lng = latlng.lng.toFixed(9);

        // push lat lng to coordinates input
        this.coordinates = lat + ',' + lng;

        console.log(this.coordinates);

      });

    });

  }

  async save() {

    if (this.name && this.coordinates && this.description) {

      try {

        const pointData = {
          name: this.name,
          coordinates: this.coordinates,
          description: this.description
        };

        // if (this.editMode && this.pointKey) {
        //   await this.dataService.updatePoint(this.pointKey, pointData);
        // } else {
          await this.dataService.savePoint(pointData);
        // }

        this.navCtrl.navigateBack(['/tabs/maps']);

      } catch (error: any) {

        const alert = await this.alertCtrl.create({
          header: 'Save Failed',
          message: error.message,
          buttons: ['OK'],
        });

        await alert.present();
      }
    }
  }

}
