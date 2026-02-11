import { countryOrder, countrySeriesByCode, quarterLabels } from '../data/countryStacked';
import type {
  BarChartConfig,
  ChartConfig,
  GroupedBarChartConfig,
  InvestmentPortfolioTable,
  LineChartConfig,
  SimpleTable,
  SlideDefinition,
  StackedBarChartConfig
} from '../types/slides';

type SheetRow = Record<string, string | number | boolean | null>;

type SheetData = {
  name: string;
  rows: SheetRow[];
};
type XlsxModule = typeof import('xlsx');

const MAX_SHEET_NAME_LENGTH = 31;

const sanitizeName = (value: string) =>
  value.replace(/[\\/?*:]/g, ' ').replace(/\[/g, ' ').replace(/\]/g, ' ').replace(/\s+/g, ' ').trim();

const buildUniqueSheetName = (rawName: string, usedNames: Set<string>) => {
  const base = sanitizeName(rawName).slice(0, MAX_SHEET_NAME_LENGTH) || 'Hoja';
  if (!usedNames.has(base)) {
    usedNames.add(base);
    return base;
  }

  let suffix = 2;
  while (suffix < 1000) {
    const tail = ` ${suffix}`;
    const trimmed = base.slice(0, Math.max(1, MAX_SHEET_NAME_LENGTH - tail.length));
    const candidate = `${trimmed}${tail}`;
    if (!usedNames.has(candidate)) {
      usedNames.add(candidate);
      return candidate;
    }
    suffix += 1;
  }

  return `${Date.now()}`.slice(0, MAX_SHEET_NAME_LENGTH);
};

const toWorkbook = (xlsx: XlsxModule, sheets: SheetData[]) => {
  const workbook = xlsx.utils.book_new();
  const usedNames = new Set<string>();

  sheets.forEach((sheet) => {
    const rows = sheet.rows.length ? sheet.rows : [{ mensaje: 'Sin datos disponibles' }];
    const worksheet = xlsx.utils.json_to_sheet(rows);
    const name = buildUniqueSheetName(sheet.name, usedNames);
    xlsx.utils.book_append_sheet(workbook, worksheet, name);
  });

  return workbook;
};

const loadXlsx = async (): Promise<XlsxModule> => {
  const module = await import('xlsx');
  return (module as { default?: XlsxModule }).default ?? module;
};

const mapSimpleTableToRows = (table: SimpleTable) => {
  return table.rows.map((row) => {
    const mapped: SheetRow = {};
    table.columns.forEach((column, index) => {
      mapped[column.label] = row.cells[index] ?? '';
    });
    mapped.total = row.isTotal ?? false;
    if (row.className) {
      mapped.estilo = row.className;
    }
    return mapped;
  });
};

const mapInvestmentMetricTableToRows = (table: InvestmentPortfolioTable) => {
  return table.rows.map((row) => {
    const mapped: SheetRow = {
      metrica: row.metric
    };

    table.columns.forEach((column, index) => {
      mapped[column] = row.values[index] ?? '';
    });

    return mapped;
  });
};

const buildBarChartRows = (chart: BarChartConfig) => {
  return chart.data.map((datum) => ({
    categoria: datum.label,
    valor: datum.value,
    unidad: chart.unit ?? '',
    color: datum.color ?? '',
    paises: datum.countries?.join(', ') ?? ''
  }));
};

const buildSeriesValueRows = (
  chart: Pick<StackedBarChartConfig | GroupedBarChartConfig, 'series' | 'data' | 'unit'>
) => {
  return chart.data.map((datum) => {
    const mapped: SheetRow = {
      categoria: datum.label,
      unidad: chart.unit ?? ''
    };

    chart.series.forEach((series) => {
      const column = series.label || series.id;
      mapped[column] = datum.values[series.id] ?? 0;
    });

    return mapped;
  });
};

const buildLineChartRows = (chart: LineChartConfig) => {
  const allLabels: string[] = [];
  const labelSet = new Set<string>();

  chart.series.forEach((series) => {
    series.values.forEach((point) => {
      if (!labelSet.has(point.date)) {
        labelSet.add(point.date);
        allLabels.push(point.date);
      }
    });
  });

  const byLabelRows = allLabels.map((label) => {
    const mapped: SheetRow = {
      eje_x: label,
      unidad: chart.unit ?? ''
    };

    chart.series.forEach((series) => {
      const point = series.values.find((entry) => entry.date === label);
      mapped[series.label || series.id] = point?.value ?? '';
    });

    return mapped;
  });

  const longRows = chart.series.flatMap((series) =>
    series.values.map((point) => ({
      serie_id: series.id,
      serie: series.label,
      eje_x: point.date,
      x_valor: point.x ?? '',
      valor: point.value,
      unidad: chart.unit ?? ''
    }))
  );

  const barRows: SheetRow[] = [];
  if (chart.barData?.length) {
    const keys = new Set<string>();
    chart.barSeries?.forEach((series) => keys.add(series.id));
    chart.barData.forEach((row) => {
      Object.keys(row.values).forEach((key) => keys.add(key));
    });

    const labelById = new Map(chart.barSeries?.map((series) => [series.id, series.label]));
    const orderedKeys = Array.from(keys);

    chart.barData.forEach((row) => {
      const mapped: SheetRow = {
        eje_x: row.date,
        unidad: chart.barUnit ?? chart.unit ?? ''
      };

      orderedKeys.forEach((key) => {
        const label = labelById.get(key) ?? key;
        mapped[label] = row.values[key] ?? 0;
      });

      barRows.push(mapped);
    });
  }

  return {
    byLabelRows,
    longRows,
    barRows
  };
};

const chartToSheets = (chart: ChartConfig | GroupedBarChartConfig, prefix: string): SheetData[] => {
  if (chart.type === 'line') {
    const rows = buildLineChartRows(chart);
    const sheets: SheetData[] = [
      {
        name: `${prefix} Línea`,
        rows: rows.byLabelRows
      },
      {
        name: `${prefix} Línea long`,
        rows: rows.longRows
      }
    ];

    if (rows.barRows.length) {
      sheets.push({
        name: `${prefix} Barras`,
        rows: rows.barRows
      });
    }

    return sheets;
  }

  if (chart.type === 'stacked-bar') {
    return [
      {
        name: `${prefix} Stacked`,
        rows: buildSeriesValueRows(chart)
      }
    ];
  }

  if (chart.type === 'grouped-bar') {
    return [
      {
        name: `${prefix} Grouped`,
        rows: buildSeriesValueRows(chart)
      }
    ];
  }

  return [
    {
      name: `${prefix} Barras`,
      rows: buildBarChartRows(chart)
    }
  ];
};

const yearsForDonutMatrix = [
  { id: '2024', index: 19 },
  { id: '2025', index: 23 },
  { id: '2026', index: 27 }
] as const;

const donutCategories = [
  { id: 'aprobados', label: 'Aprobados no vigentes' },
  { id: 'desembolsar', label: 'Por Desembolsar' },
  { id: 'cobrar', label: 'Por Cobrar' }
] as const;

const buildDonutMatrixRows = () => {
  const rows: SheetRow[] = [];

  yearsForDonutMatrix.forEach((year) => {
    donutCategories.forEach((category) => {
      countryOrder.forEach((country) => {
        const series = countrySeriesByCode[country];
        const categorySeries = series[category.id];
        rows.push({
          anio: year.id,
          categoria: category.label,
          pais: country,
          valor_usd: categorySeries[year.index] ?? 0
        });
      });
    });
  });

  return rows;
};

const riskYears = [
  { id: '2024', quarterIndex: 19, ratingIndex: 0 },
  { id: '2025', quarterIndex: 23, ratingIndex: 1 },
  { id: '2026', quarterIndex: 27, ratingIndex: 2 }
] as const;

const riskRatings: Record<string, [string, string, string]> = {
  ARG: ['Caa1', 'CCC+', 'CCC+'],
  BOL: ['Ca', 'CCC-', 'CCC-'],
  BRA: ['Ba1', 'BB', 'BB'],
  PAR: ['Baa3', 'BBB-', 'BBB-'],
  URU: ['Baa1', 'BBB+', 'BBB+'],
  RNS: ['CCC', 'CCC', 'CCC']
};

const ratingEquivalence: Record<string, number> = {
  Aaa: 1,
  AAA: 1,
  Aa1: 2,
  'AA+': 2,
  Aa2: 3,
  AA: 3,
  Aa3: 4,
  'AA-': 4,
  A1: 5,
  'A+': 5,
  A2: 6,
  A: 6,
  A3: 7,
  'A-': 7,
  Baa1: 8,
  'BBB+': 8,
  Baa2: 9,
  BBB: 9,
  Baa3: 10,
  'BBB-': 10,
  Ba1: 11,
  'BB+': 11,
  Ba2: 12,
  BB: 12,
  Ba3: 13,
  'BB-': 13,
  B1: 14,
  'B+': 14,
  B2: 15,
  B: 15,
  B3: 16,
  'B-': 16,
  Caa1: 17,
  'CCC+': 17,
  Caa2: 18,
  CCC: 18,
  Caa3: 19,
  'CCC-': 19,
  Ca: 20,
  CC: 20,
  C: 21,
  D: 22
};

const gradeByEquivalence = (value: number) => {
  if (value <= 8) return 'GI1';
  if (value <= 10) return 'GI2';
  if (value <= 13) return 'BB';
  if (value <= 16) return 'B';
  return '< CCC';
};

const buildRiskCapacityRows = () => {
  const includedCountries = countryOrder.filter((country) => country !== 'RNS');
  const capacityRows: SheetRow[] = [];
  const bucketRows: SheetRow[] = [];

  riskYears.forEach((year) => {
    const capacities = includedCountries.map((country) => {
      const series = countrySeriesByCode[country];
      const total =
        (series.cobrar[year.quarterIndex] ?? 0) +
        (series.desembolsar[year.quarterIndex] ?? 0) +
        (series.aprobados[year.quarterIndex] ?? 0);
      return { country, total };
    });

    const totalCapacity = capacities.reduce((sum, entry) => sum + entry.total, 0);

    capacities.forEach((entry) => {
      capacityRows.push({
        anio: year.id,
        pais: entry.country,
        capacidad_usd: entry.total,
        capacidad_mm: Number((entry.total / 1_000_000).toFixed(2)),
        capacidad_pct: totalCapacity > 0 ? Number(((entry.total / totalCapacity) * 100).toFixed(2)) : 0
      });
    });

    const bucketTotals = new Map<string, { amount: number; countries: string[] }>();
    includedCountries.forEach((country) => {
      const rating = riskRatings[country]?.[year.ratingIndex] ?? 'CCC';
      const equivalence = ratingEquivalence[rating] ?? 22;
      const bucket = gradeByEquivalence(equivalence);
      const entry = bucketTotals.get(bucket) ?? { amount: 0, countries: [] };
      const countryCapacity = capacities.find((item) => item.country === country)?.total ?? 0;
      entry.amount += countryCapacity;
      entry.countries.push(country);
      bucketTotals.set(bucket, entry);
    });

    ['< CCC', 'B', 'BB', 'GI2', 'GI1'].forEach((bucket) => {
      const entry = bucketTotals.get(bucket) ?? { amount: 0, countries: [] };
      bucketRows.push({
        anio: year.id,
        bucket,
        capacidad_usd: entry.amount,
        capacidad_mm: Number((entry.amount / 1_000_000).toFixed(2)),
        capacidad_pct: totalCapacity > 0 ? Number(((entry.amount / totalCapacity) * 100).toFixed(2)) : 0,
        paises: entry.countries.join(', ')
      });
    });
  });

  return { capacityRows, bucketRows };
};

const buildCountrySeriesRows = () => {
  const rows: SheetRow[] = [];

  countryOrder.forEach((country) => {
    const series = countrySeriesByCode[country];
    quarterLabels.forEach((quarter, index) => {
      rows.push({
        pais: country,
        periodo: quarter,
        cobrar_usd: series.cobrar[index] ?? 0,
        desembolsar_usd: series.desembolsar[index] ?? 0,
        aprobados_usd: series.aprobados[index] ?? 0,
        activar_usd: series.activar[index] ?? 0
      });
    });
  });

  return rows;
};

const buildCountryAggregateRows = () => {
  return quarterLabels.map((quarter, index) => {
    const totals = countryOrder.reduce(
      (acc, country) => {
        const series = countrySeriesByCode[country];
        acc.cobrar += series.cobrar[index] ?? 0;
        acc.desembolsar += series.desembolsar[index] ?? 0;
        acc.aprobados += series.aprobados[index] ?? 0;
        acc.activar += series.activar[index] ?? 0;
        return acc;
      },
      { cobrar: 0, desembolsar: 0, aprobados: 0, activar: 0 }
    );

    return {
      periodo: quarter,
      cobrar_mm: Number((totals.cobrar / 1_000_000).toFixed(2)),
      desembolsar_mm: Number((totals.desembolsar / 1_000_000).toFixed(2)),
      aprobados_mm: Number((totals.aprobados / 1_000_000).toFixed(2)),
      activar_mm: Number((totals.activar / 1_000_000).toFixed(2))
    };
  });
};

const buildSlideSheets = (slide: SlideDefinition): SheetData[] => {
  const baseInfo: SheetData = {
    name: 'Resumen',
    rows: [
      {
        slide_id: slide.id,
        tipo: slide.type
      }
    ]
  };

  if (slide.type === 'home') {
    return [
      baseInfo,
      {
        name: 'Contenido',
        rows: [
          {
            titulo: slide.heroTitle,
            subtitulo: slide.heroSubtitle ?? '',
            meta: slide.meta ?? '',
            cuerpo: slide.body ?? ''
          }
        ]
      }
    ];
  }

  if (slide.type === 'navigation') {
    return [
      baseInfo,
      {
        name: 'Temas',
        rows: slide.topics.map((topic) => ({
          id: topic.id,
          titulo: topic.title,
          descripcion: topic.description,
          tag: topic.tag
        }))
      }
    ];
  }

  if (slide.type === 'chart-grid') {
    const chartSheets = slide.charts.flatMap((chart, index) =>
      chartToSheets(chart, `${chart.title || `Gráfico ${index + 1}`}`)
    );
    return [
      baseInfo,
      {
        name: 'Series País',
        rows: buildCountrySeriesRows()
      },
      {
        name: 'Agregado MM',
        rows: buildCountryAggregateRows()
      },
      ...chartSheets
    ];
  }

  if (slide.type === 'donut-matrix') {
    return [
      baseInfo,
      {
        name: 'Matriz Donut',
        rows: buildDonutMatrixRows()
      }
    ];
  }

  if (slide.type === 'risk-capacity') {
    const riskRows = buildRiskCapacityRows();
    return [
      baseInfo,
      {
        name: 'Capacidad País',
        rows: riskRows.capacityRows
      },
      {
        name: 'Buckets Riesgo',
        rows: riskRows.bucketRows
      }
    ];
  }

  if (slide.type === 'vigencia-activacion') {
    return [
      baseInfo,
      {
        name: 'Etapas activación',
        rows: slide.activationStages.map((row) => ({
          pais: row.country,
          codigo: row.code,
          nombre: row.name,
          monto_usd: row.amount
        }))
      },
      {
        name: 'No vigentes',
        rows: slide.approvedNotVigent.map((row) => ({
          pais: row.country,
          codigo: row.code,
          nombre: row.name,
          monto_usd: row.amount
        }))
      }
    ];
  }

  if (slide.type === 'investment-portfolio') {
    return [
      baseInfo,
      {
        name: 'Activos Donut',
        rows: slide.assetClasses.map((item) => ({
          id: item.id,
          clase: item.label,
          valor: item.value,
          color: item.color
        }))
      },
      ...chartToSheets(slide.maturityProfile, 'Perfil Vencimientos'),
      {
        name: 'Tabla Metricas',
        rows: mapInvestmentMetricTableToRows(slide.table)
      }
    ];
  }

  if (slide.type === 'dual-charts') {
    return [
      baseInfo,
      ...chartToSheets(slide.charts[0], 'Gráfico 1'),
      ...chartToSheets(slide.charts[1], 'Gráfico 2')
    ];
  }

  if (slide.type === 'liquidity-activity') {
    return [
      baseInfo,
      ...slide.donutGallery.items.map((item) => ({
        name: `Donut ${item.title}`,
        rows: item.data.map((datum) => ({
          id: datum.id,
          etiqueta: datum.label,
          valor: datum.value,
          color: datum.color
        }))
      })),
      {
        name: 'Tabla Liquidez',
        rows: slide.table.rows.map((row) => ({
          ticker: row.ticker,
          region: row.region,
          sector: row.sector,
          calificacion: row.rating,
          posicion: row.position,
          liquidez: row.liquidity,
          total: row.isTotal ?? false
        }))
      }
    ];
  }

  if (slide.type === 'debt-sources') {
    return [
      baseInfo,
      {
        name: slide.tables[0].title ?? 'Tabla 1',
        rows: mapSimpleTableToRows(slide.tables[0])
      },
      {
        name: slide.tables[1].title ?? 'Tabla 2',
        rows: mapSimpleTableToRows(slide.tables[1])
      }
    ];
  }

  if (slide.type === 'debt-summary') {
    return [
      baseInfo,
      {
        name: slide.summaryTable.title ?? 'Resumen',
        rows: mapSimpleTableToRows(slide.summaryTable)
      },
      {
        name: slide.disbursementTable.title ?? 'Desembolsos',
        rows: mapSimpleTableToRows(slide.disbursementTable)
      },
      {
        name: slide.pipelineTable.title ?? 'Pipeline',
        rows: mapSimpleTableToRows(slide.pipelineTable)
      },
      {
        name: 'Donut',
        rows: slide.donut.data.map((item) => ({
          id: item.id,
          etiqueta: item.label,
          valor: item.value,
          color: item.color
        }))
      },
      ...chartToSheets(slide.spreadComparison, 'Spread')
    ];
  }

  if (slide.type === 'debt-authorization') {
    const sheets: SheetData[] = [
      baseInfo,
      {
        name: 'Donut Principal',
        rows: slide.donut.data.map((item) => ({
          id: item.id,
          etiqueta: item.label,
          valor: item.value,
          color: item.color
        }))
      },
      ...chartToSheets(slide.chart, 'Evolución')
    ];

    if (slide.donut.drilldown) {
      sheets.push({
        name: 'Donut Drilldown',
        rows: slide.donut.drilldown.data.map((item) => ({
          parent_id: slide.donut.drilldown?.parentId ?? null,
          id: item.id,
          etiqueta: item.label,
          valor: item.value,
          color: item.color
        }))
      });
    }

    if (slide.chartExtraTooltip?.length) {
      sheets.push({
        name: 'Tooltip Extra',
        rows: slide.chartExtraTooltip.flatMap((series) =>
          Object.entries(series.values).map(([label, value]) => ({
            id: series.id,
            serie: series.label,
            fecha: label,
            valor: value,
            color: series.color ?? ''
          }))
        )
      });
    }

    return sheets;
  }

  if (slide.type === 'rate-analysis') {
    return [
      baseInfo,
      ...slide.charts.flatMap((item) => chartToSheets(item.chart, item.label))
    ];
  }

  if (slide.type === 'line-cards') {
    return [
      baseInfo,
      ...slide.cards.flatMap((card, index) =>
        card.chart ? chartToSheets(card.chart, card.id || `card ${index + 1}`) : []
      )
    ];
  }

  if (slide.type === 'text-table') {
    return [
      baseInfo,
      {
        name: slide.table.title ?? 'Tabla',
        rows: mapSimpleTableToRows(slide.table)
      }
    ];
  }

  if (slide.type === 'content') {
    const sheets: SheetData[] = [
      baseInfo,
      ...chartToSheets(slide.chart, 'Gráfico principal')
    ];

    if (slide.chartAnnual) {
      sheets.push(...chartToSheets(slide.chartAnnual, 'Gráfico anual'));
    }

    if (slide.chartMarginal) {
      sheets.push(...chartToSheets(slide.chartMarginal, 'Gráfico marginal'));
    }

    if (slide.chartAnnualMarginal) {
      sheets.push(...chartToSheets(slide.chartAnnualMarginal, 'Gráfico anual marginal'));
    }

    if (slide.miniChart) {
      sheets.push(...chartToSheets(slide.miniChart, 'Mini gráfico'));
    }

    if (slide.miniChartAnnual) {
      sheets.push(...chartToSheets(slide.miniChartAnnual, 'Mini gráfico anual'));
    }

    if (slide.miniChartMarginal) {
      sheets.push(...chartToSheets(slide.miniChartMarginal, 'Mini gráfico marginal'));
    }

    if (slide.miniChartAnnualMarginal) {
      sheets.push(...chartToSheets(slide.miniChartAnnualMarginal, 'Mini gráfico anual M'));
    }

    if (slide.scatterCharts) {
      sheets.push(...chartToSheets(slide.scatterCharts.ifd, 'Scatter IFD'));
      sheets.push(...chartToSheets(slide.scatterCharts.mercado, 'Scatter Mercado'));
    }

    if (slide.lineDrilldown?.rows.length) {
      sheets.push({
        name: 'Drilldown Base',
        rows: slide.lineDrilldown.rows.map((row) => ({
          fecha: row.date,
          pais: row.country,
          aprobados: row.aprobados,
          desembolsar: row.desembolsar,
          cobrar: row.cobrar
        }))
      });
    }

    return sheets;
  }

  return [
    baseInfo,
    {
      name: 'Datos',
      rows: [{ mensaje: 'Sin datos estructurados para exportar en este slide.' }]
    }
  ];
};

const sanitizeFileName = (value: string) =>
  value
    .replace(/[^a-zA-Z0-9-_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();

export const exportSlideToExcel = (slide: SlideDefinition) => {
  void (async () => {
    try {
      const xlsx = await loadXlsx();
      const sheets = buildSlideSheets(slide);
      const workbook = toWorkbook(xlsx, sheets);
      const filename = `${sanitizeFileName(`${slide.id}-datos-brutos`) || 'slide-datos-brutos'}.xlsx`;
      xlsx.writeFile(workbook, filename);
    } catch (error) {
      console.error('Error al exportar Excel del slide', error);
    }
  })();
};
