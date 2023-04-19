import { Component, OnInit } from '@angular/core';
import { ApiService } from '../../../../../../api/api.service';
import { MessagesService } from '../../../../../../ui/components/services/messages.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ICulture } from '../../../../../../api/models/culture.model';
import { CultureFormComponent } from '../culture-form/culture-form.component';
import { TranslatePipe } from '@ngx-translate/core';
import { StoreService } from '../../../../../../ui/services/store.service';

@Component({
  selector: 'app-culture-edit',
  templateUrl: './culture-edit.component.html',
  styleUrls: ['./culture-edit.component.scss'],
})
export class CultureEditComponent implements OnInit {
  culture!: ICulture;

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private route: ActivatedRoute,
    private router: Router,
    private translate: TranslatePipe,
    private store: StoreService
  ) {}

  ngOnInit() {
    this.getCulture();
  }

  async getCulture() {
    const id = this.route.snapshot.paramMap.get('id');
    try {
      this.culture = await this.api.culture.getOne(Number(id));
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

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
      await this.api.culture.update(this.culture.id, formState.value);
      this.messages.success(
        this.translate.transform('Culture successfully updated')
      );
      this.router.navigate(['..'], { relativeTo: this.route });
      this.store.setItem('CultureEditComponent', { updated: true });
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }
}
