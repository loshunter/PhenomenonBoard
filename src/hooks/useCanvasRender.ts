import { useCallback } from 'react';
import { Node, Link } from '../types';

export const useCanvasRender = (
  canvasRef: React.RefObject<HTMLCanvasElement>,
  nodesRef: React.RefObject<Node[]>,
  linksRef: React.RefObject<Link[]>,
  transformRef: React.RefObject<{ k: number; x: number; y: number; }>,
  selectedNode: Node | null,
  hoverInfo: { x: number, y: number, content: any, type: 'node' | 'link' } | null,
  mode: 'RESEARCH' | 'SHOW'
) => {
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(transformRef.current.x, transformRef.current.y);
    ctx.scale(transformRef.current.k, transformRef.current.k);

    const selectedId = selectedNode?.id;
    const neighborIds = new Set<string>();
    if (selectedId) {
      linksRef.current?.forEach(l => {
        if (l.source.id === selectedId) neighborIds.add(l.target.id);
        if (l.target.id === selectedId) neighborIds.add(l.source.id);
      });
    }

    // Grid
    if (mode === 'RESEARCH') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1 / transformRef.current.k;
      ctx.beginPath();
      for(let i=-20; i<=20; i++) {
        ctx.moveTo(i*100, -2000); ctx.lineTo(i*100, 2000);
        ctx.moveTo(-2000, i*100); ctx.lineTo(2000, i*100);
      }
      ctx.stroke();
    }

    // Links
    const activeLink = hoverInfo?.type === 'link' ? hoverInfo.content : null;

    linksRef.current?.forEach(link => {
      let alpha = 1;
      let width = link.relation === 'investigated' ? 2 : 1;
      
      if (selectedId) {
        const isDirect = (link.source.id === selectedId || link.target.id === selectedId);
        alpha = isDirect ? 1 : 0.1;
      }
      
      if (activeLink && activeLink.source.id === link.source.id && activeLink.target.id === link.target.id) {
        alpha = 1;
        width = 4;
        ctx.shadowColor = link.color;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.strokeStyle = link.color;
      ctx.lineWidth = width; 
      ctx.globalAlpha = alpha;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Nodes
    nodesRef.current?.forEach(node => {
      let alpha = 1;
      if (selectedId) {
        const isSelf = node.id === selectedId;
        const isNeighbor = neighborIds.has(node.id);
        alpha = (isSelf || isNeighbor) ? 1 : 0.2;
      }
      ctx.globalAlpha = alpha;

      if (mode === 'SHOW' || node.type.startsWith('concept')) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = node.color;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      
      if (node.type.startsWith('concept')) {
        ctx.fillStyle = node.color;
        ctx.fill();
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.color;
        ctx.stroke();
      }

      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      }
      
      if (hoverInfo?.type === 'node' && hoverInfo.content.id === node.id) {
        ctx.strokeStyle = 'rgba(255,255,200,0.8)'; ctx.lineWidth = 2; ctx.stroke();
      }

      ctx.shadowBlur = 0;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = node.type.startsWith('concept') 
        ? `bold ${14/transformRef.current.k}px sans-serif`
        : `400 ${10/transformRef.current.k}px monospace`;
      ctx.textAlign = 'center';
      const yOffset = node.radius + (15 / transformRef.current.k);
      ctx.fillText(node.title, node.x, node.y + yOffset);
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }, [canvasRef, nodesRef, linksRef, transformRef, selectedNode, hoverInfo, mode]);

  return { draw };
};
