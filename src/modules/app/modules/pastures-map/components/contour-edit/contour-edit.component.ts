import { Component, OnDestroy, OnInit } from '@angular/core';
import { geoJson, latLng, latLngBounds, Map, GeoJSON, PM } from 'leaflet';
import { ContourFormComponent } from '../contour-form/contour-form.component';
import { IContour } from '../../../../../api/models/contour.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { MapService } from '../../../../../ui/services/map.service';
import { Subscription } from 'rxjs';
import { MapData } from '../../../../../ui/models/map.model';
import { TranslatePipe } from '@ngx-translate/core';
import { StoreService } from '../../../../../ui/services/store.service';

@Component({
  selector: 'app-contour-edit',
  templateUrl: './contour-edit.component.html',
  styleUrls: ['./contour-edit.component.scss'],
})
export class ContourEditComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  contour!: IContour;
  mapSubscription!: Subscription;
  mapInstance!: Map;
  mapGeo!: GeoJSON;
  layer: any = null;
  polygon: GeoJSON.Polygon | null = null;
  isPolygonChanged: boolean = false;
  mode: string | null = null;

  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private messages: MessagesService,
    private mapService: MapService,
    private translate: TranslatePipe,
    private store: StoreService
  ) {}

  async ngOnInit() {
    const data = this.store.getItem('MapControlLayersSwitchComponent');
    this.mode = data?.filterControlLayerSwitch.name;
    const id = this.route.snapshot.paramMap.get('id');
    try {
      this.loading = true;
      this.contour = await this.api.contour.getOne(Number(id));
      this.polygon = this.contour.polygon;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    } finally {
      this.loading = false;
    }

    this.mapSubscription = this.mapService.map.subscribe(
      (res: MapData | null) => {
        this.mapInstance = res?.map as Map;
        this.mapGeo = res?.geoJson as GeoJSON;
        this.mapInstance.pm.setGlobalOptions({
          allowSelfIntersection: false,
        });
        this.mapInstance.pm.setLang('ru');
        res?.map.pm.addControls({
          position: 'topleft',
          drawCircle: false,
          drawCircleMarker: false,
          drawPolyline: false,
          drawRectangle: false,
          drawPolygon: true,
          editMode: true,
          dragMode: false,
          cutPolygon: false,
          removalMode: true,
          drawMarker: false,
          drawText: false,
          rotateMode: false,
          oneBlock: true,
          customControls: true,
        });
        this.mapInstance?.fitBounds(geoJson(this.contour.polygon).getBounds());
        this.handleEditShape();
      }
    );
  }

  handleEditShape() {
    this.mapService.contourEditingMode.next(true);
    if (this.mapGeo.getLayers().length > 1) {
      this.mapGeo.clearLayers();
    }
    this.mapGeo.addData(this.contour.polygon);
    this.layer = this.mapGeo?.getLayers()[0];
    this.layer.options.pmIgnore = false;
    PM.reInitLayer(this.layer);
    this.layer.pm.enable();

    this.layer.on('pm:update', (e: any) => {
      this.layer = e['layer'];
      const geoJson: any = this.mapInstance.pm
        .getGeomanLayers(true)
        .toGeoJSON();
      this.polygon = geoJson['features'][0]['geometry'];
      this.layer.pm.disable();
      this.isPolygonChanged = true;
    });
  }

  async handleSaveClick(form: ContourFormComponent) {
    const formState = form.getState();
    const { region, district, ...rest } = formState.value;
    const contour: Partial<IContour> = {
      ...rest,
      polygon: this.polygon,
    };
    if (!formState.touched && !this.isPolygonChanged) {
      this.messages.warning(this.translate.transform('No changes in form'));
      return;
    }
    if (!formState.valid) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    if (!this.polygon) {
      this.messages.error(
        this.translate.transform('Define a polygon on the map')
      );
      return;
    }
    try {
      await this.api.contour.update(this.contour.id, contour);
      this.router.navigate(['../..']);
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  ngOnDestroy() {
    this.mapSubscription.unsubscribe();
    this.mapInstance.pm.toggleControls();
    this.mapInstance.off('pm:globaleditmodetoggled');
    this.mapInstance.off('pm:update');
    if (this.layer) {
      this.layer.pm.disable();
    }
    this.mapService.contourEditingMode.next(false);
  }
}
