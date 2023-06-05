import { AfterViewInit, Component, Input } from '@angular/core';
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
import { ContourFilterComponent } from '../contour-filter/contour-filter.component';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
})
export class StatisticsComponent implements AfterViewInit {
  @Input() isWmsAiActive: boolean = false;
  @Input() landTypes: ILandType[] = [];
  @Input() contourFilterComponent!: ContourFilterComponent;
  pastureStatsProdTableItems: ITableItem[][] = [];
  cultureStatsProdTableItems: ITableItem[] = [];
  currentLang: string = this.translateSvc.currentLang;
  activeTab!: TabComponent;
  subscriptions: Subscription[] = [];
  filterFormValues!: any;

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private translateSvc: TranslateService
  ) {}

  ngAfterViewInit(): void {
    if (this.contourFilterComponent != null) {
      this.subscriptions = [
        this.contourFilterComponent.onFormReset.subscribe(() =>
          this.handleFilterFormReset()
        ),
        this.contourFilterComponent.onFormSubmit.subscribe((formValue) =>
          this.handleFilterFormSubmit(formValue)
        ),
        this.translateSvc.onLangChange.subscribe((res) => {
          this.currentLang = res.lang;
          this.contourPastureStatisticsOnLangChange();
        }),
      ];
    }

    this.pastureStatsProdTableItems = [];
    this.cultureStatsProdTableItems = [];
    let params = { year: 2022, land_type: String(this.activeTab.id) };
    this.getPastureStatisticsProductivity(params);
    this.getCultureStatisticsProductivity(params);
  }

  private handleFilterFormReset() {
    this.pastureStatsProdTableItems = [];
    this.cultureStatsProdTableItems = [];
    this.filterFormValues = { year: 2022 };
    this.filterFormValues['land_type'] = String(this.activeTab.id);
    this.getPastureStatisticsProductivity(this.filterFormValues);
    this.getCultureStatisticsProductivity(this.filterFormValues);
    this.filterFormValues = null;
  }

  private handleFilterFormSubmit(formValue: Record<string, any>) {
    const params = formValue['value'];

    this.pastureStatsProdTableItems = [];
    this.cultureStatsProdTableItems = [];

    if (String(params.land_type).includes('1')) {
      this.getCultureStatisticsProductivity({
        ...params,
        land_type: this.activeTab.id,
      });
    }

    if (String(params.land_type).includes('2')) {
      this.getPastureStatisticsProductivity({
        ...params,
        land_type: this.activeTab.id,
      });
    }

    this.filterFormValues = formValue['value'];
  }

  handleSelectedTab(selectedTab: TabComponent) {
    this.activeTab = selectedTab;
  }

  public getLandTypeItem(item: any): string {
    const propertyName = 'name_' + this.currentLang;
    return item[propertyName];
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
