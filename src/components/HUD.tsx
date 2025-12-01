import React from 'react';
import { Activity, Plus, Trash2 } from 'lucide-react';
import { Node, NodeType } from '../types';
import { NODE_STYLES } from '../theme';

interface HUDProps {
  mode: 'RESEARCH' | 'SHOW';
  setMode: (mode: 'RESEARCH' | 'SHOW') => void;
  onAddNode: () => void;
  onReset: () => void;
  hoverInfo: { x: number, y: number, content: any, type: 'node' | 'link' } | null;
}

export const HUD: React.FC<HUDProps> = ({ mode, setMode, onAddNode, onReset, hoverInfo }) => {
  return (
    <>
      {/* HOVER TOOLTIP */}
      {hoverInfo && (
        <div 
          className="fixed pointer-events-none z-50 p-3 rounded-lg shadow-2xl bg-slate-900/95 border border-slate-600 max-w-xs backdrop-blur-md"
          style={{ 
            left: hoverInfo.x + 15, 
            top: hoverInfo.y + 15,
            transform: 'translate(0, 0)'
          }}
        >
          {hoverInfo.type === 'node' ? (
            // NODE HOVER
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
                {NODE_STYLES[hoverInfo.content.type as NodeType].label}
              </div>
              <div className="font-bold text-white mb-1">{hoverInfo.content.title}</div>
              {hoverInfo.content.year && <div className="text-xs text-slate-400 font-mono mb-2">{hoverInfo.content.year}</div>}
              <div className="text-xs text-slate-300 line-clamp-2">{hoverInfo.content.summary}</div>
            </div>
          ) : (
            // LINK HOVER
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                 <span className="text-xs font-bold text-slate-300 uppercase">{hoverInfo.content.relation.replace('_', ' ')}</span>
              </div>
              <div className="text-xs text-white">
                 <span className="text-slate-400">Between: </span>
                 {hoverInfo.content.source.title} & {hoverInfo.content.target.title}
              </div>
              {hoverInfo.content.description && (
                <div className="mt-2 text-xs text-emerald-300 italic border-t border-slate-700 pt-1">
                   "{hoverInfo.content.description}"
                </div>
              )}
            </div>
          )}
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
