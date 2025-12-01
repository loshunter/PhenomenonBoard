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

    const nodesById = new Map(nodes.map(node => [node.id, node]));
    const k_spring = 0.01;
    const repulsion = 500;
    
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        if (!n1.x || !n1.y || !n2.x || !n2.y) continue;

        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const distSq = dx*dx + dy*dy || 1;
        const dist = Math.sqrt(distSq);

        if (dist < 400) {
          const force = repulsion / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.vx = (n1.vx || 0) + fx;
          n1.vy = (n1.vy || 0) + fy;
          n2.vx = (n2.vx || 0) - fx;
          n2.vy = (n2.vy || 0) - fy;
        }
      }
    }

    // Springs
    links.forEach(link => {
      const sourceNode = nodesById.get(link.source);
      const targetNode = nodesById.get(link.target);
      if (!sourceNode || !targetNode || !sourceNode.x || !sourceNode.y || !targetNode.x || !targetNode.y) return;

      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const targetLen = 140;
      const force = (dist - targetLen) * k_spring;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      
      sourceNode.vx = (sourceNode.vx || 0) + fx;
      sourceNode.vy = (sourceNode.vy || 0) + fy;
      targetNode.vx = (targetNode.vx || 0) - fx;
      targetNode.vy = (targetNode.vy || 0) - fy;
    });

    // Integration
    nodes.forEach(node => {
      if (node === dragNode) return;
      if (!node.x || !node.y || !node.vx || !node.vy) return;

      node.vx -= node.x * 0.002;
      node.vy -= node.y * 0.002;
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.8; 
      node.vy *= 0.8;
    });

  }, [dragNode, nodesRef, linksRef]);

  return { tickSimulation };
};
