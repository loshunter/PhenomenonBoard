import { Node, Link, GraphData, EventRecord, EventType, RelationType } from '../types';
import { NODE_STYLES, LINK_COLORS } from '../theme';

// Maps the new, cleaner EventType from the data to the existing keys in the theme file.
const mapEventTypeToStyleKey = (type: EventType): keyof typeof NODE_STYLES => {
  const mapping: Record<EventType, keyof typeof NODE_STYLES> = {
    craft: 'event_craft',
    entity: 'event_entity',
    psi: 'event_psi',
    occult: 'event_occult',
    government: 'event_gov',
    cryptid: 'event_cryptid',
    // Fallbacks for types not explicitly in the theme
    indigenous: 'event_craft',
    ultraterrestrial: 'concept_topic',
    mixed: 'concept_topic',
  };
  return mapping[type] || 'concept_topic';
};

const mapRelationToColor = (relation: RelationType): string => {
  const mapping: Partial<Record<RelationType, string>> = {
    investigator_overlap: LINK_COLORS.investigated,
    same_program: LINK_COLORS.program_parent,
  };
  return mapping[relation] || LINK_COLORS.default;
}

export interface GraphService {
  load(): Promise<GraphData>;
  save(nodes: Node[], links: Link[]): Promise<void>;
  reset(): Promise<void>;
}

export class StaticGraphService implements GraphService {
  private readonly dataUrl = '/data.json';

  async load(): Promise<GraphData> {
    try {
      const response = await fetch(this.dataUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch data: ${response.statusText}`);
      }
      const data: { events: EventRecord[] } = await response.json();

      const nodes: Node[] = data.events.map((event) => {
        const styleKey = mapEventTypeToStyleKey(event.event_type);
        const style = NODE_STYLES[styleKey] || NODE_STYLES.concept_topic;
        
        return {
          ...event,
          // Initialize simulation properties
          x: Math.random() * 800 - 400,
          y: Math.random() * 600 - 300,
          vx: 0,
          vy: 0,
          // Assign rendering properties from theme
          radius: style.radius,
          color: style.color,
        };
      });

      const links: Link[] = data.events.flatMap(event => 
        event.connections.map(conn => ({
          source: event.id,
          target: conn.related_event_id,
          relation: conn.relation_type,
          color: mapRelationToColor(conn.relation_type),
        }))
      );

      // Filter out links that point to a node not present in the dataset
      const nodeIds = new Set(nodes.map(n => n.id));
      const validLinks = links.filter(l => nodeIds.has(l.target));

      return { nodes, links: validLinks };

    } catch (e) {
      console.error("Failed to load or parse graph data", e);
      // Return an empty graph on failure
      return { nodes: [], links: [] };
    }
  }

  async save(nodes: Node[], links: Link[]): Promise<void> {
    console.log('Saving is not implemented for StaticGraphService.');
    return Promise.resolve();
  }

  async reset(): Promise<void> {
    console.log('Reset is not implemented for StaticGraphService.');
    window.location.reload(); // Reload to get fresh data
  }
}
