import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SplitMapService {
  splitMapQuantity = new BehaviorSubject<number>(4);
  maps = new BehaviorSubject<Record<string, L.Map | null>>({});

  changeSplitMapQuantity(quantity: number) {
    this.splitMapQuantity.next(quantity);
  }

  setMaps(key: string, value: any) {
  }

  constructor() {
  }
}
