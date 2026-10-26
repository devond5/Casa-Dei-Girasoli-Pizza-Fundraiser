import { Component, signal } from '@angular/core';
import { PizzaFormComponent } from './pizza-form-component/pizza-form-component';

@Component({
  selector: 'app-root',
  imports: [PizzaFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('casa-dei-girasoli-pizza-fundraiser');
}
