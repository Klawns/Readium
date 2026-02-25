import React from 'react';
import type { ReaderRect } from '../domain/models';

interface PdfViewportRectButtonProps {
  rect: ReaderRect;
  title: string;
  className: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  onMouseEnter?: React.MouseEventHandler<HTMLButtonElement>;
}

export const PdfViewportRectButton: React.FC<PdfViewportRectButtonProps> = ({
  rect,
  title,
  className,
  onClick,
  onMouseEnter,
}) => (
  <button
    type="button"
    className={`pointer-events-auto absolute ${className}`}
    style={{
      left: `${rect.x * 100}%`,
      top: `${rect.y * 100}%`,
      width: `${rect.width * 100}%`,
      height: `${rect.height * 100}%`,
    }}
    title={title}
    onClick={onClick}
    onMouseEnter={onMouseEnter}
  />
);
