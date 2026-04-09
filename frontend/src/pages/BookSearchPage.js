import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';

export default function BookSearchPage() {
  const [query, setQuery]   = useState('');
  const [books, setBooks]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const navigate = useNavigate();

  useEffect(() => { API.get('/books').then(r => setBooks(r.data)); }, []);

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setLoading(true); setSearched(true);
    try { const { data } = await API.get(`/books?search=${encodeURIComponent(query)}`); setBooks(data); }
    catch { setBooks([]); }
    finally { setLoading(false); }
  };

  const grouped = books.reduce((acc, book) => {
    const id = book.libraryId?._id;
    if (!id) return acc;
    if (!acc[id]) acc[id] = { library: book.libraryId, books: [] };
    acc[id].books.push(book);
    return acc;
  }, {});

  const isClosed = lib => lib?.status === 'Closed' || lib?.status === 'Maintenance';

  const chipStyle = { padding:'6px 14px', borderRadius:999, fontSize:12, fontWeight:600, cursor:'pointer', border:'1.5px solid var(--border-lt)', background:'transparent', color:'var(--text-muted)', fontFamily:'inherit', transition:'all 0.22s' };

  return (
    <div className="page-wrapper">
      <div className="container">
        <div className="animate-fadeIn" style={{marginBottom:32}}>
          <h1 className="display" style={{fontSize:30,marginBottom:6}}>🔍 Book Search</h1>
          <p style={{color:'var(--text-muted)'}}>Find a book and discover which libraries have it available</p>
        </div>

        {/* Search form */}
        <form onSubmit={handleSearch} className="animate-fadeIn" style={{display:'flex',gap:12,marginBottom:16,flexWrap:'wrap'}}>
          <div style={{position:'relative',flex:1,minWidth:280}}>
            <span style={{position:'absolute',left:16,top:'50%',transform:'translateY(-50%)',fontSize:20,pointerEvents:'none'}}>📖</span>
            <input className="form-control" style={{paddingLeft:52,fontSize:16,height:54}} placeholder="Search for a book title or author…" value={query} onChange={e=>setQuery(e.target.value)}/>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={loading||!query.trim()}>
            {loading?<><span className="spinner" style={{width:18,height:18,borderTopColor:'#080F20'}}/>Searching…</>:'✦ Search'}
          </button>
        </form>

        {/* Popular searches */}
        <div className="animate-fadeIn" style={{display:'flex',alignItems:'center',gap:8,flexWrap:'wrap',marginBottom:28}}>
          <span style={{fontSize:12,color:'var(--text-muted)',fontWeight:600}}>Popular:</span>
          {['Harry Potter','Atomic Habits','Sapiens','1984','The Alchemist'].map(s=>(
            <button key={s} style={chipStyle} onClick={()=>{setQuery(s);}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor='var(--gold)';e.currentTarget.style.color='var(--gold)';}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor='var(--border-lt)';e.currentTarget.style.color='var(--text-muted)';}}>
              {s}
            </button>
          ))}
        </div>

        {loading && <div className="loading-screen mt-32"><div className="spinner"/></div>}

        {!loading && books.length===0 && searched && (
          <div className="empty-state mt-32"><div className="empty-icon">🔎</div><h3>No books found</h3><p>Try a different title or author name.</p></div>
        )}

        {!loading && Object.values(grouped).length > 0 && (
          <div className="mt-24 animate-fadeIn">
            {searched && <p style={{fontSize:13,color:'var(--text-muted)',marginBottom:16}}>Found <strong style={{color:'var(--text)'}}>{books.length}</strong> result{books.length!==1?'s':''} across <strong style={{color:'var(--text)'}}>{Object.keys(grouped).length}</strong> librar{Object.keys(grouped).length!==1?'ies':'y'}</p>}

            {Object.values(grouped).map(({library, books: libBooks}) => (
              <div key={library._id} style={{
                background:'var(--surface)', borderRadius:'var(--r)', border:'1px solid var(--border)',
                marginBottom:20, overflow:'hidden', transition:'all 0.22s',
                opacity:isClosed(library)?0.65:1, filter:isClosed(library)?'grayscale(0.45)':'none',
                boxShadow:'var(--shadow-sm)'
              }}
              onMouseEnter={e=>e.currentTarget.style.boxShadow='var(--shadow-lg)'}
              onMouseLeave={e=>e.currentTarget.style.boxShadow='var(--shadow-sm)'}>

                {/* Library header */}
                <div style={{padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',gap:16,background:'var(--surface2)',borderBottom:'1px solid var(--border)',flexWrap:'wrap'}}>
                  <div>
                    <div style={{display:'flex',gap:8,marginBottom:6,flexWrap:'wrap'}}>
                      <span className={`badge ${library.status==='Open'?'badge-open':'badge-maintenance'}`}>{library.status}</span>
                      <span className="badge" style={{background:'rgba(122,139,173,0.1)',color:'var(--text-muted)',border:'1px solid var(--border-lt)'}}>💺 {library.totalSeats} seats</span>
                    </div>
                    <h3 style={{fontSize:17,fontFamily:'Playfair Display,serif',marginBottom:2}}>{library.libraryName}</h3>
                    <p style={{fontSize:12,color:'var(--text-muted)'}}>📍 {library.city}</p>
                  </div>
                  {!isClosed(library) && (
                    <button className="btn btn-primary" onClick={()=>navigate(`/libraries/${library._id}`)}>Reserve Seat →</button>
                  )}
                </div>

                {/* Books */}
                <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))'}}>
                  {libBooks.map(book=>(
                    <div key={book._id} style={{display:'flex',gap:12,padding:'16px 20px',borderBottom:'1px solid var(--border)',transition:'all 0.22s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(255,255,255,0.02)'}
                      onMouseLeave={e=>e.currentTarget.style.background=''}>
                      <span style={{fontSize:32,flexShrink:0,lineHeight:1}}>📖</span>
                      <div>
                        <h4 style={{fontSize:13,fontWeight:700,lineHeight:1.4,marginBottom:2,fontFamily:'Playfair Display,serif'}}>{book.title}</h4>
                        <p style={{fontSize:11,color:'var(--text-muted)',marginBottom:6}}>{book.author}</p>
                        <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                          <span className="badge" style={{background:'rgba(122,139,173,0.1)',color:'var(--text-muted)',border:'1px solid var(--border-lt)',fontSize:10}}>{book.genre}</span>
                          <span className={`badge ${book.quantity>0?'badge-approved':'badge-rejected'}`} style={{fontSize:10}}>{book.quantity>0?`${book.quantity} available`:'Out of stock'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
