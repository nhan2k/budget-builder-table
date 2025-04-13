/**
 * BudgetBuilderComponent
 *
 * The main component that renders the budget table and handles user interactions.
 * It provides a tabular interface for viewing and editing budget data, with features
 * for keyboard navigation, input validation, and dynamic category management.
 */
import { CommonModule } from '@angular/common';
import {
  Component,
  computed,
  ElementRef,
  HostListener,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoryGroup, ContextMenuPosition } from '../../models/budget.model';
import { BudgetService } from '../../services/budget.service';
import { ContextMenuComponent } from '../context-menu/context-menu.component';

@Component({
  selector: 'app-budget-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ContextMenuComponent],
  templateUrl: './budget-builder.component.html',
})
export class BudgetBuilderComponent implements OnInit {
  @ViewChild('newCategoryInput') newCategoryInput?: ElementRef;

  selectedCell = signal<string | null>(null);
  activeRowIndex = signal<number>(-1);
  activeColIndex = signal<number>(-1);
  editingNewCategory = signal<string | null>(null);

  showContextMenu = signal(false);
  contextMenuPosition = signal<ContextMenuPosition>({
    top: 0,
    left: 0,
    cellId: '',
    value: 0,
  });

  newCategoryName = signal('');
  newCategoryGroupName = signal('');

  months = computed(() => this.budgetService.months());
  budgetData = computed(() => this.budgetService.budgetData());
  monthlyBalances = computed(() => this.budgetService.monthlyBalances());

  constructor(public budgetService: BudgetService) {}

  ngOnInit() {
    setTimeout(() => {
      const grid = this.buildNavigationGrid();
      if (grid.length > 0 && grid[0].length > 0) {
        this.focusCellByIndex(0, 0);
      }
    }, 100);
  }

  /**
   * Builds a grid representation of all input cells in the table
   * This is used for keyboard navigation between cells
   * @returns A 2D array of input elements organized by row and column
   */
  private buildNavigationGrid(): { element: HTMLInputElement; id: string }[][] {
    const grid: { element: HTMLInputElement; id: string }[][] = [];
    const inputs = document.querySelectorAll('table input[type="number"]');
    let currentRow: { element: HTMLInputElement; id: string }[] = [];
    let lastRowId = '';

    inputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;
      const id = inputElement.id;
      const lastDashIndex = id.lastIndexOf('-');
      const rowId = id.substring(0, lastDashIndex);

      if (lastRowId && rowId !== lastRowId) {
        grid.push([...currentRow]);
        currentRow = [];
      }

      currentRow.push({ element: inputElement, id });
      lastRowId = rowId;
    });

    if (currentRow.length > 0) {
      grid.push(currentRow);
    }

    return grid;
  }

  focusCellByIndex(rowIndex: number, colIndex: number) {
    const grid = this.buildNavigationGrid();

    if (
      rowIndex >= 0 &&
      rowIndex < grid.length &&
      colIndex >= 0 &&
      colIndex < grid[rowIndex].length
    ) {
      const cell = grid[rowIndex][colIndex];
      this.selectedCell.set(cell.id);
      this.activeRowIndex.set(rowIndex);
      this.activeColIndex.set(colIndex);

      cell.element.focus();
      cell.element.select();

      return true;
    }

    return false;
  }

  focusCellById(id: string) {
    const grid = this.buildNavigationGrid();

    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
        if (grid[rowIndex][colIndex].id === id) {
          return this.focusCellByIndex(rowIndex, colIndex);
        }
      }
    }

    return false;
  }

  focusCellByElement(element: HTMLInputElement) {
    return this.focusCellById(element.id);
  }

  /**
   * Navigates to an adjacent cell in the specified direction
   * @param direction - The direction to navigate (up, down, left, right)
   * @returns True if navigation was successful, false otherwise
   */
  navigateToAdjacentCell(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const grid = this.buildNavigationGrid();
    const rowIndex = this.activeRowIndex();
    const colIndex = this.activeColIndex();

    if (rowIndex === -1 || colIndex === -1) {
      if (grid.length > 0 && grid[0].length > 0) {
        return this.focusCellByIndex(0, 0);
      }
      return false;
    }

    let targetRow = rowIndex;
    let targetCol = colIndex;

    switch (direction) {
      case 'up':
        targetRow = Math.max(0, rowIndex - 1);
        break;
      case 'down':
        targetRow = Math.min(grid.length - 1, rowIndex + 1);
        break;
      case 'left':
        targetCol = Math.max(0, colIndex - 1);
        break;
      case 'right':
        targetCol = Math.min(grid[rowIndex].length - 1, colIndex + 1);
        break;
    }

    if (targetRow !== rowIndex || targetCol !== colIndex) {
      return this.focusCellByIndex(targetRow, targetCol);
    }

    return false;
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (!this.selectedCell()) return;

    if (
      event.key === 'ArrowUp' ||
      event.key === 'ArrowDown' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight'
    ) {
      event.preventDefault();

      const direction = event.key.replace('Arrow', '').toLowerCase() as
        | 'up'
        | 'down'
        | 'left'
        | 'right';

      this.navigateToAdjacentCell(direction);
    }

    if (event.key === 'Tab') {
      event.preventDefault();
      const direction = event.shiftKey ? 'left' : 'right';
      let success = this.navigateToAdjacentCell(direction);

      if (!success) {
        if (direction === 'right') {
          const currentRow = this.activeRowIndex();
          const grid = this.buildNavigationGrid();

          if (currentRow < grid.length - 1) {
            this.focusCellByIndex(currentRow + 1, 0);
          }
        } else if (direction === 'left') {
          const currentRow = this.activeRowIndex();
          const grid = this.buildNavigationGrid();

          if (currentRow > 0 && grid[currentRow - 1].length > 0) {
            this.focusCellByIndex(
              currentRow - 1,
              grid[currentRow - 1].length - 1
            );
          }
        }
      }
    }

    if (event.key === 'Enter' && !event.shiftKey) {
      if (this.editingNewCategory()) {
        return;
      }

      const cellParts = this.selectedCell()!.split('-');
      const sectionId = cellParts[0];
      const groupId = cellParts[1];

      this.editingNewCategory.set(`${sectionId}-${groupId}`);
      this.newCategoryName.set('');

      setTimeout(() => {
        if (this.newCategoryInput) {
          this.newCategoryInput.nativeElement.focus();
        }
      }, 0);

      event.preventDefault();
    }
  }

  onCellRightClick(
    event: MouseEvent,
    sectionId: string,
    groupId: string,
    subCategoryId: string,
    month: string,
    value: number
  ) {
    event.preventDefault();
    event.stopPropagation();

    const cellId = `${sectionId}-${groupId}-${subCategoryId}-${month}`;

    this.contextMenuPosition.set({
      top: event.clientY,
      left: event.clientX,
      cellId,
      value,
    });

    this.showContextMenu.set(true);
  }

  onApplyToAll(position: ContextMenuPosition) {
    const [sectionId, groupId, subCategoryId] = position.cellId.split('-');
    this.budgetService.applyValueToAllMonths(
      sectionId,
      groupId,
      subCategoryId,
      position.value
    );
    this.closeContextMenu();
  }

  closeContextMenu() {
    this.showContextMenu.set(false);
  }

  updateCellValue(
    sectionId: string,
    groupId: string,
    subCategoryId: string,
    month: string,
    event: Event
  ) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;
    this.budgetService.updateCellValue(
      sectionId,
      groupId,
      subCategoryId,
      month,
      value
    );
  }

  addNewCategory(sectionId: string, groupId: string) {
    if (this.newCategoryName().trim()) {
      this.budgetService.addNewSubCategory(
        sectionId,
        groupId,
        this.newCategoryName().trim()
      );
      this.editingNewCategory.set(null);
    }
  }

  cancelAddCategory() {
    this.editingNewCategory.set(null);
  }

  addNewCategoryGroup(sectionId: string) {
    if (this.newCategoryGroupName().trim()) {
      this.budgetService.addNewCategoryGroup(
        sectionId,
        this.newCategoryGroupName().trim()
      );
      this.newCategoryGroupName.set('');
    }
  }

  deleteSubCategory(sectionId: string, groupId: string, subCategoryId: string) {
    this.budgetService.deleteSubCategory(sectionId, groupId, subCategoryId);
  }

  updateDateRange(event: Event) {
    const form = event.target as HTMLFormElement;
    const startMonthInput = form.elements.namedItem(
      'startMonth'
    ) as HTMLInputElement;
    const endMonthInput = form.elements.namedItem(
      'endMonth'
    ) as HTMLInputElement;

    if (startMonthInput.value && endMonthInput.value) {
      const startMonth = new Date(startMonthInput.value);
      const endMonth = new Date(endMonthInput.value);

      startMonth.setDate(1);
      endMonth.setDate(
        new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0).getDate()
      );

      this.budgetService.updateDateRange(startMonth, endMonth);
    }
  }

  getMonthInputValue(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${year}-${month}`;
  }

  getCategoryGroupSubTotal(group: CategoryGroup, month: string): number {
    return this.budgetService.getCategoryGroupTotal(group, month);
  }

  getSectionSubTotal(sectionId: string, month: string): number {
    const section =
      sectionId === 'income'
        ? this.budgetData().income
        : this.budgetData().expenses;
    return this.budgetService.getSectionTotal(section, month);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }

  /**
   * Validates number input to prevent negative values and invalid characters
   * @param event - The keyboard event to validate
   */
  validateNumberInput(event: KeyboardEvent) {
    const invalidChars = ['e', 'E', '-'];
    if (invalidChars.includes(event.key)) {
      event.preventDefault();
    }
  }

  /**
   * Handles paste events to sanitize pasted content
   * Removes invalid characters like 'e', 'E', and '-' from pasted text
   * @param event - The clipboard event to handle
   */
  handlePaste(event: ClipboardEvent) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    const pastedText = clipboardData.getData('text');

    if (/[eE-]/.test(pastedText)) {
      event.preventDefault();

      const sanitizedText = pastedText.replace(/[eE-]/g, '');
      const input = event.target as HTMLInputElement;

      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;

      const currentValue = input.value;
      input.value =
        currentValue.substring(0, start) +
        sanitizedText +
        currentValue.substring(end);

      input.selectionStart = input.selectionEnd = start + sanitizedText.length;

      input.dispatchEvent(new Event('input'));
    }
  }
}
