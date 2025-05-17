/* eslint-disable @typescript-eslint/no-explicit-any */
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogModule, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import Swal from 'sweetalert2';
import { UsersService } from 'app/services/users/users.service';
import { debounceTime, distinctUntilChanged } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-modal-create-user',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatSelectModule, MatIconModule, MatFormFieldModule, MatIconModule,
    MatInputModule, MatDialogActions, MatDialogClose, MatDialogTitle, MatDialogContent, ReactiveFormsModule],
  templateUrl: './modal-create-user.component.html',
  styleUrl: './modal-create-user.component.scss'
})
export class ModalCreateUserComponent implements OnInit {

  formCreateUser!: FormGroup;
  administratorsValues: any[] = [];
  showFieldAdministrator: boolean = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private readonly _formBuldier: FormBuilder,
    private readonly _userService: UsersService, // ✅ Corregido
    private readonly dialogRef: MatDialogRef<ModalCreateUserComponent>,
    private readonly _snackBar: MatSnackBar,
  ) {
    this.createFormUsers();
    this.formCreateUser.controls['confirmPassword'].valueChanges.pipe(
      debounceTime(1000),
      distinctUntilChanged()
    ).subscribe((value) => {
      this.validatePassword(value);
    });
  }

  ngOnInit(): void {
    this.getAllAdministrator();
    this.formCreateUser.get('confirmPassword')?.valueChanges.subscribe(confirmPassword => {
      this.validatePassword(confirmPassword);
    });

    this.formCreateUser.get('password')?.valueChanges.subscribe(() => {
      const confirmPassword = this.formCreateUser.get('confirmPassword')?.value;
      this.validatePassword(confirmPassword);
    });
  }

  createFormUsers() {
    this.formCreateUser = this._formBuldier.group({
      nombre: ['', Validators.required],
      email: ['', Validators.required],
      password: ['', Validators.required],
      confirmPassword: ['', Validators.required],
      rol_id: ['', Validators.required],
      administrador_id: ['', Validators.required] //  Asegurar que siempre tiene valor
    });
  }

  getAllAdministrator() {
    this._userService.getAllAdministrator().subscribe({
      next: (res) => {
        this.administratorsValues = res.users;
      },
      error: (err) => {
        console.error(err);
      }
    });
  }
  
  onChangeRole(event: any) {
    console.log('Rol seleccionado:', event.value);
    console.log('Formulario antes de cambio de rol:', this.formCreateUser.value);

    if (event.value === '1') {
      this.hideAdministratorField();
    } else {
      this.showAdministratorField();
    }

    console.log('Formulario después de cambio de rol:', this.formCreateUser.value);
  }

  onSubmit() {
    console.log('Estado del formulario:', this.formCreateUser.valid);
    console.log('Errores en el formulario:', this.formCreateUser.errors);
    console.log('Datos del formulario antes de enviar:', this.formCreateUser.value);

    const adminIdCorrecto = this.formCreateUser.get('administrador_id')?.value;
    console.log('Administrador ID antes de enviar:', adminIdCorrecto);

    if (!adminIdCorrecto) {
      Swal.fire('Error', 'El administrador es obligatorio', 'error');
      return;
    }

    const userDataInformation = {
      nombre: this.formCreateUser.get('nombre')?.value,
      email: this.formCreateUser.get('email')?.value,
      password: this.formCreateUser.get('password')?.value,
      rol_id: Number(this.formCreateUser.get('rol_id')?.value),
      administrador_id: adminIdCorrecto // ✅ Verificación de `admin_id`
    };

    console.log('Datos enviados al backend:', userDataInformation);

    this._userService.createUser(userDataInformation).subscribe({
      next: (response) => {
        console.log('Respuesta del backend:', response);
        this._snackBar.open(response.message, 'Cerrar', { duration: 5000 });
        this.formCreateUser.reset();
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Error del backend:', error);
        const errorMessage = error.error?.result || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
        this._snackBar.open(errorMessage, 'Cerrar', { duration: 5000 });
      }
    });
  }

  private validatePassword(confirmPassword: string) {
    const password = this.formCreateUser.get('password')?.value;
    if (password !== confirmPassword) {
      this.formCreateUser.get('confirmPassword')?.setErrors({ invalid: true });
    } else {
      this.formCreateUser.get('confirmPassword')?.setErrors(null);
    }
  }

  private showAdministratorField() {
    this.showFieldAdministrator = true;
    this.formCreateUser.get('administrador_id')?.setValidators([Validators.required]);
    this.formCreateUser.get('administrador_id')?.updateValueAndValidity();
  }

  private hideAdministratorField() {
    this.showFieldAdministrator = false;
    this.formCreateUser.get('administrador_id')?.clearValidators();
    this.formCreateUser.get('administrador_id')?.updateValueAndValidity();
  }
}


