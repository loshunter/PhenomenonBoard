import React from 'react';
import { 
  X, BookOpen, Link as LinkIcon, MapPin, Users, GitBranch, 
  HelpCircle, ChevronsRight, Tag, PersonStanding, FileText, BrainCircuit, Workflow
} from 'lucide-react';
import { Node, EventNode, PersonNode, SourceNode, ClaimNode, RelationType } from '../types';

interface NodeDetailPanelProps {
  selectedNode: Node;
  onClose: () => void;
  onSelectNode: (node: Node | null) => void;
  getConnections: (node: Node) => { other: Node | undefined; relation: RelationType }[];
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

const ConnectionList: React.FC<{ node: Node; getConnections: NodeDetailPanelProps['getConnections']; onSelectNode: NodeDetailPanelProps['onSelectNode'] }> = ({ node, getConnections, onSelectNode }) => {
  const connections = getConnections(node);
  return (
    <div className="pt-2">
       <h3 className="text-xs uppercase font-bold text-slate-500 mb-3 flex items-center gap-2"><LinkIcon size={14}/> Connected Intel</h3>
       <div className="space-y-3">
         {connections.map((c, i) => c.other && (
           <div key={i} className="relative pl-3 border-l-2 border-slate-700 hover:border-emerald-500 transition-colors group">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => onSelectNode(c.other!)}>{c.other.title}</span>
                <span className="text-[10px] text-slate-500 uppercase">{c.relation.replace(/_/g, ' ')}</span>
              </div>
           </div>
         ))}
         {connections.length === 0 && (
           <div className="text-xs text-slate-600 italic">No direct connections recorded.</div>
         )}
       </div>
    </div>
  );
};


const EventDetail: React.FC<{ node: EventNode }> = ({ node }) => {
  const details = node.details;
  const formatDate = (date: string | null) => date ? new Date(date).toLocaleDateString() : 'N/A';

  return (
    <>
      <div className="text-slate-400 font-mono text-xs mt-1">
        {formatDate(details.start_date)}
        {details.end_date && details.start_date !== details.end_date ? ` - ${formatDate(details.end_date)}` : ''}
        <span className="text-slate-500"> | {details.epoch.replace(/_/g, ' ')}</span>
      </div>
      <div className="p-4 space-y-5 overflow-y-auto">
        <p className="text-slate-300 text-sm leading-relaxed">{details.summary}</p>
        <div className="grid grid-cols-1 gap-4">
          <DetailRow icon={<MapPin size={14}/>} label="Location" value={`${details.location.site}, ${details.location.region}, ${details.location.country}`} />
          <DetailRow icon={<GitBranch size={14}/>} label="Threads" value={details.threads.map(t => <TagPill key={t} text={t} />)} />
          <DetailRow icon={<ChevronsRight size={14}/>} label="Key Phenomena" value={details.key_phenomena.map(p => <TagPill key={p} text={p} />)} />
          <DetailRow icon={<Tag size={14}/>} label="Tags" value={details.tags.map(t => <TagPill key={t} text={t} />)} />
        </div>
        {details.key_figures.length > 0 && (
          <div>
            <h3 className="text-xs uppercase font-bold text-slate-500 mb-2 flex items-center gap-2"><Users size={14}/> Key Figures</h3>
            <div className="space-y-2">
              {details.key_figures.map(fig => (
                <div key={fig.name} className="p-2 bg-slate-800/50 rounded-md text-xs">
                  <p className="font-bold text-slate-200">{fig.name} <span className="font-normal text-slate-400">({fig.role})</span></p>
                  <p className="text-slate-400 text-[11px]">{fig.notes}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

const PersonDetail: React.FC<{ node: PersonNode }> = ({ node }) => (
  <div className="p-4 space-y-4">
    <DetailRow icon={<PersonStanding size={14}/>} label="Role" value={node.role} />
  </div>
);

const ClaimDetail: React.FC<{ node: ClaimNode }> = ({ node }) => (
  <div className="p-4 space-y-4">
    <DetailRow icon={<FileText size={14}/>} label="Claim Type" value={node.claim_type.replace(/_/g, ' ')} />
    <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/50 p-3 rounded-md">{node.text}</p>
  </div>
);

const SourceDetail: React.FC<{ node: SourceNode }> = ({ node }) => (
    <div className="p-4 space-y-4">
      <DetailRow icon={<BookOpen size={14}/>} label="Source Type" value={node.source_type} />
    </div>
);

const GenericDetail: React.FC<{ node: Node }> = ({ node }) => {
    let icon = <HelpCircle size={14} />;
    if(node.type === 'thread') icon = <Workflow size={14} />;
    if(node.type === 'phenomenon') icon = <BrainCircuit size={14} />;
    if(node.type === 'tag') icon = <Tag size={14} />;
  
    return (
      <div className="p-4 space-y-4">
        <DetailRow icon={icon} label="Type" value={node.type.replace(/_/g, ' ')} />
      </div>
    );
};


export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({ selectedNode, onClose, onSelectNode, getConnections }) => {

  const renderDetails = () => {
    if(selectedNode.type.startsWith('event_')) {
      return <EventDetail node={selectedNode as EventNode} />;
    }
    switch (selectedNode.type) {
      case 'person':
        return <PersonDetail node={selectedNode as PersonNode} />;
      case 'claim':
        return <ClaimDetail node={selectedNode as ClaimNode} />;
      case 'source':
        return <SourceDetail node={selectedNode as SourceNode} />;
      case 'tag':
      case 'thread':
      case 'phenomenon':
        return <GenericDetail node={selectedNode} />;
      default:
        return <div className="p-4 text-slate-400">No details available for this node type.</div>;
    }
  };

  return (
    <div className="absolute bottom-4 right-4 w-[28rem] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 rounded-lg shadow-2xl animate-in slide-in-from-right max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900/50 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] uppercase tracking-widest text-emerald-400 font-bold">
            {selectedNode.type.replace(/_/g, ' ')}
          </span>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors"><X size={18} /></button>
        </div>
        <h2 className="text-2xl font-bold text-white leading-tight">{selectedNode.title}</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {renderDetails()}
        
        {/* Connections are always shown */}
        <div className="p-4 border-t border-slate-800">
          <ConnectionList node={selectedNode} getConnections={getConnections} onSelectNode={onSelectNode} />
        </div>
      </div>
    </div>
  );
};