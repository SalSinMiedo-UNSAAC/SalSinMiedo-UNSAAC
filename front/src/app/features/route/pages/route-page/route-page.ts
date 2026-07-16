import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Circle,
  Clock3,
  FileCheck2,
  Flag,
  GraduationCap,
  Landmark,
  LucideAngularModule,
  MapPin,
  Plane,
  Save,
  ShieldCheck,
} from 'lucide-angular';
import { RouteService } from '../../../../core/route/route.service';

type StepStatus = 'completed' | 'current' | 'pending';

interface RouteStage {
  number: number;
  title: string;
  description: string;
  status: StepStatus;
  progress: number;
  icon: typeof Plane;
  tasks: string[];
}

interface UpcomingDate {
  day: string;
  month: string;
  title: string;
  description: string;
  type: 'critical' | 'important' | 'normal';
}

@Component({
  selector: 'app-route-page',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './route-page.html',
})
export class RoutePage {
  readonly Plane = Plane;
  readonly GraduationCap = GraduationCap;
  readonly CalendarDays = CalendarDays;
  readonly MapPin = MapPin;
  readonly Check = Check;
  readonly CheckCircle2 = CheckCircle2;
  readonly Circle = Circle;
  readonly ChevronRight = ChevronRight;
  readonly ShieldCheck = ShieldCheck;
  readonly Clock3 = Clock3;
  readonly Save = Save;

  readonly selectedOrigin = signal('Perú');
  readonly selectedDestination = signal('España');
  readonly selectedReason = signal('Estudios');
  readonly routeSaved = signal(false);

  constructor(readonly routeService: RouteService) {
    const route = this.routeService.route();
    this.selectedOrigin.set(route.origin);
    this.selectedDestination.set(route.destination);
    this.selectedReason.set(route.reason);
  }

  readonly stages: RouteStage[] = [
    {
      number: 1,
      title: 'Preparación de documentos',
      description: 'Reúne, valida y legaliza los documentos necesarios.',
      status: 'completed',
      progress: 100,
      icon: FileCheck2,
      tasks: [
        'Pasaporte vigente',
        'Certificados académicos',
        'Antecedentes penales',
      ],
    },
    {
      number: 2,
      title: 'Admisión académica',
      description: 'Completa la inscripción y obtén tu carta de admisión.',
      status: 'completed',
      progress: 100,
      icon: GraduationCap,
      tasks: [
        'Solicitud enviada',
        'Carta de admisión',
        'Comprobante de matrícula',
      ],
    },
    {
      number: 3,
      title: 'Solicitud de visado',
      description: 'Prepara y presenta el expediente ante el consulado.',
      status: 'current',
      progress: 55,
      icon: Landmark,
      tasks: [
        'Formulario de visado',
        'Seguro médico internacional',
        'Acreditación económica',
      ],
    },
    {
      number: 4,
      title: 'Preparación del viaje',
      description: 'Organiza el vuelo, alojamiento y documentación final.',
      status: 'pending',
      progress: 0,
      icon: Plane,
      tasks: [
        'Compra de pasajes',
        'Reserva de alojamiento',
        'Documentos para el ingreso',
      ],
    },
    {
      number: 5,
      title: 'Llegada a España',
      description: 'Realiza los primeros trámites después de tu llegada.',
      status: 'pending',
      progress: 0,
      icon: Flag,
      tasks: [
        'Empadronamiento',
        'Solicitud de TIE',
        'Registro en la institución',
      ],
    },
  ];

  readonly upcomingDates: UpcomingDate[] = [
    {
      day: '18',
      month: 'JUL',
      title: 'Cita en el Consulado',
      description: 'Presentación del expediente de visado',
      type: 'critical',
    },
    {
      day: '22',
      month: 'JUL',
      title: 'Pago del seguro médico',
      description: 'Último día recomendado',
      type: 'important',
    },
    {
      day: '05',
      month: 'AGO',
      title: 'Revisión del expediente',
      description: 'Seguimiento de la solicitud',
      type: 'normal',
    },
  ];

  updateOrigin(event: Event): void {
    this.selectedOrigin.set((event.target as HTMLSelectElement).value);
    this.routeSaved.set(false);
  }

  updateDestination(event: Event): void {
    this.selectedDestination.set((event.target as HTMLSelectElement).value);
    this.routeSaved.set(false);
  }

  updateReason(event: Event): void {
    this.selectedReason.set((event.target as HTMLSelectElement).value);
    this.routeSaved.set(false);
  }

  saveRoute(): void {
    if (this.selectedOrigin() === this.selectedDestination()) {
      return;
    }

    this.routeService.save({
      origin: this.selectedOrigin(),
      destination: this.selectedDestination(),
      reason: this.selectedReason(),
    });
    this.routeSaved.set(true);
  }

  statusLabel(status: StepStatus): string {
    const labels: Record<StepStatus, string> = {
      completed: 'Completado',
      current: 'En progreso',
      pending: 'Pendiente',
    };

    return labels[status];
  }

  statusClass(status: StepStatus): string {
    const classes: Record<StepStatus, string> = {
      completed:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
      current:
        'border-indigo-200 bg-indigo-50 text-indigo-700',
      pending:
        'border-slate-200 bg-slate-50 text-slate-500',
    };

    return classes[status];
  }

  stageIconClass(status: StepStatus): string {
    const classes: Record<StepStatus, string> = {
      completed:
        'bg-emerald-500 text-white ring-emerald-100',
      current:
        'bg-indigo-600 text-white ring-indigo-100',
      pending:
        'bg-slate-100 text-slate-400 ring-slate-100',
    };

    return classes[status];
  }

  dateClass(type: UpcomingDate['type']): string {
    const classes: Record<UpcomingDate['type'], string> = {
      critical: 'bg-red-50 text-red-600 border-red-200',
      important: 'bg-orange-50 text-orange-600 border-orange-200',
      normal: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    };

    return classes[type];
  }
}
