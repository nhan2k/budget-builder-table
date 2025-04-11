import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(private elementRef: ElementRef) {}

  ngOnInit() {
    document.addEventListener('click', this.handleClickOutside.bind(this));
  }

  ngOnDestroy() {
    document.removeEventListener('click', this.handleClickOutside.bind(this));
  }

  handleClickOutside(event: MouseEvent) {
    if (
      this.isVisible &&
      !this.elementRef.nativeElement.contains(event.target)
    ) {
      this.close.emit();
    }
  }

  applyToAll() {
    this.apply.emit(this.position);
    this.close.emit();
  }
}
