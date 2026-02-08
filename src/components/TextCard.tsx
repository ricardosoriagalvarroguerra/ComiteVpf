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
      {footer && <div className="text-card__footer">{footer}</div>}
    </article>
  );
};

export default TextCard;
