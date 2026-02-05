type SlideControlsProps = {
  activeIndex: number;
  total: number;
  onPrev: () => void;
  onNext: () => void;
};

const formatIndex = (value: number) => value.toString().padStart(2, '0');

const ArrowIcon = ({ direction }: { direction: 'up' | 'down' }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    role="presentation"
    aria-hidden="true"
  >
    <path
      d={
        direction === 'up'
          ? 'M12 6l6 6M12 6l-6 6M12 6v12'
          : 'M12 18l6-6M12 18l-6-6M12 6v12'
      }
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const SlideControls = ({ activeIndex, total, onPrev, onNext }: SlideControlsProps) => (
  <div className="slide-controls">
    <button
      type="button"
      className="slide-controls__btn"
      onClick={onPrev}
      disabled={activeIndex === 0}
      aria-label="Slide anterior"
    >
      <ArrowIcon direction="up" />
    </button>
    <div className="slide-controls__progress">
      <span>{formatIndex(activeIndex + 1)}</span>
      <span className="slide-controls__divider" />
      <span>{formatIndex(total)}</span>
    </div>
    <button
      type="button"
      className="slide-controls__btn"
      onClick={onNext}
      disabled={activeIndex === total - 1}
      aria-label="Slide siguiente"
    >
      <ArrowIcon direction="down" />
    </button>
  </div>
);

export default SlideControls;
