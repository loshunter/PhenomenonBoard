

export const NODE_STYLES: Record<string, { color: string; radius: number; label: string }> = {
  // Event Types
  event_craft:    { color: '#3b82f6', radius: 12, label: 'Craft' },
  event_entity:   { color: '#a855f7', radius: 12, label: 'Entity' },
  event_psi:      { color: '#ec4899', radius: 12, label: 'Psi' },
  event_occult:   { color: '#ef4444', radius: 12, label: 'Occult' },
  event_gov:      { color: '#eab308', radius: 12, label: 'Government' },
  event_cryptid:  { color: '#22c55e', radius: 12, label: 'Cryptid' },
  
  // Entity Types
  person:         { color: '#f97316', radius: 6, label: 'Person' },
  source:         { color: '#64748b', radius: 4, label: 'Source' },
  claim:          { color: '#f43f5e', radius: 5, label: 'Claim' },
  phenomenon:     { color: '#84cc16', radius: 5, label: 'Phenomenon' },
  tag:            { color: '#06b6d4', radius: 3, label: 'Tag' },
  thread:         { color: '#d946ef', radius: 7, label: 'Thread' },

  // Fallback/Generic
  concept_topic:  { color: '#14b8a6', radius: 20, label: 'Topic' },
};

export const LINK_COLORS: Record<string, string> = {
  default: '#475569',
  investigated: '#ef4444',
  involved: '#f59e0b',
  program_parent: '#94a3b8',
  authored: '#8b5cf6',
  references: '#64748b',
  relates_to: '#14b8a6',
  alleges: '#f43f5e',
};