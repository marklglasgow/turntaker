import React, { useState, useEffect } from 'react';
import { Users, Plus, History, Download, SkipForward, Star, CheckCircle, LogOut, XCircle } from 'lucide-react';

const getStorage = async (key) => {
  try {
    const r = await window.storage.get(key);
    return r ? JSON.parse(r.value) : null;
  } catch { return null; }
};

const setStorage = async (key, data) => {
  try {
    await window.storage.set(key, JSON.stringify(data));
    return true;
  } catch { return false; }
};

const listKeys = async (prefix) => {
  try {
    const r = await window.storage.list(prefix);
    return r ? r.keys : [];
  } catch { return []; }
};

export default function TurnTakerApp() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [tts, setTts] = useState([]);
  const [sel, setSel] = useState(null);
  const [load, setLoad] = useState(true);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [isLogin, setIsLogin] = useState(true);
  const [newTT, setNewTT] = useState({ name: '', notify: true, freq: 'weekly', reorder: 'keep' });
  const [invEmail, setInvEmail] = useState('');
  const [showHist, setShowHist] = useState(false);

  useEffect(() => {
    (async () => {
      const s = localStorage.getItem('session');
      if (s) {
        const session = JSON.parse(s);
        setUser(session);
        const users = JSON.parse(localStorage.getItem('users') || '{}');
        const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
        setTts(allTTs.filter(t => t.parts.some(p => p.id === session.id)));
      }
      setLoad(false);
    })();
  }, []);

  const auth = async (e) => {
    e.preventDefault();
    if (isLogin) {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      const u = Object.values(users).find(x => x.email === form.email);
      if (u && u.password === form.password) {
        setUser(u);
        localStorage.setItem('session', JSON.stringify(u));
        const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
        setTts(allTTs.filter(t => t.parts.some(p => p.id === u.id)));
        setView('dash');
      } else alert('Invalid credentials');
    } else {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      if (Object.values(users).some(x => x.email === form.email)) {
        alert('Email exists');
        return;
      }
      const nu = { id: 'u' + Date.now(), name: form.name, email: form.email, password: form.password };
      users[nu.id] = nu;
      localStorage.setItem('users', JSON.stringify(users));
      setUser(nu);
      localStorage.setItem('session', JSON.stringify(nu));
      setView('dash');
    }
  };

  const logout = async () => {
    setUser(null);
    localStorage.removeItem('session');
    setView('login');
    setTts([]);
    setSel(null);
  };

  const saveTTs = (newTTs) => {
    localStorage.setItem('turntakers', JSON.stringify(newTTs));
  };

  const createTT = async (e) => {
    e.preventDefault();
    const t = {
      id: 'tt' + Date.now(),
      name: newTT.name,
      creator: user.id,
      admins: [user.id],
      parts: [{ id: user.id, name: user.name, email: user.email, skip: 0, extra: 0 }],
      status: 'pending',
      idx: 0,
      cycle: 0,
      notify: newTT.notify,
      freq: newTT.freq,
      reorder: newTT.reorder,
      hist: []
    };
    const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
    allTTs.push(t);
    saveTTs(allTTs);
    setTts([...tts, t]);
    setNewTT({ name: '', notify: true, freq: 'weekly', reorder: 'keep' });
    setView('dash');
  };

  const invite = async () => {
    if (!invEmail) return;
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    const inv = Object.values(users).find(x => x.email === invEmail);
    if (!inv) { alert('User not found. They need to register first!'); return; }
    if (sel.parts.some(p => p.id === inv.id)) { alert('Already added'); return; }
    const up = { ...sel, parts: [...sel.parts, { id: inv.id, name: inv.name, email: inv.email, skip: 0, extra: 0 }] };
    const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
    const newTTs = allTTs.map(t => t.id === up.id ? up : t);
    saveTTs(newTTs);
    setSel(up);
    setInvEmail('');
    setTts(tts.map(t => t.id === up.id ? up : t));
  };

  const start = async () => {
    const up = { ...sel, status: 'active', idx: 0, cycle: 1 };
    const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
    const newTTs = allTTs.map(t => t.id === up.id ? up : t);
    saveTTs(newTTs);
    setSel(up);
    setTts(tts.map(t => t.id === up.id ? up : t));
  };

  const take = async () => {
    const cur = sel.parts[sel.idx];
    const h = { id: 'h' + Date.now(), pid: cur.id, name: cur.name, type: 'done', ts: new Date().toISOString(), c: sel.cycle };
    let ni = sel.idx + 1;
    let nc = sel.cycle;
    if (ni >= sel.parts.length) {
      ni = 0;
      nc++;
      if (sel.reorder === 'randomize') {
        const sh = [...sel.parts];
        for (let i = sh.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [sh[i], sh[j]] = [sh[j], sh[i]];
        }
        sel.parts = sh;
      }
    }
    const up = { ...sel, idx: ni, cycle: nc, hist: [...sel.hist, h] };
    const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
    const newTTs = allTTs.map(t => t.id === up.id ? up : t);
    saveTTs(newTTs);
    setSel(up);
    setTts(tts.map(t => t.id === up.id ? up : t));
  };

  const skip = async () => {
    const cur = sel.parts[sel.idx];
    const h = { id: 'h' + Date.now(), pid: cur.id, name: cur.name, type: 'skip', by: user.name, ts: new Date().toISOString(), c: sel.cycle };
    const up = { ...sel, parts: sel.parts.map(p => p.id === cur.id ? { ...p, skip: p.skip + 1 } : p), idx: (sel.idx + 1) % sel.parts.length, hist: [...sel.hist, h] };
    if (sel.idx + 1 >= sel.parts.length) up.cycle++;
    const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
    const newTTs = allTTs.map(t => t.id === up.id ? up : t);
    saveTTs(newTTs);
    setSel(up);
    setTts(tts.map(t => t.id === up.id ? up : t));
  };

  const extra = async () => {
    const h = { id: 'h' + Date.now(), pid: user.id, name: user.name, type: 'extra', ts: new Date().toISOString(), c: sel.cycle };
    const up = { ...sel, parts: sel.parts.map(p => p.id === user.id ? { ...p, extra: p.extra + 1 } : p), hist: [...sel.hist, h] };
    const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
    const newTTs = allTTs.map(t => t.id === up.id ? up : t);
    saveTTs(newTTs);
    setSel(up);
    setTts(tts.map(t => t.id === up.id ? up : t));
  };

  const exportCSV = () => {
    const csv = [
      ['Date', 'Participant', 'Type', 'By', 'Cycle'],
      ...sel.hist.map(h => [new Date(h.ts).toLocaleString(), h.name, h.type, h.by || '-', h.c])
    ].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${sel.name}-history.csv`;
    a.click();
  };

  const close = async () => {
    if (!confirm('Close this TurnTaker?')) return;
    const up = { ...sel, status: 'closed' };
    const allTTs = JSON.parse(localStorage.getItem('turntakers') || '[]');
    const newTTs = allTTs.map(t => t.id === up.id ? up : t);
    saveTTs(newTTs);
    setSel(up);
    setTts(tts.map(t => t.id === up.id ? up : t));
  };

  if (load) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><div className="text-xl">Loading...</div></div>;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="text-white" size={32} />
            </div>
            <h1 className="text-3xl font-bold text-gray-800">TurnTaker</h1>
            <p className="text-gray-600 mt-2">Manage turns, fairly & simply</p>
          </div>
          <form onSubmit={auth} className="space-y-4">
            {!isLogin && <input type="text" placeholder="Full Name" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full px-4 py-3 border rounded-lg" required />}
            <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full px-4 py-3 border rounded-lg" required />
            <input type="password" placeholder="Password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} className="w-full px-4 py-3 border rounded-lg" required />
            <button type="submit" className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600">{isLogin ? 'Login' : 'Register'}</button>
          </form>
          <button onClick={() => setIsLogin(!isLogin)} className="w-full mt-4 text-teal-600 text-sm">{isLogin ? "Don't have an account? Register" : 'Already have an account? Login'}</button>
        </div>
      </div>
    );
  }

  if (view === 'dash') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center"><Users className="text-white" size={20} /></div>
              <div><h1 className="text-xl font-bold">TurnTaker</h1><p className="text-sm text-gray-600">Welcome, {user.name}</p></div>
            </div>
            <button onClick={logout} className="flex items-center gap-2 text-gray-600 hover:text-gray-800"><LogOut size={20} /><span className="hidden sm:inline">Logout</span></button>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">My TurnTakers</h2>
            <button onClick={() => setView('create')} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 flex items-center gap-2"><Plus size={20} />Create</button>
          </div>
          {tts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <Users size={48} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No TurnTakers Yet</h3>
              <button onClick={() => setView('create')} className="bg-teal-500 text-white px-6 py-3 rounded-lg hover:bg-teal-600">Create TurnTaker</button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {tts.map(t => (
                <div key={t.id} onClick={() => { setSel(t); setView('detail'); }} className="bg-white rounded-xl shadow-sm hover:shadow-md p-6 cursor-pointer">
                  <div className="flex justify-between mb-3">
                    <h3 className="text-lg font-semibold">{t.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${t.status === 'active' ? 'bg-green-100 text-green-700' : t.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>{t.status}</span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <p>{t.parts.length} participants</p>
                    <p>{t.hist.length} turns completed</p>
                    {t.status === 'active' && <p className="text-teal-600 font-medium">Current: {t.parts[t.idx]?.name}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (view === 'create') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <button onClick={() => setView('dash')} className="text-teal-600 mb-2">← Back</button>
            <h1 className="text-2xl font-bold">Create New TurnTaker</h1>
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-xl shadow-sm p-8">
            <form onSubmit={createTT} className="space-y-6">
              <div><label className="block text-sm font-medium mb-2">Name *</label><input type="text" placeholder="Coffee Fridays" value={newTT.name} onChange={e => setNewTT({...newTT, name: e.target.value})} className="w-full px-4 py-3 border rounded-lg" required /></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={newTT.notify} onChange={e => setNewTT({...newTT, notify: e.target.checked})} className="w-4 h-4" /><span className="text-sm">Send notifications</span></label>
              <div><label className="block text-sm font-medium mb-2">Summary Frequency</label><select value={newTT.freq} onChange={e => setNewTT({...newTT, freq: e.target.value})} className="w-full px-4 py-3 border rounded-lg"><option value="none">None</option><option value="weekly">Weekly</option><option value="monthly">Monthly</option><option value="yearly">Yearly</option></select></div>
              <div><label className="block text-sm font-medium mb-2">End-of-Cycle Order</label><select value={newTT.reorder} onChange={e => setNewTT({...newTT, reorder: e.target.value})} className="w-full px-4 py-3 border rounded-lg"><option value="keep">Keep order</option><option value="randomize">Randomize</option></select></div>
              <button type="submit" className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600">Create</button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'detail' && sel) {
    const isAdmin = sel.admins.includes(user.id);
    const isTurn = sel.status === 'active' && sel.parts[sel.idx]?.id === user.id;
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button onClick={() => setView('dash')} className="text-teal-600 mb-2">← Back</button>
            <div className="flex justify-between items-center">
              <div><h1 className="text-2xl font-bold">{sel.name}</h1><p className="text-sm text-gray-600">Cycle {sel.cycle}</p></div>
              <span className={`px-3 py-1 rounded-full text-sm ${sel.status === 'active' ? 'bg-green-100 text-green-700' : sel.status === 'closed' ? 'bg-gray-100 text-gray-700' : 'bg-yellow-100 text-yellow-700'}`}>{sel.status}</span>
            </div>
          </div>
        </div>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              {sel.status === 'active' && (
                <div className="bg-white rounded-xl shadow-sm p-6 border-2 border-teal-500">
                  <h3 className="text-lg font-semibold mb-4">Current Turn</h3>
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center"><span className="text-lg font-bold text-teal-700">{sel.parts[sel.idx]?.name.charAt(0)}</span></div>
                      <div><p className="font-semibold">{sel.parts[sel.idx]?.name}</p><p className="text-sm text-gray-600">It's their turn</p></div>
                    </div>
                    {isTurn && <span className="bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-sm">You're up!</span>}
                  </div>
                  <div className="flex gap-3">
                    {isTurn && <button onClick={take} className="flex-1 bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 flex items-center justify-center gap-2"><CheckCircle size={20} />Done</button>}
                    {isAdmin && <button onClick={skip} className="flex-1 bg-orange-500 text-white py-3 rounded-lg hover:bg-orange-600 flex items-center justify-center gap-2"><SkipForward size={20} />Skip</button>}
                    <button onClick={extra} className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"><Star size={20} />Extra</button>
                  </div>
                </div>
              )}
              {sel.status === 'pending' && isAdmin && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Ready to Start?</h3>
                  <button onClick={start} disabled={sel.parts.length < 2} className="w-full bg-teal-500 text-white py-3 rounded-lg hover:bg-teal-600 disabled:bg-gray-300">Start Turn Cycle</button>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold">Participants ({sel.parts.length})</h3>
                  {isAdmin && sel.status !== 'closed' && (
                    <div className="flex gap-2">
                      <input type="email" placeholder="Email" value={invEmail} onChange={e => setInvEmail(e.target.value)} className="px-3 py-2 border rounded-lg text-sm" />
                      <button onClick={invite} className="bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 text-sm">Invite</button>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {sel.parts.map((p, i) => (
                    <div key={p.id} className={`flex justify-between items-center p-3 rounded-lg ${sel.status === 'active' && i === sel.idx ? 'bg-teal-50 border border-teal-200' : 'bg-gray-50'}`}>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center"><span className="font-bold text-gray-700">{p.name.charAt(0)}</span></div>
                        <div><p className="font-medium">{p.name}</p><p className="text-xs text-gray-600">{p.email}</p></div>
                      </div>
                      <div className="flex gap-2 text-sm">
                        {p.skip > 0 && <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded">+{p.skip} skip</span>}
                        {p.extra > 0 && <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">−{p.extra} extra</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {showHist && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">History ({sel.hist.length})</h3>
                    <div className="flex gap-2">
                      <button onClick={exportCSV} className="text-teal-600 hover:text-teal-700 flex items-center gap-1"><Download size={18} />Export</button>
                      <button onClick={() => setShowHist(false)} className="text-gray-600 hover:text-gray-800"><XCircle size={18} /></button>
                    </div>
                  </div>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {[...sel.hist].reverse().map(h => (
                      <div key={h.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-sm">{h.name}</p>
                          <p className="text-xs text-gray-600">{new Date(h.ts).toLocaleString()}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {h.type === 'done' && <CheckCircle size={16} className="text-green-600" />}
                          {h.type === 'skip' && <SkipForward size={16} className="text-orange-600" />}
                          {h.type === 'extra' && <Star size={16} className="text-blue-600" />}
                          <span className="text-xs text-gray-600">{h.type}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="text-lg font-semibold mb-4">Stats</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-gray-600">Total Turns:</span><span className="font-semibold">{sel.hist.length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Completed:</span><span className="font-semibold text-green-600">{sel.hist.filter(h => h.type === 'done').length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Skipped:</span><span className="font-semibold text-orange-600">{sel.hist.filter(h => h.type === 'skip').length}</span></div>
                  <div className="flex justify-between"><span className="text-gray-600">Extra:</span><span className="font-semibold text-blue-600">{sel.hist.filter(h => h.type === 'extra').length}</span></div>
                </div>
              </div>
              <div className="space-y-2">
                <button onClick={() => setShowHist(!showHist)} className="w-full bg-gray-100 hover:bg-gray-200 py-3 rounded-lg flex items-center justify-center gap-2"><History size={18} />View History</button>
                {isAdmin && sel.status !== 'closed' && <button onClick={close} className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-lg">Close TurnTaker</button>}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}