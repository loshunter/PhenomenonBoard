import { useState, useEffect, useRef } from 'react';
import { Node, Link } from '../types';

function getDistanceFromLineSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;
  if (param < 0) { xx = x1; yy = y1; }
  else if (param > 1) { xx = x2; yy = y2; }
  else { xx = x1 + param * C; yy = y1 + param * D; }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

export const useCanvasInteraction = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  nodesRef: React.RefObject<Node[]>,
  linksRef: React.RefObject<Link[]>,
  onAddLink: (source: Node, target: Node) => void,
  mode: 'RESEARCH' | 'SHOW'
) => {
  const transformRef = useRef({ k: 1, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, content: any, type: 'node' | 'link' } | null>(null);
  const [dragNode, setDragNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoom = 0.001;
      const { k, x, y } = transformRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const wx = (mx - x) / k;
      const wy = (my - y) / k;
      const nk = Math.min(Math.max(0.2, k - e.deltaY * zoom), 5);
      transformRef.current = { k: nk, x: mx - wx * nk, y: my - wy * nk };
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, [canvasRef]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const mx = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;

    const hit = nodesRef.current?.slice().reverse().find(n => {
      const dist = Math.sqrt((mx - n.x)**2 + (my - n.y)**2);
      return dist < n.radius + 5;
    });

    if (hit) {
      if (e.shiftKey && selectedNode && selectedNode.id !== hit.id) {
        onAddLink(selectedNode, hit);
      } else {
        setDragNode(hit);
        setSelectedNode(hit);
      }
    } else {
      setIsDragging(true);
      if (!e.shiftKey && mode === 'RESEARCH') setSelectedNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const rawX = e.clientX;
    const rawY = e.clientY;
    const mx = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;

    const hitNode = nodesRef.current?.slice().reverse().find(n => {
      const dist = Math.sqrt((mx - n.x)**2 + (my - n.y)**2);
      return dist < n.radius + 5;
    });

    if (hitNode) {
      setHoverInfo({ x: rawX, y: rawY, content: hitNode, type: 'node' });
    } else {
      const hitLink = linksRef.current?.find(l => {
        const dist = getDistanceFromLineSegment(mx, my, l.source.x, l.source.y, l.target.x, l.target.y);
        return dist < 5 / transformRef.current.k;
      });

      if (hitLink) {
        setHoverInfo({ x: rawX, y: rawY, content: hitLink, type: 'link' });
      } else {
        setHoverInfo(null);
      }
    }

    if (dragNode) {
      dragNode.x = mx;
      dragNode.y = my;
      dragNode.vx = 0; dragNode.vy = 0;
    } else if (isDragging) {
      transformRef.current.x += e.movementX;
      transformRef.current.y += e.movementY;
    }
  };

  const handleMouseUp = () => {
    setDragNode(null);
    setIsDragging(false);
  };
  
  const getScreenCenter = () => {
    if (!canvasRef.current) return { x: 0, y: 0 };
    return {
        x: -transformRef.current.x / transformRef.current.k + (canvasRef.current.width/2)/transformRef.current.k,
        y: -transformRef.current.y / transformRef.current.k + (canvasRef.current.height/2)/transformRef.current.k,
    }
  }

  return {
    transformRef,
    selectedNode,
    setSelectedNode,
    hoverInfo,
    dragNode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getScreenCenter,
  };
};
