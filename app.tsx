import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Node, Link } from './src/types';
import { StaticGraphService } from './src/services/GraphService';
import { useGraphData } from './src/hooks/useGraphData';
import { usePhysicsSimulation } from './src/hooks/usePhysicsSimulation';
import { useCanvasInteraction } from './src/hooks/useCanvasInteraction';
import { useCanvasRender } from './src/hooks/useCanvasRender';
import { CanvasLayer } from './src/components/CanvasLayer';
import { HUD } from './src/components/HUD';
import { NodeDetailPanel } from './src/components/NodeDetailPanel';
import { AddNodeModal } from './src/components/AddNodeModal';

const graphService = new StaticGraphService();

export default function PhenomenonBoard() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();

  const [mode, setMode] = useState<'RESEARCH' | 'SHOW'>('RESEARCH');
  const [isAddingNode, setIsAddingNode] = useState(false);

  const {
    nodesRef,
    linksRef,
    isLoaded,
    addNode,
    addLink,
    getConnections,
    resetGraph,
  } = useGraphData(graphService);

  const {
    transformRef,
    selectedNode,
    setSelectedNode,
    hoverInfo,
    dragNode,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    getScreenCenter,
  } = useCanvasInteraction(canvasRef, nodesRef, linksRef, addLink, mode);

  const { tickSimulation } = usePhysicsSimulation(nodesRef, linksRef, dragNode);
  const { draw } = useCanvasRender(canvasRef, nodesRef, linksRef, transformRef, selectedNode, hoverInfo, mode);

  useEffect(() => {
    const animate = () => {
      tickSimulation();
      draw();
      requestRef.current = requestAnimationFrame(animate);
    };
    if (isLoaded) {
      requestRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoaded, tickSimulation, draw]);

  useEffect(() => {
    const r = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', r);
    r();
    return () => window.removeEventListener('resize', r);
  }, []);

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans select-none">
      <CanvasLayer
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      <HUD
        mode={mode}
        setMode={setMode}
        onAddNode={() => setIsAddingNode(true)}
        onReset={resetGraph}
        hoverInfo={hoverInfo}
        nodesRef={nodesRef}
      />
      {isAddingNode && (
        <AddNodeModal
          onClose={() => setIsAddingNode(false)}
          onAddNode={(node) => {
            addNode(node);
            setSelectedNode(node);
          }}
          getScreenCenter={getScreenCenter}
        />
      )}
      {selectedNode && !isAddingNode && (
        <NodeDetailPanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onSelectNode={setSelectedNode}
          getConnections={getConnections}
        />
      )}
    </div>
  );
}