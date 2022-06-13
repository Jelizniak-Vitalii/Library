export enum MonthId {
  prev = 1,
  curr = 2,
  next = 3
}

export interface DateFormat {
  value: string;
  format: string;
}

export interface NgxDate {
  year: number;
  month: number;
  day: number;
}

export interface DatesList {
  week: Week[];
}

export interface Week {
  cmo: number;
  currentDay: boolean;
  dateObj: NgxDate;
  highlight: boolean;
}
