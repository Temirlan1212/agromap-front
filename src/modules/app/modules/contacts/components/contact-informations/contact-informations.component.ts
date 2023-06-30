import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { icon, marker, tileLayer } from 'leaflet';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/modules/api/api.service';
import {
  IContactInformation,
  TLatLangCoordinates,
} from 'src/modules/api/models/contacts.model';
import { MapData } from 'src/modules/ui/models/map.model';

@Component({
  selector: 'app-contact-informations',
  templateUrl: './contact-informations.component.html',
  styleUrls: ['./contact-informations.component.scss'],
})
export class ContactInformationsComponent implements OnInit, OnDestroy {
  contactInformations: IContactInformation[] = [];
  isLoading: boolean = false;
  subs: Subscription[] = [];
  mapData: MapData | null = null;
  activeContactInformation: IContactInformation | null = null;
  tileLayer = tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data © OpenStreetMap contributors',
  });
  customIcon = icon({
    iconUrl: '../../../../../../assets/icons/marker-location.svg',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  constructor(private route: ActivatedRoute, private api: ApiService) {}

  async ngOnInit(): Promise<void> {
    const sub = this.route.paramMap.subscribe(async (param) => {
      const id = param.get('id');

      this.isLoading = true;
      if (id) {
        this.contactInformations =
          await this.api.contacts.getContactInformation(id);
      }
      this.isLoading = false;
      if (this.contactInformations && this.contactInformations.length > 0) {
        this.contactInformations.forEach((info) => {
          const coordinates = info.point?.coordinates;
          if (coordinates && coordinates.length > 0) {
            const reversedCoordinates = [
              ...coordinates,
            ].reverse() as TLatLangCoordinates;
            this.renderMarker(reversedCoordinates);
          }
        });
      }
    });

    this.subs = [...this.subs, sub];
  }

  handleMapData(mapData: MapData): void {
    this.mapData = mapData;

    if (this.mapData?.map) this.tileLayer.addTo(this.mapData?.map);
  }

  handleContactInformationClick(item: IContactInformation) {
    const currId = item?.id;
    const prevId = this.activeContactInformation?.id;
    const coordinates = item?.point?.coordinates as TLatLangCoordinates;

    if (currId === prevId) {
      if (this.mapData?.map && coordinates) {
        this.mapData.map.flyTo(this.mapData.map.getCenter(), 6);
      }
      this.activeContactInformation = null;
      return;
    }

    if (this.mapData?.map && coordinates) {
      this.mapData.map.flyTo(
        [...coordinates].reverse() as TLatLangCoordinates,
        14
      );
    }
    this.activeContactInformation = item;
  }

  private renderMarker(coordinates: TLatLangCoordinates) {
    if (this.mapData?.map)
      marker(coordinates, { icon: this.customIcon }).addTo(this.mapData.map);
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
