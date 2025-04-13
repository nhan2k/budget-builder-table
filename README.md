# Budget Builder Table

A dynamic, interactive budget planning application built with Angular that allows users to create, manage, and visualize budget data in a tabular format.

## Overview

Budget Builder Table is a web application that provides an intuitive interface for financial planning. It allows users to:

- Create and manage income and expense categories
- Enter budget values for different months
- Navigate through the table using keyboard shortcuts
- View monthly balances and totals
- Customize the budget structure with new categories and subcategories

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.1.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Features

### Dynamic Budget Table

- **Category Groups**: Organize budget items into logical groups (Primary Income, Other Income, Fixed Expenses, etc.)
- **Subcategories**: Each group contains subcategories for detailed budget tracking
- **Monthly View**: Enter and view budget data across multiple months
- **Automatic Calculations**: Subtotals and balances are calculated automatically

### User Interface

- **Keyboard Navigation**: Navigate through cells using arrow keys and tab
- **Input Validation**: Prevents negative values and invalid characters
- **Context Menu**: Right-click on cells for additional options
- **Responsive Design**: Works on different screen sizes

### Data Management

- **Date Range Selection**: Set custom start and end dates for your budget period
- **Add/Remove Categories**: Customize your budget structure
- **Real-time Updates**: All calculations update instantly when values change

## Technical Implementation

### Architecture

The application follows Angular's component-based architecture:

- **Components**: Encapsulate UI elements and their behavior
- **Services**: Handle data management and business logic
- **Models**: Define data structures used throughout the application
- **Signals**: Manage state and reactivity

### Key Components

#### BudgetBuilderComponent

The main component that renders the budget table and handles user interactions:

- Displays the budget data in a tabular format
- Manages keyboard navigation between cells
- Handles input validation and updates
- Provides UI for adding new categories and subcategories

#### BudgetService

Manages the budget data and provides methods for manipulating it:

- Initializes the budget structure
- Updates cell values
- Calculates totals and balances
- Adds and removes categories and subcategories

### Data Model

The budget data is structured as follows:

```typescript
interface Budget {
  startMonth: Date;
  endMonth: Date;
  income: BudgetSection;
  expenses: BudgetSection;
}

interface BudgetSection {
  id: string;
  name: string;
  categoryGroups: CategoryGroup[];
}

interface CategoryGroup {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

interface SubCategory {
  id: string;
  name: string;
  values: Record<string, number>;
  isNew?: boolean;
}
```

### Key Features Implementation

#### Keyboard Navigation

The application implements a grid-based navigation system that allows users to move between cells using arrow keys:

```typescript
navigateToAdjacentCell(direction: 'up' | 'down' | 'left' | 'right'): boolean {
  const grid = this.buildNavigationGrid();
  const rowIndex = this.activeRowIndex();
  const colIndex = this.activeColIndex();

  // Implementation details...

  return this.focusCellByIndex(targetRow, targetCol);
}
```

#### Input Validation

All number inputs are validated to prevent negative values and invalid characters:

```typescript
validateNumberInput(event: KeyboardEvent) {
  const invalidChars = ['e', 'E', '-'];
  if (invalidChars.includes(event.key)) {
    event.preventDefault();
  }
}

handlePaste(event: ClipboardEvent) {
  // Implementation to sanitize pasted content
}
```

#### Automatic Calculations

The application automatically calculates subtotals and balances whenever values change:

```typescript
calculateBalances() {
  const budget = this.budgetData();
  const balances: Record<string, number> = {};

  this.months().forEach(month => {
    const incomeTotal = this.getSectionTotal(budget.income, month);
    const expensesTotal = this.getSectionTotal(budget.expenses, month);
    balances[month] = incomeTotal - expensesTotal;
  });

  this.monthlyBalances.set(balances);
}
```

## User Guide

### Navigation

- **Arrow Keys**: Move between cells
- **Tab/Shift+Tab**: Move to the next/previous cell
- **Enter**: Add a new subcategory to the current group

### Entering Data

1. Click on a cell or navigate to it using keyboard
2. Enter a numeric value (negative values and the letter 'e' are not allowed)
3. Press Enter or Tab to confirm and move to the next cell

### Adding Categories

1. Navigate to any cell in the desired category group
2. Press Enter to open the new subcategory input
3. Enter the name of the new subcategory
4. Press Enter to confirm or Escape to cancel

### Setting Date Range

1. Use the date range selector at the top of the page
2. Select start and end months
3. Click "Update" to apply the new date range

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
