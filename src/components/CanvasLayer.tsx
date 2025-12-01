import React, { forwardRef } from 'react';

interface CanvasLayerProps {
  onMouseDown: (e: React.MouseEvent) => void;
  onMouseMove: (e: React.MouseEvent) => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
}

export const CanvasLayer = forwardRef<HTMLCanvasElement, CanvasLayerProps>((props, ref) => {
  return (
    <canvas
      ref={ref}
      className="absolute inset-0 cursor-crosshair"
      onMouseDown={props.onMouseDown}
      onMouseMove={props.onMouseMove}
      onMouseUp={props.onMouseUp}
      onMouseLeave={props.onMouseLeave}
    />
  );
});
