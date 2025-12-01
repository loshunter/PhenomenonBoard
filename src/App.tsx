import { useState, useEffect, useRef } from 'react';
import { StaticGraphService } from './services/GraphService';
import { useGraphData } from './hooks/useGraphData';
import { usePhysicsSimulation } from './hooks/usePhysicsSimulation';
import { useCanvasInteraction } from './hooks/useCanvasInteraction';
import { useCanvasRender } from './hooks/useCanvasRender';
import { CanvasLayer } from './components/CanvasLayer';
import { HUD } from './components/HUD';
import { NodeDetailPanel } from './components/NodeDetailPanel';
import { AddNodeModal } from './components/AddNodeModal';

const graphService = new StaticGraphService();

export default function App() {
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

  // Main animation loop
  useEffect(() => {
    if (!isLoaded) return;
    const animate = () => {
      tickSimulation();
      draw();
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [isLoaded, tickSimulation, draw]);

  // Canvas resize handler
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
