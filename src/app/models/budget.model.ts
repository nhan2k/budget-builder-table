/**
 * Data models for the budget application
 * These interfaces define the structure of the budget data
 */

/**
 * Represents a subcategory within a category group
 * Contains values for each month in the budget period
 */
export interface SubCategory {
  id: string;
  name: string;
  values: Record<string, number>;
  isNew?: boolean;
}

/**
 * Represents a category group that contains multiple subcategories
 */
export interface CategoryGroup {
  id: string;
  name: string;
  subCategories: SubCategory[];
}

/**
 * Represents a section of the budget (income or expenses)
 * Contains multiple category groups
 */
export interface BudgetSection {
  id: string;
  name: string;
  categoryGroups: CategoryGroup[];
}

/**
 * Represents the complete budget data structure
 * Contains income and expenses sections, date range, and opening balance
 */
export interface BudgetData {
  startMonth: Date;
  endMonth: Date;
  income: BudgetSection;
  expenses: BudgetSection;
  openingBalance: number;
}

/**
 * Represents the balance for a specific month
 * Includes opening balance, income, expenses, profit, and closing balance
 */
export interface MonthlyBalance {
  month: string;
  openingBalance: number;
  income: number;
  expenses: number;
  profit: number;
  closingBalance: number;
}

/**
 * Represents the position and context of the right-click context menu
 */
export interface ContextMenuPosition {
  top: number;
  left: number;
  cellId: string;
  value: number;
}
