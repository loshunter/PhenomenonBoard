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
    const transform = transformRef.current;
    if (!canvas || !nodesRef.current || !linksRef.current || !transform) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(transform.x, transform.y);
    ctx.scale(transform.k, transform.k);

    const nodesById = new Map(nodesRef.current.map(node => [node.id, node]));

    const activeNodeId = selectedNode?.id || (hoverInfo?.type === 'node' ? hoverInfo.content.id : null);
    
    const neighborIds = new Set<string>();
    if (activeNodeId) {
      linksRef.current.forEach(l => {
        if (l.source === activeNodeId) neighborIds.add(l.target);
        if (l.target === activeNodeId) neighborIds.add(l.source);
      });
    }

    // Grid
    if (mode === 'RESEARCH') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1 / transform.k;
      ctx.beginPath();
      for(let i=-40; i<=40; i++) {
        const pos = i * 100;
        ctx.moveTo(pos, -4000); ctx.lineTo(pos, 4000);
        ctx.moveTo(-4000, pos); ctx.lineTo(4000, pos);
      }
      ctx.stroke();
    }

    // Links
    const activeLink = hoverInfo?.type === 'link' ? hoverInfo.content : null;

    linksRef.current.forEach(link => {
      const sourceNode = nodesById.get(link.source);
      const targetNode = nodesById.get(link.target);
      if (!sourceNode || !targetNode) return;

      let alpha = 1;
      let width = 1;
      
      if (activeLink && activeLink.source === link.source && activeLink.target === link.target) {
        alpha = 1;
        width = 3;
        ctx.shadowColor = link.color;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.moveTo(sourceNode.x!, sourceNode.y!);
      ctx.lineTo(targetNode.x!, targetNode.y!);
      ctx.strokeStyle = link.color;
      ctx.lineWidth = width / transform.k; 
      ctx.globalAlpha = alpha;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Nodes
    nodesRef.current.forEach(node => {
      let alpha = 1;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, node.radius, 0, 2 * Math.PI);
      ctx.fillStyle = node.color;
      ctx.fill();

      // Highlight selected
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#fff'; 
        ctx.lineWidth = 3 / transform.k; 
        ctx.stroke();
      }
      
      // Highlight hovered
      if (hoverInfo?.type === 'node' && hoverInfo.content.id === node.id) {
        ctx.strokeStyle = 'rgba(255,255,200,0.8)'; 
        ctx.lineWidth = 2 / transform.k; 
        ctx.stroke();
      }
    });

    // Node Labels (drawn in a separate pass so they are on top)
    nodesRef.current.forEach(node => {
      let alpha = 1;
      ctx.globalAlpha = alpha;

      ctx.fillStyle = '#cbd5e1';
      ctx.font = `400 ${12/transform.k}px sans-serif`;
      ctx.textAlign = 'center';
      const yOffset = node.radius + (12 / transform.k);
      ctx.fillText(node.title, node.x!, node.y! + yOffset);
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }, [canvasRef, nodesRef, linksRef, transformRef, selectedNode, hoverInfo, mode]);

  return { draw };
};
