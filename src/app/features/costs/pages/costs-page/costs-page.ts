import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { RouteService } from '../../../../core/route/route.service';
import {
  Calculator,
  ChevronDown,
  CircleDollarSign,
  FileBadge,
  FileText,
  Info,
  LucideAngularModule,
  Plane,
  ShieldCheck,
} from 'lucide-angular';

type CurrencyCode = 'PEN' | 'MXN' | 'EUR' | 'COP' | 'ARS';
type TripType = 'one-way' | 'round-trip';

interface Currency {
  code: CurrencyCode;
  symbol: string;
  country: string;
  perPen: number;
}

interface CostItem {
  title: string;
  description: string;
  amountPen: number;
  icon: typeof Calculator;
  official: boolean;
  isFlight?: boolean;
}

const currencies: Record<CurrencyCode, Currency> = {
  PEN: { code: 'PEN', symbol: 'S/', country: 'Perú', perPen: 1 },
  MXN: { code: 'MXN', symbol: 'MX$', country: 'México', perPen: 1 / 0.196 },
  EUR: { code: 'EUR', symbol: '€', country: 'Europa', perPen: 1 / 4.008 },
  COP: { code: 'COP', symbol: 'COP$', country: 'Colombia', perPen: 1 / 0.00084 },
  ARS: { code: 'ARS', symbol: 'ARS$', country: 'Argentina', perPen: 1 / 0.0026 },
};

@Component({
  selector: 'app-costs-page',
  imports: [LucideAngularModule, DecimalPipe],
  templateUrl: './costs-page.html',
})
export class CostsPage {
  readonly Calculator = Calculator;
  readonly ChevronDown = ChevronDown;
  readonly Info = Info;
  readonly selectedCurrency = signal<CurrencyCode>('PEN');
  readonly budgetInOriginCurrency = signal(4_000);
  readonly tripType = signal<TripType>('one-way');
  readonly exchangeRates = signal<Partial<Record<CurrencyCode, number>>>({
    PEN: 1,
    MXN: 1 / 0.196,
    EUR: 1 / 4.008,
    COP: 1 / 0.00084,
    ARS: 1 / 0.0026,
  });
  readonly exchangeRateStatus = signal<'loading' | 'updated' | 'fallback'>('loading');
  readonly exchangeRateDate = signal<string | null>(null);

  // Tasas de trámite verificadas el 16/07/2026. El vuelo es una estimación,
  // ya que su precio no es una tasa oficial y varía por fecha y aerolínea.
  readonly costItems = computed(() => this.itemsForCurrentRoute());
  readonly costProfileNote = computed(() => {
    const { origin, destination } = this.routeService.route();
    return `Costos ajustados para ${origin} → ${destination}. Las tasas de visa y residencia dependen del país de llegada.`;
  });

  readonly originCurrency = computed(() =>
    this.currencyFor(this.routeService.route().origin),
  );
  readonly destinationCurrency = computed(() =>
    this.currencyFor(this.routeService.route().destination),
  );
  readonly currencyOptions = computed(() => {
    const options = [this.originCurrency(), this.destinationCurrency()];
    return options.filter(
      (currency, index) => options.findIndex((item) => item.code === currency.code) === index,
    );
  });
  readonly totalPen = computed(() =>
    this.costItems().reduce((total, item) => total + item.amountPen, 0),
  );
  readonly totalSelected = computed(() =>
    this.convertFromPen(this.totalPen(), this.selectedCurrency()),
  );
  readonly totalOrigin = computed(() =>
    this.convertFromPen(this.totalPen(), this.originCurrency().code),
  );
  readonly alternateCurrency = computed(() =>
    this.selectedCurrency() === this.originCurrency().code
      ? this.destinationCurrency()
      : this.originCurrency(),
  );
  readonly alternateTotal = computed(() =>
    this.convertFromPen(this.totalPen(), this.alternateCurrency().code),
  );
  readonly missingAmount = computed(() =>
    Math.max(this.totalOrigin() - this.budgetInOriginCurrency(), 0),
  );
  readonly coveragePercentage = computed(() => {
    if (this.totalOrigin() === 0) return 0;
    return Math.min((this.budgetInOriginCurrency() / this.totalOrigin()) * 100, 100);
  });
  readonly budgetIsEnough = computed(() =>
    this.budgetInOriginCurrency() >= this.totalOrigin(),
  );

  constructor(readonly routeService: RouteService) {
    effect(() => {
      this.selectedCurrency.set(this.currencyFor(this.routeService.route().origin).code);
    });
    void this.loadExchangeRates();
  }

  displayedAmount(item: CostItem): number {
    return this.convertFromPen(item.amountPen, this.selectedCurrency());
  }

  selectedCurrencyInfo(): Currency {
    return currencies[this.selectedCurrency()];
  }

  setCurrency(currency: string): void {
    if (currency in currencies) this.selectedCurrency.set(currency as CurrencyCode);
  }

  setTripType(type: TripType): void {
    this.tripType.set(type);
  }

  updateBudget(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.budgetInOriginCurrency.set(Number.isFinite(value) && value >= 0 ? value : 0);
  }

  private convertFromPen(amount: number, currency: CurrencyCode): number {
    return amount * (this.exchangeRates()[currency] ?? currencies[currency].perPen);
  }

  private itemsForCurrentRoute(): CostItem[] {
    const { origin, destination } = this.routeService.route();
    const items: CostItem[] = [];

    if (origin === 'Perú') {
      items.push(
        {
          title: 'Pasaporte electrónico',
          description: 'Migraciones Perú · tasa oficial',
          amountPen: 120.9,
          icon: FileBadge,
          official: true,
        },
        {
          title: 'Apostillas de documentos',
          description: '2 documentos · S/ 31 por apostilla',
          amountPen: 62,
          icon: FileText,
          official: true,
        },
      );
    } else {
      items.push({
        title: 'Documento de viaje vigente',
        description: `Verifica la tasa del país de origen: ${origin}`,
        amountPen: 0,
        icon: FileBadge,
        official: false,
      });
    }

    if (destination === 'México') {
      items.push(
        {
          title: 'Visa de residente temporal',
          description: 'México · USD 56',
          amountPen: 189.9,
          icon: FileText,
          official: true,
        },
        {
          title: 'Tarjeta de residente temporal',
          description: 'INM México · primer año: MXN 6,789',
          amountPen: 1330.64,
          icon: ShieldCheck,
          official: true,
        },
      );
    } else if (destination === 'Colombia') {
      items.push(
        {
          title: 'Visa de Migrante tipo M',
          description: 'Colombia · USD 260 (estudio y expedición; sin timbre)',
          amountPen: 881.66,
          icon: FileText,
          official: true,
        },
        {
          title: 'Cédula de extranjería',
          description: 'Migración Colombia · COP 294,000',
          amountPen: 246.96,
          icon: ShieldCheck,
          official: true,
        },
      );
    } else {
      items.push({
        title: 'Permiso o visa de residencia',
        description: `Confirma la tasa oficial del consulado de ${destination}`,
        amountPen: 0,
        icon: FileText,
        official: false,
      });
    }

    const flightByDestination: Record<string, number> = {
      Colombia: 594.61,
      México: 1400,
      Argentina: 1100,
      España: 3000,
      Francia: 3200,
      Italia: 3400,
      Portugal: 3000,
    };

    const flightAmount = (flightByDestination[destination] ?? 1400)
      * (this.tripType() === 'round-trip' ? 2 : 1);
    const tripLabel = this.tripType() === 'round-trip' ? 'ida y vuelta' : 'solo ida';

    items.push({
      title: `Vuelo ${tripLabel}: ${origin} → ${destination}`,
      description: 'Precio referencial de aerolínea; varía por fecha, equipaje y tarifa',
      amountPen: flightAmount,
      icon: Plane,
      official: false,
      isFlight: true,
    });

    const arrivalCosts: Record<string, Array<Pick<CostItem, 'title' | 'description' | 'amountPen' | 'icon'>>> = {
      Colombia: [
        { title: 'Equipaje y selección de asiento', description: 'Estimación de servicios de aerolínea', amountPen: 150, icon: Plane },
        { title: 'Traslado desde el aeropuerto', description: 'Estimación para el primer traslado urbano', amountPen: 60, icon: Plane },
        { title: 'Alojamiento temporal (7 noches)', description: 'Estimación inicial antes de alquilar', amountPen: 600, icon: ShieldCheck },
        { title: 'Depósito y primer mes de alquiler', description: 'Estimación de instalación en destino', amountPen: 1800, icon: CircleDollarSign },
        { title: 'Alimentación del primer mes', description: 'Presupuesto de instalación', amountPen: 800, icon: CircleDollarSign },
        { title: 'Transporte local y SIM', description: 'Primer mes de movilidad y conectividad', amountPen: 220, icon: Plane },
      ],
      México: [
        { title: 'Equipaje y selección de asiento', description: 'Estimación de servicios de aerolínea', amountPen: 220, icon: Plane },
        { title: 'Traslado desde el aeropuerto', description: 'Estimación para el primer traslado urbano', amountPen: 100, icon: Plane },
        { title: 'Alojamiento temporal (7 noches)', description: 'Estimación inicial antes de alquilar', amountPen: 900, icon: ShieldCheck },
        { title: 'Depósito y primer mes de alquiler', description: 'Estimación de instalación en destino', amountPen: 2800, icon: CircleDollarSign },
        { title: 'Alimentación del primer mes', description: 'Presupuesto de instalación', amountPen: 1000, icon: CircleDollarSign },
        { title: 'Transporte local y SIM', description: 'Primer mes de movilidad y conectividad', amountPen: 260, icon: Plane },
      ],
    };

    (arrivalCosts[destination] ?? [
      { title: 'Fondo de instalación en destino', description: 'Alojamiento, alimentación, transporte y conectividad inicial', amountPen: 2500, icon: CircleDollarSign },
    ]).forEach((item) => items.push({ ...item, official: false }));

    const emergencyAmount = items.reduce((total, item) => total + item.amountPen, 0) * 0.1;

    items.push({
      title: 'Fondo de emergencia',
      description: '10% del subtotal para imprevistos del primer mes',
      amountPen: emergencyAmount,
      icon: CircleDollarSign,
      official: false,
    });

    return items;
  }

  private async loadExchangeRates(): Promise<void> {
    try {
      const response = await fetch(
        'https://api.frankfurter.dev/v1/latest?base=PEN&symbols=MXN,EUR,COP,ARS',
      );
      if (!response.ok) throw new Error('No se pudo actualizar el tipo de cambio.');

      const data = await response.json() as { date?: string; rates?: Record<CurrencyCode, number> };
      if (!data.rates) throw new Error('Respuesta de tipo de cambio inválida.');

      this.exchangeRates.set({ ...data.rates, PEN: 1 });
      this.exchangeRateDate.set(data.date ?? null);
      this.exchangeRateStatus.set('updated');
    } catch {
      this.exchangeRateStatus.set('fallback');
    }
  }

  private currencyFor(place: string): Currency {
    const currencyByPlace: Record<string, CurrencyCode> = {
      Perú: 'PEN',
      México: 'MXN',
      España: 'EUR',
      Francia: 'EUR',
      Italia: 'EUR',
      Portugal: 'EUR',
      Colombia: 'COP',
      Argentina: 'ARS',
    };

    return currencies[currencyByPlace[place] ?? 'PEN'];
  }
}
