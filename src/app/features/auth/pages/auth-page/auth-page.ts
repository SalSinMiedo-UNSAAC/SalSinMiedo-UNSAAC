import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, UserRound } from 'lucide-angular';
import { LucideAngularModule } from 'lucide-angular';
import { AuthService } from '../../../../core/auth/auth.service';

type AuthMode = 'login' | 'register';

@Component({
  selector: 'app-auth-page',
  imports: [ReactiveFormsModule, LucideAngularModule],
  templateUrl: './auth-page.html',
})
export class AuthPage {
  readonly ShieldCheck = ShieldCheck;
  readonly LockKeyhole = LockKeyhole;
  readonly UserRound = UserRound;
  readonly Mail = Mail;
  readonly Eye = Eye;
  readonly EyeOff = EyeOff;
  readonly ArrowRight = ArrowRight;
  readonly mode = signal<AuthMode>('login');
  readonly showPassword = signal(false);
  readonly errorMessage = signal('');
  readonly loginForm;
  readonly registerForm;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
  ) {
    this.loginForm = this.formBuilder.nonNullable.group({
      username: ['admin', Validators.required],
      password: ['admin123', [Validators.required, Validators.minLength(6)]],
    });
    this.registerForm = this.formBuilder.nonNullable.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    });
  }

  setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.errorMessage.set('');
  }

  submitLogin(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const { username, password } = this.loginForm.getRawValue();
    if (!this.auth.login(username, password)) {
      this.errorMessage.set('Usuario o contraseña incorrectos.');
      return;
    }
    this.navigateAfterAuth();
  }

  submitRegister(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }
    const { name, username, email, password, confirmPassword } = this.registerForm.getRawValue();
    if (password !== confirmPassword) {
      this.errorMessage.set('Las contraseñas no coinciden.');
      return;
    }
    if (!this.auth.register({ name, username, email, password })) {
      this.errorMessage.set('Ese usuario o correo ya está registrado.');
      return;
    }
    this.navigateAfterAuth();
  }

  togglePassword(): void {
    this.showPassword.update((visible) => !visible);
  }

  private navigateAfterAuth(): void {
    const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
    void this.router.navigateByUrl(returnUrl?.startsWith('/') ? returnUrl : '/inicio');
  }
}
