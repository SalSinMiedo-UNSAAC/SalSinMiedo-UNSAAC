import { NgTemplateOutlet } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  AlertTriangle,
  Bell,
  CalendarDays,
  Check,
  CheckCheck,
  ChevronRight,
  Clock3,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  Info,
  LucideAngularModule,
  Settings,
  ShieldCheck,
  Trash2,
} from 'lucide-angular';

type NotificationType =
  | 'critical'
  | 'reminder'
  | 'success'
  | 'information';

type NotificationFilter = 'all' | 'unread' | NotificationType;

interface AppNotification {
  id: number;
  title: string;
  description: string;
  time: string;
  dateGroup: 'today' | 'yesterday' | 'older';
  type: NotificationType;
  read: boolean;
  actionLabel?: string;
  actionRoute?: string;
}

interface FilterOption {
  label: string;
  value: NotificationFilter;
}

@Component({
  selector: 'app-notifications-page',
  imports: [LucideAngularModule, RouterLink, NgTemplateOutlet],
  templateUrl: './notifications-page.html',
})
export class NotificationsPage {
  readonly Bell = Bell;
  readonly Check = Check;
  readonly CheckCheck = CheckCheck;
  readonly Trash2 = Trash2;
  readonly Settings = Settings;
  readonly ChevronRight = ChevronRight;
  readonly ExternalLink = ExternalLink;

  readonly selectedFilter = signal<NotificationFilter>('all');

  readonly notifications = signal<AppNotification[]>([
    {
      id: 1,
      title: 'Tu cita consular está próxima',
      description:
        'Tu cita en el Consulado de España es el 18 de julio. Revisa que tu expediente esté completo.',
      time: 'Hace 10 minutos',
      dateGroup: 'today',
      type: 'critical',
      read: false,
      actionLabel: 'Revisar requisitos',
      actionRoute: '/requisitos',
    },
    {
      id: 2,
      title: 'Seguro médico pendiente',
      description:
        'Todavía no has adjuntado el seguro médico internacional requerido para tu solicitud.',
      time: 'Hace 2 horas',
      dateGroup: 'today',
      type: 'reminder',
      read: false,
      actionLabel: 'Completar requisito',
      actionRoute: '/requisitos',
    },
    {
      id: 3,
      title: 'Documento verificado correctamente',
      description:
        'El pasaporte que subiste obtuvo una puntuación de 85 sobre 100.',
      time: 'Hace 4 horas',
      dateGroup: 'today',
      type: 'success',
      read: false,
      actionLabel: 'Ver análisis',
      actionRoute: '/verificador',
    },
    {
      id: 4,
      title: 'Actualización de requisitos oficiales',
      description:
        'Se actualizó la información relacionada con el visado de estudios para España.',
      time: 'Ayer, 4:30 p. m.',
      dateGroup: 'yesterday',
      type: 'information',
      read: true,
      actionLabel: 'Consultar fuente',
      actionRoute: '/fuentes',
    },
    {
      id: 5,
      title: 'Carta de admisión agregada a tu ruta',
      description:
        'El requisito académico ahora aparece como parte de tu etapa de admisión.',
      time: 'Ayer, 11:20 a. m.',
      dateGroup: 'yesterday',
      type: 'success',
      read: true,
      actionLabel: 'Ver mi ruta',
      actionRoute: '/mi-ruta',
    },
    {
      id: 6,
      title: 'Recuerda revisar la vigencia de tus documentos',
      description:
        'Algunos certificados pueden vencer antes de la fecha de tu cita consular.',
      time: '10 de julio',
      dateGroup: 'older',
      type: 'reminder',
      read: true,
      actionLabel: 'Revisar documentos',
      actionRoute: '/requisitos',
    },
  ]);

  readonly filterOptions: FilterOption[] = [
    {
      label: 'Todas',
      value: 'all',
    },
    {
      label: 'No leídas',
      value: 'unread',
    },
    {
      label: 'Críticas',
      value: 'critical',
    },
    {
      label: 'Recordatorios',
      value: 'reminder',
    },
    {
      label: 'Completadas',
      value: 'success',
    },
  ];

  readonly filteredNotifications = computed(() => {
    const filter = this.selectedFilter();
    const items = this.notifications();

    if (filter === 'all') {
      return items;
    }

    if (filter === 'unread') {
      return items.filter((notification) => !notification.read);
    }

    return items.filter(
      (notification) => notification.type === filter,
    );
  });

  readonly unreadCount = computed(
    () =>
      this.notifications().filter(
        (notification) => !notification.read,
      ).length,
  );

  readonly criticalCount = computed(
    () =>
      this.notifications().filter(
        (notification) =>
          notification.type === 'critical' &&
          !notification.read,
      ).length,
  );

  readonly reminderCount = computed(
    () =>
      this.notifications().filter(
        (notification) =>
          notification.type === 'reminder' &&
          !notification.read,
      ).length,
  );

  selectFilter(filter: NotificationFilter): void {
    this.selectedFilter.set(filter);
  }

  markAsRead(id: number): void {
    this.notifications.update((items) =>
      items.map((notification) =>
        notification.id === id
          ? {
              ...notification,
              read: true,
            }
          : notification,
      ),
    );
  }

  markAllAsRead(): void {
    this.notifications.update((items) =>
      items.map((notification) => ({
        ...notification,
        read: true,
      })),
    );
  }

  deleteNotification(id: number): void {
    this.notifications.update((items) =>
      items.filter((notification) => notification.id !== id),
    );
  }

  clearReadNotifications(): void {
    this.notifications.update((items) =>
      items.filter((notification) => !notification.read),
    );
  }

  groupNotifications(
    group: AppNotification['dateGroup'],
  ): AppNotification[] {
    return this.filteredNotifications().filter(
      (notification) => notification.dateGroup === group,
    );
  }

  typeLabel(type: NotificationType): string {
    const labels: Record<NotificationType, string> = {
      critical: 'Crítica',
      reminder: 'Recordatorio',
      success: 'Completado',
      information: 'Información',
    };

    return labels[type];
  }

  iconForType(type: NotificationType) {
    const icons: Record<NotificationType, typeof Bell> = {
      critical: AlertTriangle,
      reminder: CalendarDays,
      success: FileCheck2,
      information: Info,
    };

    return icons[type];
  }

  iconClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      critical:
        'bg-red-50 text-red-600 ring-red-100',
      reminder:
        'bg-orange-50 text-orange-600 ring-orange-100',
      success:
        'bg-emerald-50 text-emerald-600 ring-emerald-100',
      information:
        'bg-indigo-50 text-indigo-600 ring-indigo-100',
    };

    return classes[type];
  }

  badgeClass(type: NotificationType): string {
    const classes: Record<NotificationType, string> = {
      critical:
        'border-red-200 bg-red-50 text-red-600',
      reminder:
        'border-orange-200 bg-orange-50 text-orange-600',
      success:
        'border-emerald-200 bg-emerald-50 text-emerald-600',
      information:
        'border-indigo-200 bg-indigo-50 text-indigo-600',
    };

    return classes[type];
  }
}