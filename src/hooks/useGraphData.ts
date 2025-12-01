import { useState, useEffect, useCallback, useRef } from 'react';
import { Node, Link, GraphData, RelationType } from '../types';
import { GraphService } from '../services/GraphService';
import { LINK_COLORS } from '../theme';

export const useGraphData = (graphService: GraphService) => {
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    graphService.load().then((data: GraphData) => {
      nodesRef.current = data.nodes;
      linksRef.current = data.links;
      setIsLoaded(true);
    });
  }, [graphService]);

  const saveGraph = useCallback(() => {
    graphService.save(nodesRef.current, linksRef.current);
  }, [graphService]);

  const addNode = (node: Node) => {
    // Note: This will only add to the local state. Save is not implemented for static service.
    nodesRef.current.push(node);
    saveGraph();
  };

  const addLink = (sourceId: string, targetId: string) => {
    const exists = linksRef.current.find(l => 
      (l.source === sourceId && l.target === targetId) || 
      (l.source === targetId && l.target === sourceId)
    );
    if (!exists) {
      linksRef.current.push({ 
        source: sourceId, 
        target: targetId, 
        relation: 'user_connected' as RelationType, 
        color: LINK_COLORS.default 
      });
      saveGraph();
    }
  };

  const getConnections = (node: Node) => {
    const connectedLinks = linksRef.current.filter(l => l.source === node.id || l.target === node.id);
    
    return connectedLinks.map(link => {
      const otherId = link.source === node.id ? link.target : link.source;
      const otherNode = nodesRef.current.find(n => n.id === otherId);
      return {
        other: otherNode,
        relation: link.relation,
        // description is no longer a part of the Link type, returning empty string for compatibility
        description: '' 
      };
    }).filter(conn => conn.other); // Filter out any connections where the other node wasn't found
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
