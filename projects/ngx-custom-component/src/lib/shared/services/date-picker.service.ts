import { Injectable } from '@angular/core';
import { NgxDate, MonthLabels } from '../models';

const M = "m";
const MM = "mm";
const MMM = "mmm";
const D = "d";
const DD = "dd";
const YYYY = "yyyy";

@Injectable()
export class DatePickerService {
  weekDays: Array<string> = ["su", "mo", "tu", "we", "th", "fr", "sa"];

  getDayNumber(date: NgxDate): number {
    return new Date(date.year, date.month - 1, date.day, 0, 0, 0, 0).getDay();
  }

  isHighlightedDate(date: NgxDate, sunHighlight: boolean, satHighlight: boolean, highlightDates: Array<NgxDate>): boolean {
    let dayNbr: number = this.getDayNumber(date);
    if (sunHighlight && dayNbr === 0 || satHighlight && dayNbr === 6) {
      return true;
    }
    for (let d of highlightDates) {
      if (d.year === date.year && d.month === date.month && d.day === date.day) {
        return true;
      }
    }
    return false;
  }

  getWeekDays(): Array<string> {
    return this.weekDays;
  }

  preZero(val: number): string {
    return val < 10 ? "0" + val : String(val);
  }

  formatDate(date: NgxDate, dateFormat: string, monthLabels: MonthLabels): string {
    let formatted: string = dateFormat.replace(YYYY, String(date.year));

    if (dateFormat.indexOf(MMM) !== -1) {
      formatted = formatted.replace(MMM, monthLabels[date.month]);
    }
    else if (dateFormat.indexOf(MM) !== -1) {
      formatted = formatted.replace(MM, this.preZero(date.month));
    }
    else {
      formatted = formatted.replace(M, String(date.month));
    }

    if (dateFormat.indexOf(DD) !== -1) {
      formatted = formatted.replace(DD, this.preZero(date.day));
    }
    else {
      formatted = formatted.replace(D, String(date.day));
    }
    return formatted;
  }

  parseDate(date: NgxDate) {
    if (date) {
      return { year: date.year, month: date.month, day: date.day };
    } else {
      const dateObj = new Date();

      return { year: dateObj.getFullYear(), month: dateObj.getMonth() + 1, day: dateObj.getDate() };
    }
  }
}
