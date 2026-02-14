import type { jsPDF as JsPdfInstance } from 'jspdf';
import type { SlideDefinition } from '../types/slides';

type VariantOption = {
  label: string;
  activate: () => Promise<void>;
};

type VariantGroup = {
  label: string;
  options: VariantOption[];
  restore: () => Promise<void>;
};

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

const waitForPaint = async (ms = 260) => {
  await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  await wait(ms);
};

const isVisible = (element: HTMLElement) => {
  const style = window.getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  if (Number.parseFloat(style.opacity || '1') === 0) return false;
  return rect.width > 0 && rect.height > 0;
};

const normalizeLabel = (value: string | null | undefined, fallback: string) => {
  const normalized = (value ?? '').replace(/\s+/g, ' ').trim();
  return normalized || fallback;
};

const clickAndWait = async (button: HTMLButtonElement) => {
  button.click();
  await waitForPaint();
};

const collectGroupedButtonVariants = (
  slideElement: HTMLElement,
  seenButtons: Set<HTMLButtonElement>
): VariantGroup[] => {
  const containers = Array.from(
    slideElement.querySelectorAll<HTMLElement>('[role="group"][aria-label], [role="tablist"][aria-label]')
  ).filter((container) => isVisible(container));

  return containers
    .map((container, containerIndex) => {
      const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>('button')).filter(
        (button) => !button.disabled && isVisible(button)
      );

      if (buttons.length < 2) {
        return null;
      }

      buttons.forEach((button) => seenButtons.add(button));

      const initialIndexFromAria = buttons.findIndex(
        (button) => button.getAttribute('aria-pressed') === 'true'
      );
      const initialIndexFromClass = buttons.findIndex((button) => button.classList.contains('is-active'));
      const initialIndex =
        initialIndexFromAria >= 0 ? initialIndexFromAria : initialIndexFromClass >= 0 ? initialIndexFromClass : 0;

      const groupLabel = normalizeLabel(
        container.getAttribute('aria-label'),
        `Opciones ${containerIndex + 1}`
      );

      const options = buttons.map((button, optionIndex) => {
        const optionLabel = normalizeLabel(
          button.getAttribute('aria-label') || button.textContent,
          `Opción ${optionIndex + 1}`
        );

        return {
          label: optionLabel,
          activate: async () => {
            await clickAndWait(button);
          }
        };
      });

      const initialButton = buttons[initialIndex] ?? buttons[0];

      return {
        label: groupLabel,
        options,
        restore: async () => {
          if (initialButton) {
            await clickAndWait(initialButton);
          }
        }
      } satisfies VariantGroup;
    })
    .filter((entry): entry is VariantGroup => Boolean(entry));
};

const collectStandaloneToggleVariants = (
  slideElement: HTMLElement,
  seenButtons: Set<HTMLButtonElement>
): VariantGroup[] => {
  const toggleButtons = Array.from(slideElement.querySelectorAll<HTMLButtonElement>('button[aria-pressed]')).filter(
    (button) => {
      if (button.disabled) return false;
      if (!isVisible(button)) return false;
      if (seenButtons.has(button)) return false;
      return true;
    }
  );

  return toggleButtons.map((button, index) => {
    const initialState = button.getAttribute('aria-pressed') === 'true';
    const label = normalizeLabel(button.getAttribute('aria-label') || button.textContent, `Toggle ${index + 1}`);

    return {
      label,
      options: [
        {
          label: 'Activo',
          activate: async () => {
            const current = button.getAttribute('aria-pressed') === 'true';
            if (!current) {
              await clickAndWait(button);
            }
          }
        },
        {
          label: 'Inactivo',
          activate: async () => {
            const current = button.getAttribute('aria-pressed') === 'true';
            if (current) {
              await clickAndWait(button);
            }
          }
        }
      ],
      restore: async () => {
        const current = button.getAttribute('aria-pressed') === 'true';
        if (current !== initialState) {
          await clickAndWait(button);
        }
      }
    };
  });
};

const collectSelectVariants = (slideElement: HTMLElement): VariantGroup[] => {
  const selects = Array.from(slideElement.querySelectorAll<HTMLSelectElement>('select')).filter((select) => {
    if (!isVisible(select)) return false;
    const enabledOptions = Array.from(select.options).filter((option) => !option.disabled);
    return enabledOptions.length > 1;
  });

  return selects.map((select, index) => {
    const initialValue = select.value;
    const enabledOptions = Array.from(select.options).filter((option) => !option.disabled);
    const groupLabel = normalizeLabel(select.getAttribute('aria-label') || select.name, `Selector ${index + 1}`);

    return {
      label: groupLabel,
      options: enabledOptions.map((option) => ({
        label: normalizeLabel(option.textContent, option.value),
        activate: async () => {
          if (select.value === option.value) return;
          select.value = option.value;
          select.dispatchEvent(new Event('change', { bubbles: true }));
          await waitForPaint();
        }
      })),
      restore: async () => {
        if (select.value === initialValue) return;
        select.value = initialValue;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        await waitForPaint();
      }
    };
  });
};

const collectVariantGroups = (slideElement: HTMLElement): VariantGroup[] => {
  const seenButtons = new Set<HTMLButtonElement>();
  return [
    ...collectGroupedButtonVariants(slideElement, seenButtons),
    ...collectStandaloneToggleVariants(slideElement, seenButtons),
    ...collectSelectVariants(slideElement)
  ];
};

const captureSlideCanvas = async (slideElement: HTMLElement) => {
  const bounds = slideElement.getBoundingClientRect();
  const width = Math.max(1, Math.round(bounds.width));
  const height = Math.max(1, Math.round(bounds.height));
  const { default: html2canvas } = await import('html2canvas');

  return html2canvas(slideElement, {
    useCORS: true,
    backgroundColor: '#ffffff',
    width,
    height,
    scale: Math.max(1.5, Math.min(2.4, window.devicePixelRatio || 2)),
    scrollX: window.scrollX,
    scrollY: window.scrollY,
    windowWidth: document.documentElement.clientWidth,
    windowHeight: document.documentElement.clientHeight
  });
};

const addCanvasToPdf = (
  pdf: JsPdfInstance,
  canvas: HTMLCanvasElement,
  title: string,
  appendPage: boolean
) => {
  if (appendPage) {
    pdf.addPage();
  }

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const margin = 24;
  const titleGap = 18;

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text(title, margin, margin);

  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2 - titleGap;

  let renderWidth = availableWidth;
  let renderHeight = (canvas.height * renderWidth) / canvas.width;

  if (renderHeight > availableHeight) {
    renderHeight = availableHeight;
    renderWidth = (canvas.width * renderHeight) / canvas.height;
  }

  const x = (pageWidth - renderWidth) / 2;
  const y = margin + titleGap + (availableHeight - renderHeight) / 2;
  const imageData = canvas.toDataURL('image/png');

  pdf.addImage(imageData, 'PNG', x, y, renderWidth, renderHeight, undefined, 'FAST');
};

const sanitizeFileName = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

export const exportSlideToPdf = async (slide: SlideDefinition) => {
  if (typeof document === 'undefined') return;

  const slideElement = document.querySelector<HTMLElement>(`.slide[data-slide-id="${slide.id}"]`);
  if (!slideElement) {
    throw new Error(`No se encontró el slide ${slide.id}`);
  }

  await waitForPaint(320);

  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
    compress: true
  });

  const baseCanvas = await captureSlideCanvas(slideElement);
  addCanvasToPdf(pdf, baseCanvas, `${slide.id} · vista actual`, false);

  const variantGroups = collectVariantGroups(slideElement);

  for (const group of variantGroups) {
    for (const option of group.options) {
      await option.activate();
      const variantCanvas = await captureSlideCanvas(slideElement);
      addCanvasToPdf(pdf, variantCanvas, `${slide.id} · ${group.label}: ${option.label}`, true);
    }

    await group.restore();
  }

  const filename = `${sanitizeFileName(`${slide.id}-slide`) || 'slide'}-export.pdf`;
  pdf.save(filename);
};

export const exportAllSlidesToPdf = async (
  allSlides: SlideDefinition[],
  navigateToSlide: (index: number) => void
) => {
  if (typeof document === 'undefined' || allSlides.length === 0) return;

  const { jsPDF } = await import('jspdf');
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
    compress: true
  });

  for (let i = 0; i < allSlides.length; i++) {
    const slide = allSlides[i];
    navigateToSlide(i);
    await waitForPaint(420);

    const slideElement = document.querySelector<HTMLElement>(`.slide[data-slide-id="${slide.id}"]`);
    if (!slideElement) continue;

    const canvas = await captureSlideCanvas(slideElement);
    const title = ('title' in slide && slide.title) || slide.id;
    addCanvasToPdf(pdf, canvas, `${i + 1}. ${title}`, i > 0);
  }

  pdf.save('comite-finanzas-completo.pdf');
};
