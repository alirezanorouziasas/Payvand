import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, Users, Wallet, BarChart3, Bell, CheckCircle2, Clock3, HandHeart, Lock,
  LogIn, Upload, UserPlus, Download, ClipboardList, Scale, ShieldCheck, Eye,
  Check, Ban, FileText, Smartphone, CreditCard, Activity, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { demoMode, signIn, signUp, signOut, getSession } from './lib/supabase';
import { list, insert, update, uploadFile, audit, paymentOptions } from './lib/api';
import './styles.css';

const ownerEmail = 'owner@payvand.app';

function App() {
  const [tab, setTab] = useState('home');
  const [user, setUser] = useState({ email: ownerEmail, role: 'owner', name: 'Alireza' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [data, setData] = useState({ members: [], payments: [], donations: [], cases: [], queue: [], audit_logs: [] });

  const isOwner = user?.role === 'owner' || user?.email === ownerEmail;
  const emergencyFund = 1200 + data.donations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const pendingPayments = data.payments.filter(p => p.status === 'pending').length;
  const pendingCases = data.cases.filter(c => c.status === 'pending').length;
  const nextReceiver = data.queue.find(q => q.status === 'confirmed') || data.queue[0];

  function show(msg) { setToast(msg); setTimeout(() => setToast(''), 2600); }

  async function load() {
    setLoading(true);
    try {
      const [members, payments, donations, cases, queue, audit_logs] = await Promise.all([
        list('members'), list('payments'), list('donations'), list('cases'), list('queue'), list('audit_logs')
      ]);
      setData({ members, payments, donations, cases, queue, audit_logs });
    } catch (e) { show(e.message); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function approve(table, id, label) {
    await update(table, id, { status: 'approved' });
    await audit(`Approved ${label}: ${id}`, user.email);
    await load();
    show('Approved.');
  }
  async function reject(table, id, label) {
    await update(table, id, { status: 'rejected' });
    await audit(`Rejected ${label}: ${id}`, user.email);
    await load();
    show('Rejected.');
  }

  function exportReport() {
    const rows = [
      ['Metric', 'Value'],
      ['Members', data.members.length],
      ['Payments', data.payments.length],
      ['Donations', data.donations.length],
      ['Emergency cases', data.cases.length],
      ['Emergency fund', emergencyFund],
      ['Pending payments', pendingPayments],
      ['Pending cases', pendingCases]
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payvand-transparency-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    show('CSV report exported.');
  }

  const props = { tab, setTab, user, setUser, data, load, isOwner, emergencyFund, nextReceiver, pendingPayments, pendingCases, show, approve, reject, exportReport };

  const nav = [
    ['home', Home, 'Home'],
    ['fund', Wallet, 'Fund'],
    ['cases', ClipboardList, 'Cases'],
    ['admin', Lock, 'Admin'],
    ['analytics', BarChart3, 'Stats'],
  ];

  return (
    <div className="page">
      <div className="phone">
        <div className="hero-bg" />
        <div className="content">
          <Header setTab={setTab} user={user} show={show} loading={loading} load={load} />
          {demoMode && <div className="demo">Demo mode: connect Supabase env variables for real database, auth, storage, RLS and audit logs.</div>}
          {tab === 'home' && <HomeScreen {...props} />}
          {tab === 'auth' && <AuthScreen {...props} />}
          {tab === 'fund' && <FundScreen {...props} />}
          {tab === 'cases' && <CasesScreen {...props} />}
          {tab === 'donate' && <DonateScreen {...props} />}
          {tab === 'admin' && <AdminScreen {...props} />}
          {tab === 'analytics' && <AnalyticsScreen {...props} />}
          {tab === 'governance' && <GovernanceScreen />}
        </div>
        <nav className="bottom-nav">
          {nav.map(([id, Icon, label]) => (
            <button key={id} onClick={() => setTab(id)} className={tab === id ? 'nav active' : 'nav'}>
              <Icon size={20} /><span>{label}</span>
            </button>
          ))}
        </nav>
        {toast && <div className="toast">{toast}</div>}
      </div>
    </div>
  );
}

function Header({ setTab, user, show, loading, load }) {
  return (
    <header className="header">
      <button className="brand" onClick={() => setTab('home')}>
        <img src="/logo.svg" alt="Payvand" />
        <div><h1><span>Pay</span>vand</h1><p>{user?.role || 'guest'} access</p></div>
      </button>
      <div className="header-actions">
        <button onClick={load} className="icon">{loading ? <RefreshCw className="spin" size={18}/> : <RefreshCw size={18}/>}</button>
        <button onClick={() => show('Push notifications are scaffolded. Enable service worker later.')} className="icon"><Bell size={18}/></button>
      </div>
    </header>
  );
}

function HomeScreen({ setTab, emergencyFund, nextReceiver, pendingPayments, pendingCases, data }) {
  return <motion.div className="stack" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card>
      <div className="split"><div><p className="muted">Current rotating fund</p><h2>{nextReceiver?.amount || 7500} NOK</h2><p className="tiny">Next payout: {nextReceiver?.member_name || 'Not set'}</p></div><Wallet className="big-icon"/></div>
      <div className="actions"><button className="primary" onClick={() => setTab('fund')}>Submit Payment</button><button className="secondary" onClick={() => setTab('donate')}>Donate</button></div>
    </Card>
    <div className="grid2">
      <Mini icon={HandHeart} title="Emergency Fund" value={`${emergencyFund} NOK`} />
      <Mini icon={Clock3} title="Pending Approvals" value={pendingPayments + pendingCases} />
    </div>
    <Card>
      <h3>Next Receiver</h3>
      <div className="row"><div className="avatar">{(nextReceiver?.member_name || 'S')[0]}</div><div><b>{nextReceiver?.member_name || 'Sara'}</b><p>{nextReceiver?.payout_month || 'June'} · {nextReceiver?.status || 'confirmed'}</p></div></div>
    </Card>
    <Card><h3>Quick Actions</h3><button className="secondary full" onClick={() => setTab('governance')}>Read Terms & Governance</button><button className="secondary full" onClick={() => setTab('analytics')}>Open Analytics</button></Card>
  </motion.div>
}

function AuthScreen({ setUser, setTab, show }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  async function submit() {
    try {
      if (demoMode) {
        setUser({ email: form.email || ownerEmail, role: (form.email || '').includes('owner') ? 'owner' : 'member', name: form.name || 'User' });
      } else {
        if (mode === 'signup') await signUp(form.email, form.password, form.name);
        else await signIn(form.email, form.password);
      }
      show('Authenticated.');
      setTab('home');
    } catch(e) { show(e.message); }
  }
  return <Screen title="Authentication" subtitle="Real Supabase authentication is wired. Add env variables to enable.">
    <input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>
    <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
    <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
    <button className="primary full" onClick={submit}><LogIn size={17}/> {mode === 'signup' ? 'Sign up' : 'Sign in'}</button>
    <button className="secondary full" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Switch to sign in' : 'Switch to sign up'}</button>
  </Screen>
}

function FundScreen({ data, load, show }) {
  const [file, setFile] = useState(null);
  const [amount, setAmount] = useState('500');
  async function submitReceipt() {
    try {
      let url = '';
      if (file) {
        const uploaded = await uploadFile('receipts', `receipts/${Date.now()}-${file.name}`, file);
        url = uploaded.publicUrl;
      }
      await insert('payments', { member_name: 'Current user', amount: Number(amount), method: 'Manual/Vipps/Bank', receipt_url: url || 'no file uploaded', status: 'pending' });
      await audit('Submitted payment receipt', 'current user');
      await load();
      show('Receipt submitted.');
    } catch(e) { show(e.message); }
  }
  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card><h2>Payment & File Upload</h2><p className="muted">Upload a receipt. Owner approves it in Admin.</p>
      <input value={amount} onChange={e=>setAmount(e.target.value.replace(/\D/g,''))} placeholder="Amount NOK"/>
      <input type="file" onChange={e=>setFile(e.target.files?.[0])}/>
      <button className="primary full" onClick={submitReceipt}><Upload size={17}/> Submit Receipt</button>
    </Card>
    <Card><h3>Payment Records</h3>{data.payments.map(p => <Row key={p.id} title={`${p.member_name || 'Member'} · ${p.amount} NOK`} sub={`${p.status} · ${p.receipt_url || 'no receipt'}`} status={p.status}/>)}</Card>
  </motion.div>
}

function CasesScreen({ data, load, show }) {
  const [form, setForm] = useState({ title:'', description:'', requested_amount:'', urgency:'Medium' });
  const [file, setFile] = useState(null);
  async function submitCase() {
    try {
      let doc = '';
      if (file) {
        const uploaded = await uploadFile('case-documents', `cases/${Date.now()}-${file.name}`, file);
        doc = uploaded.publicUrl;
      }
      await insert('cases', { ...form, requested_amount: Number(form.requested_amount || 0), member_name: 'Current user', document_url: doc, status: 'pending' });
      await audit(`Submitted emergency case: ${form.title}`, 'current user');
      await load();
      show('Case submitted.');
      setForm({ title:'', description:'', requested_amount:'', urgency:'Medium' });
    } catch(e) { show(e.message); }
  }
  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card><h2>Emergency Case</h2><p className="muted">Submit a case with description and proof documents.</p>
      <input placeholder="Case title" value={form.title} onChange={e=>setForm({...form,title:e.target.value})}/>
      <textarea placeholder="Short description" value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/>
      <input placeholder="Requested amount NOK" value={form.requested_amount} onChange={e=>setForm({...form,requested_amount:e.target.value.replace(/\D/g,'')})}/>
      <select value={form.urgency} onChange={e=>setForm({...form,urgency:e.target.value})}><option>Low</option><option>Medium</option><option>High</option><option>Urgent</option></select>
      <input type="file" onChange={e=>setFile(e.target.files?.[0])}/>
      <button className="primary full" onClick={submitCase}><FileText size={17}/> Submit Case</button>
    </Card>
    <Card><h3>Cases</h3>{data.cases.map(c => <Row key={c.id} title={`${c.title} · ${c.requested_amount} NOK`} sub={`${c.member_name || 'Member'} · ${c.urgency} · ${c.status}`} status={c.status}/>)}</Card>
  </motion.div>
}

function DonateScreen({ data, load, show }) {
  const [amount, setAmount] = useState('250');
  const opts = paymentOptions();
  async function donate() {
    try {
      await insert('donations', { donor_name: 'Guest', amount: Number(amount), emergency_fund: true });
      await audit(`Donation submitted: ${amount} NOK`, 'guest');
      await load();
      show('Donation recorded.');
    } catch(e) { show(e.message); }
  }
  return <Screen title="Donate to Emergency Fund" subtitle="Guest donations are separate from member rotation funds.">
    <input value={amount} onChange={e=>setAmount(e.target.value.replace(/\D/g,''))} placeholder="Amount NOK"/>
    <button className="primary full" onClick={donate}><HandHeart size={17}/> Record Donation</button>
    {opts.stripe && <a className="secondary full link" href={opts.stripe} target="_blank">Pay by Stripe</a>}
    <p className="muted">Vipps: {opts.vipps || 'add VITE_VIPPS_NUMBER'}</p>
    <p className="muted">Bank: {opts.bank || 'add VITE_BANK_ACCOUNT'}</p>
  </Screen>
}

function AdminScreen({ isOwner, data, approve, reject }) {
  if (!isOwner) return <Screen title="Owner Only" subtitle="Only owner/admin can access approvals and sensitive records." icon={Lock}/>;
  const pendingPayments = data.payments.filter(p => p.status === 'pending');
  const pendingCases = data.cases.filter(c => c.status === 'pending');
  const pendingMembers = data.members.filter(m => m.status === 'pending');
  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card><h2>Admin Dashboard</h2><p className="muted">Approve payments, member applications, emergency cases and review audit logs.</p><div className="grid2"><Mini icon={Clock3} title="Pending payments" value={pendingPayments.length}/><Mini icon={ClipboardList} title="Pending cases" value={pendingCases.length}/></div></Card>
    <Card><h3>Pending Payments</h3>{pendingPayments.length === 0 && <p className="muted">No pending payments.</p>}{pendingPayments.map(p => <ApproveRow key={p.id} title={`${p.member_name || 'Member'} · ${p.amount} NOK`} sub={`${p.status} · ${p.receipt_url || ''}`} onApprove={()=>approve('payments', p.id, 'payment')} onReject={()=>reject('payments', p.id, 'payment')}/>)}</Card>
    <Card><h3>Pending Members</h3>{pendingMembers.length === 0 && <p className="muted">No pending members.</p>}{pendingMembers.map(m => <ApproveRow key={m.id} title={m.name} sub={`${m.email || ''} · ${m.status}`} onApprove={()=>approve('members', m.id, 'member')} onReject={()=>reject('members', m.id, 'member')}/>)}</Card><Card><h3>All Members</h3>{data.members.map(m => <Row key={m.id} title={m.name} sub={`${m.email || ''} · ${m.status} · trust ${m.trust_score || 0}`} status={m.status}/>)}</Card>
    <Card><h3>Pending Emergency Cases</h3>{pendingCases.length === 0 && <p className="muted">No pending cases.</p>}{pendingCases.map(c => <ApproveRow key={c.id} title={c.title} sub={`${c.status} · ${c.requested_amount} NOK · ${c.urgency || ''}`} onApprove={()=>approve('cases', c.id, 'case')} onReject={()=>reject('cases', c.id, 'case')}/>)}</Card>
    <Card><h3>Audit Logs</h3>{data.audit_logs.map(a => <Row key={a.id} title={a.action} sub={new Date(a.created_at).toLocaleString()} />)}</Card>
  </motion.div>
}

function AnalyticsScreen({ data, emergencyFund, exportReport }) {
  const approvedPayments = data.payments.filter(p => p.status === 'approved').length;
  const pending = data.payments.filter(p => p.status === 'pending').length + data.cases.filter(c => c.status === 'pending').length;
  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card><h2>Analytics</h2><p className="muted">Real dashboard from database values.</p><div className="grid2"><Mini icon={Users} title="Members" value={data.members.length}/><Mini icon={Wallet} title="Approved payments" value={approvedPayments}/><Mini icon={HandHeart} title="Emergency fund" value={emergencyFund}/><Mini icon={Clock3} title="Pending actions" value={pending}/></div><button className="primary full" onClick={exportReport}><Download size={17}/> Export CSV</button></Card>
  </motion.div>
}

function GovernanceScreen() {
  const rules = [
    {
      title: '1. Purpose',
      text: 'Payvand is a voluntary community-support platform for a transparent rotating fund, emergency assistance, donations, and collective trust-building. It is not a bank, investment product, lottery, gambling system, or profit-making financial service.'
    },
    {
      title: '2. Membership',
      text: 'Members must provide valid contact information, accept the rules, and be approved by the owner/admin or committee. New members may remain pending until reviewed.'
    },
    {
      title: '3. Monthly Contribution',
      text: 'Each approved member pays the agreed monthly amount on time. The default amount can be changed only through transparent discussion and voting.'
    },
    {
      title: '4. Rotating Fund Queue',
      text: 'The rotating payout follows a visible queue. Once a queue is confirmed, it should not be changed except for a documented reason approved by the owner/admin or committee.'
    },
    {
      title: '5. Responsibility After Receiving Payout',
      text: 'A member who receives a payout must continue paying until the round ends. Leaving after receiving money is allowed only after the remaining obligation is settled.'
    },
    {
      title: '6. Late Payment',
      text: 'Late payment may trigger reminders, trust-score reduction, delayed payout, suspension, or removal depending on severity and repetition.'
    },
    {
      title: '7. Payment Verification',
      text: 'Payments require receipt upload or proof of transfer. The owner/admin verifies payment records before they are considered approved.'
    },
    {
      title: '8. Emergency Fund',
      text: 'Donations and reserved amounts go into the Emergency Fund. This fund is separate from the rotating member payout and should only be used for approved emergency support.'
    },
    {
      title: '9. Emergency Case Submission',
      text: 'A person can submit an emergency case with title, description, urgency, requested amount, and optional proof documents. Sensitive case details must remain confidential.'
    },
    {
      title: '10. Emergency Case Review',
      text: 'Emergency cases are reviewed by the owner/admin or committee. Decisions should consider urgency, evidence, fairness, available balance, and risk of misuse.'
    },
    {
      title: '11. Donations',
      text: 'Non-members can donate to support emergency cases. Donations are recorded separately from member contributions and should be included in transparency reporting.'
    },
    {
      title: '12. Transparency Reporting',
      text: 'Reports should show total contributions, approved payments, donations, emergency fund balance, pending approvals, and major decisions without exposing private data.'
    },
    {
      title: '13. Admin Responsibilities',
      text: 'Admins manage member approval, payment approval, queue visibility, emergency case review, donation records, audit logs, and rule enforcement.'
    },
    {
      title: '14. Privacy',
      text: 'Member data, receipts, donor details, and emergency case documents are private. Sharing screenshots or personal information without permission is prohibited.'
    },
    {
      title: '15. Voting and Governance',
      text: 'Ordinary decisions can use simple majority. Major decisions such as rule changes, contribution amount changes, queue changes, or member removal should require stronger approval, recommended at least 70%.'
    },
    {
      title: '16. Misuse and Removal',
      text: 'Fraud, fake receipts, fake emergency cases, harassment, repeated non-payment, or misuse of private data can lead to rejection, suspension, or removal.'
    },
    {
      title: '17. Rule Updates',
      text: 'Rules can be updated through transparent discussion and voting. Members should be informed before changes take effect.'
    }
  ];

  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card>
      <Scale className="big-icon"/>
      <h2>Governance & Detailed Rules</h2>
      <p className="muted">These rules are a practical operating framework for Payvand. They can be adapted after member review and voting.</p>
      {rules.map((r) => <Policy key={r.title} title={r.title} text={r.text}/>)}
    </Card>
  </motion.div>
}


function Screen({ title, subtitle, icon: Icon, children }) {
  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}><Card>{Icon && <Icon className="big-icon"/>}<h2>{title}</h2><p className="muted">{subtitle}</p>{children}</Card></motion.div>
}
function Card({ children }) { return <div className="card">{children}</div> }
function Mini({ icon: Icon, title, value }) { return <div className="mini"><Icon size={20}/><p>{title}</p><b>{value}</b></div> }
function Policy({ title, text }) { return <div className="policy"><b>{title}</b><p>{text}</p></div> }
function Row({ title, sub, status }) { return <div className="row line"><div><b>{title}</b><p>{sub}</p></div>{status && <span className={`pill ${status}`}>{status}</span>}</div> }
function ApproveRow({ title, sub, onApprove, onReject }) { return <div className="row line"><div><b>{title}</b><p>{sub}</p></div><div className="row-actions"><button className="okbtn" onClick={onApprove}><Check size={15}/></button><button className="badbtn" onClick={onReject}><Ban size={15}/></button></div></div> }

createRoot(document.getElementById('root')).render(<App />);
