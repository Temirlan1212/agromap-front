import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapService } from '../../../../../ui/services/map.service';
import { Subscription } from 'rxjs';
import { MapData } from '../../../../../ui/models/map.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Map, LeafletEvent, Layer, GeoJSON, PM } from 'leaflet';
import { ContourFormComponent } from '../contour-form/contour-form.component';
import { IContour } from '../../../../../api/models/contour.model';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';
import { StoreService } from 'src/modules/ui/services/store.service';
import { FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'app-contour-add',
  templateUrl: './contour-add.component.html',
  styleUrls: ['./contour-add.component.scss'],
})
export class ContourAddComponent implements OnInit, OnDestroy {
  mapSubscription!: Subscription;
  mapInstance!: Map;
  layer: Layer | null = null;
  polygon: GeoJSON.Polygon | null = null;
  mapGeo!: GeoJSON;

  constructor(
    private mapService: MapService,
    private router: Router,
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private store: StoreService,
    private route: ActivatedRoute
  ) {}

  async ngOnInit() {
    this.handleSetSidePanelState(true);

    this.mapSubscription = this.mapService.map.subscribe(
      (res: MapData | null) => {
        this.mapService.contourEditingMode.next(true);
        this.mapInstance = res?.map as Map;
        this.mapGeo = res?.geoJson as GeoJSON;
        if (this.mapGeo.getLayers().length > 1) {
          this.mapGeo.clearLayers();
        }
        this.mapInstance.pm.setGlobalOptions({
          allowSelfIntersection: false,
        });
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
      }
    );

    this.handleDrawShape();
  }

  handleSetSidePanelState(state: boolean) {
    this.store.setItem('SidePanelComponent', { state });
  }

  handleEditClick() {
    this.triggerPmControlBtnClick('.leaflet-pm-icon-edit');
    this.handleSetSidePanelState(false);
  }

  handleDrawClick() {
    this.mapInstance.pm.enableDraw('Polygon');
    this.handleSetSidePanelState(false);
  }

  handleDrawShape() {
    this.mapInstance.pm.enableDraw('Polygon', { snappable: false });
    this.mapInstance.on('pm:remove', (e: LeafletEvent) => {
      this.mapInstance.pm.Toolbar.setButtonDisabled('drawPolygon', false);

      this.polygon = null;
      requestAnimationFrame(() =>
        this.mapInstance.pm.enableDraw('Polygon', { snappable: false })
      );
    });

    this.mapInstance.on('pm:create', (e: LeafletEvent) => {
      if (!this.polygon) {
        this.layer = e['layer'];
        const geoJson: any = this.mapInstance.pm
          .getGeomanDrawLayers(true)
          .toGeoJSON();
        this.polygon = geoJson['features'][0]['geometry'];
      }
    });

    this.mapInstance.on('pm:drawend', (e: LeafletEvent) => {
      if (this.layer && this.polygon) {
        PM.reInitLayer(this.layer);
        this.triggerPmControlBtnClick('.leaflet-pm-icon-edit');
      }
    });

    const finishEditButtonTooltip =
      document?.querySelector('.action-finishMode');
    finishEditButtonTooltip?.addEventListener('click', () => {
      this.handleSetSidePanelState(true);
    });
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

  async handleSaveClick(contourForm: ContourFormComponent) {
    ['district', 'conton', 'code_soato', 'ink'].forEach((controlName) => {
      const control = contourForm.form.get(controlName) as FormControl;
      control.setValidators([Validators.required]);
      control.updateValueAndValidity();
    });

    const formState = contourForm.getState();
    const { region, district, ...rest } = formState.value;
    const contour: Partial<IContour> = {
      ...rest,
      polygon: this.polygon,
    };
    if (!formState.touched) {
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
    try {
      await this.api.contour.create(contour);
      this.messages.success(
        this.translate.transform('Polygon created successfully')
      );
      this.router.navigate(['../'], { relativeTo: this.route });
    } catch (e: any) {
      const formErrLength = Object.keys(e.error).length;
      if (!e.error?.message && formErrLength > 0) {
        let flattenedObjOfErrors: any = {};
        for (let key in e.error) {
          if (e.error.hasOwnProperty(key) && Array.isArray(e.error[key])) {
            flattenedObjOfErrors[key] = { error: e.error[key][0] };
          }
        }

        this.api.form.setError(flattenedObjOfErrors, contourForm.form);
        return;
      }

      this.messages.error(e.error?.message ?? e.message);
    }
  }

  handleDeletePolygon() {
    const polygons = this.mapInstance.pm.getGeomanLayers();
    polygons.forEach((polygon) => this.mapInstance.removeLayer(polygon));
    this.layer = null;
    this.polygon = null;
  }

  ngOnDestroy() {
    this.mapInstance.pm.disableGlobalEditMode();
    this.mapService.contourEditingMode.next(false);
    this.handleSetSidePanelState(false);
    this.mapInstance.pm.Toolbar.setButtonDisabled('drawPolygon', false);
    this.mapSubscription.unsubscribe();
    this.mapInstance.pm.toggleControls();
    this.handleDeletePolygon();
    this.mapInstance.off('pm:create');
    this.mapInstance.off('pm:remove');
    this.mapInstance.pm.disableDraw('Polygon');
  }
}
