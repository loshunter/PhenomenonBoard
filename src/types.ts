// src/types.ts

// --- Core Data Shape (from research agent) ---

export type EventType = 'craft' | 'entity' | 'psi' | 'occult' | 'indigenous' | 'cryptid' | 'government' | 'ultraterrestrial' | 'mixed';

export type Thread = 
  | 'craft_phenomena'
  | 'entity_contact'
  | 'psi_consciousness'
  | 'occult_esoteric'
  | 'indigenous_cosmology'
  | 'cryptid_bio_strangeness'
  | 'government_program'
  | 'ultraterrestrial_model';

export type DatePrecision = 'year' | 'month' | 'day' | 'range' | 'approximate';

export type KeyPhenomenon = 
  | 'sighting' | 'abduction' | 'poltergeist' | 'cryptid_sighting' 
  | 'crash_retrieval' | 'ritual_working' | 'remote_viewing_trial' 
  | 'psi_experiment' | 'government_investigation' | 'contactee_claim' 
  | 'ultraterrestrial_theory';

export type FigureRole = 
  | 'witness' | 'investigator' | 'military' | 'occultist' | 'host' 
  | 'abductee' | 'contactee' | 'scientist' | 'official';

export type SourceType = 'book' | 'archive' | 'podcast' | 'radio' | 'tv' | 'yt' | 'paper' | 'website' | 'article' | 'blog' | 'summary_book' | 'forum';

export type ClaimType = 'what_witnesses_say' | 'what_investigators_conclude' | 'what_officials_say' | 'legendary_or_mythic_layer';

export type RelationType = 'same_location' | 'same_witness' | 'same_program' | 'similar_pattern' | 'investigator_overlap' | 'mythic_parallel';

export type Epoch = 'ancient' | 'pre_modern' | '1800s' | 'early_1900s' | 'ww2' | 'early_cold_war' | 'late_cold_war' | 'post_1990' | 'post_2000' | 'post_2017';

export interface EventRecord {
  id: string;
  title: string;
  event_type: EventType;
  threads: Thread[];
  start_date: string | null;
  end_date: string | null;
  date_precision: DatePrecision;
  location: {
    planet: 'Earth';
    country: string | null;
    region: string | null;
    site: string | null;
    coordinates: {
      lat: number | null;
      lon: number | null;
    };
  };
  summary: string;
  key_phenomena: KeyPhenomenon[];
  key_figures: {
    name: string;
    role: FigureRole;
    notes: string;
  }[];
  primary_sources: Source[];
  secondary_sources: Source[];
  claims: {
    claim_type: ClaimType;
    text: string;
    source_ref: string;
  }[];
  official_explanations: {
    agency_or_person: string;
    explanation: string;
    source_ref: string;
  }[];
  controversies: string[];
  connections: {
    related_event_id: string;
    relation_type: RelationType;
    notes: string;
  }[];
  epoch: Epoch;
  confidence: {
    source_quality: number;
    date_certainty: number;
    location_certainty: number;
    basic_fact_consensus: number;
  };
  tags: string[];
  notes_for_writer?: string;
}

export interface Source {
  type: SourceType;
  author_or_creator: string;
  title: string;
  year: number | null;
  link_or_reference: string;
  notes: string;
}

// --- Simulation & Rendering Shapes ---

export interface Node extends EventRecord {
  // Simulation properties
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  
  // Rendering properties
  radius: number;
  color: string;
}

export interface Link {
  source: string; // ID of the source node
  target: string; // ID of the target node
  relation: RelationType;
  color: string;
}

// --- API/Data Loading Shapes ---
export interface GraphData {
  nodes: Node[];
  links: Link[];
}
