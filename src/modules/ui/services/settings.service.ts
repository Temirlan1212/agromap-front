import { Injectable } from '@angular/core';
import { StoreService } from './store.service';

@Injectable({ providedIn: 'root' })
export class SettingsService {
  settings = {
    ['filter.collapseOnApply']: true,
  };
  storageName = 'settings';
  storeService = new StoreService();
  constructor() {}

  patch(
    key: keyof typeof this.settings,
    value: any,
    props?: Partial<{ persist: boolean }>
  ) {
    this.settings = { ...this.settings, [key]: value };

    if (props?.persist) {
      this.storeService.setItem(this.storageName, this.settings);
    }

    return this.settings;
  }

  get(key?: keyof typeof this.settings) {
    const storageItem = this.storeService.getItem(this.storageName) || null;
    if (storageItem == null) {
      this.storeService.setItem(this.storageName, this.settings);
      return this.settings;
    }

    if (key != null) {
      if (storageItem?.[key] != null) return storageItem[key];
      if (storageItem?.[key] == null) return this.settings[key];
    }

    return storageItem;
  }

  watch(callback: (v: any) => void, key?: keyof typeof this.settings) {
    this.storeService
      .watchItem(this.storageName)
      .subscribe((v) => callback(key ? this.get(key) : this.get()));
  }
}
