import type { NavigationSlide } from '../types/slides';
import estrellaFonLogo from '../assets/estrellafon_transparent.png';

type NavigationProps = {
  slide: NavigationSlide;
  onSelect: (targetId: string) => void;
};

const Navigation = ({ slide, onSelect }: NavigationProps) => (
  <div className="navigation">
    <div className="navigation__intro">
      <div className="navigation__title-wrap">
        <h2>{slide.title}</h2>
        <img className="navigation__logo" src={estrellaFonLogo} alt="Logo FONPLATA" />
      </div>
    </div>
    <div className="navigation__grid">
      {slide.topics.map((topic) => (
        <article key={topic.id} className="navigation__card">
          <button type="button" className="navigation__card-main" onClick={() => onSelect(topic.id)}>
            <h3>
              <span className="navigation__topic-index">{topic.tag}</span>
              <span>{topic.title}</span>
            </h3>
          </button>
          {topic.slides && topic.slides.length ? (
            <div className="navigation__items" aria-label={`Desglose de ${topic.title}`}>
              {topic.slides.map((item, index) => (
                <button
                  type="button"
                  key={item.id}
                  className="navigation__item-btn"
                  onClick={() => onSelect(item.id)}
                >
                  <span className="navigation__item-index">{String(index + 1).padStart(2, '0')}</span>
                  <span className="navigation__item-label">{item.title}</span>
                </button>
              ))}
            </div>
          ) : null}
        </article>
      ))}
    </div>
  </div>
);

export default Navigation;
