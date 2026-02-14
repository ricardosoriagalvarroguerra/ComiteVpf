import type { TextTableSlide as TextTableSlideType } from '../types/slides';
import SimpleTableCard from './SimpleTableCard';
import TextCard from './TextCard';

type Props = {
  slide: TextTableSlideType;
};

const TextTableSlide = ({ slide }: Props) => (
  <div className="text-table-slide">
    <TextCard
      eyebrow={slide.eyebrow}
      title={slide.title}
      description={slide.description}
      body={slide.body}
      highlights={slide.highlights}
      highlightEmphasisPrefixes={slide.highlightEmphasisPrefixes}
    />
    <SimpleTableCard table={slide.table} className="text-table-slide__table" />
  </div>
);

export default TextTableSlide;
