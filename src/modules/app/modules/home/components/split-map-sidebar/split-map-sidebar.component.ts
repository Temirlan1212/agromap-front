import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { StoreService } from 'src/modules/api/store.service';
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
import { TranslateService } from '@ngx-translate/core';
import { MapService } from '../../map.service';

@Component({
  selector: 'app-split-map-sidebar',
  templateUrl: './split-map-sidebar.component.html',
  styleUrls: ['./split-map-sidebar.component.scss'],
  providers: [FormatDatePipe],
})
export class SplitMapSidebarComponent implements OnDestroy, OnInit {
  satelliteDateData: IVegSatelliteDate[] = [];

  vegIndexesOptions: IVegIndexOption[] = [];
  satelliteDateOptions: Record<string, any>[] = [];

  vegIndexesOptionsForm: FormControl = new FormControl('');
  satelliteDateOptionsForm: FormControl = new FormControl('1');

  selectedVegIndex: IVegIndexOption | null = null;

  contourId!: number;
  bounds!: L.LatLngBounds;

  layerFeature!: Feature;
  maps: Record<string, L.Map | null> = {};

  loadingSatelliteDates: boolean = false;

  imageOverlayIncstance: Record<string, L.ImageOverlay> = {};
  imageOverlay: Record<string, string> = {};

  splitMapQuantity: number = this.mapServie.splitMapQuantity.value;

  currLang: string = this.translate.currentLang;

  mapsSubscription!: Subscription;
  translateSubscription!: Subscription;

  constructor(
    private mapServie: MapService,
    private store: StoreService,
    private api: ApiService,
    private formatDate: FormatDatePipe,
    private translate: TranslateService
  ) {}

  handleSplitMapClick(splitMapQuantity: number) {
    this.splitMapQuantity = splitMapQuantity;
    this.mapServie.splitMapQuantity.next(this.splitMapQuantity);
    this.satelliteDateOptionsForm.reset();
  }

  async handleVegIndexOnChange(
    value: Record<string, any> | null
  ): Promise<void> {
    for (const [mapKey] of Object.entries(this.maps)) {
      this.removeImageOverlay(mapKey);
    }

    if (value) {
      this.selectedVegIndex = value as IVegIndexOption;
      await this.getVegSatelliteDates(this.contourId, this.selectedVegIndex.id);
      this.buildSatelliteDatesOptions(this.satelliteDateData, this.currLang);
      this.satelliteDateOptionsForm.reset();
    } else {
      this.selectedVegIndex = null;
      this.satelliteDateOptionsForm.reset();
      this.vegIndexesOptionsForm.reset();
    }
  }

  handleSatelliteDateChange(
    value: Record<string, any> | null,
    mapKey: string
  ): void {
    if (!value) return this.removeImageOverlay(mapKey);
    this.removeImageOverlay(mapKey);
    this.setImageOverlay(mapKey, value['image'], this.bounds);
  }

  private async getVegSatelliteDates(
    contoruId: number,
    vegIndexId: number
  ): Promise<void> {
    this.loadingSatelliteDates = true;
    try {
      this.satelliteDateData = (await this.api.vegIndexes.getVegSatelliteDates({
        contourId: contoruId,
        vegIndexId: vegIndexId,
      })) as IVegSatelliteDate[];
    } catch (e: any) {
      console.log(e);
    }
    this.loadingSatelliteDates = false;
  }

  private async getVegIndexList() {
    try {
      this.vegIndexesOptions =
        (await this.api.vegIndexes.getVegIndexList()) as IVegIndexOption[];
    } catch (e: any) {
      console.log(e);
    }
  }

  private setImageOverlay(
    mapKey: string,
    imageUrl: string,
    bounds: L.LatLngBounds
  ) {
    this.imageOverlay[mapKey] = `${environment.apiUrl}${imageUrl}`;
    this.imageOverlayIncstance[mapKey] = L.imageOverlay(
      this.imageOverlay[mapKey],
      bounds,
      {
        opacity: 1,
        interactive: true,
      }
    );
    this.maps[mapKey]?.addLayer(this.imageOverlayIncstance[mapKey]);
  }

  private removeImageOverlay(mapKey: string) {
    if (this.imageOverlayIncstance[mapKey] && this.maps[mapKey]) {
      this.maps[mapKey]?.removeLayer(this.imageOverlayIncstance[mapKey]);
    }
  }

  private buildSatelliteDatesOptions(data: IVegSatelliteDate[], lang: string) {
    this.satelliteDateOptions = data.map((indexData) => {
      let obj = {
        id: indexData.id,
        date: this.formatDate.transform(indexData.date, 'fullDate', lang),
        group: indexData.date.slice(0, 4),
        image: indexData.index_image,
      };
      return obj;
    });
  }

  async ngOnInit(): Promise<void> {
    this.layerFeature = this.store.getItem<Feature>('selectedLayerFeature');
    this.contourId = this.layerFeature.properties?.['id'];
    this.bounds = L.geoJSON(this.layerFeature).getBounds();
    
    await this.getVegIndexList();
    await this.getVegSatelliteDates(this.contourId, 1);
    this.buildSatelliteDatesOptions(this.satelliteDateData, this.currLang);

    this.mapsSubscription = this.mapServie.maps.subscribe((maps) => {
      this.maps = maps;
      this.maps["map-0"] && this.maps["map-0"].fitBounds(this.bounds, {maxZoom: 11});
      
      for (const [key, map] of Object.entries(this.maps)) {
        if (map) L.geoJSON(this.layerFeature).addTo(map);
      }
    });

    this.translateSubscription = this.translate.onLangChange.subscribe(
      (lang: Record<string, any>) => {
        this.currLang = lang['lang'] as string;
        this.buildSatelliteDatesOptions(this.satelliteDateData, this.currLang);
      }
    );
  }

  ngOnDestroy(): void {
    this.mapsSubscription.unsubscribe();
    this.translateSubscription.unsubscribe();
  }
}
