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
  loading: boolean = false;

  subscriptions: Subscription[] = [];
  maps: ILeafletMap[] = [];
  polygons!: GeoJSON;

  @Output() clickBack = new EventEmitter<boolean>(false);
  @Input() filterFormValues: any;
  @Input() filterFormResetValues: any;

  constructor(private store: StoreService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filterFormResetValues']) {
      this.filterFormValues = changes['filterFormResetValues'];
      if (this.yieldMapComponents) {
        this.yieldMapComponents.first.handleFilterFormReset(
          this.filterFormValues.currentValue
        );
      }
    }

    if (changes['filterFormValues']) {
      this.filterFormValues = changes['filterFormValues'];
      if (this.yieldMapComponents) {
        this.yieldMapComponents.first.handleFilterFormSubmit(
          this.filterFormValues.currentValue
        );
      }
    }
  }

  syncMaps(maps: ILeafletMap[]) {
    for (const key1 in maps) {
      for (const key2 in maps) {
        if (key1 !== key2 && maps[key1] && maps[key2]) {
          (maps[key1] as ILeafletMap).sync(maps[key2], {
            syncCursor: true,
            syncCursorMarkerOptions: {
              radius: 5,
              fillOpacity: 1,
              color: 'red',
              fillColor: 'black',
            },
          });
        }
      }
    }
  }

  onEachFeature = (
    mapLayerFeature: MapLayerFeature,
    component: YieldMapComponent
  ) => {
    component.handleFeatureClick(mapLayerFeature);
    component.mapComponent.featureOpen = true;
  };

  featureClose = (component: YieldMapComponent) => {
    component.mapComponent.featureOpen = false;

    component.handleFeatureClose();
  };

  ngAfterViewInit(): void {
    this.yieldMapComponents.first.handleFilterFormSubmit(
      this.filterFormValues.currentValue
    );

    const refs = this.yieldMapComponents;
    this.maps = refs.map((ref) => ref.mapData?.map as ILeafletMap);

    this.syncMaps(this.maps);

    const firstYieldMapComponents = this.yieldMapComponents.first;

    const mapMoveSub = firstYieldMapComponents.mapComponent.mapMove.subscribe(
      async (mapMove: MapMove) => {
        this.store.setItem<Record<string, LatLngBounds>>('HomeComponent', {
          mapBounds: mapMove.bounds,
        });
        if (mapMove.zoom > 13) {
          this.loading = true;
          this.polygons = await firstYieldMapComponents.getPolygonsInScreen(
            mapMove.bounds
          );
          this.loading = false;
        }

        refs.map((ref) => {
          if (ref.mapData?.map != null) {
            if (mapMove.zoom > 13) {
              ref.mapData.geoJson.clearLayers();
              ref.addPolygonsInScreenToMap(this.polygons);
              ref.getRegionsPolygon();
            }

            if (mapMove.zoom < 12) ref.activeContourSmall = null;
          }
        });
      }
    );

    const subscriptions = refs.map((ref) => {
      const featureCloseSub = ref.mapComponent.featureClose.subscribe(() =>
        refs.forEach((ref) => this.featureClose(ref))
      );

      const featureClickSub = ref.mapComponent.featureClick.subscribe(
        (mapLayerFeature: MapLayerFeature) =>
          refs.forEach((ref) => this.onEachFeature(mapLayerFeature, ref))
      );

      const featureMouseOverSub = ref.mapComponent.featureHover.subscribe(
        (layerFeature: MapLayerFeature) =>
          refs.forEach((ref) => ref.handleFeatureMouseOver(layerFeature))
      );

      const featureMouseLeaveSub = ref.mapComponent.featureUnhover.subscribe(
        (layerFeature: MapLayerFeature) =>
          refs.forEach((ref) => ref.handleFeatureMouseLeave(layerFeature))
      );

      return [
        featureCloseSub,
        featureClickSub,
        featureMouseOverSub,
        featureMouseLeaveSub,
      ];
    });

    this.subscriptions = subscriptions.flat();
    this.subscriptions.push(mapMoveSub);
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach((subscription) => subscription.unsubscribe());
  }
}
