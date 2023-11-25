import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { InputCheckboxComponent } from '../input-checkbox/input-checkbox.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [CommonModule, TranslateModule, InputCheckboxComponent],
})
export class SettingsComponent implements OnInit {
  constructor(private settingsService: SettingsService) {}
  settings = this.settingsService.settings;

  ngOnInit(): void {
    this.settings = this.settingsService.get();
    this.settingsService.watch((value) => (this.settings = value));
  }

  handleChangeSettings(key: keyof typeof this.settings, value: any) {
    this.settingsService.patch(key, value, { persist: true });
  }
}
