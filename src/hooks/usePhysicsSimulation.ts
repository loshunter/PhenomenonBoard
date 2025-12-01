import { useCallback } from 'react';
import { Node, Link } from '../types';

export const usePhysicsSimulation = (
  nodesRef: React.RefObject<Node[]>,
  linksRef: React.RefObject<Link[]>,
  dragNode: Node | null
) => {
  const tickSimulation = useCallback(() => {
    const nodes = nodesRef.current;
    if (!nodes) return;
    const links = linksRef.current;
    if (!links) return;

    const k_spring = 0.08;
    const repulsion = 1500;
    
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const distSq = dx*dx + dy*dy || 1;
        const dist = Math.sqrt(distSq);
        const factor = (n1.type.startsWith('concept') || n2.type.startsWith('concept')) ? 2 : 1;

        if (dist < 400) {
          const force = (repulsion * factor) / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.vx += fx; n1.vy += fy;
          n2.vx -= fx; n2.vy -= fy;
        }
      }
    }

    // Springs
    links.forEach(link => {
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const targetLen = 140;
      const force = (dist - targetLen) * k_spring;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      link.source.vx += fx; link.source.vy += fy;
      link.target.vx -= fx; link.target.vy -= fy;
    });

    // Integration
    nodes.forEach(node => {
      if (node === dragNode) return;
      node.vx -= node.x * 0.002;
      node.vy -= node.y * 0.002;
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.85; 
      node.vy *= 0.85;
    });

  }, [dragNode, nodesRef, linksRef]);

  return { tickSimulation };
};
