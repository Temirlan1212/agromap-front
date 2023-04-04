import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { IStore } from './models/store.model';

@Injectable({ providedIn: 'root' })
export class StoreService {
  public readonly watch: Subject<IStore> = new Subject();

  constructor() {}

  getItem<T = any>(name: string): T | null {
    return JSON.parse(localStorage.getItem(name) || 'null');
  }

  setItem<T = any>(name: string, value: T): boolean {
    localStorage.setItem(name, JSON.stringify(value));
    this.watch.next({ name, value });
    return true;
  }

  removeItem(name: string): boolean {
    localStorage.removeItem(name);
    this.watch.next({ name, value: null });
    return true;
  }
}
