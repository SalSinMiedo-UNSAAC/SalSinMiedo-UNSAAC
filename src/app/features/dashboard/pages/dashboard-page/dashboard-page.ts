import {
  AfterViewInit,
  Component,
  computed,
  effect,
  OnDestroy,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { RouteService } from '../../../../core/route/route.service';

import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  ExternalLink,
  FileCheck2,
  GraduationCap,
  LucideAngularModule,
  ShieldCheck,
  Timer,
} from 'lucide-angular';

import * as L from 'leaflet';

interface SummaryCard {
  value: number;
  title: string;
  description: string;
  icon: any;
  iconClass: string;
  iconBackground: string;
  descriptionClass?: string;
}

interface RecommendedStep {
  title: string;
  description: string;
  status: string;
  icon: any;
  statusClass: string;
}

interface ImportantPlace {
  name: string;
  description: string;
  color: string;
}

@Component({
  selector: 'app-dashboard-page',
  imports: [
    LucideAngularModule,
    RouterLink,
  ],
  templateUrl: './dashboard-page.html',
})
export class DashboardPage implements AfterViewInit, OnDestroy {
  readonly GraduationCap = GraduationCap;
  readonly AlertTriangle = AlertTriangle;
  readonly ExternalLink = ExternalLink;
  readonly ShieldCheck = ShieldCheck;
  readonly ChevronRight = ChevronRight;

  readonly summaryCards: SummaryCard[] = [
    {
      value: 18,
      title: 'Requisitos totales',
      description: '12 completados',
      icon: ClipboardCheck,
      iconClass: 'text-indigo-600',
      iconBackground: 'bg-indigo-50 ring-indigo-100',
    },
    {
      value: 12,
      title: 'Completados',
      description: 'Último: Hoy',
      icon: CheckCircle2,
      iconClass: 'text-emerald-600',
      iconBackground: 'bg-emerald-50 ring-emerald-100',
    },
    {
      value: 3,
      title: 'Pendientes críticos',
      description: 'Requieren tu acción',
      icon: Timer,
      iconClass: 'text-orange-600',
      iconBackground: 'bg-orange-50 ring-orange-100',
      descriptionClass: 'text-orange-600',
    },
    {
      value: 5,
      title: 'Próximas fechas',
      description: 'En los próximos 30 días',
      icon: CalendarDays,
      iconClass: 'text-indigo-600',
      iconBackground: 'bg-indigo-50 ring-indigo-100',
    },
  ];

  readonly recommendedSteps: RecommendedStep[] = [
    {
      title: 'Sube tu pasaporte para verificar vigencia',
      description: 'Requisito para solicitar el visado de estudios',
      status: 'Crítico',
      icon: FileCheck2,
      statusClass: 'border-pink-200 bg-pink-50 text-pink-600',
    },
    {
      title: 'Completa tu carta de admisión',
      description: 'Documento obligatorio para el visado',
      status: 'Crítico',
      icon: ClipboardCheck,
      statusClass: 'border-pink-200 bg-pink-50 text-pink-600',
    },
    {
      title: 'Contrata tu seguro médico internacional',
      description: 'Debe cubrir toda tu estancia en España',
      status: 'Importante',
      icon: ShieldCheck,
      statusClass: 'border-indigo-200 bg-indigo-50 text-indigo-600',
    },
  ];

  readonly importantPlaces: ImportantPlace[] = [
    {
      name: 'MINREX – Perú',
      description: 'Legalización y antecedentes',
      color: 'bg-indigo-600',
    },
    {
      name: 'MIGRACIONES – Perú',
      description: 'Pasaporte y salida del país',
      color: 'bg-indigo-600',
    },
    {
      name: 'Consulado de España en Lima',
      description: 'Visado de estudios',
      color: 'bg-indigo-600',
    },
    {
      name: 'España',
      description: 'TIE – Tarjeta de Identidad de Extranjero',
      color: 'bg-emerald-500',
    },
  ];

  private routeMap?: L.Map;
  readonly simulatedRequirementCount = computed(() => {
    const { destination, reason } = this.routeService.route();
    const destinationExtra = destination === 'Italia' ? 2 : ['Francia', 'Portugal'].includes(destination) ? 1 : 0;
    const reasonExtra = ['Trabajo', 'Turismo'].includes(reason) ? 1 : 0;
    return 8 + destinationExtra + reasonExtra;
  });

  summaryValue(card: SummaryCard): number {
    return card.title === 'Requisitos totales'
      ? this.simulatedRequirementCount()
      : card.value;
  }

  constructor(readonly routeService: RouteService) {
    effect(() => {
      this.routeService.route();
      if (this.routeMap) {
        this.routeMap.remove();
        this.routeMap = undefined;
        window.setTimeout(() => this.initializeRouteMap());
      }
    });
  }

  ngAfterViewInit(): void {
    window.setTimeout(() => {
      this.initializeRouteMap();
    }, 0);
  }

  ngOnDestroy(): void {
    this.routeMap?.remove();
    this.routeMap = undefined;
  }

  private initializeRouteMap(): void {
    const mapElement = document.getElementById(
      'dashboard-route-map',
    );

    if (!mapElement || this.routeMap) {
      return;
    }

    const origin: L.LatLngExpression = this.routeService.origin().coordinates;
    const destination: L.LatLngExpression = this.routeService.destination().coordinates;

    this.routeMap = L.map(mapElement, {
      zoomControl: false,
      attributionControl: true,
      scrollWheelZoom: false,
      doubleClickZoom: true,
      dragging: true,
    });

    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(this.routeMap);

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      },
    ).addTo(this.routeMap);

    const originMarker = L.marker(origin, {
      icon: this.createRouteMarker(
        this.routeService.origin().flag,
        '#4f46e5',
      ),
    }).addTo(this.routeMap);

    originMarker.bindPopup(`
      <div class="dashboard-map-popup">
        <strong>${this.routeService.origin().name}</strong>

        <p>
          Punto de partida
        </p>
      </div>
    `);

    const destinationMarker = L.marker(destination, {
      icon: this.createRouteMarker(
        this.routeService.destination().flag,
        '#7c3aed',
      ),
    }).addTo(this.routeMap);

    destinationMarker.bindPopup(`
      <div class="dashboard-map-popup">
        <strong>${this.routeService.destination().name}</strong>

        <p>
          Destino de estudios
        </p>
      </div>
    `);

    const routeLine = L.polyline(
      [
        origin,
        destination,
      ],
      {
        color: '#4f46e5',
        weight: 3,
        opacity: 0.9,
        dashArray: '9 10',
        lineCap: 'round',
      },
    ).addTo(this.routeMap);

    this.routeMap.fitBounds(
      routeLine.getBounds(),
      {
        padding: [
          45,
          45,
        ],
      },
    );

    window.setTimeout(() => {
      this.routeMap?.invalidateSize();
    }, 150);
  }

  private createRouteMarker(
    flag: string,
    color: string,
  ): L.DivIcon {
    return L.divIcon({
      className: 'dashboard-route-marker',

      html: `
        <div
          class="dashboard-marker-container"
          style="--marker-color: ${color}"
        >
          <span class="dashboard-marker-flag">
            ${flag}
          </span>

          <span class="dashboard-marker-dot"></span>
        </div>
      `,

      iconSize: [
        48,
        48,
      ],

      iconAnchor: [
        24,
        24,
      ],

      popupAnchor: [
        0,
        -28,
      ],
    });
  }
}
