import type { PropsWithChildren } from 'react';

type SlideProps = PropsWithChildren<{
  variant?: 'hero' | 'navigation' | 'content' | 'grid';
  isActive?: boolean;
  slideId?: string;
}>;

const Slide = ({ children, variant = 'content', isActive = false, slideId }: SlideProps) => (
  <section
    className={`slide slide--${variant}`}
    data-active={isActive ? 'true' : 'false'}
    data-slide-id={slideId}
  >
    <div className="slide__inner">{children}</div>
  </section>
);

export default Slide;
