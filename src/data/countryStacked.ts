import type { StackedBarChartConfig, StackedBarSeries } from '../types/slides';

const quarterDates = [
  '2020-03-31',
  '2020-06-30',
  '2020-09-30',
  '2020-12-31',
  '2021-03-31',
  '2021-06-30',
  '2021-09-30',
  '2021-12-31',
  '2022-03-31',
  '2022-06-30',
  '2022-09-30',
  '2022-12-31',
  '2023-03-31',
  '2023-06-30',
  '2023-09-30',
  '2023-12-31',
  '2024-03-31',
  '2024-06-30',
  '2024-09-30',
  '2024-12-31',
  '2025-03-31',
  '2025-06-30',
  '2025-09-30',
  '2025-12-31',
  '2026-03-31',
  '2026-06-30',
  '2026-09-30',
  '2026-12-31'
];

const formatQuarterLabel = (date: string) => {
  const [year, month] = date.split('-');
  const monthNumber = Number.parseInt(month, 10);
  const quarter = Math.ceil(monthNumber / 3);
  return `Q${quarter}-${year.slice(2)}`;
};

export const quarterLabels = quarterDates.map((date) => formatQuarterLabel(date));

export const countryOrder = ['ARG', 'BOL', 'BRA', 'PAR', 'RNS', 'URU'] as const;
export type CountryCode = (typeof countryOrder)[number];
export type CountryCategoryId = 'cobrar' | 'desembolsar' | 'aprobados' | 'activar';

export const countryColors: Record<CountryCode, string> = {
  ARG: '#38bdf8',
  BOL: '#22c55e',
  BRA: '#facc15',
  PAR: '#ef4444',
  RNS: '#f59e0b',
  URU: '#7dd3fc'
};

export const countryStackedLegend: StackedBarSeries[] = [
  { id: 'cobrar', label: 'Por Cobrar', color: '#e11d48' },
  { id: 'desembolsar', label: 'Por Desembolsar', color: '#f97316' },
  { id: 'aprobados', label: 'Aprobado no Vigente', color: '#facc15' },
  { id: 'activar', label: 'Por Activar', color: '#22c55e' }
];

type CountrySeries = {
  cobrar: number[];
  desembolsar: number[];
  aprobados: number[];
  activar: number[];
};

const buildCountryStackedConfig = (
  country: string,
  seriesData: CountrySeries
): StackedBarChartConfig => ({
  type: 'stacked-bar',
  title: country,
  subtitle: 'USD · millones',
  unit: 'MM',
  series: countryStackedLegend,
  data: quarterDates.map((_, index) => ({
    label: quarterLabels[index],
    values: {
      cobrar: (seriesData.cobrar[index] ?? 0) / 1_000_000,
      desembolsar: (seriesData.desembolsar[index] ?? 0) / 1_000_000,
      aprobados: (seriesData.aprobados[index] ?? 0) / 1_000_000,
      activar: (seriesData.activar[index] ?? 0) / 1_000_000
    }
  }))
});

const argSeries: CountrySeries = {
  cobrar: [
    239258026.68,
    306497614.92,
    310694563.61,
    322859827.04,
    348120433.13,
    352164278.78,
    368664771.4,
    403808058.42,
    409874536.38,
    433268555.66,
    452469729.54,
    490461614.47,
    486810924.42,
    478747640.7,
    468453017.98,
    460838134.36,
    469658683.27,
    466010855.27,
    596117186.98,
    643220711.68,
    621102066.66,
    611055339.39,
    600978511.88,
    598849129.55
  ],
  desembolsar: [
    343899842.51,
    291946910.3,
    281479207.29,
    287539377.53,
    299497971.69,
    336253876.98,
    356597165.31,
    313214230.29,
    365547218.11,
    403200618.13,
    369290515.02,
    341506019.96,
    334855602.27,
    374681780.14,
    374681780.14,
    374681780.14,
    349623776.21,
    320428253.52,
    271288645.56,
    282488958.63,
    261586275.91,
    193533110.93,
    171946735.02,
    96970174.32
  ],
  aprobados: [
    20000000.0,
    20000000.0,
    70000000.0,
    85000000.0,
    68000000.0,
    43000000.0,
    0.0,
    65300000.0,
    0.0,
    0.0,
    0.0,
    87000000.0,
    87000000.0,
    43400000.0,
    43400000.0,
    43400000.0,
    43400000.0,
    193400000.0,
    43400000.0,
    0.0,
    0.0,
    5000000.0,
    65000000.0,
    65000000.0
  ],
  activar: [
    120000000,
    95000000,
    115000000,
    90000000,
    90000000,
    90000000,
    90000000,
    90000000,
    90000000,
    20000000,
    20000000,
    0,
    0,
    0,
    0,
    0,
    0,
    50000000,
    50000000,
    0,
    0,
    0,
    0,
    50000000
  ]
};

const bolSeries: CountrySeries = {
  cobrar: [
    298404811.86,
    302065466.97,
    321868609.81,
    331635982.47,
    342788629.73,
    341389294.26,
    350102480.95,
    355393057.84,
    353409666.14,
    349410458.88,
    344269172.44,
    395008941.21,
    389829347.68,
    381448827.17,
    381842296.31,
    440617280.95,
    429041253.51,
    426920732.83,
    427959299.49,
    434014931.3,
    447393145.73,
    448396855.59,
    444996314.46,
    431733196.95
  ],
  desembolsar: [
    127758391.59,
    119258391.59,
    96167229.92,
    116715942.92,
    100815942.92,
    96785942.92,
    83046182.71,
    71389680.53,
    68389680.53,
    164189680.53,
    204189680.53,
    140388639.24,
    140028639.24,
    140028639.24,
    134300071.41,
    67300071.41,
    67300071.41,
    174785473.78,
    162037546.35,
    147687546.35,
    127818221.35,
    113269142.9,
    113269142.9,
    150768213.09
  ],
  aprobados: [
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    100000000.0,
    140000000.0,
    40000000.0,
    0.0,
    0.0,
    0.0,
    0.0,
    57246082.37,
    113296082.37,
    113296082.37,
    75000000.0,
    75000000.0,
    75000000.0,
    75000000.0,
    75000000.0,
    92796804.43,
    50000000.0
  ],
  activar: [
    35000000,
    35000000,
    35000000,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    75000000,
    75000000,
    75000000,
    75000000,
    75000000,
    75000000,
    75000000
  ]
};

const braSeries: CountrySeries = {
  cobrar: [
    74126765.06,
    84724072.53,
    90160129.86,
    106045355.39,
    105588850.47,
    116197428.67,
    121697835.37,
    143242762.49,
    142786257.57,
    148942946.72,
    150377172.73,
    178991740.87,
    180836004.63,
    185133265.09,
    202772852.31,
    206257609.78,
    205840993.61,
    227278001.96,
    247672490.25,
    268517062.73,
    288551597.78,
    294594310.55,
    330511079.36,
    379009525.56
  ],
  desembolsar: [
    185174822.33,
    172786585.3,
    199653570.52,
    180736962.9,
    180736962.9,
    167097002.61,
    161140090.99,
    136563781.78,
    166563781.78,
    156076952.62,
    181685269.07,
    279739608.29,
    275519608.29,
    296632608.29,
    276617284.82,
    402542787.81,
    460325087.42,
    525298339.52,
    500185199.86,
    534431152.54,
    509222486.2,
    496583205.59,
    498000882.33,
    546851077.51
  ],
  aprobados: [
    49997360.0,
    81997360.0,
    94877360.0,
    94877360.0,
    94877360.0,
    177007360.0,
    156510000.0,
    206510000.0,
    216510000.0,
    216510000.0,
    164130000.0,
    165130000.0,
    165130000.0,
    175130000.0,
    346130000.0,
    201000000.0,
    141000000.0,
    217000000.0,
    217000000.0,
    157000000.0,
    207000000.0,
    271000000.0,
    267800000.0,
    198800000.0
  ],
  activar: new Array(24).fill(0)
};

const parSeries: CountrySeries = {
  cobrar: [
    150109232.36,
    155525318.53,
    171649764.24,
    179772933.41,
    190110016.72,
    192868238.36,
    214836459.44,
    275546471.47,
    283268078.85,
    295198660.95,
    309964127.32,
    342042383.89,
    330076817.0,
    347847546.06,
    340373661.84,
    342268613.01,
    333472496.24,
    343094089.48,
    364900549.47,
    379867061.22,
    385092685.31,
    385588974.48,
    417052958.76,
    455693611.28
  ],
  desembolsar: [
    287829681.32,
    279036764.32,
    261913478.67,
    250413478.67,
    239201322.86,
    233066270.39,
    210222976.81,
    146136133.95,
    132457524.82,
    251395875.89,
    229402286.89,
    193947199.49,
    193947199.49,
    172799639.6,
    339926347.6,
    334654565.6,
    327721104.77,
    314722680.7,
    276331576.7,
    257988234.12,
    235503033.12,
    231629913.12,
    182906351.93,
    140888868.58
  ],
  aprobados: [
    142000000.0,
    142000000.0,
    142000000.0,
    276245764.0,
    276245764.0,
    276245764.0,
    276245764.0,
    276245764.0,
    276245764.0,
    130000000.0,
    175000000.0,
    175000000.0,
    175000000.0,
    175000000.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0
  ],
  activar: [
    90000000,
    90000000,
    90000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000,
    310000000
  ]
};

const rnsSeries: CountrySeries = {
  cobrar: [
    0,
    36000000.0,
    36000000.0,
    72000000.0,
    72000000.0,
    72000000.0,
    72000000.0,
    72000000.0,
    72000000.0,
    72000000.0,
    72000000.0,
    76000000.0,
    95500000.0,
    80166666.67,
    73666666.67,
    98333333.34,
    107833333.34,
    92500000.0,
    86000000.0,
    129000000.0,
    149000000.0,
    135500000.0,
    134000000.0,
    126500000.0
  ],
  desembolsar: [
    0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    6000000.0,
    6000000.0,
    6000000.0,
    29500000.0,
    25500000.0,
    6000000.0,
    21333333.33,
    15833333.33,
    29166666.66,
    19666666.66,
    29000000.0,
    6000000.0,
    12000000.0,
    12000000.0,
    19500000.0,
    21000000.0,
    28500000.0
  ],
  aprobados: [
    0.0,
    0.0,
    36000000.0,
    0.0,
    0.0,
    0.0,
    0.0,
    42000000.0,
    42000000.0,
    42000000.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    20000000.0,
    20000000.0,
    0.0,
    0.0,
    0.0,
    0.0
  ],
  activar: new Array(24).fill(0)
};

const uruSeries: CountrySeries = {
  cobrar: [
    190405409.07,
    219648934.22,
    216919767.56,
    239180940.71,
    236451774.05,
    244347883.2,
    271142631.1,
    269610420.02,
    266881253.36,
    278784750.02,
    282263370.54,
    278338933.02,
    275900081.52,
    270809981.02,
    303176130.07,
    328911029.57,
    447140512.95,
    442050430.95,
    483749913.83,
    527381779.03,
    578497324.27,
    573407223.77,
    585625925.76,
    598810527.87
  ],
  desembolsar: [
    115684240.07,
    90384240.07,
    90384240.07,
    57066592.07,
    57066592.07,
    59989008.07,
    30465093.51,
    27710566.59,
    27710566.59,
    11264775.36,
    5056988.18,
    2922272.18,
    0.06,
    0.06,
    0.56,
    139175000.56,
    11645000.06,
    71645000.06,
    45645000.06,
    159849652.22,
    98832942.1,
    98832942.1,
    76713075.23,
    58438370.12
  ],
  aprobados: [
    0.0,
    0.0,
    21000000.0,
    21000000.0,
    21000000.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0,
    150000000.0,
    0.0,
    60000000.0,
    37960000.0,
    12960000.0,
    0.0,
    0.0,
    0.0,
    0.0,
    0.0
  ],
  activar: [
    0,
    0,
    24000000,
    24000000,
    24000000,
    24000000,
    24000000,
    24000000,
    24000000,
    24000000,
    24000000,
    0,
    0,
    0,
    0,
    150000000,
    415000000,
    482040000,
    482040000,
    332040000,
    332040000,
    332040000,
    332040000,
    332040000
  ]
};

const projectionDisbursements2026: Record<CountryCode, number[]> = {
  ARG: [53_200_000, 9_800_000, 11_300_000, 21_000_000],
  BOL: [25_000_000, 14_250_000, 35_500_000, 41_500_000],
  BRA: [28_343_912, 46_620_000, 23_719_720, 56_400_000],
  PAR: [0, 5_000_000, 23_042_371, 44_677_933],
  RNS: [0, 55_000_000, 0, 0],
  URU: [18_000_000, 8_000_000, 18_366_823, 12_071_547]
};

const amortizations2026: Record<CountryCode, number[]> = {
  ARG: [20_439_893.82, 10_081_139.47, 20_732_231.48, 10_081_139.47],
  BOL: [12_005_776.72, 8_198_800.38, 12_005_776.72, 8_198_800.38],
  BRA: [6_844_664.03, 6_651_358.61, 6_844_664.03, 5_718_025.29],
  RNS: [6_000_000, 1_500_000, 6_000_000, 1_500_000],
  PAR: [18_081_896.48, 3_376_830.83, 18_081_896.48, 3_376_830.83],
  URU: [9_901_164.88, 5_090_103.35, 9_901_164.88, 5_090_103.35]
};

const activitiesInVigencia2026ByCountry: Record<CountryCode, number> = {
  ARG: 140_000_000,
  BOL: 135_000_000,
  BRA: 140_000_000,
  PAR: 135_000_000,
  RNS: 65_000_000,
  URU: 135_000_000
};

const appendProjections2026 = (series: CountrySeries, code: CountryCode): CountrySeries => {
  const disbursements = projectionDisbursements2026[code] ?? [0, 0, 0, 0];
  const amortizations = amortizations2026[code] ?? [0, 0, 0, 0];
  const activitiesTotal = activitiesInVigencia2026ByCountry[code] ?? 0;
  const activitiesPerQuarter = activitiesTotal / 3;
  const activitiesByQuarter = [0, activitiesPerQuarter, activitiesPerQuarter, activitiesPerQuarter];

  const cobrarBase = series.cobrar[series.cobrar.length - 1] ?? 0;
  const desembolsarBase = series.desembolsar[series.desembolsar.length - 1] ?? 0;
  const aprobadosBase = series.aprobados[series.aprobados.length - 1] ?? 0;
  const activarBase = series.activar[series.activar.length - 1] ?? 0;

  const cobrar2026: number[] = [];
  const desembolsar2026: number[] = [];
  let cobrarPrev = cobrarBase;
  let desembolsarPrev = desembolsarBase;

  disbursements.forEach((value, index) => {
    const amort = amortizations[index] ?? 0;
    cobrarPrev = cobrarPrev + value - amort;
    cobrar2026.push(cobrarPrev);

    desembolsarPrev = desembolsarPrev - value + (activitiesByQuarter[index] ?? 0);
    desembolsar2026.push(desembolsarPrev);
  });

  return {
    cobrar: [...series.cobrar, ...cobrar2026],
    desembolsar: [...series.desembolsar, ...desembolsar2026],
    aprobados: [...series.aprobados, ...new Array(4).fill(aprobadosBase)],
    activar: [...series.activar, ...new Array(4).fill(activarBase)]
  };
};

export const countrySeriesByCode: Record<CountryCode, CountrySeries> = {
  ARG: appendProjections2026(argSeries, 'ARG'),
  BOL: appendProjections2026(bolSeries, 'BOL'),
  BRA: appendProjections2026(braSeries, 'BRA'),
  PAR: appendProjections2026(parSeries, 'PAR'),
  RNS: appendProjections2026(rnsSeries, 'RNS'),
  URU: appendProjections2026(uruSeries, 'URU')
};

export const countryChartsByCode: Record<CountryCode, StackedBarChartConfig> = {
  ARG: buildCountryStackedConfig('ARG', countrySeriesByCode.ARG),
  BOL: buildCountryStackedConfig('BOL', countrySeriesByCode.BOL),
  BRA: buildCountryStackedConfig('BRA', countrySeriesByCode.BRA),
  PAR: buildCountryStackedConfig('PAR', countrySeriesByCode.PAR),
  RNS: buildCountryStackedConfig('RNS', countrySeriesByCode.RNS),
  URU: buildCountryStackedConfig('URU', countrySeriesByCode.URU)
};

export const countryStackedCharts: StackedBarChartConfig[] = countryOrder.map(
  (code) => countryChartsByCode[code]
);
