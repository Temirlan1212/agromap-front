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
import { StoreService } from 'src/modules/ui/services/store.service';
import { MapService } from 'src/modules/ui/services/map.service';

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
  mapControlStatsToggleState: boolean = true;
  activeTabsId: null | string = null;
  loading = false;
  viewType: 'chart' | 'table' = 'table';
  pastureViewType: 'productive' | 'unproductive' = 'productive';
  items: Record<
    string,
    {
      value: ITableItem[] | ITableItem[][];
      nested: boolean;
    }
  > = {};

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private translateSvc: TranslateService,
    private cd: ChangeDetectorRef,
    private store: StoreService,
    private mapService: MapService
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

    const croplandMapStats = this.store.getItem('CroplandMapStats');
    if (croplandMapStats != null) {
      this.mapControlStatsToggleState = croplandMapStats?.isCollapsed;
    }

    this.cd.detectChanges();
  }

  ngOnDestroy(): void {
    this.subscriptions.map((s) => s.unsubscribe());
  }

  handleMapControlStatsToggle(toggleState: boolean) {
    this.mapControlStatsToggleState = toggleState;
    this.store.setItem('CroplandMapStats', {
      isCollapsed: this.mapControlStatsToggleState,
    });
  }

  handleSelectedTab(selectedTab: TabComponent) {
    this.activeTab = selectedTab;

    if (this.filterFormValues != null) {
      this.handleFilterFormSubmit(this.filterFormValues);
    }
  }

  public onSelectViewType(type: 'chart' | 'table') {
    this.viewType = type;
    this.cd.detectChanges();
  }

  public getLandTypeItem(item: any): string {
    const propertyName = 'name_' + this.currentLang;
    return item[propertyName];
  }

  private handleFilterFormReset() {
    this.pastureStatsProdTableItems = [];
    this.cultureStatsProdTableItems = [];

    if (this.activeTab?.id) {
      this.filterFormValues = {
        year: this.mapService.filterDefaultValues.year,
      };
      this.filterFormValues['land_type'] = String(this.activeTab.id);
      this.getPastureStatisticsProductivity(this.filterFormValues);
      this.getCultureStatisticsProductivity(this.filterFormValues);
      this.filterFormValues = null;
      this.activeTabsId = null;
    }
  }

  public getItem(id: number): any {
    return this.items?.[String(id)] || { value: [], nested: false };
  }

  private handleItemsUpdate(
    id: number | string,
    value: ITableItem[] | ITableItem[][]
  ) {
    const isNestedValue = Array.isArray(value?.[0]);

    this.items[id] = {
      ...(this.items?.[id] ?? {}),
      value: value,
      nested: isNestedValue,
    };
  }

  private async handleFilterFormSubmit(
    formValue: IContourStatisticsProductivityQuery | ICulutreStatisticsQuery
  ) {
    const fetchList = {
      1: async (params: IContourStatisticsProductivityQuery) =>
        await this.getCultureStatisticsProductivity(params),
      2: async (params: IContourStatisticsProductivityQuery) =>
        await this.getPastureStatisticsProductivity(params),
    };

    for (const type of this.landTypes || []) {
      const id = String(type.id);
      const method = (fetchList as any)?.[id];

      if (String(formValue?.['land_type']).includes(id)) {
        if (!method) {
          this.handleItemsUpdate(id, []);
        } else {
          const data = await method({
            ...formValue,
            land_type: id,
          });
          this.handleItemsUpdate(id, Array.isArray(data) ? data : []);
        }
      } else {
        delete this.items?.[id];
      }
    }

    this.activeTabsId = this.filterFormValues?.land_type;
    this.cd.detectChanges();
  }

  private async getPastureStatisticsProductivity(
    query: IContourStatisticsProductivityQuery
  ): Promise<any> {
    if (this.isWmsAiActive) query.ai = this.isWmsAiActive;

    this.loading = true;
    try {
      let res: IContourStatisticsProductivity;
      res = await this.api.statistics.getContourStatisticsProductivity(query);
      const pastureStatsProdTableItems: ITableItem[][] = [];

      if (!res.type) {
        this.pastureStatsProdTableItems = pastureStatsProdTableItems;
        return;
      }

      pastureStatsProdTableItems.push([
        {
          areaType: res?.type,
          areaName_en: res?.[`name_en`],
          areaName_ky: res?.[`name_ky`],
          areaName_ru: res?.[`name_ru`],
          productive: res?.Productive?.ha,
          productive_en: `${res?.Productive?.ha} ha`,
          productive_ky: `${res?.Productive?.ha} га`,
          productive_ru: `${res?.Productive?.ha} га`,
          unproductive: res?.Unproductive?.ha,
          unproductive_en: `${res?.Unproductive?.ha} ha`,
          unproductive_ky: `${res?.Unproductive?.ha} га`,
          unproductive_ru: `${res?.Unproductive?.ha} га`,
        },
      ]);

      if (
        Array.isArray(res?.Children) &&
        res?.Children?.length > 0 &&
        !res?.Children?.some(
          (child) => child?.type?.toLocaleLowerCase() === 'conton'
        )
      ) {
        pastureStatsProdTableItems.push(
          res?.Children.map((child) => ({
            areaType: child?.type,
            areaName_en: child?.[`name_en`],
            areaName_ky: child?.[`name_ky`],
            areaName_ru: child?.[`name_ru`],
            productive: child?.Productive?.ha,
            productive_en: `${child?.Productive?.ha} ha`,
            productive_ky: `${child?.Productive?.ha} га`,
            productive_ru: `${child?.Productive?.ha} га`,
            unproductive: child?.Unproductive?.ha,
            unproductive_en: `${child?.Unproductive?.ha} ha`,
            unproductive_ky: `${child?.Unproductive?.ha} га`,
            unproductive_ru: `${child?.Unproductive?.ha} га`,
          }))
        );
      }

      this.pastureStatsProdTableItems = pastureStatsProdTableItems;
      return this.pastureStatsProdTableItems;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    } finally {
      this.loading = false;
    }
  }

  private async getCultureStatisticsProductivity(
    query: ICulutreStatisticsQuery
  ): Promise<any> {
    if (this.isWmsAiActive) query.ai = this.isWmsAiActive;
    this.loading = true;
    try {
      const res = await this.api.statistics.getCultureStatistics(query);

      this.cultureStatsProdTableItems = res.map((element) => ({
        ...element,
        area_ha: element?.area_ha,
        area_ha_en: `${element?.area_ha} ha`,
        area_ha_ky: `${element?.area_ha} га`,
        area_ha_ru: `${element?.area_ha} га`,
      })) as unknown as ITableItem[];

      return this.cultureStatsProdTableItems;
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    } finally {
      this.loading = false;
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
