import { CommonModule } from '@angular/common';
import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { ContextMenuPosition } from '../../models/budget.model';

@Component({
  selector: 'app-context-menu',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './context-menu.component.html',
})
export class ContextMenuComponent implements OnInit, OnDestroy {
  @Input() position!: ContextMenuPosition;
  @Input() isVisible: boolean = false;
  @Output() apply = new EventEmitter<ContextMenuPosition>();
  @Output() close = new EventEmitter<void>();

  private clickHandler: (event: MouseEvent) => void;

  constructor(private elementRef: ElementRef) {
    this.clickHandler = this.handleClickOutside.bind(this);
  }

  ngOnInit() {
    document.addEventListener('click', this.clickHandler);
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.clickHandler);
  }

  private handleClickOutside(event: MouseEvent) {
    if (
      this.isVisible &&
      !this.elementRef.nativeElement.contains(event.target as Node)
    ) {
      this.close.emit();
    }
  }

  applyToAll() {
    this.apply.emit(this.position);
    this.close.emit();
  }
}
