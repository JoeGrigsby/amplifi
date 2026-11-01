const { useState, useEffect, useRef, useMemo, useCallback } = React;

const AXES = {
  everyday: { left: "Heavy", right: "Lighthearted", top: "High energy", bottom: "Low energy", x: ["Very heavy","Fairly heavy","In between","Fairly light","Very light"], y: ["Very low energy","Low energy","Medium energy","High energy","Very high energy"] },
  research: { left: "Unpleasant", right: "Pleasant", top: "High arousal", bottom: "Low arousal", x: ["Very unpleasant","Fairly unpleasant","Neutral","Fairly pleasant","Very pleasant"], y: ["Very calm","Calm","Moderate arousal","Aroused","Very aroused"] },
};
const band = v => v < .15 ? 0 : v < .4 ? 1 : v <= .6 ? 2 : v <= .85 ? 3 : 4;
function describe(p, axes) {
  if (!p) return null;
  const a = AXES[axes] || AXES.everyday;
  const bx = band(p.x), by = band(p.y);
  if (bx === 2 && by === 2) return "Right in the middle";
  if (bx === 2) return a.y[by];
  if (by === 2) return a.x[bx];
  return a.x[bx] + ", " + a.y[by].toLowerCase();
}

const Icon = {
  search: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><circle cx="10.5" cy="10.5" r="6.5"/><path d="M15.5 15.5 21 21"/></svg>,
  up: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 14l6-6 6 6"/></svg>,
  down: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M6 10l6 6 6-6"/></svg>,
  x: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>,
  plus: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  arrow: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>,
  back: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6"/></svg>,
  grip: <svg viewBox="0 0 14 22" fill="currentColor"><circle cx="4" cy="4" r="2"/><circle cx="10" cy="4" r="2"/><circle cx="4" cy="11" r="2"/><circle cx="10" cy="11" r="2"/><circle cx="4" cy="18" r="2"/><circle cx="10" cy="18" r="2"/></svg>,
  mail: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinejoin="round"><rect x="3" y="5" width="18" height="14" rx="1"/><path d="m3.5 6 8.5 7 8.5-7"/></svg>,
};

const STAR_CLIP = (() => {
  const pts = [];
  for (let i = 0; i < 12; i++) { const r = i % 2 ? 24 : 50, a = (Math.PI / 6) * i - Math.PI / 2; pts.push(`${(50 + r * Math.cos(a)).toFixed(1)}% ${(50 + r * Math.sin(a)).toFixed(1)}%`); }
  return `polygon(${pts.join(",")})`;
})();
function Star({ size = 18 }) { return <i className="star" aria-hidden="true" style={{ width: size, height: size, clipPath: STAR_CLIP }}></i>; }

function Masthead() {
  return (
    <div className="mast" role="img" aria-label="What's the soundtrack of your life?">
      <img className="cvlogo" src="/top5/soundtrack.webp" alt="" width="360" height="157" fetchpriority="high" decoding="async" />
    </div>
  );
}

function TopBar({ user, onHome, onSignIn, onSignOut }) {
  return (
    <header className="topbar">
      <button className="wordmark" onClick={onHome} aria-label="Championship Vinyl home">
        <img src="/top5/soundtrack.webp" alt="" width="104" height="45" decoding="async" />
      </button>
      <div className="who">
        {user ? <button className="linkbtn" onClick={onSignOut}>Sign out</button>
              : <button className="linkbtn" onClick={onSignIn}>Sign in</button>}
      </div>
    </header>
  );
}

function Steps({ step }) {
  const names = ["Pick", "Feel", "Keep"];
  return (
    <nav className="steps" aria-label="Progress">
      {names.map((n, i) => (
        <React.Fragment key={n}>
          {i > 0 && <i></i>}
          <span className={i + 1 === step ? "on" : i + 1 < step ? "done" : ""} aria-current={i + 1 === step ? "step" : undefined}>{i + 1} · {n}</span>
        </React.Fragment>
      ))}
    </nav>
  );
}

const SLEEVES = [["#1d3354", "#e2492b"], ["#e2492b", "#f2e4c4"], ["#d9a23a", "#1d3354"], ["#e9d6ad", "#e2492b"], ["#3d5a80", "#f2e4c4"]];
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function Sleeve({ song, size = 44 }) {
  if (song.art) return <img className="sleeve" src={song.art} alt="" width={size} height={size} loading="lazy" decoding="async" style={{ width: size, height: size, objectFit: "cover", boxShadow: "0 0 0 1.5px rgba(20,36,61,.35)" }} />;
  const [bg, lab] = SLEEVES[hash(song.album || song.title) % SLEEVES.length];
  return <span className="sleeve" aria-hidden="true" style={{ width: size, height: size, background: bg, boxShadow: "inset 0 0 0 1.5px rgba(20,36,61,.35)" }}><i><b style={{ background: lab }}></b></i></span>;
}

// Two-axis emotion map. x: 0 heavy → 1 light. y: 0 low → 1 high energy.
function EmotionMap({ axes = "everyday", value, onChange, points = [], cells, label, emptyHint, activeLabel }) {
  const a = AXES[axes] || AXES.everyday;
  const ref = useRef(null);
  const drag = useRef(false);
  const live = !!onChange;
  const at = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
    const y = Math.min(1, Math.max(0, 1 - (e.clientY - r.top) / r.height));
    return { x: +x.toFixed(3), y: +y.toFixed(3) };
  };
  const down = (e) => { if (!live) return; drag.current = true; ref.current.setPointerCapture?.(e.pointerId); onChange(at(e)); };
  const move = (e) => { if (live && drag.current) onChange(at(e)); };
  const up = () => { drag.current = false; };
  const key = (e) => {
    if (!live) return;
    const step = e.shiftKey ? .1 : .04;
    const p = value || { x: .5, y: .5 };
    const m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, step], ArrowDown: [0, -step] }[e.key];
    if (m) { e.preventDefault(); onChange({ x: +Math.min(1, Math.max(0, p.x + m[0])).toFixed(3), y: +Math.min(1, Math.max(0, p.y + m[1])).toFixed(3) }); }
    else if ((e.key === "Enter" || e.key === " ") && !value) { e.preventDefault(); onChange({ x: .5, y: .5 }); }
  };
  return (
    <div className="emap">
      <span></span><span className="ax">{a.top}</span><span></span>
      <span className="ax l">{a.left}</span>
      <div ref={ref} className={"field2d" + (live ? " live" : "") + (cells ? " heat" : "")} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        tabIndex={live ? 0 : undefined} onKeyDown={key} role={live ? "application" : "img"}
        aria-label={label || `Map from ${a.left} to ${a.right}, ${a.bottom} to ${a.top}`}
        aria-describedby={live ? "map-help" : undefined}>
        <div className="grid"></div>
        {cells && cells.map((c, i) => <span key={"c" + i} className="cell" style={{ left: c.x * 100 + "%", top: c.y * 100 + "%", width: c.w * 100 + "%", height: c.h * 100 + "%", background: c.c }}></span>)}
        {points.map((p, i) => <span key={"p" + i + p.kind} className={"dot " + (p.kind || "")} style={{ left: p.x * 100 + "%", top: (1 - p.y) * 100 + "%" }}>{p.label}</span>)}
        {live && value && <span key="v" className="dot active" style={{ left: value.x * 100 + "%", top: (1 - value.y) * 100 + "%" }}>{activeLabel}</span>}
        {live && !value && emptyHint && <span className="empty-hint">{emptyHint}</span>}
      </div>
      <span className="ax r">{a.right}</span>
      <span></span><span className="ax">{a.bottom}</span><span></span>
      {live && <span id="map-help" className="sr">Tap to place a dot, or focus and use arrow keys. Shift moves farther.</span>}
    </div>
  );
}

// Heat ramp (plasma-style, tuned to the poster inks): navy → plum → magenta → red-orange → gold → cream
const HEAT_STOPS = [[0, [33, 40, 82]], [.16, [58, 47, 104]], [.32, [104, 50, 124]], [.48, [163, 52, 120]], [.62, [214, 62, 86]], [.75, [232, 96, 52]], [.87, [244, 160, 72]], [.95, [248, 214, 120]], [1, [252, 240, 206]]];
function heat(t) {
  t = Math.max(0, Math.min(1, t));
  for (let i = 1; i < HEAT_STOPS.length; i++) {
    const [t1, c1] = HEAT_STOPS[i], [t0, c0] = HEAT_STOPS[i - 1];
    if (t <= t1) { const f = (t - t0) / (t1 - t0 || 1); return "rgb(" + c0.map((v, k) => Math.round(v + (c1[k] - v) * f)).join(",") + ")"; }
  }
  return "rgb(252,240,206)";
}
const HEAT_CSS = "linear-gradient(90deg," + HEAT_STOPS.map(([t]) => heat(t) + " " + Math.round(t * 100) + "%").join(",") + ")";
function HeatLegend() {
  return <div className="heatkey" aria-hidden="true"><span>Fewer</span><i style={{ background: HEAT_CSS }}></i><span>More</span></div>;
}
// Density grid from points: every cell filled, lightly smoothed so clusters read as heat, never single dots
function densityCells(pts, n = 18) {
  const g = Array.from({ length: n * n }, () => 0);
  pts.forEach(p => { const i = Math.min(n - 1, Math.floor(p.x * n)), j = Math.min(n - 1, Math.floor((1 - p.y) * n)); g[j * n + i]++; });
  const K = [[1, 2, 1], [2, 4, 2], [1, 2, 1]];
  const s = g.map((_, k) => {
    const i = k % n, j = Math.floor(k / n); let sum = 0, w = 0;
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
      const x = i + dx, y = j + dy; if (x < 0 || y < 0 || x >= n || y >= n) continue;
      const kk = K[dy + 1][dx + 1]; sum += g[y * n + x] * kk; w += kk;
    }
    return sum / w;
  });
  const max = Math.max(1e-6, ...s);
  return s.map((v, k) => ({ x: (k % n) / n, y: Math.floor(k / n) / n, w: 1 / n, h: 1 / n, c: heat(Math.pow(v / max, .6)) }));
}

function Footer({ poster }) {
  return (
    <footer className="foot">
      <div className="rule thin"></div>
      <a className="powered" href="/top5"><img src="/top5/amplifi.webp" alt="" width="36" height="35" loading="lazy" decoding="async" /><span>Powered by <b>AmpliFi</b></span></a>
      <p><a href="/top5">AmpliFi home</a>{poster && <span>Poster {poster.id}</span>}<a href="#privacy">Privacy</a><a href="#delete">Delete my data</a></p>
    </footer>
  );
}

function Toast({ msg }) { return msg ? <div className="toast" role="status">{msg}</div> : null; }

Object.assign(window, { HeatLegend, AXES, describe, Icon, Star, Masthead, TopBar, Steps, Sleeve, EmotionMap, densityCells, Footer, Toast });
