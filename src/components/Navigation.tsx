import type { NavigationSlide } from '../types/slides';

type NavigationProps = {
  slide: NavigationSlide;
  onSelect: (targetId: string) => void;
};

const Navigation = ({ slide, onSelect }: NavigationProps) => (
  <div className="navigation">
    <div className="navigation__intro">
      <p className="navigation__eyebrow">Mapa de contenidos</p>
    </div>
    <div className="navigation__grid">
      {slide.topics.map((topic) => (
        <button
          type="button"
          key={topic.id}
          className="navigation__card"
          onClick={() => onSelect(topic.id)}
        >
          <span className="navigation__tag">{topic.tag}</span>
          <h3>{topic.title}</h3>
          <p>{topic.description}</p>
          <span className="navigation__cta">Ir al módulo</span>
        </button>
      ))}
    </div>
  </div>
);

export default Navigation;

