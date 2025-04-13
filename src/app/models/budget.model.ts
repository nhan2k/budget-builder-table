export interface SubCategory {
  id: string;
  name: string;
  values: Record<string, number>;
  isNew?: boolean;
}

export interface CategoryGroup {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

export interface BudgetSection {
  id: string;
  name: string;
  categoryGroups: CategoryGroup[];
}

export interface BudgetData {
  startMonth: Date;
  endMonth: Date;
  income: BudgetSection;
  expenses: BudgetSection;
  openingBalance: number;
}

export interface MonthlyBalance {
  month: string;
  openingBalance: number;
  income: number;
  expenses: number;
  profit: number;
  closingBalance: number;
}

export interface ContextMenuPosition {
  top: number;
  left: number;
  cellId: string;
  value: number;
}
