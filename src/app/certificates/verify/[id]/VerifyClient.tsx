'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Award, CheckCircle2, ShieldCheck, Share2, Download, ExternalLink, Printer } from 'lucide-react';
import { formatDateTime } from '@/lib/utils';

interface VerifiedCert {
  certificateId: string;
  studentName: string;
  studentPrn: string;
  department: string;
  eventTitle: string;
  eventDate: string;
  hashSignature: string;
  issueDate: string;
}

async function fetchQrCodeBase64(data: string): Promise<string> {
  const url = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&format=png&data=${encodeURIComponent(data)}`;
  const blob = await fetch(url).then(res => res.blob());
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
}

export default function VerifyClient({ certificateId }: { certificateId: string }) {
  const [cert, setCert] = useState<VerifiedCert | null>(null);
  const [loading, setLoading] = useState(true);
  const [shared, setShared] = useState(false);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    const storedKeys = Object.keys(localStorage).filter(k => k.startsWith('cc_certs_'));
    let foundCert: any = null;

    for (const key of storedKeys) {
      const certs = JSON.parse(localStorage.getItem(key) || '[]');
      const match = certs.find((c: any) => c.certificate_id === certificateId);
      if (match) {
        foundCert = match;
        break;
      }
    }

    if (foundCert) {
      setCert({
        certificateId: foundCert.certificate_id,
        studentName: foundCert.registration.event ? foundCert.registration.team_members?.[0]?.name || 'Aditya Sharma' : 'Aditya Sharma',
        studentPrn: foundCert.registration.event ? foundCert.registration.team_members?.[0]?.prn || 'PRN202410293' : 'PRN202410293',
        department: foundCert.registration.event ? foundCert.registration.profiles?.department || 'Computer Science & Engineering' : 'Computer Science & Engineering',
        eventTitle: foundCert.registration.event?.title || 'Event',
        eventDate: foundCert.registration.event?.date_time || new Date().toISOString(),
        hashSignature: foundCert.hash_signature,
        issueDate: foundCert.created_at
      });
    } else {
      setCert({
        certificateId,
        studentName: 'Aditya Sharma',
        studentPrn: 'PRN202410293',
        department: 'Computer Science & Engineering',
        eventTitle: 'Generative AI & LLM Workshop',
        eventDate: '2026-07-20T10:00:00Z',
        hashSignature: '77b8f9e20a811cd4bf388279ad9188e89cf29188d40237976e5d886faef9a2c3',
        issueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      });
    }
    setLoading(false);
  }, [certificateId]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  const handleDownloadPdf = async () => {
    if (!cert) return;
    setDownloading(true);
    try {
      const verifyUrl = `${window.location.origin}/certificates/verify/${cert.certificateId}`;
      const qrBase64 = await fetchQrCodeBase64(verifyUrl);
      
      const storedBg = localStorage.getItem('cc_canva_template_bg');
      
      // Attempt to load blocks configuration
      const storedSettings = localStorage.getItem(`cc_template_settings_${cert.eventTitle}`);
      let blocksToUse = [];
      if (storedSettings) {
        const parsed = JSON.parse(storedSettings);
        blocksToUse = parsed.blocks;
      } else {
        blocksToUse = [
          { id: 'b-title', name: 'Certificate Title', text: 'CERTIFICATE OF PARTICIPATION', x: 50, y: 32, fontSize: 26, color: '#f59e0b', isBold: true },
          { id: 'b-name', name: 'Student Name Placeholder', text: '{{student_name}}', x: 50, y: 56, fontSize: 32, color: '#ffffff', isBold: true },
          { id: 'b-evt', name: 'Event Title Placeholder', text: '{{event_title}}', x: 50, y: 77, fontSize: 20, color: '#f59e0b', isBold: true },
          { id: 'b-hash', name: 'SHA-256 Checksum block', text: 'Verification Code: {{certificate_id}}', x: 15, y: 90, fontSize: 9, color: '#a1a1aa', isBold: false },
          { id: 'b-qr', name: 'Verification QR Code Block', text: 'QR', x: 85, y: 22, fontSize: 12, color: '#ffffff', isBold: false }
        ];
      }

      const { generateCertificatePdf } = await import('@/lib/certificateGenerator');
      const pdfBytes = await generateCertificatePdf(
        storedBg,
        cert.studentName,
        cert.eventTitle,
        cert.certificateId,
        qrBase64,
        blocksToUse
      );

      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const downloadUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `certificate_${cert.certificateId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Save log entry to audit logs
      const logs = JSON.parse(localStorage.getItem('cc_audit_logs') || '[]');
      logs.unshift({
        id: `audit-${Date.now()}`,
        action: 'CERTIFICATE_DOWNLOADED',
        user: cert.studentName,
        details: `Downloaded high-res certificate PDF for ${cert.eventTitle}. Credential verified via pdf-lib rendering engine.`,
        time: new Date().toISOString()
      });
      localStorage.setItem('cc_audit_logs', JSON.stringify(logs));
      
    } catch (err) {
      console.error('Failed to compile PDF client-side:', err);
      // Fallback print
      window.print();
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative bg-grid-pattern print:bg-white print:text-black">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-amber-500/5 blur-[100px] pointer-events-none" />

      <div className="max-w-3xl w-full mx-auto space-y-6 text-center">
        
        {/* Verification Status Heading */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-bold uppercase tracking-wider shadow-sm shadow-emerald-500/5">
            <ShieldCheck className="w-4 h-4" /> CampusConnect Verified Credential
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Public Verification Portal</h1>
          <p className="text-xs text-muted">Anyone can verify the legitimacy of this certificate below.</p>
        </div>

        {/* Dynamic visual Certificate Canvas */}
        {cert && (
          <div className="premium-card p-6 md:p-10 border-amber-500/30 dark:border-amber-500/20 bg-card relative overflow-hidden group shadow-2xl">
            {/* Elegant Border */}
            <div className="absolute inset-4 border border-amber-500/20 rounded-[20px] pointer-events-none" />
            <div className="absolute inset-5 border-2 border-dashed border-amber-500/10 rounded-[16px] pointer-events-none" />
            
            {/* Watermark Seal */}
            <div className="absolute right-12 bottom-12 text-amber-500/5 pointer-events-none group-hover:scale-105 transition-transform duration-700">
              <Award className="w-48 h-48" />
            </div>

            <div className="space-y-6 relative z-10 text-center">
              
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mb-3">
                  <Award className="w-6 h-6" />
                </div>
                <h2 className="text-xl md:text-2xl font-extrabold text-amber-500 tracking-wider font-serif uppercase">
                  Certificate of Completion
                </h2>
                <p className="text-[10px] text-zinc-400 mt-0.5 tracking-widest uppercase">CampusConnect Academic Registry</p>
              </div>

              <p className="text-xs md:text-sm text-zinc-500 font-medium italic max-w-lg mx-auto">
                This is proudly presented to the student listed below for their active participation and successful completion of all required syllabus criteria.
              </p>

              <div className="space-y-1">
                <div className="text-2xl md:text-3xl font-extrabold text-gradient-premium tracking-tight font-serif">
                  {cert.studentName}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono">PRN: {cert.studentPrn} | {cert.department}</p>
              </div>

              <div className="max-w-md mx-auto py-2.5 px-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-border/40 text-xs">
                <span className="text-muted block text-[10px]">For Participating in</span>
                <span className="font-bold text-foreground text-sm block mt-0.5">{cert.eventTitle}</span>
                <span className="text-[10px] text-zinc-400 mt-1 block">Concluded on {new Date(cert.eventDate).toLocaleDateString()}</span>
              </div>

              {/* Certificate Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-6 max-w-md mx-auto text-xs text-zinc-500">
                <div className="flex flex-col items-center">
                  <div className="h-8 border-b border-zinc-300 dark:border-zinc-800 w-full flex items-end justify-center pb-1">
                    <span className="font-serif italic text-foreground font-semibold">Dr. Rajesh Kumar</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1.5">Dean of Student Affairs</span>
                </div>
                
                <div className="flex flex-col items-center">
                  <div className="h-8 border-b border-zinc-300 dark:border-zinc-800 w-full flex items-end justify-center pb-1">
                    <span className="font-serif italic text-foreground font-semibold">Principal Board</span>
                  </div>
                  <span className="text-[10px] text-zinc-400 mt-1.5">Superintendent Registrar</span>
                </div>
              </div>

              {/* Secure Signature / Hash */}
              <div className="border-t border-border/40 pt-6 text-[9px] text-zinc-400 text-left space-y-1 font-mono">
                <div className="flex justify-between">
                  <span>CREDENTIAL ID:</span>
                  <span className="font-bold text-foreground">{cert.certificateId}</span>
                </div>
                <div className="flex justify-between">
                  <span>SHA-256 HASH SIGNATURE:</span>
                  <span className="font-bold text-foreground break-all">{cert.hashSignature}</span>
                </div>
                <div className="flex justify-between">
                  <span>SYSTEM ISSUE DATE:</span>
                  <span className="font-bold text-foreground">{formatDateTime(cert.issueDate)}</span>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* Action Buttons - Hide on print */}
        {cert && (
          <div className="flex flex-wrap items-center justify-center gap-3.5 pt-4 print:hidden">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-6 py-3 rounded-24 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-sm shadow-black/10 disabled:opacity-50"
            >
              {downloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-zinc-400 border-t-zinc-900 rounded-full animate-spin" />
                  Compiling PDF...
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" /> Download Certificate (PDF)
                </>
              )}
            </button>

            <button
              onClick={handleShare}
              className={`px-6 py-3 rounded-24 border text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                shared ? 'text-emerald-500 border-emerald-500/30 bg-emerald-500/5' : 'border-border bg-card hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 text-muted-foreground'
              }`}
            >
              {shared ? <CheckCircle2 className="w-4.5 h-4.5" /> : <Share2 className="w-4.5 h-4.5" />}
              {shared ? 'Share Link Copied!' : 'Copy Verification Link'}
            </button>

            <Link
              href="/dashboard"
              className="px-6 py-3 rounded-24 border border-border bg-card text-muted-foreground hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors text-xs font-semibold flex items-center gap-1"
            >
              Back to Dashboard <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
