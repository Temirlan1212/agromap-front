import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ICulture } from 'src/modules/api/models/culture.model';
import { FormControl } from '@angular/forms';
import { ApiService } from 'src/modules/api/api.service';
import { MessagesService } from 'src/modules/ui/components/services/messages.service';

@Component({
  selector: 'app-cropland',
  templateUrl: './cropland.component.html',
  styleUrls: ['./cropland.component.scss'],
})
export class CroplandComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  currentLang: string = this.translateSvc.currentLang;
  cultures: ICulture[] = [];
  cultureFormControl: FormControl = new FormControl<string | null>(null);

  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
  ];

  culturalHealthIndicators: Record<string, any>[] = [];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translateSvc: TranslateService
  ) {}

  async ngOnInit() {
    await this.getCulture();
    this.cultureFormControl.setValue(this.cultures[0].id);
    this.handleSelectCulture({ id: this.cultures[0].id });
  }

  async getCulture() {
    try {
      this.cultures = await this.api.culture.getList();
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async handleSelectCulture(item: Record<string, any> | null) {
    this.loading = true;

    this.culturalHealthIndicators = [];
    const id = item?.['id'];
    if (id) {
      this.culturalHealthIndicators =
        await this.api.culture.getCultureIndicators(id);
    }

    this.loading = false;
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
