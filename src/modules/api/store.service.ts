import { Injectable } from '@angular/core';
import { Observable, Observer, Subject, Subscription } from 'rxjs';
import { IStore } from './models/store.model';
import { SafeSubscriber } from 'rxjs/internal/Subscriber';

@Injectable({ providedIn: 'root' })
export class StoreService {
  public readonly watch: Subject<IStore> = new Subject<IStore>();

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

  watchItem<T = any>(name: string): Observable<T> {
    return new Observable((observer: Observer<T>) => {
      const subscription = this.watch.subscribe((item: IStore<T>) => {
        if (item.name === name) {
          observer.next(item.value);
        }
      });

      return {
        unsubscribe() {
          subscription.unsubscribe();
        },
      };
    });
  }
}
