import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

type TextCardProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  body?: string;
  highlights?: string[];
  infoPopover?: {
    title: string;
    body: string[];
  };
  callout?: {
    title: string;
    body: string;
  };
  variant?: 'default' | 'hero';
  align?: 'left' | 'center';
  footer?: ReactNode;
  placeholder?: boolean;
};

const TextCard = ({
  eyebrow,
  title,
  description,
  body,
  highlights,
  infoPopover,
  callout,
  variant = 'default',
  align = 'left',
  footer,
  placeholder = false
}: TextCardProps) => {
  const [editableEyebrow, setEditableEyebrow] = useState(eyebrow ?? '');
  const [editableTitle, setEditableTitle] = useState(title);
  const [editableDescription, setEditableDescription] = useState(description ?? '');
  const [editableBody, setEditableBody] = useState(body ?? '');

  useEffect(() => {
    setEditableEyebrow(eyebrow ?? '');
  }, [eyebrow]);

  useEffect(() => {
    setEditableTitle(title);
  }, [title]);

  useEffect(() => {
    setEditableDescription(description ?? '');
  }, [description]);

  useEffect(() => {
    setEditableBody(body ?? '');
  }, [body]);

  const handleEditableInput =
    (setter: (value: string) => void) => (event: FormEvent<HTMLElement>) => {
      setter(event.currentTarget.textContent ?? '');
    };
  const showEyebrow = variant === 'hero' && eyebrow !== undefined;
  const showDescription = description !== undefined;
  const showBody = variant === 'hero' && body !== undefined;
  const showHighlights = Boolean(highlights && highlights.length > 0);

  if (placeholder) {
    return (
      <article
        className={`text-card text-card--${variant} text-card--align-${align} text-card--placeholder`}
        aria-hidden="true"
      />
    );
  }

  return (
    <article className={`text-card text-card--${variant} text-card--align-${align}`}>
      {infoPopover && (
        <div className="text-card__info">
          <button type="button" className="text-card__info-btn" aria-label={infoPopover.title}>
            i
          </button>
          <div className="text-card__info-popover" role="note">
            <p className="text-card__info-title">{infoPopover.title}</p>
            <ul className="text-card__info-list">
              {infoPopover.body.map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
      {showEyebrow && (
        <p
          className="text-card__eyebrow"
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditableInput(setEditableEyebrow)}
        >
          {editableEyebrow}
        </p>
      )}
      <h2
        className="text-card__title"
        contentEditable
        suppressContentEditableWarning
        onInput={handleEditableInput(setEditableTitle)}
      >
        {editableTitle}
      </h2>
      {showDescription && (
        <p
          className="text-card__description"
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditableInput(setEditableDescription)}
        >
          {editableDescription}
        </p>
      )}
      {showBody && (
        <p
          className="text-card__body"
          contentEditable
          suppressContentEditableWarning
          onInput={handleEditableInput(setEditableBody)}
        >
          {editableBody}
        </p>
      )}
      {showHighlights && (
        <ul className="text-card__highlights">
          {highlights?.map((highlight, index) => (
            <li key={`${highlight}-${index}`}>{highlight}</li>
          ))}
        </ul>
      )}
      {callout && (
        <section className="text-card__callout" aria-label={callout.title}>
          <p className="text-card__callout-title">{callout.title}</p>
          <p className="text-card__callout-body">{callout.body}</p>
        </section>
      )}
      {footer && <div className="text-card__footer">{footer}</div>}
    </article>
  );
};

export default TextCard;
