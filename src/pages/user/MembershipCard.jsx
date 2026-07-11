// Membership Card Page — TNSA card front/back using official template
import React, { useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Printer, QrCode, CreditCard } from 'lucide-react';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import AppLayout from '@/layouts/AppLayout';
import { GoldButton } from '@/components/ui';
import { formatDate, maskAadhaar } from '@/utils/helpers';
import { VALID_TILL_YEAR } from '@/constants/app';
import LoadingScreen from '@/components/ui/LoadingScreen';

// Card dimensions — matched to template image aspect ratio (840 × 1340 → 340 × 543)
const W = 340;
const H = 543;

// Normal sans-serif font — numbers render at consistent size
const CARD_FONT = 'Arial, "Helvetica Neue", Helvetica, sans-serif';

// ── Card Front ────────────────────────────────────────────────────────────
export const CardFront = React.forwardRef(({ member, scale = 1 }, ref) => {
  const currentW = W * scale;
  const currentH = H * scale;

  const isDownload = scale > 1.5;

  // Photo configurations - separated for view vs download
  const PHOTO_WIDTH = isDownload ? 129.5 * scale : 129.5;
  const PHOTO_HEIGHT = isDownload ? 125.5 * scale : 125.5;
  const PHOTO_TOP = isDownload ? 200 * scale : 200; // Exact top pixel of the photo circle
  const PHOTO_LEFT = Math.round((currentW - PHOTO_WIDTH) / 2);

  // Individual coordinates for each front field - separated for view vs download
  const fields = isDownload ? [
    // ⬇️ DOWNLOAD SIZES (Fine-tune high-res download coordinates here)
    { label: 'Name', value: member?.name, top: 324 * scale, left: 150 * scale },
    { label: 'Membership ID', value: member?.membershipId, top: 344 * scale, left: 150 * scale },
    { label: 'District', value: member?.district, top: 367 * scale, left: 150 * scale },
    { label: 'Date Of Birth', value: member?.dob ? formatDate(member.dob) : '—', top: 391 * scale, left: 150 * scale },
    { label: 'Gender', value: member?.gender, top: 415 * scale, left: 150 * scale },
    { label: 'Aadhar', value: maskAadhaar(member?.aadhaar), top: 439 * scale, left: 150 * scale },
    { label: 'Category', value: member?.category, top: 464 * scale, left: 150 * scale },
  ] : [
    // 👁️ VIEW SIZES (Fine-tune on-screen view coordinates here)
    { label: 'Name', value: member?.name, top: 331, left: 150 },
    { label: 'Membership ID', value: member?.membershipId, top: 351, left: 150 },
    { label: 'District', value: member?.district, top: 375, left: 150 },
    { label: 'Date Of Birth', value: member?.dob ? formatDate(member.dob) : '—', top: 398, left: 150 },
    { label: 'Gender', value: member?.gender, top: 422, left: 150 },
    { label: 'Aadhar', value: maskAadhaar(member?.aadhaar), top: 446, left: 150 },
    { label: 'Category', value: member?.category, top: 471, left: 150 },
  ];

  return (
    <div
      ref={ref}
      style={{
        width: `${currentW}px`,
        height: `${currentH}px`,
        position: 'relative',
        flexShrink: 0,
        borderRadius: `${12 * scale}px`,
        overflow: 'hidden',
        fontFamily: CARD_FONT,
      }}
    >
      {/* Official template as background */}
      <img
        src="/card-front.png"
        alt=""
        crossOrigin="anonymous"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'fill',
        }}
      />

      {/* Member photo — fills the gold circle in the template */}
      <div style={{
        position: 'absolute',
        top: `${PHOTO_TOP}px`,
        left: `${PHOTO_LEFT}px`,
        width: `${PHOTO_WIDTH}px`,
        height: `${PHOTO_HEIGHT}px`,
        borderRadius: '50%',
        overflow: 'hidden',
        background: 'rgba(0,0,0,0.25)',
      }}>
        {member?.photoURL ? (
          <img
            src={member.photoURL}
            alt="Member"
            crossOrigin="anonymous"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: '100%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'rgba(212,175,55,0.15)',
            color: '#D4AF37', fontSize: `${36 * scale}px`,
            fontStyle: 'normal', fontFamily: CARD_FONT,
            fontWeight: 'bold',
          }}>
            {member?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
      </div>

      {/* Field values — overlaid on the pre-printed label rows */}
      {fields.map((f, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${f.top}px`,
            left: `${f.left}px`,
            right: `${10 * scale}px`,
            height: `${24 * scale}px`,
            display: 'flex',
            alignItems: 'center',
            color: '#ffffff',
            fontSize: `${11 * scale}px`,
            fontStyle: 'normal',
            fontFamily: CARD_FONT,
            fontWeight: 'bold',
            letterSpacing: `${0.2 * scale}px`,
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
          }}
        >
          {f.value || '—'}
        </div>
      ))}
    </div>
  );
});
CardFront.displayName = 'CardFront';

// ── Card Back ─────────────────────────────────────────────────────────────
export const CardBack = React.forwardRef(({ member, scale = 1 }, ref) => {
  const currentW = W * scale;
  const currentH = H * scale;

  const isDownload = scale > 1.5;

  // Individual coordinates for each back field - separated for view vs download
  const fields = isDownload ? [
    // ⬇️ DOWNLOAD SIZES (Fine-tune high-res download coordinates here)
    { label: 'Father Name', value: member?.fatherName, top: 146.56 * scale, left: 146 * scale, height: 24 * scale, multiline: false },
    { label: 'Club Name', value: member?.clubName, top: 173.5 * scale, left: 146 * scale, height: 24 * scale, multiline: false },
    { label: 'Position in TNSA', value: member?.position, top: 199 * scale, left: 146 * scale, height: 24 * scale, multiline: false },
    { label: 'Contact Number', value: member?.mobile, top: 226 * scale, left: 146 * scale, height: 24 * scale, multiline: false },
    { label: 'Address', value: member?.address, top: 248 * scale, left: 146 * scale, height: 44 * scale, multiline: true },
  ] : [
    // 👁️ VIEW SIZES (Fine-tune on-screen view coordinates here)
    { label: 'Father Name', value: member?.fatherName, top: 152.56, left: 146, height: 24, multiline: false },
    { label: 'Club Name', value: member?.clubName, top: 178.5, left: 146, height: 24, multiline: false },
    { label: 'Position in TNSA', value: member?.position, top: 204, left: 146, height: 24, multiline: false },
    { label: 'Contact Number', value: member?.mobile, top: 232, left: 146, height: 24, multiline: false },
    { label: 'Address', value: member?.address, top: 254, left: 146, height: 44, multiline: true },
  ];

  return (
    <div
      ref={ref}
      style={{
        width: `${currentW}px`,
        height: `${currentH}px`,
        position: 'relative',
        flexShrink: 0,
        borderRadius: `${12 * scale}px`,
        overflow: 'hidden',
        fontFamily: CARD_FONT,
      }}
    >
      {/* Official template as background */}
      <img
        src="/card-back.png"
        alt=""
        crossOrigin="anonymous"
        style={{
          position: 'absolute', inset: 0,
          width: '100%', height: '100%',
          objectFit: 'fill',
        }}
      />

      {/* Field values */}
      {fields.map((f, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: `${f.top}px`,
            left: `${f.left}px`,
            right: `${14 * scale}px`,
            height: `${f.height}px`,
            display: 'flex',
            alignItems: f.multiline ? 'flex-start' : 'center',
            paddingTop: f.multiline ? `${4 * scale}px` : '0px',
            color: '#ffffff',
            fontSize: `${11 * scale}px`,
            fontStyle: 'normal',
            fontFamily: CARD_FONT,
            fontWeight: 'bold',
            letterSpacing: `${0.2 * scale}px`,
            lineHeight: '1.35',
            wordBreak: 'break-word',
            overflowWrap: 'break-word',
          }}
        >
          {f.value || '—'}
        </div>
      ))}
    </div>
  );
});
CardBack.displayName = 'CardBack';

// ── Main Page ─────────────────────────────────────────────────────────────
const MembershipCard = () => {
  const { userData, loading } = useAuth();
  const [showFront, setShowFront] = useState(true);
  const [downloading, setDownloading] = useState(false);

  const frontDownloadRef = useRef(null);
  const backDownloadRef = useRef(null);

  // The template resolution is 840 x 1340. The scale factor from screen (340x543) is 840 / 340 = 2.470588
  const DOWNLOAD_SCALE = 2.470588;

  const captureCard = useCallback(async (ref) => {
    if (!ref.current) return null;
    return html2canvas(ref.current, {
      scale: 1, // Already scaled to 840x1340 in markup
      backgroundColor: null,
      useCORS: true,
      allowTaint: false,
      logging: false,
    });
  }, []);

  const downloadCard = useCallback(async (side = 'front') => {
    const ref = side === 'front' ? frontDownloadRef : backDownloadRef;
    setDownloading(true);
    try {
      const canvas = await captureCard(ref);
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `TNSA-${userData?.membershipId || 'Card'}-${side}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast.success(`${side === 'front' ? 'Front' : 'Back'} downloaded!`);
    } catch (e) {
      console.error(e);
      toast.error('Download failed. Try again.');
    } finally {
      setDownloading(false);
    }
  }, [userData, captureCard]);

  const printCard = useCallback(async () => {
    setDownloading(true);
    try {
      const [fc, bc] = await Promise.all([
        captureCard(frontDownloadRef),
        captureCard(backDownloadRef),
      ]);
      const win = window.open('', '_blank');
      win.document.write(`
        <html><head><title>TNSA Membership Card — ${userData?.membershipId}</title>
        <style>
          * { margin:0; padding:0; box-sizing:border-box; }
          body { background:#f0f0f0; display:flex; flex-direction:column;
                 align-items:center; gap:20px; padding:20px; }
          img { display:block; border-radius:12px; width:320px;
                box-shadow:0 4px 20px rgba(0,0,0,0.3); }
          p { font-family:sans-serif; font-size:11px; color:#888;
              text-align:center; margin-top:-12px; }
          @media print { body { background:white; padding:8px; gap:12px; }
                          img { width:280px; } }
        </style></head><body>
        <img src="${fc.toDataURL('image/png')}" />
        <p>Front Side</p>
        <img src="${bc.toDataURL('image/png')}" />
        <p>Back Side</p>
        <script>window.onload=()=>{window.print();setTimeout(()=>window.close(),1000);}</script>
        </body></html>
      `);
      win.document.close();
    } catch {
      toast.error('Print failed');
    } finally {
      setDownloading(false);
    }
  }, [userData, captureCard]);

  if (loading) {
    return <LoadingScreen message="Verifying membership card..." />;
  }

  if (userData?.status !== 'active') {
    return (
      <AppLayout title="Membership Card" showBack>
        <div className="flex flex-col items-center justify-center text-center p-6 space-y-5 min-h-[50vh] animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center text-amber-500">
            <CreditCard size={32} className="opacity-70" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Card Locked</h2>
            <p className="text-sm text-white/50 mt-2 max-w-xs mx-auto leading-relaxed">
              Your TNSA membership is currently pending admin approval. You will be able to view and download your ID card once approved.
            </p>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout title="Membership Card" showBack>
      <div className="space-y-5 pb-4">

        {/* Front / Back toggle */}
        <div
          className="flex items-center justify-center gap-1 p-1 rounded-xl"
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {['Front', 'Back'].map((side) => (
            <button
              key={side}
              onClick={() => setShowFront(side === 'Front')}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${(side === 'Front') === showFront
                ? 'bg-gold-gradient text-dark-900'
                : 'text-white/50'
                }`}
            >
              {side}
            </button>
          ))}
        </div>

        {/* Animated card display */}
        <div className="flex justify-center overflow-x-auto py-2">
          <AnimatePresence mode="wait">
            {showFront ? (
              <motion.div
                key="front"
                initial={{ rotateY: 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardFront member={userData} scale={1} />
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ rotateY: -90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: 90, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <CardBack member={userData} scale={1} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Hidden cards for download/print */}
        <div style={{ position: 'fixed', left: '-9999px', top: 0, pointerEvents: 'none', zIndex: -1 }}>
          <CardFront ref={frontDownloadRef} member={userData} scale={DOWNLOAD_SCALE} />
          <CardBack ref={backDownloadRef} member={userData} scale={DOWNLOAD_SCALE} />
        </div>

        {/* Info pill */}
        <div className="glass-card-gold p-3 text-xs text-white/50 text-center">
          Membership ID:{' '}
          <span className="text-gold font-bold">{userData?.membershipId || '—'}</span>
          &nbsp;•&nbsp; Valid Till:{' '}
          <span className="text-white/70">{VALID_TILL_YEAR}</span>
        </div>

        {/* Actions */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <GoldButton fullWidth onClick={() => downloadCard('front')} loading={downloading}
              icon={<Download size={15} />} size="sm">Download Front</GoldButton>
            <GoldButton fullWidth variant="ghost" onClick={() => downloadCard('back')} loading={downloading}
              icon={<Download size={15} />} size="sm">Download Back</GoldButton>
          </div>
          <GoldButton fullWidth variant="ghost" onClick={printCard} loading={downloading}
            icon={<Printer size={15} />}>Print Both Sides</GoldButton>
        </div>

        {/* QR info note */}
        <div className="glass-card p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
            <QrCode size={18} className="text-gold" />
          </div>
          <div>
            <p className="text-sm font-medium text-white">Official ID Card</p>
            <p className="text-xs text-white/50 mt-0.5">
              Download and print both sides for your physical membership card
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default MembershipCard;
