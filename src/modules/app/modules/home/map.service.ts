import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MapData } from '../../../ui/models/map.model';

@Injectable()
export class MapService {
  map = new BehaviorSubject<MapData | null>(null);
  contourEditingMode = new Subject<boolean>();
  splitMapQuantity = new BehaviorSubject<number>(4);
  maps = new BehaviorSubject<Record<string, L.Map | null>>({});

  constructor() {
  }
}
