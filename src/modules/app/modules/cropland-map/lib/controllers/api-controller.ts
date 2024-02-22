import { Injectable } from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';
import { ActualVegQuery } from 'src/modules/api/classes/veg-indexes';
import { ActualVegIndexes } from 'src/modules/api/models/actual-veg-indexes';
import { ILandType } from 'src/modules/api/models/land-type.model';
import { IRegion } from 'src/modules/api/models/region.model';
import {
  IVegIndexOption,
  IVegSatelliteDate,
} from 'src/modules/api/models/veg-indexes.model';
import { MapData } from 'src/modules/ui/models/map.model';
import { MessagesService } from 'src/modules/ui/services/messages.service';
import { GeoJSON } from 'geojson';
import { LatLngBounds } from 'leaflet';
import { CroplandMainMapService } from '../services/map.service';

type ControllerParam = {
  currLang: string;
  isWmsAiActive: boolean;
};
@Injectable({ providedIn: 'root' })
export class ApiController {
  mapData: MapData | null = null;
  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private mapService: CroplandMainMapService
  ) {
    this.mapService.map.subscribe(async (mapData) => (this.mapData = mapData));
  }

  async getContourData({
    isWmsAiActive,
    id,
    currLang,
  }: ControllerParam & { id: number }) {
    let resData: any[] = [];
    const query: ActualVegQuery = { contour_id: id };
    try {
      let res: ActualVegIndexes[];
      if (isWmsAiActive) {
        res = await this.api.vegIndexes.getActualVegIndexesAi(query);
      } else {
        res = await this.api.vegIndexes.getActualVegIndexes(query);
      }

      const data = res?.reduce((acc: any, i: any) => {
        if (!acc[i.index.id]) {
          acc[i.index.id] = {};
          acc[i.index.id]['name'] = i.index[`name_${currLang}`];
          acc[i.index.id]['data'] = [];
          acc[i.index.id]['dates'] = [];
          acc[i.index.id]['data'].push(i.average_value);
          acc[i.index.id]['dates'].push(i.date);
        } else {
          acc[i.index.id]['data'].push(i.average_value);
          acc[i.index.id]['dates'].push(i.date);
        }
        return acc;
      }, {});

      resData = data ? Object.values(data) : [];
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
      resData = [];
    }
    return resData;
  }

  async addRegionsPolygonToMap() {
    let resData: IRegion[] = [];
    try {
      let polygons: IRegion[];
      polygons = await this.api.dictionary.getRegions({
        polygon: true,
      });
      resData = polygons;
      polygons.map((polygon) => {
        if (this.mapData?.map != null) {
          this.mapData.geoJsonStatic.options.snapIgnore = true;
          this.mapData.geoJsonStatic.options.pmIgnore = true;
          this.mapData.geoJsonStatic.options.style = { fillOpacity: 0 };
          this.mapData.geoJsonStatic.options.interactive = false;
          this.mapData.geoJsonStatic.addData(polygon.polygon);
        }
      });
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
    return resData;
  }

  async getVegSatelliteDates({
    contoruId,
    isWmsAiActive,
    vegIndexId,
  }: Partial<ControllerParam> & { contoruId: number; vegIndexId: number }) {
    let resData: IVegSatelliteDate[] = [];
    try {
      const query = {
        contourId: contoruId,
        vegIndexId: vegIndexId,
      };

      let res: IVegSatelliteDate[];
      if (isWmsAiActive) {
        res = await this.api.vegIndexes.getVegSatelliteDatesAi(query);
      } else {
        res = await this.api.vegIndexes.getVegSatelliteDates(query);
      }
      resData = res;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
    return resData;
  }

  async getContour({
    id,
    isWmsAiActive,
  }: Partial<ControllerParam> & { id: number }) {
    let resData!: any;
    try {
      if (isWmsAiActive) {
        resData = await this.api.aiContour.getOne(id);
      } else {
        resData = await this.api.contour.getOne(id);
      }
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
    return resData;
  }

  async getLandTypes() {
    let resData: ILandType[] = [];
    try {
      resData = await this.api.dictionary.getLandType();
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
    return resData;
  }

  async getVegIndexList() {
    let resData: IVegIndexOption[] = [];
    try {
      resData =
        (await this.api.vegIndexes.getVegIndexList()) as IVegIndexOption[];
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
    return resData;
  }

  async deleteContour({
    id,
    isWmsAiActive,
    message,
  }: Partial<ControllerParam> & { id: number; message: string }) {
    try {
      if (isWmsAiActive) {
        await this.api.aiContour.remove(Number(id));
      } else {
        await this.api.contour.remove(Number(id));
      }

      this.messages.success(message);
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  async addPolygonsInScreenToMap({
    isWmsAiActive,
    filterFormValues = {},
    landTypes,
    mapBounds,
    abortConroller,
  }: Partial<ControllerParam> & {
    filterFormValues: Record<string, any>;
    landTypes: ILandType[];
    mapBounds: LatLngBounds;
    abortConroller: AbortController;
  }) {
    let resData: IVegIndexOption[] = [];

    try {
      const year =
        filterFormValues?.['year'] ?? this.mapService.filterDefaultValues.year;
      const culture = filterFormValues?.['culture'] ?? null;
      const land_type =
        filterFormValues?.['land_type'] ??
        landTypes.map((l: ILandType) => l['id']).join(',');

      if (this.mapData?.map != null && land_type) {
        let polygons: GeoJSON;
        if (isWmsAiActive) {
          polygons = await this.api.map.getPolygonsInScreenAi({
            latLngBounds: mapBounds,
            land_type,
            year,
            culture,
          });
        } else {
          const response = await this.api.map.getPolygonsInScreen(
            {
              latLngBounds: mapBounds,
              land_type,
              year,
              culture,
            },
            abortConroller.signal
          );

          polygons = response;
        }

        this.mapData.geoJson.options.snapIgnore = true;
        this.mapData.geoJson.options.pmIgnore = true;
        this.mapData.geoJson.options.style = {
          fillOpacity: 0,
          weight: 0.4,
        };

        this.mapData.geoJson.setZIndex(400);
        this.mapData.geoJson.options.interactive = true;
        this.mapData.geoJson.addData(polygons);
      }
    } catch (e: any) {
      const message = e.error?.message ?? e.message;
      if (message === this.messages.messages.abortedRequest) return;
      this.messages.error(message);
    } finally {
    }

    return resData;
  }
}
