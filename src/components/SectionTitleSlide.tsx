import type { SectionTitleSlide as SectionTitleSlideType } from '../types/slides';
import estrellaFonLogo from '../assets/estrellafon_transparent.png';

type Props = {
  slide: SectionTitleSlideType;
};

const SectionTitleSlide = ({ slide }: Props) => (
  <div className="section-title-slide" aria-label={slide.title}>
    <div className="section-title-slide__title-wrap">
      <h2 className="section-title-slide__title">{slide.title}</h2>
      <img className="section-title-slide__logo" src={estrellaFonLogo} alt="Logo FONPLATA" />
    </div>
  </div>
);

export default SectionTitleSlide;
