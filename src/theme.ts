import { NodeType } from './types';

export const NODE_STYLES: Record<NodeType, { color: string; radius: number; label: string }> = {
  event_craft:    { color: '#3b82f6', radius: 8, label: 'Craft' },
  event_entity:   { color: '#a855f7', radius: 8, label: 'Entity' },
  event_psi:      { color: '#ec4899', radius: 8, label: 'Psi' },
  event_occult:   { color: '#ef4444', radius: 8, label: 'Occult' },
  event_gov:      { color: '#eab308', radius: 8, label: 'Government' },
  event_cryptid:  { color: '#22c55e', radius: 8, label: 'Cryptid' },
  
  concept_person: { color: '#f97316', radius: 25, label: 'Person' },
  concept_program:{ color: '#64748b', radius: 30, label: 'Program' },
  concept_topic:  { color: '#14b8a6', radius: 20, label: 'Topic' },
};

export const LINK_COLORS: Record<string, string> = {
  default: '#475569',
  investigated: '#ef4444',
  involved: '#f59e0b',
  program_parent: '#94a3b8',
  authored: '#8b5cf6'
};
