import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, Users, BookOpen, Settings, 
  DollarSign, Terminal, LogOut, ShieldAlert 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ revenue: 0, users: 0, stories: 0 });
  const [transactions, setTransactions] = useState([]);
  const [settings, setSettings] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };
    try {
      const [s, t, set] = await Promise.all([
        axios.get('/api/admin/stats', { headers }),
        axios.get('/api/admin/transactions', { headers }),
        axios.get('/api/admin/settings', { headers })
      ]);
      setStats(s.data);
      setTransactions(t.data);
      setSettings(set.data);
    } catch (err) { console.error(err); }
  };

  const logout = () => {
    localStorage.clear();
    navigate('/user');
  };

  return (
    <div className="admin-root">
      <aside className="admin-sidebar glass-morphism">
        <div className="sidebar-brand">
           <ShieldAlert size={24} />
           <span>TV Control</span>
        </div>
        <nav>
          <button className="active"><BarChart3 size={20} /> Analytics</button>
          <button><Users size={20} /> Moderation</button>
          <button><Settings size={20} /> Settings</button>
        </nav>
        <button onClick={logout} className="logout-btn"><LogOut size={20} /> Exit</button>
      </aside>

      <main className="admin-content">
        <header className="admin-header">
           <h2>Command Center</h2>
           <div className="admin-badge">Admin System Online</div>
        </header>

        <section className="stats-strip">
          <div className="stat-card glass-morphism">
             <DollarSign size={24} color="#ffd700" />
             <div className="data">
                <span className="val">${stats.revenue || 0}</span>
                <span className="lbl">Gross Revenue</span>
             </div>
          </div>
          <div className="stat-card glass-morphism">
             <Users size={24} color="#a58dff" />
             <div className="data">
                <span className="val">{stats.users}</span>
                <span className="lbl">Total Citizens</span>
             </div>
          </div>
          <div className="stat-card glass-morphism">
             <BookOpen size={24} color="#ff8da1" />
             <div className="data">
                <span className="val">{stats.stories}</span>
                <span className="lbl">Active Chronicles</span>
             </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="log-panel glass-morphism">
             <h3><Terminal size={18} /> Financial Ledger</h3>
             <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Payer</th>
                      <th>Amount</th>
                      <th>Status</th>
                      <th>Order ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map(t => (
                      <tr key={t.id}>
                        <td>{t.username}</td>
                        <td className="coins">+{t.amount}</td>
                        <td><span className="status-pill success">Captured</span></td>
                        <td className="id">{t.paypal_order_id}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
             </div>
          </div>

          <div className="settings-panel glass-morphism">
             <h3>Global Settings</h3>
             <div className="settings-list">
                {settings.map(s => (
                  <div key={s.key} className="setting-item">
                     <span className="key">{s.key}</span>
                     <span className="val">{s.value}</span>
                  </div>
                ))}
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default AdminDashboard;
