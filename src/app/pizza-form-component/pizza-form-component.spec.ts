import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PizzaFormComponent } from './pizza-form-component';

describe('PizzaFormComponent', () => {
  let component: PizzaFormComponent;
  let fixture: ComponentFixture<PizzaFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PizzaFormComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PizzaFormComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
