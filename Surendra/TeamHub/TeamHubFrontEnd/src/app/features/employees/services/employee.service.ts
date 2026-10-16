import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { EMPTY, expand, map, Observable, reduce, shareReplay } from 'rxjs';

import { Department } from '../models/employee-master.model';
import { Employee } from '../models/employee.model';
import { DepartmentTree } from '../models/organization-tree.model';
import { HttpParams } from '@angular/common/http';
import { PagedResult } from '../../../shared/models/paged-result.model';
import { environment } from '../../../../environments/environment';

interface ApiResponse<T> {
  data: T;
  success: boolean;
  message: string;
}

export interface CreateEmployeeRequest {
  eNumber: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  joinedDate: string;
  email: string;
  alternateEmail: string | null;
  designationId: number;
  departmentId: number;
  jobTypeId: number;
  bloodGroupId: number;
  genderId: number;
  reportsToEmployeeId: number | null;
  leadEmployeeId: number | null;
  stationNumber: string | null;
  recruitmentId: number | null;
  extensionNumber: number;
  citizenshipNumber: string;
  dateOfBirth: string | null;
  panNumber: string;
  lockerNumber: string | null;
  roleId: number;
  teamId: number;
  cotivityEmployeeId: number | null;
  imageBase64: string | null;
  isActive: boolean;
  releaseDate: string | null;
  reasonForRelease: string | null;
  addresses: Array<{
    addressTypeId: number;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    latitude: number;
    longitude: number;
    isPrimary: boolean;
  }>;
  skills: Array<{ skillId: number; skillLevel: number; isPrimary: boolean }>;
  dressSizes: Array<{ dressId: number; dressName: string; size: string; isActive: boolean }>;
}

export interface ReleaseEmployeeRequest {
  releaseDate: string;
  reasonForRelease: string;
}

export interface EmployeeDetails {
  employeeId: number;
  eNumber: number;
  firstName: string;
  middleName: string | null;
  lastName: string;
  joinedDate: string;
  email: string;
  alternateEmail: string | null;
  designationName: string | null;
  departmentName: string | null;
  jobTypeName: string | null;
  bloodGroupName: string | null;
  genderName: string | null;
  reportsToEmployeeName: string | null;
  leadEmployeeName: string | null;
  stationNumber: string | null;
  recruitmentName: string | null;
  extensionNumber: number;
  citizenshipNumber: string;
  dateOfBirth: string | null;
  panNumber: string;
  lockerNumber: string | null;
  roleName: string | null;
  teamName: string | null;
  cotivityEmployeeName: string | null;
  isActive: boolean;
  releaseDate: string | null;
  reasonForRelease: string | null;
  imageBase64: string | null;
  addresses: Array<{
    addressId: number;
    addressTypeName: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    state: string;
    isPrimary: boolean;
  }>;
  skills: Array<{
    employeeSkillId: number;
    skillName: string;
    skillLevel: number;
    isPrimary: boolean;
  }>;
  dressSizes: Array<{
    dressId: number;
    dressName: string;
    size: string;
    isActive: boolean;
  }>;
}

interface EmployeeApiRecord {
  id: number;
  name: string;
  designation: string | null;
  department: string | null;
  teamName: string | null;
  imageBase64: string | null;
}


@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly palette = ['#dbeafe', '#e0e7ff', '#dcfce7', '#fef3c7', '#fce7f3', '#fee2e2', '#ede9fe'];
  private organizationTree$?: Observable<DepartmentTree[]>;
  private readonly apiUrl = `${environment.apiUrl}api/employees`;

  constructor(private readonly http: HttpClient) {}

  getEmployees(
    pageNumber = 1,
    pageSize = 10,
    searchTerm = '',
    searchField: 'all' | 'name' | 'designation' | 'department' = 'all'
  ): Observable<PagedResult<Employee>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('searchTerm', searchTerm)
      .set('searchField', searchField);

    return this.http.get<ApiResponse<PagedResult<EmployeeApiRecord>>>(this.apiUrl, { params }).pipe(
      map((response) => this.mapEmployeePage(response.data))
    );
  }

  getPublicEmployees(
    pageNumber = 1,
    pageSize = 10,
    searchTerm = '',
    searchField: 'all' | 'name' | 'designation' | 'department' = 'all'
  ): Observable<PagedResult<Employee>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize)
      .set('searchTerm', searchTerm)
      .set('searchField', searchField);

    return this.http.get<ApiResponse<PagedResult<EmployeeApiRecord>>>(`${this.apiUrl}/home`, { params }).pipe(
      map((response) => this.mapEmployeePage(response.data))
    );
  }

  getActiveEmployeesByDepartmentId(
    departmentId: number,
    pageNumber = 1,
    pageSize = 10
  ): Observable<PagedResult<Employee>> {
    const params = new HttpParams()
      .set('pageNumber', pageNumber)
      .set('pageSize', pageSize);

    return this.http
      .get<ApiResponse<PagedResult<EmployeeApiRecord>>>(`${this.apiUrl}/department/${departmentId}`, { params })
      .pipe(map((response) => this.mapEmployeePage(response.data)));
  }

  getDepartments(pageSize = 100): Observable<Department[]> {
    const url = `${environment.apiUrl}api/departments`;
    const getPage = (pageNumber: number) =>
      this.http.get<ApiResponse<PagedResult<Department>>>(url, {
        params: new HttpParams().set('pageNumber', pageNumber).set('pageSize', pageSize)
      });

    return getPage(1).pipe(
      expand((response) =>
        response.data.hasNextPage ? getPage(response.data.pageNumber + 1) : EMPTY
      ),
      reduce((departments, response) => departments.concat(response.data.items), [] as Department[])
    );
  }

  createEmployee(request: CreateEmployeeRequest): Observable<ApiResponse<number>> {
    return this.http.post<ApiResponse<number>>(this.apiUrl, request);
  }

  getEmployeeById(employeeId: number): Observable<ApiResponse<CreateEmployeeRequest & { employeeId: number }>> {
    return this.http.get<ApiResponse<CreateEmployeeRequest & { employeeId: number }>>(`${this.apiUrl}/${employeeId}`);
  }

  getEmployeeDetails(employeeId: number): Observable<ApiResponse<EmployeeDetails>> {
    return this.http.get<ApiResponse<EmployeeDetails>>(`${this.apiUrl}/${employeeId}/details`);
  }

  updateEmployee(employeeId: number, request: CreateEmployeeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${employeeId}`, request);
  }

  releaseEmployee(employeeId: number, request: ReleaseEmployeeRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${employeeId}/release`, request);
  }

  getOrganizationTree(): Observable<DepartmentTree[]> {
    if (!this.organizationTree$) {
      this.organizationTree$ = this.http
        .get<ApiResponse<DepartmentTree[]>>(`${this.apiUrl}/tree`)
        .pipe(
          map((response) => response.data),
          shareReplay(1)
        );
    }

    return this.organizationTree$;
  }

  private createAvatar(name: string, background: string): string {
    const initials = name
      .split(' ')
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join('');

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="320" height="250" viewBox="0 0 320 250">
        <rect width="320" height="250" fill="${background}"/>
        <circle cx="160" cy="95" r="48" fill="#ffffff" opacity="0.85"/>
        <circle cx="160" cy="93" r="36" fill="#d1d5db"/>
        <path d="M113 196c18-28 32-42 47-42s29 14 47 42" fill="#ffffff" opacity="0.85"/>
        <text x="160" y="160" text-anchor="middle" font-size="18" font-family="Arial, sans-serif" font-weight="700" fill="#111827">${initials}</text>
      </svg>
    `;

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  private mapEmployeePage(page: PagedResult<EmployeeApiRecord>): PagedResult<Employee> {
    return {
      ...page,
      items: page.items.map((employee, index) => {
        const accent = this.palette[index % this.palette.length];
        return {
          id: employee.id,
          name: employee.name,
          designation: employee.designation ?? '',
          department: employee.department ?? '',
          teamName: employee.teamName ?? '',
          imageBase64: employee.imageBase64 ?? this.createAvatar(employee.name, accent),
          accent
        };
      })
    };
  }

getEmployeeMasters(): Observable<any> {
 
return this.http.get<any>(
`${this.apiUrl}/employee-master`
);
}
}
