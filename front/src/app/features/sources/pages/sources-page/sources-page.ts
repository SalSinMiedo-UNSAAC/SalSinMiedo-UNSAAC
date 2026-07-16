import {
  AfterViewInit,
  Component,
  computed,
  effect,
  OnDestroy,
  signal,
} from '@angular/core';
import { RouteService } from '../../../../core/route/route.service';
import {
  BookOpen,
  ExternalLink,
  Info,
  LucideAngularModule,
  MapPin,
  Navigation,
  Search,
  ShieldCheck,
} from 'lucide-angular';

import * as L from 'leaflet';

type InstitutionCategory =
  | 'consulate'
  | 'ministry'
  | 'peru'
  | 'other';

interface Institution {
  id: number;
  name: string;
  description: string;
  category: InstitutionCategory;
  latitude: number;
  longitude: number;
  address: string;
  schedule: string;
  website: string;
  shortLogo: string;
  logoClass: string;
}

@Component({
  selector: 'app-sources-page',
  imports: [LucideAngularModule],
  templateUrl: './sources-page.html',
})
export class SourcesPage implements AfterViewInit, OnDestroy {
  readonly ExternalLink = ExternalLink;
  readonly Info = Info;
  readonly ShieldCheck = ShieldCheck;
  readonly Navigation = Navigation;
  readonly MapPin = MapPin;
  readonly BookOpen = BookOpen;
  readonly Search = Search;

  readonly activeView = signal<'map' | 'list'>('map');
  readonly searchTerm = signal('');
  readonly selectedInstitution = signal<Institution | null>(null);

  private readonly baseInstitutions: Institution[] = [
    {
      id: 1,
      name: 'Consulado General de España en Lima',
      description: 'Trámites de visado y legalizaciones',
      category: 'consulate',
      latitude: -12.0955,
      longitude: -77.0368,
      address: 'Av. Salaverry 3240, San Isidro 15076, Lima – Perú',
      schedule: 'Lun – Vie: 8:30 a. m. – 1:30 p. m.',
      website: 'https://www.exteriores.gob.es/',
      shortLogo: '🇪🇸',
      logoClass: 'bg-red-50',
    },
    {
      id: 2,
      name: 'Ministerio de Asuntos Exteriores de España',
      description: 'Información oficial de requisitos y normativas',
      category: 'ministry',
      latitude: -12.0905,
      longitude: -77.036,
      address: 'Información y trámites digitales',
      schedule: 'Atención mediante canales oficiales',
      website: 'https://www.exteriores.gob.es/',
      shortLogo: '🇪🇸',
      logoClass: 'bg-amber-50',
    },
    {
      id: 3,
      name: 'RENIEC – Perú',
      description: 'Emisión de pasaportes',
      category: 'peru',
      latitude: -12.0874,
      longitude: -77.0501,
      address: 'Sedes de atención a nivel nacional',
      schedule: 'Horario según sede',
      website: 'https://www.reniec.gob.pe/',
      shortLogo: 'PE',
      logoClass: 'bg-indigo-100 text-indigo-700',
    },
    {
      id: 4,
      name: 'MINJUSDH – Perú',
      description: 'Antecedentes penales y apostillas',
      category: 'peru',
      latitude: -12.0998,
      longitude: -77.0346,
      address: 'Lima, Perú',
      schedule: 'Horario según sede',
      website: 'https://www.gob.pe/minjus',
      shortLogo: 'MJ',
      logoClass: 'bg-slate-100 text-slate-700',
    },
    {
      id: 5,
      name: 'SUNAT – Perú',
      description: 'Constancia de no adeudo, de ser el caso',
      category: 'other',
      latitude: -12.111,
      longitude: -77.042,
      address: 'Centros de servicios al contribuyente',
      schedule: 'Horario según oficina',
      website: 'https://www.sunat.gob.pe/',
      shortLogo: 'S',
      logoClass: 'bg-red-50 text-red-600',
    },
  ];

  readonly institutions = computed(() => {
    const destination = this.routeService.destination();
    const officialSources: Record<string, Pick<Institution, 'name' | 'description' | 'website' | 'shortLogo' | 'logoClass'>[]> = {
      España: [
        { name: 'Consulado General de España en Lima', description: 'Visados, citas y servicios consulares', website: 'https://www.exteriores.gob.es/Consulados/lima/es/Paginas/index.aspx', shortLogo: '🇪🇸', logoClass: 'bg-red-50' },
        { name: 'Ministerio de Asuntos Exteriores de España', description: 'Información oficial para solicitantes de visado', website: 'https://www.exteriores.gob.es/Consulados/lima/es/ServiciosConsulares/Paginas/index.aspx?scca=Visados&scco=Per%C3%BA&scd=174&scs=Lugar+de+presentaci%C3%B3n+de+solicitudes+de+visado', shortLogo: 'ES', logoClass: 'bg-amber-50 text-amber-700' },
      ],
      Argentina: [
        { name: 'Embajada de Argentina en Perú', description: 'Servicios consulares y trámites para extranjeros', website: 'https://eperu.cancilleria.gob.ar/es/servicios-consulares', shortLogo: '🇦🇷', logoClass: 'bg-sky-50' },
        { name: 'Dirección Nacional de Migraciones de Argentina', description: 'Información migratoria oficial', website: 'https://www.argentina.gob.ar/interior/migraciones', shortLogo: 'AR', logoClass: 'bg-amber-50 text-amber-700' },
      ],
      Francia: [
        { name: 'Embajada de Francia en Perú', description: 'Información consular y de visados para Francia', website: 'https://pe.ambafrance.org/-Espagnol-', shortLogo: '🇫🇷', logoClass: 'bg-blue-50' },
        { name: 'France-Visas', description: 'Portal oficial para preparar una solicitud de visado', website: 'https://france-visas.gouv.fr/en/web/france-visas/', shortLogo: 'FR', logoClass: 'bg-amber-50 text-amber-700' },
      ],
      Italia: [
        { name: 'Embajada de Italia en Lima', description: 'Servicios consulares y visados de entrada', website: 'https://amblima.esteri.it/es/', shortLogo: '🇮🇹', logoClass: 'bg-emerald-50' },
        { name: 'Visto per l’Italia', description: 'Portal oficial de visados de Italia', website: 'https://vistoperitalia.esteri.it/home.aspx', shortLogo: 'IT', logoClass: 'bg-amber-50 text-amber-700' },
      ],
      Portugal: [
        { name: 'Embajada de Portugal en Lima', description: 'Información consular para Portugal', website: 'https://lima.embaixadaportugal.mne.gov.pt/', shortLogo: '🇵🇹', logoClass: 'bg-emerald-50' },
        { name: 'Portal de Vistos de Portugal', description: 'Información oficial para solicitudes de visado', website: 'https://vistos.mne.gov.pt/pt/', shortLogo: 'PT', logoClass: 'bg-amber-50 text-amber-700' },
      ],
    };
    const sources = officialSources[destination.name] ?? [
      { name: `Representación de ${destination.name} en Perú`, description: 'Consulta la información consular oficial para tu destino.', website: 'https://www.gob.pe/rree', shortLogo: destination.flag, logoClass: 'bg-indigo-50' },
      { name: 'Ministerio de Relaciones Exteriores del Perú', description: 'Apostilla, legalizaciones y orientación consular', website: 'https://www.gob.pe/rree', shortLogo: 'PE', logoClass: 'bg-amber-50 text-amber-700' },
    ];

    return this.baseInstitutions.map((institution, index) =>
      index < 2
        ? {
            ...institution,
            ...sources[index],
            address: 'Lima, Perú · consulta la sede o trámite en el portal oficial',
            schedule: 'Revisa el horario y el sistema de citas oficial',
          }
        : institution,
    );
  });

  private map?: L.Map;
  private markers: L.Marker[] = [];

  constructor(readonly routeService: RouteService) {
    effect(() => {
      this.routeService.route();
      if (this.map) {
        this.map.remove();
        this.map = undefined;
        this.markers = [];
        this.scheduleMapInitialization();
      }
    });
  }

  ngAfterViewInit(): void {
    this.scheduleMapInitialization();
  }

  ngOnDestroy(): void {
    this.map?.remove();
  }

  setActiveView(view: 'map' | 'list'): void {
    this.activeView.set(view);

    if (view === 'map') {
      window.setTimeout(() => {
        // El contenedor se destruye con @if al mostrar la lista. Leaflet debe
        // reinicializarse sobre el nuevo nodo al volver al mapa.
        this.map?.remove();
        this.map = undefined;
        this.markers = [];
        this.initializeMap();
      });
    }
  }

  updateSearch(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value.toLowerCase().trim());
  }

  filteredInstitutions(): Institution[] {
    const term = this.searchTerm();

    if (!term) {
      return this.institutions();
    }

    return this.institutions().filter((institution) => {
      return (
        institution.name.toLowerCase().includes(term) ||
        institution.description.toLowerCase().includes(term)
      );
    });
  }

  selectInstitution(institution: Institution): void {
    this.selectedInstitution.set(institution);

    this.map?.flyTo(
      this.positionForInstitution(institution.id),
      14,
      {
        duration: 0.8,
      },
    );
  }

  openWebsite(institution: Institution): void {
    window.open(
      institution.website,
      '_blank',
      'noopener,noreferrer',
    );
  }

  openDirections(institution: Institution): void {
    const [latitude, longitude] = this.positionForInstitution(institution.id);
    const url =
      `https://www.google.com/maps/dir/?api=1` +
      `&destination=${latitude},${longitude}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  }

  categoryLabel(category: InstitutionCategory): string {
    const labels: Record<InstitutionCategory, string> = {
      consulate: 'Consulado',
      ministry: 'Ministerio',
      peru: 'Trámite Perú',
      other: 'Otra entidad',
    };

    return labels[category];
  }

  categoryBadgeClass(category: InstitutionCategory): string {
    const classes: Record<InstitutionCategory, string> = {
      consulate: 'bg-indigo-50 text-indigo-700',
      ministry: 'bg-red-50 text-red-700',
      peru: 'bg-emerald-50 text-emerald-700',
      other: 'bg-amber-50 text-amber-700',
    };

    return classes[category];
  }

  private initializeMap(): void {
    const mapElement = document.getElementById('sources-map');

    if (!mapElement || this.map) {
      return;
    }

    this.map = L.map(mapElement, {
      center: [-12.0464, -77.0428],
      zoom: 13,
      zoomControl: false,
      attributionControl: true,
    });

    L.control
      .zoom({
        position: 'topright',
      })
      .addTo(this.map);

    L.tileLayer(
      'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        maxZoom: 19,
        attribution: '© OpenStreetMap',
      },
    ).addTo(this.map);

    this.institutions().forEach((institution) => {
      const marker = L.marker(
        this.positionForInstitution(institution.id),
        {
          icon: this.createMarkerIcon(institution.category),
        },
      );

      marker.addTo(this.map!);

      marker.on('click', () => {
        this.selectedInstitution.set(institution);
      });

      this.markers.push(marker);
    });

    this.selectedInstitution.set(this.institutions()[0]);

    window.setTimeout(() => {
      this.map?.invalidateSize();
    }, 100);
  }

  private scheduleMapInitialization(attempt = 0): void {
    window.requestAnimationFrame(() => {
      const mapElement = document.getElementById('sources-map');

      if (!mapElement || !mapElement.clientWidth || !mapElement.clientHeight) {
        if (attempt < 5) {
          window.setTimeout(() => this.scheduleMapInitialization(attempt + 1), 120);
        }
        return;
      }

      this.initializeMap();
      window.setTimeout(() => this.map?.invalidateSize(), 200);
    });
  }

  private createMarkerIcon(
    category: InstitutionCategory,
  ): L.DivIcon {
    const colors: Record<InstitutionCategory, string> = {
      consulate: '#4f46e5',
      ministry: '#ef4444',
      peru: '#16a34a',
      other: '#f59e0b',
    };

    const color = colors[category];

    return L.divIcon({
      className: 'custom-map-marker',
      html: `
        <div
          style="
            width: 34px;
            height: 34px;
            border-radius: 50% 50% 50% 0;
            background: ${color};
            border: 4px solid white;
            box-shadow: 0 5px 14px rgba(15, 23, 42, 0.28);
            transform: rotate(-45deg);
            display: grid;
            place-items: center;
          "
        >
          <span
            style="
              width: 8px;
              height: 8px;
              border-radius: 999px;
              background: white;
              transform: rotate(45deg);
            "
          ></span>
        </div>
      `,
      iconSize: [34, 34],
      iconAnchor: [17, 34],
    });
  }

  private positionForInstitution(id: number): [number, number] {
    const [latitude, longitude] = [-12.0464, -77.0428];
    const offsets: Array<[number, number]> = [
      [0.025, 0.018], [-0.018, 0.026], [0.012, -0.03], [-0.027, -0.014], [0.032, -0.022],
    ];
    const [latitudeOffset, longitudeOffset] = offsets[(id - 1) % offsets.length];
    return [latitude + latitudeOffset, longitude + longitudeOffset];
  }
}
