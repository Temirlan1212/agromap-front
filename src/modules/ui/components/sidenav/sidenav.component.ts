import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  HostListener,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Routes } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ELanguageCode,
  ILanguage,
  ILanguageStore,
} from 'src/modules/ui/models/language.model';
import { StoreService } from 'src/modules/ui/services/store.service';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  host: { class: 'sidenav' },
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    SvgIconComponent,
    TranslateModule,
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnChanges {
  @Input() routes: Routes = [];

  topRoutes: Routes = [];
  bottomRoutes: Routes = [];
  opened: boolean = false;
  langsOpened: boolean = false;
  currentLang: ELanguageCode = ELanguageCode.ru;
  allLangs: ILanguage[] = [];
  mobileRoutes: Routes = [];

  constructor(
    private translate: TranslateService,
    private store: StoreService
  ) {}

  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    this.langsOpened = false;
  }

  ngOnInit(): void {
    const languageStore = this.store.getItem<ILanguageStore>('language');

    if (languageStore != null) {
      this.currentLang = languageStore.current;
      this.allLangs = languageStore.all;
    }
  }

  handleLangClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.langsOpened = !this.langsOpened;
  }

  handleLangChange(e: MouseEvent, lang: ELanguageCode) {
    e.preventDefault();
    e.stopPropagation();
    this.translate.use(lang);
    this.currentLang = lang;
    this.langsOpened = !this.langsOpened;
  }

  private chunkRoutes(routes: Routes): void {
    this.topRoutes = routes.filter(
      (f) => f.data != null && f.data['position'] === 'top'
    );
    this.bottomRoutes = routes.filter(
      (f) => f.data != null && f.data['position'] === 'bottom'
    );
    this.mobileRoutes = this.routes.filter(
      (f) => f.data != null && f.data['class'] != 'homepage'
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['routes'] != null && !changes['routes'].isFirstChange()) {
      this.chunkRoutes(this.routes);
    }
  }

  handleArrowLeftClick(menuContainer: HTMLDivElement) {
    menuContainer.scrollLeft -= 100;
  }

  handleArrowRightClick(menuContainer: HTMLDivElement) {
    menuContainer.scrollLeft += 100;
  }

  protected readonly top = top;
}
