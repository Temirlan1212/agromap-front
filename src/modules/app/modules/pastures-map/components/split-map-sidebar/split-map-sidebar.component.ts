import { Component, OnDestroy, OnInit, ChangeDetectorRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { StoreService } from 'src/modules/ui/services/store.service';
import { Feature, GeoJSON } from 'geojson';
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
import { MapService } from '../../../../../ui/services/map.service';
import { MessagesService } from 'src/modules/ui/services/messages.service';

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

  layerFeature: Feature | null = null;
  maps: Record<string, L.Map | null> = {};

  loadingSatelliteDates: boolean = false;

  imageOverlayIncstance: Record<string, L.ImageOverlay> = {};
  imageOverlay: Record<string, string> = {};

  splitMapQuantity: number = this.mapService.splitMapQuantity.value;

  currLang: string = this.translate.currentLang;
  isWmsAiActive: boolean = false;

  subscriptions: Subscription[] = [];

  constructor(
    private mapService: MapService,
    private store: StoreService,
    private api: ApiService,
    private formatDate: FormatDatePipe,
    private translate: TranslateService,
    private cd: ChangeDetectorRef,
    private messages: MessagesService
  ) {}

  handleSplitMapClick(splitMapQuantity: number) {
    this.splitMapQuantity = splitMapQuantity;
    this.mapService.splitMapQuantity.next(this.splitMapQuantity);
    this.satelliteDateOptionsForm.reset();
  }

  async handleVegIndexOnChange(
    value: Record<string, any> | null
  ): Promise<void> {
    for (const [mapKey] of Object.entries(this.maps)) {
      if (this.imageOverlayIncstance[mapKey]) {
        this.maps[mapKey]?.removeLayer(this.imageOverlayIncstance[mapKey]);
      }
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
    if (!value) {
      if (this.imageOverlayIncstance[mapKey]) {
        this.maps[mapKey]?.removeLayer(this.imageOverlayIncstance[mapKey]);
      }
      return;
    }

    if (this.imageOverlayIncstance[mapKey]) {
      this.maps[mapKey]?.removeLayer(this.imageOverlayIncstance[mapKey]);
    }
    this.imageOverlay[mapKey] = `${environment.apiUrl}${value['image']}`;
    if (this.maps[mapKey]) {
      this.imageOverlayIncstance[mapKey] = this.mapService.setImageOverlay(
        this.maps[mapKey] as L.Map,
        this.imageOverlay[mapKey],
        this.bounds
      );
    }
  }

  async getVegSatelliteDates(
    contoruId: number,
    vegIndexId: number = 1
  ): Promise<void> {
    this.loadingSatelliteDates = true;
    try {
      const query = {
        contourId: contoruId,
        vegIndexId: vegIndexId,
      };
      let res: IVegSatelliteDate[];
      if (this.isWmsAiActive) {
        res = await this.api.vegIndexes.getVegSatelliteDatesAi(query);
      } else {
        res = await this.api.vegIndexes.getVegSatelliteDates(query);
      }
      this.satelliteDateData = res;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
    this.loadingSatelliteDates = false;
  }

  private async getVegIndexList() {
    try {
      this.vegIndexesOptions =
        (await this.api.vegIndexes.getVegIndexList()) as IVegIndexOption[];
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
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
    if (this.layerFeature != null) {
      this.contourId = this.layerFeature.properties?.['id'];
      this.bounds = L.geoJSON(this.layerFeature).getBounds();

      await this.getVegIndexList();
      await this.getVegSatelliteDates(this.contourId, 1);
      this.buildSatelliteDatesOptions(this.satelliteDateData, this.currLang);
    }
    const pasturesMapControlLayersSwitchComponent = this.store.getItem(
      'PasturesMapControlLayersSwitchComponent'
    );

    const name =
      pasturesMapControlLayersSwitchComponent.filterControlLayerSwitch.name;

    if (name) {
      if (name === 'agromap_store_ai') {
        this.isWmsAiActive = true;
      } else {
        this.isWmsAiActive = false;
      }
    }

    this.subscriptions = [
      this.mapService.maps.subscribe((maps) => {
        this.maps = maps;
        this.maps['map-0'] &&
          this.maps['map-0'].fitBounds(this.bounds, { maxZoom: 15 });

        for (const [key, map] of Object.entries(this.maps)) {
          if (map) {
            L.geoJSON(this.layerFeature as GeoJSON, {
              style: { fillOpacity: 0 },
            }).addTo(map);
          }
        }
      }) as Subscription,

      this.translate.onLangChange.subscribe((lang: Record<string, any>) => {
        this.currLang = lang['lang'] as string;
        this.buildSatelliteDatesOptions(this.satelliteDateData, this.currLang);
      }) as Subscription,
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.map((subscription) => subscription.unsubscribe());
  }
}
