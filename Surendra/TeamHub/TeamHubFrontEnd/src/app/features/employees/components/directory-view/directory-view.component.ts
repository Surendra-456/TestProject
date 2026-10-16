import { CommonModule } from '@angular/common';
import { Component, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';

import { DirectoryControlsComponent, EmployeeSearchField } from '../directory-controls/directory-controls.component';
import { ResultsHeaderComponent } from '../results-header/results-header.component';
import { Employee } from '../../models/employee.model';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../shared/services/toast.service';

@Component({
  selector: 'app-directory-view',
  standalone: true,
  imports: [CommonModule, DirectoryControlsComponent, ResultsHeaderComponent, PaginationComponent],
  templateUrl: './directory-view.component.html',
  styleUrl: './directory-view.component.css'
})
export class DirectoryViewComponent {
  private readonly toastService = inject(ToastService);
  @Input() employees: Employee[] = [];
  @Input() tableLayout = false;
  @Input() readOnlyHome = false;
  @Input() showAddButton = true;
  @Input() isLoading = false;
  @Input() pageNumber = 1;
  @Input() pageSize = 10;
  @Input() totalCount = 0;
  @Input() searchTerm = '';
  @Input() searchField: EmployeeSearchField = 'all';
  @Output() pageChange = new EventEmitter<number>();
  @Output() pageSizeChange = new EventEmitter<number>();
  @Output() searchTermChange = new EventEmitter<string>();
  @Output() searchFieldChange = new EventEmitter<EmployeeSearchField>();
  @Output() editEmployee = new EventEmitter<number>();
  @Output() releaseEmployee = new EventEmitter<number>();
  @Output() viewEmployeeHierarchy = new EventEmitter<number>();
  @Output() viewEmployeeDetails = new EventEmitter<number>();
  openMenuEmployeeId: number | null = null;

  toggleActionMenu(employeeId: number, event: MouseEvent): void {
    event.stopPropagation();
    this.openMenuEmployeeId = this.openMenuEmployeeId === employeeId ? null : employeeId;
  }

  edit(employeeId: number): void {
    this.openMenuEmployeeId = null;
    this.editEmployee.emit(employeeId);
  }

  release(employeeId: number): void {
    this.openMenuEmployeeId = null;
    const employee = this.employees.find((item) => item.id === employeeId);
    const employeeName = employee?.name ?? 'this employee';
    this.toastService.confirm(
      `Release ${employeeName}? This will mark the employee inactive.`,
      () => this.releaseEmployee.emit(employeeId),
      'Release'
    );
  }

  showHierarchy(employeeId: number): void {
    this.openMenuEmployeeId = null;
    this.viewEmployeeHierarchy.emit(employeeId);
  }

  showDetails(employeeId: number): void {
    this.viewEmployeeDetails.emit(employeeId);
  }

  @HostListener('document:click')
  closeActionMenu(): void {
    this.openMenuEmployeeId = null;
  }

}
