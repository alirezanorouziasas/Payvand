import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Home, Users, Wallet, BarChart3, ShieldCheck, Bell, ArrowUpRight, CheckCircle2, Clock3, HandHeart, Settings, Plus, LogIn, HeartHandshake, Languages, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from './supabaseClient';
import './styles.css';

const translations = {
  en: {
    tagline: 'Growth through collaboration',
    landingTitle: 'Community fund, built on trust.',
    landingText: 'Payvand helps members manage a transparent rotating fund, emergency support, donations, queue order, and monthly reports.',
    getStarted: 'Get Started', donateGuest: 'Donate as Guest', monthlyPool: 'Monthly Pool', trustSystem: 'Trust System',
    emergency: 'Emergency', reports: 'Reports', loginTitle: 'Login / Register', loginText: 'Create an account or log in to manage your Payvand membership.',
    email: 'Email address', password: 'Password', fullName: 'Full name', signIn: 'Sign in', signUp: 'Create account', continue: 'Continue',
    back: 'Back', home: 'Home', fund: 'Fund', donate: 'Donate', members: 'Members', currentPool: 'Current Pool',
    monthlyNote: '15 members × 500 NOK', payMonthly: 'Pay Monthly', viewQueue: 'View Queue', trustScore: 'Trust Score',
    emergencyFund: 'Emergency Fund', nextReceiver: 'Next Receiver', confirmed: 'Confirmed', monthlyQueue: 'Monthly Queue',
    fundManagement: 'Fund Management', fundManagementText: 'Track payments, payouts, and reserves.', collected: 'Collected this month',
    pending: 'Pending', emergencyReserve: 'Emergency reserve', addTransaction: 'Add Transaction', paymentStatus: 'Payment Status',
    paid: 'Paid', openDonation: 'Open Donation', supportEmergency: 'Support Emergency Fund',
    donateText: 'Non-members can donate here. All donations go directly to emergency support.', emergencyBalance: 'Emergency Fund Balance',
    externalDonations: 'External donations and reserves', customAmount: 'Custom amount', donorName: 'Donor name, optional',
    donateButton: 'Donate to Emergency Fund', shareDonation: 'Share Donation Link', recentDonations: 'Recent Donations',
    publicReport: 'Public report', transparencyReport: 'Transparency Report', transparencyText: 'Simple monthly public report for members.',
    income: 'Income', payout: 'Payout', exportReport: 'Export Report', governance: 'Governance',
    governanceText: 'All key decisions require majority voting. Large rule changes require 70% approval.', openRules: 'Open Rules',
    emergencyCase: 'Emergency Case',
    submitEmergencyCase: 'Submit Emergency Case',
    emergencyCaseText: 'Submit a confidential request for emergency support. The committee will review it.',
    requesterName: 'Requester name',
    contactInfo: 'Contact information',
    requestedAmount: 'Requested amount',
    urgency: 'Urgency',
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    reason: 'Reason',
    caseDescription: 'Description',
    submitCase: 'Submit Case',
    recentCases: 'Recent Emergency Cases',
    caseSubmitted: 'Emergency case submitted for review.',
    underReview: 'Under review',
    language: 'FA', connected: 'Supabase connected', demo: 'Demo mode: add Supabase variables', logout: 'Logout'
  },
  fa: {
    tagline: 'رشد از طریق همکاری',
    landingTitle: 'صندوق اجتماعی، بر پایه اعتماد',
    landingText: 'پیوند به اعضا کمک می‌کند صندوق گردشی، کمک اضطراری، کمک‌های داوطلبانه، صف دریافت و گزارش‌های ماهانه را شفاف مدیریت کنند.',
    getStarted: 'شروع', donateGuest: 'کمک به‌عنوان مهمان', monthlyPool: 'صندوق ماهانه', trustSystem: 'سیستم اعتماد',
    emergency: 'اضطراری', reports: 'گزارش‌ها', loginTitle: 'ورود / ثبت‌نام', loginText: 'برای مدیریت عضویت خود وارد شوید یا حساب جدید بسازید.',
    email: 'ایمیل', password: 'رمز عبور', fullName: 'نام کامل', signIn: 'ورود', signUp: 'ساخت حساب', continue: 'ادامه',
    back: 'بازگشت', home: 'خانه', fund: 'صندوق', donate: 'کمک', members: 'اعضا', currentPool: 'صندوق فعلی',
    monthlyNote: '۱۵ عضو × ۵۰۰ کرون', payMonthly: 'پرداخت ماهانه', viewQueue: 'مشاهده نوبت‌ها', trustScore: 'امتیاز اعتماد',
    emergencyFund: 'صندوق اضطراری', nextReceiver: 'دریافت‌کننده بعدی', confirmed: 'تأیید شده', monthlyQueue: 'صف ماهانه',
    fundManagement: 'مدیریت صندوق', fundManagementText: 'پرداخت‌ها، دریافت‌ها و ذخیره اضطراری را مدیریت کنید.', collected: 'جمع‌آوری این ماه',
    pending: 'در انتظار', emergencyReserve: 'ذخیره اضطراری', addTransaction: 'افزودن تراکنش', paymentStatus: 'وضعیت پرداخت',
    paid: 'پرداخت شده', openDonation: 'کمک آزاد', supportEmergency: 'حمایت از صندوق اضطراری',
    donateText: 'افراد غیرعضو هم می‌توانند کمک کنند. همه کمک‌ها مستقیماً وارد صندوق اضطراری می‌شود.', emergencyBalance: 'موجودی صندوق اضطراری',
    externalDonations: 'کمک‌های بیرونی و ذخیره‌ها', customAmount: 'مبلغ دلخواه', donorName: 'نام کمک‌کننده، اختیاری',
    donateButton: 'کمک به صندوق اضطراری', shareDonation: 'اشتراک لینک کمک', recentDonations: 'کمک‌های اخیر',
    publicReport: 'گزارش عمومی', transparencyReport: 'گزارش شفافیت', transparencyText: 'گزارش ماهانه ساده و شفاف برای اعضا.',
    income: 'ورودی', payout: 'پرداختی', exportReport: 'خروجی گزارش', governance: 'قوانین و تصمیم‌گیری',
    governanceText: 'تصمیمات مهم با رأی اکثریت انجام می‌شود. تغییرات بزرگ نیاز به ۷۰٪ رأی موافق دارد.', openRules: 'مشاهده قوانین',
    emergencyCase: 'درخواست اضطراری',
    submitEmergencyCase: 'ثبت درخواست اضطراری',
    emergencyCaseText: 'درخواست محرمانه برای حمایت اضطراری ثبت کنید. کمیته آن را بررسی می‌کند.',
    requesterName: 'نام درخواست‌کننده',
    contactInfo: 'اطلاعات تماس',
    requestedAmount: 'مبلغ درخواستی',
    urgency: 'فوریت',
    low: 'کم',
    medium: 'متوسط',
    high: 'زیاد',
    reason: 'دلیل',
    caseDescription: 'توضیح',
    submitCase: 'ثبت درخواست',
    recentCases: 'درخواست‌های اضطراری اخیر',
    caseSubmitted: 'درخواست اضطراری برای بررسی ثبت شد.',
    underReview: 'در حال بررسی',
    language: 'EN', connected: 'اتصال به Supabase فعال است', demo: 'حالت دمو: متغیرهای Supabase را اضافه کنید', logout: 'خروج'
  }
};

const fallbackMembers = [
  { id: '1', full_name: 'Ali', status: 'active', trust_score: 94 },
  { id: '2', full_name: 'Sara', status: 'active', trust_score: 91 },
  { id: '3', full_name: 'Reza', status: 'pending', trust_score: 82 },
  { id: '4', full_name: 'Mina', status: 'active', trust_score: 88 },
];

const fallbackQueue = [
  { id: '1', receive_month: 'June', member_name: 'Sara', amount: 7500, active: true },
  { id: '2', receive_month: 'July', member_name: 'Reza', amount: 7500 },
  { id: '3', receive_month: 'August', member_name: 'Mina', amount: 7500 },
];

const fallbackDonations = [
  { id: '1', donor_name: 'Anonymous', amount: 250, created_at: new Date().toISOString() },
  { id: '2', donor_name: 'Nora', amount: 500, created_at: new Date().toISOString() },
  { id: '3', donor_name: 'Anonymous', amount: 100, created_at: new Date().toISOString() },
];

const fallbackEmergencyCases = [
  { id: '1', requester_name: 'Anonymous', requested_amount: 1500, urgency: 'medium', status: 'under_review', created_at: new Date().toISOString() },
];

function PayvandApp() {
  const [tab, setTab] = useState('landing');
  const [lang, setLang] = useState('en');
  const [session, setSession] = useState(null);
  const [members, setMembers] = useState(fallbackMembers);
  const [queue, setQueue] = useState(fallbackQueue);
  const [donations, setDonations] = useState(fallbackDonations);
  const [emergencyBalance, setEmergencyBalance] = useState(2050);
  const [emergencyCases, setEmergencyCases] = useState(fallbackEmergencyCases);
  const [loading, setLoading] = useState(false);

  const t = translations[lang];
  const rtl = lang === 'fa';

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => setSession(newSession));
    loadData();
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadData() {
    if (!isSupabaseConfigured) return;
    setLoading(true);
    const [membersRes, donationsRes, emergencyRes, queueRes, emergencyCasesRes] = await Promise.all([
      supabase.from('members').select('*').order('created_at', { ascending: true }),
      supabase.from('donations').select('*').order('created_at', { ascending: false }).limit(10),
      supabase.from('emergency_fund').select('amount,type'),
      supabase.from('queue').select('id, receive_month, amount, status, queue_position, members(full_name)').order('queue_position', { ascending: true }),
      supabase.from('emergency_cases').select('*').order('created_at', { ascending: false }).limit(10)
    ]);

    if (!membersRes.error && membersRes.data?.length) setMembers(membersRes.data);
    if (!donationsRes.error && donationsRes.data?.length) setDonations(donationsRes.data);
    if (!emergencyCasesRes?.error && emergencyCasesRes?.data?.length) setEmergencyCases(emergencyCasesRes.data);

    if (!emergencyRes.error && emergencyRes.data) {
      const total = emergencyRes.data.reduce((sum, row) => {
        return row.type === 'support_out' ? sum - Number(row.amount) : sum + Number(row.amount);
      }, 0);
      setEmergencyBalance(total);
    }

    if (!queueRes.error && queueRes.data?.length) {
      setQueue(queueRes.data.map((q, index) => ({
        id: q.id,
        receive_month: q.receive_month,
        amount: q.amount,
        member_name: q.members?.full_name || 'Member',
        active: index === 0
      })));
    }
    setLoading(false);
  }

  async function handleDonation({ donorName, amount }) {
    if (!amount || Number(amount) <= 0) return alert('Enter a valid amount');
    if (!isSupabaseConfigured) {
      alert('Demo mode: add Supabase environment variables first.');
      return;
    }

    const { data, error } = await supabase
      .from('donations')
      .insert({
        donor_name: donorName || 'Anonymous',
        amount: Number(amount),
        payment_status: 'received'
      })
      .select()
      .single();

    if (error) {
      alert(error.message);
      return;
    }

    await supabase.from('emergency_fund').insert({
      type: 'donation_in',
      amount: Number(amount),
      description: 'Open donation',
      related_donation_id: data.id
    });

    await loadData();
    alert('Donation registered in Emergency Fund.');
  }



  async function handleEmergencyCase(payload) {
    if (!payload.requesterName || !payload.contactInfo || !payload.requestedAmount || !payload.reason) {
      return alert('Please complete requester name, contact, amount, and reason.');
    }

    if (isSupabaseConfigured) {
      const { error } = await supabase.from('emergency_cases').insert({
        requester_name: payload.requesterName,
        contact_info: payload.contactInfo,
        requested_amount: Number(payload.requestedAmount),
        urgency: payload.urgency || 'medium',
        reason: payload.reason,
        description: payload.description || '',
        status: 'under_review'
      });
      if (error) return alert(error.message);
    }

    alert(t.caseSubmitted || 'Emergency case submitted.');
    await loadData();
  }

  async function handlePayment() {
    if (!members[0]) return alert('No member found');
    const month = new Date().toLocaleString('en', { month: 'long' });
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('payments').insert({
        member_id: members[0].id,
        amount: 500,
        payment_month: month,
        payment_status: 'paid'
      });
      if (error) return alert(error.message);
    }
    alert('Payment registered.');
    await loadData();
  }

  async function handleTransaction() {
    const amount = prompt('Amount in NOK:');
    if (!amount || Number(amount) <= 0) return;
    const description = prompt('Description:', 'Manual transaction') || 'Manual transaction';
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('emergency_fund').insert({
        type: 'reserve_in',
        amount: Number(amount),
        description
      });
      if (error) return alert(error.message);
    }
    alert('Transaction added.');
    await loadData();
  }

  async function handleAddMember() {
    const fullName = prompt('New member full name:');
    if (!fullName) return;
    if (isSupabaseConfigured) {
      const { error } = await supabase.from('members').insert({
        full_name: fullName,
        monthly_amount: 500,
        trust_score: 80,
        status: 'pending'
      });
      if (error) return alert(error.message);
    }
    alert('Member added.');
    await loadData();
  }

  async function shareDonationLink() {
    const url = `${window.location.origin}?tab=donate`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'Payvand Donation', text: 'Support Payvand Emergency Fund', url });
      } else {
        await navigator.clipboard.writeText(url);
        alert('Donation link copied.');
      }
    } catch {
      await navigator.clipboard.writeText(url);
      alert('Donation link copied.');
    }
  }

  function exportReport() {
    const rows = [
      ['Metric','Value'],
      ['Members', members.length],
      ['Income', members.length * 500],
      ['Payout', members.length * 500],
      ['Emergency Fund', emergencyBalance],
      ['Pending', members.filter(m => m.status !== 'active').length]
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'payvand-report.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    alert('Report downloaded.');
  }

  function openRules() {
    alert('Payvand rules:\n\n1. Members must pay monthly on time.\n2. After receiving payout, members continue payments until the cycle ends.\n3. Emergency donations are used only for approved support cases.\n4. Major rule changes require 70% approval.');
  }

  function viewQueue() {
    const el = document.getElementById('monthly-queue');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

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
          <Header setTab={setTab} lang={lang} setLang={setLang} t={t} session={session} setSession={setSession} />
          <div className="status-line">{isSupabaseConfigured ? t.connected : t.demo}{loading ? ' · loading...' : ''}</div>

          {tab === 'landing' && <LandingScreen setTab={setTab} t={t} emergencyBalance={emergencyBalance} />}
          {tab === 'login' && <LoginScreen setTab={setTab} t={t} />}
          {tab === 'home' && <HomeScreen t={t} members={members} queue={queue} emergencyBalance={emergencyBalance} onPay={handlePayment} onViewQueue={viewQueue} />}
          {tab === 'fund' && <FundScreen t={t} members={members} emergencyBalance={emergencyBalance} onAddTransaction={handleTransaction} />}
          {tab === 'donate' && <DonateScreen t={t} donations={donations} emergencyCases={emergencyCases} emergencyBalance={emergencyBalance} onDonate={handleDonation} onShare={shareDonationLink} onEmergencyCase={handleEmergencyCase} />}
          {tab === 'members' && <MembersScreen t={t} members={members} onAddMember={handleAddMember} />}
          {tab === 'reports' && <ReportsScreen t={t} members={members} emergencyBalance={emergencyBalance} onExport={exportReport} onOpenRules={openRules} />}
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

function Header({ setTab, lang, setLang, t, session, setSession }) {
  async function logout() {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    setSession(null);
    setTab('landing');
  }
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
        {session ? <button className="icon-btn" onClick={logout}><LogOut size={20} /></button> : <button className="icon-btn" onClick={() => setTab('login')}><Bell size={20} /></button>}
      </div>
    </header>
  );
}

function LandingScreen({ setTab, t, emergencyBalance }) {
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
        <MiniCard icon={HandHeart} title={t.emergency} value={`${emergencyBalance} NOK`} />
        <MiniCard icon={BarChart3} title={t.reports} value="Open" />
      </div>
    </motion.div>
  );
}

function LoginScreen({ setTab, t }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  async function signIn() {
    if (!isSupabaseConfigured) return alert('Add Supabase environment variables first.');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return alert(error.message);
    setTab('home');
  }

  async function signUp() {
    if (!isSupabaseConfigured) return alert('Add Supabase environment variables first.');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return alert(error.message);
    if (data.user) {
      await supabase.from('profiles').insert({ id: data.user.id, full_name: fullName || email });
    }
    alert('Account created. Check email confirmation if enabled in Supabase.');
    setTab('home');
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack login">
      <div className="card">
        <h2>{t.loginTitle}</h2>
        <p className="muted">{t.loginText}</p>
        <input placeholder={t.fullName} value={fullName} onChange={(e) => setFullName(e.target.value)} />
        <input placeholder={t.email} value={email} onChange={(e) => setEmail(e.target.value)} />
        <input placeholder={t.password} type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="primary" onClick={signIn}><LogIn size={18} /> {t.signIn}</button>
        <button className="secondary" onClick={signUp}>{t.signUp}</button>
        <button className="secondary" onClick={() => setTab('landing')}>{t.back}</button>
      </div>
    </motion.div>
  );
}

function HomeScreen({ t, members, queue, emergencyBalance, onPay, onViewQueue }) {
  const currentPool = members.length * 500;
  const next = queue[0] || { member_name: 'Sara', receive_month: 'June', amount: 7500 };
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack">
      <div className="card">
        <div className="split"><div><p className="muted">{t.currentPool}</p><h2>{currentPool.toLocaleString()} NOK</h2><p className="tiny">{members.length} members × 500 NOK</p></div><div className="soft-icon"><Wallet /></div></div>
        <div className="actions"><button className="primary" onClick={onPay}>{t.payMonthly}</button><button className="secondary" onClick={onViewQueue}>{t.viewQueue}</button></div>
      </div>
      <div className="feature-grid"><MiniCard icon={ShieldCheck} title={t.trustScore} value="92%" /><MiniCard icon={HandHeart} title={t.emergencyFund} value={`${emergencyBalance} NOK`} /></div>
      <div className="card"><div className="split mb"><h3>{t.nextReceiver}</h3><span className="pill ok">{t.confirmed}</span></div><div className="person"><div className="avatar">{next.member_name?.[0] || 'S'}</div><div><b>{next.member_name}</b><p>{next.receive_month} payout · {Number(next.amount).toLocaleString()} NOK</p></div><ArrowUpRight className="muted-icon" /></div></div>
      <h3 className="section" id="monthly-queue">{t.monthlyQueue}</h3>
      {queue.map((q) => <QueueItem key={q.id} {...q} />)}
    </motion.div>
  );
}

function FundScreen({ t, members, emergencyBalance, onAddTransaction }) {
  const currentPool = members.length * 500;
  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
      <div className="card"><h2>{t.fundManagement}</h2><p className="muted">{t.fundManagementText}</p><FundRow label={t.collected} value={`${currentPool.toLocaleString()} NOK`} percent="87%" /><FundRow label={t.pending} value="1,000 NOK" percent="13%" /><FundRow label={t.emergencyReserve} value={`${emergencyBalance} NOK`} percent="28%" /><button className="primary full" onClick={onAddTransaction}>{t.addTransaction}</button></div>
      <div className="card"><h3>{t.paymentStatus}</h3>{members.map((m) => <PaymentMember key={m.id} member={m} t={t} />)}</div>
    </motion.div>
  );
}

function DonateScreen({ t, donations, emergencyCases, emergencyBalance, onDonate, onShare, onEmergencyCase }) {
  const [amount, setAmount] = useState('');
  const [donorName, setDonorName] = useState('');
  const [caseForm, setCaseForm] = useState({
    requesterName: '',
    contactInfo: '',
    requestedAmount: '',
    urgency: 'medium',
    reason: '',
    description: ''
  });

  function updateCaseField(field, value) {
    setCaseForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submitEmergencyCase() {
    await onEmergencyCase(caseForm);
    setCaseForm({
      requesterName: '',
      contactInfo: '',
      requestedAmount: '',
      urgency: 'medium',
      reason: '',
      description: ''
    });
  }

  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space">
    <div className="card">
      <div className="split">
        <div><p className="muted">{t.openDonation}</p><h2>{t.supportEmergency}</h2><p className="muted">{t.donateText}</p></div>
        <div className="soft-icon"><HandHeart /></div>
      </div>
      <div className="balance"><p>{t.emergencyBalance}</p><h2>{Number(emergencyBalance).toLocaleString()} NOK</h2><span>{t.externalDonations}</span></div>
      <div className="amount-grid">{['100', '250', '500'].map((a) => <button key={a} onClick={() => setAmount(a)}>{a} NOK</button>)}</div>
      <input placeholder={t.donorName} value={donorName} onChange={(e) => setDonorName(e.target.value)} />
      <input placeholder={t.customAmount} value={amount} onChange={(e) => setAmount(e.target.value)} />
      <button className="primary full green" onClick={() => onDonate({ donorName, amount })}>{t.donateButton}</button>
      <button className="secondary full" onClick={onShare}>{t.shareDonation}</button>
    </div>

    <div className="card emergency-case-card">
      <div className="split">
        <div><p className="muted">{t.emergencyCase}</p><h2>{t.submitEmergencyCase}</h2><p className="muted">{t.emergencyCaseText}</p></div>
        <div className="soft-icon"><ShieldCheck /></div>
      </div>
      <input placeholder={t.requesterName} value={caseForm.requesterName} onChange={(e) => updateCaseField('requesterName', e.target.value)} />
      <input placeholder={t.contactInfo} value={caseForm.contactInfo} onChange={(e) => updateCaseField('contactInfo', e.target.value)} />
      <input placeholder={t.requestedAmount} value={caseForm.requestedAmount} onChange={(e) => updateCaseField('requestedAmount', e.target.value)} />
      <select value={caseForm.urgency} onChange={(e) => updateCaseField('urgency', e.target.value)}>
        <option value="low">{t.low}</option>
        <option value="medium">{t.medium}</option>
        <option value="high">{t.high}</option>
      </select>
      <input placeholder={t.reason} value={caseForm.reason} onChange={(e) => updateCaseField('reason', e.target.value)} />
      <textarea placeholder={t.caseDescription} value={caseForm.description} onChange={(e) => updateCaseField('description', e.target.value)} />
      <button className="primary full" onClick={submitEmergencyCase}>{t.submitCase}</button>
    </div>

    <div className="card">
      <div className="split mb"><h3>{t.recentDonations}</h3><span className="tiny">{t.publicReport}</span></div>
      {donations.map((d) => <div className="donation" key={d.id}><div className="person compact"><div className="mini-icon"><HandHeart size={16} /></div><div><b>{d.donor_name || 'Anonymous'}</b><p>{new Date(d.created_at).toLocaleDateString()}</p></div></div><b className="green-text">{Number(d.amount).toLocaleString()} NOK</b></div>)}
    </div>

    <div className="card">
      <div className="split mb"><h3>{t.recentCases}</h3><span className="tiny">{t.underReview}</span></div>
      {emergencyCases.map((c) => <div className="donation" key={c.id}><div className="person compact"><div className="mini-icon"><ShieldCheck size={16} /></div><div><b>{c.requester_name || 'Anonymous'}</b><p>{c.urgency || 'medium'} · {new Date(c.created_at).toLocaleDateString()}</p></div></div><b className="green-text">{Number(c.requested_amount || 0).toLocaleString()} NOK</b></div>)}
    </div>
  </motion.div>;
}

function MembersScreen({ t, members, onAddMember }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space"><div className="split"><h2 className="white-title">{t.members}</h2><button className="white-btn" onClick={onAddMember}><Plus size={18} /></button></div><div className="card">{members.map((m) => <div className="member" key={m.id}><div className="avatar small">{m.full_name?.[0] || 'M'}</div><div><b>{m.full_name}</b><p>{t.trustScore}: {m.trust_score}</p></div><span className={m.status === 'active' ? 'pill ok' : 'pill warn'}>{m.status === 'active' ? t.paid : t.pending}</span></div>)}</div></motion.div>;
}

function ReportsScreen({ t, members, emergencyBalance, onExport, onOpenRules }) {
  return <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="stack top-space"><div className="card"><h2>{t.transparencyReport}</h2><p className="muted">{t.transparencyText}</p><div className="feature-grid"><MiniCard icon={Wallet} title={t.income} value={(members.length * 500).toLocaleString()} /><MiniCard icon={ArrowUpRight} title={t.payout} value={(members.length * 500).toLocaleString()} /><MiniCard icon={Clock3} title={t.pending} value="2" /><MiniCard icon={CheckCircle2} title={t.emergencyFund} value={emergencyBalance.toLocaleString()} /></div><button className="primary full" onClick={onExport}>{t.exportReport}</button></div><div className="card"><h3>{t.governance}</h3><p className="muted">{t.governanceText}</p><button className="secondary full" onClick={onOpenRules}><Settings size={16} /> {t.openRules}</button></div></motion.div>;
}

function MiniCard({ icon: Icon, title, value }) { return <div className="mini-card"><Icon size={20} /><p>{title}</p><b>{value}</b></div>; }
function QueueItem({ receive_month, member_name, amount, active }) { return <div className={active ? 'queue active' : 'queue'}><div className="month">{receive_month?.slice(0, 3)}</div><div><b>{member_name}</b><p>{Number(amount).toLocaleString()} NOK</p></div>{active ? <CheckCircle2 className="green-text" /> : <Clock3 className="muted-icon" />}</div>; }
function FundRow({ label, value, percent }) { return <div className="fund-row"><div><span>{label}</span><b>{value}</b></div><div className="bar"><span style={{ width: percent }} /></div></div>; }
function PaymentMember({ member, t }) { return <div className="payment-member"><div className="person compact"><div className="avatar tiny-avatar">{member.full_name?.[0] || 'M'}</div><b>{member.full_name}</b></div><span className={member.status === 'active' ? 'pill ok' : 'pill warn'}>{member.status === 'active' ? t.paid : t.pending}</span></div>; }

createRoot(document.getElementById('root')).render(<PayvandApp />);
