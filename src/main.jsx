import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, Users, Wallet, BarChart3, Bell, ArrowUpRight, CheckCircle2, Clock3,
  HandHeart, Plus, LogIn, HeartHandshake, Share2, Download, Receipt, FileText,
  Upload, UserPlus, Lock, Check, Ban, ClipboardList, Scale, Shield, BookOpen,
  Vote, AlertTriangle, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import { isDemoMode } from './supabaseClient';
import './styles.css';

const governanceDocs = [
  {
    id: 'terms',
    title: 'Terms & Conditions',
    icon: Scale,
    version: 'v1.0',
    content: [
      'Payvand is a community support platform for rotating member contributions, emergency support, and transparent reporting.',
      'Members participate voluntarily and must understand that Payvand is not an investment platform, bank, credit institution, lottery, or profit-making scheme.',
      'Members are responsible for paying the agreed monthly contribution on time.',
      'After receiving a rotating fund payout, a member must continue paying until the end of the round unless the owner/admin approves an exceptional exit.',
      'Failure to pay may lead to warnings, suspension, removal from the queue, or exclusion from future rounds.',
      'The owner/admin may approve, reject, or request more information for payment receipts, emergency cases, and member applications.',
      'Payvand may change operational rules after member notice and voting where required.',
      'Users must not submit false information, fake receipts, misleading documents, or fraudulent emergency cases.'
    ]
  },
  {
    id: 'statutes',
    title: 'Community Charter / Statutes',
    icon: BookOpen,
    version: 'v1.0',
    content: [
      'The purpose of Payvand is to create a trusted, transparent, and human-centered support network.',
      'The platform has four main functions: member rotation fund, emergency fund, donations, and transparency reporting.',
      'The owner is responsible for governance, access control, payment approval, member approval, emergency case review, and audit records.',
      'A committee may be formed later with 3 to 5 trusted members for shared oversight.',
      'Normal decisions require simple majority voting. Major changes require at least 70% approval.',
      'Members have the right to view non-sensitive reports, queue order, general rules, and their own records.',
      'Sensitive information such as identity documents, receipts, and emergency case documents must be restricted to owner/admin access.',
      'Rules can be updated, but previous versions must remain archived for transparency.'
    ]
  },
  {
    id: 'privacy',
    title: 'Privacy Policy',
    icon: Shield,
    version: 'v1.0',
    content: [
      'Payvand collects member data such as name, email, phone, Telegram username, city, introducer, payment records, receipts, and emergency case documents.',
      'Only the owner/admin should access sensitive data.',
      'Members can only access their own personal data and public transparency information.',
      'Guest donors may donate anonymously or with a name, depending on the selected option.',
      'Documents uploaded for emergency cases must only be used for case review.',
      'Data should not be sold, shared publicly, or used for unrelated purposes.',
      'Sensitive documents should be deleted or archived securely after they are no longer needed.',
      'In production, Supabase Row Level Security must be enabled to enforce these access rules.'
    ]
  },
  {
    id: 'emergency',
    title: 'Emergency Fund Policy',
    icon: HandHeart,
    version: 'v1.0',
    content: [
      'The Emergency Fund is separate from the rotating member fund.',
      'Guest donations go directly to the Emergency Fund.',
      'Members may submit emergency cases with a title, short description, requested amount, urgency level, and supporting documents.',
      'The owner/admin reviews each case and may approve, reject, or request more documents.',
      'Priority should be based on urgency, evidence, vulnerability, and available emergency fund balance.',
      'Emergency support is not guaranteed and depends on available funds and approval.',
      'Personal details of emergency cases must remain confidential.',
      'Approved support should be recorded in reports without exposing sensitive private information.'
    ]
  },
  {
    id: 'rotation',
    title: 'Rotating Fund Rules',
    icon: Wallet,
    version: 'v1.0',
    content: [
      'The rotating fund queue shows who receives the monthly fund and when.',
      'The queue may be created by initial draw, agreement, or owner/admin scheduling.',
      'Only owner/admin can change the queue.',
      'Members can view the current and upcoming payout order.',
      'A member must be approved and up to date with payments before receiving payout.',
      'If a receiver has unpaid contributions or unresolved issues, the owner/admin may delay or skip the payout.',
      'The payout amount depends on the number of active members and monthly contribution amount.',
      'All payout decisions should be recorded in the audit log.'
    ]
  },
  {
    id: 'admin',
    title: 'Owner/Admin Policy',
    icon: Lock,
    version: 'v1.0',
    content: [
      'The owner has full access to member records, payment receipts, emergency cases, documents, queue settings, and reports.',
      'Admins, if added, should have limited permissions according to their role.',
      'Every sensitive action should be logged: approval, rejection, payout, queue change, member removal, and rule update.',
      'The owner must publish regular transparency reports.',
      'The owner must protect sensitive data and avoid sharing private documents in public groups.',
      'Conflicts of interest should be declared before approving emergency support.',
      'If the system grows, a 3-person oversight committee should be added for accountability.',
      'Admin access must be removed immediately if an admin leaves the project.'
    ]
  }
];

const initialMembers = [
  { id: 1, name: 'Ali', email: 'ali@email.com', phone: '+47 111 222', telegram: '@ali', city: 'Trondheim', role: 'owner', status: 'approved', payment: 'paid', score: 96, agreed: true },
  { id: 2, name: 'Sara', email: 'sara@email.com', phone: '+47 333 444', telegram: '@sara', city: 'Oslo', role: 'member', status: 'approved', payment: 'paid', score: 91, agreed: true },
  { id: 3, name: 'Reza', email: 'reza@email.com', phone: '+47 555 666', telegram: '@reza', city: 'Bergen', role: 'member', status: 'approved', payment: 'pending', score: 82, agreed: true },
  { id: 4, name: 'Mina', email: 'mina@email.com', phone: '+47 777 888', telegram: '@mina', city: 'Trondheim', role: 'member', status: 'pending', payment: 'not paid', score: 70, agreed: false },
];

const initialQueue = [
  { id: 1, month: 'June', member: 'Sara', amount: 7500, status: 'confirmed', active: true },
  { id: 2, month: 'July', member: 'Reza', amount: 7500, status: 'upcoming' },
  { id: 3, month: 'August', member: 'Mina', amount: 7500, status: 'upcoming' },
];

const initialPayments = [
  { id: 1, member: 'Sara', amount: 500, method: 'Vipps', receipt: 'receipt_sara_june.pdf', status: 'approved', date: 'June 02' },
  { id: 2, member: 'Reza', amount: 500, method: 'Bank transfer', receipt: 'receipt_reza_june.png', status: 'pending', date: 'June 04' },
];

const initialCases = [
  { id: 1, member: 'Reza', title: 'Temporary rent support', description: 'Need short-term support due to delayed salary.', amount: 2500, urgency: 'High', status: 'pending', documents: ['salary_delay.pdf'] },
  { id: 2, member: 'Sara', title: 'Medical bill support', description: 'Requesting help for urgent medical expense.', amount: 1800, urgency: 'Medium', status: 'approved', documents: ['invoice.pdf'] },
];

function PayvandApp() {
  const [tab, setTab] = useState('landing');
  const [members, setMembers] = useState(initialMembers);
  const [queue] = useState(initialQueue);
  const [payments, setPayments] = useState(initialPayments);
  const [donations, setDonations] = useState([{ id: 1, donor: 'Anonymous', amount: 250, date: 'Today' }]);
  const [cases, setCases] = useState(initialCases);
  const [auditLogs, setAuditLogs] = useState([
    { id: 1, action: 'System initialized with governance v1.0', time: 'Today' }
  ]);
  const [toast, setToast] = useState('');
  const [selectedDoc, setSelectedDoc] = useState(governanceDocs[0]);
  const [selectedDonation, setSelectedDonation] = useState(250);
  const [customDonation, setCustomDonation] = useState('');
  const [currentUser, setCurrentUser] = useState({ name: 'Alireza', email: 'owner@payvand.app', role: 'owner' });

  const isOwner = currentUser?.role === 'owner';
  const emergencyBalance = 1200 + donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2600); };
  const log = (action) => setAuditLogs(prev => [{ id: Date.now(), action, time: 'Now' }, ...prev]);

  const approvePayment = (id) => {
    const payment = payments.find(p => p.id === id);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'approved' } : p));
    if (payment) setMembers(prev => prev.map(m => m.name === payment.member ? { ...m, payment: 'paid', score: Math.min(100, m.score + 4) } : m));
    log(`Owner approved payment for ${payment?.member || 'member'}`);
    showToast('Payment approved.');
  };

  const rejectPayment = (id) => {
    const payment = payments.find(p => p.id === id);
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'rejected' } : p));
    log(`Owner rejected payment for ${payment?.member || 'member'}`);
    showToast('Payment rejected.');
  };

  const approveMember = (id) => {
    const member = members.find(m => m.id === id);
    setMembers(prev => prev.map(m => m.id === id ? { ...m, status: 'approved' } : m));
    log(`Owner approved member ${member?.name || ''}`);
    showToast('Member approved.');
  };

  const addMember = (data) => {
    const next = { id: Date.now(), ...data, role: 'member', status: 'pending', payment: 'not paid', score: 70, agreed: data.agreed };
    setMembers(prev => [next, ...prev]);
    log(`New member application submitted by ${data.name}`);
    showToast('Member application submitted.');
  };

  const submitReceipt = () => {
    const next = { id: Date.now(), member: currentUser.name, amount: 500, method: 'Manual upload', receipt: 'uploaded_receipt_demo.pdf', status: 'pending', date: 'Now' };
    setPayments(prev => [next, ...prev]);
    log(`${currentUser.name} submitted a payment receipt`);
    showToast('Receipt submitted for owner approval.');
  };

  const donate = () => {
    const amount = Number(customDonation || selectedDonation);
    if (!amount || amount <= 0) return showToast('Please choose a valid amount.');
    setDonations(prev => [{ id: Date.now(), donor: 'Guest', amount, date: 'Now' }, ...prev]);
    setCustomDonation('');
    log(`Guest donation added: ${amount} NOK`);
    showToast(`${amount} NOK added to Emergency Fund.`);
  };

  const submitCase = (data) => {
    setCases(prev => [{ id: Date.now(), ...data, member: currentUser.name, status: 'pending' }, ...prev]);
    log(`${currentUser.name} submitted emergency case: ${data.title}`);
    showToast('Emergency case submitted for review.');
  };

  const approveCase = (id) => {
    const c = cases.find(x => x.id === id);
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'approved' } : c));
    log(`Owner approved emergency case: ${c?.title || ''}`);
    showToast('Emergency case approved.');
  };

  const rejectCase = (id) => {
    const c = cases.find(x => x.id === id);
    setCases(prev => prev.map(c => c.id === id ? { ...c, status: 'rejected' } : c));
    log(`Owner rejected emergency case: ${c?.title || ''}`);
    showToast('Emergency case rejected.');
  };

  const exportGovernance = () => {
    const text = governanceDocs.map(d => `# ${d.title} (${d.version})\n\n${d.content.map((x,i)=>`${i+1}. ${x}`).join('\n')}`).join('\n\n---\n\n');
    const blob = new Blob([text], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payvand-governance.md'; a.click();
    URL.revokeObjectURL(url);
    showToast('Governance document downloaded.');
  };

  const exportReport = () => {
    const csv = [
      'Metric,Value',
      `Members,${members.length}`,
      `Approved members,${members.filter(m=>m.status==='approved').length}`,
      `Payments,${payments.length}`,
      `Emergency Fund,${emergencyBalance} NOK`,
      `Emergency Cases,${cases.length}`,
      `Audit Logs,${auditLogs.length}`
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'payvand-report.csv'; a.click();
    URL.revokeObjectURL(url);
    showToast('Report downloaded.');
  };

  const props = { setTab, members, queue, payments, donations, cases, auditLogs, emergencyBalance, selectedDonation, setSelectedDonation, customDonation, setCustomDonation, donate, exportReport, selectedDoc, setSelectedDoc, exportGovernance, currentUser, setCurrentUser, isOwner, approvePayment, rejectPayment, approveMember, addMember, submitReceipt, submitCase, approveCase, rejectCase, showToast };

  const nav = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'fund', icon: Wallet, label: 'Fund' },
    { id: 'cases', icon: ClipboardList, label: 'Cases' },
    { id: 'governance', icon: Scale, label: 'Rules' },
    { id: 'admin', icon: Lock, label: 'Admin' },
  ];
  const appTabs = ['home', 'fund', 'donate', 'members', 'reports', 'admin', 'cases', 'queue', 'join', 'governance'];

  return (
    <div className="page">
      <div className="phone">
        <div className="hero-bg" />
        <div className="content">
          <Header setTab={setTab} showToast={showToast} currentUser={currentUser} />
          {isDemoMode && <div className="demo-banner">Demo mode: data is stored only in browser memory. Connect Supabase for real storage.</div>}
          {tab === 'landing' && <LandingScreen {...props} />}
          {tab === 'login' && <LoginScreen {...props} />}
          {tab === 'home' && <HomeScreen {...props} />}
          {tab === 'fund' && <FundScreen {...props} />}
          {tab === 'donate' && <DonateScreen {...props} />}
          {tab === 'members' && <MembersScreen {...props} />}
          {tab === 'reports' && <ReportsScreen {...props} />}
          {tab === 'admin' && <AdminScreen {...props} />}
          {tab === 'cases' && <CasesScreen {...props} />}
          {tab === 'queue' && <QueueScreen {...props} />}
          {tab === 'join' && <JoinScreen {...props} />}
          {tab === 'governance' && <GovernanceScreen {...props} />}
        </div>

        {appTabs.includes(tab) && tab !== 'landing' && tab !== 'login' && (
          <nav className="bottom-nav">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)} className={active ? 'nav-item active' : 'nav-item'}>
                  <span><Icon size={20} /></span>{item.label}
                </button>
              );
            })}
          </nav>
        )}
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

function Header({ setTab, showToast, currentUser }) {
  return (
    <header className="header">
      <button className="brand brand-button" onClick={() => setTab('landing')}>
        <img className="logo-img" src="/logo.svg" alt="Payvand logo" />
        <div><h1><span>Pay</span>vand</h1><p>{currentUser?.role === 'owner' ? 'Owner access' : 'Community member'}</p></div>
      </button>
      <button className="icon-btn" onClick={() => showToast('Notifications will appear here.')}><Bell size={20} /></button>
    </header>
  );
}

function LandingScreen({ setTab }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack landing">
      <div className="card glass">
        <HeartHandshake size={42} />
        <h2>Community fund, built on trust.</h2>
        <p>Manage rotating contributions, emergency cases, donations, member approvals, payment approvals, governance rules, and transparent audit logs.</p>
        <button className="primary" onClick={() => setTab('login')}>Login / Register</button>
        <button className="secondary" onClick={() => setTab('join')}>Apply as Member</button>
        <button className="secondary" onClick={() => setTab('governance')}>Read Rules</button>
        <button className="secondary" onClick={() => setTab('donate')}>Donate as Guest</button>
      </div>
    </motion.div>
  );
}

function LoginScreen({ setTab, setCurrentUser }) {
  const [mode, setMode] = useState('owner');
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack login">
    <div className="card"><h2>Login</h2><p className="muted">Demo role switch. Production login should use Supabase Auth.</p>
      <select value={mode} onChange={e => setMode(e.target.value)}><option value="owner">Owner / Admin</option><option value="member">Member</option></select>
      <input placeholder="Email address" /><input placeholder="Password" type="password" />
      <button className="primary" onClick={() => { setCurrentUser(mode === 'owner' ? {name:'Alireza', email:'owner@payvand.app', role:'owner'} : {name:'Member', email:'member@email.com', role:'member'}); setTab('home'); }}><LogIn size={18} /> Continue</button>
    </div>
  </motion.div>
}

function HomeScreen({ setTab, queue, emergencyBalance }) {
  const next = queue.find(q => q.active) || queue[0];
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack">
    <div className="card"><div className="split"><div><p className="muted">Current Pool</p><h2>{next.amount.toLocaleString()} NOK</h2><p className="tiny">Rotating fund round</p></div><div className="soft-icon"><Wallet /></div></div>
      <div className="actions"><button className="primary" onClick={() => setTab('fund')}>Submit Payment</button><button className="secondary" onClick={() => setTab('queue')}>View Queue</button></div></div>
    <div className="card"><div className="split mb"><h3>Next Receiver</h3><span className="pill ok">{next.status}</span></div>
      <button className="person person-button" onClick={() => setTab('queue')}><div className="avatar">{next.member[0]}</div><div><b>{next.member}</b><p>{next.month} payout · {next.amount.toLocaleString()} NOK</p></div><ArrowUpRight className="muted-icon" /></button></div>
    <div className="feature-grid"><button className="mini-card clickable" onClick={() => setTab('cases')}><ClipboardList size={20}/><p>Emergency Cases</p><b>Submit</b></button><button className="mini-card clickable" onClick={() => setTab('donate')}><HandHeart size={20}/><p>Emergency Fund</p><b>{emergencyBalance} NOK</b></button></div>
  </motion.div>
}

function FundScreen({ payments, emergencyBalance, submitReceipt }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
    <div className="card"><h2>Fund & Payments</h2><p className="muted">Members upload receipts. Owner approves from Admin Panel.</p><FundRow label="Monthly contribution" value="500 NOK" percent="100%" /><FundRow label="Emergency reserve" value={`${emergencyBalance} NOK`} percent="45%" /><button className="primary full" onClick={submitReceipt}><Upload size={17}/> Upload Payment Receipt</button></div>
    <div className="card"><h3>Payment Records</h3>{payments.map(p => <PaymentRow key={p.id} p={p} />)}</div>
  </motion.div>
}

function QueueScreen({ queue }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
    <div className="card"><h2>Fund Rotation Queue</h2><p className="muted">Owner/admin can edit this order. Members can view the confirmed receiver.</p></div>
    {queue.map(q => <div className={q.active ? 'queue active' : 'queue'} key={q.id}><div className="month">{q.month.slice(0,3)}</div><div><b>{q.member}</b><p>{q.amount.toLocaleString()} NOK · {q.status}</p></div>{q.active ? <CheckCircle2 className="green-text"/> : <Clock3 className="muted-icon"/>}</div>)}
  </motion.div>
}

function DonateScreen({ donations, emergencyBalance, selectedDonation, setSelectedDonation, customDonation, setCustomDonation, donate, showToast }) {
  const shareDonation = async () => { try { await navigator.clipboard.writeText(window.location.href); showToast('Donation link copied.'); } catch { showToast('Copy failed.'); } };
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
    <div className="card"><div className="split"><div><p className="muted">Guest Donation</p><h2>Support Emergency Fund</h2><p className="muted">Non-members can donate. Donations are separated from the rotating member fund.</p></div><div className="soft-icon"><HandHeart /></div></div>
      <div className="balance"><p>Emergency Fund Balance</p><h2>{emergencyBalance} NOK</h2><span>Guest donations + reserve</span></div>
      <div className="amount-grid">{[100,250,500].map(amount => <button key={amount} onClick={() => {setSelectedDonation(amount); setCustomDonation('')}} className={selectedDonation === amount && !customDonation ? 'selected' : ''}>{amount} NOK</button>)}</div>
      <div className="custom-amount"><span>Custom amount</span><input value={customDonation} onChange={e=>setCustomDonation(e.target.value.replace(/\D/g,''))} placeholder="0 NOK"/></div>
      <button className="primary full green" onClick={donate}>Donate to Emergency Fund</button><button className="secondary full" onClick={shareDonation}><Share2 size={17}/> Share Donation Link</button></div>
    <div className="card"><h3>Recent Donations</h3>{donations.map(d => <div className="donation" key={d.id}><div className="person compact"><div className="mini-icon"><HandHeart size={16}/></div><div><b>{d.donor}</b><p>{d.date}</p></div></div><b className="green-text">{d.amount} NOK</b></div>)}</div>
  </motion.div>
}

function CasesScreen({ cases, submitCase, isOwner, approveCase, rejectCase }) {
  const [form, setForm] = useState({ title:'', description:'', amount:'', urgency:'Medium', documents:'' });
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
    <div className="card"><h2>Emergency Cases</h2><p className="muted">Members can submit a case with description and proof documents.</p>
      <input placeholder="Case title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/><textarea placeholder="Short description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/><input placeholder="Requested amount NOK" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value.replace(/\D/g,'')})}/><select value={form.urgency} onChange={e=>setForm({...form,urgency:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select><input placeholder="Document names, e.g. invoice.pdf" value={form.documents} onChange={e=>setForm({...form,documents:e.target.value})}/>
      <button className="primary full" onClick={() => { if(!form.title) return; submitCase({...form, amount:Number(form.amount||0), documents: form.documents ? form.documents.split(',').map(x=>x.trim()) : []}); setForm({ title:'', description:'', amount:'', urgency:'Medium', documents:'' }); }}><FileText size={17}/> Submit Case</button></div>
    <div className="card"><h3>Submitted Cases</h3>{cases.map(c => <CaseRow key={c.id} c={c} isOwner={isOwner} approveCase={approveCase} rejectCase={rejectCase}/>)}</div>
  </motion.div>
}

function GovernanceScreen({ selectedDoc, setSelectedDoc, exportGovernance }) {
  const Icon = selectedDoc.icon;
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
    <div className="card"><h2>Governance & Terms</h2><p className="muted">Rules, statutes, privacy, emergency fund policy and rotating fund conditions.</p><button className="primary full" onClick={exportGovernance}><Download size={17}/> Download Governance</button></div>
    <div className="doc-tabs">{governanceDocs.map(d => { const DIcon = d.icon; return <button key={d.id} onClick={() => setSelectedDoc(d)} className={selectedDoc.id === d.id ? 'doc-tab active-doc' : 'doc-tab'}><DIcon size={16}/>{d.title}</button> })}</div>
    <div className="card"><div className="doc-title"><Icon size={24}/><div><h3>{selectedDoc.title}</h3><p className="tiny">{selectedDoc.version}</p></div></div><ol className="policy-list">{selectedDoc.content.map((item, i) => <li key={i}>{item}</li>)}</ol></div>
  </motion.div>
}

function MembersScreen({ members, setTab }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space"><div className="split"><h2 className="white-title">Members</h2><button className="white-btn" onClick={() => setTab('join')}><Plus size={18}/></button></div><div className="card">{members.map(m => <div className="member" key={m.id}><div className="avatar small">{m.name[0]}</div><div><b>{m.name}</b><p>{m.role} · {m.city} · Score {m.score}</p></div><span className={m.status === 'approved' ? 'pill ok' : 'pill warn'}>{m.status}</span></div>)}</div></motion.div>
}

function JoinScreen({ addMember, setTab }) {
  const [f, setF] = useState({ name:'', email:'', phone:'', telegram:'', city:'', introduced_by:'', agreed:false });
  const update = (k,v) => setF({...f,[k]:v});
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
    <div className="card"><h2>Member Application</h2><p className="muted">Applications are pending until owner approval. Agreement to Payvand rules is required.</p>
      {['name','email','phone','telegram','city','introduced_by'].map(k => <input key={k} placeholder={k.replace('_',' ')} value={f[k]} onChange={e=>update(k,e.target.value)}/>)}
      <label className="check-row"><input type="checkbox" checked={f.agreed} onChange={e=>update('agreed',e.target.checked)}/> I agree to Payvand Terms, Privacy Policy, Rotating Fund Rules, and Emergency Fund Policy.</label>
      <button className="primary full" disabled={!f.agreed || !f.name} onClick={() => { addMember(f); setTab('members'); }}><UserPlus size={17}/> Submit Application</button></div>
  </motion.div>
}

function AdminScreen({ isOwner, members, payments, cases, auditLogs, approvePayment, rejectPayment, approveMember, approveCase, rejectCase, exportReport, setTab }) {
  if (!isOwner) return <motion.div className="stack top-space"><div className="card"><Lock size={32}/><h2>Owner Only</h2><p className="muted">Only the owner/admin can access member data, payment approval and case approval.</p></div></motion.div>;
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
    <div className="card"><h2>Owner Admin Panel</h2><p className="muted">Approve members, payments, emergency cases, review rules and export reports.</p><button className="primary full" onClick={exportReport}><Download size={17}/> Export Report</button><button className="secondary full" onClick={()=>setTab('governance')}><Scale size={17}/> Open Governance</button></div>
    <div className="card"><h3>Pending Members</h3>{members.filter(m=>m.status==='pending').map(m => <AdminLine key={m.id} title={m.name} sub={`${m.email} · agreed: ${m.agreed ? 'yes' : 'no'}`} onApprove={()=>approveMember(m.id)} />)}</div>
    <div className="card"><h3>Payment Approval</h3>{payments.map(p => <AdminLine key={p.id} title={`${p.member} · ${p.amount} NOK`} sub={`${p.method} · ${p.receipt} · ${p.status}`} onApprove={()=>approvePayment(p.id)} onReject={()=>rejectPayment(p.id)} />)}</div>
    <div className="card"><h3>Case Review</h3>{cases.map(c => <AdminLine key={c.id} title={`${c.title} · ${c.amount} NOK`} sub={`${c.member} · ${c.urgency} · ${c.status}`} onApprove={()=>approveCase(c.id)} onReject={()=>rejectCase(c.id)} />)}</div>
    <div className="card"><h3>Audit Logs</h3>{auditLogs.map(l => <div className="audit" key={l.id}><Eye size={15}/><span>{l.action}</span><small>{l.time}</small></div>)}</div>
  </motion.div>
}

function ReportsScreen({ members, payments, cases, emergencyBalance, auditLogs, exportReport }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space"><div className="card"><h2>Transparency Report</h2><p className="muted">Public summary without exposing sensitive private data.</p><div className="feature-grid"><MiniCard icon={Users} title="Members" value={members.length}/><MiniCard icon={Receipt} title="Payments" value={payments.length}/><MiniCard icon={ClipboardList} title="Cases" value={cases.length}/><MiniCard icon={HandHeart} title="Emergency" value={emergencyBalance}/></div><button className="primary full" onClick={exportReport}><Download size={17}/> Export Report</button></div></motion.div>
}

function AdminLine({ title, sub, onApprove, onReject }) { return <div className="admin-line"><div><b>{title}</b><p>{sub}</p></div><div className="row-actions">{onApprove && <button className="small-ok" onClick={onApprove}><Check size={15}/></button>}{onReject && <button className="small-reject" onClick={onReject}><Ban size={15}/></button>}</div></div> }
function CaseRow({ c, isOwner, approveCase, rejectCase }) { return <div className="case-row"><div><b>{c.title}</b><p>{c.description}</p><span>{c.member} · {c.amount} NOK · {c.urgency} · {c.status}</span><small>Docs: {c.documents?.join(', ') || 'None'}</small></div>{isOwner && <div className="row-actions"><button className="small-ok" onClick={()=>approveCase(c.id)}><Check size={15}/></button><button className="small-reject" onClick={()=>rejectCase(c.id)}><Ban size={15}/></button></div>}</div> }
function PaymentRow({ p }) { return <div className="payment-member"><div><b>{p.member}</b><p>{p.amount} NOK · {p.method} · {p.receipt}</p></div><span className={p.status==='approved'?'pill ok':p.status==='pending'?'pill warn':'pill neutral'}>{p.status}</span></div> }
function MiniCard({ icon: Icon, title, value }) { return <div className="mini-card"><Icon size={20}/><p>{title}</p><b>{value}</b></div> }
function FundRow({ label, value, percent }) { return <div className="fund-row"><div><span>{label}</span><b>{value}</b></div><div className="bar"><span style={{width:percent}} /></div></div> }

createRoot(document.getElementById('root')).render(<PayvandApp />);
