import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { MapData } from '../../../ui/models/map.model';

@Injectable()
export class MapService {
  map = new BehaviorSubject<MapData | null>(null);
  contourEdited = new Subject<void>();

  constructor() {
  }
}
