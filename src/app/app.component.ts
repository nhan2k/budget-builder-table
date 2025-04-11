import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { BudgetBuilderComponent } from './components/budget-builder/budget-builder.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, BudgetBuilderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  title = 'budget-builder-table';
}
