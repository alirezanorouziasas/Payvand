import { supabase, demoMode } from './supabase';

const demo = {
  members: [
    { id: '1', name: 'Alireza', email: 'owner@payvand.app', city: 'Trondheim', role: 'owner', status: 'approved', trust_score: 96 },
    { id: '2', name: 'Sara', email: 'sara@email.com', city: 'Oslo', role: 'member', status: 'approved', trust_score: 91 },
    { id: '3', name: 'Reza', email: 'reza@email.com', city: 'Bergen', role: 'member', status: 'pending', trust_score: 75 },
  ],
  payments: [
    { id: 'p1', member_name: 'Sara', amount: 500, status: 'approved', receipt_url: 'receipt.pdf', created_at: new Date().toISOString() },
    { id: 'p2', member_name: 'Reza', amount: 500, status: 'pending', receipt_url: 'receipt.png', created_at: new Date().toISOString() },
  ],
  queue: [
    { id: 'q1', member_name: 'Sara', payout_month: 'June', amount: 7500, status: 'confirmed' },
    { id: 'q2', member_name: 'Reza', payout_month: 'July', amount: 7500, status: 'upcoming' },
  ],
  donations: [{ id: 'd1', donor_name: 'Guest', amount: 250, status: 'pending', created_at: new Date().toISOString() }, { id: 'd2', donor_name: 'Verified donor', amount: 500, status: 'approved', created_at: new Date().toISOString() }],
  cases: [{ id: 'c1', title: 'Rent support', member_name: 'Reza', requested_amount: 2500, urgency: 'High', status: 'pending', description: 'Temporary rent support request.' }],
  audit_logs: [{ id: 'a1', action: 'Demo audit log created', created_at: new Date().toISOString() }]
};

function local(key) {
  const saved = localStorage.getItem('payvand_' + key);
  if (saved) return JSON.parse(saved);
  localStorage.setItem('payvand_' + key, JSON.stringify(demo[key] || []));
  return demo[key] || [];
}
function save(key, val) {
  localStorage.setItem('payvand_' + key, JSON.stringify(val));
  return val;
}

export async function list(table) {
  if (demoMode) return local(table);
  const { data, error } = await supabase.from(table).select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

export async function insert(table, row) {
  if (demoMode) {
    const rows = local(table);
    const next = { id: crypto.randomUUID(), created_at: new Date().toISOString(), ...row };
    return save(table, [next, ...rows])[0];
  }
  const { data, error } = await supabase.from(table).insert(row).select().single();
  if (error) throw error;
  return data;
}

export async function update(table, id, patch) {
  if (demoMode) {
    const rows = local(table).map(r => r.id === id ? { ...r, ...patch } : r);
    save(table, rows);
    return rows.find(r => r.id === id);
  }
  const { data, error } = await supabase.from(table).update(patch).eq('id', id).select().single();
  if (error) throw error;
  return data;
}

export async function uploadFile(bucket, path, file) {
  if (demoMode) return { path, publicUrl: URL.createObjectURL(file) };
  const { error } = await supabase.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl };
}

export async function audit(action, actor = 'system') {
  return insert('audit_logs', { action, actor });
}

export function paymentOptions() {
  return {
    stripe: import.meta.env.VITE_STRIPE_PAYMENT_LINK || '',
    vipps: import.meta.env.VITE_VIPPS_NUMBER || '',
    bank: import.meta.env.VITE_BANK_ACCOUNT || ''
  };
}
