import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { PizzaFormComponent } from './pizza-form-component/pizza-form-component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, PizzaFormComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('casa-dei-girasoli-pizza-fundraiser');
}
