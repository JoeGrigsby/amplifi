const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "axes": "everyday",
  "allowSkip": false,
  "ghosts": true,
  "texture": true
}/*EDITMODE-END*/;

const KEY = "cv-top5-v1";
const EMPTY = { screen: "landing", list: [null, null, null, null, null], feel: {}, feelIdx: 0, user: null, saved: false, isPublic: false, email: "", tab: "yours", savedAt: null, edited: false };

const find = (title, artist) => window.CV_DATA.CATALOG.find(x => x.title.includes(title) && x.artist === artist);
const SAMPLE = () => [find("Thunder Road", "Bruce Springsteen"), find("Hallelujah", "Jeff Buckley"), find("This Must Be the Place", "Talking Heads"), find("Chicago", "Sufjan Stevens"), find("Love Will Tear Us Apart", "Joy Division")];
const SAMPLE_FEEL = () => {
  const off = [[.12, .04], [.1, -.06], [-.05, .1], [-.18, -.08], [.06, -.12]];
  const f = {};
  SAMPLE().forEach((x, k) => { f[x.id] = { x: +(x.cx + off[k][0]).toFixed(3), y: +(x.cy + off[k][1]).toFixed(3) }; });
  return f;
};
const PRESETS = {
  "landing": () => ({}),
  "landing-web": () => ({}),
  "everyone-visitor": () => ({ screen: "results", tab: "everyone" }),
  "landing-resume": () => ({ list: [...SAMPLE().slice(0, 3), null, null] }),
  "pick-empty": () => ({ screen: "pick" }),
  "pick-search": () => ({ screen: "pick", list: [...SAMPLE().slice(0, 3), null, null], query: "hallelujah" }),
  "pick-full": () => ({ screen: "pick", list: SAMPLE() }),
  "feel": () => { const f = SAMPLE_FEEL(); const l = SAMPLE(); return { screen: "feel", list: l, feel: { [l[0].id]: f[l[0].id] }, feelIdx: 1 }; },
  "save": () => ({ screen: "save", list: SAMPLE(), feel: SAMPLE_FEEL() }),
  "sent": () => ({ screen: "sent", list: SAMPLE(), feel: SAMPLE_FEEL(), email: "rob.gordon@gmail.com" }),
  "results-guest": () => ({ screen: "results", list: SAMPLE(), feel: SAMPLE_FEEL() }),
  "results-yours": () => ({ screen: "results", list: SAMPLE(), feel: SAMPLE_FEEL(), user: { email: "rob.gordon@gmail.com" }, saved: true, savedAt: "Oct 31, 2026" }),
  "results-everyone": () => ({ screen: "results", tab: "everyone", list: SAMPLE(), feel: SAMPLE_FEEL(), user: { email: "rob.gordon@gmail.com" }, saved: true, savedAt: "Oct 31, 2026" }),
  "signin": () => ({ screen: "signin" }),
};
const SCREEN_OPTS = [
  { value: "landing", label: "1 · Poster tap: Beat Kitchen Chicago" },
  { value: "landing-web", label: "1a · Landing, opened from AmpliFi site" },
  { value: "landing-resume", label: "1b · Landing, list in progress" },
  { value: "pick-empty", label: "2 · Pick, empty" },
  { value: "pick-search", label: "2b · Pick, searching versions" },
  { value: "pick-full", label: "2c · Pick, five chosen" },
  { value: "feel", label: "3 · Feel map (song 2)" },
  { value: "save", label: "4 · Keep / sign up" },
  { value: "sent", label: "4b · Magic link sent" },
  { value: "results-guest", label: "5 · Results, not saved" },
  { value: "results-yours", label: "5b · Results, yours" },
  { value: "results-everyone", label: "5c · Results, everybody's" },
  { value: "signin", label: "6 · Returning sign-in" },
  { value: "everyone-visitor", label: "7 · Everybody's results, no list yet" },
];

const URLP = new URLSearchParams(location.search);
const posterFromUrl = () => window.CV_DATA.POSTERS[(new URLSearchParams(location.search).get("poster") || "").toLowerCase()] || null;
function setPosterUrl(id) {
  const p = new URLSearchParams(location.search);
  if (id) p.set("poster", id); else p.delete("poster");
  p.delete("view");
  history.replaceState(null, "", location.pathname + (p.toString() ? "?" + p : "") + location.hash);
}
function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    if (!raw) return EMPTY;
    const byId = Object.fromEntries(window.CV_DATA.CATALOG.map(x => [x.id, x]));
    raw.list = (raw.list || []).map(x => (x ? (byId[x.id] || x) : null));
    while (raw.list.length < 5) raw.list.push(null);
    const st = { ...EMPTY, ...raw };
    if (URLP.get("view") === "everyone") { st.screen = "results"; st.tab = "everyone"; }
    else if (URLP.get("poster")) st.screen = "landing";
    return st;
  } catch (e) { return URLP.get("view") === "everyone" ? { ...EMPTY, screen: "results", tab: "everyone" } : EMPTY; }
}

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [s, setS] = useState(load);
  const [poster, setPoster] = useState(posterFromUrl);
  const [nonce, setNonce] = useState(0);
  const [jump, setJump] = useState("");
  const [msg, setMsg] = useState("");
  const timer = useRef(null);

  useEffect(() => { const { query, ...rest } = s; localStorage.setItem(KEY, JSON.stringify(rest)); }, [s]);
  useEffect(() => { document.body.classList.toggle("textured", !!t.texture); }, [t.texture]);

  const set = patch => setS(prev => ({ ...prev, ...(typeof patch === "function" ? patch(prev) : patch) }));
  const toast = m => { setMsg(m); clearTimeout(timer.current); timer.current = setTimeout(() => setMsg(""), 2200); };
  const go = screen => {
    set(prev => {
      if (screen === "everyone") return { screen: "results", tab: "everyone" };
      const p = { screen };
      if (screen === "feel") { const miss = prev.list.findIndex(x => x && !prev.feel[x.id]); p.feelIdx = miss > -1 ? miss : 0; }
      if (screen === "results" && prev.screen !== "results") p.tab = "yours";
      return p;
    });
    window.scrollTo(0, 0);
  };
  const startNew = () => { set({ ...EMPTY, screen: "pick", user: s.user }); window.scrollTo(0, 0); };
  const stamp = () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const auth = ({ email, returning }) => {
    set(prev => {
      const hasDraft = prev.list.every(Boolean);
      const base = !hasDraft && returning ? { list: SAMPLE(), feel: SAMPLE_FEEL() } : {};
      return { ...base, user: { email }, saved: true, savedAt: stamp(), screen: "results", tab: "yours", edited: false };
    });
    toast("Saved. Your Top 5 is on the record.");
    window.scrollTo(0, 0);
  };
  const finish = () => {
    if (s.user) { set({ saved: true, edited: s.saved, savedAt: stamp(), screen: "results", tab: "yours" }); toast(s.saved ? "Updated. Your Top 5 is on the record." : "Saved. Your Top 5 is on the record."); window.scrollTo(0, 0); }
    else go("save");
  };
  const applyPreset = key => {
    setJump(key);
    const pid = key === "landing-web" || key === "everyone-visitor" ? null : "cv-07";
    setPosterUrl(pid); setPoster(pid ? window.CV_DATA.POSTERS[pid] : null);
    setS({ ...EMPTY, ...PRESETS[key]() });
    setNonce(n => n + 1);
    window.scrollTo(0, 0);
  };

  const ctx = { s, set, go, t, toast };
  window.__cvPreset = applyPreset;
  const scr = s.screen;
  let body;
  if (scr === "pick") body = <Pick key={nonce} {...ctx} initialQuery={s.query} />;
  else if (scr === "feel" && s.list.every(Boolean)) body = <Feel key={nonce} {...ctx} finish={finish} />;
  else if (scr === "save") body = <Save {...ctx} auth={auth} />;
  else if (scr === "sent") body = <Sent {...ctx} auth={auth} />;
  else if (scr === "signin") body = <SignIn key={nonce} {...ctx} auth={auth} />;
  else if (scr === "results" && (s.list.every(Boolean) || s.tab === "everyone")) body = <Results key={nonce} {...ctx} />;
  else body = <Landing {...ctx} startNew={startNew} poster={poster} />;
  const isLanding = body.type === Landing;

  return (
    <div className="shell" data-screen-label={scr}>
      {!isLanding && <div className="band grain" aria-hidden="true"></div>}
      {!isLanding && <TopBar user={s.user} onHome={() => go("landing")} onSignIn={() => go("signin")} onSignOut={() => { set({ user: null, saved: false }); go("landing"); toast("Signed out"); }} />}
      <main className="main">{body}</main>
      <Footer poster={poster} />
      <Toast msg={msg} />
      <TweaksPanel>
        <TweakSection label="Prototype" />
        <TweakSelect label="Jump to screen" value={jump} options={[{ value: "", label: "Choose…" }, ...SCREEN_OPTS]} onChange={v => v && applyPreset(v)} />
        <TweakSection label="Feeling map" />
        <TweakRadio label="Axis words" value={t.axes} options={[{ value: "everyday", label: "Heavy / Light" }, { value: "research", label: "Valence" }]} onChange={v => setTweak("axes", v)} />
        <TweakToggle label="Allow skipping a song" value={t.allowSkip} onChange={v => setTweak("allowSkip", v)} />
        <TweakToggle label="Show other songs' dots" value={t.ghosts} onChange={v => setTweak("ghosts", v)} />
        <TweakSection label="Look" />
        <TweakToggle label="Letterpress texture" value={t.texture} onChange={v => setTweak("texture", v)} />
      </TweaksPanel>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
