import { AfterViewInit, Component } from '@angular/core';
import { ApiService } from 'src/modules/api/api.service';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
})
export class ReportsComponent implements AfterViewInit {
  constructor(private api: ApiService) {}
  ngAfterViewInit(): void {}
}
