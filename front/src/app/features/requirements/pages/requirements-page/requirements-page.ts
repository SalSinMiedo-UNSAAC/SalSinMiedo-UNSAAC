import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouteService } from '../../../../core/route/route.service';
import {
  AlertTriangle,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  FileCheck2,
  FileText,
  Filter,
  GraduationCap,
  Landmark,
  LucideAngularModule,
  Search,
  ShieldCheck,
  RefreshCw,
  Upload,
  WalletCards,
} from 'lucide-angular';

type RequirementStatus = 'completed' | 'critical' | 'pending';
type RequirementCategory =
  | 'identity'
  | 'academic'
  | 'economic'
  | 'health'
  | 'consular';

interface Requirement {
  id: number;
  title: string;
  description: string;
  category: RequirementCategory;
  status: RequirementStatus;
  deadline?: string;
  documentName?: string;
  progress: number;
  icon: typeof FileText;
}

interface FilterOption {
  label: string;
  value: 'all' | RequirementStatus;
}

@Component({
  selector: 'app-requirements-page',
  imports: [LucideAngularModule, RouterLink],
  templateUrl: './requirements-page.html',
})
export class RequirementsPage {
  readonly Search = Search;
  readonly Filter = Filter;
  readonly ChevronDown = ChevronDown;
  readonly ChevronRight = ChevronRight;
  readonly Check = Check;
  readonly Circle = Circle;
  readonly Upload = Upload;
  readonly CalendarDays = CalendarDays;
  readonly AlertTriangle = AlertTriangle;
  readonly ShieldCheck = ShieldCheck;
  readonly FileText = FileText;
  readonly CheckCircle2 = CheckCircle2;
  readonly RefreshCw = RefreshCw;

  readonly searchTerm = signal('');
  readonly selectedStatus = signal<'all' | RequirementStatus>('all');
  readonly showFilters = signal(false);
  readonly lastUpdated = signal(new Date());
  readonly lastUpdatedText = computed(() =>
    new Intl.DateTimeFormat('es-PE', {
      dateStyle: 'long',
      timeStyle: 'short',
    }).format(this.lastUpdated()),
  );

  constructor(readonly routeService: RouteService) {}

  readonly filterOptions: FilterOption[] = [
    {
      label: 'Todos',
      value: 'all',
    },
    {
      label: 'Completados',
      value: 'completed',
    },
    {
      label: 'Críticos',
      value: 'critical',
    },
    {
      label: 'Pendientes',
      value: 'pending',
    },
  ];

  private readonly baseRequirements: Requirement[] = [
    {
      id: 1,
      title: 'Pasaporte vigente',
      description:
        'El pasaporte debe tener una vigencia mínima recomendada de 12 meses.',
      category: 'identity',
      status: 'completed',
      documentName: 'Pasaporte_Ismael_Ramos.pdf',
      progress: 100,
      icon: FileCheck2,
    },
    {
      id: 2,
      title: 'Carta de admisión',
      description:
        'Documento emitido por la universidad o centro de estudios en España.',
      category: 'academic',
      status: 'critical',
      deadline: '18 de julio',
      progress: 45,
      icon: GraduationCap,
    },
    {
      id: 3,
      title: 'Seguro médico internacional',
      description:
        'Debe cubrir toda tu estancia y no incluir periodos de carencia.',
      category: 'health',
      status: 'critical',
      deadline: '22 de julio',
      progress: 20,
      icon: ShieldCheck,
    },
    {
      id: 4,
      title: 'Acreditación de medios económicos',
      description:
        'Demuestra que cuentas con fondos suficientes para tu estancia.',
      category: 'economic',
      status: 'critical',
      deadline: '25 de julio',
      progress: 35,
      icon: WalletCards,
    },
    {
      id: 5,
      title: 'Antecedentes penales apostillados',
      description:
        'Certificado vigente, legalizado y apostillado cuando corresponda.',
      category: 'consular',
      status: 'pending',
      deadline: '30 de julio',
      progress: 0,
      icon: Landmark,
    },
    {
      id: 6,
      title: 'Certificado médico',
      description:
        'Debe acreditar que no padeces enfermedades con impacto sanitario.',
      category: 'health',
      status: 'pending',
      progress: 0,
      icon: FileText,
    },
    {
      id: 7,
      title: 'Formulario de solicitud de visado',
      description:
        'Completa todos los campos y firma el formulario de solicitud.',
      category: 'consular',
      status: 'completed',
      documentName: 'Solicitud_Visado.pdf',
      progress: 100,
      icon: FileCheck2,
    },
    {
      id: 8,
      title: 'Fotografía tamaño pasaporte',
      description:
        'Fotografía reciente, a color y con fondo claro.',
      category: 'identity',
      status: 'completed',
      documentName: 'Foto_pasaporte.jpg',
      progress: 100,
      icon: FileCheck2,
    },
  ];

  readonly requirements = computed(() => {
    const { destination, reason } = this.routeService.route();
    const requirements = this.baseRequirements.map((requirement) => {
      if (requirement.id === 2) {
        return {
          ...requirement,
          title: reason === 'Estudios' ? 'Carta de admisión' : `Solicitud de visado para ${destination}`,
          description:
            reason === 'Estudios'
              ? `Documento emitido por la institución educativa en ${destination}.`
              : `Documento principal para tu trámite de ${reason.toLowerCase()} en ${destination}.`,
        };
      }
      if (requirement.id === 3) {
        return { ...requirement, title: `Seguro médico válido para ${destination}` };
      }
      if (requirement.id === 7) {
        return { ...requirement, title: `Formulario de solicitud para ${destination}` };
      }
      return requirement;
    });

    const destinationRequirements: Record<string, Requirement[]> = {
      Francia: [
        {
          id: 9,
          title: 'Comprobante de alojamiento en Francia',
          description: 'Acredita dónde te alojarás durante tu estancia inicial.',
          category: 'consular',
          status: 'pending',
          progress: 0,
          icon: FileText,
        },
      ],
      Italia: [
        {
          id: 9,
          title: 'Solicitud de permesso di soggiorno',
          description: 'Documentación inicial para regularizar tu estancia en Italia.',
          category: 'consular',
          status: 'pending',
          progress: 0,
          icon: FileText,
        },
        {
          id: 10,
          title: 'Código fiscal italiano',
          description: 'Identificador requerido para diversos trámites locales.',
          category: 'identity',
          status: 'pending',
          progress: 0,
          icon: FileText,
        },
      ],
      Portugal: [
        {
          id: 9,
          title: 'Comprobante de alojamiento en Portugal',
          description: 'Documento de hospedaje o residencia para tu solicitud.',
          category: 'consular',
          status: 'pending',
          progress: 0,
          icon: FileText,
        },
      ],
    };

    const reasonRequirement: Requirement | null =
      reason === 'Trabajo'
        ? {
            id: 20,
            title: `Oferta o contrato de trabajo en ${destination}`,
            description: 'Acredita la relación laboral o actividad profesional prevista.',
            category: 'academic',
            status: 'critical',
            progress: 0,
            icon: FileText,
          }
        : reason === 'Turismo'
          ? {
              id: 21,
              title: 'Reserva de viaje de retorno',
              description: 'Presenta una reserva o pasaje de salida cuando corresponda.',
              category: 'consular',
              status: 'pending',
              progress: 0,
              icon: FileText,
            }
          : null;

    return [
      ...requirements,
      ...(destinationRequirements[destination] ?? []),
      ...(reasonRequirement ? [reasonRequirement] : []),
    ];
  });

  readonly filteredRequirements = computed(() => {
    const search = this.searchTerm().toLowerCase().trim();
    const status = this.selectedStatus();

    return this.requirements().filter((requirement) => {
      const matchesStatus =
        status === 'all' || requirement.status === status;

      const matchesSearch =
        !search ||
        requirement.title.toLowerCase().includes(search) ||
        requirement.description.toLowerCase().includes(search);

      return matchesStatus && matchesSearch;
    });
  });

  readonly completedCount = computed(
    () =>
      this.requirements().filter(
        (requirement) => requirement.status === 'completed',
      ).length,
  );

  readonly criticalCount = computed(
    () =>
      this.requirements().filter(
        (requirement) => requirement.status === 'critical',
      ).length,
  );

  readonly pendingCount = computed(
    () =>
      this.requirements().filter(
        (requirement) => requirement.status === 'pending',
      ).length,
  );

  readonly totalProgress = computed(() => {
    const total = this.requirements().length;

    if (total === 0) {
      return 0;
    }

    const progress = this.requirements().reduce(
      (sum, requirement) => sum + requirement.progress,
      0,
    );

    return Math.round(progress / total);
  });

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  selectStatus(status: 'all' | RequirementStatus): void {
    this.selectedStatus.set(status);
    this.showFilters.set(false);
  }

  toggleFilters(): void {
    this.showFilters.update((value) => !value);
  }

  refreshRequirements(): void {
    // Punto de integración: el backend reemplazará esta actualización local
    // por la fecha devuelta junto con los requisitos oficiales.
    this.lastUpdated.set(new Date());
  }

  statusLabel(status: RequirementStatus): string {
    const labels: Record<RequirementStatus, string> = {
      completed: 'Completado',
      critical: 'Crítico',
      pending: 'Pendiente',
    };

    return labels[status];
  }

  statusClass(status: RequirementStatus): string {
    const classes: Record<RequirementStatus, string> = {
      completed:
        'border-emerald-200 bg-emerald-50 text-emerald-700',
      critical:
        'border-pink-200 bg-pink-50 text-pink-600',
      pending:
        'border-slate-200 bg-slate-50 text-slate-600',
    };

    return classes[status];
  }

  iconClass(status: RequirementStatus): string {
    const classes: Record<RequirementStatus, string> = {
      completed:
        'bg-emerald-50 text-emerald-600 ring-emerald-100',
      critical:
        'bg-pink-50 text-pink-600 ring-pink-100',
      pending:
        'bg-indigo-50 text-indigo-600 ring-indigo-100',
    };

    return classes[status];
  }

  progressClass(status: RequirementStatus): string {
    const classes: Record<RequirementStatus, string> = {
      completed: 'bg-emerald-500',
      critical: 'bg-pink-500',
      pending: 'bg-indigo-500',
    };

    return classes[status];
  }

  categoryLabel(category: RequirementCategory): string {
    const labels: Record<RequirementCategory, string> = {
      identity: 'Identidad',
      academic: 'Académico',
      economic: 'Económico',
      health: 'Salud',
      consular: 'Consular',
    };

    return labels[category];
  }
}
