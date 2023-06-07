import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnDestroy,
  SimpleChanges,
} from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ApiService } from 'src/modules/api/api.service';
import { ILandType } from 'src/modules/api/models/land-type.model';
import {
  IContourStatisticsProductivity,
  IContourStatisticsProductivityQuery,
  ICulutreStatisticsQuery,
} from 'src/modules/api/models/statistics.model';
import { TabComponent } from 'src/modules/ui/components/content-tabs/tab/tab.component';
import { ITableItem } from 'src/modules/ui/models/table.model';
import { MessagesService } from 'src/modules/ui/services/messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent
  implements AfterViewInit, OnChanges, OnDestroy
{
  @Input() isWmsAiActive: boolean = false;
  @Input() landTypes: ILandType[] = [];
  @Input() filterFormValues: any;
  pastureStatsProdTableItems: ITableItem[][] = [];
  cultureStatsProdTableItems: ITableItem[] = [];
  currentLang: string = this.translateSvc.currentLang;
  activeTab!: TabComponent;
  subscriptions: Subscription[] = [];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private translateSvc: TranslateService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if ('filterFormValues' in changes) {
      this.filterFormValues = changes['filterFormValues'].currentValue;
      if (this.filterFormValues == null) {
        this.handleFilterFormReset();
      } else {
        this.handleFilterFormSubmit(this.filterFormValues);
      }
    }
  }

  ngAfterViewInit(): void {
    this.subscriptions = [
      this.translateSvc.onLangChange.subscribe((res) => {
        this.currentLang = res.lang;
        this.contourPastureStatisticsOnLangChange();
      }),
    ];

    this.pastureStatsProdTableItems = [];
    this.cultureStatsProdTableItems = [];
    let params = { year: 2022, land_type: String(this.activeTab.id) };
    this.getPastureStatisticsProductivity(params);
    this.getCultureStatisticsProductivity(params);

    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.map((s) => s.unsubscribe());
  }

  handleSelectedTab(selectedTab: TabComponent) {
    this.activeTab = selectedTab;
    if (this.filterFormValues != null) {
      this.handleFilterFormSubmit(this.filterFormValues);
    }
  }

  public getLandTypeItem(item: any): string {
    const propertyName = 'name_' + this.currentLang;
    return item[propertyName];
  }

  private handleFilterFormReset() {
    this.pastureStatsProdTableItems = [];
    this.cultureStatsProdTableItems = [];

    if (this.activeTab?.id) {
      this.filterFormValues = { year: 2022 };
      this.filterFormValues['land_type'] = String(this.activeTab.id);
      this.getPastureStatisticsProductivity(this.filterFormValues);
      this.getCultureStatisticsProductivity(this.filterFormValues);
      this.filterFormValues = null;
    }
  }

  private handleFilterFormSubmit(
    formValue: IContourStatisticsProductivityQuery | ICulutreStatisticsQuery
  ) {
    this.pastureStatsProdTableItems = [];
    this.cultureStatsProdTableItems = [];

    if (String(formValue?.['land_type']).includes('1')) {
      this.getCultureStatisticsProductivity({ ...formValue, land_type: '1' });
    }

    if (String(formValue?.['land_type']).includes('2')) {
      this.getPastureStatisticsProductivity({ ...formValue, land_type: '2' });
    }
  }

  private async getPastureStatisticsProductivity(
    query: IContourStatisticsProductivityQuery
  ): Promise<void> {
    if (this.isWmsAiActive) query.ai = this.isWmsAiActive;

    try {
      let res: IContourStatisticsProductivity;
      res = await this.api.statistics.getContourStatisticsProductivity(query);

      if (!res.type) {
        this.pastureStatsProdTableItems = [];
        return;
      }

      this.pastureStatsProdTableItems.push([
        {
          areaType: res?.type,
          areaName_en: res?.[`name_en`],
          areaName_ky: res?.[`name_ky`],
          areaName_ru: res?.[`name_ru`],
          productive: `${res?.Productive?.ha} ${this.translate.transform(
            'ha'
          )}`,
          unproductive: `${res?.Unproductive?.ha} ${this.translate.transform(
            'ha'
          )}`,
        },
      ]);

      if (Array.isArray(res?.Children) && res?.Children?.length > 0) {
        this.pastureStatsProdTableItems.push(
          res?.Children.map((child) => ({
            areaType: child?.type,
            areaName_en: child?.[`name_en`],
            areaName_ky: child?.[`name_ky`],
            areaName_ru: child?.[`name_ru`],
            productive: `${child?.Productive?.ha} ${this.translate.transform(
              'ha'
            )}`,
            unproductive: `${
              child?.Unproductive?.ha
            } ${this.translate.transform('ha')}`,
          }))
        );
      }
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  private async getCultureStatisticsProductivity(
    query: ICulutreStatisticsQuery
  ): Promise<void> {
    if (this.isWmsAiActive) query.ai = this.isWmsAiActive;

    try {
      const res = await this.api.statistics.getCultureStatistics(query);

      this.cultureStatsProdTableItems = res.map((element) => ({
        ...element,
        area_ha: `${element?.area_ha} ${this.translate.transform('ha')}`,
      })) as unknown as ITableItem[];
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }

  private contourPastureStatisticsOnLangChange() {
    const translateHa = this.translateSvc.translations[this.currentLang]['ha'];
    this.pastureStatsProdTableItems = this.pastureStatsProdTableItems.map(
      (arr) =>
        arr.map((element) => ({
          ...element,
          productive: `${String(element?.['productive']).replace(
            /га|ha/gi,
            translateHa
          )}`,
          unproductive: `${String(element?.['unproductive']).replace(
            /га|ha/gi,
            translateHa
          )}`,
        }))
    );
    this.cultureStatsProdTableItems = this.cultureStatsProdTableItems.map(
      (element) => {
        return {
          ...element,
          area_ha: `${String(element?.['area_ha']).replace(
            /га|ha/gi,
            translateHa
          )}`,
        };
      }
    );
  }
}
