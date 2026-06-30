'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { 
  QrCode, Camera, ShieldCheck, ShieldAlert, 
  Search, CheckCircle2, AlertCircle, XCircle, 
  History, Bolt, FlipHorizontal, RefreshCw, Smartphone,
  WifiOff, Wifi, FileSpreadsheet, Download, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_EVENTS } from '@/lib/data';

interface ScanResult {
  id: string;
  ticketId: string;
  studentName: string;
  prn: string;
  eventTitle: string;
  status: 'success' | 'duplicate' | 'unpaid' | 'invalid' | 'queued';
  time: string;
}

export default function QRScannerPage() {
  const [ticketQuery, setTicketQuery] = useState('');
  const [scanning, setScanning] = useState(false);
  const [cameraDevice, setCameraDevice] = useState<'user' | 'environment'>('environment');
  const [isOnline, setIsOnline] = useState(true);

  // Scanner modes
  const [continuousMode, setContinuousMode] = useState(true);

  // Scanner status and results
  const [scanStatus, setScanStatus] = useState<'idle' | 'processing' | 'success' | 'duplicate' | 'unpaid' | 'invalid' | 'queued'>('idle');
  const [statusMessage, setStatusMessage] = useState('');
  const [scannedStudent, setScannedStudent] = useState<{ name: string; prn: string; department: string; semester?: string; eventTitle: string } | null>(null);

  // Scan History & Offline Queue
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [offlineQueue, setOfflineQueue] = useState<{ ticketId: string; timestamp: string }[]>([]);

  // Selected event for scan scope
  const [selectedEventId, setSelectedEventId] = useState(MOCK_EVENTS[0].id);

  // HTML5 QR Code Ref
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);
  const qrContainerId = 'reader-qr-view';

  // Monitor network status
  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => {
      setIsOnline(true);
      syncOfflineQueue();
    };
    const goOffline = () => setIsOnline(false);

    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);

    // Load history
    const storedHistory = localStorage.getItem('cc_scan_history');
    if (storedHistory) {
      setScanHistory(JSON.parse(storedHistory));
    }

    return () => {
      stopScanner();
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const saveHistory = (updated: ScanResult[]) => {
    setScanHistory(updated);
    localStorage.setItem('cc_scan_history', JSON.stringify(updated));
  };

  const startScanner = async () => {
    setScanning(true);
    setScanStatus('idle');
    
    setTimeout(async () => {
      try {
        const html5QrCode = new Html5Qrcode(qrContainerId);
        html5QrCodeRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: cameraDevice },
          {
            fps: 15,
            qrbox: { width: 260, height: 260 }
          },
          (decodedText) => {
            handleTicketCheckIn(decodedText);
            if (!continuousMode) {
              stopScanner();
            }
          },
          () => {} // Verbose errors ignored
        );
      } catch (err: any) {
        console.error('[Scanner Error]', err);
        setScanStatus('invalid');
        setStatusMessage('Camera access denied or device not found.');
        setScanning(false);
      }
    }, 200);
  };

  const stopScanner = async () => {
    if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
      try {
        await html5QrCodeRef.current.stop();
        html5QrCodeRef.current = null;
      } catch (err) {
        console.error('[Stop Scanner Error]', err);
      }
    }
    setScanning(false);
  };

  const toggleCamera = async () => {
    const newDevice = cameraDevice === 'environment' ? 'user' : 'environment';
    setCameraDevice(newDevice);
    if (scanning) {
      await stopScanner();
      setTimeout(startScanner, 250);
    }
  };

  // Sync queued tickets when connection is restored
  const syncOfflineQueue = async () => {
    if (offlineQueue.length === 0) return;
    setScanStatus('processing');
    setStatusMessage(`Syncing ${offlineQueue.length} queued offline check-ins...`);

    const queue = [...offlineQueue];
    for (const item of queue) {
      await handleTicketCheckIn(item.ticketId, true);
    }

    setOfflineQueue([]);
  };

  const handleTicketCheckIn = async (code: string, isSyncing = false) => {
    if (!code) return;
    setScanStatus('processing');

    const targetEvent = MOCK_EVENTS.find(e => e.id === selectedEventId);
    const eventTitle = targetEvent?.title || 'Selected Event';

    // OFFLINE CASE
    if (!isOnline) {
      // Check if ticket already exists in queue to prevent duplicate
      const alreadyQueued = offlineQueue.some(q => q.ticketId === code);
      if (alreadyQueued) {
        setScanStatus('duplicate');
        setStatusMessage('Offline Queue Warning: Already queued.');
        return;
      }

      setOfflineQueue(prev => [...prev, { ticketId: code, timestamp: new Date().toISOString() }]);
      setScanStatus('queued');
      setStatusMessage('Device Offline. Check-in queued in LocalStorage.');

      const newItem: ScanResult = {
        id: `scan-${Date.now()}`,
        ticketId: code,
        studentName: 'Offline Attendee',
        prn: 'N/A',
        eventTitle,
        status: 'queued',
        time: new Date().toLocaleTimeString()
      };
      saveHistory([newItem, ...scanHistory.slice(0, 29)]);
      return;
    }

    // ONLINE MODE: Call Server/API or simulate check-in
    try {
      // In Mock Mode, we simulate standard outcomes
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(code);
      
      // Let's query local storage tickets
      const storedKeys = Object.keys(localStorage).filter(k => k.startsWith('cc_tickets_'));
      let matchTicket: any = null;
      let matchedRegKey = '';

      for (const key of storedKeys) {
        const ticketsList = JSON.parse(localStorage.getItem(key) || '[]');
        const match = ticketsList.find((t: any) => t.ticket_id === code || t.id === code);
        if (match) {
          matchTicket = match;
          matchedRegKey = key.replace('cc_tickets_', 'cc_registrations_');
          break;
        }
      }

      // If not found in localStorage, search in seeded mock data
      if (!matchTicket) {
        // Fallback simulate checking
        const st = MOCK_EVENTS.find(e => e.id === selectedEventId);
        if (code.includes('MOCK') || code.includes('CC-')) {
          matchTicket = {
            id: `tkt-${Date.now()}`,
            ticket_id: code,
            status: 'active',
            registration: {
              student_id: 'student-uuid-1111-2222',
              event_id: selectedEventId,
              emergency_contact: '9999999999',
              status: 'approved',
              payment_status: 'paid',
              event: st,
              profiles: {
                name: 'Aditya Sharma',
                prn: 'PRN202410293',
                department: 'Computer Science & Engineering',
                semester: 'V'
              }
            }
          };
        }
      }

      if (!matchTicket) {
        setScanStatus('invalid');
        setStatusMessage('Ticket not found in local system database.');
        const newItem: ScanResult = {
          id: `scan-${Date.now()}`,
          ticketId: code,
          studentName: 'Invalid Code',
          prn: 'N/A',
          eventTitle,
          status: 'invalid',
          time: new Date().toLocaleTimeString()
        };
        saveHistory([newItem, ...scanHistory.slice(0, 29)]);
        return;
      }

      const registration = matchTicket.registration || matchTicket.registrations;
      const student = registration?.profiles || registration?.student_id;
      const studentName = student?.name || 'Student';
      const prn = student?.prn || 'N/A';

      if (matchTicket.status === 'used') {
        setScanStatus('duplicate');
        setScannedStudent({
          name: studentName,
          prn,
          department: student?.department || 'N/A',
          eventTitle
        });
        setStatusMessage(`Duplicate Scan: Checked in previously.`);
        const newItem: ScanResult = {
          id: `scan-${Date.now()}`,
          ticketId: code,
          studentName,
          prn,
          eventTitle,
          status: 'duplicate',
          time: new Date().toLocaleTimeString()
        };
        saveHistory([newItem, ...scanHistory.slice(0, 29)]);
        return;
      }

      // Mark used
      if (matchedRegKey) {
        // Update ticket in local storage
        const studentId = matchedRegKey.replace('cc_registrations_', '');
        const ticketKey = `cc_tickets_${studentId}`;
        const tickets = JSON.parse(localStorage.getItem(ticketKey) || '[]');
        const updatedTickets = tickets.map((t: any) => (t.ticket_id === code || t.id === code) ? { ...t, status: 'used' } : t);
        localStorage.setItem(ticketKey, JSON.stringify(updatedTickets));

        // Create certificate for student
        const certKey = `cc_certs_${studentId}`;
        const certs = JSON.parse(localStorage.getItem(certKey) || '[]');
        const certCode = `CC-CERT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
        const newCert = {
          id: `cert-${Date.now()}`,
          registration_id: registration.id,
          certificate_id: certCode,
          hash_signature: `hash_${Date.now()}`,
          created_at: new Date().toISOString(),
          registration
        };
        localStorage.setItem(certKey, JSON.stringify([newCert, ...certs]));
      }

      setScanStatus('success');
      setScannedStudent({
        name: studentName,
        prn,
        department: student?.department || 'N/A',
        eventTitle
      });
      setStatusMessage('Checked in successfully!');

      const newItem: ScanResult = {
        id: `scan-${Date.now()}`,
        ticketId: code,
        studentName,
        prn,
        eventTitle,
        status: 'success',
        time: new Date().toLocaleTimeString()
      };
      saveHistory([newItem, ...scanHistory.slice(0, 29)]);

    } catch (err: any) {
      setScanStatus('invalid');
      setStatusMessage(err.message || 'Database connection error.');
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketQuery) return;
    handleTicketCheckIn(ticketQuery.trim());
    setTicketQuery('');
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["Ticket ID,Student Name,PRN,Event Scope,Check-In Time,Status"]
      .concat(scanHistory.map(h => `"${h.ticketId}","${h.studentName}","${h.prn}","${h.eventTitle}","${h.time}","${h.status}"`))
      .join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `cc_scan_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Compute analytics
  const totalCheckedIn = scanHistory.filter(h => h.status === 'success').length;
  const totalDuplicates = scanHistory.filter(h => h.status === 'duplicate').length;
  const totalQueue = offlineQueue.length;

  return (
    <div className="space-y-6 text-left">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Gate QR Scanner</h1>
          <p className="text-sm text-zinc-500 mt-1">SaaS-grade scanner with continuous scan, offline support, and logs export.</p>
        </div>

        {/* Network & Offline Indicators */}
        <div className="flex gap-3 items-center">
          <span className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 ${
            isOnline ? 'border-emerald-500/20 text-emerald-500 bg-emerald-500/10' : 'border-red-500/20 text-red-500 bg-red-500/10'
          }`}>
            {isOnline ? (
              <>
                <Wifi className="w-4 h-4" /> Device Online
              </>
            ) : (
              <>
                <WifiOff className="w-4 h-4 animate-pulse" /> Offline Mode Active
              </>
            )}
          </span>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2 border border-border bg-card rounded-xl text-xs font-bold flex items-center gap-1.5 hover:bg-zinc-800 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-zinc-400" /> Export Scan Logs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns: QR Scanner & Outcome */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Scanner Card */}
          <div className="premium-card p-6 bg-card border-border/80 flex flex-col items-center space-y-4">
            
            {/* Event selection scope */}
            <div className="w-full text-xs text-left space-y-1">
              <label className="font-semibold text-muted">Active Check-In Target Event</label>
              <select
                value={selectedEventId}
                onChange={(e) => setSelectedEventId(e.target.value)}
                className="w-full bg-background border border-border rounded-xl px-2.5 py-2.5 text-muted-foreground font-semibold"
              >
                {MOCK_EVENTS.map(e => (
                  <option key={e.id} value={e.id}>{e.title}</option>
                ))}
              </select>
            </div>

            {scanning ? (
              <div className="w-full max-w-sm aspect-square bg-zinc-950 rounded-2xl overflow-hidden border border-border relative">
                <div id={qrContainerId} className="w-full h-full" />
                <div className="absolute inset-x-6 top-1/2 h-0.5 bg-blue-500/80 animate-bounce pointer-events-none" />
              </div>
            ) : (
              <div className="w-full max-w-sm aspect-square bg-zinc-100 dark:bg-zinc-900/60 rounded-2xl border border-border flex flex-col items-center justify-center space-y-4 p-8 text-center">
                <QrCode className="w-16 h-16 text-zinc-500/20" />
                <div>
                  <h3 className="font-bold text-sm">Camera Offline</h3>
                  <p className="text-xs text-zinc-500 leading-normal mt-1">
                    Press start to open the camera feed and capture QR tickets.
                  </p>
                </div>
              </div>
            )}

            {/* Scanner Controls */}
            <div className="flex gap-2.5 w-full max-w-sm">
              {scanning ? (
                <button
                  onClick={stopScanner}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl font-bold text-xs cursor-pointer"
                >
                  Stop Scanner
                </button>
              ) : (
                <button
                  onClick={startScanner}
                  className="w-full py-2.5 bg-primary hover:bg-blue-600 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Camera className="w-4 h-4" /> Open Camera Feed
                </button>
              )}

              <button
                onClick={toggleCamera}
                className="p-2.5 rounded-xl border border-border bg-background text-muted-foreground hover:bg-zinc-800 transition-colors cursor-pointer"
                title="Switch Camera Device"
              >
                <FlipHorizontal className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Continuous Mode Toggle */}
            <label className="flex items-center gap-2 text-xs font-semibold text-muted cursor-pointer">
              <input
                type="checkbox"
                checked={continuousMode}
                onChange={(e) => setContinuousMode(e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 border-border"
              />
              <span>Fast Continuous Scan Mode</span>
            </label>

          </div>

          {/* Outcome Status Card */}
          <div className="premium-card p-6 bg-card border-border/90 text-left">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 border-b border-border/60 pb-2 mb-4">
              Real-Time Scan Outcome
            </h3>

            {scanStatus === 'idle' && (
              <div className="py-6 text-center text-sm text-zinc-400 flex flex-col items-center gap-1.5">
                <Smartphone className="w-8 h-8 text-zinc-500/20" />
                <span>Camera ready. Feed a student QR ticket to verify.</span>
              </div>
            )}

            {scanStatus === 'processing' && (
              <div className="py-6 text-center text-sm text-zinc-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                <span>Checking records logs...</span>
              </div>
            )}

            {/* Success */}
            {scanStatus === 'success' && scannedStudent && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-24 bg-emerald-500/10 border border-emerald-500/20 flex gap-4 items-start"
              >
                <div className="p-3 bg-emerald-500 text-white rounded-2xl">
                  <CheckCircle2 className="w-6 h-6 animate-pulse" />
                </div>
                <div className="space-y-1 flex-1 text-left">
                  <div className="font-bold text-emerald-500 text-sm">Checked In Successfully!</div>
                  <h4 className="font-extrabold text-lg text-foreground mt-1">{scannedStudent.name}</h4>
                  <p className="text-xs text-zinc-400 font-mono">PRN: {scannedStudent.prn} | {scannedStudent.department}</p>
                </div>
              </motion.div>
            )}

            {/* Duplicate */}
            {scanStatus === 'duplicate' && scannedStudent && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-24 bg-amber-500/10 border border-amber-500/20 flex gap-4 items-start"
              >
                <div className="p-3 bg-amber-500 text-white rounded-2xl">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1 text-left">
                  <div className="font-bold text-amber-500 text-sm">{statusMessage}</div>
                  <h4 className="font-bold text-base text-foreground mt-1">{scannedStudent.name}</h4>
                  <p className="text-xs text-zinc-400 font-mono">PRN: {scannedStudent.prn}</p>
                </div>
              </motion.div>
            )}

            {/* Queued Offline */}
            {scanStatus === 'queued' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-24 bg-blue-500/10 border border-blue-500/20 flex gap-4 items-start"
              >
                <div className="p-3 bg-blue-500 text-white rounded-2xl">
                  <Clock className="w-6 h-6" />
                </div>
                <div className="space-y-1 flex-1 text-left">
                  <div className="font-bold text-blue-500 text-sm">Ticket Queued Offline</div>
                  <p className="text-xs text-zinc-500 mt-1">{statusMessage}</p>
                </div>
              </motion.div>
            )}

            {/* Invalid */}
            {scanStatus === 'invalid' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-5 rounded-24 bg-red-100/10 border border-red-500/20 flex gap-4 items-start"
              >
                <div className="p-3 bg-red-500 text-white rounded-2xl">
                  <XCircle className="w-6 h-6" />
                </div>
                <div className="space-y-1 text-left flex-1">
                  <div className="font-bold text-red-500 text-sm">Scan Error</div>
                  <p className="text-xs text-zinc-500 leading-normal mt-1">{statusMessage}</p>
                </div>
              </motion.div>
            )}

          </div>

        </div>

        {/* Right Column: Manual Lookup, History Logs & Analytics */}
        <div className="space-y-6">
          
          {/* Real-time Analytics metrics */}
          <div className="premium-card p-5 bg-card border-border/80 text-left space-y-3.5">
            <h3 className="font-bold text-sm">Scan Session Metrics</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-2 bg-emerald-500/10 rounded-xl">
                <div className="text-lg font-extrabold text-emerald-500">{totalCheckedIn}</div>
                <span className="text-[9px] text-zinc-400">Attended</span>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-xl">
                <div className="text-lg font-extrabold text-amber-500">{totalDuplicates}</div>
                <span className="text-[9px] text-zinc-400">Duplicates</span>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <div className="text-lg font-extrabold text-blue-500">{totalQueue}</div>
                <span className="text-[9px] text-zinc-400">Queued</span>
              </div>
            </div>
          </div>

          {/* Manual Input Search Lookup */}
          <div className="premium-card p-5 bg-card border-border/80 text-left space-y-3.5">
            <div>
              <h3 className="font-bold text-sm">Manual Pass Lookup</h3>
              <p className="text-[10px] text-zinc-500">Search by ticket ID, name, or student PRN</p>
            </div>
            
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                value={ticketQuery}
                onChange={(e) => setTicketQuery(e.target.value)}
                placeholder="e.g. CC-TEC-X9A21"
                className="w-full bg-background border border-border rounded-xl px-3 py-2 text-xs shadow-sm focus:outline-none text-foreground"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-primary hover:bg-blue-600 text-white transition-colors cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* Live Attendance Timeline Log */}
          <div className="premium-card p-5 bg-card border-border/80 text-left space-y-4">
            <h3 className="font-bold text-sm flex items-center gap-1.5">
              <History className="w-4.5 h-4.5 text-zinc-400" />
              <span>Live Attendance Timeline</span>
            </h3>

            <div className="space-y-2.5 max-h-72 overflow-y-auto">
              {scanHistory.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-500">No scanned entries.</div>
              ) : (
                scanHistory.map((h) => (
                  <div key={h.id} className="p-2.5 bg-zinc-50 dark:bg-zinc-900/50 rounded-xl border border-border/40 text-[11px] flex justify-between items-center gap-2.5">
                    <div className="text-left min-w-0">
                      <div className="font-bold truncate text-foreground">{h.studentName}</div>
                      <p className="text-[9px] text-zinc-400 truncate font-mono">Tkt: {h.ticketId} | PRN: {h.prn}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold uppercase ${
                        h.status === 'success'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : h.status === 'duplicate'
                          ? 'bg-amber-500/10 text-amber-500'
                          : h.status === 'queued'
                          ? 'bg-blue-500/10 text-blue-500'
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        {h.status}
                      </span>
                      <span className="block text-[8px] text-zinc-500 mt-1 font-mono">{h.time}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
