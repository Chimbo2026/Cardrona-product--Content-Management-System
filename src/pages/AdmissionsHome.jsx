import { useMemo, useState } from 'react'
import { ArrowDown, ArrowRight, ArrowUpRight, BookOpen, Building2, Check, ChevronDown, Download, FileText, GraduationCap, MapPin, Menu, Search, X } from 'lucide-react'
import './AdmissionsHome.css'

const universities = [
  {
    id: 'zafu',
    short: 'ZAFU',
    name: 'Zhejiang A&F University',
    city: 'Hangzhou, Zhejiang',
    duration: '4 years',
    language: 'English-taught',
    tuition: '¥20,000',
    room: '¥8,400–18,000',
    total: '¥28,400–38,000',
    totalNote: 'Tuition + estimated 12-month dorm stay',
    application: 'https://admission.zafu.edu.cn',
    source: 'https://iec.zafu.edu.cn/info/1008/6736.htm',
    majors: [
      'International Economics and Trade', 'Computer Science and Technology', 'Civil Engineering', 'Digital Economy',
      'Mechanical Design, Manufacturing and Automation', 'Electronic and Information Engineering', 'Urban and Rural Planning',
      'Wood Science and Engineering', 'Forestry', 'Veterinary Medicine', 'Furniture Design and Engineering', 'Accounting',
      'Horticulture', 'Tea Science',
    ],
    extras: 'Living expenses are estimated at ¥700–1,000/month. Utilities, insurance, books and application fees are additional.',
  },
  {
    id: 'hhu',
    short: 'HHU',
    name: 'Hohai University',
    city: 'Nanjing, Jiangsu',
    duration: '4 years',
    language: 'English-taught options',
    tuition: 'Confirm by program',
    room: '¥7,200–24,000',
    total: 'See fee notes',
    totalNote: 'Room price depends on campus and room type',
    application: 'http://admission.hhu.edu.cn',
    source: 'https://ie.hhu.edu.cn/14687/list.htm',
    legacySource: 'https://ie.hhu.edu.cn/_upload/article/files/c3/20/99aad7c244a39e1f0e2ff79ce90c/f685324b-d861-42e3-8a37-a3af303b5a78.pdf',
    majors: [
      'Hydrology and Water Resources Engineering', 'Water Conservancy and Hydropower Engineering',
      'Harbor, Waterway and Coastal Engineering', 'Civil Engineering', 'Business Administration',
      'Marketing Management', 'Financial Management', 'Human Resources Management',
    ],
    extras: 'The English-major list and ¥30,000/year tuition figure found in HHU’s English-language brochure date to 2016. Confirm current program availability and tuition with HHU before applying.',
  },
]

const checklist = [
  'Passport copy',
  'High school diploma and academic transcript',
  'Medical examination form',
  'Non-criminal record certificate',
  'Study plan or personal statement',
  'Language proficiency result',
  'Recommendation letter(s), if requested',
]

function scrollTo(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export default function AdmissionsHome() {
  const [selected, setSelected] = useState('all')
  const [query, setQuery] = useState('')
  const [openUniversity, setOpenUniversity] = useState(null)
  const [checked, setChecked] = useState([])
  const [menuOpen, setMenuOpen] = useState(false)

  const visibleUniversities = useMemo(() => universities.filter((university) => {
    const matchesSchool = selected === 'all' || selected === university.id
    const matchesQuery = !query || `${university.name} ${university.majors.join(' ')}`.toLowerCase().includes(query.toLowerCase())
    return matchesSchool && matchesQuery
  }), [selected, query])

  const toggleChecklist = (item) => setChecked((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item])

  return (
    <main className="admissions-site">
      <header className="admissions-header">
        <a className="admissions-brand" href="#top" aria-label="SaintMilord Admissions home">
          <span className="brand-mark"><GraduationCap size={21} strokeWidth={1.8} /></span>
          <span>SaintMilord<span className="brand-light"> Admissions</span></span>
        </a>
        <button className="mobile-menu-toggle" aria-label={menuOpen ? 'Close menu' : 'Open menu'} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={menuOpen ? 'admissions-nav is-open' : 'admissions-nav'}>
          <a href="#programs" onClick={() => setMenuOpen(false)}>Universities & majors</a>
          <a href="#costs" onClick={() => setMenuOpen(false)}>Annual costs</a>
          <a href="#resources" onClick={() => setMenuOpen(false)}>Brochures & guides</a>
          <a href="#how-to-apply" onClick={() => setMenuOpen(false)}>How to apply</a>
          <a className="nav-apply" href="#programs" onClick={() => setMenuOpen(false)}>Explore programs <ArrowUpRight size={15} /></a>
        </nav>
      </header>

      <section className="admissions-hero" id="top">
        <div className="hero-image" aria-hidden="true" />
        <div className="hero-overlay" />
        <div className="hero-content">
          <div className="eyebrow"><span /> UNDERGRADUATE ADMISSIONS · CHINA</div>
          <h1>Your first degree.<br /><em>A world of possibility.</em></h1>
          <p>Explore undergraduate majors at two Chinese universities, compare yearly tuition and accommodation, and plan your next step with confidence.</p>
          <div className="hero-actions">
            <button className="button-light" onClick={() => scrollTo('programs')}>Explore undergraduate majors <ArrowRight size={17} /></button>
            <button className="button-play" onClick={() => scrollTo('costs')}><span><ArrowDown size={15} /></span> View annual costs</button>
          </div>
          <div className="hero-note"><span>2026 intake information</span><i /> Figures linked to published university guidance; verify details before applying.</div>
        </div>
        <aside className="hero-stamp"><span>STUDY</span><b>IN</b><span>CHINA</span><small>Find your next chapter</small></aside>
        <div className="hero-index"><span>01</span> / 03</div>
      </section>

      <section className="quick-facts" aria-label="Admissions overview">
        <div className="fact-label">START WITH<br />THE DETAILS</div>
        <div className="fact"><span className="fact-icon"><GraduationCap size={19} /></span><div><strong>Undergraduate only</strong><small>Bachelor’s degree programs</small></div></div>
        <div className="fact"><span className="fact-icon"><Building2 size={18} /></span><div><strong>2 universities</strong><small>Compare majors and costs</small></div></div>
        <div className="fact"><span className="fact-icon"><BookOpen size={18} /></span><div><strong>14 ZAFU majors</strong><small>English-taught in 2026 guide</small></div></div>
        <div className="fact-action"><button onClick={() => scrollTo('costs')}>See yearly budget <ArrowRight size={16} /></button></div>
      </section>

      <section className="section universities-section" id="programs">
        <div className="section-heading">
          <div><div className="eyebrow eyebrow-dark">FIND YOUR FIELD</div><h2>Undergraduate programs<br /><em>made for your ambitions.</em></h2></div>
          <p>Browse undergraduate majors from Hohai University and Zhejiang A&amp;F University. Program language and availability can vary by intake.</p>
        </div>
        <div className="program-tools">
          <div className="school-tabs" role="tablist" aria-label="Filter by university">
            {[['all', 'All universities'], ['zafu', 'Zhejiang A&F'], ['hhu', 'Hohai']].map(([id, label]) => <button key={id} role="tab" aria-selected={selected === id} className={selected === id ? 'active' : ''} onClick={() => setSelected(id)}>{label}</button>)}
          </div>
          <label className="program-search"><Search size={16} /><input aria-label="Search majors" placeholder="Search a major" value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>/</kbd></label>
        </div>
        <div className="university-list">
          {visibleUniversities.map((university, index) => (
            <article className={`university-card ${openUniversity === university.id ? 'expanded' : ''}`} key={university.id}>
              <button className="university-card-top" onClick={() => setOpenUniversity(openUniversity === university.id ? null : university.id)} aria-expanded={openUniversity === university.id}>
                <div className={`university-monogram monogram-${university.id}`}>{university.short}</div>
                <div className="university-name"><span className="card-number">0{index + 1} / UNIVERSITY</span><h3>{university.name}</h3><p><MapPin size={14} /> {university.city} <span className="dot-sep">·</span> {university.duration} <span className="dot-sep">·</span> {university.language}</p></div>
                <div className="university-cost"><small>ANNUAL TUITION</small><strong>{university.tuition}</strong><span>per academic year</span></div>
                <span className="expand-button"><ChevronDown size={19} /></span>
              </button>
              {openUniversity === university.id && (
                <div className="university-details">
                  <div className="major-heading"><h4>Undergraduate majors</h4><span>{university.majors.length} programs</span></div>
                  <div className="major-grid">{university.majors.map((major) => <div className="major-pill" key={major}><span><Check size={13} /></span>{major}</div>)}</div>
                  <div className="school-footnote"><span>{university.id === 'zafu' ? '2026 official international-student guide' : 'English-medium major list from a 2016 brochure; verify current availability'}</span><a href={university.id === 'hhu' ? university.legacySource : university.source} target="_blank" rel="noreferrer">{university.id === 'hhu' ? 'View brochure' : 'View university information'} <ArrowUpRight size={14} /></a></div>
                </div>
              )}
            </article>
          ))}
          {visibleUniversities.length === 0 && <div className="no-results">No matching majors. Try another search.</div>}
        </div>
      </section>

      <section className="costs-section" id="costs">
        <div className="section costs-layout">
          <div className="cost-copy"><div className="eyebrow">PLAN YOUR YEAR</div><h2>Know what to<br /><em>budget for.</em></h2><p>Tuition is only one part of the picture. Here’s what the published guidance says about tuition and campus accommodation for international undergraduates.</p><div className="cost-caption"><span className="caption-line" /> All amounts are in Chinese yuan (RMB) per academic year.</div></div>
          <div className="cost-cards">
            <article className="cost-card cost-card-zafu">
              <div className="cost-card-header"><span>ZAFU</span><small>ZHEJIANG A&amp;F UNIVERSITY</small></div>
              <div className="cost-total-label">TUITION + ESTIMATED DORM</div><div className="cost-total">¥28,400 <span>– ¥38,000</span></div>
              <div className="cost-breakdown"><div><span>Tuition</span><strong>¥20,000 / year</strong></div><div><span>Accommodation</span><strong>¥8,400–18,000 / year</strong></div><div><span>Living estimate</span><strong>¥8,400–12,000 / year</strong></div></div>
              <div className="cost-card-note">Dorm estimate uses the published ¥700–1,500 monthly range × 12 months. Living costs, utilities, insurance, books and fees are extra.</div>
            </article>
            <article className="cost-card cost-card-hhu">
              <div className="cost-card-header"><span>HHU</span><small>HOHAI UNIVERSITY</small></div>
              <div className="cost-total-label">ACCOMMODATION BY CAMPUS</div><div className="cost-total">¥7,200 <span>– ¥24,000</span></div>
              <div className="cost-breakdown"><div><span>Changzhou · shared bed</span><strong>¥7,200 / year</strong></div><div><span>Jiangning · single room</span><strong>¥12,000 / year</strong></div><div><span>Xikang Road · room range</span><strong>¥9,600–24,000 / year</strong></div><div><span>Tuition · Chinese-taught (2025 guide)</span><strong>¥20,000 / year</strong></div></div>
              <div className="cost-card-note">For English-taught programs, confirm current tuition and room availability directly with HHU. The English-medium ¥30,000 rate found in its 2016 brochure is out of date.</div>
            </article>
          </div>
        </div>
        <div className="section cost-source"><span>OFFICIAL SOURCES</span><a href="https://iec.zafu.edu.cn/info/1008/6736.htm" target="_blank" rel="noreferrer">ZAFU 2026 international admissions guide <ArrowUpRight size={13} /></a><a href="https://ie.hhu.edu.cn/14687/list.htm" target="_blank" rel="noreferrer">HHU undergraduate admissions <ArrowUpRight size={13} /></a><a href="https://pa.china-embassy.gov.cn/fhlx_0/jxjjh/202412/t20241218_11501885.htm" target="_blank" rel="noreferrer">HHU fee guide reference <ArrowUpRight size={13} /></a></div>
      </section>

      <section className="section resources-section" id="resources">
        <div className="resources-intro"><div className="eyebrow eyebrow-dark">OFFICIAL UNIVERSITY FILES</div><h2>Read the latest<br /><em>before you apply.</em></h2><p>Open the university-issued admission resources for full requirements, program details, and application instructions.</p></div>
        <div className="resource-cards">
          <article className="resource-card"><div className="resource-icon"><FileText size={21} /></div><div className="resource-meta"><span>ZHEJIANG A&amp;F UNIVERSITY</span><small>2026 AUTUMN INTAKE</small></div><h3>International Student Admission Guide</h3><p>Undergraduate majors, tuition and accommodation fees, eligibility, documents, and application steps.</p><a href="https://iec.zafu.edu.cn/info/1008/6736.htm" target="_blank" rel="noreferrer">Open guide &amp; PDF <Download size={15} /></a></article>
          <article className="resource-card"><div className="resource-icon"><FileText size={21} /></div><div className="resource-meta"><span>HOHAI UNIVERSITY</span><small>2026 / 2027</small></div><h3>International Student Prospectus</h3><p>Hohai’s official download center lists the current prospectus and supporting application materials.</p><a href="https://ie.hhu.edu.cn/14691/listm.htm" target="_blank" rel="noreferrer">Open prospectus page <ArrowUpRight size={15} /></a></article>
        </div>
      </section>

      <section className="section apply-section" id="how-to-apply">
        <div className="section-heading apply-heading"><div><div className="eyebrow eyebrow-dark">YOUR APPLICATION PATH</div><h2>A clear path from<br /><em>curious to enrolled.</em></h2></div><p>Use this undergraduate checklist to get organized, then submit through the university’s official application system.</p></div>
        <div className="apply-grid">
          <div className="steps-list">
            {['Choose a university and major', 'Prepare your application documents', 'Apply through the university portal', 'Follow your application and interview', 'Prepare for visa and arrival'].map((step, index) => <div className="step-row" key={step}><span>0{index + 1}</span><strong>{step}</strong><ArrowRight size={16} /></div>)}
            <div className="application-links"><a href="https://admission.zafu.edu.cn" target="_blank" rel="noreferrer">ZAFU application portal <ArrowUpRight size={14} /></a><a href="http://admission.hhu.edu.cn" target="_blank" rel="noreferrer">Hohai application portal <ArrowUpRight size={14} /></a></div>
          </div>
          <div className="checklist-card"><div className="checklist-top"><div><span className="eyebrow eyebrow-dark">GET ORGANIZED</span><h3>Your document checklist</h3></div><div className="checklist-progress">{checked.length}<span> / {checklist.length} ready</span></div></div><div className="progress-track"><span style={{ width: `${(checked.length / checklist.length) * 100}%` }} /></div><div className="checklist-items">{checklist.map((item) => <label key={item} className={checked.includes(item) ? 'checked' : ''}><input type="checkbox" checked={checked.includes(item)} onChange={() => toggleChecklist(item)} /><span className="custom-check"><Check size={12} /></span>{item}</label>)}</div><small>Requirements vary by program and applicant. Check the latest official university guide.</small></div>
        </div>
      </section>

      <footer className="admissions-footer">
        <a className="admissions-brand footer-brand" href="#top"><span className="brand-mark"><GraduationCap size={20} /></span><span>SaintMilord<span className="brand-light"> Admissions</span></span></a>
        <p>Undergraduate pathways to study in China.</p>
        <span className="footer-note">Always verify current program details and fees with the university.</span>
        <a className="back-top" href="#top">BACK TO TOP <ArrowUpRight size={14} /></a>
      </footer>
    </main>
  )
}
