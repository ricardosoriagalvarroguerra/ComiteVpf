import type { DebtSourcesSlide as DebtSourcesSlideType } from '../types/slides';
import SimpleTableCard from './SimpleTableCard';

type DebtSourcesSlideProps = {
  slide: DebtSourcesSlideType;
};

const DebtSourcesSlide = ({ slide }: DebtSourcesSlideProps) => (
  <div className="debt-sources">
    <div className="debt-sources__header">
      <p className="debt-sources__eyebrow">{slide.eyebrow}</p>
      <h2 className="debt-sources__title">{slide.title}</h2>
      {slide.description && <p className="debt-sources__description">{slide.description}</p>}
    </div>
    <div className="debt-sources__tables">
      {slide.tables.map((table, index) => (
        <SimpleTableCard key={`${table.title ?? 'table'}-${index}`} table={table} />
      ))}
    </div>
    {slide.hint && <div className="debt-sources__hint">{slide.hint}</div>}
  </div>
);

export default DebtSourcesSlide;
