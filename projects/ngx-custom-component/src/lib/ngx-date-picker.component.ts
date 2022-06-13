import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  forwardRef,
  Input,
  OnDestroy,
  OnInit
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { NgxDate, MonthId, DatesList, Week } from './shared/models/ngx-date-picker.model';
import { DatePickerService } from './shared/services/date-picker.service';
import { LocaleService } from './shared/services/date-picker.localization.service';

@Component({
  selector: 'ngx-date-picker',
  templateUrl: './ngx-date-picker.component.html',
  styleUrls: [ './ngx-date-picker.component.scss' ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    DatePickerService,
    LocaleService,
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NgxDatePickerComponent),
      multi: true
    }
  ]
})
export class NgxDatePickerComponent implements OnInit, OnDestroy, ControlValueAccessor {
  @Input() label: string = 'Write text';
  @Input() showLabel: boolean = true;
  @Input() dateFormat: string = '';
  @Input() lang: string = '';

  private data: NgxDate = { year: 0, month: 0, day: 0 };
  private dayIdx: number = 1;

  readonly previousMonthId: number = MonthId.prev;
  readonly currentMonthId: number = MonthId.curr;
  readonly nextMonthId: number = MonthId.next;

  options: any;
  showCalendar: boolean = true;
  openChoiceYears: boolean = false;
  weekDays: Array<string> = [];
  dates: DatesList[] = [];
  activeDate: NgxDate = { year: 0, month: 0, day: 0 };
  years: number[] = [];
  formattedDate: string = '';

  constructor(
    private cdr: ChangeDetectorRef,
    private datePickerService: DatePickerService,
    private localizationService: LocaleService
  ) {}

  get getToday(): NgxDate {
    let date: Date = new Date();

    return { year: date.getFullYear(), month: date.getMonth() + 1, day: date.getDate() };
  }

  get month() {
    return new Date(this.activeDate.year, this.activeDate.month - 1, this.activeDate.day).toLocaleString(this.lang, { month: 'long' });
  }

  get sundayIdx(): number {
    // Index of Sunday day
    return this.dayIdx > 0 ? 7 - this.dayIdx : 0;
  }

  ngOnInit() {
    // document.addEventListener('click', (e: any) => {
    //   const target = e.target;
    //   if ((!target.closest('.ngx-date-picker__container') && !target.closest('.ngx-calendar')) && this.showCalendar) {
    //     this.showCalendar = false;
    //   }
    // });
    this.options = this.localizationService.getLocaleOptions(this.lang);
    this.parseWeekDaysTitle()
    this.generateYears()
  }

  ngOnDestroy() {
    document.removeEventListener('click', () => {
    });
  }

  writeValue(data: NgxDate) {
    this.data = data;
    this.initDate(data);
  }

  registerOnChange(fn: (_: string | number) => void) {
    this.propagateChange = fn;
  }

  registerOnTouched(fn: (_: string | number) => void) {
    this.propagateTouched = fn;
  }

  propagateChange = (_: string | number) => {};

  propagateTouched = (_: string | number) => {};

  initDate(date: NgxDate) {
    this.activeDate = this.datePickerService.parseDate(date);
    this.formattedDate = this.datePickerService.formatDate(this.activeDate, (this.dateFormat ? this.dateFormat : this.options.dateFormat), this.options.monthLabels);

    this.generateCalendar(this.activeDate.month, this.activeDate.year);
  }

  parseWeekDaysTitle() {
    let weekDays: Array<string> = this.datePickerService.getWeekDays();
    this.dayIdx = weekDays.indexOf(this.options.firstDayOfWeek);
    let idx: number = this.dayIdx;

    for (let i = 0; i < weekDays.length; i++) {
      this.weekDays.push(this.options.dayLabels[weekDays[idx]]);
      idx = weekDays[idx] === "sa" ? 0 : idx + 1;
    }
  }

  getDate(year: number, month: number, day: number): Date {
    // Creates a date object from given year, month and day
    return new Date(year, month - 1, day, 0, 0, 0, 0);
  }

  monthStartIdx(month: number, year: number): number {
    // Month start index
    let d = new Date();
    d.setDate(1);
    d.setMonth(month - 1);
    d.setFullYear(year);
    let idx = d.getDay() + this.sundayIdx;

    return idx >= 7 ? idx - 7 : idx;
  }

  daysInMonth(month: number, year: number): number {
    // Return number of days of current month
    return new Date(year, month, 0).getDate();
  }

  daysInPrevMonth(month: number, year: number): number {
    // Return number of days of the previous month
    let date: Date = this.getDate(year, month, 1);
    date.setMonth(date.getMonth() - 1);

    return this.daysInMonth(date.getMonth() + 1, date.getFullYear());
  }

  isCurrentDay(day: number, month: number, year: number, cmo: number, today: NgxDate): boolean {
    // Check is a given date the today
    return day === today.day && month === today.month && year === today.year && cmo === this.currentMonthId;
  }

  generateCalendar(month: number, year: number) {
    this.dates.length = 0;

    const today: NgxDate = this.getToday;
    const monthStart: number = this.monthStartIdx(month, year);
    const dayInThisMonth: number = this.daysInMonth(month, year);
    const dayInPrevMonth: number = this.daysInPrevMonth(month, year);
    let dayNbr: number = 1;
    let cmo: number = this.previousMonthId;

    for (let i = 1; i < 7; i++) {
      let week = [];

      if (i === 1) {
        // Previous month
        let pm = dayInPrevMonth - monthStart + 1;
        for (let j = pm; j <= dayInPrevMonth; j++) {
          let date: NgxDate = { year: month === 1 ? year - 1 : year, month: month === 1 ? 12 : month - 1, day: j };
          week.push(
            {
              dateObj: date,
              cmo: cmo,
              currentDay: this.isCurrentDay(j, month, year, cmo, today),
              highlight: this.datePickerService.isHighlightedDate(date, this.options.sunHighlight, true, [])
          });
        }

        // Current month
        cmo = this.currentMonthId;
        let daysLeft: number = 7 - week.length;
        for (let j = 0; j < daysLeft; j++) {
          let date: NgxDate = { year, month, day: dayNbr };
          week.push(
            {
              dateObj: date,
              cmo: cmo,
              currentDay: this.isCurrentDay(dayNbr, month, year, cmo, today),
              highlight: this.datePickerService.isHighlightedDate(date, this.options.sunHighlight, true, [])
            });

          dayNbr++;
        }
      } else {
        // Next month
        for (let j = 1; j < 8; j++) {
          if (dayNbr > dayInThisMonth) {
            dayNbr = 1;
            cmo = this.nextMonthId;
          }

          let date: NgxDate = {
            year: cmo === this.nextMonthId && month === 12 ? year + 1 : year,
            month: cmo === this.currentMonthId ? month : cmo === this.nextMonthId && month < 12 ? month + 1 : 1,
            day: dayNbr
          };
          week.push(
            {
              dateObj: date,
              cmo: cmo,
              currentDay: this.isCurrentDay(dayNbr, month, year, cmo, today),
              highlight: this.datePickerService.isHighlightedDate(date, this.options.sunHighlight, true, [])
            });

          dayNbr++;
        }
      }

      this.dates.push({ week })
    }

    this.cdr.markForCheck();
    console.log(this.dates);
  }

  generateYears() {
    let year = 1970
    for(let j = 0; j <= 70; j++) {
      year += j
      this.years.push(year)
    }
    this.cdr.markForCheck()
    console.log(this.years);
  }

  changeDate(date: Week) {
    console.log(date);
    this.initDate(date.dateObj)
  }

  nextMonth() {
    if (this.activeDate.month === 12) {
      this.activeDate.month = 1;
      this.activeDate.year = this.activeDate.year + 1;
      this.initDate(this.activeDate);

      return;
    } else {
      this.activeDate.month = this.activeDate.month + 1;
      this.initDate(this.activeDate);
    }
  }

  previousMonth() {
    if (this.activeDate.month === 1) {
      this.activeDate.month = 12;
      this.activeDate.year = this.activeDate.year - 1;
      this.initDate(this.activeDate);

      return;
    } else {
      this.activeDate.month = this.activeDate.month - 1;
      this.initDate(this.activeDate);
    }
  }
}
