export type NodeType = 
  | 'event_craft' 
  | 'event_entity' 
  | 'event_psi' 
  | 'event_occult' 
  | 'event_gov' 
  | 'event_cryptid' 
  | 'concept_person' 
  | 'concept_program' 
  | 'concept_topic';

export interface BaseRecord {
  id: string;
  title: string;
  type: NodeType;
  year?: number; 
  summary: string;
  tags: string[];
  external_url?: string;
}

export interface Node extends BaseRecord {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

export interface Link {
  source: Node;
  target: Node;
  relation: string; 
  description?: string;
  color: string;
}
