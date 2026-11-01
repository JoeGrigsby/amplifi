// Results: Yours / Everybody's
const fmt = n => n.toLocaleString("en-US");
const COMPARE = {
  everyday: { x: ["heavier", "lighter"], y: ["calmer", "with more energy"] },
  research: { x: ["less pleasant", "more pleasant"], y: ["calmer", "more charged"] },
};
function compareLine(mine, avg, axes) {
  const c = COMPARE[axes] || COMPARE.everyday;
  const dx = mine.x - avg.x, dy = mine.y - avg.y, parts = [];
  if (Math.abs(dx) > .1) parts.push(c.x[dx > 0 ? 1 : 0]);
  if (Math.abs(dy) > .1) parts.push(c.y[dy > 0 ? 1 : 0]);
  return parts.length ? `You hear it ${parts.join(" and ")} than most.` : "You hear it the way most people do.";
}

function Bars({ rows, max }) {
  return (
    <ol className="bars">
      {rows.map((r, k) => (
        <li key={r.key} className={r.yours ? "yours" : ""}>
          <span className="n">{k + 1}</span>
          <span className="lbl">{r.label}{r.sub && <small> · {r.sub}</small>}{r.yours && <span className="yourstag">Yours</span>}</span>
          <span className="v">{fmt(r.v)}</span>
          <span className="track" aria-hidden="true"><span className="fill" style={{ display: "block", width: (r.v / max) * 100 + "%" }}></span></span>
        </li>
      ))}
    </ol>
  );
}

function Yours({ s, set, go, t, toast }) {
  const pts = s.list.map((x, k) => s.feel[x.id] ? { ...s.feel[x.id], label: k + 1, kind: "mine" } : null).filter(Boolean);
  const avg = pts.length ? { x: pts.reduce((a, p) => a + p.x, 0) / pts.length, y: pts.reduce((a, p) => a + p.y, 0) / pts.length } : null;
  const spread = pts.length ? Math.max(...pts.map(p => Math.hypot(p.x - avg.x, p.y - avg.y))) : 0;
  return (
    <>
      <h1 className="cond h1 inked">Your Top 5</h1>
      <ol className="chart" style={{ marginTop: 14 }}>
        {s.list.map((x, k) => (
          <li key={x.id}>
            <span className="slab n inked">{k + 1}</span>
            <Sleeve song={x} size={52} />
            <div style={{ minWidth: 0 }}>
              <div className="cond t">{x.title}</div>
              <div className="a">{x.artist}</div>
              {s.feel[x.id] && <div className="f"><i></i>{describe(s.feel[x.id], t.axes)}</div>}
            </div>
          </li>
        ))}
      </ol>

      <section className="section">
        <div className="sechead"><h2 className="cond">How they feel</h2><span>One dot per song</span></div>
        <EmotionMap axes={t.axes} points={pts} label="Your five songs on the feeling map" />
        {avg && <p style={{ marginTop: 14, textAlign: "center" }}>Your five lean <b>{describe(avg, t.axes).toLowerCase()}</b>{spread > .35 ? ", and they cover a lot of ground." : "."}</p>}
      </section>

      <section className="section">
        <div className="sechead"><h2 className="cond">Your list</h2><span>{s.isPublic ? "Public" : "Private"}</span></div>
        <label className="check">
          <input type="checkbox" checked={s.isPublic} onChange={e => { set({ isPublic: e.target.checked }); toast(e.target.checked ? "Your list is public" : "Your list is private"); }} />
          <span><b>Let people see my list</b><span>Needed to share a link. You can turn it off any time.</span></span>
        </label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 14 }}>
          <button className="btn ghost" onClick={() => go("pick")}>Edit list</button>
          <button className="btn red grain" disabled={!s.isPublic || !s.saved} onClick={() => toast("Link copied")}>Share</button>
        </div>
        {!s.isPublic && <p className="note">Make your list public to share it.</p>}
      </section>
    </>
  );
}

function Everyone({ s, t }) {
  const { CATALOG, community, artistCounts, TOTAL_LISTS, MIN_GROUP, POSTER } = window.CV_DATA;
  const picks = s.list.filter(Boolean);
  const complete = picks.length === 5;
  const mineIds = new Set(picks.map(x => x.id));
  const mineArtists = new Set(picks.map(x => x.artist));
  const [focus, setFocus] = useState(picks[0] ? picks[0].id : null);

  const top = useMemo(() => CATALOG.slice().sort((a, b) => community[b.id].picks - community[a.id].picks).slice(0, 8), []);
  const ones = useMemo(() => CATALOG.slice().sort((a, b) => community[b.id].ranks[0] - community[a.id].ranks[0]).slice(0, 5), []);
  const artists = useMemo(() => Object.entries(artistCounts).sort((a, b) => b[1] - a[1]).slice(0, 5), []);
  const allCells = useMemo(() => densityCells(CATALOG.flatMap(x => community[x.id].pts), 20), []);
  const mine = s.list.map((x, k) => x && s.feel[x.id] ? { ...s.feel[x.id], label: k + 1, kind: "mine" } : null).filter(Boolean);

  const fSong = picks.find(x => x.id === focus) || picks[0] || { id: "", title: "" };
  const fRank = s.list.indexOf(fSong) + 1;
  const fc = community[fSong.id];
  const enough = fc && fc.picks >= MIN_GROUP;
  const fAvg = enough ? { x: fc.pts.reduce((a, p) => a + p.x, 0) / fc.pts.length, y: fc.pts.reduce((a, p) => a + p.y, 0) / fc.pts.length } : null;
  const fMine = s.feel[fSong.id];
  const fPts = [];
  if (fAvg) fPts.push({ ...fAvg, kind: "avg" });
  if (fMine) fPts.push({ ...fMine, label: fRank, kind: "mine" });
  const rmax = enough ? Math.max(...fc.ranks) : 1;

  return (
    <>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexWrap: "wrap" }}>
        <h1 className="cond h1 inked">Everybody’s <span className="slab inked" style={{ color: "var(--red)", fontSize: 50 }}>Top 5</span></h1>
        <span className="script" style={{ fontSize: 34, transform: "rotate(-4deg)", marginBottom: -2 }}>so far</span>
      </div>
      <div className="statline">
        <div><b className="inked">{fmt(TOTAL_LISTS)}</b><span>Lists so far</span></div>
        <div><b className="inked">{fmt(TOTAL_LISTS * 5)}</b><span>Songs ranked</span></div>
        <div><b className="inked">{POSTER.since.replace(", 2026", "")}</b><span>Since</span></div>
      </div>

      <section className="section">
        <div className="sechead"><h2 className="cond">Most picked</h2><span>Lists it’s on</span></div>
        <Bars max={community[top[0].id].picks} rows={top.map(x => ({ key: x.id, label: x.title, sub: x.artist, v: community[x.id].picks, yours: mineIds.has(x.id) }))} />
      </section>

      <section className="section">
        <div className="sechead"><h2 className="cond">Most common #1</h2><span>Times ranked first</span></div>
        <Bars max={community[ones[0].id].ranks[0]} rows={ones.map(x => ({ key: x.id, label: x.title, sub: x.artist, v: community[x.id].ranks[0], yours: !!s.list[0] && s.list[0].id === x.id }))} />
      </section>

      <section className="section">
        <div className="sechead"><h2 className="cond">Top artists</h2><span>Songs picked</span></div>
        <Bars max={artists[0][1]} rows={artists.map(([a, v]) => ({ key: a, label: a, v, yours: mineArtists.has(a) }))} />
      </section>

      <section className="section">
        <div className="sechead"><h2 className="cond">Where everyone landed</h2><span>Brighter = more songs</span></div>
        <EmotionMap axes={t.axes} cells={allCells} points={mine} label="Every song from every list, as a density map, with your five on top" />
        <div className="legend"><HeatLegend />{mine.length > 0 && <span><i className="youdot"></i>Your five</span>}</div>
      </section>

      {complete && <section className="section">
        <div className="sechead"><h2 className="cond">Same song, different feelings</h2></div>
        <div className="chips" role="group" aria-label="Pick one of your songs">
          {s.list.map((x, k) => <button key={x.id} className="chip" aria-pressed={x.id === fSong.id} onClick={() => setFocus(x.id)}><b>{k + 1}</b>{x.title}</button>)}
        </div>
        {enough ? (
          <>
            <p style={{ marginBottom: 12 }}><b>{fmt(fc.picks)} people</b> put {fSong.title} in their Top 5. {fMine ? compareLine(fMine, fAvg, t.axes) : ""}</p>
            <EmotionMap axes={t.axes} cells={densityCells(fc.pts, 14)} points={fPts} label={`How everyone feels about ${fSong.title}`} />
            <div className="legend"><HeatLegend /><span><i style={{ boxShadow: "inset 0 0 0 3px var(--ink)" }}></i>Average</span>{fMine && <span><i className="youdot"></i>You</span>}</div>
            <h3 className="semi" style={{ fontSize: 15, letterSpacing: ".1em", marginTop: 22 }}>Where it ranks</h3>
            <div className="rankbars" role="img" aria-label={fc.ranks.map((v, k) => `#${k + 1}: ${v}`).join(", ")}>
              {fc.ranks.map((v, k) => <div key={k}><em>{v}</em><i className={k + 1 === fRank ? "me" : ""} style={{ height: Math.max(4, (v / rmax) * 78) + "px" }}></i><span>#{k + 1}</span></div>)}
            </div>
            <p className="note">Red is where you put it.</p>
          </>
        ) : (
          <div className="pbox" style={{ padding: 18 }}><p style={{ margin: 0 }}><b>Not enough lists yet.</b> Fewer than {MIN_GROUP} people have picked {fSong.title}, so we don’t show how they feel about it. Check back later.</p></div>
        )}
      </section>}
      <p className="note" style={{ marginTop: 24 }}>Totals only. Groups under {MIN_GROUP} people are never shown, and no one sees your list unless you make it public.</p>
    </>
  );
}

function Results({ s, set, go, t, toast }) {
  const tab = s.tab || "yours";
  if (!s.list.every(Boolean)) return (
    <>
      <div className="banner grain" style={{ marginBottom: 22 }}><b>Everybody’s got one. What’s yours?</b><button className="btn" style={{ whiteSpace: "nowrap" }} onClick={() => go(s.list.some(Boolean) ? "pick" : "landing")}>{s.list.some(Boolean) ? "Finish my Top 5" : "Start my Top 5"}</button></div>
      <Everyone s={s} t={t} />
    </>
  );
  return (
    <>
      {!s.saved ? (
        <div className="banner grain"><b>Not saved yet</b><button className="btn" onClick={() => go("save")}>Keep my list</button></div>
      ) : (
        <div className="seal">
          <span className="gota grain" style={{ fontSize: 20 }}>On the record</span>
          <span className="small muted">{s.edited ? "Updated" : "Saved"} {s.savedAt || "Oct 31, 2026"} · {s.isPublic ? "Public" : "Private"}</span>
        </div>
      )}
      <div className="tabs" role="tablist" style={{ marginTop: s.saved ? 6 : 18 }}>
        <button role="tab" aria-selected={tab === "yours"} onClick={() => set({ tab: "yours" })}>Yours</button>
        <button role="tab" aria-selected={tab === "everyone"} onClick={() => set({ tab: "everyone" })}>Everybody’s</button>
      </div>
      {tab === "yours" ? <Yours s={s} set={set} go={go} t={t} toast={toast} /> : <Everyone s={s} t={t} />}
      {s.user && tab === "yours" && <p className="small" style={{ marginTop: 28, textAlign: "center" }}><button className="linkbtn" onClick={() => toast("Prototype: would confirm, then delete account and list")}>Delete my account and data</button></p>}
    </>
  );
}

Object.assign(window, { Results });
