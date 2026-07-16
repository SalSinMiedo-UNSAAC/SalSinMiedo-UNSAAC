import { Component, computed, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../sidebar/sidebar';
import { Topbar } from '../topbar/topbar';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, Sidebar, Topbar],
  templateUrl: './app-shell.html',
})
export class AppShell {
  readonly isMobileMenuOpen = signal(false);
  readonly isSidebarCollapsed = signal(true);
  readonly isSidebarHovered = signal(false);
  readonly sidebarIsCompact = computed(
    () => this.isSidebarCollapsed() && !this.isSidebarHovered(),
  );

  toggleMobileMenu(): void {
    this.isSidebarCollapsed.set(false);
    this.isMobileMenuOpen.update((isOpen) => !isOpen);
  }

  toggleSidebar(): void {
    this.isSidebarCollapsed.update((collapsed) => !collapsed);
  }

  setSidebarHover(isHovered: boolean): void {
    this.isSidebarHovered.set(isHovered);
  }

  mainClasses(): string {
    return this.isSidebarCollapsed()
      ? 'min-h-screen transition-[padding] duration-300 lg:pl-[76px]'
      : 'min-h-screen transition-[padding] duration-300 lg:pl-[224px]';
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }
}
