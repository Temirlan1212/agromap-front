import { Injectable } from '@angular/core';
import { StoreService } from './store.service';
import { Event, Router, RoutesRecognized } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class SidePanelService {
  activeNavItemPath: string | null = null;
  storageName = 'SidePanelStates';
  storeService = new StoreService();

  constructor(private router: Router) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof RoutesRecognized) {
        const config = event.state.root.firstChild?.routeConfig;
        if (config?.data?.['toggle']) {
          this.activeNavItemPath = config?.path ?? null;
          this.set(this.get());
        } else {
          this.activeNavItemPath = null;
        }
      }
    });
  }

  toggle() {
    const item = this.storeService.getItem(this.storageName);
    if (this.activeNavItemPath == null) return;
    const payload = {
      ...(item || {}),
      [this.activeNavItemPath]: !item?.[this.activeNavItemPath],
    };
    this.storeService.setItem(this.storageName, payload);
    return payload;
  }

  set(v: boolean, page?: string) {
    const item = this.storeService.getItem(this.storageName);
    if (this.activeNavItemPath == null) return;
    const payload = {
      ...(item || {}),
      [page ?? this.activeNavItemPath]: v,
    };
    this.storeService.setItem(this.storageName, payload);
    return payload;
  }

  get() {
    return !!this.storeService.getItem(this.storageName)?.[
      this.activeNavItemPath ?? ''
    ];
  }

  watch(callback: (v: any) => void) {
    this.storeService
      .watchItem(this.storageName)
      .subscribe((v) => callback(this.get()));
  }
}
