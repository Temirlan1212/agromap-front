import { Pipe, PipeTransform } from '@angular/core';
/*
 * Raise the value exponentially
 * Takes an exponent argument that defaults to 1.
 * Usage:
 *   value | exponentialStrength:exponent
 * Example:
 *   {{ 2 | exponentialStrength:10 }}
 *   formats to: 1024
*/
@Pipe({name: 'exponentialStrength', standalone: true })
export class FormatDatePipe implements PipeTransform {
  transform(value: string, exponent: string, lang: string): string {
    if(exponent === "fullDate") {
    }
    return '';
  }
}