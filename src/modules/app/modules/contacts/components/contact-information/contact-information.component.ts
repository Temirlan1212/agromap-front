import { Component, Input } from '@angular/core';
import { IContactInformation } from 'src/modules/api/models/contacts.model';

@Component({
  selector: 'app-contact-information',
  templateUrl: './contact-information.component.html',
  styleUrls: ['./contact-information.component.scss'],
})
export class ContactInformationComponent {
  @Input() contactInformation: IContactInformation | null = null;
}
