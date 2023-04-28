import { Component } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
})
export class AboutComponent {
  moTechnologiesActiveImgName: string = 'plants_humidity';

  constructor(private translate: TranslatePipe) {}

  handleMousemove(imgName: string) {
    this.moTechnologiesActiveImgName = imgName;
  }
}
