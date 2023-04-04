import { Component, OnDestroy, OnInit } from '@angular/core';
import { ApiService } from '../../../../api/api.service';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { QuestionDialogComponent } from '../../../../ui/components/question-dialog/question-dialog.component';
import { MessagesService } from '../../../../ui/components/services/messages.service';
import { DictionaryService } from '../../../../api/dictionary.service';

@Component({
  selector: 'app-cultures',
  templateUrl: './cultures.component.html',
  styleUrls: ['./cultures.component.scss', '../../../../../styles/table.scss']
})
export class CulturesComponent implements OnInit, OnDestroy {
  loading: boolean = false;
  list: any[] = [];
  currentLang: string = this.translateSvc.currentLang;
  selectedId: number | null = null;
  subscriptions: Subscription[] = [
    this.translateSvc.onLangChange.subscribe(
      (res) => (this.currentLang = res.lang)
    ),
    this.dictionary.culturesAction.subscribe(() => this.getList())
  ];

  constructor(
    private api: ApiService,
    private messages: MessagesService,
    private translateSvc: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private dictionary: DictionaryService) {
  }

  ngOnInit() {
    this.getList();
  }

  async getList() {
    try {
      this.loading = true;
      this.list = await this.api.culture.getList();
    } catch (e: any) {
      console.log(e.message);
    } finally {
      this.loading = false;
    }
  }

  handleEditClick(id: number) {
    this.router.navigate([id], { relativeTo: this.route });
  }

  handleAddClick() {
    this.router.navigate(['add'], { relativeTo: this.route });
  }

  handleDeleteClick(dialog: QuestionDialogComponent, id: number) {
    this.selectedId = id;
    dialog.show();
  }

  async deleteItem(): Promise<void> {
    try {
      await this.api.culture.delete(this.selectedId as number);
    } catch (e: any) {
      this.messages.error(e.message);
    }
  }

  async handleDeleteSubmitted(dialog: QuestionDialogComponent) {
    await this.deleteItem();
    this.dictionary.culturesAction.next();
    this.selectedId = null;
    dialog.close();
  }

  ngOnDestroy() {
    this.subscriptions.forEach((s) => s.unsubscribe());
  }
}
