import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule
} from '@angular/forms';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { map } from 'rxjs';
import { ToastService } from '../../../../shared/services/toast.service';
import { getApiErrorMessage } from '../../../../shared/services/api-error-message';

import { CreateEmployeeRequest, EmployeeService } from '../../services/employee.service';
import { TopbarComponent } from '../../../../shared/components/topbar/topbar.component';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthService } from '../../../../core/auth/auth.service';


@Component({
  selector: 'app-employee-add-form',
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './employee-add-form.html',
  styleUrl: './employee-add-form.css'
})

export class EmployeeAddFormComponent implements OnInit {

  private fb = inject(FormBuilder);
  private employeeService = inject(EmployeeService);
  private authService = inject(AuthService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  employeeForm!: FormGroup;
  isSubmitting = false;
  isReadingImage = false;
  errorMessage = '';
  imageBase64: string | null = null;
  currentImageBase64: string | null = null;
  imageFileName = '';
  employeeId: number | null = null;
  isReleaseMode = false;
  readonly today = new Date(new Date().setHours(0, 0, 0, 0));
  readonly latestDateOfBirth = new Date(this.today.getTime() - 24 * 60 * 60 * 1000);
  readonly maxDateOfBirth = this.getLatestPastDate();

  departments: any[] = [];
  designations: any[] = [];
  jobTypes: any[] = [];
  bloodGroups: any[] = [];
  genders: any[] = [];
  roles: any[] = [];
  teams: any[] = [];
  skills: any[] = [];
  recruitments: any[] = [];
  employees: any[] = [];
  cotivityEmployees: any[] = [];
  businessUnits: any[] = [];
  dressSizes: any[] = [];
  addressTypes: any[] = [];
  skillLevels: Record<number, number> = {};

  ngOnInit(): void {
    this.isReleaseMode = this.route.snapshot.data['mode'] === 'release';
    this.initializeForm();
    if (!this.isReleaseMode) {
      this.loadMasters();
    }
    const employeeId = Number(this.route.snapshot.paramMap.get('employeeId'));
    if (Number.isInteger(employeeId) && employeeId > 0) {
      this.employeeId = employeeId;
      this.loadEmployee(employeeId);
    }
  }

  initializeForm(): void {

    this.employeeForm = this.fb.group({
      eNumber: [null, [Validators.required, Validators.min(1), Validators.max(2147483647), Validators.pattern(/^\d+$/)]],
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      middleName: ['', Validators.maxLength(100)],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],

      email: ['', [Validators.required, Validators.email, Validators.maxLength(150)]],
      alternateEmail: ['', [Validators.email, Validators.maxLength(150)]],

      extensionNumber: [null, [Validators.required, Validators.min(0), Validators.max(2147483647), Validators.pattern(/^\d+$/)]],
      citizenshipNumber: ['', [Validators.required, Validators.maxLength(50)]],
      panNumber: ['', [Validators.required, Validators.maxLength(50)]],
      lockerNumber: ['', Validators.maxLength(20)],
      stationNumber: ['', Validators.maxLength(20)],

      joinedDate: [new Date(), Validators.required],
      dateOfBirth: [null],

      address: ['', Validators.maxLength(160)],
      addressLine2: ['', Validators.maxLength(160)],
      city: ['', Validators.maxLength(100)],
      state: ['', Validators.maxLength(100)],
      addressTypeId: [''],

      departmentId: ['', Validators.required],
      designationId: ['', Validators.required],
      jobTypeId: ['', Validators.required],

      bloodGroupId: ['', Validators.required],
      genderId: ['', Validators.required],
      roleId: ['', Validators.required],
      teamId: ['', Validators.required],

      recruitmentId: [''],
      leadEmployeeId: [''],
      reportToEmployeeId: [''],
      cotivityEmployeeId: [''],
      skillIds: [[]],
      dressIds: [[]],
      isActive: [true],
      releaseDate: [this.isReleaseMode ? this.toDateOnly(this.today) : '', this.isReleaseMode ? Validators.required : []],
      reasonForRelease: ['', this.isReleaseMode
        ? [Validators.required, Validators.maxLength(250)]
        : [Validators.maxLength(250)]]
    });
  }

  private getLatestPastDate(): Date {
    const latestPastDate = new Date();
    latestPastDate.setHours(0, 0, 0, 0);
    latestPastDate.setDate(latestPastDate.getDate() - 1);
    return latestPastDate;
  }

  private loadEmployee(employeeId: number): void {
    this.employeeService.getEmployeeById(employeeId).subscribe({
      next: ({ data }) => {
        this.employeeForm.patchValue({
          eNumber: data.eNumber,
          firstName: this.normalizeFormText(data.firstName),
          middleName: this.normalizeFormText(data.middleName),
          lastName: this.normalizeFormText(data.lastName),
          joinedDate: new Date(`${data.joinedDate}T00:00:00`),
          email: this.normalizeFormText(data.email),
          alternateEmail: this.normalizeFormText(data.alternateEmail),
          extensionNumber: data.extensionNumber,
          citizenshipNumber: this.normalizeFormText(data.citizenshipNumber),
          panNumber: this.normalizeFormText(data.panNumber),
          lockerNumber: this.normalizeFormText(data.lockerNumber),
          stationNumber: this.normalizeFormText(data.stationNumber),
          dateOfBirth: data.dateOfBirth ? new Date(`${data.dateOfBirth}T00:00:00`) : null,
          departmentId: this.normalizeFormId(data.departmentId),
          designationId: this.normalizeFormId(data.designationId),
          jobTypeId: this.normalizeFormId(data.jobTypeId),
          bloodGroupId: this.normalizeFormId(data.bloodGroupId),
          genderId: this.normalizeFormId(data.genderId),
          roleId: this.normalizeFormId(data.roleId),
          teamId: this.normalizeFormId(data.teamId),
          recruitmentId: data.recruitmentId ? String(data.recruitmentId) : '',
          leadEmployeeId: data.leadEmployeeId ? String(data.leadEmployeeId) : '',
          reportToEmployeeId: data.reportsToEmployeeId ? String(data.reportsToEmployeeId) : '',
          cotivityEmployeeId: data.cotivityEmployeeId ? String(data.cotivityEmployeeId) : '',
          skillIds: data.skills.map((skill) => String(skill.skillId)),
          dressIds: data.dressSizes.map((dress) => String(dress.dressId)),
          address: this.normalizeFormText(data.addresses[0]?.addressLine1),
          addressLine2: this.normalizeFormText(data.addresses[0]?.addressLine2),
          city: this.normalizeFormText(data.addresses[0]?.city),
          state: this.normalizeFormText(data.addresses[0]?.state),
          addressTypeId: data.addresses[0]?.addressTypeId ? String(data.addresses[0].addressTypeId) : '',
          isActive: data.isActive,
          releaseDate: data.releaseDate ?? (this.isReleaseMode ? this.toDateOnly(this.today) : ''),
          reasonForRelease: this.normalizeFormText(data.reasonForRelease)
        });
        this.skillLevels = Object.fromEntries(data.skills.map((skill) => [skill.skillId, skill.skillLevel]));
        this.currentImageBase64 = data.imageBase64;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        this.errorMessage = getApiErrorMessage(error, 'Could not load employee details.');
        this.toastService.error(this.errorMessage);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  loadMasters(): void {

    this.employeeService.getEmployeeMasters().subscribe({
      next: (response: any) => {

        const data = response.data;

        this.departments = data.departments;
        this.designations = data.designations;
        this.jobTypes = data.jobTypes;
        this.bloodGroups = data.bloodGroups;
        this.genders = data.genders;
        this.roles = data.roles;
        this.teams = data.teams;
        this.skills = data.skills;
        this.recruitments = data.recruitments;
        this.employees = data.employees;
        this.cotivityEmployees = data.cotivityEmployees;
        this.dressSizes = data.dressSizes;
        this.businessUnits = data.businesses;
        this.addressTypes = data.addressTypes;
        this.changeDetectorRef.markForCheck();
      },
      error: (error) => {
        console.error(error);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';
    if (this.isSubmitting) {
      return;
    }

    const value = this.employeeForm.getRawValue();
    if (this.isReleaseMode) {
      const releaseDate = this.employeeForm.get('releaseDate');
      const reasonForRelease = this.employeeForm.get('reasonForRelease');
      releaseDate?.markAsTouched();
      reasonForRelease?.markAsTouched();
      const releaseMessages = [
        this.validationMessage('releaseDate'),
        this.validationMessage('reasonForRelease')
      ].filter((message): message is string => message !== null);
      if (releaseMessages.length > 0) {
        this.showValidationMessages(releaseMessages);
        return;
      }
      if (this.employeeId === null) {
        return;
      }

      this.isSubmitting = true;
      this.employeeService.releaseEmployee(this.employeeId, {
        releaseDate: value.releaseDate,
        reasonForRelease: value.reasonForRelease.trim()
      }).subscribe({
        next: () => {
          this.toastService.success('Employee released successfully.');
          this.router.navigate(['/people']);
        },
        error: (error) => {
          this.errorMessage = getApiErrorMessage(error, 'Could not release the employee. Please try again.');
          this.toastService.error(this.errorMessage);
          this.isSubmitting = false;
        }
      });
      return;
    }

    this.employeeForm.markAllAsTouched();
    const invalidMessages = Object.keys(this.employeeForm.controls)
      .map((controlName) => this.validationMessage(controlName))
      .filter((message): message is string => message !== null);
    if (invalidMessages.length > 0) {
      this.showValidationMessages(invalidMessages);
      return;
    }

    const hasAddress = [value.address, value.addressLine2, value.city, value.state, value.addressTypeId]
      .some((item) => item !== null && item !== undefined && item !== '');

    if (hasAddress && (!value.address || !value.addressTypeId || !value.city || !value.state)) {
      this.errorMessage = 'Complete the address line, address type, city, and state, or leave the address blank.';
      this.toastService.error(this.errorMessage);
      return;
    }

    const request: CreateEmployeeRequest = {
      eNumber: Number(value.eNumber),
      firstName: value.firstName.trim(),
      middleName: value.middleName?.trim() || null,
      lastName: value.lastName.trim(),
      joinedDate: this.toDateOnly(value.joinedDate),
      email: value.email.trim(),
      alternateEmail: value.alternateEmail?.trim() || null,
      designationId: Number(value.designationId),
      departmentId: Number(value.departmentId),
      jobTypeId: Number(value.jobTypeId),
      bloodGroupId: Number(value.bloodGroupId),
      genderId: Number(value.genderId),
      reportsToEmployeeId: this.toNullablePositiveId(value.reportToEmployeeId),
      leadEmployeeId: this.toNullablePositiveId(value.leadEmployeeId),
      stationNumber: value.stationNumber?.trim() || null,
      recruitmentId: value.recruitmentId ? Number(value.recruitmentId) : null,
      extensionNumber: Number(value.extensionNumber),
      citizenshipNumber: value.citizenshipNumber.trim(),
      dateOfBirth: value.dateOfBirth ? this.toDateOnly(value.dateOfBirth) : null,
      panNumber: value.panNumber.trim(),
      lockerNumber: value.lockerNumber?.trim() || null,
      roleId: Number(value.roleId),
      teamId: Number(value.teamId),
      cotivityEmployeeId: this.toNullablePositiveId(value.cotivityEmployeeId),
      imageBase64: this.imageBase64,
      isActive: value.isActive,
      releaseDate: value.releaseDate || null,
      reasonForRelease: value.reasonForRelease?.trim() || null,
      addresses: hasAddress ? [{
        addressTypeId: Number(value.addressTypeId),
        addressLine1: value.address.trim(),
        addressLine2: value.addressLine2?.trim() || null,
        city: value.city.trim(),
        state: value.state.trim(),
        latitude: 0,
        longitude: 0,
        isPrimary: true
      }] : [],
      skills: (value.skillIds as Array<number | string>).map((skillId) => ({
        skillId: Number(skillId),
        skillLevel: this.skillLevelFor(Number(skillId)),
        isPrimary: false
      })),
      dressSizes: this.dressSizes
        .filter((dress) => (value.dressIds as Array<number | string>).map(Number).includes(Number(dress.dressId)))
        .map((dress) => ({
          dressId: Number(dress.dressId),
          dressName: dress.dressName,
          size: dress.size,
          isActive: dress.isActive
        }))
    };

    this.isSubmitting = true;
    const saveRequest = this.employeeId === null
      ? this.employeeService.createEmployee(request).pipe(map(() => {}))
      : this.employeeService.updateEmployee(this.employeeId, request);
    saveRequest.subscribe({
      next: () => {
        this.toastService.success(`Employee ${this.employeeId === null ? 'created' : 'updated'} successfully.`);
        this.router.navigate(['/people']);
      },
      error: (error) => {
        this.errorMessage = getApiErrorMessage(error, 'Could not save the employee. Please try again.');
        this.toastService.error(this.errorMessage);
        this.isSubmitting = false;
      }
    });
  }

  validationMessage(controlName: string): string | null {
    const control = this.employeeForm.get(controlName);
    if (!control?.touched || !control.errors) {
      return null;
    }

    const labels: Record<string, string> = {
      eNumber: 'Employee number',
      firstName: 'First name',
      middleName: 'Middle name',
      lastName: 'Last name',
      email: 'Email',
      alternateEmail: 'Alternate email',
      extensionNumber: 'Extension number',
      citizenshipNumber: 'Citizenship number',
      panNumber: 'PAN number',
      lockerNumber: 'Locker number',
      stationNumber: 'Station number',
      joinedDate: 'Date of joining',
      dateOfBirth: 'Date of birth',
      address: 'Address line 1',
      addressLine2: 'Address line 2',
      city: 'City',
      state: 'State',
      departmentId: 'Department',
      designationId: 'Designation',
      jobTypeId: 'Job type',
      bloodGroupId: 'Blood group',
      genderId: 'Gender',
      roleId: 'Role',
      teamId: 'Team',
      releaseDate: 'Release date',
      reasonForRelease: 'Reason for release'
    };
    const label = labels[controlName] ?? controlName;
    const errors = control.errors;

    if (errors['required']) return `${label} is required.`;
    if (errors['email']) return `${label} must be a valid email address.`;
    if (errors['maxlength']) return `${label} must be ${errors['maxlength'].requiredLength} characters or fewer.`;
    if (errors['min']) return `${label} must be at least ${errors['min'].min}.`;
    if (errors['max']) return `${label} must be ${errors['max'].max} or less.`;
    if (errors['pattern']) return `${label} must be a whole number.`;
    if (errors['matDatepickerMin']) return `${label} must be today or later.`;
    if (errors['matDatepickerMax']) return `${label} must be before today.`;
    return `${label} is invalid.`;
  }

  normalizeNullInput(event: Event, controlName: string): void {
    const input = event.target;
    if (!(input instanceof HTMLInputElement || input instanceof HTMLTextAreaElement) ||
        (input instanceof HTMLInputElement && (input.type === 'checkbox' || input.type === 'file'))) {
      return;
    }

    if (input.value.trim().toLowerCase() !== 'null') {
      return;
    }

    input.value = '';
    this.employeeForm.get(controlName)?.setValue(
      input instanceof HTMLInputElement && input.type === 'number' ? null : '',
      { emitEvent: false }
    );
  }

  showFieldError(controlName: string): void {
    const control = this.employeeForm.get(controlName);
    if (!control) {
      return;
    }

    control.markAsTouched();
    const message = this.validationMessage(controlName!);
    if (message) {
      this.toastService.error(message);
    }
  }

  isSkillSelected(skillId: number): boolean {
    return (this.employeeForm.get('skillIds')?.value as Array<number | string> ?? [])
      .some((selectedId) => Number(selectedId) === skillId);
  }

  toggleSkill(skillId: number, event: Event): void {
    const selected = (event.target as HTMLInputElement).checked;
    this.toggleSelectedId('skillIds', skillId, selected);
    if (selected && this.skillLevels[skillId] === undefined) {
      this.skillLevels[skillId] = 1;
    } else if (!selected) {
      const { [skillId]: removed, ...remaining } = this.skillLevels;
      void removed;
      this.skillLevels = remaining;
    }
  }

  skillLevelFor(skillId: number): number {
    return this.skillLevels[skillId] ?? 1;
  }

  updateSkillLevel(skillId: number, event: Event): void {
    this.skillLevels[skillId] = Number((event.target as HTMLSelectElement).value);
  }

  isDressSelected(dressId: number): boolean {
    return (this.employeeForm.get('dressIds')?.value as Array<number | string> ?? [])
      .some((selectedId) => Number(selectedId) === dressId);
  }

  toggleDress(dressId: number, event: Event): void {
    this.toggleSelectedId('dressIds', dressId, (event.target as HTMLInputElement).checked);
  }

  private toggleSelectedId(controlName: string, id: number, selected: boolean): void {
    const control = this.employeeForm.get(controlName);
    const currentIds = (control?.value as Array<number | string> ?? []).map(Number);
    const nextIds = selected
      ? [...new Set([...currentIds, id])]
      : currentIds.filter((currentId) => currentId !== id);
    control?.setValue(nextIds.map(String));
    control?.markAsDirty();
  }

  private showValidationMessages(messages: string[]): void {
    this.toastService.error([...new Set(messages)].join(' '));
  }

  private normalizeFormText(value: string | null | undefined): string {
    return value?.trim().toLowerCase() === 'null' ? '' : value ?? '';
  }

  private normalizeFormId(value: number | null | undefined): string {
    return value === null || value === undefined ? '' : String(value);
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) {
      return;
    }

    const supportedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (!supportedTypes.includes(file.type)) {
      this.toastService.error('Choose a JPEG, PNG, or GIF image.');
      input.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      this.toastService.error('Choose an image smaller than 5 MB.');
      input.value = '';
      return;
    }

    this.isReadingImage = true;
    const reader = new FileReader();
    reader.onload = () => {
      this.isReadingImage = false;
      if (typeof reader.result !== 'string') {
        this.toastService.error('Could not read the selected image.');
        this.changeDetectorRef.markForCheck();
        return;
      }

      this.imageBase64 = reader.result;
      this.imageFileName = file.name;
      this.changeDetectorRef.markForCheck();
    };
    reader.onerror = () => {
      this.isReadingImage = false;
      this.toastService.error('Could not read the selected image.');
      this.changeDetectorRef.markForCheck();
    };
    reader.readAsDataURL(file);
  }

  clearImage(input: HTMLInputElement): void {
    this.imageBase64 = null;
    this.imageFileName = '';
    input.value = '';
  }

  cancelRelease(): void {
    this.router.navigate(['/people']);
  }

  private toNullablePositiveId(value: unknown): number | null {
    if (value === null || value === undefined || value === '') {
      return null;
    }

    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
  }

  private toDateOnly(value: Date | string): string {
    const date = value instanceof Date ? value : new Date(value);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}