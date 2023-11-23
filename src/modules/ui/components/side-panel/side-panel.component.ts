import {
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { StoreService } from '../../services/store.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-side-panel',
  templateUrl: './side-panel.component.html',
  styleUrls: ['./side-panel.component.scss'],
  imports: [SvgIconComponent],
  standalone: true,
})
export class SidePanelComponent implements OnInit, OnDestroy {
  @Input() isOpened: boolean = false;
  subs: Subscription[] = [];

  @HostBinding('class.collapsed')
  collapsed: boolean = false;

  @HostBinding('class.isOpened')
  get isOpenedClass(): boolean {
    return this.isOpened;
  }

  constructor(private store: StoreService) {}

  ngOnInit() {
    const sub = this.store
      .watchItem<boolean>('isSidePanelCollapsed')
      .subscribe((v) => {
        this.collapsed = v;
      });

    this.collapsed = !!this.store.getItem('isSidePanelCollapsed');
    this.subs.push(sub);
  }

  ngOnDestroy(): void {
    this.subs.map((sub) => sub.unsubscribe());
  }

  handlePanelToggle() {
    this.isOpened = !this.isOpened;
  }
}
