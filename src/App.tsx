import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import Layout from './components/Layout';
import Slide from './components/Slide';
import SlideRenderer from './components/SlideRenderer';
import SlideControls from './components/SlideControls';
import { slides } from './data/slides';
import { countryOrder, countryStackedLegend } from './data/countryStacked';
import { exportSlideToExcel } from './utils/slideExcelExport';
import { exportSlideToPdf } from './utils/slidePdfExport';
import type { LineChartConfig, LineDrilldownMetric, SlideDefinition, ThemeMode } from './types/slides';
import './App.css';

const ExcelDownloadLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 2h10l4 4v16H5z"
      fill="#1f6f43"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path d="M15 2v4h4" fill="#2c8f57" />
    <path d="M15 2v4h4" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
    <path d="M9 9l2.2 3L9 15h2l1.3-2 1.3 2h2l-2.2-3L16 9h-2l-1.7 2.5L10.6 9z" fill="#fff" />
  </svg>
);

const PdfDownloadLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M5 2h10l4 4v16H5z"
      fill="#b4232c"
      stroke="currentColor"
      strokeWidth="0.8"
      strokeLinejoin="round"
    />
    <path d="M15 2v4h4" fill="#d93f48" />
    <path d="M15 2v4h4" stroke="currentColor" strokeWidth="0.8" strokeLinejoin="round" />
    <path
      d="M8.2 10.3h2c1 0 1.6.5 1.6 1.4s-.6 1.4-1.6 1.4H9.6V15H8.2zm1.4 1.1v1h.5c.3 0 .5-.2.5-.5s-.2-.5-.5-.5zM12.6 10.3h1.8c1.4 0 2.2.9 2.2 2.3s-.8 2.4-2.2 2.4h-1.8zm1.4 1.1v2.5h.3c.6 0 .9-.5.9-1.2s-.3-1.3-.9-1.3z"
      fill="#fff"
    />
  </svg>
);

const OptionsLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M12 7a1.6 1.6 0 1 0 0-3.2A1.6 1.6 0 0 0 12 7zm0 6.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2zm0 6.6a1.6 1.6 0 1 0 0-3.2 1.6 1.6 0 0 0 0 3.2z"
      fill="currentColor"
    />
  </svg>
);

const ContentsLogo = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M6 7h2.2M10.8 7H18M6 12h2.2M10.8 12H18M6 17h2.2M10.8 17H18"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const defaultScatterYears = ['2024', '2025'];

const getEndeudamientoScatterYearsBySource = () => {
  const endeudamientoSlide = slides.find(
    (item): item is Extract<SlideDefinition, { type: 'content' }> =>
      item.type === 'content' && item.id === 'analisis-endeudamiento'
  );
  const scatterCharts = endeudamientoSlide?.scatterCharts;
  if (!scatterCharts) {
    return { ifd: [] as string[], mercado: [] as string[] };
  }

  const extractYears = (config: LineChartConfig) =>
    Array.from(new Set(config.series.map((series) => series.id))).sort();

  return {
    ifd: extractYears(scatterCharts.ifd),
    mercado: extractYears(scatterCharts.mercado)
  };
};

const endeudamientoScatterYearsBySource = getEndeudamientoScatterYearsBySource();
const getDefaultScatterYears = (availableYears: string[]) => {
  if (!availableYears.length) return [];
  const preferred = defaultScatterYears.filter((year) => availableYears.includes(year));
  return preferred.length ? preferred : availableYears;
};

const buildSectionIndicatorBySlideId = () => {
  const sectionBySlideId = new Map<string, string>();
  const contentsSlide = slides.find(
    (slide): slide is Extract<SlideDefinition, { type: 'navigation' }> =>
      slide.type === 'navigation' && slide.id === 'navigation-contenidos'
  );

  if (contentsSlide) {
    for (const topic of contentsSlide.topics) {
      const parsedTag = Number.parseInt(topic.tag, 10);
      const sectionNumber = Number.isNaN(parsedTag) ? topic.tag : String(parsedTag);
      const sectionLabel = `${sectionNumber} · ${topic.title}`;
      sectionBySlideId.set(topic.id, sectionLabel);
      for (const topicSlide of topic.slides ?? []) {
        sectionBySlideId.set(topicSlide.id, sectionLabel);
      }
    }
  }

  const orderedIds = slides.map((slide) => slide.id);
  const knownSections = orderedIds
    .map((id, index) => {
      const label = sectionBySlideId.get(id);
      return label ? { index, label } : null;
    })
    .filter((item): item is { index: number; label: string } => Boolean(item));

  if (!knownSections.length) {
    return sectionBySlideId;
  }

  for (let index = 0; index < orderedIds.length; index += 1) {
    const slideId = orderedIds[index];
    if (sectionBySlideId.has(slideId)) {
      continue;
    }
    let nearest: { index: number; label: string } | null = null;
    let nearestDistance = Number.POSITIVE_INFINITY;
    for (const candidate of knownSections) {
      const distance = Math.abs(candidate.index - index);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearest = candidate;
        continue;
      }
      if (
        distance === nearestDistance &&
        nearest &&
        candidate.index > index &&
        nearest.index < index
      ) {
        nearest = candidate;
      }
    }
    sectionBySlideId.set(slideId, nearest?.label ?? '00 · General');
  }

  return sectionBySlideId;
};

const sectionIndicatorBySlideId = buildSectionIndicatorBySlideId();

const resolveSlideVariant = (slide: SlideDefinition): 'hero' | 'navigation' | 'content' | 'grid' => {
  switch (slide.type) {
    case 'home':
    case 'section-title':
      return 'hero';
    case 'navigation':
      return 'navigation';
    case 'chart-grid':
    case 'donut-matrix':
    case 'risk-capacity':
    case 'investment-portfolio':
    case 'rate-analysis':
    case 'line-cards':
    case 'capital-adequacy':
      return 'grid';
    default:
      return 'content';
  }
};

const getInitialTheme = (): ThemeMode => {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  const stored = window.localStorage.getItem('cf-theme');
  if (stored === 'light' || stored === 'dark') {
    return stored;
  }

  return 'light';
};

const clampIndex = (value: number, total: number) => Math.min(Math.max(value, 0), total - 1);

const App = () => {
  const layoutOnly = false;
  const [theme] = useState<ThemeMode>(() => getInitialTheme());
  const [activeIndex, setActiveIndex] = useState(0);
  const [cierreMetric, setCierreMetric] = useState<LineDrilldownMetric | null>(null);
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [showRatio, setShowRatio] = useState(false);
  const [chartGridView, setChartGridView] = useState<'quarterly' | 'annual'>('quarterly');
  const [riskCapacityPercent, setRiskCapacityPercent] = useState(false);
  const [endeudamientoView, setEndeudamientoView] = useState<'quarterly' | 'annual'>('quarterly');
  const [endeudamientoMetric, setEndeudamientoMetric] = useState<
    'ponderado' | 'marginal'
  >('ponderado');
  const [endeudamientoVariant, setEndeudamientoVariant] = useState<'v1' | 'v2'>('v1');
  const [endeudamientoScatterSource, setEndeudamientoScatterSource] = useState<'ifd' | 'mercado'>(
    endeudamientoScatterYearsBySource.ifd.length ? 'ifd' : 'mercado'
  );
  const [endeudamientoScatterYears, setEndeudamientoScatterYears] = useState<string[]>(() =>
    endeudamientoScatterYearsBySource.ifd.length
      ? getDefaultScatterYears(endeudamientoScatterYearsBySource.ifd)
      : getDefaultScatterYears(endeudamientoScatterYearsBySource.mercado)
  );
  const [activitiesInVigenciaInput, setActivitiesInVigenciaInput] = useState('750');
  const globalLegendRef = useRef<HTMLDivElement>(null);
  const [selectedCountries, setSelectedCountries] = useState<string[]>(() => [...countryOrder]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(() =>
    countryStackedLegend.map((item) => item.id)
  );
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== 'undefined' ? window.innerHeight : 0
  );
  const [transitionMs, setTransitionMs] = useState(800);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isDownloadMenuOpen, setIsDownloadMenuOpen] = useState(false);
  const previousIndexRef = useRef(0);
  const [endeudamientoHoverLabel, setEndeudamientoHoverLabel] = useState<string | null>(null);
  const [previsionView, setPrevisionView] = useState<'monto' | 'indice100'>('monto');
  const [previsionHoverLabel, setPrevisionHoverLabel] = useState<string | null>(null);

  const updateScatterYearsForSource = useCallback((source: 'ifd' | 'mercado') => {
    const availableYears = endeudamientoScatterYearsBySource[source];
    if (!availableYears.length) return;
    setEndeudamientoScatterYears(getDefaultScatterYears(availableYears));
  }, []);

  const handleSetEndeudamientoScatterSource = useCallback(
    (
      value:
        | 'ifd'
        | 'mercado'
        | ((prev: 'ifd' | 'mercado') => 'ifd' | 'mercado')
    ) => {
      setEndeudamientoScatterSource((prev) => {
        const next = typeof value === 'function' ? value(prev) : value;
        updateScatterYearsForSource(next);
        return next;
      });
    },
    [updateScatterYearsForSource]
  );

  const slideCount = slides.length;
  const activeSlide = slides[activeIndex];

  useEffect(() => {
    if (endeudamientoVariant === 'v2') {
      setEndeudamientoVariant('v1');
    }
  }, [endeudamientoVariant]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem('cf-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const syncHeight = () => {
      const nextHeight = window.innerHeight;
      setViewportHeight(nextHeight);
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--slide-height', `${nextHeight}px`);
      }
    };

    syncHeight();
    window.addEventListener('resize', syncHeight);
    window.addEventListener('orientationchange', syncHeight);
    return () => {
      window.removeEventListener('resize', syncHeight);
      window.removeEventListener('orientationchange', syncHeight);
    };
  }, []);

  const goToIndex = useCallback(
    (nextIndex: number) => {
      const clamped = clampIndex(nextIndex, slideCount);
      const prevIndex = previousIndexRef.current;
      const distance = Math.max(1, Math.abs(clamped - prevIndex));
      setTransitionMs(Math.min(900, distance * 600));
      previousIndexRef.current = clamped;
      setActiveIndex(clamped);
    },
    [slideCount]
  );

  const goBy = useCallback(
    (delta: number) => {
      goToIndex(previousIndexRef.current + delta);
    },
    [goToIndex]
  );

  const handleNext = useCallback(() => {
    goBy(1);
  }, [goBy]);

  const handlePrev = useCallback(() => {
    goBy(-1);
  }, [goBy]);

  const handleSelect = useCallback(
    (targetId: string) => {
      const targetIndex = slides.findIndex((slide) => slide.id === targetId);
      if (targetIndex !== -1) {
        goToIndex(targetIndex);
      }
    },
    [goToIndex]
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }

      if (
        target?.isContentEditable ||
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.tagName === 'SELECT'
      ) {
        return;
      }

      if (event.key === 'ArrowDown' || event.key === 'PageDown') {
        event.preventDefault();
        goBy(1);
      }

      if (event.key === 'ArrowUp' || event.key === 'PageUp') {
        event.preventDefault();
        goBy(-1);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [goBy]);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const slides = document.querySelectorAll<HTMLElement>('.slide');
    const activeSlideEl = slides[activeIndex];
    if (!activeSlideEl) return;
    activeSlideEl.scrollTop = 0;
  }, [activeIndex]);

  useEffect(() => {
    setIsDownloadMenuOpen(false);
  }, [activeIndex]);

  const activitiesInVigenciaMM = useMemo(() => {
    const normalized = activitiesInVigenciaInput.replace(',', '.');
    const parsed = Number.parseFloat(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }, [activitiesInVigenciaInput]);

  const renderedSlides = slides.map((slide, index) => {
    const sectionLabel = sectionIndicatorBySlideId.get(slide.id) ?? '';
    const showSectionLabel =
      Boolean(sectionLabel) &&
      slide.id !== 'home' &&
      slide.id !== 'navigation-contenidos' &&
      slide.type !== 'section-title';
    const variant = resolveSlideVariant(slide);

    return (
      <Slide key={slide.id} variant={variant} isActive={index === activeIndex} slideId={slide.id}>
        {showSectionLabel ? <p className="slide__section-label">{sectionLabel}</p> : null}
        <SlideRenderer
          slide={slide}
          onSelect={handleSelect}
          layoutOnly={layoutOnly}
          cierreMetric={cierreMetric}
          setCierreMetric={setCierreMetric}
          chartGridState={{
            showBreakdown,
            setShowBreakdown,
            showRatio,
            setShowRatio,
            chartGridView,
            setChartGridView,
            activitiesInVigenciaMM,
            activitiesInVigenciaInput,
            setActivitiesInVigenciaInput,
            globalLegendRef,
            selectedCountries,
            setSelectedCountries,
            selectedCategories,
            setSelectedCategories
          }}
          riskCapacityState={{
            riskCapacityPercent,
            setRiskCapacityPercent
          }}
          endeudamientoState={{
            endeudamientoView,
            setEndeudamientoView,
            endeudamientoMetric,
            setEndeudamientoMetric,
            endeudamientoVariant,
            setEndeudamientoVariant,
            endeudamientoScatterSource,
            setEndeudamientoScatterSource: handleSetEndeudamientoScatterSource,
            endeudamientoScatterYears,
            setEndeudamientoScatterYears,
            endeudamientoHoverLabel,
            setEndeudamientoHoverLabel
          }}
          previsionState={{
            previsionView,
            setPrevisionView,
            previsionHoverLabel,
            setPrevisionHoverLabel
          }}
        />
      </Slide>
    );
  });

  const legendItems = useMemo(
    () => countryStackedLegend.filter((item) => selectedCategories.includes(item.id)),
    [selectedCategories]
  );

  const stageTransform = viewportHeight
    ? `translate3d(0, -${activeIndex * viewportHeight}px, 0)`
    : `translate3d(0, -${activeIndex * 100}vh, 0)`;
  const stageStyle = {
    transform: stageTransform,
    '--slide-transition-duration': `${transitionMs}ms`
  } as CSSProperties;

  const handleExportPdf = useCallback(async () => {
    if (isExportingPdf) return;
    setIsDownloadMenuOpen(false);
    setIsExportingPdf(true);
    try {
      await exportSlideToPdf(activeSlide);
    } catch (error) {
      console.error('Error al exportar PDF de la diapositiva', error);
    } finally {
      setIsExportingPdf(false);
    }
  }, [activeSlide, isExportingPdf]);

  return (
    <Layout>
      <div className="deck">
        <div className="deck__stage" style={stageStyle}>
          {renderedSlides}
        </div>
      </div>
      <div className="slide-controls-stack">
        <SlideControls
          activeIndex={activeIndex}
          total={slideCount}
          onNext={handleNext}
          onPrev={handlePrev}
        />
        <div className="slide-download-menu" data-open={isDownloadMenuOpen ? 'true' : 'false'}>
          <button
            type="button"
            className="chart-card__action-btn slide-download-btn slide-download-btn--options"
            onClick={() => setIsDownloadMenuOpen((prev) => !prev)}
            aria-label="Opciones de descarga"
            title="Opciones"
            aria-expanded={isDownloadMenuOpen}
          >
            <OptionsLogo />
          </button>
          <div className="slide-download-menu__items">
            <button
              type="button"
              className="chart-card__action-btn slide-download-btn"
              onClick={() => {
                setIsDownloadMenuOpen(false);
                exportSlideToExcel(activeSlide);
              }}
              aria-label={`Descargar datos de ${activeSlide.id} en Excel`}
              title="Descargar Excel"
            >
              <ExcelDownloadLogo />
            </button>
            <button
              type="button"
              className="chart-card__action-btn slide-download-btn slide-download-btn--pdf"
              onClick={handleExportPdf}
              aria-label={`Descargar diapositiva ${activeSlide.id} en PDF`}
              title="Descargar PDF"
              disabled={isExportingPdf}
            >
              <PdfDownloadLogo />
            </button>
            <button
              type="button"
              className="chart-card__action-btn slide-download-btn slide-download-btn--contents"
              onClick={() => {
                setIsDownloadMenuOpen(false);
                handleSelect('navigation-contenidos');
              }}
              aria-label="Ir al slide de Contenidos"
              title="Ir a Contenidos"
            >
              <ContentsLogo />
            </button>
          </div>
        </div>
      </div>
      {activeSlide.type === 'chart-grid' && (
        <div
          ref={globalLegendRef}
          className="global-legend"
          role="list"
          aria-label="Leyenda de categorías"
        >
          <span className="global-legend__date" aria-hidden="true" />
          <div className="global-legend__items">
            {legendItems.map((item) => (
              <div
                key={item.id}
                className="global-legend__item"
                role="listitem"
                data-series-id={item.id}
              >
                <span
                  className="global-legend__swatch"
                  style={{ background: item.color ?? 'currentColor' }}
                />
                <span className="global-legend__label">{item.label}</span>
                <span className="global-legend__value" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  );
};

export default App;
