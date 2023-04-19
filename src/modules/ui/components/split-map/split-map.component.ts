import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Input,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { latLng, LatLng, Map } from 'leaflet';
import 'leaflet.sync';
import { Subscription } from 'rxjs';
import { IVegIndexOption } from 'src/modules/api/models/veg-indexes.model';
import { MapService } from 'src/modules/ui/services/map.service';
import { ILeafletMap } from '../../models/map.model';

@Component({
  selector: 'app-split-map',
  templateUrl: './split-map.component.html',
  styleUrls: ['./split-map.component.scss'],
  imports: [CommonModule],
  standalone: true,
})
export class SplitMapComponent implements OnDestroy, AfterViewInit {
  @ViewChild('splitMap') splitMapEl!: ElementRef<HTMLElement>;
  currentRouterPathname: string = '';
  mapsQuantity: number = 4;
  maps: Record<string, Map | null> = {};
  splitMapQuantitySubscription!: Subscription;
  selectedVegIndexOption: IVegIndexOption | null = null;
  syncloading: boolean = false;

  @Input() center: LatLng = latLng(41.84, 75.06);

  constructor(public mapService: MapService, private cd: ChangeDetectorRef) {}

  syncMaps() {
    for (const [key1, map1] of Object.entries(this.maps)) {
      for (const [key2, map2] of Object.entries(this.maps)) {
        if (key1 !== key2 && map1 && map2) {
          (map1 as ILeafletMap).sync(map2, {
            syncCursor: true,
            syncCursorMarkerOptions: {
              radius: 5,
              fillOpacity: 1,
              color: 'white',
              fillColor: 'white',
            },
          });
        }
      }
    }
  }

  ngAfterViewInit(): void {
    this.splitMapQuantitySubscription =
      this.mapService.splitMapQuantity.subscribe((val) => {
        for (let i = 0; i < 4; i++) {
          let key = `map-${i}`;
          if (this.maps[key]) {
            this.maps[key]?.remove();
          }

          if (val > i) {
            this.maps[key] = this.mapService.initMap(key);
          } else {
            this.maps[key] = null;
          }
        }

        this.syncMaps();
        this.mapService.maps.next(this.maps);
        this.cd.detectChanges();

        for (let i = 0; i < 4; i++) {
          this.maps[`map-${i}`]?.invalidateSize();
        }
      });
  }

  ngOnDestroy(): void {
    this.splitMapQuantitySubscription.unsubscribe();
  }
}
