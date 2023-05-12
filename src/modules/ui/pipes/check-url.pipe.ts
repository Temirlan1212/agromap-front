import { Pipe, PipeTransform } from '@angular/core';
import { Router } from '@angular/router';

@Pipe({
  name: 'checkUrl',
  standalone: true,
  pure: true,
})
export class CheckUrlPipe implements PipeTransform {
  constructor(private router: Router) {}

  transform(
    value: string,
    checkSide: 'left' | 'right' | 'all' = 'right'
  ): boolean {
    const findedUrlIndex = this.router.routerState.snapshot.url.indexOf(value);

    if (findedUrlIndex === -1) {
      return false;
    }

    const leftExist = this.router.routerState.snapshot.url[findedUrlIndex - 1];
    const rightExist =
      this.router.routerState.snapshot.url[findedUrlIndex + value.length];

    switch (checkSide) {
      case 'left':
        return leftExist == null;
      case 'right':
        return rightExist == null;
      case 'all':
        return leftExist == null && rightExist == null;
    }
  }
}
