import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StoreService {
  constructor() {}

  getItem<T = any>(name: string): T {
    return JSON.parse(localStorage.getItem(name) || 'null');
  }

  setItem<T = any>(name: string, value: T): StoreService {
    localStorage.setItem(name, JSON.stringify(value));
    return this;
  }

  removeItem(name: string): boolean {
    localStorage.removeItem(name);
    return true;
  }
}
