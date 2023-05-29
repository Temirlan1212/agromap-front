import { Component, OnDestroy, OnInit } from '@angular/core';
import { geoJson, Map, GeoJSON, PM } from 'leaflet';
import { ContourFormComponent } from '../contour-form/contour-form.component';
import { IContour } from '../../../../../api/models/contour.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/services/messages.service';
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
    this.handleSetSidePanelState(true);

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
    if (this.mapGeo.getLayers().length > 0) {
      this.mapGeo.clearLayers();
    }

    this.mapGeo.options.style = {
      fillOpacity: 0,
      weight: 0.4,
    };
    this.mapGeo.options.interactive = false;
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

    this.layer.on('pm:change', (e: any) => (this.isPolygonChanged = true));

    this.triggerPmControlBtnClick('.leaflet-pm-icon-edit');
    const finishEditButton = document?.querySelector('.action-finishMode');
    finishEditButton?.addEventListener('click', () =>
      this.handleSetSidePanelState(true)
    );
  }

  triggerPmControlBtnClick(name: string) {
    const editControlButton = document.querySelector(name);
    const clickEvent = new MouseEvent('click', {
      bubbles: true,
      cancelable: true,
    });
    const isActive =
      editControlButton?.parentElement?.parentElement?.classList.contains(
        'active'
      );

    if (editControlButton && !isActive) {
      editControlButton.dispatchEvent(clickEvent);
    }
  }

  handleSetSidePanelState(state: boolean) {
    this.store.setItem('PasturesMapSidePanelComponent', { state });
  }

  handleEditClick() {
    this.triggerPmControlBtnClick('.leaflet-pm-icon-edit');
    this.handleSetSidePanelState(false);
  }

  async handleSaveClick(contourForm: ContourFormComponent) {
    const formState = contourForm.getState();

    if (!formState.touched && !this.isPolygonChanged) {
      this.messages.warning(this.translate.transform('No changes in form'));
      contourForm.form.markAsUntouched();

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

    this.mapInstance.pm.disableGlobalEditMode();
    const { region, district, ...rest } = formState.value;
    const contour: Partial<IContour> = {
      ...rest,
      polygon: this.polygon,
    };

    try {
      await this.api.contour.update(this.contour.id, contour);
      this.messages.success(
        this.translate.transform('Polygon successfully edited')
      );
      this.router.navigate(['../..']);
    } catch (e: any) {
      const errors =
        typeof e.error === 'object' ? Object.values<string>(e.error || {}) : '';

      if (errors.length > 0 && errors) {
        for (const value of errors) {
          this.messages.error(value);
        }
      } else {
        this.messages.error(e.message);
      }
    }
  }

  ngOnDestroy() {
    this.mapInstance.pm.disableGlobalEditMode();
    const polygons = this.mapInstance.pm.getGeomanLayers();
    polygons.forEach((polygon) => this.mapInstance.removeLayer(polygon));
    this.handleSetSidePanelState(false);
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
