import { Component, OnDestroy, OnInit } from '@angular/core';
import { MapService } from '../../map.service';
import { Subscription } from 'rxjs';
import { MapData } from '../../../../../ui/models/map.model';
import { Router } from '@angular/router';
import { Map, LeafletEvent, geoJson, latLngBounds, latLng, Layer } from 'leaflet';
import { GeoJSON } from 'geojson';
import { ContourFormComponent } from '../contour-form/contour-form.component';
import { IContour } from '../../../../../api/models/contour.model';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';

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

  constructor(
    private mapService: MapService,
    private router: Router,
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe
  ) {
  }

  async ngOnInit() {
    this.mapSubscription = this.mapService.map.subscribe((res: MapData | null) => {
      this.mapInstance = res?.map as Map;
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
        customControls: true
      });
    });
    this.handleDrawShape();
  }

  handleDrawShape() {
    this.mapInstance.on('pm:create', (e: LeafletEvent) => {
      if (!this.polygon) {
        this.layer = e['layer'];
        this.mapInstance.pm.Toolbar.setButtonDisabled('drawPolygon', true);
        const geoJson: any = this.mapInstance.pm.getGeomanDrawLayers(true).toGeoJSON();
        this.polygon = geoJson['features'][0]['geometry'];
      }
    });

    this.mapInstance.on('pm:remove', (e: LeafletEvent) => {
      this.mapInstance.pm.Toolbar.setButtonDisabled('drawPolygon', false);
      this.polygon = null;
    });
  }

  handleValueChange(layer: Record<string, any> | null) {
    if (layer != null && layer['polygon'] != null) {
      this.mapInstance.fitBounds(geoJson(layer['polygon']).getBounds());
      this.mapInstance.setMaxBounds(geoJson(layer['polygon']).getBounds());
    } else {
      const initBounds = latLngBounds(
        latLng(44.0, 68.0),
        latLng(39.0, 81.0)
      );
      this.mapInstance.fitBounds(initBounds);
      this.mapInstance.setMaxBounds(initBounds);
    }

  }

  async handleSaveClick(form: ContourFormComponent) {
    const formState = form.getState();
    const { region, district, ...rest } = formState.value;
    const contour: Partial<IContour> = {
      ...rest,
      polygon: this.polygon
    };
    if (!formState.touched) {
      this.messages.warning(this.translate.transform('No changes in form'));
      return;
    }
    if (!formState.valid) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    if (!this.polygon) {
      this.messages.error(this.translate.transform('Define a polygon on the map'));
      return;
    }
    try {
      await this.api.contour.create(contour);
      this.router.navigate(['..']);
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  handleDeletePolygon() {
    this.mapInstance.removeLayer(this.layer as Layer);
    this.layer = null;
    this.polygon = null;
  }

  ngOnDestroy() {
    this.mapSubscription.unsubscribe();
    this.mapInstance.pm.toggleControls();
    if (this.layer) {
      this.handleDeletePolygon();
    }
    this.mapInstance.off('pm:create');
    this.mapInstance.off('pm:remove');
  }
}
