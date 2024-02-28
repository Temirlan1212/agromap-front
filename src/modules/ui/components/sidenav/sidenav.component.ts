import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  Event,
  Router,
  RouterLink,
  RouterLinkActive,
  Routes,
  RoutesRecognized,
} from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
  ELanguageCode,
  ILanguage,
  ILanguageStore,
} from 'src/modules/ui/models/language.model';
import { StoreService } from 'src/modules/ui/services/store.service';
import { INotification } from '../../../api/models/notification.model';
import { TooltipComponent } from '../tooltip/tooltip.component';
import { Subscription } from 'rxjs';
import { SettingsComponent } from '../settings/settings.component';
import { MenuComponent } from '../menu/menu.component';
import { SidePanelService } from '../../services/side-panel.service';

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
    TooltipComponent,
    SettingsComponent,
    MenuComponent,
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnChanges, OnDestroy {
  @Input() routes: Routes = [];
  @Input() notifications!: INotification[];
  topRoutes: Routes = [];
  bottomRoutes: Routes = [];
  mobileRoutes: Routes = [];
  opened: boolean = false;
  langsOpened: boolean = false;
  settingsOpened: boolean = false;
  currentLang: ELanguageCode = ELanguageCode.ru;
  allLangs: ILanguage[] = [];
  indicator: boolean = false;
  subs: Subscription[] = [];
  activeNavItem: Record<string, any> | null = null;
  activeNavItemPath: string | undefined = undefined;
  isChildRoute: boolean = false;

  constructor(
    private translate: TranslateService,
    private store: StoreService,
    private router: Router,
    public sidePanelService: SidePanelService
  ) {
    this.router.events.subscribe((event: Event) => {
      if (event instanceof RoutesRecognized) {
        const config = event.state.root.firstChild?.routeConfig;
        let url = event.url;
        const splittedUrl = url.split('/').filter(Boolean);
        this.isChildRoute = false;
        if (splittedUrl?.[0] === config?.path && splittedUrl.length > 1) {
          this.isChildRoute = true;
        }

        this.activeNavItemPath = url;
      }
    });
  }

  collapsed: boolean = false;

  ngOnInit(): void {
    const languageStore = this.store.getItem<ILanguageStore>('language');

    if (languageStore != null) {
      this.currentLang = languageStore.current;
      this.allLangs = languageStore.all;
    }

    const sub = this.router.events.subscribe((event: Event) => {
      if (event instanceof RoutesRecognized) {
        this.activeNavItem = event.state.root.firstChild?.data ?? null;
      }
    });

    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.map((sub) => sub.unsubscribe());
  }

  handleLangChange(e: MouseEvent, lang: ELanguageCode) {
    e.preventDefault();
    e.stopPropagation();
    this.translate.use(lang);
    this.currentLang = lang;
  }

  private chunkRoutes(routes: Routes): void {
    this.topRoutes = routes.filter(
      (f) => f.data != null && f.data['position'] === 'top'
    );
    this.bottomRoutes = routes.filter(
      (f) => f.data != null && f.data['position'] === 'bottom'
    );
    this.mobileRoutes = this.routes.filter(
      (f) => f.data != null && !f.data['onlyDesktop']
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['routes'] != null && !changes['routes'].isFirstChange()) {
      this.chunkRoutes(this.routes);
    }
    if (changes['notifications']) {
      this.indicator = this.notifications?.length > 0;
    }
  }

  handleArrowLeftClick(menuContainer: HTMLDivElement) {
    menuContainer.scrollTo({
      left: menuContainer.scrollLeft - 100,
      behavior: 'smooth',
    });
  }

  handleArrowRightClick(menuContainer: HTMLDivElement) {
    menuContainer.scrollTo({
      left: menuContainer.scrollLeft + 100,
      behavior: 'smooth',
    });
  }

  handleNavClick(e: any, data: Record<string, any>) {
    if (data?.['toggle'] && data?.['path']) {
      e.stopPropagation();
      this.sidePanelService.set(
        !this.sidePanelService.get(data['path']),
        data['path']
      );
    }
  }

  protected readonly top = top;
}
