'use client';

import React, { useRef, useEffect } from 'react';

interface InteractiveWarpGridProps {
  gridSize?: number;
  warpRadius?: number;
  warpStrength?: number;
  lineColor?: string;
  glowColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const InteractiveWarpGrid: React.FC<InteractiveWarpGridProps> = ({
  gridSize = 36,
  warpRadius = 240,
  warpStrength = 52,
  lineColor = 'rgba(147, 197, 253, 0.22)',
  glowColor = 'rgba(91, 45, 144, 0.4)',
  className,
  style,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Attach listener to parent banner so mouse events across all text/content trigger the warp
    const targetElement = container.parentElement || container;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Mouse state
    const mouse = {
      x: -1000,
      y: -1000,
      targetX: -1000,
      targetY: -1000,
      isHovered: false,
      hoverOpacity: 0,
    };

    const handleResize = () => {
      if (!targetElement || !canvas) return;
      const rect = targetElement.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(targetElement);
    handleResize();

    const handleMouseMove = (e: MouseEvent) => {
      const rect = targetElement.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
      mouse.isHovered = true;
    };

    const handleMouseLeave = () => {
      mouse.isHovered = false;
    };

    targetElement.addEventListener('mousemove', handleMouseMove);
    targetElement.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const render = () => {
      // Smooth interpolation (lerp)
      mouse.x += (mouse.targetX - mouse.x) * 0.14;
      mouse.y += (mouse.targetY - mouse.y) * 0.14;

      // Smooth hover fade in/out
      if (mouse.isHovered) {
        mouse.hoverOpacity += (1 - mouse.hoverOpacity) * 0.12;
      } else {
        mouse.hoverOpacity += (0 - mouse.hoverOpacity) * 0.08;
      }

      ctx.clearRect(0, 0, width, height);

      if (width === 0 || height === 0) {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      const cols = Math.ceil(width / gridSize) + 4;
      const rows = Math.ceil(height / gridSize) + 4;
      const offsetX = (width % gridSize) / 2 - gridSize * 2;
      const offsetY = (height % gridSize) / 2 - gridSize * 2;

      // 2D grid matrix of vertices
      const points: { x: number; y: number }[][] = [];

      for (let r = 0; r <= rows; r++) {
        points[r] = [];
        for (let c = 0; c <= cols; c++) {
          const origX = offsetX + c * gridSize;
          const origY = offsetY + r * gridSize;

          let finalX = origX;
          let finalY = origY;

          if (mouse.hoverOpacity > 0.01) {
            const dx = origX - mouse.x;
            const dy = origY - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < warpRadius && dist > 0.001) {
              // Smooth gravitational warp curve (elastic bell curve)
              const factor = 1 - dist / warpRadius;
              const warpAmount = Math.sin(factor * Math.PI * 0.5) * warpStrength * mouse.hoverOpacity;
              const angle = Math.atan2(dy, dx);

              // Displace point outward around cursor, forming smooth curved grid lines
              finalX = origX + Math.cos(angle) * warpAmount;
              finalY = origY + Math.sin(angle) * warpAmount;
            }
          }

          points[r][c] = { x: finalX, y: finalY };
        }
      }

      // Draw Grid Horizontal Lines
      ctx.lineWidth = 1;
      for (let r = 0; r <= rows; r++) {
        ctx.beginPath();
        for (let c = 0; c <= cols; c++) {
          const pt = points[r][c];
          if (c === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.strokeStyle = lineColor;
        ctx.stroke();
      }

      // Draw Grid Vertical Lines
      for (let c = 0; c <= cols; c++) {
        ctx.beginPath();
        for (let r = 0; r <= rows; r++) {
          const pt = points[r][c];
          if (r === 0) {
            ctx.moveTo(pt.x, pt.y);
          } else {
            ctx.lineTo(pt.x, pt.y);
          }
        }
        ctx.strokeStyle = lineColor;
        ctx.stroke();
      }

      // Draw Subtle Cursor Halo / Concentric Lens Ring
      if (mouse.hoverOpacity > 0.02) {
        // Soft Glow
        const grad = ctx.createRadialGradient(
          mouse.x,
          mouse.y,
          0,
          mouse.x,
          mouse.y,
          warpRadius * 1.15
        );
        grad.addColorStop(0, glowColor);
        grad.addColorStop(0.4, 'rgba(91, 45, 144, 0.15)');
        grad.addColorStop(1, 'transparent');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, warpRadius * 1.15, 0, Math.PI * 2);
        ctx.fill();

      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      targetElement.removeEventListener('mousemove', handleMouseMove);
      targetElement.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [gridSize, warpRadius, warpStrength, lineColor, glowColor]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        overflow: 'hidden',
        zIndex: 0,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
        }}
      />
    </div>
  );
};
