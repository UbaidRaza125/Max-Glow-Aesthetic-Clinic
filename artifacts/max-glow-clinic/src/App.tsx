import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { Link, Route, Switch, useLocation } from 'wouter';
import {
  ArrowUpRight, BriefcaseBusiness, CalendarDays, Check, CheckCircle2, ChevronRight,
  Edit3, HeartPulse, LayoutDashboard,
  MapPin, Menu, MessageCircle, Phone, Plus, Send, ShieldCheck, Sparkles, Stethoscope,
  Trash2, UsersRound, X
} from 'lucide-react';
import { AppointmentWidget } from '@/components/AppointmentWidget';
import './index.css';

const ASSET = `${import.meta.env.BASE_URL}assets/`;
const logo = `${ASSET}WhatsApp_Image_2026-08-29_at_8.15.58_AM-removebg-preview.png`;
const phone = '03191555147';
const address = 'Shop No 1 Lower Ground Floor, Northern Heights E-11/3 Markaz, MPCHS Islamabad';
const whatsapp = `https://wa.me/92${phone.slice(1)}`;

type Appointment = { id: string; name: string; phone: string; date: string; message: string; treatment: string; createdAt: string };
const APPOINTMENTS_API = '/api/appointments';

async function fetchAppointments(): Promise<Appointment[]> {
  const response = await fetch(APPOINTMENTS_API);
  if (!response.ok) throw new Error('Unable to load appointments');
  return response.json() as Promise<Appointment[]>;
}
type Job = { id: string; title: string; type: string; location: string; description: string; endDate: string };
type ChatMessage = { id: string; text: string; from: 'patient' | 'staff'; at: string };
type ChatThread = { id: string; name: string; phone: string; messages: ChatMessage[] };

const seedJobs: Job[] = [
  { id: 'job-1', title: 'Aesthetic Practitioner', type: 'Full-time', location: 'Islamabad · On site', description: 'Join a thoughtful team delivering safe, personal skin and laser experiences.', endDate: '2027-02-28' },
  { id: 'job-2', title: 'Clinic Front Desk Associate', type: 'Part-time', location: 'Islamabad · On site', description: 'Be the warm first hello for every patient who enters the atelier.', endDate: '2026-12-18' }
];
const seedThread: ChatThread = {
  id: 'thread-demo', name: 'A visiting patient', phone: '03190000000',
  messages: [{ id: 'm-1', text: 'Welcome to Max Glow. How can we make your visit feel considered?', from: 'staff', at: 'Today' }]
};

function readStore<T>(key: string, fallback: T): T {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) as T : fallback;
  } catch { return fallback; }
}
function writeStore(key: string, value: unknown) { localStorage.setItem(key, JSON.stringify(value)); }
function isExpired(date: string) { return new Date(`${date}T23:59:59`) < new Date(); }
function prettyDate(date: string) {
  if (!date) return 'Date to be confirmed';
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-PK', { day: 'numeric', month: 'short', year: 'numeric' });
}
function waLink(text: string) { return `${whatsapp}?text=${encodeURIComponent(text)}`; }

function SiteHeader({ onBook }: { onBook: () => void }) {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const links = [['/', 'Home'], ['/our-story', 'Our story'], ['/contact', 'Contact'], ['/careers', 'Careers']];
  return <>
    <div className="topbar"><div className="container topbar-inner"><span>Max Glow · E-11/3 Islamabad</span><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp · {phone}</a></div></div>
    <header className="site-header">
      <div className="container nav-inner">
        <Link href="/" className="brand" data-testid="link-brand" onClick={() => setOpen(false)}>
          <img src={logo} alt="Max Glow Aesthetics Skin & Laser logo" />
          <span><span className="brand-name">Max Glow</span><span className="brand-sub">Aesthetics Skin & Laser</span></span>
        </Link>
        <button className="menu-btn" aria-label="Toggle menu" data-testid="button-toggle-menu" onClick={() => setOpen(!open)}>{open ? <X size={20} /> : <Menu size={20} />}</button>
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Primary navigation">
          {links.map(([href, label]) => <Link key={href} href={href} className={location === href ? 'active' : ''} data-testid={`link-nav-${label.toLowerCase().replace(' ', '-')}`} onClick={() => setOpen(false)}>{label}</Link>)}
        </nav>
        <button className="btn btn-primary nav-cta" data-testid="button-header-book" onClick={onBook}>Reserve a visit <ArrowUpRight size={14} /></button>
      </div>
    </header>
  </>;
}

function Footer({ onBook }: { onBook: () => void }) {
  return <footer className="footer"><div className="container">
    <div className="footer-grid">
      <div className="footer-brand"><h2 className="display">Max Glow.</h2><p>A private skin and laser atelier in the heart of E-11/3, Islamabad.<br />Care that looks like you, only more rested.</p><button className="btn btn-dark" style={{ marginTop: '20px' }} onClick={onBook} data-testid="button-footer-book">Begin your visit <ArrowUpRight size={14} /></button></div>
      <div><h4>Explore</h4><div className="footer-links"><Link href="/">Home</Link><Link href="/our-story">Our story</Link><Link href="/contact">Contact</Link><Link href="/careers">Careers</Link></div></div>
      <div><h4>Reach us</h4><div className="footer-links"><a href={whatsapp} target="_blank" rel="noreferrer">WhatsApp</a><a href={`tel:${phone}`}>{phone}</a><a href={`mailto:hello@maxglow.pk`}>Email us</a></div></div>
      <div><h4>Find us</h4><p>Shop No 1 Lower Ground Floor<br />Northern Heights E-11/3 Markaz<br />MPCHS Islamabad</p></div>
    </div>
    <div className="footer-bottom"><span>© {new Date().getFullYear()} Max Glow Aesthetics Skin & Laser</span><span>Private care, quietly exceptional.</span></div>
  </div></footer>;
}

function ChatWidget({ threads, setThreads }: { threads: ChatThread[]; setThreads: (value: ChatThread[]) => void }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const thread = threads[0];
  const send = () => {
    if (!text.trim()) return;
    const next = { ...thread, messages: [...thread.messages, { id: `m-${Date.now()}`, text: text.trim(), from: 'patient' as const, at: 'Just now' }] };
    setThreads([next, ...threads.slice(1)]); setText('');
  };
  return <>
    {open && <section className="chat-panel" aria-label="Patient chat">
      <div className="chat-head"><div><strong>Ask Max Glow</strong><span>A calm answer is one message away.</span></div><button className="icon-btn" onClick={() => setOpen(false)} aria-label="Close chat" data-testid="button-close-chat"><X size={15} /></button></div>
      <div className="chat-messages">{thread?.messages.map(message => <div key={message.id} className={`chat-bubble ${message.from === 'staff' ? 'staff' : ''}`} data-testid={`chat-message-${message.id}`}>{message.text}<small>{message.at}</small></div>)}</div>
      <div className="chat-form"><input value={text} onChange={e => setText(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Write a question..." aria-label="Chat message" data-testid="input-chat-message" /><button onClick={send} aria-label="Send message" data-testid="button-send-chat"><Send size={15} /></button></div>
    </section>}
    <button className="chat-toggle" onClick={() => setOpen(!open)} aria-label={open ? 'Close patient chat' : 'Open patient chat'} data-testid="button-open-chat">{open ? <X size={21} /> : <MessageCircle size={21} />}</button>
  </>;
}

function BookingModal({ open, onClose, onSaved }: { open: boolean; onClose: () => void; onSaved: (appointment: Appointment) => void }) {
  const [form, setForm] = useState({ name: '', phone: '', date: '', message: '', treatment: 'A consultation' });
  const update = (key: string, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  if (!open) return null;
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!form.name || !form.phone || !form.date) return;
    const appointment = { ...form, id: `apt-${Date.now()}`, createdAt: new Date().toISOString() };
    onSaved(appointment);
  };
  return <div className="modal-backdrop" role="dialog" aria-modal="true"><div className="booking-modal">
    <button className="modal-close" onClick={onClose} aria-label="Close booking form" data-testid="button-close-booking"><X size={18} /></button>
    <><div className="eyebrow">A quiet beginning</div><h2 className="display">Reserve your <em>visit.</em></h2><p>Tell us what would make your skin feel looked after. Our team will review your request and reply directly.</p>
      <AppointmentWidget />
      <form onSubmit={submit}><div className="form-grid">
        <div className="field"><label htmlFor="booking-name">Full name</label><input id="booking-name" value={form.name} onChange={e => update('name', e.target.value)} placeholder="Your name" required data-testid="input-booking-name" /></div>
        <div className="field"><label htmlFor="booking-phone">WhatsApp number</label><input id="booking-phone" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="03xx xxxxxxx" required data-testid="input-booking-phone" /></div>
        <div className="field"><label htmlFor="booking-date">Preferred date</label><input id="booking-date" type="date" min={new Date().toISOString().split('T')[0]} value={form.date} onChange={e => update('date', e.target.value)} required data-testid="input-booking-date" /></div>
        <div className="field"><label htmlFor="booking-treatment">I am curious about</label><select id="booking-treatment" value={form.treatment} onChange={e => update('treatment', e.target.value)} data-testid="select-booking-treatment">{['A consultation', 'Signature PRGF Treatment for Face', 'Advanced Hydra Facial', 'Instant Glow Facial', 'Full Body Laser', 'Mesotherapy'].map(item => <option key={item}>{item}</option>)}</select></div>
        <div className="field full"><label htmlFor="booking-message">A little more, if you’d like</label><textarea id="booking-message" value={form.message} onChange={e => update('message', e.target.value)} placeholder="Tell us about your skin goals..." data-testid="textarea-booking-message" /></div>
      </div><button className="btn btn-primary" type="submit" data-testid="button-submit-booking">Send my enquiry <ArrowUpRight size={14} /></button></form>
     </>;
  </div></div>;
}

function Home({ onBook }: { onBook: () => void }) {
  return <main>
    <section className="hero grain"><div className="hero-copy"><div className="eyebrow fade-up">Skin, refined · Islamabad</div><h1 className="fade-up delay-1">The glow that<br /><em>feels like you.</em></h1><p className="hero-lead fade-up delay-2">Private aesthetic care with a softer point of view. Thoughtful treatments, advanced technology, and a team who remembers how you like your tea.</p><div className="hero-actions fade-up delay-3"><button className="btn btn-primary" onClick={onBook} data-testid="button-hero-book">Reserve a visit <ArrowUpRight size={14} /></button><a className="btn btn-outline" href="#treatments" data-testid="link-hero-explore">Explore treatments <ChevronRight size={14} /></a></div><div className="hero-note fade-up delay-3"><span /> No two skin stories are the same. Neither are our plans.</div></div>
      <div className="hero-media"><img src={`${ASSET}WhatsApp_Image_2026-08-29_at_8.15.59_AM_-_Copy_1788370161367.jpeg`} alt="Max Glow signature packages and treatment menu" /><div className="hero-stamp">Est.<br />Islamabad<br />2024</div><div className="hero-media-card"><strong>Glow beyond<br />limits.</strong><small>Max Glow Aesthetics</small></div></div>
    </section>
    <div className="marquee"><div className="marquee-track"><span>Advanced skin rituals</span><i className="marquee-dot" /><span>Personal, never prescribed</span><i className="marquee-dot" /><span>E-11/3 Islamabad</span><i className="marquee-dot" /><span>Advanced skin rituals</span></div></div>
    <section className="section treatments-section" id="treatments"><div className="container"><div className="section-heading"><div className="eyebrow">The edit · treatments</div><h2>Good skin is a practice,<br /><em className="display">not a promise.</em></h2><p>Start with what your skin is asking for today. We’ll meet you there with precise hands, honest guidance, and a treatment room that feels entirely yours.</p></div>
      <div className="treatment-grid">
        <TreatmentCard featured image="img7_1788370161360.jpeg" eyebrow="Signature ritual" title="PRGF Treatment for Face" desc="Your own growth factors, thoughtfully placed for a natural, rested glow." price="7,000 Rs" onBook={onBook} />
        <TreatmentCard image="img3_1788370161364.jpeg" eyebrow="Hydrate" title="Advanced Hydra Facial" desc="Deep cleanse, replenish, and leave with a visible, healthy glow." onBook={onBook} />
        <TreatmentCard image="img5_1788370161362.jpeg" eyebrow="Smooth" title="Full Body Laser" desc="Longer-lasting smoothness, delivered with care." onBook={onBook} />
        <TreatmentCard image="img6_1788370161362.jpeg" eyebrow="Refresh" title="Instant Glow Facial" desc="A quick, effective reset for tired, dull skin." onBook={onBook} />
        <TreatmentCard image="img4_1788370161363.jpeg" eyebrow="Restore" title="Mesotherapy" desc="Deep hydration and collagen support, tailored to you." onBook={onBook} />
      </div>
    </div></section>
    <section className="manifesto grain"><div className="container manifesto-inner"><div><div className="eyebrow">Our point of view</div><h2>Clinical care,<br /><em>human warmth.</em></h2></div><div className="manifesto-copy"><p>Max Glow was created for people who want to feel more at home in their skin — without the pressure to become someone else. Our work is subtle, considered, and grounded in what is right for you.</p><p>From your first WhatsApp message to the last look in the mirror, every detail is held with intention.</p><div className="promise-list"><Promise icon={<Stethoscope size={18} />} title="Expert hands" text="Practitioners who listen before they treat." /><Promise icon={<ShieldCheck size={18} />} title="Safety, always" text="Hygiene and honest expectations come first." /><Promise icon={<HeartPulse size={18} />} title="Natural results" text="The best compliment is looking well-rested." /><Promise icon={<Sparkles size={18} />} title="Your ritual" text="A plan that belongs to your skin story." /></div></div></div></section>
    <section className="editorial"><div className="editorial-image"><img src={`${ASSET}img1_1788370161366.jpeg`} alt="Max Glow derma peel treatment story" /></div><div className="editorial-copy"><div className="eyebrow">A note from the atelier</div><h2>Your skin is already telling us what it needs.</h2><p>We don’t believe in chasing every trend. We believe in looking closely: at your skin, your schedule, your comfort, and the small changes that make a lasting difference.</p><Link className="text-link" href="/our-story" data-testid="link-home-story">Read our story <ArrowUpRight size={14} /></Link></div></section>
    <section className="signature-band"><div className="container signature-row"><div><div className="eyebrow">A considered place to start</div><h2>Signature PRGF for Face</h2></div><div className="signature-price"><span>1 session <strong>7,000 Rs</strong></span><span>3 sessions <strong>15,000 Rs</strong></span><button className="btn btn-primary" onClick={onBook} data-testid="button-prgf-book">Book PRGF <ArrowUpRight size={14} /></button></div></div></section>
  </main>;
}

function TreatmentCard({ image, eyebrow, title, desc, price, featured, onBook }: { image: string; eyebrow: string; title: string; desc: string; price?: string; featured?: boolean; onBook: () => void }) {
  return <article className={`treatment-card ${featured ? 'featured' : ''}`}><img src={`${ASSET}${image}`} alt={title} /><div className="treatment-content"><div className="eyebrow">{eyebrow}</div>{price && <span className="treatment-price">{price}</span>}<h3>{title}</h3><p>{desc}</p><button className="text-link" onClick={onBook} data-testid={`button-treatment-${title.toLowerCase().replaceAll(' ', '-')}`}>Explore treatment <ArrowUpRight size={14} /></button></div></article>;
}
function Promise({ icon, title, text }: { icon: ReactNode; title: string; text: string }) { return <div className="promise">{icon}<strong>{title}</strong><span>{text}</span></div>; }

function Story() {
  return <main><section className="page-hero"><div className="container"><div className="eyebrow">The Max Glow edit</div><h1>Beauty is quieter<br /><em>when it’s personal.</em></h1></div></section>
    <section className="container story-block"><div><div className="eyebrow">01 · Why we exist</div><h2>A little more<br />like yourself.</h2></div><div><p>Max Glow Aesthetics Skin & Laser is an Islamabad skin and laser atelier built around a simple belief: aesthetic care should feel like care.</p><p>Not a rushed appointment. Not a list of things to fix. A considered conversation, an expert plan, and small, meaningful shifts that let your own features stay in the room.</p><p>We pair advanced treatments with an unhurried, human approach — because trust is the first result.</p></div></section>
    <section className="editorial"><div className="editorial-image"><img src={`${ASSET}img2_1788370161365.jpeg`} alt="Carbon laser facial treatment at Max Glow" /></div><div className="editorial-copy"><div className="eyebrow">02 · The way we work</div><h2>We look closer.</h2><p>Every skin story arrives with context. Our practitioners take the time to understand yours before suggesting a treatment. No hard sells, no one-size-fits-all packages — just a clear plan you can feel good about.</p><a className="text-link" href={whatsapp} target="_blank" rel="noreferrer" data-testid="link-story-whatsapp">Talk to our team <ArrowUpRight size={14} /></a></div></section>
    <section className="rituals"><div className="container"><div className="eyebrow">03 · The atelier ritual</div><div className="ritual-grid"><div className="ritual"><span className="ritual-num">01</span><h3>Listen closely.</h3><p>Your goals, your sensitivities, your real life — all part of the consultation.</p></div><div className="ritual"><span className="ritual-num">02</span><h3>Choose precisely.</h3><p>We recommend only what makes sense for your skin, with clear expectations.</p></div><div className="ritual"><span className="ritual-num">03</span><h3>Leave lighter.</h3><p>With a plan, a little glow, and the confidence to take your time.</p></div></div></div></section>
    <section className="container story-block"><div><div className="eyebrow">04 · Come as you are</div><h2>The room is<br />ready for you.</h2></div><div><img className="story-poster" src={`${ASSET}img3_1788370161364.jpeg`} alt="Advanced Hydra Facial at Max Glow" /></div></section>
  </main>;
}

function Contact({ onBook }: { onBook: () => void }) {
  const [sent, setSent] = useState(false);
  return <main><section className="page-hero"><div className="container"><div className="eyebrow">Find your way here</div><h1>Let’s make space<br /><em>for your glow.</em></h1></div></section><section className="container contact-layout"><div className="contact-aside"><div className="eyebrow">Max Glow · Islamabad</div><h2>A warm hello<br />starts here.</h2><p>Have a question, a skin concern, or simply want to see if we’re the right fit? Send us a note. We’ll meet you with a clear answer.</p><div className="contact-list"><ContactItem icon={<Phone size={18} />} label="Call or WhatsApp" value={phone} href={whatsapp} /><ContactItem icon={<MapPin size={18} />} label="Visit the atelier" value={address} /><ContactItem icon={<CalendarDays size={18} />} label="Appointments" value="By reservation · Monday to Saturday" /></div><button className="btn btn-dark" onClick={onBook} data-testid="button-contact-book">Reserve a visit <ArrowUpRight size={14} /></button></div><div className="contact-form-wrap"><div className="eyebrow">Send an enquiry</div><h3>Tell us what’s on your mind.</h3><p>We usually reply on WhatsApp during clinic hours.</p>{sent && <div className="form-success" data-testid="status-contact-success"><CheckCircle2 size={16} /> Thank you — your note is with our team.</div>}<form onSubmit={e => { e.preventDefault(); setSent(true); }}><div className="form-grid"><div className="field"><label htmlFor="contact-name">Your name</label><input id="contact-name" required placeholder="Full name" data-testid="input-contact-name" /></div><div className="field"><label htmlFor="contact-number">WhatsApp number</label><input id="contact-number" required placeholder="03xx xxxxxxx" data-testid="input-contact-number" /></div><div className="field full"><label htmlFor="contact-message">Message</label><textarea id="contact-message" required placeholder="How can we help?" data-testid="textarea-contact-message" /></div></div><button className="btn btn-primary" type="submit" data-testid="button-submit-contact">Send enquiry <Send size={14} /></button></form></div></section></main>;
}
function ContactItem({ icon, label, value, href }: { icon: ReactNode; label: string; value: string; href?: string }) { return <div className="contact-item">{icon}<div><strong>{label}</strong>{href ? <a href={href} target="_blank" rel="noreferrer">{value}</a> : <span>{value}</span>}</div></div>; }

function Careers() {
  const jobs = readStore<Job[]>('maxglow_jobs', seedJobs).filter(job => !isExpired(job.endDate));
  return <main><section className="page-hero"><div className="container"><div className="eyebrow">Come work with us</div><h1>Good hands.<br /><em>Good energy.</em></h1></div></section><section className="container careers-layout"><div className="careers-intro"><div className="eyebrow">A place to grow</div><h2>Bring your<br />whole self.</h2><p>We’re building a small, thoughtful team that believes the details matter. If you’re curious, kind, and serious about helping people feel at home in their skin, we’d love to hear from you.</p><a className="btn btn-outline" style={{ marginTop: '20px' }} href={waLink('Hello Max Glow, I am interested in working with your team.')} target="_blank" rel="noreferrer" data-testid="link-careers-general">Introduce yourself <ArrowUpRight size={14} /></a></div><div className="jobs-list"><div className="eyebrow">Open roles · {jobs.length}</div>{jobs.length ? jobs.map(job => <JobCard key={job.id} job={job} />) : <div className="empty-state" data-testid="empty-jobs"><BriefcaseBusiness size={25} /><strong>No open roles right now.</strong><p>We’re always happy to meet good people. Send us a note anyway.</p></div>}</div></section></main>;
}
function JobCard({ job }: { job: Job }) {
  return <article className="job-card" data-testid={`card-job-${job.id}`}><div className="job-top"><div><h3>{job.title}</h3><div className="job-meta"><span>{job.type}</span><span>{job.location}</span></div></div><span className="tag">Apply by {prettyDate(job.endDate)}</span></div><p>{job.description}</p><a className="text-link" href={waLink(`Hello Max Glow, I would like to apply for the ${job.title} role.`)} target="_blank" rel="noreferrer" data-testid={`link-apply-${job.id}`}>Share your interest <ArrowUpRight size={14} /></a></article>;
}

function StaffLogin({ onLogin }: { onLogin: (user: string, title: string) => void }) {
  const [mode, setMode] = useState<'login' | 'request'>('login');
  const [form, setForm] = useState({ user: '', title: 'Employee', password: '' });
  const [message, setMessage] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      const approved = readStore<{ user: string; title: string; password: string }[]>('maxglow_approved', []);
      const account = approved.find(item => item.user === form.user && item.password === form.password);
      if (form.user === 'owner' && form.password === 'maxglow') onLogin('owner', 'Owner');
      else if (form.user === 'employee' && form.password === 'maxglow') onLogin('employee', 'Employee');
      else if (account) onLogin(account.user, account.title);
      else setMessage('That login didn’t match. Try the seeded owner access below.');
    } else {
      const requests = readStore<{ user: string; title: string; password: string; requestedAt: string }[]>('maxglow_requests', []);
      writeStore('maxglow_requests', [...requests, { user: form.user, title: form.title, password: form.password, requestedAt: new Date().toISOString() }]);
      setMessage('Access request sent. An owner can approve it from the control panel.');
    }
  };
  return <div className="staff-page"><div className="staff-login"><Link href="/" className="brand"><img src={logo} alt="Max Glow logo" /><span><span className="brand-name">Max Glow</span><span className="brand-sub">Private staff space</span></span></Link><div className="eyebrow">Team access</div><h1>{mode === 'login' ? 'Welcome back.' : 'Join the team.'}</h1><p>{mode === 'login' ? 'A quiet place to keep the atelier moving.' : 'Request access and an owner will review your details.'}</p><div className="staff-tabs"><button className={mode === 'login' ? 'active' : ''} onClick={() => { setMode('login'); setMessage(''); }} data-testid="button-staff-login-tab">Log in</button><button className={mode === 'request' ? 'active' : ''} onClick={() => { setMode('request'); setMessage(''); }} data-testid="button-staff-request-tab">Request access</button></div>{message && <div className="form-error" data-testid="status-staff-message">{message}</div>}<form onSubmit={submit}><div className="field"><label htmlFor="staff-user">Username</label><input id="staff-user" value={form.user} onChange={e => setForm({ ...form, user: e.target.value })} placeholder="Your username" required data-testid="input-staff-username" /></div>{mode === 'request' && <div className="field"><label htmlFor="staff-title">Your title</label><select id="staff-title" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} data-testid="select-staff-title"><option>Employee</option><option>Owner</option></select></div>}<div className="field"><label htmlFor="staff-password">Password</label><input id="staff-password" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Your password" required data-testid="input-staff-password" /></div><button className="btn btn-dark" type="submit" data-testid="button-submit-staff">{mode === 'login' ? 'Enter control panel' : 'Request approval'} <ArrowUpRight size={14} /></button></form>{mode === 'login' && <div className="demo-note"><strong>Seeded owner access</strong><br />Username: owner · Password: maxglow<br />Employee demo: employee · maxglow</div>}</div></div>;
}

function ControlPanel({ user, title, onLogout }: { user: string; title: string; onLogout: () => void }) {
  const [tab, setTab] = useState<'overview' | 'appointments' | 'jobs' | 'inbox'>('overview');
  const [appointments, setAppointments] = useState<Appointment[]>(() => readStore('maxglow_appointments', []));
  const [jobs, setJobs] = useState<Job[]>(() => readStore('maxglow_jobs', seedJobs));
  const [threads, setThreads] = useState<ChatThread[]>(() => readStore('maxglow_threads', [seedThread]));
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [selectedThread, setSelectedThread] = useState(threads[0]?.id || '');
  useEffect(() => writeStore('maxglow_jobs', jobs), [jobs]);
  useEffect(() => writeStore('maxglow_threads', threads), [threads]);
  useEffect(() => {
    fetchAppointments().then((items) => {
      setAppointments(items);
      writeStore('maxglow_appointments', items);
    }).catch(() => { });
  }, []);
  useEffect(() => {
    let lastValue = localStorage.getItem('maxglow_threads');
    const applyValue = (value: string | null) => {
      if (!value || value === lastValue) return;
      lastValue = value;
      try {
        setThreads(JSON.parse(value) as ChatThread[]);
      } catch { }
    };
    const syncThreads = (event: StorageEvent) => {
      if (event.key === 'maxglow_threads') applyValue(event.newValue);
    };
    window.addEventListener('storage', syncThreads);
    const poll = window.setInterval(() => applyValue(localStorage.getItem('maxglow_threads')), 500);
    return () => {
      window.removeEventListener('storage', syncThreads);
      window.clearInterval(poll);
    };
  }, []);
  const activeJobs = jobs.filter(job => !isExpired(job.endDate));
  const pendingRequests = readStore<{ user: string; title: string; password: string; requestedAt: string }[]>('maxglow_requests', []);
  const saveJob = (job: Job) => { setJobs(prev => editingJob ? prev.map(item => item.id === job.id ? job : item) : [job, ...prev]); setEditingJob(null); setShowJobForm(false); };
  const deleteJob = (id: string) => { if (window.confirm('Remove this role from the public careers page?')) setJobs(prev => prev.filter(job => job.id !== id)); };
  const reply = (text: string) => { if (!text.trim() || !selectedThread) return; setThreads(threads.map(thread => thread.id === selectedThread ? { ...thread, messages: [...thread.messages, { id: `m-${Date.now()}`, text: text.trim(), from: 'staff', at: 'Just now' }] } : thread)); };
  const currentThread = threads.find(item => item.id === selectedThread);
  return <div className="staff-page"><div className="container"><div className="panel-head"><div><div className="eyebrow">Private control panel</div><h1>Keep the glow<br /><em>in motion.</em></h1></div><div className="panel-user"><div><strong>{user}</strong><br /><span>{title} · <button className="text-link" onClick={onLogout} data-testid="button-staff-logout">Log out</button></span></div><div className="avatar">{user.slice(0, 2).toUpperCase()}</div></div></div><div className="panel-tabs">{[['overview', 'Overview', LayoutDashboard], ['appointments', 'Appointments', CalendarDays], ['jobs', 'Careers', BriefcaseBusiness], ['inbox', 'Patient chat', MessageCircle]].map(([key, label, Icon]) => <button className={tab === key ? 'active' : ''} key={key as string} onClick={() => setTab(key as typeof tab)} data-testid={`button-panel-${key}`}><span className="panel-tab-icon"><Icon size={16} /></span><span>{label as string}</span></button>)}</div>{tab === 'overview' && <><div className="panel-grid"><Stat label="Appointments" value={appointments.length} /><Stat label="Live roles" value={activeJobs.length} /><Stat label="Patient threads" value={threads.length} /></div><div className="data-card"><div className="data-card-head"><h2>Latest appointments</h2><button className="text-link" onClick={() => setTab('appointments')} data-testid="button-view-appointments">View all <ArrowUpRight size={14} /></button></div><AppointmentList appointments={appointments.slice(0, 4)} /></div></>}{tab === 'appointments' && <div className="data-card"><div className="data-card-head"><h2>Appointment enquiries</h2><span className="eyebrow">{appointments.length} total</span></div><AppointmentList appointments={appointments} /></div>}{tab === 'jobs' && <div className="data-card"><div className="data-card-head"><h2>Public roles</h2><button className="btn btn-primary btn-quiet" onClick={() => { setEditingJob(null); setShowJobForm(true); }} data-testid="button-add-job"><Plus size={14} /><span>Add role</span></button></div>{showJobForm && <JobForm job={editingJob} onSave={saveJob} onCancel={() => setShowJobForm(false)} />}{jobs.length ? <div className="admin-jobs">{jobs.map(job => <AdminJob key={job.id} job={job} onEdit={() => { setEditingJob(job); setShowJobForm(true); }} onDelete={() => deleteJob(job.id)} />)}</div> : <div className="empty-state"><BriefcaseBusiness size={25} /><strong>No roles yet.</strong><p>Add the first public opportunity for the team.</p></div>}</div>}{tab === 'inbox' && <div className="data-card"><div className="data-card-head"><h2>Patient chat</h2><span className="eyebrow">Persistent inbox</span></div>{threads.length ? <div className="inbox-layout"><div className="inbox-list">{threads.map(thread => <div className={`inbox-row ${selectedThread === thread.id ? 'selected' : ''}`} key={thread.id} onClick={() => setSelectedThread(thread.id)} data-testid={`row-thread-${thread.id}`}><strong>{thread.name}</strong><div className="row-muted">{thread.messages.at(-1)?.text}</div></div>)}</div><InboxDetail thread={currentThread} onReply={reply} /></div> : <div className="empty-state"><MessageCircle size={25} /><strong>Your inbox is quiet.</strong><p>Patient conversations will appear here.</p></div>}</div>}{pendingRequests.length > 0 && title === 'Owner' && <div className="data-card access-requests"><div className="data-card-head"><h2>Access requests</h2><span className="eyebrow">{pendingRequests.length} waiting</span></div>{pendingRequests.map((request, index) => <div className="appointment-row" key={`${request.user}-${index}`}><div><strong>{request.user}</strong><span className="row-muted">{request.title}</span></div><div className="row-muted">{prettyDate(request.requestedAt.slice(0, 10))}</div><div className="row-actions"><button className="small-btn" aria-label="Approve request" onClick={() => { const next = pendingRequests.filter((_, i) => i !== index); const approved = readStore<{ user: string; title: string; password: string }[]>('maxglow_approved', []); writeStore('maxglow_approved', [...approved, { user: request.user, title: request.title, password: request.password }]); writeStore('maxglow_requests', next); window.location.reload(); }} data-testid={`button-approve-request-${index}`}><Check size={14} /></button><button className="small-btn danger" aria-label="Decline request" onClick={() => { const next = pendingRequests.filter((_, i) => i !== index); writeStore('maxglow_requests', next); window.location.reload(); }} data-testid={`button-decline-request-${index}`}><X size={14} /></button></div></div>)}</div>}</div></div>;
}
function Stat({ label, value }: { label: string; value: number }) { return <div className="stat" data-testid={`stat-${label.toLowerCase().replace(' ', '-')}`}><span>{label}</span><strong>{value}</strong></div>; }
function AppointmentList({ appointments }: { appointments: Appointment[] }) { return appointments.length ? <div className="appointment-list">{appointments.map(apt => <div className="appointment-row" key={apt.id} data-testid={`row-appointment-${apt.id}`}><div><strong>{apt.name}</strong><span className="row-muted">{apt.phone} · {apt.treatment}</span></div><div><strong>{prettyDate(apt.date)}</strong><span className="row-muted">Preferred date</span></div><div className="row-muted">{apt.message || 'No additional message.'}</div><div><a className="small-btn" href={waLink(`Hello ${apt.name}, this is Max Glow following up on your appointment enquiry.`)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${apt.name}`} data-testid={`link-appointment-whatsapp-${apt.id}`}><MessageCircle size={14} /></a></div></div>)}</div> : <div className="empty-state"><CalendarDays size={25} /><strong>No appointments yet.</strong><p>New enquiries will arrive here.</p></div>; }
function AdminJob({ job, onEdit, onDelete }: { job: Job; onEdit: () => void; onDelete: () => void }) { return <div className="admin-job-row" data-testid={`row-admin-job-${job.id}`}><div><strong>{job.title}</strong><span className="row-muted">{job.type} · {job.location}</span></div><div><span className={`tag ${isExpired(job.endDate) ? 'expired' : ''}`}>{isExpired(job.endDate) ? 'Expired' : 'Live'}</span></div><div className="row-muted">Closes {prettyDate(job.endDate)}</div><div className="row-actions"><button className="small-btn" onClick={onEdit} aria-label={`Edit ${job.title}`} data-testid={`button-edit-job-${job.id}`}><Edit3 size={14} /></button><button className="small-btn danger" onClick={onDelete} aria-label={`Delete ${job.title}`} data-testid={`button-delete-job-${job.id}`}><Trash2 size={14} /></button></div></div>; }
function JobForm({ job, onSave, onCancel }: { job: Job | null; onSave: (job: Job) => void; onCancel: () => void }) {
  const [form, setForm] = useState<Job>(job || { id: `job-${Date.now()}`, title: '', type: 'Full-time', location: 'Islamabad · On site', description: '', endDate: '' });
  const update = (key: keyof Job, value: string) => setForm(prev => ({ ...prev, [key]: value }));
  return <form className="staff-form" onSubmit={e => { e.preventDefault(); onSave(form); }}><div className="staff-form-grid"><div className="field"><label>Role title</label><input value={form.title} onChange={e => update('title', e.target.value)} required data-testid="input-job-title" /></div><div className="field"><label>Type</label><select value={form.type} onChange={e => update('type', e.target.value)} data-testid="select-job-type"><option>Full-time</option><option>Part-time</option><option>Freelance</option></select></div><div className="field"><label>Location</label><input value={form.location} onChange={e => update('location', e.target.value)} required data-testid="input-job-location" /></div><div className="field"><label>End date</label><input type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} required data-testid="input-job-end-date" /></div><div className="field full"><label>Description</label><textarea value={form.description} onChange={e => update('description', e.target.value)} required data-testid="textarea-job-description" /></div></div><button className="btn btn-primary" type="submit" data-testid="button-save-job"><Check size={14} /> Save role</button><button className="btn btn-outline" type="button" onClick={onCancel} data-testid="button-cancel-job">Cancel</button></form>;
}
function InboxDetail({ thread, onReply }: { thread?: ChatThread; onReply: (text: string) => void }) {
  const [text, setText] = useState('');
  if (!thread) return <div className="locked-note"><UsersRound size={26} /><strong>Select a conversation.</strong></div>;
  return <div className="inbox-detail"><div className="inbox-detail-head"><strong>{thread.name}</strong><div className="row-muted">{thread.phone}</div></div><div className="inbox-detail-messages">{thread.messages.map(message => <div key={message.id} className={`chat-bubble ${message.from === 'staff' ? 'staff' : ''}`}>{message.text}<small>{message.at}</small></div>)}</div><form className="chat-form" onSubmit={e => { e.preventDefault(); onReply(text); setText(''); }}><input value={text} onChange={e => setText(e.target.value)} placeholder="Reply to patient..." data-testid="input-staff-reply" /><button aria-label="Send reply" data-testid="button-send-staff-reply"><Send size={15} /></button></form></div>;
}

function App() {
  const [location, setLocation] = useLocation();
  const [bookingOpen, setBookingOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>(() => readStore('maxglow_appointments', []));
  const [threads, setThreads] = useState<ChatThread[]>(() => readStore('maxglow_threads', [seedThread]));
  const [staff, setStaff] = useState<{ user: string; title: string } | null>(() => readStore('maxglow_staff', null));
  useEffect(() => writeStore('maxglow_appointments', appointments), [appointments]);
  useEffect(() => writeStore('maxglow_threads', threads), [threads]);
  useEffect(() => {
    let lastValue = localStorage.getItem('maxglow_threads');
    const applyValue = (value: string | null) => {
      if (!value || value === lastValue) return;
      lastValue = value;
      try {
        setThreads(JSON.parse(value) as ChatThread[]);
      } catch { }
    };
    const syncThreads = (event: StorageEvent) => {
      if (event.key === 'maxglow_threads') applyValue(event.newValue);
    };
    window.addEventListener('storage', syncThreads);
    const poll = window.setInterval(() => applyValue(localStorage.getItem('maxglow_threads')), 500);
    return () => {
      window.removeEventListener('storage', syncThreads);
      window.clearInterval(poll);
    };
  }, []);
  useEffect(() => { if (location === '/control-pannel' && staff) writeStore('maxglow_staff', staff); }, [location, staff]);
  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(null), 4200);
    return () => window.clearTimeout(timer);
  }, [toast]);
  const publicPage = location !== '/control-pannel';
  const saveAppointment = async (appointment: Appointment) => {
    let savedAppointment = appointment;
    try {
      const response = await fetch(APPOINTMENTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointment),
      });
      if (!response.ok) throw new Error('Unable to save appointment');
      savedAppointment = await response.json() as Appointment;
    } catch {
      writeStore('maxglow_appointments', [appointment, ...readStore<Appointment[]>('maxglow_appointments', [])]);
    }
    setAppointments(prev => [savedAppointment, ...prev]);
    setBookingOpen(false);
    setToast(`Thank you, ${savedAppointment.name}. We’ll review your request for ${prettyDate(savedAppointment.date)} and get back to you.`);
  };
  const shell = (page: ReactNode) => <>{publicPage && <SiteHeader onBook={() => setBookingOpen(true)} />}{page}{publicPage && <Footer onBook={() => setBookingOpen(true)} />}{publicPage && <ChatWidget threads={threads} setThreads={setThreads} />}{toast && <div className="site-toast" role="status" aria-live="polite"><CheckCircle2 size={18} /><span>{toast}</span><button onClick={() => setToast(null)} aria-label="Dismiss notification"><X size={14} /></button></div>}<BookingModal open={bookingOpen} onClose={() => setBookingOpen(false)} onSaved={saveAppointment} /></>;
  return <Switch>{<Route path="/our-story">{shell(<Story />)}</Route>}<Route path="/contact">{shell(<Contact onBook={() => setBookingOpen(true)} />)}</Route><Route path="/careers">{shell(<Careers />)}</Route><Route path="/control-pannel">{staff ? <ControlPanel user={staff.user} title={staff.title} onLogout={() => { setStaff(null); localStorage.removeItem('maxglow_staff'); setLocation('/'); }} /> : <StaffLogin onLogin={(user, title) => { setStaff({ user, title }); writeStore('maxglow_staff', { user, title }); }} />}</Route><Route path="/">{shell(<Home onBook={() => setBookingOpen(true)} />)}</Route><Route><div className="page-hero"><div className="container"><div className="eyebrow">404 · Page not found</div><h1>Let’s take you<br /><em>back to glow.</em></h1><Link className="btn btn-primary" href="/" data-testid="link-404-home">Back home <ArrowUpRight size={14} /></Link></div></div></Route></Switch>;
}

export default App;