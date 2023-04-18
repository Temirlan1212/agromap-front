import {
  Component,
  ContentChild,
  EventEmitter,
  HostBinding,
  Injector,
  Input,
  OnInit,
  Output,
  TemplateRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlContainer,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss', '../../styles/styles.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, TranslateModule],
})
export class FormFieldComponent implements OnInit {
  @ContentChild(TemplateRef, { static: false }) fieldTemplate!: TemplateRef<{
    required: boolean;
  }>;

  @Input() label = '';
  @Input() name = '';

  formControl: AbstractControl | null = null;
  required = false;

  constructor(private injector: Injector) {}

  ngOnInit() {
    const container = this.injector.get(ControlContainer);
    this.formControl = container?.control?.get(this.name) ?? null;
    if (this.formControl != null) {
      this.required = this.formControl.hasValidator(Validators.required);
    }
  }
}
