import { 
  Node, Link, GraphData, EventRecord, EventType, RelationType,
  EventNode, PersonNode, SourceNode, ClaimNode, PhenomenonNode, TagNode, ThreadNode, NodeType
} from '../types';
import { NODE_STYLES, LINK_COLORS } from '../theme';

const mapEventTypeToStyleKey = (type: EventType): NodeType => {
  const mapping: Record<EventType, NodeType> = {
    craft: 'event_craft',
    entity: 'event_entity',
    psi: 'event_psi',
    occult: 'event_occult',
    government: 'event_gov',
    cryptid: 'event_cryptid',
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
    references: LINK_COLORS.references,
    alleges: LINK_COLORS.alleges,
    relates_to: LINK_COLORS.relates_to,
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

      const nodes: Node[] = [];
      const links: Link[] = [];
      const nodeIndex = new Map<string, Node>();

      const getOrCreateNode = <T extends Node>(id: string, type: NodeType, title: string, details: Partial<T> = {}): T => {
        if (nodeIndex.has(id)) {
          return nodeIndex.get(id) as T;
        }
        const style = NODE_STYLES[type] || NODE_STYLES.concept_topic;
        const newNode = {
          id,
          type,
          title,
          radius: style.radius,
          color: style.color,
          x: Math.random() * 800 - 400,
          y: Math.random() * 600 - 300,
          vx: 0,
          vy: 0,
          ...details,
        } as T;
        nodeIndex.set(id, newNode);
        nodes.push(newNode);
        return newNode;
      };

      data.events.forEach((event) => {
        // Create the main Event Node
        const eventNodeType = mapEventTypeToStyleKey(event.event_type);
        getOrCreateNode<EventNode>(event.id, eventNodeType, event.title, { details: event });

        // Create Person Nodes
        if (event.key_figures) {
          event.key_figures.forEach(figure => {
            if (figure && figure.name) {
              const figureId = `person_${figure.name.replace(/\s+/g, '_')}`;
              getOrCreateNode<PersonNode>(figureId, 'person', figure.name, { role: figure.role });
              links.push({ source: event.id, target: figureId, relation: 'relates_to', color: mapRelationToColor('relates_to') });
            }
          });
        }

        // Create Thread Nodes
        if (event.threads) {
          event.threads.forEach(thread => {
            if (thread) {
              getOrCreateNode<ThreadNode>(thread, 'thread', thread.replace(/_/g, ' '));
              links.push({ source: event.id, target: thread, relation: 'relates_to', color: mapRelationToColor('relates_to') });
            }
          });
        }

        // Create Phenomenon Nodes
        if (event.key_phenomena) {
          event.key_phenomena.forEach(phenomenon => {
            if (phenomenon) {
              getOrCreateNode<PhenomenonNode>(phenomenon, 'phenomenon', phenomenon.replace(/_/g, ' '));
              links.push({ source: event.id, target: phenomenon, relation: 'relates_to', color: mapRelationToColor('relates_to') });
            }
          });
        }

        // Create Tag Nodes
        if (event.tags) {
          event.tags.forEach(tag => {
            if (tag) {
              getOrCreateNode<TagNode>(tag, 'tag', tag);
              links.push({ source: event.id, target: tag, relation: 'relates_to', color: mapRelationToColor('relates_to') });
            }
          });
        }
        
        // Create Source Nodes
        [...(event.primary_sources || []), ...(event.secondary_sources || [])].forEach(source => {
          if (source && source.title) {
            const sourceId = `source_${source.title.replace(/\s+/g, '_').substring(0, 50)}`;
            getOrCreateNode<SourceNode>(sourceId, 'source', source.title, { source_type: source.type });
            links.push({ source: event.id, target: sourceId, relation: 'references', color: mapRelationToColor('references') });
          }
        });

        // Create Claim Nodes
        if (event.claims) {
          event.claims.forEach((claim, i) => {
            if (claim && claim.text) {
              const claimId = `${event.id}_claim_${i}`;
              getOrCreateNode<ClaimNode>(claimId, 'claim', claim.text.substring(0, 50) + '...', { 
                claim_type: claim.claim_type, 
                text: claim.text 
              });
              links.push({ source: event.id, target: claimId, relation: 'alleges', color: mapRelationToColor('alleges') });
            }
          });
        }
      });

      // Original event-to-event connections
      data.events.forEach(event => {
        event.connections.forEach(conn => {
          if (nodeIndex.has(event.id) && nodeIndex.has(conn.related_event_id)) {
            links.push({
              source: event.id,
              target: conn.related_event_id,
              relation: conn.relation_type,
              color: mapRelationToColor(conn.relation_type),
            });
          }
        });
      });

      return { nodes, links };

    } catch (e) {
      console.error("Failed to load or parse graph data", e);
      return { nodes: [], links: [] };
    }
  }

  async save(_nodes: Node[], _links: Link[]): Promise<void> {
    console.log('Saving is not implemented for StaticGraphService.');
    return Promise.resolve();
  }

  async reset(): Promise<void> {
    console.log('Reset is not implemented for StaticGraphService.');
    window.location.reload();
  }
}