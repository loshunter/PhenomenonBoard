import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Link } from '../types';
import { GraphService } from '../services/GraphService';

export const useGraphData = (graphService: GraphService) => {
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    graphService.load().then(data => {
      nodesRef.current = data.nodes;
      linksRef.current = data.links;
      setIsLoaded(true);
    });
  }, [graphService]);

  const saveGraph = useCallback(() => {
    graphService.save(nodesRef.current, linksRef.current);
  }, [graphService]);

  const addNode = (node: Node) => {
    nodesRef.current.push(node);
    saveGraph();
  };

  const addLink = (source: Node, target: Node) => {
    const exists = linksRef.current.find(l => 
      (l.source.id === source.id && l.target.id === target.id) || 
      (l.source.id === target.id && l.target.id === source.id)
    );
    if (!exists) {
      linksRef.current.push({ source, target, relation: 'user_connected', color: '#475569', description: 'User created connection.' });
      saveGraph();
    }
  };

  const getConnections = (node: Node) => {
    return linksRef.current
      .filter(l => l.source.id === node.id || l.target.id === node.id)
      .map(l => {
        const other = l.source.id === node.id ? l.target : l.source;
        return { other, relation: l.relation, description: l.description };
      });
  };

  return {
    nodesRef,
    linksRef,
    isLoaded,
    saveGraph,
    resetGraph: graphService.reset,
    addNode,
    addLink,
    getConnections,
  };
};
