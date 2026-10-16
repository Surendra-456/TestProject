import { Routes } from '@angular/router';

import { EmployeeDirectoryComponent } from './features/employees/pages/employee-directory/employee-directory.component';
import { EmployeeAddFormComponent } from  './features/employees/pages/employee-add-form/employee-add-form'
import { MasterSettings } from './features/master-settings/master-settings';
import { adminGuard } from './core/auth/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';


export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Sign in | TeamHub'
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'people',
    component: EmployeeDirectoryComponent,
    canActivate: [adminGuard],
    data: { layout: 'table' },
    title: 'Employees | TeamHub'
  },
  {
    path: 'home',
    component: EmployeeDirectoryComponent,
    data: { readOnlyHome: true },
    title: 'Home | TeamHub'
  },
  {
    path: 'employees/add',
    component: EmployeeAddFormComponent,
    canActivate: [adminGuard],
    title: 'AddEmployee | TeamHub'
  },
  {
    path: 'employees/edit/:employeeId',
    component: EmployeeAddFormComponent,
    canActivate: [adminGuard],
    title: 'Edit Employee | TeamHub'
  },
  {
    path: 'employees/release/:employeeId',
    component: EmployeeAddFormComponent,
    canActivate: [adminGuard],
    title: 'Release Employee | TeamHub',
    data: { mode: 'release' }
  },
  {
    path: 'master/:masterKey',
    component: MasterSettings,
    canActivate: [adminGuard],
    title: 'Master Settings | TeamHub'
  },

  {
    path: '**',
    redirectTo: ''
  }
];
