import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../../../api/api.service';
import { MessagesService } from '../../../../../ui/components/services/messages.service';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { QuestionDialogComponent } from '../../../../../ui/components/question-dialog/question-dialog.component';

@Component({
  selector: 'app-create-dataset',
  templateUrl: './create-dataset.component.html',
  styleUrls: ['./create-dataset.component.scss'],
})
export class CreateDatasetComponent implements OnInit, OnDestroy {
  instruction!: any;
  currentLang: string = this.translateSvc.currentLang;
  sub: Subscription = this.translateSvc.onLangChange.subscribe(
    (res) => (this.currentLang = res.lang)
  );

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translateSvc: TranslateService,
    private translate: TranslatePipe
  ) {}

  async ngOnInit() {
    try {
      this.instruction = await this.api.ai.getInstruction();
    } catch (e: any) {
      this.messages.error(e.messages);
    }
  }

  handleGenerate(dialog: QuestionDialogComponent) {
    dialog.show();
  }

  async handleDeleteSubmitted(dialog: QuestionDialogComponent) {
    try {
      await this.api.ai.createDataset();
      dialog.close();
      this.messages.success(this.translate.transform('Process started'));
    } catch (e: any) {
      this.messages.error(e.messages);
    }
  }

  ngOnDestroy() {
    this.sub.unsubscribe();
  }
}
