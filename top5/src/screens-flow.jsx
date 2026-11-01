// Landing, Pick, Feel, Save, Sent, Sign in
// Live catalog: Apple's public iTunes Search API via JSONP (no key, works from any origin).
// Production should proxy the Apple Music API server-side and store AMPLIFI song IDs.
let __jp = 0;
function jsonp(url, ms = 7000) {
  return new Promise((resolve, reject) => {
    const cb = "__cvjp" + (++__jp), el = document.createElement("script");
    const done = () => { delete window[cb]; el.remove(); clearTimeout(t); };
    const t = setTimeout(() => { done(); reject(new Error("timeout")); }, ms);
    window[cb] = d => { done(); resolve(d); };
    el.onerror = () => { done(); reject(new Error("network")); };
    el.src = url + "&callback=" + cb;
    document.head.appendChild(el);
  });
}
const JUNK = /karaoke|tribute|made famous|in the style of|originally performed|lullaby|8-bit|piano version|instrumental version/i;
const remoteCache = {};
function searchCatalog(term) {
  const k = term.toLowerCase();
  if (remoteCache[k]) return Promise.resolve(remoteCache[k]);
  return jsonp("https://itunes.apple.com/search?media=music&entity=song&limit=25&country=US&term=" + encodeURIComponent(term)).then(d => {
    const seen = new Set(), out = [];
    (d.results || []).forEach(r => {
      if (!r.trackName || !r.artistName || JUNK.test(r.collectionName + " " + r.artistName + " " + r.trackName)) return;
      const key = norm(r.trackName.replace(/\s*[\(\[](remaster|.*remaster|live|mono|stereo|single|radio edit|\d{4}).*?[\)\]]/i, "")) + "|" + norm(r.artistName);
      if (seen.has(key)) return; seen.add(key);
      out.push({ id: "it-" + r.trackId, title: r.trackName, artist: r.artistName, album: r.collectionName, year: (r.releaseDate || "").slice(0, 4), art: r.artworkUrl100 && r.artworkUrl100.replace("100x100bb", "120x120bb"), key });
    });
    return (remoteCache[k] = out);
  });
}
const norm = x => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();

function Landing({ s, go, startNew, toast, poster }) {
  const home = window.CV_DATA.POSTER;
  const count = s.list.filter(Boolean).length;
  return (
    <>
      <Masthead />
      <section className="pbox cta-panel fadein" aria-labelledby="cta-h">
        <h1 id="cta-h" className="sr">Everybody's Got a Top 5. What's yours? The five songs that changed your life.</h1>
        {poster && poster.logo && <img className="venue-logo" src={poster.logo} alt={poster.place} width="138" height="95" decoding="async" />}
        <div aria-hidden="true">
          <img className="lockup" src="/top5/top5-lockup-v3.webp" alt="" width="144" height="223" decoding="async" />
        </div>
        {s.saved && s.user
          ? <button className="btn red wide-btn grain" onClick={() => go("results")}>See my Top 5 {Icon.arrow}</button>
          : <button className="btn red wide-btn grain" onClick={() => count ? go("pick") : startNew()}>{count ? "Keep going" : "Start my Top 5"} {Icon.arrow}</button>}
        <p className="small muted" style={{ margin: "12px 0 0" }}>
          {s.saved && s.user ? "Your list is saved. Edit it any time." : count ? `${count} of 5 picked. Saved on this phone.` : "About two minutes. No account needed to start."}
        </p>
      </section>
      {count > 0 && !s.saved && (
        <div className="resume fadein">
          <div><b className="semi" style={{ fontSize: 16 }}>Start over instead?</b><div className="small muted">Clears the {count} song{count > 1 ? "s" : ""} on this phone.</div></div>
          <button className="btn ghost" style={{ minHeight: 44, padding: "10px 14px", fontSize: 16 }} onClick={() => { startNew(); toast("Fresh list. Pick your #1."); }}>Start over</button>
        </div>
      )}
      {poster ? (
        <div className="tapline tapped">
          <Star size={22} />
          <div><b className="semi">You tapped on the poster at {poster.place}</b><div className="small muted">{poster.city} · Poster {poster.id}</div></div>
        </div>
      ) : (
        <div className="tapline">
          <Star size={22} />
          <div className="small"><b>Find the poster at {home.place}</b><div className="muted">Tap it with your phone, or start right here.</div></div>
        </div>
      )}
      <p className="small" style={{ marginTop: 10, textAlign: "center" }}><button className="linkbtn" onClick={() => go("everyone")}>See everybody’s results</button></p>
      {!s.user && <p className="small muted" style={{ marginTop: 14, textAlign: "center" }}>Already saved a list? <button className="linkbtn" onClick={() => go("signin")}>Sign in</button></p>}
    </>
  );
}

function Pick({ s, set, go, toast, initialQuery }) {
  const { CATALOG, slug } = window.CV_DATA;
  const [q, setQ] = useState(initialQuery || "");
  const [manual, setManual] = useState(null);
  const [mErr, setMErr] = useState("");
  const [drag, setDrag] = useState(null);
  const list = s.list;
  const filled = list.filter(Boolean).length;
  const full = filled === 5;
  const ROW = 80;

  const [remote, setRemote] = useState({ q: "", items: [], loading: false, error: false });
  useEffect(() => {
    const term = q.trim();
    if (norm(term).length < 2) { setRemote({ q: "", items: [], loading: false, error: false }); return; }
    setRemote(r => ({ ...r, loading: true, error: false }));
    let live = true;
    const t = setTimeout(() => {
      searchCatalog(term).then(items => live && setRemote({ q: term, items, loading: false, error: false }))
        .catch(() => live && setRemote({ q: term, items: [], loading: false, error: true }));
    }, 260);
    return () => { live = false; clearTimeout(t); };
  }, [q]);
  const local = useMemo(() => {
    const n = norm(q);
    if (n.length < 2) return [];
    const words = n.split(" ");
    return CATALOG.map(song => {
      const t = norm(song.title), a = norm(song.artist), hay = t + " " + a;
      if (!words.every(w => hay.includes(w))) return null;
      const score = (t === n ? 0 : t.startsWith(n) ? 1 : a.startsWith(n) ? 2 : 3) - song.pop / 1000;
      return { song, score };
    }).filter(Boolean).sort((x, y) => x.score - y.score).slice(0, 6).map(x => x.song);
  }, [q]);
  // Merge: live results in Apple's relevance order; swap in our own record when we already know the song
  const results = useMemo(() => {
    const byKey = {}; CATALOG.forEach(c => { byKey[norm(c.title) + "|" + norm(c.artist)] = c; });
    const out = [], seen = new Set();
    remote.items.forEach(r => { const c = byKey[r.key]; const song = c ? { ...c, art: r.art } : r; if (!seen.has(song.id)) { seen.add(song.id); out.push(song); } });
    local.forEach(c => { if (!seen.has(c.id)) { seen.add(c.id); out.push(c); } });
    return out.slice(0, 12);
  }, [remote, local]);
  const searching = remote.loading && !results.length;
  const titleCounts = {};
  results.forEach(r => { titleCounts[norm(r.title)] = (titleCounts[norm(r.title)] || 0) + 1; });
  const versions = Object.values(titleCounts).some(c => c > 1);
  const where = id => list.findIndex(x => x && x.id === id);

  const add = song => {
    if (where(song.id) > -1) { toast(`Already on your list at #${where(song.id) + 1}`); return false; }
    const i = list.findIndex(x => !x);
    if (i < 0) { toast("Your five are full. Remove one to swap."); return false; }
    const next = list.slice(); next[i] = song;
    set({ list: next }); setQ(""); setManual(null);
    toast(`Added at #${i + 1}`);
    return true;
  };
  const addManual = e => {
    e.preventDefault();
    const t = manual.title.trim(), a = manual.artist.trim();
    if (!t || !a) { setMErr("Add both the song and the artist."); return; }
    const id = "m-" + slug(t + "-" + a);
    const dupe = list.find(x => x && (x.id === id || (norm(x.title) === norm(t) && norm(x.artist) === norm(a))));
    if (dupe) { setMErr("That one’s already on your list."); return; }
    if (add({ id, title: t, artist: a, manual: true })) setMErr("");
  };
  const remove = i => { const next = list.slice(); const gone = next[i]; next.splice(i, 1); next.push(null); set({ list: next }); toast(`Removed “${gone.title}”`); };
  const move = (i, to) => { if (to < 0 || to > 4) return; const next = list.slice(); const [x] = next.splice(i, 1); next.splice(to, 0, x); set({ list: next }); };

  const target = drag ? Math.max(0, Math.min(4, drag.i + Math.round(drag.dy / ROW))) : null;
  const shift = k => {
    if (!drag || k === drag.i) return 0;
    if (drag.i < target && k > drag.i && k <= target) return -ROW;
    if (drag.i > target && k >= target && k < drag.i) return ROW;
    return 0;
  };
  const hDown = (i, e) => { if (!list[i]) return; e.preventDefault(); e.currentTarget.setPointerCapture(e.pointerId); setDrag({ i, dy: 0, y0: e.clientY }); };
  const hMove = e => { if (drag) setDrag(d => ({ ...d, dy: e.clientY - d.y0 })); };
  const hUp = () => { if (!drag) return; if (target !== drag.i) move(drag.i, target); setDrag(null); };

  return (
    <>
      <Steps step={1} />
      <h1 className="cond h1 inked">Pick your five</h1>
      <p className="muted" style={{ marginTop: 8 }}>Search for each song, then put them in order. #1 is the one that changed everything.</p>

      <div className="search">
        <label htmlFor="q">Find a song</label>
        <span className="glass">{Icon.search}</span>
        <input id="q" className="field" type="search" autoComplete="off" placeholder="Song title or artist" value={q}
          onChange={e => { setQ(e.target.value); setManual(null); }} aria-controls="res" aria-describedby="q-note" />
        <p id="q-note" className="note">{full ? "All five picked. Remove one to swap a song in." : `${5 - filled} to go. Your list saves on this phone as you go.`}</p>
        {norm(q).length >= 2 && (
          <ul id="res" className="results" aria-label="Search results">
            {versions && <li className="versions">More than one recording. Pick the one you mean.</li>}
            {results.map(song => {
              const w = where(song.id);
              return (
                <li key={song.id}>
                  <button className="res" disabled={w > -1 || full} onClick={() => add(song)}>
                    <Sleeve song={song} />
                    <span style={{ minWidth: 0 }}>
                      <span className="t" style={{ display: "block" }}>{song.title}</span>
                      <span className="a" style={{ display: "block" }}>{song.artist}</span>
                      <span className="al" style={{ display: "block" }}>{song.album} · {song.year}</span>
                    </span>
                    {w > -1 ? <span className="tag">#{w + 1} on your list</span> : !full && <span className="plus" aria-hidden="true">{Icon.plus}</span>}
                  </button>
                </li>
              );
            })}
            {searching && <li className="manual" aria-live="polite"><span className="small muted">Searching the catalog…</span></li>}
            {remote.error && <li className="versions" role="status">Couldn’t reach the full catalog. Check your connection, or add it by hand.</li>}
            {!results.length && !remote.loading && <li className="manual"><b>No match for “{q.trim()}”.</b><span className="small muted">Obscure B-side? Live take? Add it by hand.</span></li>}
            {!manual ? (
              <li><button className="res" onClick={() => setManual({ title: results.length ? "" : q.trim(), artist: "" })} disabled={full}>
                <span className="t" style={{ color: "var(--red-ink)" }}>Can’t find it? Add it by hand</span>
              </button></li>
            ) : (
              <li><form className="manual" onSubmit={addManual}>
                <label className="flabel" htmlFor="mt">Song</label>
                <input id="mt" className="field plain" value={manual.title} onChange={e => setManual({ ...manual, title: e.target.value })} autoFocus />
                <label className="flabel" htmlFor="ma">Artist</label>
                <input id="ma" className="field plain" value={manual.artist} onChange={e => setManual({ ...manual, artist: e.target.value })} />
                {mErr && <span className="err" role="alert">{mErr}</span>}
                <button className="btn" type="submit">Add to my list</button>
              </form></li>
            )}
          </ul>
        )}
      </div>

      <div className="sechead" style={{ marginBottom: 10 }}><h2 className="cond" style={{ fontSize: 28 }}>Your Top 5</h2><span>Drag ⠿ or use the arrows to reorder</span></div>
      <ol className="slots" style={{ listStyle: "none", padding: 0, margin: 0 }} aria-label="Your ranked Top 5">
        {list.map((song, i) => (
          <li key={song ? song.id : "e" + i} className={"slot" + (song ? "" : " empty") + (drag && drag.i === i ? " dragging" : "")}
            style={{ transform: drag ? `translateY(${drag.i === i ? drag.dy : shift(i)}px)` : undefined }}>
            <button className="handle" aria-hidden="true" tabIndex={-1} onPointerDown={e => hDown(i, e)} onPointerMove={hMove} onPointerUp={hUp} onPointerCancel={hUp}>{Icon.grip}</button>
            <span className="num slab">#{i + 1}</span>
            {song ? (
              <>
                <span className="meta"><span className="t" style={{ display: "block" }}>{song.title}</span><span className="a" style={{ display: "block" }}>{song.artist}{song.manual ? " · added by hand" : ""}</span></span>
                <button className="iconbtn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label={`Move ${song.title} up to #${i}`}>{Icon.up}</button>
                <button className="iconbtn" onClick={() => move(i, i + 1)} disabled={i === 4 || !list[i + 1]} aria-label={`Move ${song.title} down to #${i + 2}`}>{Icon.down}</button>
                <button className="iconbtn" onClick={() => remove(i)} aria-label={`Remove ${song.title}`}>{Icon.x}</button>
              </>
            ) : <span className="meta hint">{i === list.findIndex(x => !x) ? "Next pick lands here" : "Empty"}</span>}
          </li>
        ))}
      </ol>

      <div className="actionbar">
        <span className="count" aria-live="polite"><b>{filled}</b>of 5 picked</span>
        <button className="btn red grain" disabled={!full} onClick={() => go("feel")}>How they feel {Icon.arrow}</button>
      </div>
    </>
  );
}

function Feel({ s, set, go, t, finish, toast }) {
  const i = s.feelIdx || 0;
  const song = s.list[i];
  if (!song) return null;
  const val = s.feel[song.id];
  const setVal = p => set({ feel: { ...s.feel, [song.id]: p } });
  const ghosts = t.ghosts ? s.list.map((x, k) => (k !== i && x && s.feel[x.id] ? { ...s.feel[x.id], label: k + 1, kind: "ghost" } : null)).filter(Boolean) : [];
  const a = AXES[t.axes] || AXES.everyday;
  const last = i === 4;
  const next = () => {
    if (!last) { set({ feelIdx: i + 1 }); window.scrollTo(0, 0); return; }
    const missing = s.list.findIndex(x => !s.feel[x.id]);
    if (missing > -1 && !t.allowSkip) { set({ feelIdx: missing }); toast(`#${missing + 1} still needs a dot`); return; }
    finish();
  };
  const v = val || { x: .5, y: .5 };
  return (
    <>
      <Steps step={2} />
      <div className="pips" role="tablist" aria-label="Songs">
        {s.list.map((x, k) => (
          <button key={x.id} role="tab" aria-selected={k === i} aria-label={`#${k + 1} ${x.title}${s.feel[x.id] ? ", placed" : ""}`}
            className={"pip" + (s.feel[x.id] ? " set" : "") + (k === i ? " cur" : "")} onClick={() => set({ feelIdx: k })}>{k + 1}</button>
        ))}
      </div>
      <div className="songhead fadein" key={song.id}>
        <span className="slab rk inked">#{i + 1}</span>
        <div style={{ minWidth: 0 }}><div className="cond t">{song.title}</div><div className="a">{song.artist}</div></div>
      </div>
      <h1 className="q">How does this song make you feel?</h1>
      <p className="small muted" style={{ marginBottom: 14 }}>Tap anywhere on the square. There’s no wrong spot.</p>
      <EmotionMap axes={t.axes} value={val} onChange={setVal} points={ghosts} activeLabel={i + 1}
        emptyHint="Tap where it lands" label={`How ${song.title} makes you feel. ${a.left} to ${a.right}, ${a.bottom} to ${a.top}.`} />
      <div className="readout" aria-live="polite">
        {val ? <span className="script desc">{describe(val, t.axes)}</span> : <span className="small muted">No dot yet</span>}
      </div>
      <details className="sliders">
        <summary>Use sliders instead</summary>
        <div className="rng">
          <label className="flabel" htmlFor="sx">{a.left} to {a.right}</label>
          <input id="sx" type="range" min="0" max="100" value={Math.round(v.x * 100)} onChange={e => setVal({ ...v, x: +e.target.value / 100 })} />
          <div className="ends"><span>{a.left}</span><span>{a.right}</span></div>
        </div>
        <div className="rng">
          <label className="flabel" htmlFor="sy">{a.bottom} to {a.top}</label>
          <input id="sy" type="range" min="0" max="100" value={Math.round(v.y * 100)} onChange={e => setVal({ ...v, y: +e.target.value / 100 })} />
          <div className="ends"><span>{a.bottom}</span><span>{a.top}</span></div>
        </div>
      </details>
      <div className="actionbar">
        <button className="btn ghost" onClick={() => i ? set({ feelIdx: i - 1 }) : go("pick")} aria-label={i ? "Previous song" : "Back to your list"}>{Icon.back}</button>
        <span className="count" style={{ textAlign: "center" }}><b>{s.list.filter(x => s.feel[x.id]).length}</b>of 5</span>
        <button className="btn red grain" disabled={!val && !t.allowSkip} onClick={next}>
          {!val && t.allowSkip ? "Skip" : last ? (s.user ? "Save" : "Keep it") : "Next"} {Icon.arrow}
        </button>
      </div>
    </>
  );
}

function AuthBlock({ s, set, onProvider, onEmail, cta = "Email me a sign-in link" }) {
  const [email, setEmail] = useState(s.email || "");
  const [err, setErr] = useState("");
  const submit = e => {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) { setErr("That email doesn’t look right."); return; }
    setErr(""); onEmail(email.trim());
  };
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <button className="btn wide-btn grain" onClick={() => onProvider("apple")}>Continue with Apple</button>
      <button className="btn ghost wide-btn" onClick={() => onProvider("google")}>Continue with Google</button>
      <div className="or">or</div>
      <form onSubmit={submit} style={{ display: "grid", gap: 10 }} noValidate>
        <label className="flabel" htmlFor="em" style={{ margin: 0 }}>Email</label>
        <input id="em" className="field plain" type="email" inputMode="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} aria-invalid={!!err} aria-describedby={err ? "em-err" : undefined} />
        {err && <span id="em-err" className="err" role="alert">{err}</span>}
        <button className="btn ghost wide-btn" type="submit">{Icon.mail} {cta}</button>
      </form>
    </div>
  );
}

function Save({ s, set, go, auth }) {
  return (
    <>
      <Steps step={3} />
      <h1 className="cond h1 inked">Keep your Top 5</h1>
      <p className="muted" style={{ marginTop: 8 }}>It’s saved on this phone for now. Sign in to keep it, edit it later and see how it stacks up against everyone else’s.</p>
      <ol className="minilist" aria-label="Your Top 5">
        {s.list.map((x, k) => <li key={x.id}><span className="n">{k + 1}</span><span><span className="t">{x.title}</span> <span className="a">{x.artist}</span></span></li>)}
      </ol>
      <div style={{ marginTop: 22 }}>
        <AuthBlock s={s} set={set} onProvider={p => auth({ email: p === "apple" ? "rob.g@icloud.com" : "rob.gordon@gmail.com" })} onEmail={email => { set({ email }); go("sent"); }} />
      </div>
      <label className="check" style={{ marginTop: 18 }}>
        <input type="checkbox" checked={s.isPublic} onChange={e => set({ isPublic: e.target.checked })} />
        <span><b>Let people see my list</b><span>Off by default. Your list is private unless you turn this on. Totals from 25 or more people never show who picked what.</span></span>
      </label>
      <p className="small" style={{ textAlign: "center", marginTop: 18 }}><button className="linkbtn" onClick={() => { set({ saved: false }); go("results"); }}>Not now, just show me the results</button></p>
    </>
  );
}

function Sent({ s, go, auth }) {
  return (
    <>
      <div style={{ height: 22 }}></div>
      <span className="kicker">Almost on the record</span>
      <h1 className="cond h1 inked" style={{ marginTop: 6 }}>Check your email</h1>
      <p style={{ marginTop: 12 }}>We sent a sign-in link to <b>{s.email}</b>. Open it on this phone and your Top 5 comes with you. The link works for 15 minutes.</p>
      <p className="small muted">Nothing there? Check spam, or <button className="linkbtn" onClick={() => go("save")}>use a different email</button>.</p>
      <div className="proto">
        <span className="kicker">Prototype only</span>
        <button className="btn wide-btn" onClick={() => auth({ email: s.email })}>Simulate opening the link</button>
      </div>
    </>
  );
}

function SignIn({ s, set, go, auth }) {
  const count = s.list.filter(Boolean).length;
  const [sent, setSent] = useState(null);
  const returning = { email: "rob.gordon@gmail.com", returning: true };
  return (
    <>
      <div style={{ height: 22 }}></div>
      <h1 className="cond h1 inked">Welcome back</h1>
      <p className="muted" style={{ marginTop: 8 }}>Sign in to see or edit your Top 5.{count ? ` The ${count} song${count > 1 ? "s" : ""} on this phone will come with you.` : ""}</p>
      {!sent ? (
        <div style={{ marginTop: 18 }}><AuthBlock s={s} set={set} onProvider={() => auth(returning)} onEmail={email => setSent(email)} /></div>
      ) : (
        <>
          <p style={{ marginTop: 18 }}>Sign-in link sent to <b>{sent}</b>. Open it on this phone.</p>
          <div className="proto"><span className="kicker">Prototype only</span><button className="btn wide-btn" onClick={() => auth({ ...returning, email: sent })}>Simulate opening the link</button></div>
        </>
      )}
      <p className="small" style={{ textAlign: "center", marginTop: 18 }}><button className="linkbtn" onClick={() => go("landing")}>Back</button></p>
    </>
  );
}

Object.assign(window, { Landing, Pick, Feel, Save, Sent, SignIn });
