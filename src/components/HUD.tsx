import React from 'react';
import { Activity, Plus, Trash2, MapPin } from 'lucide-react';
import { Node, Link as LinkType, EventNode } from '../types';

interface HUDProps {
  mode: 'RESEARCH' | 'SHOW';
  setMode: (mode: 'RESEARCH' | 'SHOW') => void;
  onAddNode: () => void;
  onReset: () => void;
  hoverInfo: { x: number; y: number; content: any; type: 'node' | 'link' } | null;
  nodesRef: React.RefObject<Node[]>;
}

const formatDate = (date: string | null) => (date ? new Date(date).getFullYear() : 'N/A');
const titleCase = (str: string) => str.replace(/_/g, ' ').replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());

export const HUD: React.FC<HUDProps> = ({ mode, setMode, onAddNode, onReset, hoverInfo, nodesRef }) => {
  const renderTooltipContent = () => {
    if (!hoverInfo) return null;

    if (hoverInfo.type === 'node') {
      const node = hoverInfo.content as Node;

      if (node.type.startsWith('event_')) {
        const eventNode = node as EventNode;
        const details = eventNode.details;
        return (
          <div>
            <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
              {titleCase(details.event_type)}
            </div>
            <div className="font-bold text-white mb-1">{details.title}</div>
            <div className="text-xs text-slate-400 font-mono mb-2 flex items-center gap-1">
               {formatDate(details.start_date)} 
               <span className="text-slate-600">&#8226;</span>
               <MapPin size={10} className="inline-block text-slate-500" />
               {details.location.site}
            </div>
            <div className="text-xs text-slate-300 line-clamp-3">{details.summary}</div>
          </div>
        );
      }

      // Generic node tooltip
      return (
        <div>
          <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
            {titleCase(node.type)}
          </div>
          <div className="font-bold text-white mb-1">{node.title}</div>
        </div>
      );
    }

    if (hoverInfo.type === 'link') {
      const link = hoverInfo.content as LinkType;
      const sourceNode = nodesRef.current?.find(n => n.id === link.source);
      const targetNode = nodesRef.current?.find(n => n.id === link.target);
      return (
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="w-2 h-2 rounded-full bg-slate-400"></div>
            <span className="text-xs font-bold text-slate-300 uppercase">
              {link.relation.replace(/_/g, ' ')}
            </span>
          </div>
          <div className="text-xs text-white">
            <span className="text-slate-400">Between: </span>
            {sourceNode?.title || '...'} & {targetNode?.title || '...'}
          </div>
        </div>
      );
    }

    return null;
  };

  return (
    <>
      {/* HOVER TOOLTIP */}
      {hoverInfo && (
        <div 
          className="fixed pointer-events-none z-50 p-3 rounded-lg shadow-2xl bg-slate-900/95 border border-slate-600 max-w-xs backdrop-blur-md animate-in fade-in duration-200"
          style={{ 
            left: hoverInfo.x + 15, 
            top: hoverInfo.y + 15,
            transform: 'translate(0, 0)'
          }}
        >
          {renderTooltipContent()}
        </div>
      )}

      {/* TOP LEFT HUD */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur rounded-lg border border-slate-700 shadow-xl p-4 mb-2">
          <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <Activity size={20} /> PHENOMENON
          </h1>
        </div>
      </div>

      {/* TOP RIGHT CONTROLS */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
        <div className="flex gap-2 bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700">
           <button onClick={onAddNode} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow transition-all active:scale-95">
            <Plus size={14} /> ADD NODE
          </button>
          <div className="w-px bg-slate-700 mx-1"></div>
          <button onClick={() => setMode('RESEARCH')} className={`px-3 py-1.5 rounded text-xs font-bold ${mode==='RESEARCH'?'bg-slate-700 text-white':'text-slate-500 hover:text-slate-300'}`}>RESEARCH</button>
          <button onClick={() => setMode('SHOW')} className={`px-3 py-1.5 rounded text-xs font-bold ${mode==='SHOW'?'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30':'text-slate-500 hover:text-slate-300'}`}>SHOW</button>
          <div className="w-px bg-slate-700 mx-1"></div>
          <button onClick={onReset} className="px-2 text-slate-500 hover:text-red-400" title="Reset Graph"><Trash2 size={14} /></button>
        </div>
      </div>
    </>
  );
};