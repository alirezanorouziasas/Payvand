import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Users, Wallet, BarChart3, ShieldCheck, Bell, ArrowUpRight, CheckCircle2, Clock3, Leaf, HandHeart, Settings, Plus, LogIn, HeartHandshake } from 'lucide-react';
import { motion } from 'framer-motion';
import './styles.css';

const members = [
  { name: 'Ali', status: 'Paid', score: 94 },
  { name: 'Sara', status: 'Paid', score: 91 },
  { name: 'Reza', status: 'Pending', score: 82 },
  { name: 'Mina', status: 'Paid', score: 88 },
];

const queue = [
  { month: 'June', member: 'Sara', amount: '7,500 NOK', active: true },
  { month: 'July', member: 'Reza', amount: '7,500 NOK' },
  { month: 'August', member: 'Mina', amount: '7,500 NOK' },
];

const donations = [
  { donor: 'Anonymous', amount: '250 NOK', date: 'Today' },
  { donor: 'Nora', amount: '500 NOK', date: 'Yesterday' },
  { donor: 'Anonymous', amount: '100 NOK', date: 'May 14' },
];

function PayvandApp() {
  const [tab, setTab] = useState('landing');
  const nav = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'fund', icon: Wallet, label: 'Fund' },
    { id: 'donate', icon: HandHeart, label: 'Donate' },
    { id: 'members', icon: Users, label: 'Members' },
    { id: 'reports', icon: BarChart3, label: 'Reports' },
  ];

  const appTabs = ['home', 'fund', 'donate', 'members', 'reports'];

  return (
    <div className="page">
      <div className="phone">
        <div className="hero-bg" />
        <div className="content">
          <Header setTab={setTab} />
          {tab === 'landing' && <LandingScreen setTab={setTab} />}
          {tab === 'login' && <LoginScreen setTab={setTab} />}
          {tab === 'home' && <HomeScreen />}
          {tab === 'fund' && <FundScreen />}
          {tab === 'donate' && <DonateScreen />}
          {tab === 'members' && <MembersScreen />}
          {tab === 'reports' && <ReportsScreen />}
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
      </div>
    </div>
  );
}

function Header({ setTab }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo logo-img"><img src="/payvand-logo.png" alt="Payvand logo" /></div>
        <div>
          <h1><span>Pay</span>vand</h1>
          <p>رشد از طریق همکاری</p>
        </div>
      </div>
      <button className="icon-btn" onClick={() => setTab('login')}><Bell size={20} /></button>
    </header>
  );
}

function LandingScreen({ setTab }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack landing">
      <div className="card glass">
        <img className="hero-logo" src="/payvand-logo.png" alt="Payvand logo" />
        <h2>Community fund, built on trust.</h2>
        <p>Payvand helps members manage a transparent rotating fund, emergency support, donations, queue order, and monthly reports.</p>
        <button className="primary" onClick={() => setTab('login')}>Get Started</button>
        <button className="secondary" onClick={() => setTab('donate')}>Donate as Guest</button>
      </div>
      <div className="feature-grid">
        <MiniCard icon={Wallet} title="Monthly Pool" value="7,500" />
        <MiniCard icon={ShieldCheck} title="Trust System" value="92%" />
        <MiniCard icon={HandHeart} title="Emergency" value="2,050" />
        <MiniCard icon={BarChart3} title="Reports" value="Open" />
      </div>
    </motion.div>
  );
}

function LoginScreen({ setTab }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack login">
      <div className="card">
        <h2>Login / Register</h2>
        <p className="muted">MVP demo screen. Later this connects to Supabase Auth.</p>
        <input placeholder="Email address" />
        <input placeholder="Password" type="password" />
        <button className="primary" onClick={() => setTab('home')}><LogIn size={18} /> Continue</button>
        <button className="secondary" onClick={() => setTab('landing')}>Back</button>
      </div>
    </motion.div>
  );
}

function HomeScreen() {
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
          <button className="primary">Pay Monthly</button>
          <button className="secondary">View Queue</button>
        </div>
      </div>
      <div className="feature-grid">
        <MiniCard icon={ShieldCheck} title="Trust Score" value="92%" />
        <MiniCard icon={HandHeart} title="Emergency Fund" value="2,050 NOK" />
      </div>
      <div className="card">
        <div className="split mb">
          <h3>Next Receiver</h3>
          <span className="pill ok">Confirmed</span>
        </div>
        <div className="person">
          <div className="avatar">S</div>
          <div><b>Sara</b><p>June payout · 7,500 NOK</p></div>
          <ArrowUpRight className="muted-icon" />
        </div>
      </div>
      <h3 className="section">Monthly Queue</h3>
      {queue.map((q) => <QueueItem key={q.month} {...q} />)}
    </motion.div>
  );
}

function FundScreen() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card">
        <h2>Fund Management</h2>
        <p className="muted">Track payments, payouts, and reserves.</p>
        <FundRow label="Collected this month" value="6,500 NOK" percent="87%" />
        <FundRow label="Pending" value="1,000 NOK" percent="13%" />
        <FundRow label="Emergency reserve" value="2,050 NOK" percent="28%" />
        <button className="primary full">Add Transaction</button>
      </div>
      <div className="card">
        <h3>Payment Status</h3>
        {members.map((m) => <PaymentMember key={m.name} {...m} />)}
      </div>
    </motion.div>
  );
}

function DonateScreen() {
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
          <h2>2,050 NOK</h2>
          <span>Includes 850 NOK external donations</span>
        </div>
        <div className="amount-grid">
          {['100', '250', '500'].map((amount) => <button key={amount}>{amount} NOK</button>)}
        </div>
        <div className="custom-amount"><span>Custom amount</span><b>0 NOK</b></div>
        <button className="primary full green">Donate to Emergency Fund</button>
        <button className="secondary full">Share Donation Link</button>
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
            <b className="green-text">{d.amount}</b>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MembersScreen() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="split">
        <h2 className="white-title">Members</h2>
        <button className="white-btn"><Plus size={18} /></button>
      </div>
      <div className="card">
        {members.map((m) => (
          <div className="member" key={m.name}>
            <div className="avatar small">{m.name[0]}</div>
            <div><b>{m.name}</b><p>Trust Score: {m.score}</p></div>
            <span className={m.status === 'Paid' ? 'pill ok' : 'pill warn'}>{m.status}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ReportsScreen() {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card">
        <h2>Transparency Report</h2>
        <p className="muted">Simple monthly public report for members.</p>
        <div className="feature-grid">
          <MiniCard icon={Wallet} title="Income" value="7,500" />
          <MiniCard icon={ArrowUpRight} title="Payout" value="7,500" />
          <MiniCard icon={Clock3} title="Pending" value="2" />
          <MiniCard icon={CheckCircle2} title="Paid" value="13" />
        </div>
        <button className="primary full">Export Report</button>
      </div>
      <div className="card">
        <h3>Governance</h3>
        <p className="muted">All key decisions require majority voting. Large rule changes require 70% approval.</p>
        <button className="secondary full"><Settings size={16} /> Open Rules</button>
      </div>
    </motion.div>
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
