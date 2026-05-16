import React, { useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, Users, Wallet, BarChart3, ShieldCheck, Bell, ArrowUpRight, CheckCircle2,
  Clock3, Leaf, HandHeart, Settings, Plus, LogIn, HeartHandshake, X, Share2,
  Download, Receipt, Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import './styles.css';

const initialMembers = [
  { name: 'Ali', status: 'Paid', score: 94 },
  { name: 'Sara', status: 'Paid', score: 91 },
  { name: 'Reza', status: 'Pending', score: 82 },
  { name: 'Mina', status: 'Paid', score: 88 },
];

const initialQueue = [
  { month: 'June', member: 'Sara', amount: '7,500 NOK', active: true },
  { month: 'July', member: 'Reza', amount: '7,500 NOK' },
  { month: 'August', member: 'Mina', amount: '7,500 NOK' },
];

function PayvandApp() {
  const [tab, setTab] = useState('landing');
  const [members, setMembers] = useState(initialMembers);
  const [queue] = useState(initialQueue);
  const [donations, setDonations] = useState([
    { donor: 'Anonymous', amount: 250, date: 'Today' },
    { donor: 'Nora', amount: 500, date: 'Yesterday' },
    { donor: 'Anonymous', amount: 100, date: 'May 14' },
  ]);
  const [toast, setToast] = useState('');
  const [modal, setModal] = useState(null);
  const [selectedDonation, setSelectedDonation] = useState(250);
  const [customDonation, setCustomDonation] = useState('');

  const emergencyBalance = 1200 + donations.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const paidCount = members.filter(m => m.status === 'Paid').length;
  const pendingCount = members.length - paidCount;

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2600);
  };

  const markMonthlyPaid = () => {
    setMembers(prev => prev.map(m => m.name === 'Reza' ? { ...m, status: 'Paid', score: Math.min(100, m.score + 5) } : m));
    showToast('Monthly payment recorded for demo.');
  };

  const addTransaction = () => {
    setMembers(prev => prev.map(m => m.status === 'Pending' ? { ...m, status: 'Paid', score: Math.min(100, m.score + 4) } : m));
    showToast('Pending payment approved.');
  };

  const addMember = () => {
    const name = prompt('New member name:');
    if (!name) return;
    setMembers(prev => [...prev, { name, status: 'Pending', score: 70 }]);
    showToast(`${name} added as pending member.`);
  };

  const donate = () => {
    const amount = Number(customDonation || selectedDonation);
    if (!amount || amount <= 0) {
      showToast('Please choose a valid amount.');
      return;
    }
    setDonations(prev => [{ donor: 'Guest', amount, date: 'Now' }, ...prev]);
    setCustomDonation('');
    showToast(`${amount} NOK added to Emergency Fund.`);
  };

  const shareDonation = async () => {
    const link = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Donate to Payvand', text: 'Support Payvand Emergency Fund', url: link });
      } else {
        await navigator.clipboard.writeText(link);
        showToast('Donation link copied.');
      }
    } catch {
      showToast('Share cancelled.');
    }
  };

  const exportReport = () => {
    const csv = [
      'Metric,Value',
      `Members,${members.length}`,
      `Paid,${paidCount}`,
      `Pending,${pendingCount}`,
      `Emergency Fund,${emergencyBalance} NOK`,
      `Donations,${donations.reduce((s,d)=>s+Number(d.amount),0)} NOK`
    ].join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'payvand-report.csv';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report downloaded.');
  };

  const nav = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'fund', icon: Wallet, label: 'Fund' },
    { id: 'donate', icon: HandHeart, label: 'Donate' },
    { id: 'members', icon: Users, label: 'Members' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];
  const appTabs = ['home', 'fund', 'donate', 'members', 'reports'];

  const sharedProps = { setTab, members, queue, donations, emergencyBalance, selectedDonation, setSelectedDonation, customDonation, setCustomDonation, markMonthlyPaid, addTransaction, addMember, donate, shareDonation, exportReport, setModal };

  return (
    <div className="page">
      <div className="phone">
        <div className="hero-bg" />
        <div className="content">
          <Header setTab={setTab} showToast={showToast} />
          {tab === 'landing' && <LandingScreen {...sharedProps} />}
          {tab === 'login' && <LoginScreen {...sharedProps} />}
          {tab === 'home' && <HomeScreen {...sharedProps} />}
          {tab === 'fund' && <FundScreen {...sharedProps} />}
          {tab === 'donate' && <DonateScreen {...sharedProps} />}
          {tab === 'members' && <MembersScreen {...sharedProps} />}
          {tab === 'reports' && <ReportsScreen {...sharedProps} />}
        </div>

        {appTabs.includes(tab) && (
          <nav className="bottom-nav">
            {nav.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button key={item.id} onClick={() => setTab(item.id)} className={active ? 'nav-item active' : 'nav-item'}>
                  <span><Icon size={20} /></span>
                  {item.label}
                </button>
              );
            })}
          </nav>
        )}

        {toast && <div className="toast">{toast}</div>}
        {modal && <InfoModal type={modal} setModal={setModal} members={members} queue={queue} emergencyBalance={emergencyBalance} />}
      </div>
    </div>
  );
}

function Header({ setTab, showToast }) {
  return (
    <header className="header">
      <button className="brand brand-button" onClick={() => setTab('landing')}>
        <div className="logo"><Leaf size={26} /></div>
        <div>
          <h1><span>Pay</span>vand</h1>
          <p>رشد از طریق همکاری</p>
        </div>
      </button>
      <button className="icon-btn" onClick={() => showToast('No new notifications.')}>
        <Bell size={20} />
      </button>
    </header>
  );
}

function LandingScreen({ setTab }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack landing">
      <div className="card glass">
        <HeartHandshake size={42} />
        <h2>Community fund, built on trust.</h2>
        <p>Payvand helps members manage a transparent rotating fund, emergency support, donations, queue order, and monthly reports.</p>
        <button className="primary" onClick={() => setTab('login')}>Get Started</button>
        <button className="secondary" onClick={() => setTab('donate')}>Donate as Guest</button>
      </div>
      <div className="feature-grid">
        <MiniCard icon={Wallet} title="Monthly Pool" value="7,500" />
        <MiniCard icon={ShieldCheck} title="Trust System" value="92%" />
        <MiniCard icon={HandHeart} title="Emergency" value="Open" />
        <MiniCard icon={BarChart3} title="Reports" value="Live" />
      </div>
    </motion.div>
  );
}

function LoginScreen({ setTab }) {
  const [email, setEmail] = useState('');
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack login">
      <div className="card">
        <h2>Login / Register</h2>
        <p className="muted">MVP demo. Later this connects to Supabase Auth.</p>
        <input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
        <input placeholder="Password" type="password" />
        <button className="primary" onClick={() => setTab('home')}><LogIn size={18} /> Continue</button>
        <button className="secondary" onClick={() => setTab('landing')}>Back</button>
      </div>
    </motion.div>
  );
}

function HomeScreen({ setTab, queue, emergencyBalance, markMonthlyPaid, setModal }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack">
      <div className="card">
        <div className="split">
          <div>
            <p className="muted">Current Pool</p>
            <h2>7,500 NOK</h2>
            <p className="tiny">15 members × 500 NOK</p>
          </div>
          <div className="soft-icon"><Wallet /></div>
        </div>
        <div className="actions">
          <button className="primary" onClick={markMonthlyPaid}>Pay Monthly</button>
          <button className="secondary" onClick={() => setModal('queue')}>View Queue</button>
        </div>
      </div>
      <div className="feature-grid">
        <MiniCard icon={ShieldCheck} title="Trust Score" value="92%" />
        <button className="mini-card clickable" onClick={() => setTab('donate')}>
          <HandHeart size={20} />
          <p>Emergency Fund</p>
          <b>{emergencyBalance} NOK</b>
        </button>
      </div>
      <div className="card">
        <div className="split mb">
          <h3>Next Receiver</h3>
          <span className="pill ok">Confirmed</span>
        </div>
        <button className="person person-button" onClick={() => setModal('receiver')}>
          <div className="avatar">S</div>
          <div><b>Sara</b><p>June payout · 7,500 NOK</p></div>
          <ArrowUpRight className="muted-icon" />
        </button>
      </div>
      <h3 className="section">Monthly Queue</h3>
      {queue.map((q) => <QueueItem key={q.month} {...q} />)}
    </motion.div>
  );
}

function FundScreen({ members, emergencyBalance, addTransaction }) {
  const paidCount = members.filter(m => m.status === 'Paid').length;
  const pendingCount = members.length - paidCount;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card">
        <h2>Fund Management</h2>
        <p className="muted">Track payments, payouts, and reserves.</p>
        <FundRow label="Collected this month" value={`${paidCount * 500} NOK`} percent={`${Math.round((paidCount/members.length)*100)}%`} />
        <FundRow label="Pending" value={`${pendingCount * 500} NOK`} percent={`${Math.round((pendingCount/members.length)*100)}%`} />
        <FundRow label="Emergency reserve" value={`${emergencyBalance} NOK`} percent="28%" />
        <button className="primary full" onClick={addTransaction}><Receipt size={17}/> Approve Pending Payment</button>
      </div>
      <div className="card">
        <h3>Payment Status</h3>
        {members.map((m) => <PaymentMember key={m.name} {...m} />)}
      </div>
    </motion.div>
  );
}

function DonateScreen({ donations, emergencyBalance, selectedDonation, setSelectedDonation, customDonation, setCustomDonation, donate, shareDonation }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card">
        <div className="split">
          <div>
            <p className="muted">Open Donation</p>
            <h2>Support Emergency Fund</h2>
            <p className="muted">Non-members can donate here. All donations go directly to emergency support.</p>
          </div>
          <div className="soft-icon"><HandHeart /></div>
        </div>
        <div className="balance">
          <p>Emergency Fund Balance</p>
          <h2>{emergencyBalance} NOK</h2>
          <span>All guest donations are added here</span>
        </div>
        <div className="amount-grid">
          {[100, 250, 500].map((amount) => (
            <button key={amount} onClick={() => { setSelectedDonation(amount); setCustomDonation(''); }} className={selectedDonation === amount && !customDonation ? 'selected' : ''}>
              {amount} NOK
            </button>
          ))}
        </div>
        <div className="custom-amount">
          <span>Custom amount</span>
          <input value={customDonation} onChange={(e) => setCustomDonation(e.target.value.replace(/\D/g, ''))} placeholder="0 NOK" />
        </div>
        <button className="primary full green" onClick={donate}>Donate to Emergency Fund</button>
        <button className="secondary full" onClick={shareDonation}><Share2 size={17}/> Share Donation Link</button>
      </div>
      <div className="card">
        <div className="split mb">
          <h3>Recent Donations</h3>
          <span className="tiny">Public report</span>
        </div>
        {donations.map((d, i) => (
          <div className="donation" key={i}>
            <div className="person compact">
              <div className="mini-icon"><HandHeart size={16} /></div>
              <div><b>{d.donor}</b><p>{d.date}</p></div>
            </div>
            <b className="green-text">{d.amount} NOK</b>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MembersScreen({ members, addMember, setModal }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="split">
        <h2 className="white-title">Members</h2>
        <button className="white-btn" onClick={addMember}><Plus size={18} /></button>
      </div>
      <div className="card">
        {members.map((m) => (
          <button className="member member-button" key={m.name} onClick={() => setModal(`member:${m.name}:${m.score}:${m.status}`)}>
            <div className="avatar small">{m.name[0]}</div>
            <div><b>{m.name}</b><p>Trust Score: {m.score}</p></div>
            <span className={m.status === 'Paid' ? 'pill ok' : 'pill warn'}>{m.status}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}

function ReportsScreen({ members, emergencyBalance, donations, exportReport, setModal }) {
  const paidCount = members.filter(m => m.status === 'Paid').length;
  const pendingCount = members.length - paidCount;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card">
        <h2>Transparency Report</h2>
        <p className="muted">Simple monthly public report for members.</p>
        <div className="feature-grid">
          <MiniCard icon={Wallet} title="Income" value={`${paidCount * 500}`} />
          <MiniCard icon={ArrowUpRight} title="Payout" value="7,500" />
          <MiniCard icon={Clock3} title="Pending" value={pendingCount} />
          <MiniCard icon={HandHeart} title="Emergency" value={emergencyBalance} />
        </div>
        <button className="primary full" onClick={exportReport}><Download size={17}/> Export Report</button>
      </div>
      <div className="card">
        <h3>Governance</h3>
        <p className="muted">All key decisions require majority voting. Large rule changes require 70% approval.</p>
        <button className="secondary full" onClick={() => setModal('rules')}><Settings size={16} /> Open Rules</button>
      </div>
    </motion.div>
  );
}

function InfoModal({ type, setModal, members, queue, emergencyBalance }) {
  let title = 'Information';
  let body = null;

  if (type === 'queue') {
    title = 'Payout Queue';
    body = <div className="modal-list">{queue.map(q => <div key={q.month}><b>{q.month}</b><span>{q.member} · {q.amount}</span></div>)}</div>;
  } else if (type === 'receiver') {
    title = 'Next Receiver';
    body = <p>Sara is the confirmed receiver for June. The payout amount is 7,500 NOK after monthly payments are collected.</p>;
  } else if (type === 'rules') {
    title = 'Payvand Rules';
    body = <ul><li>Members pay monthly on time.</li><li>After receiving payout, members must continue until the round ends.</li><li>Donations go only to the Emergency Fund.</li><li>Major decisions require voting.</li></ul>;
  } else if (String(type).startsWith('member:')) {
    const [, name, score, status] = type.split(':');
    title = `${name} Profile`;
    body = <p>Status: {status}. Trust Score: {score}. In the production version this page will show payment history and verification status.</p>;
  }

  return (
    <div className="modal-backdrop" onClick={() => setModal(null)}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={() => setModal(null)}><X size={18}/></button>
        <h2>{title}</h2>
        <div className="modal-body">{body}</div>
      </div>
    </div>
  );
}

function MiniCard({ icon: Icon, title, value }) {
  return (
    <div className="mini-card">
      <Icon size={20} />
      <p>{title}</p>
      <b>{value}</b>
    </div>
  );
}

function QueueItem({ month, member, amount, active }) {
  return (
    <div className={active ? 'queue active' : 'queue'}>
      <div className="month">{month.slice(0, 3)}</div>
      <div><b>{member}</b><p>{amount}</p></div>
      {active ? <CheckCircle2 className="green-text" /> : <Clock3 className="muted-icon" />}
    </div>
  );
}

function FundRow({ label, value, percent }) {
  return (
    <div className="fund-row">
      <div><span>{label}</span><b>{value}</b></div>
      <div className="bar"><span style={{ width: percent }} /></div>
    </div>
  );
}

function PaymentMember({ name, status }) {
  return (
    <div className="payment-member">
      <div className="person compact"><div className="avatar tiny-avatar">{name[0]}</div><b>{name}</b></div>
      <span className={status === 'Paid' ? 'pill ok' : 'pill warn'}>{status}</span>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<PayvandApp />);
