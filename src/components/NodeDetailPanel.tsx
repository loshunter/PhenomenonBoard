import React from 'react';
import { 
  X, BookOpen, Link as LinkIcon, Calendar, MapPin, Users, GitBranch, 
  HelpCircle, Shield, Gauge, ChevronsRight, Tag 
} from 'lucide-react';
import { Node } from '../types';

interface NodeDetailPanelProps {
  selectedNode: Node;
  onClose: () => void;
  onSelectNode: (node: Node | null) => void;
  getConnections: (node: Node) => { other: Node | undefined; relation: string; description?: string; }[];
}

const DetailRow: React.FC<{ label: string; value: React.ReactNode; icon: React.ReactNode }> = ({ label, value, icon }) => (
  <div className="flex items-start gap-3">
    <div className="text-slate-500 mt-0.5">{icon}</div>
    <div className="flex-1">
      <h4 className="text-[10px] font-bold text-slate-500 uppercase">{label}</h4>
      <div className="text-sm text-slate-300">{value}</div>
    </div>
  </div>
);

const TagPill: React.FC<{ text: string }> = ({ text }) => (
  <span className="inline-block bg-slate-700/50 text-slate-300 text-[10px] font-medium mr-2 mb-1 px-2 py-0.5 rounded">
    {text.replace(/_/g, ' ')}
  </span>
);

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ selectedNode, onClose, onSelectNode, getConnections }) => {
  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString() : 'N/A';

  return (
    <div className="absolute bottom-4 right-4 w-[28rem] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl animate-in slide-in-from-right max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
            {selectedNode.event_type.replace('_', ' ')}
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <h2 className="text-2xl font-bold text-white leading-tight">{selectedNode.title}</h2>
        <div className="text-slate-400 font-mono text-xs mt-1">
          {formatDate(selectedNode.start_date)}
          {selectedNode.end_date && selectedNode.start_date !== selectedNode.end_date ? ` - ${formatDate(selectedNode.end_date)}` : ''}
          <span className="text-slate-500"> | {selectedNode.epoch.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-5 overflow-y-auto">
        
        {/* Summary */}
        <div>
          <p className="text-slate-300 text-sm leading-relaxed">{selectedNode.summary}</p>
        </div>

        {/* Key Details */}
        <div className="grid grid-cols-1 gap-4">
          <DetailRow 
            icon={<MapPin size={14}/>}
            label="Location"
            value={`${selectedNode.location.site}, ${selectedNode.location.region}, ${selectedNode.location.country}`}
          />
          <DetailRow 
            icon={<GitBranch size={14}/>}
            label="Threads"
            value={selectedNode.threads.map(t => <TagPill key={t} text={t} />)}
          />
          <DetailRow 
            icon={<ChevronsRight size={14}/>}
            label="Key Phenomena"
            value={selectedNode.key_phenomena.map(p => <TagPill key={p} text={p} />)}
          />
          <DetailRow 
            icon={<Tag size={14}/>}
            label="Tags"
            value={selectedNode.tags.map(t => <TagPill key={t} text={t} />)}
          />
        </div>
        
        {/* Key Figures */}
        {selectedNode.key_figures.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-2"><Users size={14}/> Key Figures</h3>
            <div className="space-y-2">
              {selectedNode.key_figures.map(fig => (
                <div key={fig.name} className="p-2 bg-slate-800/50 rounded-md text-xs">
                  <p className="font-bold text-slate-200">{fig.name} <span className="font-normal text-slate-400">({fig.role})</span></p>
                  <p className="text-slate-400 text-[11px]">{fig.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {selectedNode.primary_sources.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-2"><BookOpen size={14}/> Primary Sources</h3>
            <div className="space-y-1 text-xs">
              {selectedNode.primary_sources.map((s, i) => (
                <div key={i} className="text-slate-400 truncate" title={`${s.title} (${s.author_or_creator})`}>- {s.title} <span className="text-slate-500">({s.type})</span></div>
              ))}
            </div>
          </div>
        )}

        {/* Controversies */}
        {selectedNode.controversies.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-2"><HelpCircle size={14}/> Controversies</h3>
            <ul className="space-y-1 text-xs list-disc pl-4 text-slate-400">
              {selectedNode.controversies.map((c, i) => <li key={i}>{c}</li>)}
            </ul>
          </div>
        )}

        {/* Connections */}
        <div className="pt-2">
           <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-2"><LinkIcon size={14}/> Connected Intel</h3>
           <div className="space-y-3">
             {getConnections(selectedNode).map((c, i) => c.other && (
               <div key={i} className="relative pl-3 border-l-2 border-slate-700 hover:border-emerald-500 transition-colors group">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => onSelectNode(c.other!)}>{c.other.title}</span>
                    <span className="text-[10px] text-slate-500 uppercase">{c.relation.replace(/_/g, ' ')}</span>
                  </div>
               </div>
             ))}
             {getConnections(selectedNode).length === 0 && (
               <div className="text-xs text-slate-600 italic">No direct connections recorded.</div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
};
