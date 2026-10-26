import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import emailjs from '@emailjs/browser'; // <-- 1. Import EmailJS

interface PizzaDateOption {
  date: string;
  display: string;
  selected: boolean;
  slices: number;
}

@Component({
  selector: 'app-pizza-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './pizza-form-component.html',
  styleUrls: ['./pizza-form-component.scss'],
})
export class PizzaFormComponent implements OnInit {
  orderForm: FormGroup;
  isSubmitted = false;
  submittedData: any = null;
  isSubmitting = false; // Loading state

  classList: string[] = [
    'Primary 1 (Ms. NoElle and Ms. Aimee)',
    'Primary 2 (Ms. Nila and Ms. Avery)',
    'Lower El (Ms. Rissa)',
  ];

  pizzaDates: PizzaDateOption[] = [
    { date: '2026-11-04', display: 'Wed, Nov 4, 2026', selected: false, slices: 1 },
    { date: '2026-11-11', display: 'Wed, Nov 11, 2026 (Veterans Day)', selected: false, slices: 1 },
    { date: '2026-11-18', display: 'Wed, Nov 18, 2026', selected: false, slices: 1 },
    { date: '2026-12-02', display: 'Wed, Dec 2, 2026', selected: false, slices: 1 },
    { date: '2026-12-09', display: 'Wed, Dec 9, 2026', selected: false, slices: 1 },
    { date: '2026-12-16', display: 'Wed, Dec 16, 2026', selected: false, slices: 1 },
  ];

  constructor(
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
  ) {
    this.orderForm = this.fb.group({
      parentFirstName: ['', Validators.required],
      parentLastName: ['', Validators.required],
      parentEmail: ['', [Validators.required, Validators.email]],
      parentPhone: ['', [Validators.required, Validators.minLength(14)]],
      studentFirstName: ['', Validators.required],
      studentLastName: ['', Validators.required],
      studentClass: ['', Validators.required],
    });

    emailjs.init('uPrASEZVKK_WCF0w7');
  }

  ngOnInit() {
    this.orderForm.get('parentPhone')?.valueChanges.subscribe((value) => {
      if (!value) return;
      const formatted = this.formatUSPhoneNumber(value);
      if (formatted !== value) {
        this.orderForm.get('parentPhone')?.setValue(formatted, { emitEvent: false });
      }
    });
  }

  formatUSPhoneNumber(value: string): string {
    const numbers = value.replace(/\D/g, '').substring(0, 10);
    if (numbers.length === 0) return '';
    if (numbers.length <= 3) return `(${numbers}`;
    if (numbers.length <= 6) return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  get totalCost(): number {
    return this.pizzaDates.reduce((sum, item) => {
      if (!item.selected) return sum;
      return sum + (item.slices === 2 ? 6 : 4);
    }, 0);
  }

  get selectedCount(): number {
    return this.pizzaDates.filter((d) => d.selected).length;
  }

  onSubmit() {
    if (this.orderForm.invalid || this.selectedCount === 0) {
      alert('Please fill out all required fields and select at least one Wednesday pizza date.');
      return;
    }

    this.isSubmitting = true;
    const formValues = this.orderForm.value;
    const selectedDatesList = this.pizzaDates.filter((d) => d.selected);

    // Format the order summary nicely for the email template body
    const formattedSummary = selectedDatesList
      .map(
        (d) =>
          `• ${d.display} &mdash; <strong>${d.slices} slice(s)</strong> ($${d.slices === 2 ? 6 : 4})`,
      )
      .join('<br>');

    const venmoNote = `${formValues.parentFirstName} ${formValues.parentLastName}, ${formValues.studentFirstName} ${formValues.studentLastName} - Pizza fundraiser`;

    // 2. Prepare parameters matching your EmailJS template variables
    const templateParams = {
      parent_name: `${formValues.parentFirstName} ${formValues.parentLastName}`,
      parent_email: formValues.parentEmail,
      student_name: `${formValues.studentFirstName} ${formValues.studentLastName}`,
      student_class: formValues.studentClass,
      parent_phone: formValues.parentPhone,
      order_summary: formattedSummary,
      total_cost: `$${this.totalCost}`,
      venmo_note: venmoNote,
    };

    // 3. Send via EmailJS (Replace with your actual Service ID, Template ID, and Public Key)
    emailjs
      .send('service_cgfvbyc', 'template_ojgc687', templateParams, 'uPrASEZVKK_WCF0w7')
      .then(() => {
        this.submittedData = {
          ...formValues,
          dates: selectedDatesList,
          total: this.totalCost,
          venmoNote,
        };
        this.isSubmitting = false;
        this.isSubmitted = true;
        this.updateSpreadsheet(templateParams);
        this.cdr.detectChanges();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((error) => {
        console.error('Email sending failed:', error);
        alert('There was an error submitting your order. Please try again.');
        this.cdr.detectChanges();
        this.isSubmitting = false;
      });
  }
  updateSpreadsheet(templateParams: any) {
    // Add your Google Apps Script Web App URL here
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzl2VFop4j-qqYRWYJd_0dyNMYcMniyesMNGGx1PQA0tv-IaPC6p3Jv_Y5mke8PG4mi/exec';

    // Inside your emailjs .then() success block, add this fetch call:
    const sheetData = {
      parent_name: templateParams.parent_name,
      parent_email: templateParams.parent_email,
      student_name: templateParams.student_name,
      student_class: templateParams.student_class,
      parent_phone: templateParams.parent_phone,
      total_cost: templateParams.total_cost,
    };

    // Send data to Google Sheets in the background
    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', // Bypasses CORS restrictions for background logging
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sheetData),
    }).catch((err) => console.error('Sheet logging error:', err));
  }

  resetForm() {
    this.orderForm.reset();
    this.pizzaDates.forEach((d) => {
      d.selected = false;
      d.slices = 1;
    });
    this.isSubmitted = false;
    this.submittedData = null;
  }

  toggleDate(option: PizzaDateOption) {
    option.selected = !option.selected;
    if (option.selected) {
      option.slices = 1;
    }
  }

  updateSlices(option: PizzaDateOption, event: Event) {
    const select = event.target as HTMLSelectElement;
    option.slices = parseInt(select.value, 10);
  }
}
