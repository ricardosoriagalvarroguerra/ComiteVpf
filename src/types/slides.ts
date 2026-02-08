export type ThemeMode = 'light' | 'dark';

export type ChartDatum = {
  label: string;
  value: number;
  countries?: string[];
  color?: string;
};

export type BarChartConfig = {
  type?: 'bar';
  title: string;
  subtitle: string;
  unit?: string;
  tickEvery?: number;
  showValueLabels?: boolean;
  showValueLabelUnit?: boolean;
  valueLabelFontSize?: string;
  data: ChartDatum[];
};

export type LineChartPoint = {
  date: string;
  value: number;
  x?: number;
};

export type LineChartSeries = {
  id: string;
  label: string;
  color?: string;
  areaOpacity?: number;
  areaColor?: string;
  lineVisible?: boolean;
  lineWidth?: number;
  values: LineChartPoint[];
};

export type LineChartBarSeries = {
  id: string;
  label: string;
  color?: string;
  stackGroup?: string;
  opacity?: number;
  topBorderOnly?: boolean;
  topBorderColor?: string;
  topBorderWidth?: number;
  topBorderDasharray?: string;
  topBorderExtendToPrevGroup?: boolean;
};

export type LineChartBarDatum = {
  date: string;
  values: Record<string, number>;
};

export type LineChartConfig = {
  type: 'line';
  title: string;
  subtitle: string;
  unit?: string;
  xUnit?: string;
  yMin?: number;
  valueFormat?: 'auto' | 'integer';
  xAxis?: 'time' | 'number' | 'category';
  categoryPadding?: number;
  categoryBarWidthRatio?: number;
  barAxis?: 'left' | 'right' | 'none';
  barLayout?: 'stacked' | 'grouped' | 'mixed';
  tooltipMode?: 'shared-x' | 'point';
  seriesLabelMode?: 'none' | 'end' | 'mid';
  sortByX?: boolean;
  showPoints?: boolean;
  lineMode?: 'line' | 'scatter' | 'stacked-area';
  scatterSkipZero?: boolean;
  scatterEnvelope?: boolean;
  scatterEnvelopeWindow?: number;
  scatterEnvelopeSmoothing?: number;
  stackedAreaTotalLabel?: string;
  stackedAreaTotalColor?: string;
  stackedAreaTotalWidth?: number;
  barUnit?: string;
  barOpacity?: number;
  showTooltip?: boolean;
  showBarLabels?: boolean;
  showBarTotalLabels?: boolean;
  barSeries?: LineChartBarSeries[];
  barData?: LineChartBarDatum[];
  series: LineChartSeries[];
};

export type StackedBarSeries = {
  id: string;
  label: string;
  color?: string;
  hollow?: boolean;
  stroke?: string;
  strokeWidth?: number;
  strokeDasharray?: string;
};

export type StackedBarDatum = {
  label: string;
  values: Record<string, number>;
};

export type StackedBarChartConfig = {
  type: 'stacked-bar';
  title: string;
  subtitle: string;
  unit?: string;
  valueFormat?: 'auto' | 'integer';
  showLegend?: boolean;
  showTooltip?: boolean;
  tooltipSkipZero?: boolean;
  projectedTailCount?: number;
  segmentBorder?: 'none' | 'dashed';
  showSegmentLabels?: boolean;
  showTotalLabels?: boolean;
  totalLabelPrefix?: string;
  series: StackedBarSeries[];
  data: StackedBarDatum[];
};

export type ChartConfig = BarChartConfig | LineChartConfig | StackedBarChartConfig;

export type LineDrilldownMetric = 'aprobados' | 'desembolsar' | 'cobrar';

export type LineDrilldownRow = {
  date: string;
  country: string;
  aprobados: number;
  desembolsar: number;
  cobrar: number;
};

export type LineDrilldownConfig = {
  metrics: Array<{ id: LineDrilldownMetric; label: string }>;
  rows: LineDrilldownRow[];
};

export type GroupedBarSeries = {
  id: string;
  label: string;
  color?: string;
};

export type GroupedBarDatum = {
  label: string;
  values: Record<string, number>;
  displayLabel?: string;
};

export type GroupedBarChartConfig = {
  type: 'grouped-bar';
  title: string;
  subtitle: string;
  unit?: string;
  showValueLabels?: boolean;
  valueLabelFontSize?: string;
  orientation?: 'vertical' | 'horizontal';
  series: GroupedBarSeries[];
  data: GroupedBarDatum[];
};

type BaseSlide = {
  id: string;
  indicatorLabel?: string;
};

export type HomeSlide = BaseSlide & {
  type: 'home';
  heroTitle: string;
  heroSubtitle?: string;
  meta?: string;
  body?: string;
};

export type NavigationTopic = {
  id: string;
  title: string;
  description: string;
  tag: string;
};

export type NavigationSlide = BaseSlide & {
  type: 'navigation';
  title: string;
  description: string;
  topics: NavigationTopic[];
};

export type ContentSlide = BaseSlide & {
  type: 'content';
  eyebrow: string;
  title: string;
  description: string;
  highlights: string[];
  chart: ChartConfig;
  chartAnnual?: ChartConfig;
  chartMarginal?: ChartConfig;
  chartAnnualMarginal?: ChartConfig;
  miniChart?: GroupedBarChartConfig;
  miniChartAnnual?: GroupedBarChartConfig;
  miniChartMarginal?: GroupedBarChartConfig;
  miniChartAnnualMarginal?: GroupedBarChartConfig;
  scatterCharts?: {
    ifd: LineChartConfig;
    mercado: LineChartConfig;
  };
  lineDrilldown?: LineDrilldownConfig;
  callout?: {
    title: string;
    body: string;
  };
};

export type ChartGridSlide = BaseSlide & {
  type: 'chart-grid';
  eyebrow: string;
  title: string;
  description: string;
  charts: StackedBarChartConfig[];
};

export type RiskCapacitySlide = BaseSlide & {
  type: 'risk-capacity';
  eyebrow: string;
  title: string;
  description: string;
};

export type DonutMatrixSlide = BaseSlide & {
  type: 'donut-matrix';
  eyebrow: string;
  title: string;
  description: string;
};

export type TableRow = {
  country: string;
  code: string;
  name: string;
  amount: number;
};

export type VigenciaActivationSlide = BaseSlide & {
  type: 'vigencia-activacion';
  eyebrow: string;
  title: string;
  description: string;
  activationStages: TableRow[];
  approvedNotVigent: TableRow[];
};

export type InvestmentPortfolioAsset = {
  id: string;
  label: string;
  value: number;
  color: string;
};

export type SimpleTableColumn = {
  label: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
};

export type SimpleTableRow = {
  cells: string[];
  isTotal?: boolean;
  className?: string;
};

export type SimpleTable = {
  title?: string;
  columns: SimpleTableColumn[];
  rows: SimpleTableRow[];
};

export type InvestmentPortfolioMetricRow = {
  metric: string;
  values: string[];
};

export type InvestmentPortfolioTable = {
  title: string;
  columns: string[];
  rows: InvestmentPortfolioMetricRow[];
};

export type InvestmentPortfolioSlide = BaseSlide & {
  type: 'investment-portfolio';
  eyebrow: string;
  title: string;
  description: string;
  highlights?: string[];
  infoPopover?: {
    title: string;
    body: string[];
  };
  assetChartFormat?: 'millions' | 'percent';
  assetChartShowCenter?: boolean;
  assetClasses: InvestmentPortfolioAsset[];
  maturityProfile: BarChartConfig;
  table: InvestmentPortfolioTable;
};

export type DualChartsSlide = BaseSlide & {
  type: 'dual-charts';
  eyebrow: string;
  title: string;
  description: string;
  highlights?: string[];
  charts: [ChartConfig, ChartConfig];
};

export type DonutGalleryItem = {
  id: string;
  title: string;
  data: InvestmentPortfolioAsset[];
};

export type LiquidityActivityTableRow = {
  ticker: string;
  region: string;
  sector: string;
  rating: string;
  position: string;
  liquidity: string;
  isTotal?: boolean;
};

export type LiquidityActivitySlide = BaseSlide & {
  type: 'liquidity-activity';
  eyebrow: string;
  title: string;
  highlights: string[];
  considerations: string[];
  donutGallery: {
    title: string;
    subtitle: string;
    items: DonutGalleryItem[];
  };
  table: {
    title: string;
    columns: string[];
    rows: LiquidityActivityTableRow[];
  };
};

export type DebtSourcesSlide = BaseSlide & {
  type: 'debt-sources';
  eyebrow: string;
  title: string;
  description?: string;
  tables: [SimpleTable, SimpleTable];
  hint?: string;
};

export type DebtSummarySlide = BaseSlide & {
  type: 'debt-summary';
  eyebrow: string;
  title: string;
  description?: string;
  summaryTable: SimpleTable;
  disbursementTable: SimpleTable;
  pipelineTable: SimpleTable;
  donut: {
    title: string;
    data: InvestmentPortfolioAsset[];
  };
  spreadComparison: GroupedBarChartConfig;
};

export type DebtAuthorizationSlide = BaseSlide & {
  type: 'debt-authorization';
  eyebrow: string;
  title: string;
  description?: string;
  highlights?: string[];
  donut: {
    title: string;
    data: InvestmentPortfolioAsset[];
    drilldown?: {
      parentId: string;
      title: string;
      data: InvestmentPortfolioAsset[];
    };
  };
  chart: LineChartConfig;
  chartExtraTooltip?: Array<{
    id: string;
    label: string;
    values: Record<string, number>;
    color?: string;
  }>;
};

export type RateAnalysisSlide = BaseSlide & {
  type: 'rate-analysis';
  eyebrow?: string;
  title: string;
  description?: string;
  highlights?: string[];
  charts: Array<{
    id: string;
    label: string;
    chart: StackedBarChartConfig;
  }>;
};

export type LineCardsSlide = BaseSlide & {
  type: 'line-cards';
  eyebrow: string;
  title: string;
  description?: string;
  cards: Array<{
    id: string;
    chart?: ChartConfig;
    placeholderTitle?: string;
    placeholderSubtitle?: string;
  }>;
};

export type SlideDefinition =
  | HomeSlide
  | NavigationSlide
  | ContentSlide
  | ChartGridSlide
  | DonutMatrixSlide
  | RiskCapacitySlide
  | VigenciaActivationSlide
  | InvestmentPortfolioSlide
  | DualChartsSlide
  | LiquidityActivitySlide
  | DebtSourcesSlide
  | DebtSummarySlide
  | DebtAuthorizationSlide
  | RateAnalysisSlide
  | LineCardsSlide;
