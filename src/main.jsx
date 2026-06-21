import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Users, Wallet, BarChart3, ShieldCheck, Bell, ArrowUpRight, CheckCircle2, Clock3, Leaf, HandHeart, Settings, Plus, LogIn, HeartHandshake, Languages } from 'lucide-react';
import { motion } from 'framer-motion';
import './styles.css';

const translations = {
  en: {
    tagline: 'Growth through collaboration',
    landingTitle: 'Community fund, built on trust.',
    landingText: 'Payvand helps members manage a transparent rotating fund, emergency support, donations, queue order, and monthly reports.',
    getStarted: 'Get Started',
    donateGuest: 'Donate as Guest',
    monthlyPool: 'Monthly Pool',
    trustSystem: 'Trust System',
    emergency: 'Emergency',
    reports: 'Reports',
    loginTitle: 'Login / Register',
    loginText: 'MVP demo screen. Later this connects to Supabase Auth.',
    email: 'Email address',
    password: 'Password',
    continue: 'Continue',
    back: 'Back',
    home: 'Home',
    fund: 'Fund',
    donate: 'Donate',
    members: 'Members',
    currentPool: 'Current Pool',
    monthlyNote: '15 members × 500 NOK',
    payMonthly: 'Pay Monthly',
    viewQueue: 'View Queue',
    trustScore: 'Trust Score',
    emergencyFund: 'Emergency Fund',
    nextReceiver: 'Next Receiver',
    confirmed: 'Confirmed',
    monthlyQueue: 'Monthly Queue',
    fundManagement: 'Fund Management',
    fundManagementText: 'Track payments, payouts, and reserves.',
    collected: 'Collected this month',
    pending: 'Pending',
    emergencyReserve: 'Emergency reserve',
    addTransaction: 'Add Transaction',
    paymentStatus: 'Payment Status',
    paid: 'Paid',
    openDonation: 'Open Donation',
    supportEmergency: 'Support Emergency Fund',
    donateText: 'Non-members can donate here. All donations go directly to emergency support.',
    emergencyBalance: 'Emergency Fund Balance',
    externalDonations: 'Includes 850 NOK external donations',
    customAmount: 'Custom amount',
    donateButton: 'Donate to Emergency Fund',
    shareDonation: 'Share Donation Link',
    recentDonations: 'Recent Donations',
    publicReport: 'Public report',
    transparencyReport: 'Transparency Report',
    transparencyText: 'Simple monthly public report for members.',
    income: 'Income',
    payout: 'Payout',
    exportReport: 'Export Report',
    governance: 'Governance',
    governanceText: 'All key decisions require majority voting. Large rule changes require 70% approval.',
    openRules: 'Open Rules',
    language: 'FA'
  },
  fa: {
    tagline: 'رشد از طریق همکاری',
    landingTitle: 'صندوق اجتماعی، بر پایه اعتماد',
    landingText: 'پیوند به اعضا کمک می‌کند صندوق گردشی، کمک اضطراری، کمک‌های داوطلبانه، صف دریافت و گزارش‌های ماهانه را شفاف مدیریت کنند.',
    getStarted: 'شروع',
    donateGuest: 'کمک به‌عنوان مهمان',
    monthlyPool: 'صندوق ماهانه',
    trustSystem: 'سیستم اعتماد',
    emergency: 'اضطراری',
    reports: 'گزارش‌ها',
    loginTitle: 'ورود / ثبت‌نام',
    loginText: 'این صفحه فعلاً نسخه نمایشی است. بعداً به Supabase Auth متصل می‌شود.',
    email: 'ایمیل',
    password: 'رمز عبور',
    continue: 'ادامه',
    back: 'بازگشت',
    home: 'خانه',
    fund: 'صندوق',
    donate: 'کمک',
    members: 'اعضا',
    currentPool: 'صندوق فعلی',
    monthlyNote: '۱۵ عضو × ۵۰۰ کرون',
    payMonthly: 'پرداخت ماهانه',
    viewQueue: 'مشاهده نوبت‌ها',
    trustScore: 'امتیاز اعتماد',
    emergencyFund: 'صندوق اضطراری',
    nextReceiver: 'دریافت‌کننده بعدی',
    confirmed: 'تأیید شده',
    monthlyQueue: 'صف ماهانه',
    fundManagement: 'مدیریت صندوق',
    fundManagementText: 'پرداخت‌ها، دریافت‌ها و ذخیره اضطراری را مدیریت کنید.',
    collected: 'جمع‌آوری این ماه',
    pending: 'در انتظار',
    emergencyReserve: 'ذخیره اضطراری',
    addTransaction: 'افزودن تراکنش',
    paymentStatus: 'وضعیت پرداخت',
    paid: 'پرداخت شده',
    openDonation: 'کمک آزاد',
    supportEmergency: 'حمایت از صندوق اضطراری',
    donateText: 'افراد غیرعضو هم می‌توانند کمک کنند. همه کمک‌ها مستقیماً وارد صندوق اضطراری می‌شود.',
    emergencyBalance: 'موجودی صندوق اضطراری',
    externalDonations: 'شامل ۸۵۰ کرون کمک افراد غیرعضو',
    customAmount: 'مبلغ دلخواه',
    donateButton: 'کمک به صندوق اضطراری',
    shareDonation: 'اشتراک لینک کمک',
    recentDonations: 'کمک‌های اخیر',
    publicReport: 'گزارش عمومی',
    transparencyReport: 'گزارش شفافیت',
    transparencyText: 'گزارش ماهانه ساده و شفاف برای اعضا.',
    income: 'ورودی',
    payout: 'پرداختی',
    exportReport: 'خروجی گزارش',
    governance: 'قوانین و تصمیم‌گیری',
    governanceText: 'تصمیمات مهم با رأی اکثریت انجام می‌شود. تغییرات بزرگ نیاز به ۷۰٪ رأی موافق دارد.',
    openRules: 'مشاهده قوانین',
    language: 'EN'
  }
};

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
  const [lang, setLang] = useState('en');
  const t = translations[lang];
  const rtl = lang === 'fa';

  const nav = [
    { id: 'home', icon: Home, label: t.home },
    { id: 'fund', icon: Wallet, label: t.fund },
    { id: 'donate', icon: HandHeart, label: t.donate },
    { id: 'members', icon: Users, label: t.members },
    { id: 'reports', icon: BarChart3, label: t.reports },
  ];

  const appTabs = ['home', 'fund', 'donate', 'members', 'reports'];

  return (
    <div className={rtl ? 'page rtl' : 'page'} dir={rtl ? 'rtl' : 'ltr'}>
      <div className="phone">
        <div className="hero-bg" />
        <div className="content">
          <Header setTab={setTab} lang={lang} setLang={setLang} t={t} />
          {tab === 'landing' && <LandingScreen setTab={setTab} t={t} />}
          {tab === 'login' && <LoginScreen setTab={setTab} t={t} />}
          {tab === 'home' && <HomeScreen t={t} />}
          {tab === 'fund' && <FundScreen t={t} />}
          {tab === 'donate' && <DonateScreen t={t} />}
          {tab === 'members' && <MembersScreen t={t} />}
          {tab === 'reports' && <ReportsScreen t={t} />}
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

function Header({ setTab, lang, setLang, t }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="logo logo-img"><img src="/payvand-logo.png" alt="Payvand logo" /></div>
        <div>
          <h1><span>Pay</span>vand</h1>
          <p>{t.tagline}</p>
        </div>
      </div>
      <div className="header-actions">
        <button className="lang-btn" onClick={() => setLang(lang === 'en' ? 'fa' : 'en')}><Languages size={16} /> {t.language}</button>
        <button className="icon-btn" onClick={() => setTab('login')}><Bell size={20} /></button>
      </div>
    </header>
  );
}

function LandingScreen({ setTab, t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack landing">
      <div className="card glass">
        <img className="hero-logo" src="/payvand-logo.png" alt="Payvand logo" />
        <h2>{t.landingTitle}</h2>
        <p>{t.landingText}</p>
        <button className="primary" onClick={() => setTab('login')}>{t.getStarted}</button>
        <button className="secondary" onClick={() => setTab('donate')}>{t.donateGuest}</button>
      </div>
      <div className="feature-grid">
        <MiniCard icon={Wallet} title={t.monthlyPool} value="7,500" />
        <MiniCard icon={ShieldCheck} title={t.trustSystem} value="92%" />
        <MiniCard icon={HandHeart} title={t.emergency} value="2,050" />
        <MiniCard icon={BarChart3} title={t.reports} value="Open" />
      </div>
    </motion.div>
  );
}

function LoginScreen({ setTab, t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack login">
      <div className="card">
        <h2>{t.loginTitle}</h2>
        <p className="muted">{t.loginText}</p>
        <input placeholder={t.email} />
        <input placeholder={t.password} type="password" />
        <button className="primary" onClick={() => setTab('home')}><LogIn size={18} /> {t.continue}</button>
        <button className="secondary" onClick={() => setTab('landing')}>{t.back}</button>
      </div>
    </motion.div>
  );
}

function HomeScreen({ t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack">
      <div className="card">
        <div className="split">
          <div>
            <p className="muted">{t.currentPool}</p>
            <h2>7,500 NOK</h2>
            <p className="tiny">{t.monthlyNote}</p>
          </div>
          <div className="soft-icon"><Wallet /></div>
        </div>
        <div className="actions">
          <button className="primary">{t.payMonthly}</button>
          <button className="secondary">{t.viewQueue}</button>
        </div>
      </div>
      <div className="feature-grid">
        <MiniCard icon={ShieldCheck} title={t.trustScore} value="92%" />
        <MiniCard icon={HandHeart} title={t.emergencyFund} value="2,050 NOK" />
      </div>
      <div className="card">
        <div className="split mb">
          <h3>{t.nextReceiver}</h3>
          <span className="pill ok">{t.confirmed}</span>
        </div>
        <div className="person">
          <div className="avatar">S</div>
          <div><b>Sara</b><p>June payout · 7,500 NOK</p></div>
          <ArrowUpRight className="muted-icon" />
        </div>
      </div>
      <h3 className="section">{t.monthlyQueue}</h3>
      {queue.map((q) => <QueueItem key={q.month} {...q} />)}
    </motion.div>
  );
}

function FundScreen({ t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card">
        <h2>{t.fundManagement}</h2>
        <p className="muted">{t.fundManagementText}</p>
        <FundRow label={t.collected} value="6,500 NOK" percent="87%" />
        <FundRow label={t.pending} value="1,000 NOK" percent="13%" />
        <FundRow label={t.emergencyReserve} value="2,050 NOK" percent="28%" />
        <button className="primary full">{t.addTransaction}</button>
      </div>
      <div className="card">
        <h3>{t.paymentStatus}</h3>
        {members.map((m) => <PaymentMember key={m.name} {...m} t={t} />)}
      </div>
    </motion.div>
  );
}

function DonateScreen({ t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card">
        <div className="split">
          <div>
            <p className="muted">{t.openDonation}</p>
            <h2>{t.supportEmergency}</h2>
            <p className="muted">{t.donateText}</p>
          </div>
          <div className="soft-icon"><HandHeart /></div>
        </div>
        <div className="balance">
          <p>{t.emergencyBalance}</p>
          <h2>2,050 NOK</h2>
          <span>{t.externalDonations}</span>
        </div>
        <div className="amount-grid">
          {['100', '250', '500'].map((amount) => <button key={amount}>{amount} NOK</button>)}
        </div>
        <div className="custom-amount"><span>{t.customAmount}</span><b>0 NOK</b></div>
        <button className="primary full green">{t.donateButton}</button>
        <button className="secondary full">{t.shareDonation}</button>
      </div>
      <div className="card">
        <div className="split mb">
          <h3>{t.recentDonations}</h3>
          <span className="tiny">{t.publicReport}</span>
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

function MembersScreen({ t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="split">
        <h2 className="white-title">{t.members}</h2>
        <button className="white-btn"><Plus size={18} /></button>
      </div>
      <div className="card">
        {members.map((m) => (
          <div className="member" key={m.name}>
            <div className="avatar small">{m.name[0]}</div>
            <div><b>{m.name}</b><p>{t.trustScore}: {m.score}</p></div>
            <span className={m.status === 'Paid' ? 'pill ok' : 'pill warn'}>{m.status === 'Paid' ? t.paid : t.pending}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function ReportsScreen({ t }) {
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card">
        <h2>{t.transparencyReport}</h2>
        <p className="muted">{t.transparencyText}</p>
        <div className="feature-grid">
          <MiniCard icon={Wallet} title={t.income} value="7,500" />
          <MiniCard icon={ArrowUpRight} title={t.payout} value="7,500" />
          <MiniCard icon={Clock3} title={t.pending} value="2" />
          <MiniCard icon={CheckCircle2} title={t.paid} value="13" />
        </div>
        <button className="primary full">{t.exportReport}</button>
      </div>
      <div className="card">
        <h3>{t.governance}</h3>
        <p className="muted">{t.governanceText}</p>
        <button className="secondary full"><Settings size={16} /> {t.openRules}</button>
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

function PaymentMember({ name, status, t }) {
  return (
    <div className="payment-member">
      <div className="person compact"><div className="avatar tiny-avatar">{name[0]}</div><b>{name}</b></div>
      <span className={status === 'Paid' ? 'pill ok' : 'pill warn'}>{status === 'Paid' ? t.paid : t.pending}</span>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<PayvandApp />);
