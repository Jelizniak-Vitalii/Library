import { Component } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  control = new FormControl({ year: 2022, month: 10, day: 30 });
  lang = 'uk'
  dateFormat = 'yyyy-mm-dd'
  // control = '02.22.2000';
  title = 'library';
}
