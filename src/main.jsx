import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Home, Users, Wallet, BarChart3, Bell, CheckCircle2, Clock3, HandHeart, Lock,
  LogIn, Upload, UserPlus, Download, ClipboardList, Scale, ShieldCheck, Eye,
  Check, Ban, FileText, Smartphone, CreditCard, Activity, RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import { demoMode, signIn, signUp, signOut, getSession, resetPassword, updatePassword } from './lib/supabase';
import { list, insert, update, uploadFile, audit, paymentOptions } from './lib/api';
import './styles.css';

const ownerEmail = 'alirezanorouziasas@gmail.com';

function App() {
  const [tab, setTab] = useState(new URLSearchParams(window.location.search).get('mode') === 'update-password' ? 'updatePassword' : 'home');
  const [user, setUser] = useState({ email: '', role: 'guest', name: 'Guest' });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [data, setData] = useState({ profiles: [], members: [], payments: [], donations: [], cases: [], queue: [], groups: [], group_memberships: [], audit_logs: [] });

  const isOwner = user?.role === 'owner' || (user?.email && user.email === ownerEmail);
  const isAdmin = isOwner || user?.role === 'admin';
  const approvedDonations = data.donations.filter(d => d.status === 'approved');
  const pendingDonations = data.donations.filter(d => d.status === 'pending');
  const emergencyFund = 1200 + approvedDonations.reduce((s, d) => s + Number(d.amount || 0), 0);
  const pendingPayments = data.payments.filter(p => p.status === 'pending').length;
  const pendingCases = data.cases.filter(c => c.status === 'pending').length;
  const nextReceiver = data.queue.find(q => q.status === 'confirmed') || data.queue[0];

  function show(msg) { setToast(msg); setTimeout(() => setToast(''), 2600); }

  async function load() {
    setLoading(true);
    try {
      const [profiles, members, payments, donations, cases, queue, groups, group_memberships, audit_logs] = await Promise.all([
        list('profiles'), list('members'), list('payments'), list('donations'), list('cases'), list('queue'), list('groups'), list('group_memberships'), list('audit_logs')
      ]);
      setData({ profiles, members, payments, donations, cases, queue, groups, group_memberships, audit_logs });
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
      ['Groups', data.groups?.length || 0],
      ['Group memberships', data.group_memberships?.length || 0],
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

  const props = { tab, setTab, user, setUser, data, load, isOwner, isAdmin, emergencyFund, approvedDonations, pendingDonations, nextReceiver, pendingPayments, pendingCases, show, approve, reject, exportReport };

  const nav = [
    ['home', Home, 'Home'],
    ['fund', Wallet, 'Member'],
    ['groups', Users, 'Groups'],
    ['cases', ClipboardList, 'Cases'],
    ['donate', HandHeart, 'Donate'],
    ['analytics', BarChart3, 'Stats'],
  ];
  const adminNav = [
    ['admin', Lock, 'Admin'],
    ['governance', Scale, 'Rules'],
  ];

  return (
    <div className="page">
      <div className="phone">
        <div className="hero-bg" />
        <div className="content">
          <Header setTab={setTab} user={user} show={show} loading={loading} load={load} isAdmin={isAdmin} />
          {demoMode && <div className="demo">Demo mode: connect Supabase env variables for real database, auth, storage, RLS and audit logs.</div>}
          {tab === 'home' && <HomeScreen {...props} />}
          {tab === 'auth' && <AuthScreen {...props} accessType="member" />}
          {tab === 'adminAuth' && <AuthScreen {...props} accessType="admin" />}
          {tab === 'updatePassword' && <UpdatePasswordScreen {...props} />}
          {tab === 'fund' && <FundScreen {...props} />}
          {tab === 'groups' && <GroupsScreen {...props} />}
          {tab === 'cases' && <CasesScreen {...props} />}
          {tab === 'donate' && <DonateScreen {...props} />}
          {tab === 'admin' && <AdminScreen {...props} />}
          {tab === 'analytics' && <AnalyticsScreen {...props} />}
          {tab === 'governance' && <GovernanceScreen />}
        </div>
        <nav className="bottom-nav">
          {[...nav, ...(isAdmin ? adminNav : [])].map(([id, Icon, label]) => (
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

function Header({ setTab, user, show, loading, load, isAdmin }) {
  return (
    <header className="header">
      <button className="brand" onClick={() => setTab('home')}>
        <img src="/logo.svg" alt="Payvand" />
        <div><h1><span>Pay</span>vand</h1><p>{user?.role || 'guest'} access</p></div>
      </button>
      <div className="header-actions">
        <button onClick={() => setTab('auth')} className="small-header-btn">Member Login</button>
        <button onClick={() => setTab('adminAuth')} className="small-header-btn admin-login">Admin Login</button>
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
      <Mini icon={HandHeart} title="Verified Emergency Fund" value={`${emergencyFund} NOK`} />
      <Mini icon={Clock3} title="Pending Approvals" value={pendingPayments + pendingCases} />
    </div>
    <Card>
      <h3>Next Receiver</h3>
      <div className="row"><div className="avatar">{(nextReceiver?.member_name || 'S')[0]}</div><div><b>{nextReceiver?.member_name || 'Sara'}</b><p>{nextReceiver?.payout_month || 'June'} · {nextReceiver?.status || 'confirmed'}</p></div></div>
    </Card>
    <Card><h3>Quick Actions</h3><button className="secondary full" onClick={() => setTab('groups')}>Join a Group</button><button className="secondary full" onClick={() => setTab('governance')}>Read Terms & Governance</button><button className="secondary full" onClick={() => setTab('analytics')}>Open Analytics</button></Card>
  </motion.div>
}

function AuthScreen({ setUser, setTab, show, load, accessType = 'member' }) {
  const [mode, setMode] = useState('signin');
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [resetEmail, setResetEmail] = useState('');
  const isAdminLogin = accessType === 'admin';

  async function submit() {
    try {
      if (demoMode) {
        const role = isAdminLogin ? 'owner' : 'member';
        setUser({ email: form.email || ownerEmail, role, name: form.name || 'User' });
        show(isAdminLogin ? 'Admin demo access granted.' : 'Member demo access granted.');
        setTab(isAdminLogin ? 'admin' : 'home');
        return;
      }

      let authData;
      if (mode === 'signup') {
        if (isAdminLogin) {
          show('Admin accounts cannot self-register. Sign up as a member first, then owner promotes admin.');
          return;
        }
        authData = await signUp(form.email.trim(), form.password, form.name);
        show('Member account created. Check email confirmation if enabled.');
      } else {
        authData = await signIn(form.email.trim(), form.password);
      }

      const userId = authData?.user?.id || authData?.session?.user?.id;
      let profile = null;
      if (userId) {
        const { supabase } = await import('./lib/supabase');
        const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
        profile = data;
      }

      const role = profile?.role || (form.email.trim() === ownerEmail ? 'owner' : 'member');

      if (isAdminLogin && !['owner', 'admin'].includes(role) && form.email !== ownerEmail) {
        show('Access denied. This login is only for owner/admin.');
        return;
      }

      setUser({ email: form.email.trim(), role, name: profile?.full_name || form.name || form.email });
      await load();
      show(isAdminLogin ? 'Admin signed in.' : 'Member signed in.');
      setTab(isAdminLogin ? 'admin' : 'home');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }

  async function requestReset() {
    try {
      const email = resetEmail || form.email;
      if (!email) return show('Enter your email first.');
      if (demoMode) return show('Password reset works after Supabase is connected.');
      await resetPassword(email);
      show('Password reset email sent. Check your inbox.');
      setMode('signin');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }

  if (mode === 'forgot') {
    return <Screen title={isAdminLogin ? 'Reset Admin Password' : 'Reset Member Password'} subtitle="Enter your email and we will send you a password reset link.">
      <input placeholder="Email" value={resetEmail} onChange={e=>setResetEmail(e.target.value)}/>
      <button className="primary full" onClick={requestReset}>Send Reset Email</button>
      <button className="secondary full" onClick={() => setMode('signin')}>Back to sign in</button>
    </Screen>
  }

  return <Screen title={isAdminLogin ? 'Admin Access' : 'Member Login / Registration'} subtitle={isAdminLogin ? 'Only the owner and approved admins can enter this area.' : 'Members can register, submit payments, view queue, donate, and submit emergency cases.'}>
    {!isAdminLogin && <input placeholder="Full name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/>}
    <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
    <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})}/>
    <button className="primary full" onClick={submit}><LogIn size={17}/> {mode === 'signup' ? 'Sign up' : 'Sign in'}</button>
    <button className="secondary full" onClick={() => setMode('forgot')}>Forgot password?</button>
    {!isAdminLogin && <button className="secondary full" onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')}>{mode === 'signup' ? 'Switch to sign in' : 'Switch to sign up'}</button>}
  </Screen>
}

function UpdatePasswordScreen({ setTab, show }) {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  async function submitNewPassword() {
    try {
      if (!password || password.length < 6) return show('Password must be at least 6 characters.');
      if (password !== confirm) return show('Passwords do not match.');
      if (demoMode) return show('Update password works after Supabase is connected.');
      await updatePassword(password);
      show('Password updated. You can sign in now.');
      window.history.replaceState({}, document.title, window.location.origin);
      setTab('auth');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }

  return <Screen title="Create New Password" subtitle="Enter and confirm your new password.">
    <input placeholder="New password" type="password" value={password} onChange={e=>setPassword(e.target.value)}/>
    <input placeholder="Confirm new password" type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}/>
    <button className="primary full" onClick={submitNewPassword}>Update Password</button>
    <button className="secondary full" onClick={() => setTab('auth')}>Back to login</button>
  </Screen>
}


function GroupsScreen({ data, user, isAdmin, load, show }) {
  const [selected, setSelected] = useState('');
  const groups = data.groups || [];
  const memberships = data.group_memberships || [];

  async function joinGroup(group) {
    try {
      if (!user?.email) {
        show('Please sign in as a member first.');
        return;
      }
      const already = memberships.find(m => m.group_id === group.id && (m.member_email || '').toLowerCase() === user.email.toLowerCase());
      if (already) {
        show(`You already requested/joined this group. Status: ${already.status}`);
        return;
      }
      await insert('group_memberships', {
        group_id: group.id,
        member_email: user.email,
        member_name: user.name || user.email,
        status: 'pending'
      });
      await audit(`Requested to join group: ${group.name}`, user.email);
      await load();
      show('Join request sent. Admin must approve it.');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }

  const visibleGroups = groups.filter(g => g.status !== 'closed' || isAdmin);

  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card>
      <h2>Payvand Groups</h2>
      <p className="muted">Groups let Payvand run several rotating funds in parallel. A member can join one or more groups instead of waiting for one long round to finish.</p>
      <div className="grid2">
        <Mini icon={Users} title="Active groups" value={visibleGroups.filter(g => g.status !== 'closed').length}/>
        <Mini icon={Clock3} title="Your requests" value={memberships.filter(m => (m.member_email || '').toLowerCase() === (user?.email || '').toLowerCase()).length}/>
      </div>
    </Card>

    <Card>
      <h3>Available Groups</h3>
      {visibleGroups.length === 0 && <p className="muted">No groups have been created yet.</p>}
      {visibleGroups.map(group => {
        const groupMemberships = memberships.filter(m => m.group_id === group.id && ['approved','active','pending'].includes(m.status));
        const approvedCount = groupMemberships.filter(m => ['approved','active'].includes(m.status)).length;
        const myMembership = memberships.find(m => m.group_id === group.id && (m.member_email || '').toLowerCase() === (user?.email || '').toLowerCase());
        const capacity = Number(group.capacity || 0);
        const isFull = capacity > 0 && approvedCount >= capacity;
        return <div className="group-card" key={group.id}>
          <div className="split">
            <div>
              <h3>{group.name}</h3>
              <p className="muted">{group.description || 'Parallel rotating group'}</p>
            </div>
            <span className={`badge ${group.status || 'active'}`}>{group.status || 'active'}</span>
          </div>
          <div className="grid2">
            <Mini icon={Wallet} title="Monthly amount" value={`${group.monthly_amount || 0} NOK`}/>
            <Mini icon={HandHeart} title="Payout" value={`${group.payout_amount || 0} NOK`}/>
            <Mini icon={Users} title="Members" value={`${approvedCount}${capacity ? '/' + capacity : ''}`}/>
            <Mini icon={Clock3} title="Period" value={`${group.period_months || capacity || '-'} months`}/>
          </div>
          <p className="tiny">Start: {group.start_month || 'Not set'} · Frequency: {group.frequency || 'monthly'}</p>
          {myMembership && <p className="tiny">Your status: <b>{myMembership.status}</b></p>}
          <button className="primary full" disabled={isFull || !!myMembership || group.status === 'closed'} onClick={() => joinGroup(group)}>
            {isFull ? 'Group Full' : myMembership ? 'Request Sent' : 'Join This Group'}
          </button>
        </div>
      })}
    </Card>
  </motion.div>
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
    } catch(e) { show(e?.message || JSON.stringify(e)); }
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
    } catch(e) { show(e?.message || JSON.stringify(e)); }
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
      await insert('donations', { donor_name: 'Guest', amount: Number(amount), emergency_fund: true, status: 'pending' });
      await audit(`Donation submitted for admin verification: ${amount} NOK`, 'guest');
      await load();
      show('Donation submitted. It will be added after admin verification.');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }
  return <Screen title="Donate to Emergency Fund" subtitle="Guest donations are separate from member rotation funds.">
    <input value={amount} onChange={e=>setAmount(e.target.value.replace(/\D/g,''))} placeholder="Amount NOK"/>
    <button className="primary full" onClick={donate}><HandHeart size={17}/> Record Donation</button>
    {opts.stripe && <a className="secondary full link" href={opts.stripe} target="_blank">Pay by Stripe</a>}
    <p className="muted">Vipps: {opts.vipps || 'add VITE_VIPPS_NUMBER'}</p>
    <p className="muted">Bank: {opts.bank || 'add VITE_BANK_ACCOUNT'}</p>
  </Screen>
}

function AdminScreen({ isOwner, isAdmin, data, approve, reject, load, show }) {
  if (!isAdmin) return <Screen title="Admin Access Required" subtitle="Only the owner and approved admins can access this panel." icon={Lock}/>;

  const pendingPayments = data.payments.filter(p => p.status === 'pending');
  const pendingCases = data.cases.filter(c => c.status === 'pending');
  const pendingMembers = data.members.filter(m => m.status === 'pending');
  const pendingDonations = data.donations.filter(d => d.status === 'pending');
  const profiles = data.profiles || [];
  const groups = data.groups || [];
  const pendingGroupMemberships = (data.group_memberships || []).filter(m => m.status === 'pending');
  const [groupForm, setGroupForm] = useState({ name:'', description:'', monthly_amount:'500', capacity:'10', payout_amount:'5000', period_months:'10', start_month:'', frequency:'monthly', status:'active' });

  async function createGroup() {
    try {
      await insert('groups', {
        name: groupForm.name,
        description: groupForm.description,
        monthly_amount: Number(groupForm.monthly_amount || 0),
        capacity: Number(groupForm.capacity || 0),
        payout_amount: Number(groupForm.payout_amount || 0),
        period_months: Number(groupForm.period_months || 0),
        start_month: groupForm.start_month,
        frequency: groupForm.frequency,
        status: groupForm.status
      });
      await audit(`Created group: ${groupForm.name}`, 'owner/admin');
      await load();
      setGroupForm({ name:'', description:'', monthly_amount:'500', capacity:'10', payout_amount:'5000', period_months:'10', start_month:'', frequency:'monthly', status:'active' });
      show('Group created.');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }

  async function approveGroupMembership(id) {
    try {
      await update('group_memberships', id, { status: 'approved' });
      await audit(`Approved group membership: ${id}`, 'owner/admin');
      await load();
      show('Group membership approved.');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }

  async function rejectGroupMembership(id) {
    try {
      await update('group_memberships', id, { status: 'rejected' });
      await audit(`Rejected group membership: ${id}`, 'owner/admin');
      await load();
      show('Group membership rejected.');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }


  async function makeAdmin(profileId, role = 'admin') {
    try {
      if (demoMode) return show('Admin promotion works after Supabase connection.');
      const { supabase } = await import('./lib/supabase');
      const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId);
      if (error) throw error;
      await audit(`Changed profile role to ${role}: ${profileId}`, 'owner/admin');
      await load();
      show(role === 'admin' ? 'Admin access granted.' : 'Admin access removed.');
    } catch(e) { show(e?.message || JSON.stringify(e)); }
  }

  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card><h2>Admin Dashboard</h2><p className="muted">Separate owner/admin area. Only you and users promoted to admin can manage approvals.</p>
      <div className="grid2">
        <Mini icon={Clock3} title="Pending donations" value={pendingDonations.length}/>
        <Mini icon={ClipboardList} title="Pending cases" value={pendingCases.length}/>
        <Mini icon={Users} title="Group requests" value={pendingGroupMemberships.length}/>
        <Mini icon={Wallet} title="Active groups" value={groups.filter(g => g.status !== "closed").length}/>
      </div>
    </Card>


    <Card>
      <h3>Create New Group</h3>
      <p className="muted">Use this to run several rotating circles at the same time.</p>
      <input placeholder="Group name, e.g. Payvand Group A" value={groupForm.name} onChange={e=>setGroupForm({...groupForm,name:e.target.value})}/>
      <textarea placeholder="Description / purpose" value={groupForm.description} onChange={e=>setGroupForm({...groupForm,description:e.target.value})}/>
      <div className="grid2">
        <input placeholder="Monthly amount" value={groupForm.monthly_amount} onChange={e=>setGroupForm({...groupForm,monthly_amount:e.target.value.replace(/\D/g,'')})}/>
        <input placeholder="Capacity" value={groupForm.capacity} onChange={e=>setGroupForm({...groupForm,capacity:e.target.value.replace(/\D/g,'')})}/>
        <input placeholder="Payout amount" value={groupForm.payout_amount} onChange={e=>setGroupForm({...groupForm,payout_amount:e.target.value.replace(/\D/g,'')})}/>
        <input placeholder="Period months" value={groupForm.period_months} onChange={e=>setGroupForm({...groupForm,period_months:e.target.value.replace(/\D/g,'')})}/>
      </div>
      <input placeholder="Start month, e.g. August 2026" value={groupForm.start_month} onChange={e=>setGroupForm({...groupForm,start_month:e.target.value})}/>
      <select value={groupForm.status} onChange={e=>setGroupForm({...groupForm,status:e.target.value})}>
        <option value="active">active</option>
        <option value="draft">draft</option>
        <option value="closed">closed</option>
      </select>
      <button className="primary full" onClick={createGroup}>Create Group</button>
    </Card>

    <Card>
      <h3>Pending Group Join Requests</h3>
      {pendingGroupMemberships.length === 0 && <p className="muted">No pending group requests.</p>}
      {pendingGroupMemberships.map(m => {
        const group = groups.find(g => g.id === m.group_id);
        return <ApproveRow key={m.id} title={`${m.member_name || m.member_email} → ${group?.name || 'Group'}`} sub={`${m.member_email || ''} · ${m.status}`} onApprove={()=>approveGroupMembership(m.id)} onReject={()=>rejectGroupMembership(m.id)}/>
      })}
    </Card>

    <Card>
      <h3>Existing Groups</h3>
      {groups.length === 0 && <p className="muted">No groups yet.</p>}
      {groups.map(g => <Row key={g.id} title={g.name} sub={`${g.status} · ${g.monthly_amount || 0} NOK/month · capacity ${g.capacity || '-'}`} status={g.status}/>)}
    </Card>


    <Card><h3>Verify Donations</h3>{pendingDonations.length === 0 && <p className="muted">No pending donations.</p>}{pendingDonations.map(d => <ApproveRow key={d.id} title={`${d.donor_name || 'Guest'} · ${d.amount} NOK`} sub={`Status: ${d.status}. Added to Emergency Fund only after approval.`} onApprove={()=>approve('donations', d.id, 'donation')} onReject={()=>reject('donations', d.id, 'donation')}/>)}</Card>

    <Card><h3>Pending Payments</h3>{pendingPayments.length === 0 && <p className="muted">No pending payments.</p>}{pendingPayments.map(p => <ApproveRow key={p.id} title={`${p.member_name || 'Member'} · ${p.amount} NOK`} sub={`${p.status} · ${p.receipt_url || ''}`} onApprove={()=>approve('payments', p.id, 'payment')} onReject={()=>reject('payments', p.id, 'payment')}/>)}</Card>

    <Card><h3>Pending Members</h3>{pendingMembers.length === 0 && <p className="muted">No pending members.</p>}{pendingMembers.map(m => <ApproveRow key={m.id} title={m.name} sub={`${m.email || ''} · ${m.status}`} onApprove={()=>approve('members', m.id, 'member')} onReject={()=>reject('members', m.id, 'member')}/>)}</Card>

    <Card><h3>Emergency Cases</h3>{pendingCases.length === 0 && <p className="muted">No pending cases.</p>}{pendingCases.map(c => <ApproveRow key={c.id} title={c.title} sub={`${c.status} · ${c.requested_amount} NOK · ${c.urgency || ''}`} onApprove={()=>approve('cases', c.id, 'case')} onReject={()=>reject('cases', c.id, 'case')}/>)}</Card>

    {isOwner && <Card><h3>Admin Access Management</h3><p className="muted">Only owner can promote or remove admins.</p>{profiles.map(p => <div className="row line" key={p.id}><div><b>{p.full_name || p.email}</b><p>{p.email} · {p.role}</p></div><div className="row-actions">{p.role !== 'admin' && p.role !== 'owner' && <button className="okbtn wide" onClick={()=>makeAdmin(p.id, 'admin')}>Make Admin</button>}{p.role === 'admin' && <button className="badbtn wide" onClick={()=>makeAdmin(p.id, 'member')}>Remove Admin</button>}</div></div>)}</Card>}

    <Card><h3>Audit Logs</h3>{data.audit_logs.map(a => <Row key={a.id} title={a.action} sub={new Date(a.created_at).toLocaleString()} />)}</Card>
  </motion.div>
}

function AnalyticsScreen({ data, emergencyFund, exportReport }) {
  const approvedPayments = data.payments.filter(p => p.status === 'approved').length;
  const pending = data.payments.filter(p => p.status === 'pending').length + data.cases.filter(c => c.status === 'pending').length;
  return <motion.div className="stack top" initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}>
    <Card><h2>Analytics</h2><p className="muted">Real dashboard from database values.</p><div className="grid2"><Mini icon={Users} title="Members" value={data.members.length}/><Mini icon={Wallet} title="Approved payments" value={approvedPayments}/><Mini icon={HandHeart} title="Emergency fund" value={emergencyFund}/><Mini icon={Users} title="Groups" value={data.groups?.length || 0}/><Mini icon={Clock3} title="Pending actions" value={pending + ((data.group_memberships || []).filter(m => m.status === "pending").length)}/></div><button className="primary full" onClick={exportReport}><Download size={17}/> Export CSV</button></Card>
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
      title: '5. Groups / Parallel Circles',
      text: 'Payvand can operate several groups at the same time. A member may request to join one or more groups. Each group has its own monthly amount, capacity, payout size, queue, and start month. Join requests must be approved by owner/admin before the member becomes active in that group.'
    },
    {
      title: '6. Responsibility After Receiving Payout',
      text: 'A member who receives a payout must continue paying until the round ends. Leaving after receiving money is allowed only after the remaining obligation is settled.'
    },
    {
      title: '7. Late Payment',
      text: 'Late payment may trigger reminders, trust-score reduction, delayed payout, suspension, or removal depending on severity and repetition.'
    },
    {
      title: '8. Payment Verification',
      text: 'Payments require receipt upload or proof of transfer. The owner/admin verifies payment records before they are considered approved.'
    },
    {
      title: '9. Emergency Fund',
      text: 'Donations and reserved amounts go into the Emergency Fund. This fund is separate from the rotating member payout and should only be used for approved emergency support.'
    },
    {
      title: '10. Emergency Case Submission',
      text: 'A person can submit an emergency case with title, description, urgency, requested amount, and optional proof documents. Sensitive case details must remain confidential.'
    },
    {
      title: '11. Emergency Case Review',
      text: 'Emergency cases are reviewed by the owner/admin or committee. Decisions should consider urgency, evidence, fairness, available balance, and risk of misuse.'
    },
    {
      title: '12. Donations',
      text: 'Non-members can donate to support emergency cases. Donations are recorded separately from member contributions and should be included in transparency reporting.'
    },
    {
      title: '13. Transparency Reporting',
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
