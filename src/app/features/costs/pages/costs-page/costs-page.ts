import { DecimalPipe} from '@angular/common';
import { Component, computed, signal } from '@angular/core';
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

type CurrencyCode = 'EUR' | 'PEN';

interface CostItem {
  title: string;
  description: string;
  amount: number;
  icon: typeof Calculator;
}

@Component({
  selector: 'app-costs-page',
  imports: [LucideAngularModule, DecimalPipe],
  templateUrl: './costs-page.html',
})
export class CostsPage {
  readonly Calculator = Calculator;
  readonly ChevronDown = ChevronDown;
  readonly Info = Info;

  readonly exchangeRate = 3.91;
  readonly budgetPen = signal(40_000);
  readonly selectedCurrency = signal<CurrencyCode>('EUR');

  readonly costItems: CostItem[] = [
    {
      title: 'Pasaporte electrónico',
      description: 'Emitido por RENIEC',
      amount: 120,
      icon: FileBadge,
    },
    {
      title: 'Visa de estudios (Tipo D)',
      description: 'Consulado de España',
      amount: 80,
      icon: FileText,
    },
    {
      title: 'Seguro médico internacional',
      description: 'Cobertura mínima: 30 días',
      amount: 300,
      icon: ShieldCheck,
    },
    {
      title: 'Vuelo aproximado',
      description: 'Lima (LIM) → Madrid (MAD)',
      amount: 2800,
      icon: Plane,
    },
    {
      title: 'Traducciones y apostillas',
      description: 'Documentos académicos',
      amount: 250,
      icon: FileText,
    },
    {
      title: 'Fondos mínimos recomendados',
      description: 'Requisito para estudios',
      amount: 6000,
      icon: CircleDollarSign,
    },
  ];

  readonly totalEur = computed(() =>
    this.costItems.reduce((total, item) => total + item.amount, 0),
  );

  readonly totalPen = computed(() => this.totalEur() * this.exchangeRate);

  readonly missingAmount = computed(() =>
    Math.max(this.totalPen() - this.budgetPen(), 0),
  );

  readonly coveragePercentage = computed(() => {
    if (this.totalPen() === 0) {
      return 0;
    }

    return Math.min((this.budgetPen() / this.totalPen()) * 100, 100);
  });

  readonly budgetIsEnough = computed(
    () => this.budgetPen() >= this.totalPen(),
  );

  setCurrency(currency: CurrencyCode): void {
    this.selectedCurrency.set(currency);
  }
}