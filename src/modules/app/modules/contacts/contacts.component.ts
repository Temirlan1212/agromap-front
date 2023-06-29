import { Component, OnInit, ViewChild } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
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
export class ContactsComponent implements OnInit {
  @ViewChild('toggleBtn') toggleBtn!: ToggleButtonComponent;
  sidePanelData: Record<string, any> = {};
  departmentList: IDepartment[] = [];
  contactInformations: IContactInformation[] = [];

  constructor(private translate: TranslatePipe, private api: ApiService) {}

  async ngOnInit(): Promise<void> {
    const departmentList = await this.api.contacts.getDepartmentList();
    this.departmentList = departmentList;
  }

  handleSidePanelToggle(isOpened: boolean) {
    this.sidePanelData['state'] = !isOpened;
  }

  handleLinkClick() {
    this.toggleBtn.isContentToggled = false;
    this.sidePanelData['state'] = false;
  }

  async handleDeparmentClick(id: string) {
    this.contactInformations = await this.api.contacts.getContactInformation(
      id
    );
  }
}
