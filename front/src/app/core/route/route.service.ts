import { Injectable, computed, signal } from '@angular/core';

export interface TravelRoute {
  origin: string;
  destination: string;
  reason: string;
  updatedAt: string;
}

export interface Place {
  name: string;
  flag: string;
  coordinates: [number, number];
}

const ROUTE_KEY = 'salsinmiedo-route';
const defaultRoute: TravelRoute = {
  origin: 'Perú',
  destination: 'España',
  reason: 'Estudios',
  updatedAt: new Date().toISOString(),
};

@Injectable({ providedIn: 'root' })
export class RouteService {
  readonly places: Place[] = [
    { name: 'Perú', flag: '🇵🇪', coordinates: [-12.0464, -77.0428] },
    { name: 'Colombia', flag: '🇨🇴', coordinates: [4.711, -74.0721] },
    { name: 'Argentina', flag: '🇦🇷', coordinates: [-34.6037, -58.3816] },
    { name: 'México', flag: '🇲🇽', coordinates: [19.4326, -99.1332] },
    { name: 'España', flag: '🇪🇸', coordinates: [40.4168, -3.7038] },
    { name: 'Francia', flag: '🇫🇷', coordinates: [48.8566, 2.3522] },
    { name: 'Italia', flag: '🇮🇹', coordinates: [41.9028, 12.4964] },
    { name: 'Portugal', flag: '🇵🇹', coordinates: [38.7223, -9.1393] },
  ];
  readonly travelReasons = ['Estudios', 'Trabajo', 'Turismo', 'Reagrupación familiar'];

  private readonly currentRoute = signal<TravelRoute>(this.restore());
  readonly route = this.currentRoute.asReadonly();
  readonly origin = computed(() => this.placeFor(this.route().origin));
  readonly destination = computed(() => this.placeFor(this.route().destination));

  save(route: Omit<TravelRoute, 'updatedAt'>): void {
    const updatedRoute = { ...route, updatedAt: new Date().toISOString() };
    localStorage.setItem(ROUTE_KEY, JSON.stringify(updatedRoute));
    this.currentRoute.set(updatedRoute);
  }

  private placeFor(name: string): Place {
    return this.places.find((place) => place.name === name) ?? this.places[0];
  }

  private restore(): TravelRoute {
    const saved = localStorage.getItem(ROUTE_KEY);
    if (!saved) return defaultRoute;
    try {
      const route = JSON.parse(saved) as Partial<TravelRoute>;
      const validPlace = (name?: string) => !!name && this.places.some((place) => place.name === name);
      return validPlace(route.origin) && validPlace(route.destination) && this.travelReasons.includes(route.reason ?? '')
        ? { origin: route.origin!, destination: route.destination!, reason: route.reason!, updatedAt: route.updatedAt ?? defaultRoute.updatedAt }
        : defaultRoute;
    } catch {
      localStorage.removeItem(ROUTE_KEY);
      return defaultRoute;
    }
  }
}
