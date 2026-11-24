import { useEffect, useRef, useState } from 'react';
import { Plus, X } from 'lucide-react';

const STORAGE_KEY = 'peak-guest-demo-group-members-v1';
const emptyForm = { passportName: '', legalName: '', birthDate: '', nationality: '', phone: '', email: '' };
const sampleMembers = [
  { id: 'sample-member-1', firstName: 'cs', lastName: 'cs', birthDate: '2026-11-12' },
  { id: 'sample-member-2', firstName: '1', lastName: '1', birthDate: '2019-11-11' },
];

function readMembers() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    return Array.isArray(saved) ? saved : sampleMembers;
  } catch {
    return sampleMembers;
  }
}

function displayDate(value) {
  if (!value) return 'Birthdate not added';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export default function ManageGroup() {
  const [members, setMembers] = useState(readMembers);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const signatureCanvasRef = useRef(null);
  const [signatureStarted, setSignatureStarted] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(members));
  }, [members]);

  const addMember = (event) => {
    event.preventDefault();
    setMembers((current) => [...current, { ...form, id: `group-member-${Date.now()}` }]);
    setForm(emptyForm);
    setSignatureStarted(false);
    setTermsAccepted(false);
    setFormOpen(false);
  };

  const startSignature = (event) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(rect.width * scale) || canvas.height !== Math.round(rect.height * scale)) {
      canvas.width = Math.round(rect.width * scale);
      canvas.height = Math.round(rect.height * scale);
    }
    const context = canvas.getContext('2d');
    context.setTransform(scale, 0, 0, scale, 0, 0);
    context.strokeStyle = '#344a64';
    context.lineWidth = 2.2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    context.beginPath();
    context.moveTo(event.clientX - rect.left, event.clientY - rect.top);
    canvas.setPointerCapture(event.pointerId);
    setSignatureStarted(true);
  };

  const continueSignature = (event) => {
    const canvas = event.currentTarget;
    if (!canvas.hasPointerCapture(event.pointerId)) return;
    const rect = canvas.getBoundingClientRect();
    const context = canvas.getContext('2d');
    context.lineTo(event.clientX - rect.left, event.clientY - rect.top);
    context.stroke();
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      context.setTransform(1, 0, 0, 1, 0, 0);
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
    setSignatureStarted(false);
  };

  return <main className="space-y-3 px-4 pb-8 pt-5 sm:px-8">
    <section className="rounded-[22px] border border-[#d7e1ec] bg-white p-4">
      <header className="mb-2 flex items-center justify-between gap-3"><h2 className="text-[14px] font-semibold text-[#17334f]">Group members</h2><span className="text-[11px] text-[#718096]">{members.length} {members.length === 1 ? 'member' : 'members'}</span></header>
      <div>{members.map((member, index) => {
        const name = member.legalName || `${member.firstName || ''} ${member.lastName || ''}`.trim() || member.passportName || 'Group member';
        const initials = name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
        return <article key={member.id} className={`flex items-center gap-3 py-3 ${index < members.length - 1 ? 'border-b border-[#e1e8f0]' : ''}`}>
          <span className={`flex h-[54px] w-[54px] shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white ${index % 2 === 0 ? 'bg-[#4e6790]' : 'bg-[#4e9ec2]'}`}>{initials}</span>
          <div className="min-w-0"><b className="block text-[12px] text-[#17334f]">{name}</b><p className="mt-1 text-[11px] text-[#718096]">Birthdate: {displayDate(member.birthDate)}</p></div>
        </article>;
      })}</div>
      {formOpen ? <form onSubmit={addMember} className="mt-3 space-y-3 rounded-[16px] bg-[#f5f8fb] p-3">
        <header className="flex items-center justify-between"><h3 className="text-[14px] font-semibold text-[#5b8199]">Add Group Member</h3><button type="button" aria-label="Close add member form" onClick={() => { setFormOpen(false); setForm(emptyForm); setSignatureStarted(false); setTermsAccepted(false); }} className="p-1 text-[#60738d]"><X className="h-4 w-4"/></button></header>
        <label className="block text-[10px] font-medium uppercase tracking-wide text-[#5b8199]">Passport name (pinyin) *<input required autoComplete="off" placeholder="e.g. CHEN WEI" value={form.passportName} onChange={(event) => setForm((current) => ({ ...current, passportName: event.target.value }))} className="mt-1 h-11 w-full rounded-[12px] border border-[#cbd4de] bg-white px-3 text-[12px] normal-case tracking-normal text-[#344a64] placeholder:text-[#9aa5b5]"/></label>
        <label className="block text-[10px] font-medium uppercase tracking-wide text-[#5b8199]">Characters (Passport name) *<input required autoComplete="name" placeholder="e.g. Wei Chen" value={form.legalName} onChange={(event) => setForm((current) => ({ ...current, legalName: event.target.value }))} className="mt-1 h-11 w-full rounded-[12px] border border-[#cbd4de] bg-white px-3 text-[12px] normal-case tracking-normal text-[#344a64] placeholder:text-[#9aa5b5]"/></label>
        <div className="grid grid-cols-2 gap-2"><label className="min-w-0 text-[10px] font-medium uppercase tracking-wide text-[#5b8199]">Date of birth *<input required type="date" value={form.birthDate} onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))} className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-[#cbd4de] bg-white px-2 text-[11px] normal-case tracking-normal text-[#344a64]"/></label><label className="min-w-0 text-[10px] font-medium uppercase tracking-wide text-[#5b8199]">Nationality *<select required value={form.nationality} onChange={(event) => setForm((current) => ({ ...current, nationality: event.target.value }))} className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-[#cbd4de] bg-white px-2 text-[11px] normal-case tracking-normal text-[#344a64]"><option value="">Select</option>{['New Zealand', 'China', 'Australia', 'United States', 'United Kingdom', 'Canada', 'Other'].map((country) => <option key={country}>{country}</option>)}</select></label></div>
        <div className="grid grid-cols-2 gap-2"><label className="min-w-0 text-[10px] font-medium uppercase tracking-wide text-[#5b8199]">Phone *<input required type="tel" autoComplete="tel" placeholder="+64 ..." value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-[#cbd4de] bg-white px-3 text-[12px] normal-case tracking-normal text-[#344a64] placeholder:text-[#9aa5b5]"/></label><label className="min-w-0 text-[10px] font-medium uppercase tracking-wide text-[#5b8199]">Email *<input required type="email" autoComplete="email" placeholder="For your e-ticket" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} className="mt-1 h-11 w-full min-w-0 rounded-[12px] border border-[#cbd4de] bg-white px-3 text-[12px] normal-case tracking-normal text-[#344a64] placeholder:text-[#9aa5b5]"/></label></div>
        <div className="relative flex min-h-[96px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#cbd7e4] bg-[#fbfcfe] px-4 py-3 text-center text-[11px] text-[#718096]">
          <canvas ref={signatureCanvasRef} aria-label="Draw your signature here" className="absolute inset-0 h-full w-full cursor-crosshair" style={{ touchAction: 'none' }} onPointerDown={startSignature} onPointerMove={continueSignature}/>
          {!signatureStarted && <div className="pointer-events-none relative"><span className="block">Sign here</span><span className="mt-2 block text-[10px]">Signature demonstration area</span></div>}
          {signatureStarted && <button type="button" onClick={clearSignature} className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2 py-1 text-[9px] font-medium text-[#5b8199] shadow-sm">Clear</button>}
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-5 text-[#60738d]"><input required type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#5b8199]"/><span>I have read and agree to the terms that apply to the products in my order.</span></label>
        <p className="text-[10px] leading-4 text-[#718096]">Demo profile only. Details stay in this browser and are not sent.</p>
        <div className="flex gap-2"><button type="submit" className="h-10 rounded-[11px] bg-[#5b8199] px-4 text-[11px] font-semibold uppercase text-white">Add member</button><button type="button" onClick={() => { setFormOpen(false); setForm(emptyForm); setSignatureStarted(false); setTermsAccepted(false); }} className="h-10 rounded-[11px] border border-[#aeb8c2] bg-white px-4 text-[11px] uppercase">Cancel</button></div>
      </form> : <button type="button" onClick={() => { setSignatureStarted(false); setFormOpen(true); }} className="mt-3 inline-flex h-10 items-center gap-1.5 rounded-[11px] bg-[#5b8199] px-3.5 text-[11px] font-semibold text-white"><Plus className="h-3.5 w-3.5"/>Add member</button>}
    </section>
  </main>;
}
