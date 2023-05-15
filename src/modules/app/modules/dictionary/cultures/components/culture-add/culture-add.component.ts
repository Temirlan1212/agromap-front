import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApiService } from '../../../../../../api/api.service';
import { CultureFormComponent } from '../culture-form/culture-form.component';
import { MessagesService } from '../../../../../../ui/services/messages.service';
import { TranslatePipe } from '@ngx-translate/core';
import { StoreService } from '../../../../../../ui/services/store.service';

@Component({
  selector: 'app-culture-add',
  templateUrl: './culture-add.component.html',
  styleUrls: ['./culture-add.component.scss'],
})
export class CultureAddComponent {
  constructor(
    private api: ApiService,
    private router: Router,
    private route: ActivatedRoute,
    private messages: MessagesService,
    private translate: TranslatePipe,
    private store: StoreService
  ) {}

  handleCancelClick() {
    this.router.navigate(['..'], { relativeTo: this.route });
  }

  async handleSaveClick(form: CultureFormComponent) {
    const formState = form.getState();
    if (!formState.touched) {
      this.messages.warning(this.translate.transform('No changes in form'));
      return;
    }
    if (!formState.valid) {
      this.messages.error(this.translate.transform('Form is invalid'));
      return;
    }
    try {
      await this.api.culture.create(formState.value);
      this.messages.success(
        this.translate.transform('Culture successfully created')
      );
      this.router.navigate(['..'], { relativeTo: this.route });
      this.store.setItem('CultureAddComponent', { created: true });
    } catch (e: any) {
      this.messages.error(e.error?.message ?? e.message);
    }
  }
}
