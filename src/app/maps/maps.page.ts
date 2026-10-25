
import { Component, OnInit, inject } from '@angular/core';
import { DataService } from '../data.service';
import * as L from 'leaflet';

// Konfigurasi ikon marker Leaflet
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';

const iconDefault = L.icon({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-maps',
  templateUrl: './maps.page.html',
  styleUrls: ['./maps.page.scss'],
  standalone: false,
})
export class MapsPage implements OnInit {

  map!: L.Map;

  private dataService = inject(DataService);

  constructor() { }

  ngOnInit() {
    if (!this.map) {
      setTimeout(() => {

        this.map = L.map('map').setView(
          [-7.7956, 110.3695],
          13
        );

        const osm = L.tileLayer(
          'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
          {
            attribution: '&copy; OpenStreetMap contributors'
          }
        );

        // marker
        L.marker([-7.7956, 110.3695]).addTo(this.map)
          .bindPopup('yogyakarta')
          .openPopup();

        osm.addTo(this.map);

        this.loadPoints();

      });
    }
  }

  async loadPoints() {

    const points: any = await this.dataService.getPoints();

    for (const key in points) {

      if (points.hasOwnProperty(key)) {

        const point = points[key];

        const coordinates =
          point.coordinates.split(',').map((c: string) =>
            parseFloat(c)
          );

        const marker = L.marker(
          coordinates as L.LatLngExpression
        ).addTo(this.map);

        marker.bindPopup(`
          <div class="point-popup">
            <div class="point-name">${point.name}</div>

            <a href="/editpoint/${key}" class="popup-btn edit-btn">
              EDIT
            </a>

            <button class="popup-btn delete-btn delete-link" data-key="${key}">
              DELETE
            </button>
          </div>
        `, {
          minWidth: 140,
          maxWidth: 200,
          closeButton: true,
          autoPan: true
        });

      }
    }

    this.map.on('popupopen', (e) => {

      const popup = e.popup;

      const deleteLink =
        popup.getElement()?.querySelector('.delete-link');

      if (deleteLink) {
        deleteLink.addEventListener('click', (event) => {

          event.preventDefault();

          const key = (event.target as HTMLElement).dataset['key'];

          if (key) {
            this.deletePoint(key, popup.getLatLng());
          }

        });
      }

    });

  }

  async deletePoint(key: string, latLng: L.LatLng | undefined) {

    await this.dataService.deletePoint(key);

    if (latLng) {
      this.map.eachLayer((layer) => {

        if (layer instanceof L.Marker) {

          if (layer.getLatLng().equals(latLng)) {
            this.map.removeLayer(layer);
          }

        }

      });
    }

  }

}
