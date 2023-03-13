import { Component, ElementRef, HostListener, Input, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Routes } from '@angular/router';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sidenav',
  standalone: true,
  host: { class: 'sidenav' },
  imports: [
    CommonModule, RouterLink, RouterLinkActive, SvgIconComponent,
    TranslateModule
  ],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.scss'],
})
export class SidenavComponent implements OnInit {
  @ViewChild('languagesDialog') languagesDialog!: ElementRef<HTMLElement>;
  @Input() routes: Routes = [];

  topRoutes: Routes = [];
  bottomRoutes: Routes = [];
  opened: boolean = false;
  langsOpened: boolean = false;
  currentLang!: string;

  constructor(public translate: TranslateService) {
    this.currentLang = translate.getDefaultLang();
  }


  @HostListener('document:click', ['$event.target'])
  public onClick(target: any) {
    this.langsOpened = false;
  }

  handleLangClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    this.langsOpened = !this.langsOpened;
  }

  handleLangChange(e: MouseEvent, lang: string) {
    e.preventDefault();
    e.stopPropagation();
    this.translate.use(lang);
    this.currentLang = lang;
    this.langsOpened = !this.langsOpened;
  }

  private chunkRoutes(routes: Routes): void {
    console.log(this.routes);
    this.topRoutes = routes.filter(
      (f) => f.data != null && f.data['position'] === 'top'
    );
    this.bottomRoutes = routes.filter(
      (f) => f.data != null && f.data['position'] === 'bottom'
    );
  }

  ngOnInit(): void {
    this.chunkRoutes(this.routes);
  }
}
