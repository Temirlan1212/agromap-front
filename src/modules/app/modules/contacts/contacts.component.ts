import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/modules/api/api.service';
import {
  IContactInformation,
  IDepartment,
} from 'src/modules/api/models/contacts.model';
import { ToggleButtonComponent } from 'src/modules/ui/components/toggle-button/toggle-button.component';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss'],
})
export class ContactsComponent implements OnInit, OnDestroy {
  @ViewChild('toggleBtn') toggleBtn!: ToggleButtonComponent;
  sidePanelData: Record<string, any> = {};
  departmentList: IDepartment[] = [
    {
      id: '1',
      unique_code: '1',
      name: 'Департамент по экспертизе сельскохозяйственных культур',
      name_ru: 'Департамент по экспертизе сельскохозяйственных культур',
      name_ky: 'Айыл чарба өсүмдүктөрүн экспертизалоо бөлүмү',
      name_en: 'Department for Expertise of Agricultural Crops',
    },
    {
      id: '2',
      unique_code: '2',
      name: 'Департамент по экспертизе сельскохозяйственных культур',
      name_ru: 'Департамент по экспертизе сельскохозяйственных культур',
      name_ky: 'Айыл чарба өсүмдүктөрүн экспертизалоо бөлүмү',
      name_en: 'Department for Expertise of Agricultural Crops',
    },
  ];
  contactInformations: IContactInformation[] = [];
  currLang: string = this.translateSrvc.currentLang;
  subs: Subscription[] = [];
  isLoading: boolean = false;

  constructor(
    private translate: TranslatePipe,
    private api: ApiService,
    private translateSrvc: TranslateService
  ) {}

  async ngOnInit(): Promise<void> {
    this.isLoading = true;
    const departmentList = await this.api.contacts.getDepartmentList();
    this.isLoading = false;
    // this.departmentList = departmentList;
    // console.log(this.departmentList);

    const sub = this.translateSrvc.onLangChange.subscribe(
      (lang: Record<string, any>) => {
        this.currLang = lang['lang'] as string;
      }
    ) as Subscription;
    this.subs = [...this.subs, sub];
  }

  handleSidePanelToggle(isOpened: boolean) {
    this.sidePanelData['state'] = !isOpened;
  }

  handleLinkClick() {
    this.toggleBtn.isContentToggled = false;
    this.sidePanelData['state'] = false;
  }

  handleGetDepartmentName(item: IDepartment) {
    return item[('name_' + this.currLang) as 'name_ru' | 'name_ky' | 'name_en'];
  }

  ngOnDestroy(): void {
    this.subs.forEach((s) => s.unsubscribe());
  }
}
