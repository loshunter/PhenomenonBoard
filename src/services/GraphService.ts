import { Node, Link, NodeType } from '../types';
import { NODE_STYLES, LINK_COLORS } from '../theme';

export interface GraphService {
  load(): Promise<{ nodes: Node[]; links: Link[] }>;
  save(nodes: Node[], links: Link[]): Promise<void>;
  reset(): Promise<void>;
}

export class LocalStorageGraphService implements GraphService {
  private readonly storageKey = 'phenomenon_graph_v2';

  async load(): Promise<{ nodes: Node[]; links: Link[] }> {
    const savedData = localStorage.getItem(this.storageKey);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const restoredNodes: Node[] = parsed.nodes.map((n: any) => ({ ...n, vx: 0, vy: 0 }));
        const restoredLinks: Link[] = parsed.links.map((l: any) => {
          const s = restoredNodes.find(n => n.id === l.sourceId);
          const t = restoredNodes.find(n => n.id === l.targetId);
          if (s && t) {
            return {
              source: s,
              target: t,
              relation: l.relation,
              color: l.color,
              description: l.description
            };
          }
          return null;
        }).filter(Boolean);

        return { nodes: restoredNodes, links: restoredLinks };
      } catch (e) {
        console.error("Failed to parse saved graph data", e);
        return this.generateDefaultGraph();
      }
    }
    return this.generateDefaultGraph();
  }

  async save(nodes: Node[], links: Link[]): Promise<void> {
    const payload = {
      nodes: nodes.map(({ vx, vy, ...rest }) => rest),
      links: links.map(l => ({
        sourceId: l.source.id,
        targetId: l.target.id,
        relation: l.relation,
        color: l.color,
        description: l.description
      }))
    };
    localStorage.setItem(this.storageKey, JSON.stringify(payload));
  }

  async reset(): Promise<void> {
    localStorage.removeItem(this.storageKey);
    window.location.reload();
  }

  private generateDefaultGraph(): { nodes: Node[]; links: Link[] } {
    return this.generateConspiracyGraph();
  }

  private generateConspiracyGraph = (): { nodes: Node[]; links: Link[] } => {
    const nodes: Node[] = [];
    const links: Link[] = [];

    const addNode = (id: string, title: string, type: NodeType, year: number | undefined, summary: string) => {
      const style = NODE_STYLES[type];
      nodes.push({
        id, title, type, year, summary, tags: [],
        x: Math.random() * 800 - 400,
        y: Math.random() * 600 - 300,
        vx: 0, vy: 0,
        radius: style.radius,
        color: style.color
      });
    };

    // 1. HUB NODES
    addNode('h_vallee', 'Jacques Vallée', 'concept_person', undefined, 'French computer scientist, author, and UFO researcher. Proponent of the Interdimensional Hypothesis.');
    addNode('h_bluebook', 'Project Blue Book', 'concept_program', 1952, 'USAF Systematic Study of UAPs, headquartered at Wright-Patterson AFB.');
    addNode('h_hynek', 'J. Allen Hynek', 'concept_person', undefined, 'Astronomer and scientific advisor to Blue Book. Later founded CUFOS.');
    addNode('h_pentagon', 'The Pentagon', 'concept_program', undefined, 'Headquarters of US Dept of Defense.');
    addNode('h_skinwalker', 'Skinwalker Ranch', 'concept_topic', 1996, 'A hotspot of paranormal activity in the Uinta Basin, Utah.');
    addNode('h_keel', 'John Keel', 'concept_person', undefined, 'Journalist and Fortean researcher. Famous for linking UFOs to cryptids and high strangeness.');

    // 2. EVENT NODES
    addNode('e_roswell', 'Roswell Incident', 'event_craft', 1947, 'The foundational crash retrieval case.');
    addNode('e_socorro', 'Socorro Landing', 'event_craft', 1964, 'Lonnie Zamora sighting of an egg-shaped craft and two small beings.');
    addNode('e_flatwoods', 'Flatwoods Monster', 'event_entity', 1952, 'Sighting of a 10ft tall entity with a spade-shaped head after a crash.');
    addNode('e_mothman', 'Mothman Prophecies', 'event_cryptid', 1966, 'A 13-month wave of sightings in Point Pleasant, WV, culminating in the Silver Bridge collapse.');
    addNode('e_tic_tac', 'Nimitz Tic-Tac', 'event_craft', 2004, 'US Navy pilots encounter superior aerial technology off the coast of San Diego.');
    addNode('e_aatip', 'AATIP Program', 'event_gov', 2007, 'Advanced Aerospace Threat Identification Program.');

    // 3. RAW LINKS (With Rich Descriptions)
    const rawLinks = [
      { src: 'h_bluebook', tgt: 'e_roswell', rel: 'investigated', col: 'investigated', desc: 'Blue Book files contain references, though the main investigation was handled by RAAF.' },
      { src: 'h_bluebook', tgt: 'e_socorro', rel: 'investigated', col: 'investigated', desc: 'Hynek considered this one of the most credible cases in Blue Book history.' },
      { src: 'h_bluebook', tgt: 'e_flatwoods', rel: 'investigated', col: 'investigated', desc: ' investigators were dispatched but reportedly found only evidence of a meteor.' },
      { src: 'h_bluebook', tgt: 'h_hynek', rel: 'program_parent', col: 'program_parent', desc: 'Hynek served as the chief scientific consultant.' },

      // Keel & Mothman (The Request)
      { src: 'h_keel', tgt: 'e_mothman', rel: 'investigated', col: 'investigated', desc: 'Keel spent 1966-1967 in Point Pleasant. His experiences formed the basis of his 1975 book "The Mothman Prophecies".' },
      { src: 'h_keel', tgt: 'h_vallee', rel: 'correspondence', col: 'involved', desc: 'Maintained correspondence regarding the "Interdimensional" nature of the phenomenon.' },

      // Vallee
      { src: 'h_vallee', tgt: 'h_hynek', rel: 'colleague', col: 'involved', desc: 'Called the "Invisible College". They pushed for scientific study beyond the nuts-and-bolts hypothesis.' },
      { src: 'h_vallee', tgt: 'e_socorro', rel: 'analyzed', col: 'investigated', desc: 'Vallee analyzed the physical trace evidence and symbols reported by Zamora.' },

      // Modern
      { src: 'h_pentagon', tgt: 'e_aatip', rel: 'funded', col: 'involved', desc: 'Secretly funded via the "Harry Reid" initiative.' },
      { src: 'e_aatip', tgt: 'h_skinwalker', rel: 'studied', col: 'investigated', desc: 'BAASS (Bigelow) was contracted to study the ranch under AAWSAP/AATIP auspices.' },
      { src: 'e_aatip', tgt: 'e_tic_tac', rel: 'studied', col: 'investigated', desc: 'The defining case that led to the 2017 NYT disclosure.' },
    ];

    rawLinks.forEach(l => {
      const s = nodes.find(n => n.id === l.src);
      const t = nodes.find(n => n.id === l.tgt);
      if (s && t) {
        links.push({
          source: s,
          target: t,
          relation: l.rel,
          color: LINK_COLORS[l.col] || '#fff',
          description: l.desc
        });
      }
    });

    return { nodes, links };
  };
}
