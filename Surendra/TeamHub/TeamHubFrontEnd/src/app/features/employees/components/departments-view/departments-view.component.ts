import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';

import { Department } from '../../models/employee-master.model';
import { Employee } from '../../models/employee.model';
import { EmployeeService } from '../../services/employee.service';
import { PaginationComponent } from '../../../../shared/components/pagination/pagination.component';
import { ToastService } from '../../../../shared/services/toast.service';
import { getApiErrorMessage } from '../../../../shared/services/api-error-message';

@Component({
  selector: 'app-departments-view',
  standalone: true,
  imports: [CommonModule, PaginationComponent],
  templateUrl: './departments-view.component.html',
  styleUrl: './departments-view.component.css'
})
export class DepartmentsViewComponent implements OnInit {
  departments: Department[] = [];
  employees: Employee[] = [];
  selectedDepartment: Department | null = null;
  isLoadingDepartments = true;
  isLoadingEmployees = false;
  pageNumber = 1;
  pageSize = 10;
  totalCount = 0;
  private loadRequestId = 0;

  constructor(
    private readonly employeeService: EmployeeService,
    private readonly changeDetectorRef: ChangeDetectorRef,
    private readonly toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.employeeService.getDepartments().subscribe({
      next: (departments) => {
        this.departments = departments;
        this.isLoadingDepartments = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.isLoadingDepartments = false;
        this.toastService.error(getApiErrorMessage(error, 'Could not load departments.'));
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  selectDepartment(department: Department): void {
    this.selectedDepartment = department;
    this.loadEmployees(1, this.pageSize);
  }

  showDepartments(): void {
    this.selectedDepartment = null;
    this.employees = [];
    this.totalCount = 0;
    this.loadRequestId++;
  }

  changePage(pageNumber: number): void {
    this.loadEmployees(pageNumber, this.pageSize);
  }

  changePageSize(pageSize: number): void {
    this.loadEmployees(1, pageSize);
  }

  private loadEmployees(pageNumber: number, pageSize: number): void {
    const departmentId = this.selectedDepartment?.departmentId;
    if (departmentId === undefined) return;

    const requestId = ++this.loadRequestId;
    this.isLoadingEmployees = true;
    this.pageNumber = pageNumber;
    this.pageSize = pageSize;
    this.employeeService.getActiveEmployeesByDepartmentId(departmentId, pageNumber, pageSize).subscribe({
      next: (page) => {
        if (requestId !== this.loadRequestId) return;
        this.employees = page.items;
        this.totalCount = page.totalCount;
        this.isLoadingEmployees = false;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        if (requestId !== this.loadRequestId) return;
        this.isLoadingEmployees = false;
        this.toastService.error(getApiErrorMessage(error, 'Could not load department employees.'));
        this.changeDetectorRef.markForCheck();
      }
    });
  }
}
