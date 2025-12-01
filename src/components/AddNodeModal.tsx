import React from 'react';
import { Database, X } from 'lucide-react';
import { Node, ConceptNode } from '../types';
import { NODE_STYLES } from '../theme';

interface AddNodeModalProps {
  onClose: () => void;
  onAddNode: (node: Node) => void;
  getScreenCenter: () => { x: number, y: number };
}

export const AddNodeModal: React.FC<AddNodeModalProps> = ({ onClose, onAddNode, getScreenCenter }) => {

  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const type = 'concept_topic';
    const style = NODE_STYLES[type];
    const screenCenter = getScreenCenter();
    
    const newNode: ConceptNode = {
      id: `custom_${Date.now()}`,
      title: formData.get('title') as string,
      type: type,
      summary: formData.get('summary') as string,
      x: screenCenter.x,
      y: screenCenter.y,
      vx: 0, vy: 0,
      radius: style.radius,
      color: style.color
    };
    onAddNode(newNode);
    onClose();
  };

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Database size={14} /> Create Custom Node</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><X size={18} /></button>
        </div>
        <form onSubmit={handleCreateNode} className="p-6 space-y-4">
          <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Title</label><input name="title" required autoFocus className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm" placeholder="e.g. The Wilson Memo" /></div>
          <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Summary</label><textarea name="summary" rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm" placeholder="Brief description..."></textarea></div>
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded shadow-lg transition-transform active:scale-95 text-xs tracking-widest">ADD TO GRAPH</button>
        </form>
      </div>
    </div>
  );
};
