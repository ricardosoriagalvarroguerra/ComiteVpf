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
  const [editableHighlights, setEditableHighlights] = useState(highlights ?? []);
  const [editableCallout, setEditableCallout] = useState(callout ?? null);
  const [editableInfoPopover, setEditableInfoPopover] = useState(infoPopover ?? null);

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

  useEffect(() => {
    setEditableHighlights(highlights ?? []);
  }, [highlights]);

  useEffect(() => {
    setEditableCallout(callout ?? null);
  }, [callout]);

  useEffect(() => {
    setEditableInfoPopover(infoPopover ?? null);
  }, [infoPopover]);

  const handleEditableInput =
    (setter: (value: string) => void) => (event: FormEvent<HTMLElement>) => {
      setter(event.currentTarget.textContent ?? '');
    };

  const handleHighlightInput =
    (index: number) => (event: FormEvent<HTMLLIElement>) => {
      const nextValue = event.currentTarget.textContent ?? '';
      setEditableHighlights((prev) =>
        prev.map((item, itemIndex) => (itemIndex === index ? nextValue : item))
      );
    };

  const handleCalloutTitleInput = (event: FormEvent<HTMLParagraphElement>) => {
    const nextValue = event.currentTarget.textContent ?? '';
    setEditableCallout((prev) => (prev ? { ...prev, title: nextValue } : { title: nextValue, body: '' }));
  };

  const handleCalloutBodyInput = (event: FormEvent<HTMLParagraphElement>) => {
    const nextValue = event.currentTarget.textContent ?? '';
    setEditableCallout((prev) => (prev ? { ...prev, body: nextValue } : { title: '', body: nextValue }));
  };

  const showEyebrow = eyebrow !== undefined;
  const showDescription = description !== undefined;
  const showBody = body !== undefined;
  const showCallout = callout !== undefined;
  const showInfoPopover = infoPopover !== undefined;

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
      {showInfoPopover && editableInfoPopover && (
        <div className="text-card__info">
          <button type="button" className="text-card__info-btn" aria-label={editableInfoPopover.title}>
            !
          </button>
          <div className="text-card__info-popover" role="tooltip">
            <p className="text-card__info-title">{editableInfoPopover.title}</p>
            <ul className="text-card__info-list">
              {editableInfoPopover.body.map((item, index) => (
                <li key={`${index}-info`}>{item}</li>
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
      {showCallout && editableCallout && (
        <div className="text-card__callout">
          <p
            className="text-card__callout-title"
            contentEditable
            suppressContentEditableWarning
            onInput={handleCalloutTitleInput}
          >
            {editableCallout.title}
          </p>
          <p
            className="text-card__callout-body"
            contentEditable
            suppressContentEditableWarning
            onInput={handleCalloutBodyInput}
          >
            {editableCallout.body}
          </p>
        </div>
      )}
      {editableHighlights.length > 0 && (
        <ul className="text-card__highlights">
          {editableHighlights.map((item, index) => (
            <li
              key={`${index}-highlight`}
              contentEditable
              suppressContentEditableWarning
              onInput={handleHighlightInput(index)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      {footer && <div className="text-card__footer">{footer}</div>}
    </article>
  );
};

export default TextCard;
