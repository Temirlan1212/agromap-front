import {
  AfterContentInit,
  Component,
  ContentChildren,
  QueryList,
  ViewEncapsulation,
} from '@angular/core';
import { TabComponent } from './tab/tab.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-content-tabs',
  templateUrl: './content-tabs.component.html',
  styleUrls: ['./content-tabs.component.scss'],
  standalone: true,
  imports: [CommonModule],
})
export class ContentTabsComponent implements AfterContentInit {
  @ContentChildren(TabComponent) tabs!: QueryList<TabComponent>;

  ngAfterContentInit() {
    const activeTabs = this.tabs.filter((tab) => tab.active);

    if (activeTabs.length === 0) {
      this.selectTab(this.tabs.first);
    }
  }

  selectTab(tab: TabComponent) {
    this.tabs.forEach((tab) => {
      tab.active = false;
    });

    tab.active = true;
  }
}
