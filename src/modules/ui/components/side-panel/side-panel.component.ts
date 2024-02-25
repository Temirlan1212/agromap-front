import {
  Component,
  HostBinding,
  Input,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { SvgIconComponent } from '../svg-icon/svg-icon.component';
import { Subscription } from 'rxjs';
import { SidePanelService } from '../../services/side-panel.service';

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

  constructor(private sidePanelService: SidePanelService) {}

  ngOnInit() {
    this.sidePanelService.watch((v) => (this.collapsed = v));
    this.collapsed = !!this.sidePanelService.get();
  }

  ngOnDestroy(): void {
    this.subs.map((sub) => sub.unsubscribe());
  }

  handlePanelToggle() {
    this.isOpened = !this.isOpened;
  }
}
