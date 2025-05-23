/**
 * BudgetService
 *
 * This service manages the budget data and provides methods for manipulating it.
 * It handles initialization, updates, calculations, and structural changes to the budget.
 */
import { Injectable, signal } from '@angular/core';
import {
  BudgetData,
  BudgetSection,
  CategoryGroup,
  MonthlyBalance,
  SubCategory,
} from '../models/budget.model';

@Injectable({
  providedIn: 'root',
})
export class BudgetService {
  private monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  budgetData = signal<BudgetData>(this.getInitialBudgetData());
  months = signal<string[]>([]);
  monthlyBalances = signal<MonthlyBalance[]>([]);

  constructor() {
    this.updateMonths();
    this.calculateBalances();
  }

  /**
   * Initializes the budget data structure with default values
   * Creates the initial category groups, subcategories, and date range
   */
  private getInitialBudgetData(): BudgetData {
    const startMonth = new Date(2024, 0, 1);
    const endMonth = new Date(2024, 11, 31);

    return {
      startMonth,
      endMonth,
      income: {
        id: '',
        name: '',
        categoryGroups: [
          {
            id: '',
            name: '',
            subCategories: [
              {
                id: 'general-income',
                name: 'General Income',
                values: this.createEmptyMonthValues(),
              },
              {
                id: 'sales',
                name: 'Sales',
                values: this.createEmptyMonthValues(),
              },
              {
                id: 'commission',
                name: 'Commission',
                values: this.createEmptyMonthValues(),
              },
            ],
          },
          {
            id: 'other-income',
            name: 'Other Income',
            subCategories: [
              {
                id: 'training',
                name: 'Training',
                values: this.createEmptyMonthValues(),
              },
              {
                id: 'consulting',
                name: 'Consulting',
                values: this.createEmptyMonthValues(),
              },
            ],
          },
        ],
      },
      expenses: {
        id: 'expenses',
        name: 'Expenses',
        categoryGroups: [
          {
            id: '',
            name: '',
            subCategories: [
              {
                id: 'operational-expenses',
                name: 'Operational Expenses',
                values: this.createEmptyMonthValues(),
              },
              {
                id: 'management-fees',
                name: 'Management Fees',
                values: this.createEmptyMonthValues(),
              },
              {
                id: 'cloud-hosting',
                name: 'Cloud Hosting',
                values: this.createEmptyMonthValues(),
              },
            ],
          },
          {
            id: 'salaries-wages',
            name: 'Salaries & Wages',
            subCategories: [
              {
                id: 'full-time-dev',
                name: 'Full Time Dev Salaries',
                values: this.createEmptyMonthValues(),
              },
              {
                id: 'part-time-dev',
                name: 'Part Time Dev Salaries',
                values: this.createEmptyMonthValues(),
              },
              {
                id: 'remote-salaries',
                name: 'Remote Salaries',
                values: this.createEmptyMonthValues(),
              },
            ],
          },
        ],
      },
      openingBalance: 0,
    };
  }

  createEmptyMonthValues(): Record<string, number> {
    const values: Record<string, number> = {};

    const budget =
      typeof this.budgetData === 'function'
        ? this.budgetData()
        : this.budgetData;

    const startMonth = budget?.startMonth || new Date(2024, 0, 1);
    const endMonth = budget?.endMonth || new Date(2024, 11, 31);

    let currentDate = new Date(startMonth);
    while (currentDate <= endMonth) {
      const monthKey = this.getMonthKey(currentDate);
      values[monthKey] = 0;
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    return values;
  }

  private getMonthKey(date: Date): string {
    return `${this.monthNames[date.getMonth()]} ${date.getFullYear()}`;
  }

  updateMonths(): void {
    const { startMonth, endMonth } = this.budgetData();
    const months: string[] = [];

    let currentDate = new Date(startMonth);
    while (currentDate <= endMonth) {
      months.push(this.getMonthKey(currentDate));
      currentDate.setMonth(currentDate.getMonth() + 1);
    }

    this.months.set(months);
  }

  addNewSubCategory(sectionId: string, groupId: string, name: string): void {
    const budget = { ...this.budgetData() };
    const section = sectionId === 'income' ? budget.income : budget.expenses;
    const group = section.categoryGroups.find((g) => g.id === groupId);

    if (group) {
      const newId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
      group.subCategories.push({
        id: newId,
        name,
        values: this.createEmptyMonthValues(),
        isNew: true,
      });

      this.budgetData.set(budget);
      this.calculateBalances();
    }
  }

  addNewCategoryGroup(sectionId: string, name: string): void {
    const budget = { ...this.budgetData() };
    const section = sectionId === 'income' ? budget.income : budget.expenses;

    const newId = name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now();
    section.categoryGroups.push({
      id: newId,
      name,
      subCategories: [],
    });

    this.budgetData.set(budget);
  }

  deleteSubCategory(
    sectionId: string,
    groupId: string,
    subCategoryId: string
  ): void {
    const budget = { ...this.budgetData() };
    const section = sectionId === 'income' ? budget.income : budget.expenses;
    const group = section.categoryGroups.find((g) => g.id === groupId);

    if (group) {
      group.subCategories = group.subCategories.filter(
        (sc) => sc.id !== subCategoryId
      );
      this.budgetData.set(budget);
      this.calculateBalances();
    }
  }

  /**
   * Updates the value of a specific cell in the budget table
   * @param sectionId - The ID of the section (income or expenses)
   * @param groupId - The ID of the category group
   * @param subCategoryId - The ID of the subcategory
   * @param month - The month key (e.g., '2024-01')
   * @param value - The new value to set
   */
  updateCellValue(
    sectionId: string,
    groupId: string,
    subCategoryId: string,
    month: string,
    value: number
  ): void {
    const budget = { ...this.budgetData() };
    const section = sectionId === 'income' ? budget.income : budget.expenses;
    const group = section.categoryGroups.find((g) => g.id === groupId);

    if (group) {
      const subCategory = group.subCategories.find(
        (sc) => sc.id === subCategoryId
      );
      if (subCategory) {
        subCategory.values[month] = value;
        this.budgetData.set(budget);
        this.calculateBalances();
      }
    }
  }

  applyValueToAllMonths(
    sectionId: string,
    groupId: string,
    subCategoryId: string,
    value: number
  ): void {
    const budget = { ...this.budgetData() };
    const section = sectionId === 'income' ? budget.income : budget.expenses;
    const group = section.categoryGroups.find((g) => g.id === groupId);

    if (group) {
      const subCategory = group.subCategories.find(
        (sc) => sc.id === subCategoryId
      );
      if (subCategory) {
        for (const month of this.months()) {
          subCategory.values[month] = value;
        }
        this.budgetData.set(budget);
        this.calculateBalances();
      }
    }
  }

  getSubCategoryTotal(subCategory: SubCategory): number {
    return Object.values(subCategory.values).reduce(
      (sum, value) => sum + value,
      0
    );
  }

  getCategoryGroupTotal(group: CategoryGroup, month?: string): number {
    if (month) {
      return group.subCategories.reduce(
        (sum, subCategory) => sum + (subCategory.values[month] || 0),
        0
      );
    } else {
      return group.subCategories.reduce(
        (sum, subCategory) => sum + this.getSubCategoryTotal(subCategory),
        0
      );
    }
  }

  getSectionTotal(section: BudgetSection, month?: string): number {
    if (month) {
      return section.categoryGroups.reduce(
        (sum, group) => sum + this.getCategoryGroupTotal(group, month),
        0
      );
    } else {
      return section.categoryGroups.reduce(
        (sum, group) => sum + this.getCategoryGroupTotal(group),
        0
      );
    }
  }

  updateDateRange(startMonth: Date, endMonth: Date): void {
    const budget = { ...this.budgetData() };
    budget.startMonth = startMonth;
    budget.endMonth = endMonth;

    const updateSection = (section: BudgetSection) => {
      section.categoryGroups.forEach((group) => {
        group.subCategories.forEach((subCategory) => {
          const newValues = this.createEmptyMonthValues();
          for (const [month, value] of Object.entries(subCategory.values)) {
            if (month in newValues) {
              newValues[month] = value;
            }
          }
          subCategory.values = newValues;
        });
      });
    };

    updateSection(budget.income);
    updateSection(budget.expenses);

    this.budgetData.set(budget);
    this.updateMonths();
    this.calculateBalances();
  }

  /**
   * Calculates the monthly balances (income - expenses) for each month
   * Updates the monthlyBalances signal with the new values
   * Tracks opening balance, income, expenses, profit, and closing balance for each month
   */
  calculateBalances(): void {
    const balances: MonthlyBalance[] = [];
    const months = this.months();
    let previousClosingBalance = this.budgetData().openingBalance;

    for (const month of months) {
      const income = this.getSectionTotal(this.budgetData().income, month);
      const expenses = this.getSectionTotal(this.budgetData().expenses, month);
      const profit = income - expenses;
      const closingBalance = previousClosingBalance + profit;

      balances.push({
        month,
        openingBalance: previousClosingBalance,
        income,
        expenses,
        profit,
        closingBalance,
      });

      previousClosingBalance = closingBalance;
    }

    this.monthlyBalances.set(balances);
  }
}
