import { Component, HostListener, output, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import {
  Bell,
  ChevronDown,
  LucideAngularModule,
  Menu,
  LogOut,
  Search,
  UserRound,
} from 'lucide-angular';

@Component({
  selector: 'app-topbar',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './topbar.html',
})
export class Topbar {
  readonly menuToggle = output<void>();
  readonly sidebarToggle = output<void>();
  readonly searchInput = viewChild<HTMLInputElement>('searchInput');
  readonly isAccountMenuOpen = signal(false);
  readonly Search = Search;
  readonly Bell = Bell;
  readonly ChevronDown = ChevronDown;
  readonly Menu = Menu;
  readonly LogOut = LogOut;
  readonly UserRound = UserRound;

  constructor(
    readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  userInitial(): string {
    return this.auth.user()?.name.charAt(0).toUpperCase() ?? 'U';
  }

  userFirstName(): string {
    return this.auth.user()?.name.split(' ')[0] ?? 'Usuario';
  }

  toggleAccountMenu(): void {
    this.isAccountMenuOpen.update((isOpen) => !isOpen);
  }

  logout(): void {
    this.auth.logout();
    this.isAccountMenuOpen.set(false);
    void this.router.navigate(['/acceso']);
  }

  @HostListener('window:keydown', ['$event'])
  focusSearch(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.searchInput()?.focus();
    }
  }
}
