import type { TextTableSlide as TextTableSlideType } from '../types/slides';
import SimpleTableCard from './SimpleTableCard';
import TextCard from './TextCard';

type Props = {
  slide: TextTableSlideType;
};

const TextTableSlide = ({ slide }: Props) => (
  (() => {
    const usdMmSlides = new Set([
      'balance-activos-financieros',
      'como-se-generan-los-ingresos',
      'estado-de-resultados',
      'flujo-efectivo-2025'
    ]);
    const tableTitle = slide.table.title ?? '';
    const usdMmMatch = tableTitle.match(/\s*\((USD\s*MM)\)\s*$/i);
    const shouldSplitUsdMm = usdMmSlides.has(slide.id) && Boolean(usdMmMatch);
    const normalizedUnit = usdMmMatch ? usdMmMatch[1].replace(/\s+/g, ' ').toUpperCase() : null;
    const normalizedTitle = shouldSplitUsdMm
      ? tableTitle.replace(/\s*\(USD\s*MM\)\s*$/i, '')
      : tableTitle;

    return (
      <div className="text-table-slide">
        <TextCard
          eyebrow={slide.eyebrow}
          title={slide.title}
          description={slide.description}
          body={slide.body}
          highlights={slide.highlights}
          highlightEmphasisPrefixes={slide.highlightEmphasisPrefixes}
        />
        <SimpleTableCard
          table={{ ...slide.table, title: normalizedTitle }}
          className="text-table-slide__table"
          titleUnitTag={shouldSplitUsdMm && normalizedUnit ? normalizedUnit : undefined}
        />
      </div>
    );
  })()
);

export default TextTableSlide;
