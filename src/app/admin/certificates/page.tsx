'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MOCK_EVENTS } from '@/lib/data';
import { 
  Award, Move, RefreshCw, Layers, Sliders, 
  Trash2, Mail, Download, CheckCircle2, FileText, 
  Upload, QrCode, Image as ImageIcon, HelpCircle, Key, ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TextBlock {
  id: string;
  name: string;
  text: string;
  x: number; // in %
  y: number; // in %
  fontSize: number; // in px
  color: string;
  isBold: boolean;
}

declare global {
  interface Window {
    Canva?: any;
  }
}

export default function AdminCertificatesPage() {
  const [selectedEvent, setSelectedEvent] = useState(MOCK_EVENTS[0].id);
  const [templateMode, setTemplateMode] = useState<'preset' | 'canva'>('preset');
  const [preset, setPreset] = useState<'emerald' | 'blue' | 'gold'>('gold');
  
  // Canva template background image base64 or URL
  const [canvaBg, setCanvaBg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Canva SDK states
  const [canvaApiKey, setCanvaApiKey] = useState('');
  const [sdkLoading, setSdkLoading] = useState(false);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [sdkLoaded, setSdkLoaded] = useState(false);

  // Custom Logos / Signatures
  const [collegeLogo, setCollegeLogo] = useState('https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=100');
  const [signature, setSignature] = useState('https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=120');

  // Interactive blocks positioning (including movable QR Code block)
  const [blocks, setBlocks] = useState<TextBlock[]>([
    { id: 'b-logo', name: 'College Logo Slot', text: 'Logo', x: 50, y: 15, fontSize: 14, color: '#94a3b8', isBold: false },
    { id: 'b-title', name: 'Certificate Title', text: 'CERTIFICATE OF PARTICIPATION', x: 50, y: 32, fontSize: 26, color: '#f59e0b', isBold: true },
    { id: 'b-desc', name: 'Introductory Statement', text: 'This is proudly presented to', x: 50, y: 45, fontSize: 13, color: '#71717a', isBold: false },
    { id: 'b-name', name: 'Student Name Placeholder', text: '{{student_name}}', x: 50, y: 56, fontSize: 32, color: '#ffffff', isBold: true },
    { id: 'b-desc2', name: 'Event Summary Block', text: 'for active participation and completion of', x: 50, y: 68, fontSize: 12, color: '#71717a', isBold: false },
    { id: 'b-evt', name: 'Event Title Placeholder', text: '{{event_title}}', x: 50, y: 77, fontSize: 20, color: '#f59e0b', isBold: true },
    { id: 'b-hash', name: 'SHA-256 Checksum block', text: 'Verification Code: {{certificate_id}}', x: 15, y: 90, fontSize: 9, color: '#52525b', isBold: false },
    { id: 'b-qr', name: 'Verification QR Code Block', text: 'QR', x: 85, y: 22, fontSize: 12, color: '#ffffff', isBold: false },
    { id: 'b-sign', name: 'Digital Signature Slot', text: 'Signature', x: 80, y: 88, fontSize: 11, color: '#ffffff', isBold: false }
  ]);

  const [activeBlockId, setActiveBlockId] = useState<string>('b-name');
  const [bulkStatus, setBulkStatus] = useState<'idle' | 'generating' | 'success'>('idle');
  const [issuedCount, setIssuedCount] = useState(0);

  const activeBlock = blocks.find(b => b.id === activeBlockId);

  const updateActiveBlock = (fields: Partial<TextBlock>) => {
    setBlocks(blocks.map(b => b.id === activeBlockId ? { ...b, ...fields } : b));
  };

  // Load saved Canva templates or settings
  useEffect(() => {
    const savedTemplate = localStorage.getItem('cc_canva_template_bg');
    if (savedTemplate) {
      setCanvaBg(savedTemplate);
      setTemplateMode('canva');
    }
    const savedKey = localStorage.getItem('cc_canva_api_key');
    if (savedKey) {
      setCanvaApiKey(savedKey);
    }
  }, []);

  // Dynamically load Canva SDK script
  const loadCanvaSdk = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (window.Canva) {
        setSdkLoaded(true);
        resolve(true);
        return;
      }

      setSdkLoading(true);
      const script = document.createElement('script');
      script.src = 'https://sdk.canva.com/designbutton/v2/api.js';
      script.async = true;
      script.onload = () => {
        setSdkLoading(false);
        setSdkLoaded(true);
        resolve(true);
      };
      script.onerror = () => {
        setSdkLoading(false);
        resolve(false);
      };
      document.body.appendChild(script);
    });
  };

  const handleDesignOnCanva = async () => {
    if (!canvaApiKey) {
      setShowConfigModal(true);
      return;
    }

    const loaded = await loadCanvaSdk();
    if (!loaded || !window.Canva) {
      alert('Failed to load Canva SDK script. Please check your network connection.');
      return;
    }

    try {
      // Initialize Canva Design Button SDK
      window.Canva.DesignButton.initialize({
        apiKey: canvaApiKey
      });

      // Launch editor iframe modal
      window.Canva.DesignButton.create({
        designType: 'Certificate',
        onDesignPublish: (design: { url: string }) => {
          setCanvaBg(design.url);
          localStorage.setItem('cc_canva_template_bg', design.url);
          alert('Canva certificate design template saved successfully!');
        }
      });
    } catch (err) {
      console.error('[Canva SDK Error]', err);
      alert('Canva SDK Error: Ensure you have added your domains inside Canva Developer Credentials Console.');
    }
  };

  const handleSimulateCanvaExport = () => {
    // Standard mock certificate background
    const mockCanvaBg = 'https://images.unsplash.com/photo-1557683316-973673baf926?w=1200';
    setCanvaBg(mockCanvaBg);
    localStorage.setItem('cc_canva_template_bg', mockCanvaBg);
    setTemplateMode('canva');

    // Clear background text helper blocks
    const updated = blocks.map(b => {
      if (b.id === 'b-title' || b.id === 'b-desc' || b.id === 'b-desc2') {
        return { ...b, text: '' };
      }
      return b;
    });
    setBlocks(updated);
    setShowConfigModal(false);
  };

  const saveApiKey = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('cc_canva_api_key', canvaApiKey);
    setShowConfigModal(false);
    handleDesignOnCanva();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCanvaBg(result);
      localStorage.setItem('cc_canva_template_bg', result);
      setTemplateMode('canva');

      const updated = blocks.map(b => {
        if (b.id === 'b-title' || b.id === 'b-desc' || b.id === 'b-desc2') {
          return { ...b, text: '' };
        }
        return b;
      });
      setBlocks(updated);
    };
    reader.readAsDataURL(file);
  };

  const handleBulkIssue = () => {
    setBulkStatus('generating');
    
    setTimeout(() => {
      setBulkStatus('success');
      const event = MOCK_EVENTS.find(e => e.id === selectedEvent);
      const count = event?.id === 'event-1' ? 108 : event?.id === 'event-5' ? 76 : 14;
      setIssuedCount(count);
      
      localStorage.setItem(`cc_template_settings_${selectedEvent}`, JSON.stringify({
        templateMode,
        blocks,
        canvaBg: templateMode === 'canva' ? 'configured' : null
      }));

      const emailLogs = JSON.parse(localStorage.getItem('cc_email_logs') || '[]');
      const newEmailLog = {
        id: `email-cert-${Date.now()}`,
        recipient: 'aditya.sharma@campusconnect.edu',
        subject: `Your Certificate: ${event?.title}`,
        type: 'certificate',
        status: 'sent',
        time: new Date().toISOString(),
        bodyPreview: `Dear Aditya Sharma,\n\nCongratulations on completing ${event?.title}. Your certificate PDF has been generated using the Canva layout engine and signed with hash SHA-256.\n\nVerification Code: CC-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
      };
      localStorage.setItem('cc_email_logs', JSON.stringify([newEmailLog, ...emailLogs]));

      const logs = JSON.parse(localStorage.getItem('cc_audit_logs') || '[]');
      logs.unshift({
        id: `audit-${Date.now()}`,
        action: 'CANVA_CERTIFICATE_ISSUED',
        user: 'Dr. Rajesh Kumar (Admin)',
        details: `Compiled and issued ${count} certificates using ${templateMode === 'canva' ? 'Canva Background' : 'Branding Preset'} template. Dynamic PDF verification tags attached.`,
        time: new Date().toISOString()
      });
      localStorage.setItem('cc_audit_logs', JSON.stringify(logs));
    }, 2000);
  };

  const clearCanvaTemplate = () => {
    setCanvaBg(null);
    localStorage.removeItem('cc_canva_template_bg');
    setTemplateMode('preset');
    
    setBlocks([
      { id: 'b-logo', name: 'College Logo Slot', text: 'Logo', x: 50, y: 15, fontSize: 14, color: '#94a3b8', isBold: false },
      { id: 'b-title', name: 'Certificate Title', text: 'CERTIFICATE OF PARTICIPATION', x: 50, y: 32, fontSize: 26, color: '#f59e0b', isBold: true },
      { id: 'b-desc', name: 'Introductory Statement', text: 'This is proudly presented to', x: 50, y: 45, fontSize: 13, color: '#71717a', isBold: false },
      { id: 'b-name', name: 'Student Name Placeholder', text: '{{student_name}}', x: 50, y: 56, fontSize: 32, color: '#ffffff', isBold: true },
      { id: 'b-desc2', name: 'Event Summary Block', text: 'for active participation and completion of', x: 50, y: 68, fontSize: 12, color: '#71717a', isBold: false },
      { id: 'b-evt', name: 'Event Title Placeholder', text: '{{event_title}}', x: 50, y: 77, fontSize: 20, color: '#f59e0b', isBold: true },
      { id: 'b-hash', name: 'SHA-256 Checksum block', text: 'Verification Code: {{certificate_id}}', x: 15, y: 90, fontSize: 9, color: '#52525b', isBold: false },
      { id: 'b-qr', name: 'Verification QR Code Block', text: 'QR', x: 85, y: 22, fontSize: 12, color: '#ffffff', isBold: false },
      { id: 'b-sign', name: 'Digital Signature Slot', text: 'Signature', x: 80, y: 88, fontSize: 11, color: '#ffffff', isBold: false }
    ]);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Certificate Studio</h1>
          <p className="text-sm text-zinc-500 mt-1">Design templates visually, upload Canva exports, place dynamic overlays, and issue in bulk.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Visual Canvas */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Mode Toggles */}
          <div className="flex p-1.5 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-border/60 max-w-sm">
            <button
              onClick={() => setTemplateMode('preset')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${templateMode === 'preset' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Imperial Presets
            </button>
            <button
              onClick={() => setTemplateMode('canva')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${templateMode === 'canva' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}
            >
              Canva Template Image
            </button>
          </div>

          {/* Certificate Canvas Container */}
          <div 
            style={{
              backgroundImage: templateMode === 'canva' && canvaBg ? `url(${canvaBg})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
            className={`aspect-[1.58] w-full rounded-2xl border-2 border-zinc-800/80 p-6 relative overflow-hidden bg-[#0c0c0f] flex flex-col justify-between shadow-2xl ${
              templateMode === 'preset' && preset === 'emerald' 
                ? 'border-emerald-500/25 bg-gradient-to-br from-emerald-950/20 via-zinc-950 to-emerald-950/30'
                : templateMode === 'preset' && preset === 'blue'
                ? 'border-blue-500/25 bg-gradient-to-br from-blue-950/20 via-zinc-950 to-blue-950/30'
                : templateMode === 'preset' && preset === 'gold'
                ? 'border-amber-500/25 bg-gradient-to-br from-amber-950/20 via-zinc-950 to-amber-950/30'
                : 'border-zinc-800'
            }`}
          >
            {/* Background Corner Frames (Only for standard presets) */}
            {templateMode === 'preset' && (
              <>
                <div className={`absolute top-0 left-0 w-24 h-24 border-t-4 border-l-4 rounded-tl-xl ${preset === 'emerald' ? 'border-emerald-500/40' : preset === 'blue' ? 'border-blue-500/40' : 'border-amber-500/40'}`} />
                <div className={`absolute top-0 right-0 w-24 h-24 border-t-4 border-r-4 rounded-tr-xl ${preset === 'emerald' ? 'border-emerald-500/40' : preset === 'blue' ? 'border-blue-500/40' : 'border-amber-500/40'}`} />
                <div className={`absolute bottom-0 left-0 w-24 h-24 border-b-4 border-l-4 rounded-bl-xl ${preset === 'emerald' ? 'border-emerald-500/40' : preset === 'blue' ? 'border-blue-500/40' : 'border-amber-500/40'}`} />
                <div className={`absolute bottom-0 right-0 w-24 h-24 border-b-4 border-r-4 rounded-br-xl ${preset === 'emerald' ? 'border-emerald-500/40' : preset === 'blue' ? 'border-blue-500/40' : 'border-amber-500/40'}`} />
              </>
            )}

            {/* If Canva background is missing, show an upload placeholder inside canvas */}
            {templateMode === 'canva' && !canvaBg && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-zinc-950/80 text-center space-y-4">
                <ImageIcon className="w-12 h-12 text-zinc-600 animate-pulse" />
                <div>
                  <h4 className="font-extrabold text-sm text-foreground">Canva Design Template Missing</h4>
                  <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-normal">
                    Open the editor to design on Canva, or drag-and-drop an exported background image.
                  </p>
                </div>
              </div>
            )}

            {/* Dynamic blocks rendering */}
            {(! (templateMode === 'canva' && !canvaBg)) && blocks.map((block) => {
              const isSelected = block.id === activeBlockId;
              
              if (block.id === 'b-logo') {
                return (
                  <div
                    key={block.id}
                    onClick={() => setActiveBlockId(block.id)}
                    style={{ left: `${block.x}%`, top: `${block.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 p-1.5 cursor-pointer rounded border ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/25' : 'border-transparent'
                    }`}
                  >
                    <img src={collegeLogo} alt="Logo" className="h-10 w-auto opacity-75" />
                  </div>
                );
              }

              if (block.id === 'b-sign') {
                return (
                  <div
                    key={block.id}
                    onClick={() => setActiveBlockId(block.id)}
                    style={{ left: `${block.x}%`, top: `${block.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 text-center p-1.5 cursor-pointer rounded border ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/25' : 'border-transparent'
                    }`}
                  >
                    <img src={signature} alt="Signature" className="h-7 w-auto mx-auto" />
                    <div style={{ fontSize: `${block.fontSize}px`, color: block.color }} className="mt-1 font-mono uppercase tracking-wider">
                      Authorized Sign
                    </div>
                  </div>
                );
              }

              if (block.id === 'b-qr') {
                return (
                  <div
                    key={block.id}
                    onClick={() => setActiveBlockId(block.id)}
                    style={{ left: `${block.x}%`, top: `${block.y}%` }}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 text-center p-2 cursor-pointer bg-white rounded-lg border shadow ${
                      isSelected ? 'border-blue-500 ring-2 ring-blue-500/25' : 'border-transparent'
                    }`}
                  >
                    <QrCode className="w-10 h-10 text-zinc-950" />
                  </div>
                );
              }

              // Hide empty block labels
              if (!block.text) return null;

              return (
                <div
                  key={block.id}
                  onClick={() => setActiveBlockId(block.id)}
                  style={{ 
                    left: `${block.x}%`, 
                    top: `${block.y}%`,
                    fontSize: `${block.fontSize}px`,
                    color: block.color,
                    fontWeight: block.isBold ? 'bold' : 'normal'
                  }}
                  className={`absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap p-1.5 cursor-pointer rounded border leading-none transition-all ${
                    isSelected ? 'border-blue-500 bg-blue-500/5 ring-2 ring-blue-500/25' : 'border-transparent hover:border-zinc-800'
                  }`}
                >
                  {block.text}
                </div>
              );
            })}
          </div>

          {/* Preset Buttons */}
          {templateMode === 'preset' && (
            <div className="flex gap-3">
              <button
                onClick={() => setPreset('gold')}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${preset === 'gold' ? 'border-amber-500 text-amber-500 bg-amber-500/10' : 'border-border hover:bg-zinc-800'}`}
              >
                Imperial Gold Preset
              </button>
              <button
                onClick={() => setPreset('emerald')}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${preset === 'emerald' ? 'border-emerald-500 text-emerald-500 bg-emerald-500/10' : 'border-border hover:bg-zinc-800'}`}
              >
                Emerald Prestige Preset
              </button>
              <button
                onClick={() => setPreset('blue')}
                className={`px-4 py-2 border rounded-xl text-xs font-bold transition-all cursor-pointer ${preset === 'blue' ? 'border-blue-500 text-blue-500 bg-blue-500/10' : 'border-border hover:bg-zinc-800'}`}
              >
                Sapphire Technical Preset
              </button>
            </div>
          )}

          {templateMode === 'canva' && canvaBg && (
            <div className="flex justify-between items-center bg-card border border-border p-4 rounded-xl text-xs">
              <span className="text-muted">Template file uploaded. Overlay blocks are positioned relative to your background.</span>
              <button
                onClick={clearCanvaTemplate}
                className="px-3.5 py-1.5 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-all cursor-pointer font-bold"
              >
                Remove Uploaded Background
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Controls & Canva Upload Panel */}
        <div className="space-y-6">
          
          {/* Canva Design SDK launch section */}
          {templateMode === 'canva' && (
            <div className="premium-card p-5 bg-card border-border/80 text-left space-y-4">
              <h3 className="font-extrabold text-xs text-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
                <Layers className="w-4.5 h-4.5 text-blue-500" />
                <span>Canva Editor API Integration</span>
              </h3>

              <div className="space-y-3.5 text-xs">
                {/* Api SDK status and buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleDesignOnCanva}
                    className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-md shadow-purple-500/15 cursor-pointer"
                  >
                    <Layers className="w-4 h-4" /> Design on Canva SDK
                  </button>

                  <button
                    onClick={() => setShowConfigModal(true)}
                    className="w-full py-2 border border-border bg-background hover:bg-zinc-800/40 rounded-xl font-semibold flex items-center justify-center gap-1 text-[11px] cursor-pointer text-muted-foreground"
                  >
                    <Key className="w-3.5 h-3.5" /> {canvaApiKey ? 'Modify API Credentials' : 'Set Canva API Credentials'}
                  </button>
                </div>

                <div className="border-t border-border/50 pt-3 text-center">
                  <span className="text-[10px] text-zinc-500 font-bold block mb-2">Or Upload Image Manually</span>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="p-4 border border-dashed border-border/80 hover:border-blue-500/50 rounded-xl text-center bg-zinc-950/20 cursor-pointer transition-all space-y-1.5"
                  >
                    <Upload className="w-5 h-5 text-zinc-500 mx-auto" />
                    <span className="font-semibold text-foreground text-[10px] block">Drag & Drop exported template image</span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Element Inspector */}
          {activeBlock && (
            <div className="premium-card p-5 bg-card border-border/80 text-left space-y-4">
              <div className="flex justify-between items-center border-b border-border pb-2.5">
                <h3 className="font-extrabold text-xs text-foreground flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-blue-500" />
                  <span>Element Inspector</span>
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">{activeBlock.name}</span>
              </div>

              <div className="space-y-4 text-xs">
                {/* Text edit */}
                {activeBlock.id !== 'b-logo' && activeBlock.id !== 'b-sign' && activeBlock.id !== 'b-qr' && (
                  <div className="space-y-1.5">
                    <label className="font-medium text-muted">Block Text</label>
                    <input
                      type="text"
                      value={activeBlock.text}
                      onChange={(e) => updateActiveBlock({ text: e.target.value })}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-foreground"
                    />
                  </div>
                )}

                {/* Coordinates Sliders */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted">
                      <span>Horizontal (X%)</span>
                      <span className="font-mono">{activeBlock.x}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={activeBlock.x}
                      onChange={(e) => updateActiveBlock({ x: Number(e.target.value) })}
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-muted">
                      <span>Vertical (Y%)</span>
                      <span className="font-mono">{activeBlock.y}%</span>
                    </div>
                    <input
                      type="range"
                      min={5}
                      max={95}
                      value={activeBlock.y}
                      onChange={(e) => updateActiveBlock({ y: Number(e.target.value) })}
                      className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>
                </div>

                {/* Font Size & Bold Toggle */}
                {activeBlock.id !== 'b-qr' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-muted">
                        <span>Size (px)</span>
                        <span className="font-mono">{activeBlock.fontSize}px</span>
                      </div>
                      <input
                        type="range"
                        min={8}
                        max={48}
                        value={activeBlock.fontSize}
                        onChange={(e) => updateActiveBlock({ fontSize: Number(e.target.value) })}
                        className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                    
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <label className="flex items-center gap-2 cursor-pointer font-medium text-muted">
                        <input
                          type="checkbox"
                          checked={activeBlock.isBold}
                          onChange={(e) => updateActiveBlock({ isBold: e.target.checked })}
                          className="w-4 h-4 rounded text-blue-600 border-border"
                        />
                        <span>Bold font</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Color Input */}
                {activeBlock.id !== 'b-logo' && activeBlock.id !== 'b-qr' && (
                  <div className="space-y-1.5">
                    <label className="font-medium text-muted">Text Color Hex Code</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={activeBlock.color}
                        onChange={(e) => updateActiveBlock({ color: e.target.value })}
                        className="w-8 h-8 rounded border border-border cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={activeBlock.color}
                        onChange={(e) => updateActiveBlock({ color: e.target.value })}
                        className="w-full bg-background border border-border rounded-lg px-3 py-1.5 text-foreground font-mono"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bulk Generation Card */}
          <div className="premium-card p-5 bg-card border-border/80 text-left space-y-4">
            <h3 className="font-extrabold text-xs text-foreground flex items-center gap-1.5 border-b border-border pb-2.5">
              <Award className="w-4.5 h-4.5 text-amber-500 animate-pulse" />
              <span>Bulk Issue Certificates</span>
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold text-muted">Select Event Scope *</label>
                <select
                  value={selectedEvent}
                  onChange={(e) => setSelectedEvent(e.target.value)}
                  className="w-full bg-background border border-border rounded-xl px-2.5 py-2.5 text-muted-foreground font-semibold"
                >
                  {MOCK_EVENTS.map(e => (
                    <option key={e.id} value={e.id}>{e.title}</option>
                  ))}
                </select>
              </div>

              {bulkStatus === 'idle' && (
                <button
                  onClick={handleBulkIssue}
                  className="w-full py-3 rounded-24 bg-primary hover:bg-blue-600 text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" /> Issue to checked-in users
                </button>
              )}

              {bulkStatus === 'generating' && (
                <div className="p-4 rounded-xl border border-border bg-zinc-900/40 text-center flex flex-col items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                  <span className="text-[10px] text-zinc-400 font-mono">Signing PDF hashes with SHA-256...</span>
                </div>
              )}

              {bulkStatus === 'success' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs rounded-xl flex items-center gap-2 font-semibold">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>Successfully issued {issuedCount} certificates!</span>
                  </div>
                  <button
                    onClick={() => setBulkStatus('idle')}
                    className="w-full py-2 border border-border hover:bg-zinc-800/45 rounded-xl font-bold uppercase tracking-wider text-[9px]"
                  >
                    Issue another event
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* Canva SDK Client Credentials Config Modal */}
      <AnimatePresence>
        {showConfigModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm" onClick={() => setShowConfigModal(false)} />
            
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="glass-panel w-full max-w-md bg-card/95 backdrop-blur-md rounded-[28px] border border-border shadow-2xl relative overflow-hidden text-left p-6 space-y-6 z-10"
            >
              <div className="flex justify-between items-center border-b border-border pb-3">
                <div>
                  <h3 className="font-extrabold text-sm text-foreground">Canva Developer Integration</h3>
                  <p className="text-[10px] text-zinc-500">Configure Canva Button SDK</p>
                </div>
                <button
                  onClick={() => setShowConfigModal(false)}
                  className="text-xs font-bold text-zinc-400 hover:text-foreground px-2.5 py-1 rounded bg-zinc-800"
                >
                  Close
                </button>
              </div>

              <form onSubmit={saveApiKey} className="space-y-4 text-xs">
                <div className="space-y-1.5">
                  <label className="font-bold text-muted flex items-center gap-1">
                    <Key className="w-3.5 h-3.5 text-blue-500" />
                    <span>Canva Developer API Key (Client ID)</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={canvaApiKey}
                    onChange={(e) => setCanvaApiKey(e.target.value)}
                    placeholder="Enter Client ID from Canva Dev Console"
                    className="w-full bg-background border border-border rounded-xl px-3 py-2.5 text-foreground font-mono"
                  />
                </div>

                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 border border-border/40 rounded-xl space-y-2 text-[10px] leading-normal text-zinc-400">
                  <div className="flex justify-between font-bold">
                    <span>Integration Guideline:</span>
                    <a
                      href="https://www.canva.com/developers"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-0.5"
                    >
                      Canva Developers Portal <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <p>1. Canva Developer Console mein ek new App generate karein.</p>
                  <p>2. "API Integrations" settings tab mein dynamic domains white-label list configure karein (e.g. `localhost` / `campusconnect.edu`).</p>
                  <p>3. Canva Client ID copy karke key input box mein submit karein.</p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleSimulateCanvaExport}
                    className="py-2.5 border border-border hover:bg-zinc-800 text-center font-bold rounded-xl cursor-pointer text-muted-foreground"
                  >
                    Simulate Demo Export
                  </button>
                  
                  <button
                    type="submit"
                    className="py-2.5 bg-primary hover:bg-blue-600 text-white font-bold rounded-xl shadow-sm cursor-pointer text-center"
                  >
                    Save & Initialize
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
