import type {
  BarChartConfig,
  LineChartConfig,
  LineDrilldownConfig,
  LineDrilldownMetric,
  SlideDefinition,
  GroupedBarChartConfig,
  StackedBarChartConfig
} from '../types/slides';
import { countryStackedCharts } from './countryStacked';

const cierreGeneralChart: LineChartConfig = {
  type: 'line',
  title: 'Stock por estado',
  subtitle: 'S/ millones · cortes trimestrales',
  unit: 'MM',
  series: [
    {
      id: 'aprobados',
      label: 'Aprobados no vigentes',
      values: [
        { date: '31/3/20', value: 212.0 },
        { date: '30/6/20', value: 244.0 },
        { date: '30/9/20', value: 363.9 },
        { date: '31/12/20', value: 477.1 },
        { date: '31/3/21', value: 460.1 },
        { date: '30/6/21', value: 496.3 },
        { date: '30/9/21', value: 432.8 },
        { date: '31/12/21', value: 690.1 },
        { date: '31/3/22', value: 674.8 },
        { date: '30/6/22', value: 428.5 },
        { date: '30/9/22', value: 339.1 },
        { date: '31/12/22', value: 427.1 },
        { date: '31/3/23', value: 427.1 },
        { date: '30/6/23', value: 393.5 },
        { date: '30/9/23', value: 596.8 },
        { date: '31/12/23', value: 357.7 },
        { date: '31/3/24', value: 357.7 },
        { date: '30/6/24', value: 523.4 },
        { date: '30/9/24', value: 368.4 },
        { date: '31/12/24', value: 252.0 },
        { date: '31/3/25', value: 282.0 },
        { date: '30/6/25', value: 351.0 },
        { date: '30/9/25', value: 425.6 },
        { date: '31/12/25', value: 313.8 }
      ]
    },
    {
      id: 'desembolsar',
      label: 'Por desembolsar',
      values: [
        { date: '31/3/20', value: 1060.3 },
        { date: '30/6/20', value: 953.4 },
        { date: '30/9/20', value: 929.6 },
        { date: '31/12/20', value: 892.5 },
        { date: '31/3/21', value: 877.3 },
        { date: '30/6/21', value: 893.2 },
        { date: '30/9/21', value: 841.5 },
        { date: '31/12/21', value: 701.0 },
        { date: '31/3/22', value: 766.7 },
        { date: '30/6/22', value: 992.1 },
        { date: '30/9/22', value: 1019.1 },
        { date: '31/12/22', value: 984.0 },
        { date: '31/3/23', value: 950.4 },
        { date: '30/6/23', value: 1005.5 },
        { date: '30/9/23', value: 1141.4 },
        { date: '31/12/23', value: 1347.5 },
        { date: '31/3/24', value: 1236.3 },
        { date: '30/6/24', value: 1435.9 },
        { date: '30/9/24', value: 1261.5 },
        { date: '31/12/24', value: 1394.4 },
        { date: '31/3/25', value: 1245.0 },
        { date: '30/6/25', value: 1153.3 },
        { date: '30/9/25', value: 1063.8 },
        { date: '31/12/25', value: 1022.4 }
      ]
    },
    {
      id: 'cobrar',
      label: 'Por cobrar',
      values: [
        { date: '31/3/20', value: 952.3 },
        { date: '30/6/20', value: 1104.5 },
        { date: '30/9/20', value: 1147.3 },
        { date: '31/12/20', value: 1251.5 },
        { date: '31/3/21', value: 1295.1 },
        { date: '30/6/21', value: 1319.0 },
        { date: '30/9/21', value: 1398.4 },
        { date: '31/12/21', value: 1519.6 },
        { date: '31/3/22', value: 1528.2 },
        { date: '30/6/22', value: 1577.6 },
        { date: '30/9/22', value: 1611.3 },
        { date: '31/12/22', value: 1760.8 },
        { date: '31/3/23', value: 1759.0 },
        { date: '30/6/23', value: 1744.2 },
        { date: '30/9/23', value: 1770.3 },
        { date: '31/12/23', value: 1877.2 },
        { date: '31/3/24', value: 1993.0 },
        { date: '30/6/24', value: 1997.9 },
        { date: '30/9/24', value: 2206.4 },
        { date: '31/12/24', value: 2382.0 },
        { date: '31/3/25', value: 2469.6 },
        { date: '30/6/25', value: 2448.5 },
        { date: '30/9/25', value: 2513.2 },
        { date: '31/12/25', value: 2590.6 }
      ]
    }
  ]
};

const stackedSeriesColors: Record<LineDrilldownMetric, string> = {
  aprobados: 'var(--series-1)',
  desembolsar: 'var(--series-2)',
  cobrar: 'var(--series-3)'
};

const buildStackedBarConfig = (
  source: LineChartConfig,
  seriesIds: LineDrilldownMetric[],
  overrides: Pick<StackedBarChartConfig, 'title' | 'subtitle' | 'unit'>
): StackedBarChartConfig => {
  const seriesById = new Map(source.series.map((series) => [series.id, series]));
  const series = seriesIds
    .map((id) => {
      const baseSeries = seriesById.get(id);
      if (!baseSeries) return null;
      return {
        id: baseSeries.id,
        label: baseSeries.label,
        color: stackedSeriesColors[id]
      };
    })
    .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry));

  const baseSeries = seriesById.get(seriesIds[0]) ?? source.series[0];
  const dateOrder = baseSeries?.values.map((point) => point.date) ?? [];
  const valuesBySeries = new Map(
    source.series.map((series) => [series.id, new Map(series.values.map((point) => [point.date, point.value]))])
  );

  const data = dateOrder.map((date) => {
    const values: Record<string, number> = {};
    series.forEach((seriesItem) => {
      values[seriesItem.id] = valuesBySeries.get(seriesItem.id)?.get(date) ?? 0;
    });
    return { label: date, values };
  });

  return {
    type: 'stacked-bar',
    title: overrides.title,
    subtitle: overrides.subtitle,
    unit: overrides.unit,
    series,
    data
  };
};

export const cierreGeneralStackedTwoSeries = buildStackedBarConfig(
  cierreGeneralChart,
  ['desembolsar', 'aprobados'],
  {
    title: cierreGeneralChart.title,
    subtitle: cierreGeneralChart.subtitle,
    unit: cierreGeneralChart.unit
  }
);

export const cierreGeneralStackedFull = buildStackedBarConfig(
  cierreGeneralChart,
  ['cobrar', 'aprobados', 'desembolsar'],
  {
    title: cierreGeneralChart.title,
    subtitle: cierreGeneralChart.subtitle,
    unit: cierreGeneralChart.unit
  }
);

export const cierreDrilldown: LineDrilldownConfig = {
  metrics: [
    { id: 'aprobados', label: 'Aprobados no vigentes' },
    { id: 'desembolsar', label: 'Por desembolsar' },
    { id: 'cobrar', label: 'Por cobrar' }
  ],
  rows: [
    { date: '31/3/20', country: 'ARG', aprobados: 20.0, desembolsar: 343.9, cobrar: 239.26 },
    { date: '31/3/20', country: 'BOL', aprobados: 0.0, desembolsar: 127.76, cobrar: 298.4 },
    { date: '31/3/20', country: 'BRA', aprobados: 50.0, desembolsar: 185.17, cobrar: 74.13 },
    { date: '31/3/20', country: 'PAR', aprobados: 142.0, desembolsar: 287.83, cobrar: 150.11 },
    { date: '31/3/20', country: 'URU', aprobados: 0.0, desembolsar: 115.68, cobrar: 190.41 },
    { date: '30/6/20', country: 'ARG', aprobados: 20.0, desembolsar: 291.95, cobrar: 306.5 },
    { date: '30/6/20', country: 'BOL', aprobados: 0.0, desembolsar: 119.26, cobrar: 302.07 },
    { date: '30/6/20', country: 'BRA', aprobados: 82.0, desembolsar: 172.79, cobrar: 84.72 },
    { date: '30/6/20', country: 'PAR', aprobados: 142.0, desembolsar: 279.04, cobrar: 155.53 },
    { date: '30/6/20', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 36.0 },
    { date: '30/6/20', country: 'URU', aprobados: 0.0, desembolsar: 90.38, cobrar: 219.65 },
    { date: '30/9/20', country: 'ARG', aprobados: 70.0, desembolsar: 281.48, cobrar: 310.69 },
    { date: '30/9/20', country: 'BOL', aprobados: 0.0, desembolsar: 96.17, cobrar: 321.87 },
    { date: '30/9/20', country: 'BRA', aprobados: 94.88, desembolsar: 199.65, cobrar: 90.16 },
    { date: '30/9/20', country: 'PAR', aprobados: 142.0, desembolsar: 261.91, cobrar: 171.65 },
    { date: '30/9/20', country: 'RNS', aprobados: 36.0, desembolsar: 0.0, cobrar: 36.0 },
    { date: '30/9/20', country: 'URU', aprobados: 21.0, desembolsar: 90.38, cobrar: 216.92 },
    { date: '31/12/20', country: 'ARG', aprobados: 85.0, desembolsar: 287.54, cobrar: 322.86 },
    { date: '31/12/20', country: 'BOL', aprobados: 0.0, desembolsar: 116.72, cobrar: 331.64 },
    { date: '31/12/20', country: 'BRA', aprobados: 94.88, desembolsar: 180.74, cobrar: 106.05 },
    { date: '31/12/20', country: 'PAR', aprobados: 276.25, desembolsar: 250.41, cobrar: 179.77 },
    { date: '31/12/20', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 72.0 },
    { date: '31/12/20', country: 'URU', aprobados: 21.0, desembolsar: 57.07, cobrar: 239.18 },
    { date: '31/3/21', country: 'ARG', aprobados: 68.0, desembolsar: 299.5, cobrar: 348.12 },
    { date: '31/3/21', country: 'BOL', aprobados: 0.0, desembolsar: 100.82, cobrar: 342.79 },
    { date: '31/3/21', country: 'BRA', aprobados: 94.88, desembolsar: 180.74, cobrar: 105.59 },
    { date: '31/3/21', country: 'PAR', aprobados: 276.25, desembolsar: 239.2, cobrar: 190.11 },
    { date: '31/3/21', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 72.0 },
    { date: '31/3/21', country: 'URU', aprobados: 21.0, desembolsar: 57.07, cobrar: 236.45 },
    { date: '30/6/21', country: 'ARG', aprobados: 43.0, desembolsar: 336.25, cobrar: 352.16 },
    { date: '30/6/21', country: 'BOL', aprobados: 0.0, desembolsar: 96.79, cobrar: 341.39 },
    { date: '30/6/21', country: 'BRA', aprobados: 177.01, desembolsar: 167.1, cobrar: 116.2 },
    { date: '30/6/21', country: 'PAR', aprobados: 276.25, desembolsar: 233.07, cobrar: 192.87 },
    { date: '30/6/21', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 72.0 },
    { date: '30/6/21', country: 'URU', aprobados: 0.0, desembolsar: 59.99, cobrar: 244.35 },
    { date: '30/9/21', country: 'ARG', aprobados: 0.0, desembolsar: 356.6, cobrar: 368.66 },
    { date: '30/9/21', country: 'BOL', aprobados: 0.0, desembolsar: 83.05, cobrar: 350.1 },
    { date: '30/9/21', country: 'BRA', aprobados: 156.51, desembolsar: 161.14, cobrar: 121.7 },
    { date: '30/9/21', country: 'PAR', aprobados: 276.25, desembolsar: 210.22, cobrar: 214.84 },
    { date: '30/9/21', country: 'RNS', aprobados: 0.0, desembolsar: 0.0, cobrar: 72.0 },
    { date: '30/9/21', country: 'URU', aprobados: 0.0, desembolsar: 30.47, cobrar: 271.14 },
    { date: '31/12/21', country: 'ARG', aprobados: 65.3, desembolsar: 313.21, cobrar: 403.81 },
    { date: '31/12/21', country: 'BOL', aprobados: 100.0, desembolsar: 71.39, cobrar: 355.39 },
    { date: '31/12/21', country: 'BRA', aprobados: 206.51, desembolsar: 136.56, cobrar: 143.24 },
    { date: '31/12/21', country: 'PAR', aprobados: 276.25, desembolsar: 146.14, cobrar: 275.55 },
    { date: '31/12/21', country: 'RNS', aprobados: 42.0, desembolsar: 6.0, cobrar: 72.0 },
    { date: '31/12/21', country: 'URU', aprobados: 0.0, desembolsar: 27.71, cobrar: 269.61 },
    { date: '31/3/22', country: 'ARG', aprobados: 0.0, desembolsar: 365.55, cobrar: 409.87 },
    { date: '31/3/22', country: 'BOL', aprobados: 140.0, desembolsar: 68.39, cobrar: 353.41 },
    { date: '31/3/22', country: 'BRA', aprobados: 216.51, desembolsar: 166.56, cobrar: 142.79 },
    { date: '31/3/22', country: 'PAR', aprobados: 276.25, desembolsar: 132.46, cobrar: 283.27 },
    { date: '31/3/22', country: 'RNS', aprobados: 42.0, desembolsar: 6.0, cobrar: 72.0 },
    { date: '31/3/22', country: 'URU', aprobados: 0.0, desembolsar: 27.71, cobrar: 266.88 },
    { date: '30/6/22', country: 'ARG', aprobados: 0.0, desembolsar: 403.2, cobrar: 433.27 },
    { date: '30/6/22', country: 'BOL', aprobados: 40.0, desembolsar: 164.19, cobrar: 349.41 },
    { date: '30/6/22', country: 'BRA', aprobados: 216.51, desembolsar: 156.08, cobrar: 148.94 },
    { date: '30/6/22', country: 'PAR', aprobados: 130.0, desembolsar: 251.4, cobrar: 295.2 },
    { date: '30/6/22', country: 'RNS', aprobados: 42.0, desembolsar: 6.0, cobrar: 72.0 },
    { date: '30/6/22', country: 'URU', aprobados: 0.0, desembolsar: 11.26, cobrar: 278.78 },
    { date: '30/9/22', country: 'ARG', aprobados: 0.0, desembolsar: 369.29, cobrar: 452.47 },
    { date: '30/9/22', country: 'BOL', aprobados: 0.0, desembolsar: 204.19, cobrar: 344.27 },
    { date: '30/9/22', country: 'BRA', aprobados: 164.13, desembolsar: 181.69, cobrar: 150.38 },
    { date: '30/9/22', country: 'PAR', aprobados: 175.0, desembolsar: 229.4, cobrar: 309.96 },
    { date: '30/9/22', country: 'RNS', aprobados: 0.0, desembolsar: 29.5, cobrar: 72.0 },
    { date: '30/9/22', country: 'URU', aprobados: 0.0, desembolsar: 5.06, cobrar: 282.26 },
    { date: '31/12/22', country: 'ARG', aprobados: 87.0, desembolsar: 341.51, cobrar: 490.46 },
    { date: '31/12/22', country: 'BOL', aprobados: 0.0, desembolsar: 140.39, cobrar: 395.01 },
    { date: '31/12/22', country: 'BRA', aprobados: 165.13, desembolsar: 279.74, cobrar: 178.99 },
    { date: '31/12/22', country: 'PAR', aprobados: 175.0, desembolsar: 193.95, cobrar: 342.04 },
    { date: '31/12/22', country: 'RNS', aprobados: 0.0, desembolsar: 25.5, cobrar: 76.0 },
    { date: '31/12/22', country: 'URU', aprobados: 0.0, desembolsar: 2.92, cobrar: 278.34 },
    { date: '31/3/23', country: 'ARG', aprobados: 87.0, desembolsar: 334.86, cobrar: 486.81 },
    { date: '31/3/23', country: 'BOL', aprobados: 0.0, desembolsar: 140.03, cobrar: 389.83 },
    { date: '31/3/23', country: 'BRA', aprobados: 165.13, desembolsar: 275.52, cobrar: 180.84 },
    { date: '31/3/23', country: 'PAR', aprobados: 175.0, desembolsar: 193.95, cobrar: 330.08 },
    { date: '31/3/23', country: 'RNS', aprobados: 0.0, desembolsar: 6.0, cobrar: 95.5 },
    { date: '31/3/23', country: 'URU', aprobados: 0.0, desembolsar: 0.0, cobrar: 275.9 },
    { date: '30/6/23', country: 'ARG', aprobados: 43.4, desembolsar: 374.68, cobrar: 478.75 },
    { date: '30/6/23', country: 'BOL', aprobados: 0.0, desembolsar: 140.03, cobrar: 381.45 },
    { date: '30/6/23', country: 'BRA', aprobados: 175.13, desembolsar: 296.63, cobrar: 185.13 },
    { date: '30/6/23', country: 'PAR', aprobados: 175.0, desembolsar: 172.8, cobrar: 347.85 },
    { date: '30/6/23', country: 'RNS', aprobados: 0.0, desembolsar: 21.33, cobrar: 80.17 },
    { date: '30/6/23', country: 'URU', aprobados: 0.0, desembolsar: 0.0, cobrar: 270.81 },
    { date: '30/9/23', country: 'ARG', aprobados: 43.4, desembolsar: 374.68, cobrar: 468.45 },
    { date: '30/9/23', country: 'BOL', aprobados: 57.25, desembolsar: 134.3, cobrar: 381.84 },
    { date: '30/9/23', country: 'BRA', aprobados: 346.13, desembolsar: 276.62, cobrar: 202.77 },
    { date: '30/9/23', country: 'PAR', aprobados: 0.0, desembolsar: 339.93, cobrar: 340.37 },
    { date: '30/9/23', country: 'RNS', aprobados: 0.0, desembolsar: 15.83, cobrar: 73.67 },
    { date: '30/9/23', country: 'URU', aprobados: 150.0, desembolsar: 0.0, cobrar: 303.18 },
    { date: '31/12/23', country: 'ARG', aprobados: 43.4, desembolsar: 374.68, cobrar: 460.84 },
    { date: '31/12/23', country: 'BOL', aprobados: 113.3, desembolsar: 67.3, cobrar: 440.62 },
    { date: '31/12/23', country: 'BRA', aprobados: 201.0, desembolsar: 402.54, cobrar: 206.26 },
    { date: '31/12/23', country: 'PAR', aprobados: 0.0, desembolsar: 334.65, cobrar: 342.27 },
    { date: '31/12/23', country: 'RNS', aprobados: 0.0, desembolsar: 29.17, cobrar: 98.33 },
    { date: '31/12/23', country: 'URU', aprobados: 0.0, desembolsar: 139.18, cobrar: 328.91 },
    { date: '31/3/24', country: 'ARG', aprobados: 43.4, desembolsar: 349.62, cobrar: 469.66 },
    { date: '31/3/24', country: 'BOL', aprobados: 113.3, desembolsar: 67.3, cobrar: 429.04 },
    { date: '31/3/24', country: 'BRA', aprobados: 141.0, desembolsar: 460.33, cobrar: 205.84 },
    { date: '31/3/24', country: 'PAR', aprobados: 0.0, desembolsar: 327.72, cobrar: 333.47 },
    { date: '31/3/24', country: 'RNS', aprobados: 0.0, desembolsar: 19.67, cobrar: 107.83 },
    { date: '31/3/24', country: 'URU', aprobados: 60.0, desembolsar: 11.65, cobrar: 447.14 },
    { date: '30/6/24', country: 'ARG', aprobados: 193.4, desembolsar: 320.43, cobrar: 466.01 },
    { date: '30/6/24', country: 'BOL', aprobados: 75.0, desembolsar: 174.79, cobrar: 426.92 },
    { date: '30/6/24', country: 'BRA', aprobados: 217.0, desembolsar: 525.3, cobrar: 227.28 },
    { date: '30/6/24', country: 'PAR', aprobados: 0.0, desembolsar: 314.72, cobrar: 343.09 },
    { date: '30/6/24', country: 'RNS', aprobados: 0.0, desembolsar: 29.0, cobrar: 92.5 },
    { date: '30/6/24', country: 'URU', aprobados: 37.96, desembolsar: 71.65, cobrar: 442.05 },
    { date: '30/9/24', country: 'ARG', aprobados: 43.4, desembolsar: 271.29, cobrar: 596.12 },
    { date: '30/9/24', country: 'BOL', aprobados: 75.0, desembolsar: 162.04, cobrar: 427.96 },
    { date: '30/9/24', country: 'BRA', aprobados: 217.0, desembolsar: 500.19, cobrar: 247.67 },
    { date: '30/9/24', country: 'PAR', aprobados: 0.0, desembolsar: 276.33, cobrar: 364.9 },
    { date: '30/9/24', country: 'RNS', aprobados: 20.0, desembolsar: 6.0, cobrar: 86.0 },
    { date: '30/9/24', country: 'URU', aprobados: 12.96, desembolsar: 45.65, cobrar: 483.75 },
    { date: '31/12/24', country: 'ARG', aprobados: 0.0, desembolsar: 282.49, cobrar: 643.22 },
    { date: '31/12/24', country: 'BOL', aprobados: 75.0, desembolsar: 147.69, cobrar: 434.01 },
    { date: '31/12/24', country: 'BRA', aprobados: 157.0, desembolsar: 534.43, cobrar: 268.52 },
    { date: '31/12/24', country: 'PAR', aprobados: 0.0, desembolsar: 257.99, cobrar: 379.87 },
    { date: '31/12/24', country: 'RNS', aprobados: 20.0, desembolsar: 12.0, cobrar: 129.0 },
    { date: '31/12/24', country: 'URU', aprobados: 0.0, desembolsar: 159.85, cobrar: 527.38 },
    { date: '31/3/25', country: 'ARG', aprobados: 0.0, desembolsar: 261.59, cobrar: 621.1 },
    { date: '31/3/25', country: 'BOL', aprobados: 75.0, desembolsar: 127.82, cobrar: 447.39 },
    { date: '31/3/25', country: 'BRA', aprobados: 207.0, desembolsar: 509.22, cobrar: 288.55 },
    { date: '31/3/25', country: 'PAR', aprobados: 0.0, desembolsar: 235.5, cobrar: 385.09 },
    { date: '31/3/25', country: 'RNS', aprobados: 0.0, desembolsar: 12.0, cobrar: 149.0 },
    { date: '31/3/25', country: 'URU', aprobados: 0.0, desembolsar: 98.83, cobrar: 578.5 },
    { date: '30/6/25', country: 'ARG', aprobados: 5.0, desembolsar: 193.53, cobrar: 611.06 },
    { date: '30/6/25', country: 'BOL', aprobados: 75.0, desembolsar: 113.27, cobrar: 448.4 },
    { date: '30/6/25', country: 'BRA', aprobados: 271.0, desembolsar: 496.58, cobrar: 294.59 },
    { date: '30/6/25', country: 'PAR', aprobados: 0.0, desembolsar: 231.63, cobrar: 385.59 },
    { date: '30/6/25', country: 'RNS', aprobados: 0.0, desembolsar: 19.5, cobrar: 135.5 },
    { date: '30/6/25', country: 'URU', aprobados: 0.0, desembolsar: 98.83, cobrar: 573.41 },
    { date: '30/9/25', country: 'ARG', aprobados: 65.0, desembolsar: 171.95, cobrar: 600.98 },
    { date: '30/9/25', country: 'BOL', aprobados: 92.8, desembolsar: 113.27, cobrar: 445.0 },
    { date: '30/9/25', country: 'BRA', aprobados: 267.8, desembolsar: 498.0, cobrar: 330.51 },
    { date: '30/9/25', country: 'PAR', aprobados: 0.0, desembolsar: 182.91, cobrar: 417.05 },
    { date: '30/9/25', country: 'RNS', aprobados: 0.0, desembolsar: 21.0, cobrar: 134.0 },
    { date: '30/9/25', country: 'URU', aprobados: 0.0, desembolsar: 76.71, cobrar: 585.63 },
    { date: '31/12/25', country: 'ARG', aprobados: 65.0, desembolsar: 96.97, cobrar: 598.85 },
    { date: '31/12/25', country: 'BOL', aprobados: 50.0, desembolsar: 150.77, cobrar: 431.73 },
    { date: '31/12/25', country: 'BRA', aprobados: 198.8, desembolsar: 546.85, cobrar: 379.01 },
    { date: '31/12/25', country: 'PAR', aprobados: 0.0, desembolsar: 140.89, cobrar: 455.69 },
    { date: '31/12/25', country: 'RNS', aprobados: 0.0, desembolsar: 28.5, cobrar: 126.5 },
    { date: '31/12/25', country: 'URU', aprobados: 0.0, desembolsar: 58.44, cobrar: 598.81 }
  ]
};

const investmentPortfolioTotal = 1_447_000_000;

const investmentPortfolioAssetClasses = [
  {
    id: 'bonos',
    label: 'Bonos',
    value: investmentPortfolioTotal * (0.71 / 1.004),
    color: '#003049'
  },
  {
    id: 'cds',
    label: 'CDs',
    value: investmentPortfolioTotal * (0.24 / 1.004),
    color: '#d62828'
  },
  {
    id: 'ecps',
    label: 'ECPs (incluye US T-Bills)',
    value: investmentPortfolioTotal * (0.01 / 1.004),
    color: '#f77f00'
  },
  {
    id: 'depositos',
    label: 'Depósitos a la vista',
    value: investmentPortfolioTotal * (0.004 / 1.004),
    color: '#fcbf49'
  },
  {
    id: 'etfs',
    label: 'ETFs',
    value: investmentPortfolioTotal * (0.04 / 1.004),
    color: '#eae2b7'
  }
];

const investmentPortfolioMaturityProfile: BarChartConfig = {
  type: 'bar',
  title: 'Perfil de vencimientos nominal',
  subtitle: 'USD mill.',
  unit: 'MM',
  showValueLabels: true,
  showValueLabelUnit: false,
  valueLabelFontSize: '0.7rem',
  data: [
    { label: '2026 Q1', value: 650, color: 'var(--accent)' },
    { label: '2026 Q2', value: 381, color: 'var(--accent)' },
    { label: '2026 Q3', value: 16, color: 'var(--accent)' },
    { label: '2026 Q4', value: 253, color: 'var(--accent)' },
    { label: '2027', value: 275, color: 'var(--accent)' },
    { label: '2028', value: 239, color: 'var(--accent)' },
    { label: '2029', value: 95, color: 'var(--accent)' },
    { label: '2030', value: 127, color: 'var(--accent)' }
  ]
};

const tasaRiesgoSoberanoChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Tasa de interés - Riesgo soberano',
  subtitle: 'Margen Neto, FOCOM, SOFR',
  unit: '%',
  series: [
    { id: 'sofr', label: 'SOFR', color: '#6c757d' },
    { id: 'margen', label: 'Margen Neto', color: '#d62828' },
    { id: 'focom', label: 'FOCOM', color: '#48cae4' }
  ],
  data: [
    { label: 'ene-24', values: { margen: 2.58, focom: 0.29, sofr: 5.36 } },
    { label: 'feb-24', values: { margen: 2.56, focom: 0.27, sofr: 5.39 } },
    { label: 'mar-24', values: { margen: 2.51, focom: 0.31, sofr: 5.39 } },
    { label: 'abr-24', values: { margen: 2.51, focom: 0.31, sofr: 5.35 } },
    { label: 'may-24', values: { margen: 2.51, focom: 0.31, sofr: 5.37 } },
    { label: 'jun-24', values: { margen: 2.51, focom: 0.31, sofr: 5.39 } },
    { label: 'jul-24', values: { margen: 2.51, focom: 0.31, sofr: 5.44 } },
    { label: 'ago-24', values: { margen: 2.51, focom: 0.30, sofr: 5.43 } },
    { label: 'sept-24', values: { margen: 2.49, focom: 0.31, sofr: 5.22 } },
    { label: 'oct-24', values: { margen: 2.47, focom: 0.34, sofr: 4.89 } },
    { label: 'nov-24', values: { margen: 2.46, focom: 0.35, sofr: 4.69 } },
    { label: 'dic-24', values: { margen: 2.45, focom: 0.35, sofr: 4.57 } },
    { label: 'ene-25', values: { margen: 2.43, focom: 0.36, sofr: 4.38 } },
    { label: 'feb-25', values: { margen: 2.42, focom: 0.37, sofr: 4.41 } },
    { label: 'mar-25', values: { margen: 2.42, focom: 0.37, sofr: 4.38 } },
    { label: 'abr-25', values: { margen: 2.42, focom: 0.38, sofr: 4.37 } },
    { label: 'may-25', values: { margen: 2.41, focom: 0.38, sofr: 4.33 } },
    { label: 'jun-25', values: { margen: 2.41, focom: 0.38, sofr: 4.34 } },
    { label: 'jul-25', values: { margen: 2.41, focom: 0.38, sofr: 4.38 } },
    { label: 'ago-25', values: { margen: 2.40, focom: 0.39, sofr: 4.40 } },
    { label: 'sept-25', values: { margen: 2.39, focom: 0.40, sofr: 4.36 } },
    { label: 'oct-25', values: { margen: 2.39, focom: 0.40, sofr: 4.21 } },
    { label: 'nov-25', values: { margen: 2.39, focom: 0.40, sofr: 4.01 } },
    { label: 'dic-25', values: { margen: 2.38, focom: 0.41, sofr: 3.78 } }
  ]
};

const tasaRiesgoNoSoberanoChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Tasa de interés - Riesgo no soberano',
  subtitle: 'Margen Neto, SOFR',
  unit: '%',
  series: [
    { id: 'sofr', label: 'SOFR', color: '#6c757d' },
    { id: 'margen', label: 'Margen Neto', color: '#d62828' }
  ],
  data: [
    { label: 'ene-24', values: { margen: 3.05, sofr: 5.36 } },
    { label: 'feb-24', values: { margen: 3.03, sofr: 5.37 } },
    { label: 'mar-24', values: { margen: 3.04, sofr: 5.40 } },
    { label: 'abr-24', values: { margen: 3.05, sofr: 5.41 } },
    { label: 'may-24', values: { margen: 3.04, sofr: 5.41 } },
    { label: 'jun-24', values: { margen: 3.03, sofr: 5.47 } },
    { label: 'jul-24', values: { margen: 3.06, sofr: 5.47 } },
    { label: 'ago-24', values: { margen: 3.09, sofr: 5.45 } },
    { label: 'sept-24', values: { margen: 3.09, sofr: 5.26 } },
    { label: 'oct-24', values: { margen: 3.09, sofr: 4.90 } },
    { label: 'nov-24', values: { margen: 3.08, sofr: 4.70 } },
    { label: 'dic-24', values: { margen: 3.08, sofr: 4.64 } },
    { label: 'ene-25', values: { margen: 3.28, sofr: 4.35 } },
    { label: 'feb-25', values: { margen: 3.28, sofr: 4.40 } },
    { label: 'mar-25', values: { margen: 3.27, sofr: 4.37 } },
    { label: 'abr-25', values: { margen: 3.23, sofr: 4.38 } },
    { label: 'may-25', values: { margen: 3.23, sofr: 4.36 } },
    { label: 'jun-25', values: { margen: 3.23, sofr: 4.44 } },
    { label: 'jul-25', values: { margen: 3.23, sofr: 4.41 } },
    { label: 'ago-25', values: { margen: 3.23, sofr: 4.44 } },
    { label: 'sept-25', values: { margen: 3.24, sofr: 4.35 } },
    { label: 'oct-25', values: { margen: 3.24, sofr: 4.22 } },
    { label: 'nov-25', values: { margen: 3.24, sofr: 3.98 } },
    { label: 'dic-25', values: { margen: 3.24, sofr: 3.79 } }
  ]
};

const perfilAmortizacionChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Perfil de amortización',
  subtitle: 'USD mm',
  unit: 'USD mm',
  series: [
    { id: 'restante', label: 'Amort. restante', color: '#6c757d' },
    { id: 'contratos_2025', label: 'Amort. contratos 2025', color: '#d90429' }
  ],
  data: [
    { label: '2026', values: { contratos_2025: 1.7, restante: 308.48 } },
    { label: '2027', values: { contratos_2025: 35.69, restante: 301.93 } },
    { label: '2028', values: { contratos_2025: 79.09, restante: 269.64 } },
    { label: '2029', values: { contratos_2025: 3.27, restante: 274.12 } },
    { label: '2030', values: { contratos_2025: 274.46, restante: 36.18 } },
    { label: '2031', values: { contratos_2025: 134.06, restante: 28.86 } },
    { label: '2032', values: { contratos_2025: 52.59, restante: 26.36 } },
    { label: '2033', values: { contratos_2025: 2.59, restante: 19.09 } },
    { label: '2034', values: { contratos_2025: 2.59, restante: 16.23 } },
    { label: '2035', values: { contratos_2025: 52.59, restante: 14.28 } },
    { label: '2036', values: { contratos_2025: 2.59, restante: 13.98 } },
    { label: '2037', values: { contratos_2025: 2.59, restante: 13.18 } },
    { label: '2038', values: { contratos_2025: 2.59, restante: 13.18 } },
    { label: '2039', values: { contratos_2025: 2.59, restante: 12.75 } },
    { label: '2040', values: { contratos_2025: 62.71, restante: 11.96 } },
    { label: '2041', values: { contratos_2025: 1.11, restante: 10.18 } },
    { label: '2042', values: { contratos_2025: 1.11, restante: 8.89 } },
    { label: '2043', values: { contratos_2025: 1.11, restante: 3.89 } },
    { label: '2044', values: { contratos_2025: 1.11, restante: 3.89 } },
    { label: '2045', values: { contratos_2025: 1.11, restante: 3.89 } },
    { label: '2046', values: { contratos_2025: 1.11, restante: 3.89 } }
  ]
};

const flujosChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Flujos',
  subtitle: 'USD mm',
  unit: 'USD mm',
  series: [
    { id: 'ifd', label: 'IFD', color: '#6c757d' },
    { id: 'mercado', label: 'Mercado', color: '#d90429' }
  ],
  data: [
    { label: '2021', values: { ifd: 18, mercado: 487 } },
    { label: '2022', values: { ifd: 169, mercado: 0 } },
    { label: '2023', values: { ifd: 60, mercado: 54 } },
    { label: '2024', values: { ifd: 180, mercado: 484 } },
    { label: '2025', values: { ifd: 96, mercado: 622 } },
    { label: '2026', values: { ifd: 50, mercado: 700 } }
  ]
};

const stockChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Stock',
  subtitle: 'USD mm',
  unit: 'USD mm',
  series: [
    { id: 'ifd_base', label: 'IFD (base)', color: '#6c757d' },
    { id: 'mercado_base', label: 'Mercado (base)', color: '#d90429' }
  ],
  data: [
    { label: '2020', values: { ifd_base: 399, mercado_base: 149 } },
    { label: '2021', values: { ifd_base: 282, mercado_base: 636 } },
    { label: '2022', values: { ifd_base: 284, mercado_base: 636 } },
    { label: '2023', values: { ifd_base: 357, mercado_base: 673 } },
    { label: '2024', values: { ifd_base: 430, mercado_base: 975 } },
    { label: '2025', values: { ifd_base: 515, mercado_base: 1563 } },
    { label: '2026', values: { ifd_base: 479, mercado_base: 1324 } }
  ]
};

const emisionesSegmentadasChart: StackedBarChartConfig = {
  type: 'stacked-bar',
  title: 'Emisiones 2025 (segmentadas)',
  subtitle: 'USD mm · por mes',
  unit: 'USD mm',
  showLegend: false,
  showSegmentLabels: true,
  tooltipSkipZero: true,
  segmentBorder: 'dashed',
  series: [
    { id: 'mercado_seg1', label: 'Mercado · Segmento 1', color: '#d90429' },
    { id: 'mercado_seg2', label: 'Mercado · Segmento 2', color: '#d90429' },
    { id: 'mercado_seg3', label: 'Mercado · Segmento 3', color: '#d90429' },
    { id: 'mercado_seg4', label: 'Mercado · Segmento 4', color: '#d90429' },
    { id: 'ifd_seg1', label: 'IFD · Segmento 1', color: '#6c757d' },
    { id: 'ifd_seg2', label: 'IFD · Segmento 2', color: '#6c757d' },
    { id: 'ifd_seg3', label: 'IFD · Segmento 3', color: '#6c757d' },
    { id: 'ifd_seg4', label: 'IFD · Segmento 4', color: '#6c757d' }
  ],
  data: [
    { label: '2025-01', values: {} },
    { label: '2025-02', values: { mercado_seg1: 40.0 } },
    { label: '2025-03', values: { mercado_seg1: 50.0, mercado_seg2: 50.0, mercado_seg3: 40.0, mercado_seg4: 30.0 } },
    { label: '2025-04', values: { mercado_seg1: 50.0, ifd_seg1: 50.0 } },
    { label: '2025-05', values: { mercado_seg1: 100.0, mercado_seg2: 50.0 } },
    { label: '2025-06', values: {} },
    { label: '2025-07', values: { ifd_seg1: 11.4 } },
    { label: '2025-08', values: { mercado_seg1: 35.0, mercado_seg2: 25.1 } },
    { label: '2025-09', values: { mercado_seg1: 30.0, mercado_seg2: 20.4 } },
    { label: '2025-10', values: { ifd_seg1: 17.8 } },
    { label: '2025-11', values: { mercado_seg1: 101.5 } },
    { label: '2025-12', values: { ifd_seg1: 10.8, ifd_seg2: 6.4 } }
  ]
};

const endeudamientoChartQuarterly: LineChartConfig = {
  type: 'line',
  title: 'Spread s/SOFR',
  subtitle: 'Cierres trimestrales 2019-2025',
  unit: 'pbs',
  tooltipMode: 'shared-x',
  yMin: 100,
  valueFormat: 'integer',
  barUnit: 'USD mm',
  barOpacity: 0.18,
  barSeries: [
    { id: 'ifd', label: 'IFD', color: '#6c757d' },
    { id: 'mercado', label: 'Mercado', color: '#d90429' }
  ],
  barData: [
    { date: '2019-01-01', values: { ifd: 33.0, mercado: 148.81 } },
    { date: '2019-04-01', values: { ifd: 33.0, mercado: 148.81 } },
    { date: '2019-07-01', values: { ifd: 58.6, mercado: 148.81 } },
    { date: '2019-10-01', values: { ifd: 70.8, mercado: 148.81 } },
    { date: '2020-01-01', values: { ifd: 70.8, mercado: 148.81 } },
    { date: '2020-04-01', values: { ifd: 70.8, mercado: 148.81 } },
    { date: '2020-07-01', values: { ifd: 91.8, mercado: 148.81 } },
    { date: '2020-10-01', values: { ifd: 119.6, mercado: 148.81 } },
    { date: '2021-01-01', values: { ifd: 119.6, mercado: 371.48 } },
    { date: '2021-04-01', values: { ifd: 131.5, mercado: 471.48 } },
    { date: '2021-07-01', values: { ifd: 137.5, mercado: 471.48 } },
    { date: '2021-10-01', values: { ifd: 137.5, mercado: 635.95 } },
    { date: '2022-01-01', values: { ifd: 137.5, mercado: 635.95 } },
    { date: '2022-04-01', values: { ifd: 153.7, mercado: 635.95 } },
    { date: '2022-07-01', values: { ifd: 152.8, mercado: 635.95 } },
    { date: '2022-10-01', values: { ifd: 304.6, mercado: 635.95 } },
    { date: '2023-01-01', values: { ifd: 301.2, mercado: 689.97 } },
    { date: '2023-04-01', values: { ifd: 300.7, mercado: 689.97 } },
    { date: '2023-07-01', values: { ifd: 350.6, mercado: 689.97 } },
    { date: '2023-10-01', values: { ifd: 357.1, mercado: 673.30 } },
    { date: '2024-01-01', values: { ifd: 428.6, mercado: 524.49 } },
    { date: '2024-04-01', values: { ifd: 413.8, mercado: 713.58 } },
    { date: '2024-07-01', values: { ifd: 434.9, mercado: 713.58 } },
    { date: '2024-10-01', values: { ifd: 429.5, mercado: 974.85 } },
    { date: '2025-01-01', values: { ifd: 425.8, mercado: 1184.85 } },
    { date: '2025-04-01', values: { ifd: 475.3, mercado: 1368.18 } },
    { date: '2025-07-01', values: { ifd: 483.0, mercado: 1478.70 } },
    { date: '2025-10-01', values: { ifd: 514.7, mercado: 1563.49 } }
  ],
  series: [
    {
      id: 'ifd',
      label: 'IFD',
      color: '#6c757d',
      values: [
        { date: '2019-01-01', value: 164 },
        { date: '2019-04-01', value: 159 },
        { date: '2019-07-01', value: 154 },
        { date: '2019-10-01', value: 147 },
        { date: '2020-01-01', value: 147 },
        { date: '2020-04-01', value: 140 },
        { date: '2020-07-01', value: 140 },
        { date: '2020-10-01', value: 139 },
        { date: '2021-01-01', value: 143 },
        { date: '2021-04-01', value: 142 },
        { date: '2021-07-01', value: 142 },
        { date: '2021-10-01', value: 147 },
        { date: '2022-01-01', value: 139 },
        { date: '2022-04-01', value: 131 },
        { date: '2022-07-01', value: 135 },
        { date: '2022-10-01', value: 126 },
        { date: '2023-01-01', value: 127 },
        { date: '2023-04-01', value: 117 },
        { date: '2023-07-01', value: 118 },
        { date: '2023-10-01', value: 118 },
        { date: '2024-01-01', value: 127 },
        { date: '2024-04-01', value: 127 },
        { date: '2024-07-01', value: 127 },
        { date: '2024-10-01', value: 126 },
        { date: '2025-01-01', value: 126 },
        { date: '2025-04-01', value: 127 },
        { date: '2025-07-01', value: 127 },
        { date: '2025-10-01', value: 125 }
      ]
    },
    {
      id: 'mercado',
      label: 'Mercado',
      color: '#d90429',
      values: [
        { date: '2019-01-01', value: 160 },
        { date: '2019-04-01', value: 160 },
        { date: '2019-07-01', value: 160 },
        { date: '2019-10-01', value: 160 },
        { date: '2020-01-01', value: 160 },
        { date: '2020-04-01', value: 160 },
        { date: '2020-07-01', value: 160 },
        { date: '2020-10-01', value: 160 },
        { date: '2021-01-01', value: 162 },
        { date: '2021-04-01', value: 161 },
        { date: '2021-07-01', value: 161 },
        { date: '2021-10-01', value: 152 },
        { date: '2022-01-01', value: 152 },
        { date: '2022-04-01', value: 152 },
        { date: '2022-07-01', value: 152 },
        { date: '2022-10-01', value: 152 },
        { date: '2023-01-01', value: 156 },
        { date: '2023-04-01', value: 156 },
        { date: '2023-07-01', value: 156 },
        { date: '2023-10-01', value: 156 },
        { date: '2024-01-01', value: 155 },
        { date: '2024-04-01', value: 163 },
        { date: '2024-07-01', value: 163 },
        { date: '2024-10-01', value: 171 },
        { date: '2025-01-01', value: 166 },
        { date: '2025-04-01', value: 162 },
        { date: '2025-07-01', value: 159 },
        { date: '2025-10-01', value: 160 }
      ]
    },
    {
      id: 'general',
      label: 'General',
      color: '#48cae4',
      values: [
        { date: '2019-01-01', value: 161 },
        { date: '2019-04-01', value: 159 },
        { date: '2019-07-01', value: 157 },
        { date: '2019-10-01', value: 154 },
        { date: '2020-01-01', value: 154 },
        { date: '2020-04-01', value: 146 },
        { date: '2020-07-01', value: 146 },
        { date: '2020-10-01', value: 145 },
        { date: '2021-01-01', value: 152 },
        { date: '2021-04-01', value: 153 },
        { date: '2021-07-01', value: 153 },
        { date: '2021-10-01', value: 150 },
        { date: '2022-01-01', value: 148 },
        { date: '2022-04-01', value: 146 },
        { date: '2022-07-01', value: 148 },
        { date: '2022-10-01', value: 142 },
        { date: '2023-01-01', value: 146 },
        { date: '2023-04-01', value: 144 },
        { date: '2023-07-01', value: 143 },
        { date: '2023-10-01', value: 143 },
        { date: '2024-01-01', value: 142 },
        { date: '2024-04-01', value: 150 },
        { date: '2024-07-01', value: 149 },
        { date: '2024-10-01', value: 157 },
        { date: '2025-01-01', value: 155 },
        { date: '2025-04-01', value: 153 },
        { date: '2025-07-01', value: 151 },
        { date: '2025-10-01', value: 151 }
      ]
    }
  ]
};

const endeudamientoChartAnnual: LineChartConfig = {
  type: 'line',
  title: 'Spread s/SOFR',
  subtitle: 'Cierres anuales 2019-2025',
  unit: 'pbs',
  tooltipMode: 'shared-x',
  yMin: 100,
  valueFormat: 'integer',
  barUnit: 'USD mm',
  barOpacity: 0.18,
  barSeries: [
    { id: 'ifd', label: 'IFD', color: '#6c757d' },
    { id: 'mercado', label: 'Mercado', color: '#d90429' }
  ],
  barData: [
    { date: '2019-12-31', values: { ifd: 70.8, mercado: 148.81 } },
    { date: '2020-12-31', values: { ifd: 119.6, mercado: 148.81 } },
    { date: '2021-12-31', values: { ifd: 137.5, mercado: 635.95 } },
    { date: '2022-12-31', values: { ifd: 304.6, mercado: 635.95 } },
    { date: '2023-12-31', values: { ifd: 357.1, mercado: 673.3 } },
    { date: '2024-12-31', values: { ifd: 429.5, mercado: 974.85 } },
    { date: '2025-12-31', values: { ifd: 514.7, mercado: 1563.49 } }
  ],
  series: [
    {
      id: 'ifd',
      label: 'IFD',
      color: '#6c757d',
      values: [
        { date: '2019-12-31', value: 157 },
        { date: '2020-12-31', value: 141 },
        { date: '2021-12-31', value: 143 },
        { date: '2022-12-31', value: 134 },
        { date: '2023-12-31', value: 121 },
        { date: '2024-12-31', value: 127 },
        { date: '2025-12-31', value: 126 }
      ]
    },
    {
      id: 'mercado',
      label: 'Mercado',
      color: '#d90429',
      values: [
        { date: '2019-12-31', value: 160 },
        { date: '2020-12-31', value: 160 },
        { date: '2021-12-31', value: 160 },
        { date: '2022-12-31', value: 152 },
        { date: '2023-12-31', value: 155 },
        { date: '2024-12-31', value: 163 },
        { date: '2025-12-31', value: 163 }
      ]
    },
    {
      id: 'general',
      label: 'General',
      color: '#48cae4',
      values: [
        { date: '2019-12-31', value: 158.11 },
        { date: '2020-12-31', value: 146.71 },
        { date: '2021-12-31', value: 151.88 },
        { date: '2022-12-31', value: 145.87 },
        { date: '2023-12-31', value: 143.98 },
        { date: '2024-12-31', value: 150.42 },
        { date: '2025-12-31', value: 152.56 }
      ]
    }
  ]
};

const endeudamientoChartQuarterlyMarginal: LineChartConfig = {
  ...endeudamientoChartQuarterly,
  yMin: undefined,
  lineMode: 'scatter',
  scatterSkipZero: true,
  barData: [
    { date: '2019-01-01', values: { ifd: 0.0, mercado: 148.81 } },
    { date: '2019-04-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2019-07-01', values: { ifd: 25.65, mercado: 0.0 } },
    { date: '2019-10-01', values: { ifd: 12.1, mercado: 0.0 } },
    { date: '2020-01-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2020-04-01', values: { ifd: 244.0, mercado: 0.0 } },
    { date: '2020-07-01', values: { ifd: 21.0, mercado: 0.0 } },
    { date: '2020-10-01', values: { ifd: 27.88, mercado: 0.0 } },
    { date: '2021-01-01', values: { ifd: 0.0, mercado: 222.67 } },
    { date: '2021-04-01', values: { ifd: 11.9, mercado: 100.0 } },
    { date: '2021-07-01', values: { ifd: 6.0, mercado: 0.0 } },
    { date: '2021-10-01', values: { ifd: 0.0, mercado: 164.47 } },
    { date: '2022-01-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2022-04-01', values: { ifd: 16.7, mercado: 0.0 } },
    { date: '2022-07-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2022-10-01', values: { ifd: 152.41, mercado: 0.0 } },
    { date: '2023-01-01', values: { ifd: 0.0, mercado: 54.02 } },
    { date: '2023-04-01', values: { ifd: 0.0, mercado: 0.0 } },
    { date: '2023-07-01', values: { ifd: 53.29, mercado: 0.0 } },
    { date: '2023-10-01', values: { ifd: 7.05, mercado: 0.0 } },
    { date: '2024-01-01', values: { ifd: 75.0, mercado: 0.0 } },
    { date: '2024-04-01', values: { ifd: 35.68, mercado: 205.75 } },
    { date: '2024-07-01', values: { ifd: 24.58, mercado: 0.0 } },
    { date: '2024-10-01', values: { ifd: 45.08, mercado: 277.94 } },
    { date: '2025-01-01', values: { ifd: 0.0, mercado: 210.0 } },
    { date: '2025-04-01', values: { ifd: 50.0, mercado: 200.0 } },
    { date: '2025-07-01', values: { ifd: 11.38, mercado: 110.51 } },
    { date: '2025-10-01', values: { ifd: 35.01, mercado: 101.47 } }
  ],
  series: [
    {
      id: 'ifd',
      label: 'IFD',
      color: '#6c757d',
      values: [
        { date: '2019-01-01', value: 0.0 },
        { date: '2019-04-01', value: 0.0 },
        { date: '2019-07-01', value: 136.83 },
        { date: '2019-10-01', value: 113.87 },
        { date: '2020-01-01', value: 0.0 },
        { date: '2020-04-01', value: 138.13 },
        { date: '2020-07-01', value: 158.74 },
        { date: '2020-10-01', value: 130.83 },
        { date: '2021-01-01', value: 0.0 },
        { date: '2021-04-01', value: 146.83 },
        { date: '2021-07-01', value: 95.03 },
        { date: '2021-10-01', value: 0.0 },
        { date: '2022-01-01', value: 0.0 },
        { date: '2022-04-01', value: 90.75 },
        { date: '2022-07-01', value: 0.0 },
        { date: '2022-10-01', value: 116.47 },
        { date: '2023-01-01', value: 0.0 },
        { date: '2023-04-01', value: 0.0 },
        { date: '2023-07-01', value: 104.26 },
        { date: '2023-10-01', value: 125.0 },
        { date: '2024-01-01', value: 175.0 },
        { date: '2024-04-01', value: 128.41 },
        { date: '2024-07-01', value: 116.4 },
        { date: '2024-10-01', value: 110.68 },
        { date: '2025-01-01', value: 0.0 },
        { date: '2025-04-01', value: 135.0 },
        { date: '2025-07-01', value: 121.0 },
        { date: '2025-10-01', value: 97.3 }
      ]
    },
    {
      id: 'mercado',
      label: 'Mercado',
      color: '#d90429',
      values: [
        { date: '2019-01-01', value: 159.8 },
        { date: '2019-04-01', value: 0.0 },
        { date: '2019-07-01', value: 0.0 },
        { date: '2019-10-01', value: 0.0 },
        { date: '2020-01-01', value: 0.0 },
        { date: '2020-04-01', value: 0.0 },
        { date: '2020-07-01', value: 0.0 },
        { date: '2020-10-01', value: 0.0 },
        { date: '2021-01-01', value: 164.03 },
        { date: '2021-04-01', value: 157.83 },
        { date: '2021-07-01', value: 0.0 },
        { date: '2021-10-01', value: 125.2 },
        { date: '2022-01-01', value: 0.0 },
        { date: '2022-04-01', value: 0.0 },
        { date: '2022-07-01', value: 0.0 },
        { date: '2022-10-01', value: 0.0 },
        { date: '2023-01-01', value: 200.19 },
        { date: '2023-04-01', value: 0.0 },
        { date: '2023-07-01', value: 0.0 },
        { date: '2023-10-01', value: 0.0 },
        { date: '2024-01-01', value: 0.0 },
        { date: '2024-04-01', value: 185.15 },
        { date: '2024-07-01', value: 0.0 },
        { date: '2024-10-01', value: 189.17 },
        { date: '2025-01-01', value: 141.12 },
        { date: '2025-04-01', value: 143.18 },
        { date: '2025-07-01', value: 153.46 },
        { date: '2025-10-01', value: 130.0 }
      ]
    }
  ]
};

const endeudamientoChartAnnualMarginal: LineChartConfig = {
  ...endeudamientoChartAnnual,
  yMin: undefined,
  lineMode: 'scatter',
  scatterSkipZero: true,
  barData: [
    { date: '2019-12-31', values: { ifd: 37.75, mercado: 148.81 } },
    { date: '2020-12-31', values: { ifd: 292.88, mercado: 0.0 } },
    { date: '2021-12-31', values: { ifd: 17.9, mercado: 487.14 } },
    { date: '2022-12-31', values: { ifd: 169.11, mercado: 0.0 } },
    { date: '2023-12-31', values: { ifd: 60.34, mercado: 54.02 } },
    { date: '2024-12-31', values: { ifd: 180.34, mercado: 483.69 } },
    { date: '2025-12-31', values: { ifd: 96.39, mercado: 621.98 } }
  ],
  series: [
    {
      id: 'ifd',
      label: 'IFD',
      color: '#6c757d',
      values: [
        { date: '2019-12-31', value: 129.47 },
        { date: '2020-12-31', value: 138.91 },
        { date: '2021-12-31', value: 129.46 },
        { date: '2022-12-31', value: 113.93 },
        { date: '2023-12-31', value: 106.68 },
        { date: '2024-12-31', value: 141.72 },
        { date: '2025-12-31', value: 119.65 }
      ]
    },
    {
      id: 'mercado',
      label: 'Mercado',
      color: '#d90429',
      values: [
        { date: '2019-12-31', value: 159.8 },
        { date: '2020-12-31', value: 0.0 },
        { date: '2021-12-31', value: 149.64 },
        { date: '2022-12-31', value: 0.0 },
        { date: '2023-12-31', value: 200.19 },
        { date: '2024-12-31', value: 187.46 },
        { date: '2025-12-31', value: 142.16 }
      ]
    }
  ]
};

const endeudamientoPlazoPromedio: GroupedBarChartConfig = {
  type: 'grouped-bar',
  title: 'Plazo promedio',
  subtitle: 'Años',
  series: [
    { id: 'ifd', label: 'IFD', color: '#6c757d' },
    { id: 'mercado', label: 'Mercado', color: '#d90429' }
  ],
  data: [
    { label: '2019-01-01', displayLabel: '2019.0-Q1.0', values: { ifd: 10.6, mercado: 4.95 } },
    { label: '2019-04-01', displayLabel: '2019.0-Q2.0', values: { ifd: 10.6, mercado: 4.7 } },
    { label: '2019-07-01', displayLabel: '2019.0-Q3.0', values: { ifd: 13.5, mercado: 4.45 } },
    { label: '2019-10-01', displayLabel: '2019.0-Q4.0', values: { ifd: 13.8, mercado: 4.19 } },
    { label: '2020-01-01', displayLabel: '2020.0-Q1.0', values: { ifd: 13.5, mercado: 3.95 } },
    { label: '2020-04-01', displayLabel: '2020.0-Q2.0', values: { ifd: 5.6, mercado: 3.7 } },
    { label: '2020-07-01', displayLabel: '2020.0-Q3.0', values: { ifd: 5.8, mercado: 3.44 } },
    { label: '2020-10-01', displayLabel: '2020.0-Q4.0', values: { ifd: 6.7, mercado: 3.19 } },
    { label: '2021-01-01', displayLabel: '2021.0-Q1.0', values: { ifd: 6.5, mercado: 4.43 } },
    { label: '2021-04-01', displayLabel: '2021.0-Q2.0', values: { ifd: 7.2, mercado: 4.35 } },
    { label: '2021-07-01', displayLabel: '2021.0-Q3.0', values: { ifd: 7.1, mercado: 4.1 } },
    { label: '2021-10-01', displayLabel: '2021.0-Q4.0', values: { ifd: 9.5, mercado: 4.64 } },
    { label: '2022-01-01', displayLabel: '2022.0-Q1.0', values: { ifd: 9.2, mercado: 4.4 } },
    { label: '2022-04-01', displayLabel: '2022.0-Q2.0', values: { ifd: 12.0, mercado: 4.15 } },
    { label: '2022-07-01', displayLabel: '2022.0-Q3.0', values: { ifd: 11.7, mercado: 3.89 } },
    { label: '2022-10-01', displayLabel: '2022.0-Q4.0', values: { ifd: 10.0, mercado: 3.64 } },
    { label: '2023-01-01', displayLabel: '2023.0-Q1.0', values: { ifd: 9.6, mercado: 3.59 } },
    { label: '2023-04-01', displayLabel: '2023.0-Q2.0', values: { ifd: 11.9, mercado: 3.34 } },
    { label: '2023-07-01', displayLabel: '2023.0-Q3.0', values: { ifd: 12.0, mercado: 3.09 } },
    { label: '2023-10-01', displayLabel: '2023.0-Q4.0', values: { ifd: 12.0, mercado: 2.85 } },
    { label: '2024-01-01', displayLabel: '2024.0-Q1.0', values: { ifd: 10.2, mercado: 3.35 } },
    { label: '2024-04-01', displayLabel: '2024.0-Q2.0', values: { ifd: 11.0, mercado: 3.2 } },
    { label: '2024-07-01', displayLabel: '2024.0-Q3.0', values: { ifd: 10.7, mercado: 2.95 } },
    { label: '2024-10-01', displayLabel: '2024.0-Q4.0', values: { ifd: 12.4, mercado: 3.33 } },
    { label: '2025-01-01', displayLabel: '2025.0-Q1.0', values: { ifd: 12.2, mercado: 3.43 } },
    { label: '2025-04-01', displayLabel: '2025.0-Q2.0', values: { ifd: 11.0, mercado: 3.64 } },
    { label: '2025-07-01', displayLabel: '2025.0-Q3.0', values: { ifd: 10.9, mercado: 3.89 } },
    { label: '2025-10-01', displayLabel: '2025.0-Q4.0', values: { ifd: 11.0, mercado: 3.79 } }
  ]
};

const endeudamientoPlazoPromedioAnnual: GroupedBarChartConfig = {
  type: 'grouped-bar',
  title: 'Plazo promedio',
  subtitle: 'Años',
  series: [
    { id: 'ifd', label: 'IFD', color: '#6c757d' },
    { id: 'mercado', label: 'Mercado', color: '#d90429' }
  ],
  data: [
    { label: '2019-12-31', displayLabel: '2019', values: { ifd: 13.53, mercado: 5.01 } },
    { label: '2020-12-31', displayLabel: '2020', values: { ifd: 7.95, mercado: 5.01 } },
    { label: '2021-12-31', displayLabel: '2021', values: { ifd: 8.6, mercado: 5.3 } },
    { label: '2022-12-31', displayLabel: '2022', values: { ifd: 12.64, mercado: 5.69 } },
    { label: '2023-12-31', displayLabel: '2023', values: { ifd: 13.05, mercado: 5.71 } },
    { label: '2024-12-31', displayLabel: '2024', values: { ifd: 12.71, mercado: 5.39 } },
    { label: '2025-12-31', displayLabel: '2025', values: { ifd: 13.74, mercado: 5.46 } }
  ]
};

const endeudamientoPlazoPromedioMarginal: GroupedBarChartConfig = {
  type: 'grouped-bar',
  title: 'Plazo promedio',
  subtitle: 'Años',
  series: [
    { id: 'ifd', label: 'IFD', color: '#6c757d' },
    { id: 'mercado', label: 'Mercado', color: '#d90429' }
  ],
  data: [
    { label: '2019-01-01', displayLabel: '2019.0-Q1.0', values: { ifd: 0, mercado: 5 } },
    { label: '2019-07-01', displayLabel: '2019.0-Q3.0', values: { ifd: 23.16, mercado: 0 } },
    { label: '2019-10-01', displayLabel: '2019.0-Q4.0', values: { ifd: 15.54, mercado: 0 } },
    { label: '2020-04-01', displayLabel: '2020.0-Q2.0', values: { ifd: 2.12, mercado: 0 } },
    { label: '2020-07-01', displayLabel: '2020.0-Q3.0', values: { ifd: 14.11, mercado: 0 } },
    { label: '2020-10-01', displayLabel: '2020.0-Q4.0', values: { ifd: 21.87, mercado: 0 } },
    { label: '2021-01-01', displayLabel: '2021.0-Q1.0', values: { ifd: 0, mercado: 5.5 } },
    { label: '2021-04-01', displayLabel: '2021.0-Q2.0', values: { ifd: 21.22, mercado: 4.98 } },
    { label: '2021-07-01', displayLabel: '2021.0-Q3.0', values: { ifd: 18, mercado: 0 } },
    { label: '2021-10-01', displayLabel: '2021.0-Q4.0', values: { ifd: 0, mercado: 7 } },
    { label: '2022-04-01', displayLabel: '2022.0-Q2.0', values: { ifd: 16.4, mercado: 0 } },
    { label: '2022-10-01', displayLabel: '2022.0-Q4.0', values: { ifd: 7.69, mercado: 0 } },
    { label: '2023-01-01', displayLabel: '2023.0-Q1.0', values: { ifd: 0, mercado: 5.93 } },
    { label: '2023-07-01', displayLabel: '2023.0-Q3.0', values: { ifd: 14.4, mercado: 0 } },
    { label: '2023-10-01', displayLabel: '2023.0-Q4.0', values: { ifd: 22.94, mercado: 0 } },
    { label: '2024-01-01', displayLabel: '2024.0-Q1.0', values: { ifd: 3, mercado: 0 } },
    { label: '2024-04-01', displayLabel: '2024.0-Q2.0', values: { ifd: 9.39, mercado: 3.45 } },
    { label: '2024-07-01', displayLabel: '2024.0-Q3.0', values: { ifd: 9.36, mercado: 0 } },
    { label: '2024-10-01', displayLabel: '2024.0-Q4.0', values: { ifd: 17.94, mercado: 4.99 } },
    { label: '2025-01-01', displayLabel: '2025.0-Q1.0', values: { ifd: 0, mercado: 5.09 } },
    { label: '2025-04-01', displayLabel: '2025.0-Q2.0', values: { ifd: 3, mercado: 6.25 } },
    { label: '2025-07-01', displayLabel: '2025.0-Q3.0', values: { ifd: 21.35, mercado: 10.21 } },
    { label: '2025-10-01', displayLabel: '2025.0-Q4.0', values: { ifd: 13.72, mercado: 5.49 } }
  ]
};

const endeudamientoPlazoPromedioMarginalAnnual: GroupedBarChartConfig = {
  type: 'grouped-bar',
  title: 'Plazo promedio',
  subtitle: 'Años',
  series: [
    { id: 'ifd', label: 'IFD', color: '#6c757d' },
    { id: 'mercado', label: 'Mercado', color: '#d90429' }
  ],
  data: [
    { label: '2019-12-31', displayLabel: '2019', values: { ifd: 12.1, mercado: 5 } },
    { label: '2020-12-31', displayLabel: '2020', values: { ifd: 3.5, mercado: 0 } },
    { label: '2021-12-31', displayLabel: '2021', values: { ifd: 11.4, mercado: 5.6 } },
    { label: '2022-12-31', displayLabel: '2022', values: { ifd: 5.6, mercado: 0 } },
    { label: '2023-12-31', displayLabel: '2023', values: { ifd: 9.7, mercado: 5.9 } },
    { label: '2024-12-31', displayLabel: '2024', values: { ifd: 5.4, mercado: 4 } },
    { label: '2025-12-31', displayLabel: '2025', values: { ifd: 5.9, mercado: 6.4 } }
  ]
};

type SpreadPlazoRow = {
  instrument: string;
  year: number;
  spread: number;
  plazo: number;
};

const spreadPlazoYearColors: Record<number, string> = {
  2019: '#4e79a7',
  2020: '#f28e2b',
  2021: '#e15759',
  2022: '#76b7b2',
  2023: '#59a14f',
  2024: '#edc948',
  2025: '#b07aa1'
};

const buildSpreadPlazoSeries = (rows: SpreadPlazoRow[]): LineChartConfig['series'] => {
  const byYear = rows.reduce<Map<number, SpreadPlazoRow[]>>((acc, row) => {
    const yearRows = acc.get(row.year);
    if (yearRows) {
      yearRows.push(row);
    } else {
      acc.set(row.year, [row]);
    }
    return acc;
  }, new Map());

  return Array.from(byYear.entries())
    .sort(([yearA], [yearB]) => yearA - yearB)
    .map(([year, points]) => {
      const ordered = [...points].sort((a, b) => a.plazo - b.plazo);
      return {
        id: String(year),
        label: String(year),
        color: spreadPlazoYearColors[year],
        values: ordered.map((point) => ({
          date: point.instrument,
          value: point.spread,
          x: point.plazo
        }))
      };
    });
};

const spreadPlazoBase: Omit<LineChartConfig, 'title' | 'series'> = {
  type: 'line',
  subtitle: 'Plazo (años) · Spread (pbs)',
  unit: 'pbs',
  xAxis: 'number',
  showPoints: true,
  sortByX: false,
  lineMode: 'scatter',
  scatterEnvelope: true
};

const debtSourcesScatterIfd: LineChartConfig = {
  ...spreadPlazoBase,
  title: 'IFD',
  series: buildSpreadPlazoSeries([
    { instrument: 'BID 1 - Desembolso 2', year: 2019, spread: 135.83, plazo: 13.18 },
    { instrument: 'BID 1 - Desembolso 3', year: 2019, spread: 135.83, plazo: 13.0 },
    { instrument: 'ICO 1', year: 2019, spread: 87.83, plazo: 4.75 },
    { instrument: 'AFD 1 - Desembolso 2', year: 2020, spread: 179.83, plazo: 7.16 },
    { instrument: 'BC Bolivia 3', year: 2020, spread: 122.83, plazo: 0.92 },
    { instrument: 'BC Uruguay 1', year: 2020, spread: 127.86, plazo: 0.88 },
    { instrument: 'BC Uruguay 2', year: 2020, spread: 150.36, plazo: 2.42 },
    { instrument: 'BEI 1', year: 2020, spread: 106.03, plazo: 11.05 },
    { instrument: 'BID 1 - Desembolso 4', year: 2020, spread: 130.83, plazo: 12.08 },
    { instrument: 'CAF 1 - Tramo 2', year: 2020, spread: 142.83, plazo: 1.44 },
    { instrument: 'BEI 2', year: 2021, spread: 95.03, plazo: 11.04 },
    { instrument: 'BID 1 - Desembolso 5', year: 2021, spread: 148.83, plazo: 11.21 },
    { instrument: 'BID 1 - Desembolso 6', year: 2021, spread: 148.83, plazo: 11.21 },
    { instrument: 'AFD 2 - Desembolso 1', year: 2022, spread: 144.25, plazo: 7.36 },
    { instrument: 'BEI 3', year: 2022, spread: 87.23, plazo: 10.84 },
    { instrument: 'BEI 4', year: 2022, spread: 81.3, plazo: 11.26 },
    { instrument: 'BID 2 - Desembolso 1', year: 2022, spread: 121.0, plazo: 14.18 },
    { instrument: 'CAF 2 - Tramo 1', year: 2022, spread: 104.0, plazo: 1.75 },
    { instrument: 'CAF 2 - Tramo 2', year: 2022, spread: 138.3, plazo: 1.75 },
    { instrument: 'ICO 2 - Tramo 1', year: 2022, spread: 96.0, plazo: 8.44 },
    { instrument: 'ICO 2 - Tramo 2', year: 2022, spread: 101.0, plazo: 8.7 },
    { instrument: 'BEI 5', year: 2023, spread: 93.1, plazo: 11.0 },
    { instrument: 'BID 2 - Desembolso 2', year: 2023, spread: 125.0, plazo: 13.31 },
    { instrument: 'BID 2 - Desembolso 3', year: 2023, spread: 125.0, plazo: 13.2 },
    { instrument: 'KfW - Desembolso 1', year: 2023, spread: 101.12, plazo: 4.97 },
    { instrument: 'AFD 2 - Desembolso 2', year: 2024, spread: 116.4, plazo: 5.46 },
    { instrument: 'BID 2 - Desembolso 4', year: 2024, spread: 121.0, plazo: 12.36 },
    { instrument: 'BID 2 - Desembolso 5', year: 2024, spread: 121.0, plazo: 12.19 },
    { instrument: 'CAF 3 - Tramo 1', year: 2024, spread: 175.0, plazo: 1.74 },
    { instrument: 'CDP', year: 2024, spread: 130.0, plazo: 3.88 },
    { instrument: 'KfW - Desembolso 2', year: 2024, spread: 78.5, plazo: 3.94 },
    { instrument: 'BID 2 - Desembolso 6', year: 2025, spread: 121.0, plazo: 11.38 },
    { instrument: 'BID 2 - Desembolso 7', year: 2025, spread: 121.0, plazo: 11.19 },
    { instrument: 'CAF 3 - Tramo 2', year: 2025, spread: 135.0, plazo: 1.95 },
    { instrument: 'ICO 3 - Tramo 1', year: 2025, spread: 88.0, plazo: 9.28 },
    { instrument: 'KfW - Desembolso 3', year: 2025, spread: 83.05, plazo: 4.42 }
  ])
};

const debtSourcesScatterMercado: LineChartConfig = {
  ...spreadPlazoBase,
  title: 'Mercado',
  series: buildSpreadPlazoSeries([
    { instrument: 'CHF 2024', year: 2019, spread: 159.8, plazo: 4.2 },
    { instrument: 'BBVA 1', year: 2021, spread: 157.83, plazo: 3.38 },
    { instrument: 'CHF 2026', year: 2021, spread: 164.03, plazo: 4.68 },
    { instrument: 'CHF 2028', year: 2021, spread: 125.2, plazo: 6.92 },
    { instrument: 'JPY 2028', year: 2023, spread: 192.75, plazo: 4.23 },
    { instrument: 'JPY 2029', year: 2023, spread: 205.5, plazo: 5.82 },
    { instrument: 'BBVA 2', year: 2024, spread: 172.37, plazo: 3.69 },
    { instrument: 'CHF 2027', year: 2024, spread: 189.75, plazo: 2.87 },
    { instrument: 'CHF 2029', year: 2024, spread: 202.9, plazo: 4.82 },
    { instrument: 'JPY 2027', year: 2024, spread: 166.4, plazo: 2.46 },
    { instrument: 'JPY 2029 - 2', year: 2024, spread: 188.4, plazo: 4.47 },
    { instrument: 'MTN 1', year: 2025, spread: 130.0, plazo: 2.14 },
    { instrument: 'MTN 10', year: 2025, spread: 130.0, plazo: 5.25 },
    { instrument: 'MTN 11 (INR - DB)', year: 2025, spread: 130.0, plazo: 5.42 },
    { instrument: 'MTN 2', year: 2025, spread: 145.0, plazo: 4.2 },
    { instrument: 'MTN 3', year: 2025, spread: 145.0, plazo: 4.22 },
    { instrument: 'MTN 4.1', year: 2025, spread: 136.5, plazo: 4.24 },
    { instrument: 'MTN 4.2', year: 2025, spread: 145.8, plazo: 6.24 },
    { instrument: 'MTN 5', year: 2025, spread: 167.7, plazo: 9.28 },
    { instrument: 'MTN 6', year: 2025, spread: 135.0, plazo: 4.38 },
    { instrument: 'MTN 7', year: 2025, spread: 135.0, plazo: 4.39 },
    { instrument: 'MTN 8.1', year: 2025, spread: 178.4, plazo: 14.67 },
    { instrument: 'MTN 8.2', year: 2025, spread: 180.0, plazo: 14.67 },
    { instrument: 'MTN 9', year: 2025, spread: 112.5, plazo: 2.75 }
  ])
};

export const slides: SlideDefinition[] = [
  {
    id: 'home',
    type: 'home',
    heroTitle: 'Comité de Finanzas',
    heroSubtitle: 'Jueves 12 de Febrero',
    meta: 'Actualizado al 31 Dic 2025',
    body: 'FONPLATA BANCO DE DESARROLLO'
  },
  {
    id: 'cartera-estado-pais',
    type: 'chart-grid',
    eyebrow: 'Stock por estado · País',
    title: 'Cartera trimestral por país',
    description:
      'Distribución por categoría en cada país con corte trimestral. Cada tarjeta permite abrir el gráfico en pantalla completa.',
    charts: countryStackedCharts
  },
  {
    id: 'proporciones-por-pais',
    type: 'donut-matrix',
    eyebrow: 'Proporciones por país',
    title: 'Matriz de composición por categoría',
    description:
      'Distribución por país para Aprobado no vigente, Por desembolsar y Por cobrar en 2024, 2025 y 2026 (proyectado).'
  },
  {
    id: 'capacidad-prestable-riesgo',
    type: 'risk-capacity',
    eyebrow: 'Capacidad prestable utilizada',
    title: 'Capacidad prestable utilizada por Riesgo',
    description:
      'La capacidad prestable se calcula como la suma de Por cobrar, Por desembolsar y Aprobado no vigente. Se muestra su distribución por país y su clasificación por grado de riesgo.'
  },
  {
    id: 'vigencia-activacion',
    type: 'vigencia-activacion',
    eyebrow: 'Vigencia',
    title: 'Vigencia y Activación Esperada',
    description:
      'Detalle de etapas de activación y aprobadas no vigentes. Totales expresados en USD.',
    activationStages: [
      { country: 'ARGENTINA', code: 'ARG-65/2025 II ETAPA', name: 'AGUA POTABLE MENDOZA', amount: 25_000_000 },
      { country: 'ARGENTINA', code: 'ARG-65/2025 III ETAPA', name: 'AGUA POTABLE MENDOZA', amount: 25_000_000 },
      { country: 'BOLIVIA', code: 'BOL-38/2024 II ETAPA', name: 'GENERACION EMPLEO IV', amount: 50_000_000 },
      {
        country: 'BOLIVIA',
        code: 'BOL-39/2024 II ETAPA',
        name: 'INFRAESTRUCTURA COMPLEMENTARIA',
        amount: 25_000_000
      },
      { country: 'PARAGUAY', code: 'PAR-27/2019 II ETAPA', name: 'YPEJHÚ', amount: 90_000_000 },
      { country: 'PARAGUAY', code: 'PAR-28/2020 II ETAPA', name: 'BIOCEANICO', amount: 110_000_000 },
      { country: 'PARAGUAY', code: 'PAR-28/2020 III ETAPA', name: 'BIOCEANICO', amount: 110_000_000 },
      {
        country: 'URUGUAY',
        code: 'URU-25/2024 II ETAPA',
        name: 'UNIVERSALIZACIÓN DEL SANEAMIENTO',
        amount: 120_000_000
      },
      {
        country: 'URUGUAY',
        code: 'URU-25/2024 III ETAPA',
        name: 'UNIVERSALIZACIÓN DEL SANEAMIENTO',
        amount: 125_000_000
      },
      {
        country: 'URUGUAY',
        code: 'URU-25/2024 IV ETAPA',
        name: 'UNIVERSALIZACIÓN DEL SANEAMIENTO',
        amount: 20_000_000
      },
      { country: 'URUGUAY', code: 'URU-26/2024 II ETAPA', name: 'CAJA BANCARIA', amount: 25_000_000 },
      { country: 'URUGUAY', code: 'URU-27/2024 II ETAPA', name: 'SANEAMIENTO MALDONADO', amount: 22_540_000 },
      { country: 'URUGUAY', code: 'URU-27/2024 III ETAPA', name: 'SANEAMIENTO MALDONADO', amount: 14_410_000 },
      { country: 'URUGUAY', code: 'URU-27/2024 IV ETAPA', name: 'SANEAMIENTO MALDONADO', amount: 5_090_000 }
    ],
    approvedNotVigent: [
      { country: 'ARGENTINA', code: 'ARG-064#1', name: 'BIOCEANICO SALTA', amount: 35_000_000 },
      { country: 'ARGENTINA', code: 'ARG-066#1', name: 'INFRAESTRUCTURA PRIORITARIA CHACO', amount: 30_000_000 },
      { country: 'BOLIVIA', code: 'BOL-038#1', name: 'GENERACION EMPLEO IV', amount: 50_000_000 },
      { country: 'BRASIL', code: 'BRA-041#1', name: 'FLORIANOPOLIS', amount: 50_000_000 },
      { country: 'BRASIL', code: 'BRA-045#1', name: 'ITAPEVI', amount: 28_800_000 },
      { country: 'BRASIL', code: 'BRA-047#1', name: 'PRODESAN PARA LAGOS - COSANPA', amount: 50_000_000 },
      { country: 'BRASIL', code: 'BRA-050#1', name: 'MOVILIDAD Y DRENAJE PROMOD', amount: 50_000_000 },
      { country: 'BRASIL', code: 'BRA-051#1', name: 'PETROLINA', amount: 20_000_000 }
    ]
  },
  {
    id: 'cartera-inversiones-fonplata',
    type: 'investment-portfolio',
    eyebrow: 'Cartera de inversiones',
    title: 'Cartera de Inversiones FONPLATA',
    description:
      'Las tasas de rendimiento son calculadas utilizando la metodología “time-weighted”, que muestra el rendimiento obtenido por cada dólar invertido al inicio del periodo de evaluación.',
    highlights: [
      'Tasas efectivas del período (no están anualizadas).',
      'Base 100 del índice = 01/enero/2025.',
      'Los componentes del benchmark son de dos índices de Bloomberg.',
      'El U.S. Treasury Bills 1-3 meses ponderando el 60%.',
      'El Bloomberg CUST US SSA 1-2 años ponderando el 40%.'
    ],
    assetClasses: investmentPortfolioAssetClasses,
    maturityProfile: investmentPortfolioMaturityProfile,
    table: {
      title: 'Evolución trimestral',
      columns: [
        'jun-22',
        'sept-22',
        'dic-22',
        'mar-23',
        'jun-23',
        'sept-23',
        'dic-23',
        'mar-24',
        'jun-24',
        'sept-24',
        'dic-24',
        'mar-25',
        'jun-25',
        'sept-25',
        'dic-25'
      ],
      rows: [
        {
          metric: 'AUM (mm)',
          values: [
            '506',
            '465',
            '536',
            '694',
            '671',
            '723',
            '494',
            '494',
            '718',
            '667',
            '743',
            '927',
            '1.292',
            '1.404',
            '1.447'
          ]
        },
        {
          metric: 'Rend. Mensual',
          values: [
            '-0,05%',
            '0,20%',
            '0,34%',
            '0,56%',
            '0,26%',
            '0,23%',
            '0,67%',
            '0,44%',
            '0,46%',
            '0,63%',
            '0,44%',
            '0,37%',
            '0,55%',
            '0,27%',
            '0,27%'
          ]
        },
        {
          metric: 'Rend. YTD',
          values: [
            '1,00%',
            '1,00%',
            '1,08%',
            '1,13%',
            '1,96%',
            '3,06%',
            '4,64%',
            '1,06%',
            '2,61%',
            '4,56%',
            '5,22%',
            '1,24%',
            '2,49%',
            '3,62%',
            '4,72%'
          ]
        },
        {
          metric: 'Rend. Benchmark YTD',
          values: [
            '0,99%',
            '0,99%',
            '1,00%',
            '1,27%',
            '1,88%',
            '3,08%',
            '4,89%',
            '1,02%',
            '2,28%',
            '4,16%',
            '5,03%',
            '1,22%',
            '2,33%',
            '3,45%',
            '4,55%'
          ]
        },
        {
          metric: 'SOFR Promedio 12 m.',
          values: [
            '',
            '',
            '1,64%',
            '',
            '',
            '',
            '5,01%',
            '',
            '',
            '',
            '5,15%',
            '',
            '',
            '',
            '4,24%'
          ]
        },
        {
          metric: 'Calificación Promedio',
          values: [
            'AA',
            'AA+',
            'AA+',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA',
            'AA'
          ]
        },
        {
          metric: 'Duración Portafolio',
          values: [
            '0,37',
            '0,35',
            '0,37',
            '0,41',
            '0,46',
            '0,54',
            '0,83',
            '0,83',
            '0,49',
            '0,98',
            '0,63',
            '0,52',
            '1,04',
            '1,40',
            '1,44'
          ]
        },
        {
          metric: 'Duración Bonos',
          values: [
            '0,52',
            '0,01',
            '0,59',
            '0,59',
            '0,74',
            '1,07',
            '1,18',
            '1,16',
            '1,17',
            '1,42',
            '1,00',
            '1,06',
            '1,81',
            '1,90',
            '1,84'
          ]
        },
        {
          metric: 'Duración Benchmark',
          values: [
            '0,67',
            '0,67',
            '0,66',
            '0,69',
            '0,69',
            '0,68',
            '0,64',
            '0,65',
            '0,66',
            '0,67',
            '0,61',
            '0,64',
            '0,68',
            '0,68',
            '0,65'
          ]
        }
      ]
    }
  },
  {
    id: 'slide-7',
    type: 'liquidity-activity',
    eyebrow: 'Cartera de liquidez',
    title: 'Actividad del mes',
    highlights: [
      'Portafolio de Liquidez - 31/12/2025: USD 1.447mm.',
      'Transacciones totales: 11 + 10 constituciones BIS. Rolleo USD 207,5mm y USD 48,2mm adicionales en BIS. TEA ponderada: 3,78%.',
      'Bonos: 5 compras por USD 33mm. Ticket promedio USD 6,6mm. TIR ponderada: 3,73%.',
      'ETF: 1 transacción por USD 4,4mm (100.000,00 acciones INVESCO US TRES 1-3 YR ACC).',
      'Money market: 5 depósitos por USD 170mm. TIR ponderada: 4,02%.',
      'BIS: 10 constituciones. Promedio USD 81,5mm. TEA: 3,59%.'
    ],
    considerations: [
      'Cifras en millones de dólares a valor de mercado.',
      'La calificación incluye saldos en depósitos a la vista.',
      "Se utiliza la menor calificación entre Moody's y S&P; sin calificación, se usa la del emisor.",
      'EE. UU. incluye notas y letras del tesoro y la posición de US Treasuries ETF.'
    ],
    donutGallery: {
      title: 'Composición del portafolio',
      subtitle: 'Distribución porcentual',
      items: [
        {
          id: 'calificacion',
          title: 'Calificación',
          data: [
            { id: 'aaa', label: 'AAA', value: 48, color: '#003049' },
            { id: 'aa', label: 'AA+/AA/AA-', value: 27, color: '#d62828' },
            { id: 'a', label: 'A+/A/A-', value: 20, color: '#f77f00' },
            { id: 'bbb', label: 'BBB+/BBB/BBB-', value: 5, color: '#fcbf49' }
          ]
        },
        {
          id: 'sector',
          title: 'Sector',
          data: [
            { id: 'soberano', label: 'Soberano', value: 40, color: '#003049' },
            { id: 'multilateral', label: 'Multilateral', value: 40, color: '#d62828' },
            { id: 'financiero', label: 'Financiero', value: 20, color: '#f77f00' }
          ]
        },
        {
          id: 'region',
          title: 'Región',
          data: [
            { id: 'europa', label: 'Europa', value: 36, color: '#003049' },
            { id: 'asia', label: 'Asia', value: 10, color: '#d62828' },
            { id: 'usa-canada', label: 'USA & Canadá', value: 9, color: '#f77f00' },
            { id: 'latam', label: 'Latam', value: 5, color: '#fcbf49' },
            { id: 'multilateral', label: 'Multilateral', value: 40, color: '#eae2b7' }
          ]
        }
      ]
    },
    table: {
      title: 'Posiciones de liquidez',
      columns: [
        'Ticker',
        'Región',
        'Sector',
        'Calificación',
        'Posición (USD mm nominal)',
        '% liquidez'
      ],
      rows: [
        {
          ticker: 'IBRD',
          region: 'Multilateral',
          sector: 'Multilateral',
          rating: 'AAA',
          position: '110',
          liquidity: '8,0%'
        },
        {
          ticker: 'KFW',
          region: 'Multilateral',
          sector: 'Multilateral',
          rating: 'AAA',
          position: '105',
          liquidity: '8,0%'
        },
        {
          ticker: 'AFDB',
          region: 'Multilateral',
          sector: 'Multilateral',
          rating: 'AAA',
          position: '83',
          liquidity: '6,0%'
        },
        {
          ticker: 'BLADEX',
          region: 'Latam',
          sector: 'Financiero',
          rating: 'BBB',
          position: '65',
          liquidity: '5,0%'
        },
        {
          ticker: 'CABEI',
          region: 'Multilateral',
          sector: 'Multilateral',
          rating: 'AA-',
          position: '61',
          liquidity: '4,0%'
        },
        {
          ticker: 'Total',
          region: '',
          sector: '',
          rating: '',
          position: '424',
          liquidity: '30,0%',
          isTotal: true
        }
      ]
    }
  },
  {
    id: 'cartera-inversiones-focem',
    type: 'investment-portfolio',
    eyebrow: 'Cartera de inversiones',
    title: 'Cartera de Inversiones FOCEM',
    description: 'Resumen de composición, vencimientos y desempeño histórico del portafolio.',
    infoPopover: {
      title: 'Notas y Actividades destacables',
      body: [
        'Portafolio 31/Dic./2025: VM USD 106.416.058,05.',
        'Comisiones (devengadas) 2025: USD 528.216,73.',
        'Desembolsos realizados (2020-2025): USD 7.000.000,00 - 12/Dic./2022.',
        'Transacciones totales (2025): 48 transacciones: 37 en el mercado de dinero, depósitos y papel comercial, y 11 en el mercado de capitales, títulos valores.'
      ]
    },
    assetChartFormat: 'percent',
    assetChartShowCenter: false,
    assetClasses: [
      {
        id: 'bonos',
        label: 'Bonos',
        value: 80,
        color: '#003049'
      },
      {
        id: 'depositos-plazo',
        label: 'Depósitos a plazo',
        value: 20,
        color: '#d62828'
      }
    ],
    maturityProfile: {
      type: 'bar',
      title: 'Perfil de vencimientos nominal',
      subtitle: 'USD mill.',
      unit: 'MM',
      tickEvery: 2,
      showValueLabels: true,
      showValueLabelUnit: false,
      valueLabelFontSize: '0.7rem',
      data: [
        { label: '2026 ene', value: 19, color: 'var(--accent)' },
        { label: '2026 feb', value: 19, color: 'var(--accent)' },
        { label: '2026 mar', value: 7, color: 'var(--accent)' },
        { label: '2026 abr', value: 4, color: 'var(--accent)' },
        { label: '2026 may', value: 3, color: 'var(--accent)' },
        { label: '2026 ago', value: 7, color: 'var(--accent)' },
        { label: '2026 oct', value: 4, color: 'var(--accent)' },
        { label: '2027 Q1', value: 1, color: 'var(--accent)' },
        { label: '2027 Q2', value: 12, color: 'var(--accent)' },
        { label: '2027 Q3', value: 2, color: 'var(--accent)' },
        { label: '2027 Q4', value: 3, color: 'var(--accent)' },
        { label: '2028 Q1', value: 5, color: 'var(--accent)' },
        { label: '2028 Q3', value: 8, color: 'var(--accent)' },
        { label: '2029 Q1', value: 3, color: 'var(--accent)' },
        { label: '2030 Q2', value: 12, color: 'var(--accent)' }
      ]
    },
    table: {
      title: 'Comportamiento histórico',
      columns: ['dic-20', 'dic-21', 'dic-22', 'dic-23', 'dic-24', 'mar-25', 'jun-25', 'sept-25', 'dic-25'],
      rows: [
        {
          metric: 'AUM (mm)',
          values: ['100,3', '100,4', '94,0', '98,2', '102,0', '103,4', '104,5', '105,4', '106,4']
        },
        {
          metric: 'Rend. Acum. Neto',
          values: ['0,31%', '0,04%', '0,68%', '4,45%', '3,88%', '1,40%', '2,43%', '3,34%', '4,32%']
        },
        {
          metric: 'Rend. Acum. Bruto',
          values: ['0,41%', '0,07%', '0,62%', '4,94%', '4,43%', '1,43%', '2,61%', '3,81%', '4,88%']
        },
        {
          metric: 'SOFR Promedio 12 m.',
          values: ['0,36%', '0,04%', '1,64%', '5,01%', '5,15%', '', '', '', '4,24%']
        },
        {
          metric: 'Calificación Promedio',
          values: ['AA', 'AA', 'AA', 'AA-', 'AA', 'AA', 'AA', 'AA', 'AA']
        },
        {
          metric: 'Duración Portafolio',
          values: ['1,37', '0,66', '0,40', '0,16', '1,09', '0,89', '1,01', '1,35', '1,15']
        },
        {
          metric: 'Duración Benchmark',
          values: ['0,66', '0,67', '0,66', '0,64', '0,61', '0,64', '0,68', '0,68', '0,65']
        }
      ]
    }
  },
  {
    id: 'analisis-tasas',
    type: 'rate-analysis',
    eyebrow: 'Tasas de referencia',
    title: 'Analisis de Tasas',
    description: 'Comparativo de Margen Neto frente a FOCOM y SOFR por riesgo soberano y no soberano.',
    highlights: [
      'Series mensuales 2024-2025.',
      'Evolución de spreads de Margen Neto.'
    ],
    charts: [
      { id: 'soberana', label: 'Riesgo soberana', chart: tasaRiesgoSoberanoChart },
      { id: 'no-soberana', label: 'Riesgo no soberana', chart: tasaRiesgoNoSoberanoChart }
    ]
  },
  {
    id: 'analisis-endeudamiento',
    type: 'content',
    eyebrow: 'Endeudamiento',
    title: 'Analisis Endeudamiento',
    description: 'Evolución del saldo de deuda y su ritmo de crecimiento en los últimos cinco cierres anuales.',
    highlights: [
      'Crecimiento sostenido desde 2021.',
      'Desaceleración del incremento en 2025.',
      'Enfoque en refinanciamiento 2026-2027 para estabilizar el costo financiero.'
    ],
    chart: endeudamientoChartQuarterly,
    chartAnnual: endeudamientoChartAnnual,
    chartMarginal: endeudamientoChartQuarterlyMarginal,
    chartAnnualMarginal: endeudamientoChartAnnualMarginal,
    miniChart: endeudamientoPlazoPromedio,
    miniChartAnnual: endeudamientoPlazoPromedioAnnual,
    miniChartMarginal: endeudamientoPlazoPromedioMarginal,
    miniChartAnnualMarginal: endeudamientoPlazoPromedioMarginalAnnual,
    scatterCharts: {
      ifd: debtSourcesScatterIfd,
      mercado: debtSourcesScatterMercado
    }
  },
  {
    id: 'deuda-por-fuente',
    type: 'debt-sources',
    eyebrow: 'Fuentes de deuda',
    title: 'Fuentes de deuda por instrumento',
    tables: [
      {
        title: 'Instituciones Financieras para el Desarrollo (IFD)',
        columns: [
          { label: 'Instrumento', align: 'left', width: '52%' },
          { label: 'Circulante (USD mm)', align: 'right' },
          { label: 'Disponible (USD mm)', align: 'right' },
          { label: 'Total (USD mm)', align: 'right' },
          { label: 'Spread (pbs)', align: 'right' }
        ],
        rows: [
          { cells: ['AFD 1 - Préstamo (CZZ 2105)', '13,6', '0,0', '13,6', '179,8'] },
          { cells: ['AFD 2 - Préstamo (CZZ 2823)', '33,1', '0,0', '33,1', '123,6'] },
          { cells: ['BEI 1 - Tramo 1 - Línea (86645)', '5,6', '0,0', '5,6', '106,0'] },
          { cells: ['BEI 1 - Tramo 2 - Línea (86645)', '6,0', '0,0', '6,0', '95,0'] },
          { cells: ['BEI 1 - Tramo 3 - Línea (86645)', '10,0', '0,0', '10,0', '87,2'] },
          { cells: ['BEI 1 - Tramo 4 - Línea (86645)', '20,0', '0,0', '20,0', '81,3'] },
          { cells: ['BEI 1 - Tramo 5 - Línea (86645)', '18,0', '0,0', '18,0', '93,1'] },
          { cells: ['BID 1 - Préstamo (4377/OC-RG)', '85,0', '0,0', '85,0', '121,0'] },
          { cells: ['BID 2 - Préstamo (5442/OC-RG)', '100,0', '0,0', '100,0', '121,0'] },
          { cells: ['CAF 3 - Línea Revolvente', '0,0', '25,0', '25,0', '-'] },
          { cells: ['CAF 3 - Tramo 1 - Línea Revolvente', '75,0', '0,0', '75,0', '175,0'] },
          { cells: ['CAF 3 - Tramo 2 - Línea Revolvente', '50,0', '0,0', '50,0', '135,0'] },
          { cells: ['CDP 1', '27,5', '0,0', '27,5', '130,0'] },
          { cells: ['CDP 2', '0,0', '50,0', '50,0', '124,0'] },
          { cells: ['ICO 1 - Tramo 1 - Línea 1', '1,1', '0,0', '1,1', '87,8'] },
          { cells: ['ICO 2 - Tramo 1 - Línea 2', '6,7', '0,0', '6,7', '96,0'] },
          { cells: ['ICO 2 - Tramo 2 - Línea 2', '5,5', '0,0', '5,5', '101,0'] },
          { cells: ['ICO 3 - Línea', '0,0', '7,2', '7,2', '-'] },
          { cells: ['ICO 3.1 - Línea 1', '17,8', '0,0', '17,8', '88,0'] },
          { cells: ['KfW - Préstamo (29876)', '40,1', '0,0', '40,1', '93,8'] },
          { cells: ['Total', '515,0', '82,2', '597,2', '125'], isTotal: true }
        ]
      },
      {
        title: 'Mercado',
        columns: [
          { label: 'Instrumento', align: 'left', width: '60%' },
          { label: 'Monto (USD mm)', align: 'right' },
          { label: 'Spread (pbs)', align: 'right' }
        ],
        rows: [
          { cells: ['BBVA - Facilidad de Crédito 2021', '16,7', '157,8'] },
          { cells: ['BBVA 2 - Facilidad de Crédito 2024', '125,0', '172,4'] },
          { cells: ['CHF 3,5 años – 2027', '158,6', '189,8'] },
          { cells: ['CHF 5 años – 2029', '152,9', '202,9'] },
          { cells: ['CHF 5,5 años – 2026', '222,7', '164,0'] },
          { cells: ['CHF 7 años - 2028', '164,5', '125,2'] },
          { cells: ['JPY 3 años – 2027', '40,2', '166,4'] },
          { cells: ['JPY 5 años - 2028', '22,5', '192,8'] },
          { cells: ['JPY 5 años – 2029/Segunda Emisión', '7,0', '188,4'] },
          { cells: ['JPY 6,5 años – 2029/Primera Emisión', '31,5', '205,5'] },
          { cells: ['USD 3 años – 19/Feb/2028 – MTN 1', '40,0', '130,0'] },
          { cells: ['USD 5 años - 14/Mar/2030 – MTN 2', '40,0', '145,0'] },
          { cells: ['USD 5 años - 21/Mar/2030 – MTN 3', '50,0', '145,0'] },
          { cells: ['USD 5 años - 26/Mar/2030 – MTN 4.1', '30,0', '136,5'] },
          { cells: ['USD 7 años - 26/Mar/2032 – MTN 4.2', '50,0', '145,8'] },
          { cells: ['USD 10 años - 10/Abr/2035 – MTN 5', '50,0', '167,7'] },
          { cells: ['USD 5 años – 19/May/2030 – MTN 6', '50,0', '135,0'] },
          { cells: ['USD 5 años – 21/May/2030 – MTN 7', '100,0', '135,0'] },
          { cells: ['USD 15 años – 05/Ago/2040 – MTN 8.1', '35,0', '178,4'] },
          { cells: ['AUD 15 años – 05/Ago/2040 – MTN 8.2', '25,1', '180,0'] },
          { cells: ['JPY 3 años – 05/Sep/2028 – MTN 9', '20,4', '112,5'] },
          { cells: ['USD 5,5 años - 30/Mar/2031 – MTN 10', '30,0', '130,0'] },
          { cells: ['INR 5,5 años - 25/May/2031 – MTN 11', '101,5', '130,0'] },
          { cells: ['Total', '1.563,6', '159'], isTotal: true }
        ]
      }
    ]
  },
  {
    id: 'perfil-amortizacion',
    type: 'rate-analysis',
    eyebrow: 'Amortización y Flujos',
    title: 'Perfil de amortización',
    description: 'Evolución de amortización, flujos y stock por fuente.',
    highlights: [
      'Separación entre contratos 2025 y amortización restante.',
      'Flujos proyectados por fuente.',
      'Stock base anual por IFD y Mercado.'
    ],
    charts: [
      { id: 'amortizacion', label: 'Perfil de amortización', chart: perfilAmortizacionChart },
      { id: 'flujos', label: 'Flujos', chart: flujosChart },
      { id: 'stock', label: 'Stock', chart: stockChart }
    ]
  },
  {
    id: 'emisiones-segmentadas-2025',
    type: 'content',
    eyebrow: 'Emisiones · Segmentación',
    title: 'Emisiones 2025 segmentadas (IFD vs Mercado)',
    description:
      'Total emitido por mes. Cada barra está segmentada por tramos (bordes punteados) y coloreada según origen: Mercado (rojo) o IFD (gris).',
    highlights: [
      'Rojo: Mercado · Gris: IFD.',
      'Abril: 50% Mercado / 50% IFD.',
      'Julio, Octubre y Diciembre: 100% IFD.'
    ],
    chart: emisionesSegmentadasChart
  }
];
