import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  Bell,
  BookOpen,
  Calculator,
  ClipboardList,
  House,
  LucideAngularModule,
  MapPinned,
  MessageCircle,
  ShieldCheck,
} from 'lucide-angular';

interface NavigationItem {
  label: string;
  route: string;
  icon: typeof House;
  notificationCount?: number;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, LucideAngularModule],
  templateUrl: './sidebar.html',
})
export class Sidebar {
  readonly isMobileMenuOpen = input(false);
  readonly isCollapsed = input(false);
  readonly navigate = output<void>();
  readonly collapseToggle = output<void>();
  readonly hoverChange = output<boolean>();
  readonly ShieldCheck = ShieldCheck;
  readonly MessageCircle = MessageCircle;

  readonly navigation: NavigationItem[] = [
    {
      label: 'Inicio',
      route: '/inicio',
      icon: House,
    },
    {
      label: 'Requisitos',
      route: '/requisitos',
      icon: ClipboardList,
    },
    {
      label: 'Verificador',
      route: '/verificador',
      icon: ShieldCheck,
    },
    {
      label: 'Costos',
      route: '/costos',
      icon: Calculator,
    },
    {
      label: 'Fuentes',
      route: '/fuentes',
      icon: BookOpen,
    },
    {
      label: 'Notificaciones',
      route: '/notificaciones',
      icon: Bell,
      notificationCount: 3,
    },
  ];
}
