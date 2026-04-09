import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import LibraryCard from '../components/LibraryCard';

export default function LibraryListPage() {
  const [libraries, setLibraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    API.get('/libraries').then(r => setLibraries(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = libraries.filter(lib => {
    const ms = !search || lib.libraryName.toLowerCase().includes(search.toLowerCase())
      || lib.city.toLowerCase().includes(search.toLowerCase())
      || lib.address.toLowerCase().includes(search.toLowerCase());
    const mf = filter === 'All' || lib.status === filter;
    return ms && mf;
  });

  const cities = [...new Set(libraries.map(l => l.city))];

  const chipStyle = (active) => ({
    padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
    cursor: 'pointer', border: '1.5px solid', fontFamily: 'inherit', transition: 'all 0.22s',
    background: active ? 'var(--gold)' : 'transparent',
    color: active ? 'var(--navy)' : 'var(--text-muted)',
    borderColor: active ? 'var(--gold)' : 'var(--border-lt)',
  });

  const cityStyle = (active) => ({
    padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: '1.5px solid', fontFamily: 'inherit', transition: 'all 0.22s',
    background: active ? 'rgba(78,205,196,0.12)' : 'transparent',
    color: active ? 'var(--teal)' : 'var(--text-muted)',
    borderColor: active ? 'var(--teal)' : 'var(--border-lt)',
  });

  return (
    <div className="page-wrapper">
      <div className="container">

        {/* Header */}
        <div className="animate-fadeIn" style={{ marginBottom: 32 }}>
          <h1 className="display" style={{ fontSize: 30, marginBottom: 6 }}>📚 Libraries</h1>
          <p style={{ color: 'var(--text-muted)' }}>Discover libraries near you and reserve your perfect reading spot</p>
        </div>

        {/* Search bar */}
        <div className="animate-fadeIn" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 16, alignItems: 'center' }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 260 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, pointerEvents: 'none' }}>🔍</span>
            <input
              className="form-control"
              style={{ paddingLeft: 44, paddingRight: search ? 40 : 16 }}
              placeholder="Search by name, city or address…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 16 }}>✕</button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['All', 'Open', 'Closed', 'Maintenance'].map(f => (
              <button key={f} style={chipStyle(filter === f)} onClick={() => setFilter(f)}>
                {f === 'All' ? '🌐 All' : f === 'Open' ? '✅ Open' : f === 'Closed' ? '🔒 Closed' : '🔧 Maintenance'}
              </button>
            ))}
          </div>
        </div>

        {/* City pills */}
        {cities.length > 0 && (
          <div className="animate-fadeIn" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
            <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0, fontWeight: 600 }}>📍 City:</span>
            {cities.map(city => (
              <button key={city} style={cityStyle(search === city)} onClick={() => setSearch(search === city ? '' : city)}>
                {city}
              </button>
            ))}
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="loading-screen mt-32">
            <div className="spinner" />
            <p>Loading libraries…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state mt-32">
            <div className="empty-icon">🏛</div>
            <h3>No libraries found</h3>
            <p>Try a different search or filter.</p>
          </div>
        ) : (
          <>
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
              {filtered.length} librar{filtered.length === 1 ? 'y' : 'ies'} found
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 24 }}>
              {filtered.map((lib, i) => (
                <div key={lib._id} className="animate-fadeIn" style={{ animationDelay: `${i * 0.07}s` }}>
                  <LibraryCard library={lib} />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
