import { Component, signal } from '@angular/core';
import { Router } from '@angular/router';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  Bell,
  Camera,
  Check,
  ChevronDown,
  CircleUserRound,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  LogOut,
  LucideAngularModule,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  UserRound,
} from 'lucide-angular';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-profile-page',
  imports: [
    ReactiveFormsModule,
    LucideAngularModule,
  ],
  templateUrl: './profile-page.html',
})
export class ProfilePage {
  readonly UserRound = UserRound;
  readonly CircleUserRound = CircleUserRound;
  readonly Camera = Camera;
  readonly Pencil = Pencil;
  readonly Mail = Mail;
  readonly Phone = Phone;
  readonly MapPin = MapPin;
  readonly GraduationCap = GraduationCap;
  readonly Bell = Bell;
  readonly ShieldCheck = ShieldCheck;
  readonly LockKeyhole = LockKeyhole;
  readonly Save = Save;
  readonly LogOut = LogOut;
  readonly Check = Check;
  readonly ChevronDown = ChevronDown;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;

  readonly isEditing = signal(false);
  readonly isSaving = signal(false);
  readonly savedSuccessfully = signal(false);
  readonly showCurrentPassword = signal(false);
  readonly showNewPassword = signal(false);

  readonly profileForm;
  readonly passwordForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    readonly auth: AuthService,
    private readonly router: Router,
  ) {
    const user = this.auth.user();
    const [firstName = 'Ismael', ...lastNameParts] = user?.name.split(' ') ?? [];
    this.profileForm = this.formBuilder.nonNullable.group({
      firstName: [
        firstName,
        [
          Validators.required,
          Validators.minLength(2),
        ],
      ],
      lastName: [
        lastNameParts.join(' ') || 'Ramos',
        [
          Validators.required,
          Validators.minLength(2),
        ],
      ],
      email: [
        user?.email ?? 'ismael@gmail.com',
        [
          Validators.required,
          Validators.email,
        ],
      ],
      phone: [
        '+51 987 654 321',
        Validators.required,
      ],
      country: [
        'Perú',
        Validators.required,
      ],
      city: [
        'Lima',
        Validators.required,
      ],
      destinationCountry: [
        'España',
        Validators.required,
      ],
      travelReason: [
        'Estudios',
        Validators.required,
      ],
      institution: [
        'Universidad Complutense de Madrid',
      ],
      expectedTravelDate: [
        '2026-09-10',
      ],
      emailNotifications: [true],
      deadlineNotifications: [true],
      officialChangesNotifications: [true],
      promotionalNotifications: [false],
    });

    this.passwordForm = this.formBuilder.nonNullable.group({
      currentPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
        ],
      ],
      newPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
      confirmPassword: [
        '',
        [
          Validators.required,
          Validators.minLength(8),
        ],
      ],
    });
  }

  toggleEditing(): void {
    this.isEditing.update((value) => !value);
    this.savedSuccessfully.set(false);
  }

  saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isSaving.set(true);
    this.savedSuccessfully.set(false);

    window.setTimeout(() => {
      this.isSaving.set(false);
      this.isEditing.set(false);
      this.savedSuccessfully.set(true);

      window.setTimeout(() => {
        this.savedSuccessfully.set(false);
      }, 3000);
    }, 900);
  }

  updatePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const {
      newPassword,
      confirmPassword,
    } = this.passwordForm.getRawValue();

    if (newPassword !== confirmPassword) {
      this.passwordForm.controls.confirmPassword.setErrors({
        passwordMismatch: true,
      });

      return;
    }

    this.isSaving.set(true);

    window.setTimeout(() => {
      this.isSaving.set(false);
      this.passwordForm.reset();
      this.savedSuccessfully.set(true);

      window.setTimeout(() => {
        this.savedSuccessfully.set(false);
      }, 3000);
    }, 900);
  }

  toggleCurrentPassword(): void {
    this.showCurrentPassword.update((value) => !value);
  }

  toggleNewPassword(): void {
    this.showNewPassword.update((value) => !value);
  }

  chooseProfileImage(input: HTMLInputElement): void {
    input.click();
  }

  onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('Selecciona una imagen válida.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar los 5 MB.');
      return;
    }

    alert(`Imagen seleccionada: ${file.name}`);
  }

  logout(): void {
    const confirmed = window.confirm(
      '¿Seguro que deseas cerrar sesión?',
    );

    if (confirmed) {
      this.auth.logout();
      void this.router.navigate(['/acceso']);
    }
  }
}
