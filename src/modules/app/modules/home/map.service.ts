import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { MapData } from '../../../ui/models/map.model';

@Injectable()
export class MapService {
  map = new BehaviorSubject<MapData | null>(null);

  constructor() {
  }
}
