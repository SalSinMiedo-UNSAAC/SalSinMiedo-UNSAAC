import { Component, computed, signal } from '@angular/core';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CloudUpload,
  Download,
  ExternalLink,
  FileText,
  Lightbulb,
  LockKeyhole,
  LucideAngularModule,
  MoreVertical,
  ScanSearch,
  ShieldCheck,
  Sparkles,
  ZoomIn,
} from 'lucide-angular';

interface ValidationItem {
  label: string;
  status: string;
}

interface AdviceItem {
  text: string;
  icon: typeof FileText;
}

@Component({
  selector: 'app-verifier-page',
  imports: [LucideAngularModule],
  templateUrl: './verifier-page.html',
})
export class VerifierPage {
  readonly CloudUpload = CloudUpload;
  readonly Sparkles = Sparkles;
  readonly ShieldCheck = ShieldCheck;
  readonly FileText = FileText;
  readonly Check = Check;
  readonly CheckCircle2 = CheckCircle2;
  readonly AlertTriangle = AlertTriangle;
  readonly Lightbulb = Lightbulb;
  readonly MoreVertical = MoreVertical;
  readonly Download = Download;
  readonly ZoomIn = ZoomIn;
  readonly LockKeyhole = LockKeyhole;
  readonly ExternalLink = ExternalLink;
  readonly ScanSearch = ScanSearch;

  readonly selectedFile = signal<File | null>(null);
  readonly previewUrl = signal<string | null>(null);
  readonly isDragging = signal(false);
  readonly isAnalyzing = signal(false);
  readonly analysisCompleted = signal(false);

  readonly validations: ValidationItem[] = [
    {
      label: 'Autenticidad',
      status: 'Válido',
    },
    {
      label: 'Integridad',
      status: 'Válido',
    },
    {
      label: 'Legibilidad',
      status: 'Válido',
    },
    {
      label: 'Vigencia',
      status: 'Válido',
    },
    {
      label: 'Consistencia de datos',
      status: 'Válido',
    },
  ];

  readonly adviceItems: AdviceItem[] = [
    {
      text: 'Asegúrate de que el documento esté completo y sin cortes.',
      icon: FileText,
    },
    {
      text: 'La imagen debe ser nítida, bien iluminada y sin reflejos.',
      icon: ScanSearch,
    },
    {
      text: 'Evita filtros y ediciones. Usa escáner o cámara en alta resolución.',
      icon: Sparkles,
    },
    {
      text: 'Verifica que todos los datos sean legibles.',
      icon: FileText,
    },
  ];

  readonly fileName = computed(
    () => this.selectedFile()?.name ?? 'Pasaporte_Ismael_Ramos.pdf',
  );

  readonly fileSize = computed(() => {
    const file = this.selectedFile();

    if (!file) {
      return '1.2 MB';
    }

    const sizeInMb = file.size / 1024 / 1024;
    return `${sizeInMb.toFixed(2)} MB`;
  });

  openFileDialog(input: HTMLInputElement): void {
    input.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (file) {
      this.loadFile(file);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging.set(false);

    const file = event.dataTransfer?.files?.[0];

    if (file) {
      this.loadFile(file);
    }
  }

  analyzeDocument(): void {
    if (this.isAnalyzing()) {
      return;
    }

    this.isAnalyzing.set(true);
    this.analysisCompleted.set(false);

    window.setTimeout(() => {
      this.isAnalyzing.set(false);
      this.analysisCompleted.set(true);
    }, 1200);
  }

  private loadFile(file: File): void {
    const validTypes = [
      'application/pdf',
      'image/png',
      'image/jpeg',
      'image/jpg',
    ];

    if (!validTypes.includes(file.type)) {
      alert('Selecciona un archivo PDF, JPG, JPEG o PNG.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no debe superar los 10 MB.');
      return;
    }

    const previousUrl = this.previewUrl();

    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }

    this.selectedFile.set(file);
    this.previewUrl.set(URL.createObjectURL(file));
    this.analysisCompleted.set(false);
  }
}
