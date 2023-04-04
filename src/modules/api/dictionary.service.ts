import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DictionaryService {
  culturesAction = new Subject<void>();

  constructor() {
  }
}
