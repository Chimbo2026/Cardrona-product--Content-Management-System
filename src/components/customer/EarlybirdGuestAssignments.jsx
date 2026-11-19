import { useEffect, useMemo, useRef, useState } from 'react';
import { Camera, Check, ChevronDown, Pencil, Plus, Trash2, X } from 'lucide-react';

const PERSON_ASSIGNABLE_PRODUCT_IDS = new Set([
  'earlybird-multi-day-pass',
  'earlybird-summer',
  'summer-day-passes',
  'lift-bike-package',
  'bike-rental',
  'peak-to-pub',
  'summer-carting',
  'summer-sightseeing-pass',
  'winter-season-pass',
]);

const isPersonAssignable = (item) => Boolean(item.ageBand) || PERSON_ASSIGNABLE_PRODUCT_IDS.has(item.id);

function expandPasses(items) {
  return items.filter(isPersonAssignable)
    .flatMap((item) => Array.from({ length: item.quantity }, (_, index) => ({
      id: `${item.key}-${index + 1}`,
      name: item.name,
      ageBand: item.ageBand || '',
      detail: item.detail || '',
    })));
}

function initialGroup(passes) {
  let savedMembers = [];
  try {
    const stored = JSON.parse(localStorage.getItem('peak-guest-demo-group-members-v1') || '[]');
    if (Array.isArray(stored)) savedMembers = stored;
  } catch {
    savedMembers = [];
  }
  const members = savedMembers.map((member) => {
    const name = member.legalName || [member.firstName, member.lastName].filter(Boolean).join(' ') || member.name || '';
    const age = getAge(member.birthDate);
    const memberAgeType = member.ageType || (age === null ? '' : age >= 6 && age <= 17 ? 'Child' : age >= 65 && age <= 74 ? 'Senior' : age >= 18 && age <= 64 ? 'Adult' : 'Outside standard age bands');
    return { ...member, name, ageType: memberAgeType, hasCard: Boolean(member.hasCard) };
  });
  const assignments = Object.fromEntries(passes.map((pass) => [pass.id, '']));
  return { members, assignments };
}

function getAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return null;
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age -= 1;
  return age;
}

function displayDate(value) {
  if (!value) return 'Birth date to be confirmed';
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
}

export default function EarlybirdGuestAssignments({ items, hidden = false }) {
  const passes = useMemo(() => expandPasses(items), [items]);
  const passSignature = passes.map((pass) => `${pass.id}:${pass.ageBand}:${pass.name}`).join('|');
  const [group, setGroup] = useState(() => initialGroup(passes));
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [expandedPasses, setExpandedPasses] = useState({});
  const [form, setForm] = useState({ passportName: '', legalName: '', birthDate: '', nationality: '', phone: '', email: '' });
  const formRef = useRef(null);
  const signatureCanvasRef = useRef(null);
  const [signatureStarted, setSignatureStarted] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  useEffect(() => {
    setGroup(initialGroup(passes));
    setFormOpen(false);
    setEditingId(null);
    setSignatureStarted(false);
    setTermsAccepted(false);
  // The signature resets demo assignments only when the cart's Earlybird passes change.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passSignature]);

  const setAssignment = (passId, memberId) => setGroup((current) => ({
    ...current,
    assignments: { ...current.assignments, [passId]: memberId },
  }));

  const openAdd = () => {
    setEditingId(null);
    setForm({ passportName: '', legalName: '', birthDate: '', nationality: '', phone: '', email: '' });
    setSignatureStarted(false);
    setTermsAccepted(false);
    setFormOpen(true);
  };

  const openEdit = (member) => {
    setEditingId(member.id);
    setForm({
      passportName: member.passportName || member.name,
      legalName: member.legalName || member.name,
      birthDate: member.birthDate || '',
      nationality: member.nationality || '',
      phone: member.phone || '',
      email: member.email || '',
    });
    setSignatureStarted(false);
    setTermsAccepted(false);
    setFormOpen(true);
    window.requestAnimationFrame(() => formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }));
  };

  const togglePassDetails = (passId) => setExpandedPasses((current) => ({ ...current, [passId]: !current[passId] }));

  const saveMember = (event) => {
    event.preventDefault();
    const passportName = form.passportName.trim();
    const legalName = form.legalName.trim();
    const name = legalName;
    const checkDate = form.birthDate ? new Date(`${form.birthDate}T00:00:00`) : null;
    const validBirthDate = checkDate && !Number.isNaN(checkDate.getTime()) && checkDate <= new Date();
    if (!passportName || !legalName || !validBirthDate || !form.nationality || !form.phone.trim() || !form.email.trim()) return;
    const birthDate = form.birthDate;
    const age = getAge(birthDate);
    const derivedAgeType = age >= 6 && age <= 17 ? 'Child' : age >= 65 && age <= 74 ? 'Senior' : age >= 18 && age <= 64 ? 'Adult' : 'Outside standard age bands';
    if (editingId) {
      setGroup((current) => ({
        ...current,
        members: current.members.map((member) => member.id === editingId ? { ...member, name, passportName, legalName, birthDate, nationality: form.nationality, phone: form.phone.trim(), email: form.email.trim(), ageType: derivedAgeType } : member),
      }));
    } else {
      const id = `earlybird-guest-${Date.now()}`;
      setGroup((current) => ({ ...current, members: [...current.members, { id, name, passportName, legalName, birthDate, nationality: form.nationality, phone: form.phone.trim(), email: form.email.trim(), ageType: derivedAgeType, hasCard: false }] }));
    }
    setFormOpen(false);
    setEditingId(null);
    setSignatureStarted(false);
    setTermsAccepted(false);
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

  const removeMember = (memberId) => setGroup((current) => ({
    members: current.members.filter((member) => member.id !== memberId),
    assignments: Object.fromEntries(Object.entries(current.assignments).map(([passId, assignedId]) => [passId, assignedId === memberId ? '' : assignedId])),
  }));

  const handlePhoto = (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    const memberId = event.target.dataset.memberId;
    const previewUrl = URL.createObjectURL(file);
    setGroup((current) => ({ ...current, members: current.members.map((member) => member.id === memberId ? { ...member, photoUrl: previewUrl } : member) }));
  };

  const [groupVisible, setGroupVisible] = useState(true);

  return <section hidden={hidden || !passes.length} className="space-y-4" aria-label="Product assignments and group details">
    <section className="overflow-hidden rounded-[20px] border border-[#dce4ed] bg-white">
      <div className="border-b border-[#dce4ed] px-4 py-4 sm:px-6">
        <h3 className="font-serif text-[21px] font-bold text-[#20242b] sm:text-[26px]">Assign Products</h3>
        <p className="mt-2 text-[12px] leading-5 text-[#60738d] sm:text-[14px]">Choose a group member for each item. Age bands are shown for information; any group member can be selected.</p>
      </div>
      <div className="divide-y divide-[#d2d2d2]">
        {passes.map((pass, index) => {
          const selected = group.members.find((member) => member.id === group.assignments[pass.id]);
          return <article key={pass.id} className="grid grid-cols-[42px_minmax(0,1fr)] items-center gap-3 bg-[#f7f7f7] px-3.5 py-4 sm:grid-cols-[54px_minmax(0,1fr)_minmax(220px,34%)] sm:gap-4 sm:px-4">
            <span aria-hidden="true" className={`grid h-10 w-10 place-items-center rounded-full text-[18px] text-white sm:h-[48px] sm:w-[48px] ${selected ? 'bg-[#5b8199]' : 'bg-[#d1d1d1]'}`}>{selected ? <Check className="h-5 w-5"/> : <Check className="h-5 w-5 text-white/60"/>}</span>
            <div className="min-w-0">
              <div className="text-[14px] font-medium leading-5 sm:text-[17px]">{pass.name.replace(/\s+-\s+Pay Now$/, '')}</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">{[pass.ageBand, ...pass.detail.split(' · ').filter((part) => /\d+ days?/i.test(part))].filter(Boolean).map((label) => <span key={label} className="rounded-[4px] bg-[#e3e3e3] px-2 py-1 text-[11px] text-[#555] sm:text-[13px]">{label}</span>)}</div>
              <button type="button" aria-expanded={Boolean(expandedPasses[pass.id])} aria-controls={`pass-details-${pass.id}`} onClick={() => togglePassDetails(pass.id)} className="mt-2 rounded-full border border-[#5b8199] px-2.5 py-1 text-[10px] text-[#5b8199] underline">{expandedPasses[pass.id] ? 'HIDE DETAILS' : 'SHOW DETAILS'}</button>
              {expandedPasses[pass.id] && <div id={`pass-details-${pass.id}`} className="mt-2 rounded-lg border border-[#dce4ed] bg-white p-2.5 text-[11px] leading-5 text-[#60738d]">
                <b className="block text-[#344a64]">Item details</b>
                {pass.ageBand && <div>{pass.ageBand}</div>}
                {pass.detail.split(' · ').filter(Boolean).map((detail) => <div key={detail}>{detail}</div>)}
              </div>}
            </div>
            <label className="col-start-2 block sm:col-start-auto">
              <span className="sr-only">Select group member for item {index + 1}</span>
              <span className="relative block"><select aria-label={`Select group member for item ${index + 1}`} value={group.assignments[pass.id] || ''} onChange={(event) => { if (event.target.value === '__add_member__') { setAssignment(pass.id, ''); openAdd(); } else setAssignment(pass.id, event.target.value); }} className="h-11 w-full appearance-none rounded-lg border border-[#bfc3c6] bg-white px-3 pr-9 text-[13px] text-[#344a64] focus:border-[#5b8199] focus:outline-none"><option value="">Select Group Member</option>{group.members.map((member) => <option key={member.id} value={member.id}>{member.name}</option>)}<option value="__add_member__">Add Group Member</option></select><ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#344a64]"/></span>
            </label>
          </article>;
        })}
      </div>
    </section>

    <section className="overflow-hidden rounded-[20px] border border-[#d1d8e0] bg-[#edf2f7] shadow-sm" aria-label="Manage group members">
      <header className="flex flex-wrap items-center gap-3 border-b border-[#d1d8e0] bg-[#f4f5f8] px-4 py-3 sm:gap-5 sm:px-5">
        <h3 className="text-[17px] font-medium text-[#5b8199] sm:text-[21px]">Manage Your Group ({group.members.length} {group.members.length === 1 ? 'Member' : 'Members'})</h3>
        <div className="flex items-center pl-1" aria-label={`${group.members.length} group members`}>{group.members.slice(0, 4).map((member, index) => <span key={member.id} className={`-ml-1 grid h-9 w-9 place-items-center rounded-full border-2 border-[#f4f5f8] text-[11px] text-white ${['bg-[#4e6790]','bg-[#4e9ec2]','bg-[#f3bd61]','bg-[#b59b73]'][index % 4]}`}>{member.name.split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>)}{group.members.length > 4 && <span className="-ml-1 grid h-9 w-9 place-items-center rounded-full border-2 border-[#f4f5f8] bg-[#052f52] text-[11px] text-white">+{group.members.length - 4}</span>}</div>
        <button type="button" aria-expanded={groupVisible} onClick={() => setGroupVisible((visible) => !visible)} className="ml-auto border border-[#5b8199] px-3 py-2 text-[12px] font-semibold text-[#5b8199]">{groupVisible ? 'Hide Group' : 'Show Group'}</button>
      </header>
      {groupVisible && <div className="grid grid-cols-1 gap-3 p-3 sm:grid-cols-2 sm:gap-4 sm:p-5 lg:grid-cols-3">
        {group.members.map((member) => <article key={member.id} className="relative flex min-h-[145px] flex-col border border-[#c8c8c8] bg-white">
          {!member.hasCard && <span className="absolute right-0 top-0 rounded-bl-md bg-[#5b8199] px-2 py-1 text-[10px] font-bold text-white">NO CARD</span>}
          <div className="flex flex-1 items-start gap-2.5 p-3">
            {member.photoUrl ? <img src={member.photoUrl} alt="" className="h-[46px] w-[46px] rounded-full object-cover"/> : <span className="grid h-[46px] w-[46px] shrink-0 place-items-center rounded-full bg-[#4f6994] text-[13px] font-semibold text-white">{(member.legalName || member.name).split(/\s+/).map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>}
            <div className="min-w-0 flex-1"><h4 className="break-words pr-10 text-[14px] font-medium leading-4">{member.legalName || member.name}</h4><div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1.5 text-[9px] leading-3"><div><span className="block text-[#7a8083]">PASSPORT NAME</span><b className="mt-0.5 block break-words text-[10px] font-medium text-[#526982]">{member.passportName || 'Not added'}</b></div><div><span className="block text-[#7a8083]">CHARACTERS (PASSPORT NAME)</span><b className="mt-0.5 block break-words text-[10px] font-medium text-[#526982]">{member.legalName || 'Not added'}</b></div><div><span className="block text-[#7a8083]">BIRTHDATE</span><b className="mt-0.5 block text-[10px] font-medium text-[#526982]">{displayDate(member.birthDate)}</b></div><div><span className="block text-[#7a8083]">NATIONALITY</span><b className="mt-0.5 block break-words text-[10px] font-medium text-[#526982]">{member.nationality || 'Not added'}</b></div><div><span className="block text-[#7a8083]">PHONE</span><b className="mt-0.5 block break-words text-[10px] font-medium text-[#526982]">{member.phone || 'Not added'}</b></div><div><span className="block text-[#7a8083]">EMAIL</span><b className="mt-0.5 block break-all text-[10px] font-medium text-[#526982]">{member.email || 'Not added'}</b></div></div><span className="mt-1 inline-block rounded bg-[#e9edf2] px-1.5 py-0.5 text-[10px] text-[#526982]">{member.ageType || 'Age not set'}</span></div>
          </div>
          <div className="flex items-center bg-[#5b8199] text-white"><label className="flex min-h-9 flex-1 cursor-pointer items-center justify-center gap-2 text-[11px] font-bold"><Camera className="h-3.5 w-3.5"/>NEW PHOTO<input type="file" accept="image/*" data-member-id={member.id} onChange={handlePhoto} className="sr-only"/></label></div>
          <div className="flex justify-end gap-3 px-3 py-1.5"><button type="button" onClick={() => openEdit(member)} className="inline-flex items-center gap-1 text-[10px] text-[#5b8199] underline"><Pencil className="h-3 w-3"/>Edit</button><button type="button" onClick={() => removeMember(member.id)} className="inline-flex items-center gap-1 text-[10px] text-[#5b8199] underline"><Trash2 className="h-3 w-3"/>Remove</button></div>
        </article>)}
        <button type="button" onClick={openAdd} className="grid min-h-[145px] place-items-center border border-[#c8c8c8] bg-white text-[14px] text-[#252b33] hover:bg-[#f9fbfd]"><span className="inline-flex items-center gap-2"><Plus className="h-4 w-4"/>Add Member</span></button>
      </div>}
      {groupVisible && formOpen && <form ref={formRef} onSubmit={saveMember} className="space-y-3 border-t border-[#d1d8e0] bg-[#edf2f7] p-4 sm:p-5">
        <div className="flex items-center justify-between"><h4 className="text-[15px] font-semibold text-[#5b8199]">{editingId ? 'Edit Group Member' : 'Add Group Member'}</h4><button type="button" onClick={() => { setFormOpen(false); setSignatureStarted(false); setTermsAccepted(false); }} aria-label="Close member form" className="rounded p-1 text-[#60738d]"><X className="h-4 w-4"/></button></div>
        <div className="grid grid-cols-2 gap-2">
          <label className="col-span-2 text-[10px] font-bold text-[#5b8199]">PASSPORT NAME (PINYIN) *<input required value={form.passportName} onChange={(event) => setForm((current) => ({ ...current, passportName: event.target.value }))} placeholder="e.g. CHEN WEI" className="mt-1 h-10 w-full rounded-lg border border-[#c7ced5] bg-white px-3 text-[13px] font-normal text-[#252b33] placeholder:text-[#9aa3b2]"/></label>
          <label className="col-span-2 text-[10px] font-bold text-[#5b8199]">CHARACTERS (PASSPORT NAME) *<input required value={form.legalName} onChange={(event) => setForm((current) => ({ ...current, legalName: event.target.value }))} placeholder="e.g. Wei Chen" className="mt-1 h-10 w-full rounded-lg border border-[#c7ced5] bg-white px-3 text-[13px] font-normal text-[#252b33] placeholder:text-[#9aa3b2]"/></label>
          <label className="text-[10px] font-bold text-[#5b8199]">DATE OF BIRTH *<input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.birthDate} onChange={(event) => setForm((current) => ({ ...current, birthDate: event.target.value }))} className="mt-1 h-10 w-full min-w-0 rounded-lg border border-[#c7ced5] bg-white px-2 text-[12px] font-normal text-[#252b33]"/></label>
          <label className="text-[10px] font-bold text-[#5b8199]">NATIONALITY *<select required value={form.nationality} onChange={(event) => setForm((current) => ({ ...current, nationality: event.target.value }))} className="mt-1 h-10 w-full rounded-lg border border-[#c7ced5] bg-white px-2 text-[12px] font-normal text-[#252b33]"><option value="">Select</option>{['New Zealand', 'China', 'Australia', 'United States', 'United Kingdom', 'Canada', 'Other'].map((nationality) => <option key={nationality} value={nationality}>{nationality}</option>)}</select></label>
          <label className="text-[10px] font-bold text-[#5b8199]">PHONE *<input required type="tel" autoComplete="tel" value={form.phone} onChange={(event) => setForm((current) => ({ ...current, phone: event.target.value }))} placeholder="+64 ..." className="mt-1 h-10 w-full min-w-0 rounded-lg border border-[#c7ced5] bg-white px-2 text-[12px] font-normal text-[#252b33] placeholder:text-[#9aa3b2]"/></label>
          <label className="text-[10px] font-bold text-[#5b8199]">EMAIL *<input required type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="For your e-ticket" className="mt-1 h-10 w-full min-w-0 rounded-lg border border-[#c7ced5] bg-white px-2 text-[12px] font-normal text-[#252b33] placeholder:text-[#9aa3b2]"/></label>
        </div>
        <div className="relative flex min-h-[96px] items-center justify-center overflow-hidden rounded-xl border border-dashed border-[#cbd7e4] bg-[#fbfcfe] px-4 py-3 text-center text-[11px] text-[#718096]">
          <canvas ref={signatureCanvasRef} aria-label="Draw your signature here" className="absolute inset-0 h-full w-full cursor-crosshair" style={{ touchAction: 'none' }} onPointerDown={startSignature} onPointerMove={continueSignature}/>
          {!signatureStarted && <div className="pointer-events-none relative"><span className="block">Sign here</span><span className="mt-2 block text-[10px]">Signature demonstration area</span></div>}
          {signatureStarted && <button type="button" onClick={clearSignature} className="absolute right-2 top-2 z-10 rounded-full bg-white/90 px-2 py-1 text-[9px] font-medium text-[#5b8199] shadow-sm">Clear</button>}
        </div>
        <label className="flex cursor-pointer items-start gap-2 text-[11px] leading-5 text-[#60738d]"><input required type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-[#5b8199]"/><span>I have read and agree to the terms that apply to the products in my order.</span></label>
        <div className="flex gap-2"><button type="submit" className="min-h-10 bg-[#5b8199] px-4 text-[12px] font-semibold text-white">{editingId ? 'SAVE MEMBER' : 'ADD MEMBER'}</button><button type="button" onClick={() => { setFormOpen(false); setSignatureStarted(false); setTermsAccepted(false); }} className="min-h-10 border border-[#9aa3ab] bg-white px-4 text-[12px]">CANCEL</button></div>
      </form>}
      {groupVisible && <p className="px-4 pb-4 text-[10px] leading-4 text-[#718096] sm:px-5">Demo profile only. Guest details are not saved or sent.</p>}
    </section>
  </section>;
}
