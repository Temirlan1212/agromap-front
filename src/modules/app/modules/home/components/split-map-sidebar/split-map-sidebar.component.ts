import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { StoreService } from 'src/modules/api/store.service';
import { SplitMapService } from 'src/modules/ui/components/services/split-map.services';
import { Feature } from 'geojson';
import * as L from 'leaflet';
import {
  IVegIndexOption,
  IVegSatelliteDate,
} from 'src/modules/api/models/veg-indexes.model';
import { ApiService } from 'src/modules/api/api.service';
import { FormatDatePipe } from 'src/modules/ui/pipes/formatDate.pipe';
import { environment } from 'src/environments/environment';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-split-map-sidebar',
  templateUrl: './split-map-sidebar.component.html',
  styleUrls: ['./split-map-sidebar.component.scss'],
  providers: [FormatDatePipe],
})
export class SplitMapSidebarComponent implements OnDestroy, OnInit {
  vegIndexesOptions: IVegIndexOption[] = [];
  satelliteDateOptions: Record<string, any>[] = [];

  defaultSelectedVegIndex: FormControl = new FormControl('1');
  selectedVegIndex: IVegIndexOption = {
    name_ru: 'NDVI',
    id: 1,
    name_ky: '',
    name_en: '',
  };
  contourId!: number;
  bounds!: L.LatLngBounds;
  layerFeature!: Feature;
  maps: Record<string, L.Map | null> = {};

  loadingSatelliteDates: boolean = false;
  imageOverlayIncstance: Record<string, L.ImageOverlay> = {};
  imageOverlay: Record<string, string> = {};

  splitMapQuantity: number = this.splitMapService.splitMapQuantity.value;

  mapsSubscription!: Subscription;

  constructor(
    private splitMapService: SplitMapService,
    private store: StoreService,
    private api: ApiService,
    private formatDate: FormatDatePipe
  ) {}

  handleSplitMapClick(splitMapQuantity: number) {
    this.splitMapQuantity = splitMapQuantity;
    this.getVegSatelliteDates(this.contourId, this.selectedVegIndex.id);
  }

  handleVegIndexOnChange(value: Record<string, any> | null) {
    this.selectedVegIndex = value as IVegIndexOption;
    for (const [mapId, map] of Object.entries(this.maps)) {
      this.removeImageOverlay(mapId);
    }
    this.getVegSatelliteDates(this.contourId, this.selectedVegIndex.id);
  }

  handleSatelliteDateChange(value: Record<string, any> | null, mapId: string) {
    if (value) {
      this.removeImageOverlay(mapId);
      this.setImageOverlay(mapId, value['image'], this.bounds);
    }
  }

  async getVegSatelliteDates(
    contoruId: number,
    vegIndexId: number
  ): Promise<void> {
    this.loadingSatelliteDates = true;
    try {
      const vegIndexesData = (await this.api.vegIndexes.getVegSatelliteDates({
        contourId: contoruId,
        vegIndexId: vegIndexId,
      })) as IVegSatelliteDate[];

      this.satelliteDateOptions = vegIndexesData.map((indexData) => {
        let obj = {
          id: indexData.id,
          date: this.formatDate.transform(indexData.date, 'fullDate', 'ru'),
          group: indexData.date.slice(0, 4),
          image: indexData.index_image,
        };
        return obj;
      });
    } catch (e: any) {
      console.log(e);
    }
    this.loadingSatelliteDates = false;
  }

  async getVegIndexList() {
    try {
      this.vegIndexesOptions =
        (await this.api.vegIndexes.getVegIndexList()) as IVegIndexOption[];
    } catch (e: any) {
      console.log(e);
    }
  }

  private setImageOverlay(
    mapId: string,
    imageUrl: string,
    bounds: L.LatLngBounds
  ) {
    this.imageOverlay[mapId] = `${environment.apiUrl}${imageUrl}`;
    this.imageOverlayIncstance[mapId] = L.imageOverlay(
      this.imageOverlay[mapId],
      bounds,
      {
        opacity: 1,
        interactive: true,
      }
    );
    console.log(this.imageOverlayIncstance[mapId]);
    this.maps[mapId]?.addLayer(this.imageOverlayIncstance[mapId]);
  }

  private removeImageOverlay(mapId: string) {
    if (this.imageOverlayIncstance[mapId] && this.maps[mapId]) {
      this.maps[mapId]?.removeLayer(this.imageOverlayIncstance[mapId]);
    }
  }

  ngOnInit(): void {
    this.layerFeature = this.store.getItem<Feature>('selectedLayerFeature');
    this.contourId = this.layerFeature.properties?.['id'];
    this.bounds = L.geoJSON(this.layerFeature).getBounds();

    this.getVegIndexList();
    this.getVegSatelliteDates(this.contourId, this.selectedVegIndex.id);

    this.mapsSubscription = this.splitMapService.maps.subscribe((maps) => {
      this.maps = maps;

      for (const [key, map] of Object.entries(this.maps)) {
        if (map) {
          L.geoJSON(this.layerFeature).addTo(map);
          map.fitBounds(L.geoJson(this.layerFeature).getBounds());
          if (this.imageOverlay[key]) {
            this.setImageOverlay(key, this.imageOverlay[key], this.bounds);
          }
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.mapsSubscription.unsubscribe();
  }
}
