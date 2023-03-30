import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { IVegIndexOption } from 'src/modules/api/models/veg-indexes.model';

@Injectable({
  providedIn: 'root',
})
export class SplitMapService {
  splitMapQuantity = new BehaviorSubject<number>(4);
  maps = new BehaviorSubject<Record<string, L.Map | null>>({});

  constructor() {}
}
