import React from 'react';
import { X, BookOpen, Link as LinkIcon } from 'lucide-react';
import { Node, NodeType } from '../types';
import { NODE_STYLES } from '../theme';

interface NodeDetailPanelProps {
  selectedNode: Node;
  onClose: () => void;
  onSelectNode: (node: Node) => void;
  getConnections: (node: Node) => { other: Node; relation: string; description?: string | undefined; }[];
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ selectedNode, onClose, onSelectNode, getConnections }) => {
  return (
    <div className="absolute bottom-4 right-4 w-96 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg shadow-2xl animate-in slide-in-from-right max-h-[85vh] overflow-y-auto flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur z-10">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] uppercase tracking-widest text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded">
            {NODE_STYLES[selectedNode.type as NodeType]?.label || 'Node'}
          </span>
          <button onClick={onClose}><X size={16} className="text-slate-500 hover:text-white"/></button>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{selectedNode.title}</h2>
        {selectedNode.year && <div className="text-slate-400 font-mono text-sm">{selectedNode.year}</div>}
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        <div>
          <h3 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Briefing</h3>
          <p className="text-slate-300 text-sm leading-relaxed">
            {selectedNode.summary}
          </p>
        </div>
        
        <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded border border-slate-600 transition-colors text-xs font-bold uppercase tracking-wider">
           <BookOpen size={14} /> Read Full Dossier
        </button>

        {/* Connections */}
        <div className="pt-2">
           <div className="flex items-center gap-2 mb-3">
             <LinkIcon size={12} className="text-slate-500"/>
             <h3 className="text-[10px] uppercase font-bold text-slate-500">Connected Intel</h3>
           </div>
           
           <div className="space-y-3">
             {getConnections(selectedNode).map((c, i) => (
               <div key={i} className="relative pl-4 border-l-2 border-slate-700 hover:border-emerald-500 transition-colors group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => onSelectNode(c.other)}>{c.other.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{c.relation.replace('_', ' ')}</span>
                  </div>
                  {c.description && (
                    <p className="text-[11px] text-slate-400 italic leading-snug">"{c.description}"</p>
                  )}
               </div>
             ))}
             {getConnections(selectedNode).length === 0 && (
               <div className="text-xs text-slate-600 italic">No connections recorded. Hold Shift + Click another node to link.</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
