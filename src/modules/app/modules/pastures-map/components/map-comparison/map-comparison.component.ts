import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  Output,
  QueryList,
  SimpleChanges,
  ViewChildren,
} from '@angular/core';
import {
  ILeafletMap,
  MapLayerFeature,
  MapMove,
} from 'src/modules/ui/models/map.model';
import { YieldMapComponent } from '../yield-map/yield-map.component';
import { Subscription } from 'rxjs';
import { LatLngBounds } from 'leaflet';
import { StoreService } from 'src/modules/ui/services/store.service';
import { GeoJSON } from 'geojson';

@Component({
  selector: 'app-map-comparison',
  templateUrl: './map-comparison.component.html',
  styleUrls: ['./map-comparison.component.scss'],
})
export class MapComparisonComponent
  implements AfterViewInit, OnDestroy, OnChanges
{
  @ViewChildren(YieldMapComponent)
  yieldMapComponents!: QueryList<YieldMapComponent>;
  loading = false;
  subscriptions: Subscription[] = [];
  maps: ILeafletMap[] = [];
  polygons!: GeoJSON;

  @Output() clickBack = new EventEmitter<boolean>(false);
  @Output() onDestroy = new EventEmitter();
  @Input() filterFormValues: any;
  @Input() filterFormResetValues: any;

  constructor(private store: StoreService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('filterFormResetValues' in changes) {
      this.filterFormValues = changes['filterFormResetValues'].currentValue;

      if (this.yieldMapComponents) {
        this.yieldMapComponents.map((ref) => this.handleFilterFormReset(ref));
      }
    }
    if ('filterFormValues' in changes) {
      this.filterFormValues = changes['filterFormValues'].currentValue;
      this.handleFilterFormSubmit();
    }
  }

  handleFilterFormReset(component: YieldMapComponent): void {
    component.handleFilterFormReset(this.filterFormValues);
  }

  handleFilterFormSubmit(): void {
    this.yieldMapComponents?.first.handleFilterFormSubmit(
      this.filterFormValues
    );
  }

  syncMaps(maps: ILeafletMap[]): void {
    maps.forEach((map1, index1) => {
      maps.forEach((map2, index2) => {
        if (index1 !== index2 && map1 && map2) {
          map1.sync(map2, {
            syncCursor: true,
            syncCursorMarkerOptions: {
              radius: 5,
              fillOpacity: 1,
              color: 'black',
              fillColor: 'white',
            },
          });
        }
      });
    });
  }

  onEachFeature(
    mapLayerFeature: MapLayerFeature,
    component: YieldMapComponent
  ): void {
    component.handleFeatureClick(mapLayerFeature);
    component.mapComponent.featureOpen = true;
  }

  featureClose(component: YieldMapComponent): void {
    component.mapComponent.featureOpen = false;
    component.handleFeatureClose();
  }

  handleFeatureMouseOver(
    component: YieldMapComponent,
    layerFeature: MapLayerFeature
  ) {
    component.mapComponent.geoJson.getLayers().forEach((layer: any) => {
      const id = layerFeature.feature.properties?.['id'];
      const currId = layer.feature.properties.id;
      if (id === currId) {
        layer.setStyle({
          color: '#fff',
          weight: 3,
        });
      }
    });

    component.activeContourSmall = {
      culture: layerFeature?.feature?.properties?.['culture'],
      area_ha: layerFeature?.feature?.properties?.['area_ha'],
      contour_id: layerFeature?.feature?.properties?.['id'],
    };
  }

  handleFeatureMouseLeave(
    component: YieldMapComponent,
    layerFeature: MapLayerFeature
  ) {
    component.mapComponent.geoJson.getLayers().forEach((layer: any) => {
      const id = layerFeature.feature.properties?.['id'];
      const currId = layer.feature.properties.id;
      if (id === currId) {
        layer.setStyle({
          color: 'rgba(51,136,255,0.5)',
          weight: 1,
        });
      }
    });

    component.activeContourSmall = null;
  }

  async handleMapMove(mapMove: MapMove): Promise<void> {
    this.store.setItem<Record<string, LatLngBounds | number>>('HomeComponent', {
      mapBounds: mapMove.bounds,
      mapZoom: mapMove.zoom,
    });

    if (mapMove.zoom >= 12) {
      this.loading = true;
      this.polygons = await this.yieldMapComponents.first.getPolygonsInScreen(
        mapMove.bounds
      );
      this.loading = false;
    }

    this.yieldMapComponents.forEach((ref) => {
      const mapData = ref.mapData;
      if (mapData?.map != null) {
        const layersLength = mapData.geoJson.getLayers().length;
        if (layersLength > 0) mapData.geoJson.clearLayers();
        if (mapMove.zoom >= 12) ref.addPolygonsInScreenToMap(this.polygons);
        if (mapMove.zoom < 12) ref.activeContourSmall = null;
      }
    });
  }

  ngAfterViewInit(): void {
    this.handleFilterFormSubmit();
    this.maps = this.yieldMapComponents.map(
      (ref) => ref.mapData?.map as ILeafletMap
    );
    this.syncMaps(this.maps);

    const refs = this.yieldMapComponents;

    refs.forEach((ref) => {
      const mapComponent = ref.mapComponent;
      const subscriptions = [
        mapComponent.featureClose.subscribe(() =>
          refs.forEach((ref) => this.featureClose(ref))
        ),
        mapComponent.featureClick.subscribe(
          (mapLayerFeature: MapLayerFeature) =>
            refs.forEach((ref) => this.onEachFeature(mapLayerFeature, ref))
        ),
        mapComponent.featureHover.subscribe((layerFeature: MapLayerFeature) => {
          refs.forEach((ref) => this.handleFeatureMouseOver(ref, layerFeature));
        }),
        mapComponent.featureUnhover.subscribe((layerFeature: MapLayerFeature) =>
          refs.forEach((ref) => this.handleFeatureMouseLeave(ref, layerFeature))
        ),
        ref.onDateSelect?.subscribe(() => {
          refs.first.contourDetailsComponents.map((c) => (c.isHidden = true));
        }),
      ];

      this.subscriptions.push(...subscriptions);
    });

    this.subscriptions.push(
      refs.first.mapComponent.mapMove.subscribe(async (mapMove: MapMove) =>
        this.handleMapMove(mapMove)
      )
    );
  }

  ngOnDestroy(): void {
    this.onDestroy.emit();
    this.clickBack.emit(false);
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
