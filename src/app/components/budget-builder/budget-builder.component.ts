// budget-builder.component.ts

import {
  Component,
  signal,
  computed,
  HostListener,
  ViewChild,
  ElementRef,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { BudgetService } from '../../services/budget.service';
import {
  CategoryGroup,
  ContextMenuPosition,
  SubCategory,
} from '../../models/budget.model';
import { ContextMenuComponent } from '../context-menu/context-menu.component';

@Component({
  selector: 'app-budget-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ContextMenuComponent],
  templateUrl: './budget-builder.component.html',
})
export class BudgetBuilderComponent implements OnInit {
  @ViewChild('newCategoryInput') newCategoryInput?: ElementRef;

  // For focused cell tracking
  selectedCell = signal<string | null>(null);
  activeRowIndex = signal<number>(-1);
  activeColIndex = signal<number>(-1);
  editingNewCategory = signal<string | null>(null);

  // For context menu
  showContextMenu = signal(false);
  contextMenuPosition = signal<ContextMenuPosition>({
    top: 0,
    left: 0,
    cellId: '',
    value: 0,
  });

  // New category inputs
  newCategoryName = signal('');
  newCategoryGroupName = signal('');

  // Computed properties
  months = computed(() => this.budgetService.months());
  budgetData = computed(() => this.budgetService.budgetData());
  monthlyBalances = computed(() => this.budgetService.monthlyBalances());

  constructor(public budgetService: BudgetService) {}

  ngOnInit() {
    // Set focus to the first cell when the component is initialized
    setTimeout(() => {
      // Find the first input cell and focus it
      const grid = this.buildNavigationGrid();
      if (grid.length > 0 && grid[0].length > 0) {
        this.focusCellByIndex(0, 0);
      }
    }, 100);
  }

  // Build a navigation grid of all input cells
  private buildNavigationGrid(): { element: HTMLInputElement; id: string }[][] {
    const grid: { element: HTMLInputElement; id: string }[][] = [];

    // Get all input elements in the table
    const inputs = document.querySelectorAll('table input[type="number"]');

    // Group inputs by row
    let currentRow: { element: HTMLInputElement; id: string }[] = [];
    let lastRowId = '';

    inputs.forEach((input) => {
      const inputElement = input as HTMLInputElement;
      const id = inputElement.id;

      // Extract row identifier (everything before the last dash)
      const lastDashIndex = id.lastIndexOf('-');
      const rowId = id.substring(0, lastDashIndex);

      // If we're starting a new row, push the current row to the grid
      if (lastRowId && rowId !== lastRowId) {
        grid.push([...currentRow]);
        currentRow = [];
      }

      currentRow.push({ element: inputElement, id });
      lastRowId = rowId;
    });

    // Add the last row
    if (currentRow.length > 0) {
      grid.push(currentRow);
    }

    return grid;
  }

  // Focus a specific cell by row and column index
  focusCellByIndex(rowIndex: number, colIndex: number) {
    const grid = this.buildNavigationGrid();

    // Ensure indices are within bounds
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

      // Focus and select the input
      cell.element.focus();
      cell.element.select();

      return true;
    }

    return false;
  }

  // Focus a specific cell by ID
  focusCellById(id: string) {
    const grid = this.buildNavigationGrid();

    // Find the cell in the grid
    for (let rowIndex = 0; rowIndex < grid.length; rowIndex++) {
      for (let colIndex = 0; colIndex < grid[rowIndex].length; colIndex++) {
        if (grid[rowIndex][colIndex].id === id) {
          return this.focusCellByIndex(rowIndex, colIndex);
        }
      }
    }

    return false;
  }

  // Focus cell by element reference
  focusCellByElement(element: HTMLInputElement) {
    return this.focusCellById(element.id);
  }

  // Navigate to adjacent cell
  navigateToAdjacentCell(direction: 'up' | 'down' | 'left' | 'right'): boolean {
    const grid = this.buildNavigationGrid();
    const rowIndex = this.activeRowIndex();
    const colIndex = this.activeColIndex();

    if (rowIndex === -1 || colIndex === -1) {
      // If no cell is currently focused, focus the first cell
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

    // Only focus if we're actually moving to a different cell
    if (targetRow !== rowIndex || targetCol !== colIndex) {
      return this.focusCellByIndex(targetRow, targetCol);
    }

    return false;
  }

  @HostListener('keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    // Only handle events if a cell is selected
    if (!this.selectedCell()) return;

    // Handle arrow navigation
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

    // Handle Tab key for moving to the next cell
    if (event.key === 'Tab') {
      event.preventDefault();
      const direction = event.shiftKey ? 'left' : 'right';

      // Try to navigate in the specified direction
      let success = this.navigateToAdjacentCell(direction);

      // If we couldn't navigate in that direction (at the edge of a row)
      if (!success) {
        // If at the end of a row, move to the next row's first cell
        if (direction === 'right') {
          const currentRow = this.activeRowIndex();
          const grid = this.buildNavigationGrid();

          if (currentRow < grid.length - 1) {
            this.focusCellByIndex(currentRow + 1, 0);
          }
        }
        // If at the beginning of a row, move to the previous row's last cell
        else if (direction === 'left') {
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

    // Handle Enter key for adding a new category
    if (event.key === 'Enter' && !event.shiftKey) {
      if (this.editingNewCategory()) {
        // If we're already editing a new category, finish that first
        return;
      }

      // Get current cell identifiers
      const cellParts = this.selectedCell()!.split('-');
      const sectionId = cellParts[0];
      const groupId = cellParts[1];

      // Show the new category input for this group
      this.editingNewCategory.set(`${sectionId}-${groupId}`);
      this.newCategoryName.set('');

      // Focus the input field after it's rendered
      setTimeout(() => {
        if (this.newCategoryInput) {
          this.newCategoryInput.nativeElement.focus();
        }
      }, 0);

      event.preventDefault();
    }
  }

  // Context menu methods
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
  }

  closeContextMenu() {
    this.showContextMenu.set(false);
  }

  // Cell update methods
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

  // Update the group header value directly
  updateGroupHeaderValue(group: CategoryGroup, month: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value) || 0;

    // Update the group value directly without affecting subcategories
    if (group.id === 'general-income') {
      this.budgetService.updateGroupValue('income', group.id, month, value);
    }
  }

  // Add new category/group methods
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

  // Delete row method
  deleteSubCategory(sectionId: string, groupId: string, subCategoryId: string) {
    this.budgetService.deleteSubCategory(sectionId, groupId, subCategoryId);
  }

  // Date range methods
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

      // Set the day to the first day of the month for start and last day for end
      startMonth.setDate(1);
      endMonth.setDate(
        new Date(endMonth.getFullYear(), endMonth.getMonth() + 1, 0).getDate()
      );

      this.budgetService.updateDateRange(startMonth, endMonth);
    }
  }

  // Helper methods
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
}
