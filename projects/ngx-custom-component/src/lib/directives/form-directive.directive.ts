import { Directive, ElementRef, HostListener } from "@angular/core";

@Directive({
  selector: '[ inputValidFocus ]'
})
export class FormDirective {
  constructor(
    private el: ElementRef
  ) {}

  @HostListener('submit')
  onSubmit() {
    this.el.nativeElement.querySelector('input.ng-valid') ?.focus();
  }
}
