import {
  AfterContentInit,
  Component,
  ContentChildren,
  EventEmitter,
  Input,
  Output,
  QueryList,
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
  @Output() onSelected = new EventEmitter<TabComponent>();
  @Input() set updatesOn(v: any) {
    if (this.tabs != null && v != null) {
      setTimeout(() => this.selectTab(this.tabs.first), 0);
    }
  }

  ngAfterContentInit() {
    const activeTabs = this.tabs.filter((tab) => tab.active);

    if (activeTabs.length === 0) {
      this.onSelectTab(this.tabs.first);
    }
  }

  onSelectTab(tab: TabComponent) {
    this.selectTab(tab);
    this.onSelected.emit(tab);
  }

  private selectTab(tab: TabComponent) {
    this.tabs.forEach((tab) => {
      tab.active = false;
    });
    tab.active = true;
  }
}
