import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Search, 
  Database, 
  X, 
  Activity,
  Plus,
  Link as LinkIcon,
  Trash2,
  BookOpen,
  ExternalLink,
  Info
} from 'lucide-react';

/**
 * ------------------------------------------------------------------
 * TYPES
 * ------------------------------------------------------------------
 */

type NodeType = 
  | 'event_craft' 
  | 'event_entity' 
  | 'event_psi' 
  | 'event_occult' 
  | 'event_gov' 
  | 'event_cryptid' 
  | 'concept_person' 
  | 'concept_program' 
  | 'concept_topic';

interface BaseRecord {
  id: string;
  title: string;
  type: NodeType;
  year?: number; 
  summary: string;
  tags: string[];
  external_url?: string;
}

interface Node extends BaseRecord {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
}

interface Link {
  source: Node;
  target: Node;
  relation: string; 
  description?: string; // New field for rich context (e.g. "Wrote the book on this")
  color: string;
}

// ------------------------------------------------------------------
// CONFIG & PALETTE
// ------------------------------------------------------------------

const NODE_STYLES: Record<NodeType, { color: string; radius: number; label: string }> = {
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

const LINK_COLORS: Record<string, string> = {
  default: '#475569',
  investigated: '#ef4444',
  involved: '#f59e0b',
  program_parent: '#94a3b8',
  authored: '#8b5cf6'
};

/**
 * ------------------------------------------------------------------
 * DATA GENERATOR (The "Conspiracy" Builder)
 * ------------------------------------------------------------------
 */
const generateConspiracyGraph = (): { nodes: Node[]; links: Link[] } => {
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

/**
 * ------------------------------------------------------------------
 * HELPER: MATH
 * ------------------------------------------------------------------
 */
function getDistanceFromLineSegment(x: number, y: number, x1: number, y1: number, x2: number, y2: number) {
  const A = x - x1;
  const B = y - y1;
  const C = x2 - x1;
  const D = y2 - y1;
  const dot = A * C + B * D;
  const len_sq = C * C + D * D;
  let param = -1;
  if (len_sq !== 0) param = dot / len_sq;

  let xx, yy;
  if (param < 0) { xx = x1; yy = y1; }
  else if (param > 1) { xx = x2; yy = y2; }
  else { xx = x1 + param * C; yy = y1 + param * D; }

  const dx = x - xx;
  const dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * ------------------------------------------------------------------
 * MAIN COMPONENT
 * ------------------------------------------------------------------
 */
export default function PhenomenonBoard() {
  // State
  const nodesRef = useRef<Node[]>([]);
  const linksRef = useRef<Link[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>();
  const transformRef = useRef({ k: 1, x: 0, y: 0 });

  // UI State
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [mode, setMode] = useState<'RESEARCH' | 'SHOW'>('RESEARCH');
  const [isAddingNode, setIsAddingNode] = useState(false);
  const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, content: any, type: 'node' | 'link' } | null>(null);
  
  // Interaction
  const [dragNode, setDragNode] = useState<Node | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Init
  useEffect(() => {
    transformRef.current.x = window.innerWidth / 2;
    transformRef.current.y = window.innerHeight / 2;

    const savedData = localStorage.getItem('phenomenon_graph_v2');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        const restoredNodes: Node[] = parsed.nodes.map((n: any) => ({ ...n, vx: 0, vy: 0 }));
        const restoredLinks: Link[] = parsed.links.map((l: any) => {
          const s = restoredNodes.find(n => n.id === l.sourceId);
          const t = restoredNodes.find(n => n.id === l.targetId);
          if (s && t) return { 
            source: s, 
            target: t, 
            relation: l.relation, 
            color: l.color,
            description: l.description 
          };
          return null;
        }).filter(Boolean);

        nodesRef.current = restoredNodes;
        linksRef.current = restoredLinks;
      } catch (e) {
        const data = generateConspiracyGraph();
        nodesRef.current = data.nodes;
        linksRef.current = data.links;
      }
    } else {
      const data = generateConspiracyGraph();
      nodesRef.current = data.nodes;
      linksRef.current = data.links;
    }
  }, []);

  const saveGraph = useCallback(() => {
    const payload = {
      nodes: nodesRef.current.map(({ vx, vy, ...rest }) => rest),
      links: linksRef.current.map(l => ({
        sourceId: l.source.id,
        targetId: l.target.id,
        relation: l.relation,
        color: l.color,
        description: l.description
      }))
    };
    localStorage.setItem('phenomenon_graph_v2', JSON.stringify(payload));
  }, []);

  const resetGraph = () => {
    localStorage.removeItem('phenomenon_graph_v2');
    window.location.reload();
  };

  /**
   * PHYSICS ENGINE
   */
  const tickSimulation = useCallback(() => {
    const nodes = nodesRef.current;
    const links = linksRef.current;
    const k_spring = 0.08;
    const repulsion = 1500;
    
    // Repulsion
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const n1 = nodes[i];
        const n2 = nodes[j];
        const dx = n1.x - n2.x;
        const dy = n1.y - n2.y;
        const distSq = dx*dx + dy*dy || 1;
        const dist = Math.sqrt(distSq);
        const factor = (n1.type.startsWith('concept') || n2.type.startsWith('concept')) ? 2 : 1;

        if (dist < 400) {
          const force = (repulsion * factor) / distSq;
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          n1.vx += fx; n1.vy += fy;
          n2.vx -= fx; n2.vy -= fy;
        }
      }
    }

    // Springs
    links.forEach(link => {
      const dx = link.target.x - link.source.x;
      const dy = link.target.y - link.source.y;
      const dist = Math.sqrt(dx*dx + dy*dy) || 1;
      const targetLen = 140; // Slightly longer to allow text breathing room
      const force = (dist - targetLen) * k_spring;
      const fx = (dx / dist) * force;
      const fy = (dy / dist) * force;
      link.source.vx += fx; link.source.vy += fy;
      link.target.vx -= fx; link.target.vy -= fy;
    });

    // Integration
    nodes.forEach(node => {
      if (node === dragNode) return;
      node.vx -= node.x * 0.002;
      node.vy -= node.y * 0.002;
      node.x += node.vx;
      node.y += node.vy;
      node.vx *= 0.85; 
      node.vy *= 0.85;
    });

  }, [dragNode]);

  /**
   * DRAW LOOP
   */
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(transformRef.current.x, transformRef.current.y);
    ctx.scale(transformRef.current.k, transformRef.current.k);

    const selectedId = selectedNode?.id;
    const neighborIds = new Set<string>();
    if (selectedId) {
      linksRef.current.forEach(l => {
        if (l.source.id === selectedId) neighborIds.add(l.target.id);
        if (l.target.id === selectedId) neighborIds.add(l.source.id);
      });
    }

    // Grid
    if (mode === 'RESEARCH') {
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1 / transformRef.current.k;
      ctx.beginPath();
      for(let i=-20; i<=20; i++) {
        ctx.moveTo(i*100, -2000); ctx.lineTo(i*100, 2000);
        ctx.moveTo(-2000, i*100); ctx.lineTo(2000, i*100);
      }
      ctx.stroke();
    }

    // Links
    // We also check for hover-link highlighting
    const activeLink = hoverInfo?.type === 'link' ? hoverInfo.content : null;

    linksRef.current.forEach(link => {
      let alpha = 1;
      let width = link.relation === 'investigated' ? 2 : 1;
      
      if (selectedId) {
        const isDirect = (link.source.id === selectedId || link.target.id === selectedId);
        alpha = isDirect ? 1 : 0.1;
      }
      
      // Highlight hovered link
      if (activeLink && activeLink.source.id === link.source.id && activeLink.target.id === link.target.id) {
        alpha = 1;
        width = 4;
        ctx.shadowColor = link.color;
        ctx.shadowBlur = 10;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.moveTo(link.source.x, link.source.y);
      ctx.lineTo(link.target.x, link.target.y);
      ctx.strokeStyle = link.color;
      ctx.lineWidth = width; 
      ctx.globalAlpha = alpha;
      ctx.stroke();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // Nodes
    nodesRef.current.forEach(node => {
      let alpha = 1;
      if (selectedId) {
        const isSelf = node.id === selectedId;
        const isNeighbor = neighborIds.has(node.id);
        alpha = (isSelf || isNeighbor) ? 1 : 0.2;
      }
      ctx.globalAlpha = alpha;

      if (mode === 'SHOW' || node.type.startsWith('concept')) {
        ctx.shadowBlur = 15;
        ctx.shadowColor = node.color;
      } else {
        ctx.shadowBlur = 0;
      }

      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      
      if (node.type.startsWith('concept')) {
        ctx.fillStyle = node.color;
        ctx.fill();
      } else {
        ctx.fillStyle = '#0f172a';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = node.color;
        ctx.stroke();
      }

      // Rings
      if (selectedNode?.id === node.id) {
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 3; ctx.stroke();
      }
      
      // Hover Ring (Yellowish)
      if (hoverInfo?.type === 'node' && hoverInfo.content.id === node.id) {
        ctx.strokeStyle = 'rgba(255,255,200,0.8)'; ctx.lineWidth = 2; ctx.stroke();
      }

      // Labels
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#cbd5e1';
      ctx.font = node.type.startsWith('concept') 
        ? `bold ${14/transformRef.current.k}px sans-serif`
        : `400 ${10/transformRef.current.k}px monospace`;
      ctx.textAlign = 'center';
      const yOffset = node.radius + (15 / transformRef.current.k);
      ctx.fillText(node.title, node.x, node.y + yOffset);
    });

    ctx.globalAlpha = 1;
    ctx.restore();
  }, [mode, selectedNode, hoverInfo]);

  useEffect(() => {
    const animate = () => {
      tickSimulation();
      draw();
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [tickSimulation, draw]);

  // Resize
  useEffect(() => {
    const r = () => { if(canvasRef.current) { canvasRef.current.width = window.innerWidth; canvasRef.current.height = window.innerHeight; }};
    window.addEventListener('resize', r); r();
    return () => window.removeEventListener('resize', r);
  }, []);

  // Zoom
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoom = 0.001;
      const { k, x, y } = transformRef.current;
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const wx = (mx - x) / k;
      const wy = (my - y) / k;
      const nk = Math.min(Math.max(0.2, k - e.deltaY * zoom), 5);
      transformRef.current = { k: nk, x: mx - wx * nk, y: my - wy * nk };
    };
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    return () => canvas.removeEventListener('wheel', handleWheel);
  }, []);

  /**
   * INTERACTION HANDLERS
   */
  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;

    const hit = nodesRef.current.slice().reverse().find(n => {
      const dist = Math.sqrt((mx - n.x)**2 + (my - n.y)**2);
      return dist < n.radius + 5;
    });

    if (hit) {
      if (e.shiftKey && selectedNode && selectedNode.id !== hit.id) {
        // Simple create link (default)
        const exists = linksRef.current.find(l => 
          (l.source.id === selectedNode.id && l.target.id === hit.id) || 
          (l.source.id === hit.id && l.target.id === selectedNode.id)
        );
        if (!exists) {
           linksRef.current.push({ source: selectedNode, target: hit, relation: 'user_connected', color: LINK_COLORS.default, description: 'User created connection.' });
           saveGraph();
        }
      } else {
        setDragNode(hit);
        setSelectedNode(hit);
      }
    } else {
      setIsDragging(true);
      if (!e.shiftKey && mode === 'RESEARCH') setSelectedNode(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    // Raw mouse for UI overlay
    const rawX = e.clientX;
    const rawY = e.clientY;
    
    // World coordinates for logic
    const mx = (e.clientX - rect.left - transformRef.current.x) / transformRef.current.k;
    const my = (e.clientY - rect.top - transformRef.current.y) / transformRef.current.k;

    // 1. Check Node Hover
    const hitNode = nodesRef.current.slice().reverse().find(n => {
      const dist = Math.sqrt((mx - n.x)**2 + (my - n.y)**2);
      return dist < n.radius + 5;
    });

    if (hitNode) {
      setHoverInfo({ x: rawX, y: rawY, content: hitNode, type: 'node' });
    } else {
      // 2. Check Link Hover (if no node)
      const hitLink = linksRef.current.find(l => {
        const dist = getDistanceFromLineSegment(mx, my, l.source.x, l.source.y, l.target.x, l.target.y);
        return dist < 5 / transformRef.current.k; // Tolerance scales with zoom
      });

      if (hitLink) {
        setHoverInfo({ x: rawX, y: rawY, content: hitLink, type: 'link' });
      } else {
        setHoverInfo(null);
      }
    }

    if (dragNode) {
      dragNode.x = mx;
      dragNode.y = my;
      dragNode.vx = 0; dragNode.vy = 0;
    } else if (isDragging) {
      transformRef.current.x += e.movementX;
      transformRef.current.y += e.movementY;
    }
  };

  const handleMouseUp = () => { setDragNode(null); setIsDragging(false); };

  // Data Editor
  const handleCreateNode = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const type = formData.get('type') as NodeType;
    const style = NODE_STYLES[type];
    
    const newNode: Node = {
      id: `custom_${Date.now()}`,
      title: formData.get('title') as string,
      type: type,
      year: formData.get('year') ? Number(formData.get('year')) : undefined,
      summary: formData.get('summary') as string,
      tags: [],
      x: -transformRef.current.x / transformRef.current.k + (window.innerWidth/2)/transformRef.current.k,
      y: -transformRef.current.y / transformRef.current.k + (window.innerHeight/2)/transformRef.current.k,
      vx: 0, vy: 0,
      radius: style.radius,
      color: style.color
    };
    nodesRef.current.push(newNode);
    saveGraph();
    setIsAddingNode(false);
    setSelectedNode(newNode);
  };

  const getConnections = (node: Node) => {
    return linksRef.current
      .filter(l => l.source.id === node.id || l.target.id === node.id)
      .map(l => {
        const other = l.source.id === node.id ? l.target : l.source;
        return { other, relation: l.relation, description: l.description };
      });
  };

  return (
    <div className="w-full h-screen bg-slate-950 text-slate-200 overflow-hidden font-sans select-none">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 cursor-crosshair"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      />
      
      {/* HOVER TOOLTIP */}
      {hoverInfo && (
        <div 
          className="fixed pointer-events-none z-50 p-3 rounded-lg shadow-2xl bg-slate-900/95 border border-slate-600 max-w-xs backdrop-blur-md"
          style={{ 
            left: hoverInfo.x + 15, 
            top: hoverInfo.y + 15,
            transform: 'translate(0, 0)'
          }}
        >
          {hoverInfo.type === 'node' ? (
            // NODE HOVER
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">
                {NODE_STYLES[hoverInfo.content.type as NodeType].label}
              </div>
              <div className="font-bold text-white mb-1">{hoverInfo.content.title}</div>
              {hoverInfo.content.year && <div className="text-xs text-slate-400 font-mono mb-2">{hoverInfo.content.year}</div>}
              <div className="text-xs text-slate-300 line-clamp-2">{hoverInfo.content.summary}</div>
            </div>
          ) : (
            // LINK HOVER
            <div>
              <div className="flex items-center gap-2 mb-1">
                 <div className="w-2 h-2 rounded-full bg-slate-400"></div>
                 <span className="text-xs font-bold text-slate-300 uppercase">{hoverInfo.content.relation.replace('_', ' ')}</span>
              </div>
              <div className="text-xs text-white">
                 <span className="text-slate-400">Between: </span>
                 {hoverInfo.content.source.title} & {hoverInfo.content.target.title}
              </div>
              {hoverInfo.content.description && (
                <div className="mt-2 text-xs text-emerald-300 italic border-t border-slate-700 pt-1">
                   "{hoverInfo.content.description}"
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TOP LEFT HUD */}
      <div className="absolute top-4 left-4 pointer-events-none">
        <div className="bg-slate-900/80 backdrop-blur rounded-lg border border-slate-700 shadow-xl p-4 mb-2">
          <h1 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
            <Activity size={20} /> PHENOMENON
          </h1>
        </div>
      </div>

      {/* TOP RIGHT CONTROLS */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 items-end">
        <div className="flex gap-2 bg-slate-900/80 backdrop-blur p-2 rounded-lg border border-slate-700">
           <button onClick={() => setIsAddingNode(true)} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded shadow transition-all active:scale-95">
            <Plus size={14} /> ADD NODE
          </button>
          <div className="w-px bg-slate-700 mx-1"></div>
          <button onClick={() => setMode('RESEARCH')} className={`px-3 py-1.5 rounded text-xs font-bold ${mode==='RESEARCH'?'bg-slate-700 text-white':'text-slate-500 hover:text-slate-300'}`}>RESEARCH</button>
          <button onClick={() => setMode('SHOW')} className={`px-3 py-1.5 rounded text-xs font-bold ${mode==='SHOW'?'bg-emerald-900/50 text-emerald-400 border border-emerald-500/30':'text-slate-500 hover:text-slate-300'}`}>SHOW</button>
          <div className="w-px bg-slate-700 mx-1"></div>
          <button onClick={resetGraph} className="px-2 text-slate-500 hover:text-red-400" title="Reset Graph"><Trash2 size={14} /></button>
        </div>
      </div>

      {/* ADD NODE MODAL */}
      {isAddingNode && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2"><Database size={14} /> Create Record</h2>
              <button onClick={() => setIsAddingNode(false)} className="text-slate-500 hover:text-white"><X size={18} /></button>
            </div>
            <form onSubmit={handleCreateNode} className="p-6 space-y-4">
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Title</label><input name="title" required autoFocus className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm" placeholder="e.g. The Wilson Memo" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Type</label><select name="type" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-xs"><option value="concept_person">Person</option><option value="concept_program">Program</option><option value="concept_topic">Topic</option><option value="event_craft">Craft Sighting</option><option value="event_entity">Entity</option><option value="event_gov">Gov Op</option><option value="event_psi">Psi</option></select></div>
                <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Year</label><input name="year" type="number" className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm" placeholder="YYYY" /></div>
              </div>
              <div className="space-y-1"><label className="text-[10px] uppercase font-bold text-slate-500">Summary</label><textarea name="summary" rows={3} className="w-full bg-slate-950 border border-slate-700 rounded p-2 text-white focus:border-emerald-500 outline-none text-sm" placeholder="Brief description..."></textarea></div>
              <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded shadow-lg transition-transform active:scale-95 text-xs tracking-widest">ADD TO GRAPH</button>
            </form>
          </div>
        </div>
      )}

      {/* SELECTED NODE DRAWER */}
      {selectedNode && !isAddingNode && (
        <div className="absolute bottom-4 right-4 w-96 bg-slate-900/95 backdrop-blur border border-slate-700 rounded-lg shadow-2xl animate-in slide-in-from-right max-h-[85vh] overflow-y-auto flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 sticky top-0 backdrop-blur z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] uppercase tracking-widest text-emerald-500 border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 rounded">
                {NODE_STYLES[selectedNode.type as NodeType]?.label || 'Node'}
              </span>
              <button onClick={() => setSelectedNode(null)}><X size={16} className="text-slate-500 hover:text-white"/></button>
            </div>
            <h2 className="text-3xl font-bold text-white mb-2 leading-tight">{selectedNode.title}</h2>
            {selectedNode.year && <div className="text-slate-400 font-mono text-sm">{selectedNode.year}</div>}
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-[10px] uppercase font-bold text-slate-500 mb-2">Briefing</h3>
              <p className="text-slate-300 text-sm leading-relaxed">
                {selectedNode.summary}
              </p>
            </div>
            
            <button className="w-full flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white py-2 rounded border border-slate-600 transition-colors text-xs font-bold uppercase tracking-wider">
               <BookOpen size={14} /> Read Full Dossier
            </button>

            {/* Connections */}
            <div className="pt-2">
               <div className="flex items-center gap-2 mb-3">
                 <LinkIcon size={12} className="text-slate-500"/>
                 <h3 className="text-[10px] uppercase font-bold text-slate-500">Connected Intel</h3>
               </div>
               
               <div className="space-y-3">
                 {getConnections(selectedNode).map((c, i) => (
                   <div key={i} className="relative pl-4 border-l-2 border-slate-700 hover:border-emerald-500 transition-colors group">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-200 group-hover:text-emerald-400 transition-colors cursor-pointer" onClick={() => setSelectedNode(c.other)}>{c.other.title}</span>
                        <span className="text-[10px] text-slate-500 uppercase">{c.relation.replace('_', ' ')}</span>
                      </div>
                      {c.description && (
                        <p className="text-[11px] text-slate-400 italic leading-snug">"{c.description}"</p>
                      )}
                   </div>
                 ))}
                 {getConnections(selectedNode).length === 0 && (
                   <div className="text-xs text-slate-600 italic">No connections recorded. Hold Shift + Click another node to link.</div>
                 )}
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}