import { Component, OnInit } from '@angular/core';
import { SettingsService } from 'src/modules/ui/services/settings.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  constructor(private settingsService: SettingsService) {}
  settings = this.settingsService.settings;

  ngOnInit(): void {
    this.settings = this.settingsService.get();
    this.settingsService.watch((value) => {
      this.settings = value;
    });
  }

  handleChangeSettings(key: keyof typeof this.settings, value: any) {
    this.settingsService.patch(key, value, { persist: true });
  }
}
