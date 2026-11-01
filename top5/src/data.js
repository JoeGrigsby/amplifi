// Prototype data: a mock song catalog and mock community results.
// In production the catalog comes from the music provider (Apple Music / MusicBrainz),
// and the community numbers come from the aggregate API (groups under 25 suppressed).
(() => {
  // [title, artist, album, year, light(0 heavy..1 light), energy(0..1), popularity]
  const RAW = [
    ["Hallelujah","Jeff Buckley","Grace",1994,.2,.25,62],
    ["Hallelujah","Leonard Cohen","Various Positions",1984,.25,.2,26],
    ["Hallelujah","Rufus Wainwright","Shrek (Soundtrack)",2001,.3,.22,9],
    ["Hurt","Johnny Cash","American IV: The Man Comes Around",2002,.08,.15,48],
    ["Hurt","Nine Inch Nails","The Downward Spiral",1994,.1,.45,19],
    ["Dreams","Fleetwood Mac","Rumours",1977,.45,.45,44],
    ["Dreams","The Cranberries","Everybody Else Is Doing It",1993,.7,.7,21],
    ["I Will Always Love You","Whitney Houston","The Bodyguard",1992,.35,.7,31],
    ["I Will Always Love You","Dolly Parton","Jolene",1974,.3,.3,17],
    ["Thunder Road","Bruce Springsteen","Born to Run",1975,.62,.8,71],
    ["Born to Run","Bruce Springsteen","Born to Run",1975,.65,.92,38],
    ["Atlantic City","Bruce Springsteen","Nebraska",1982,.22,.42,12],
    ["Dancing in the Dark","Bruce Springsteen","Born in the U.S.A.",1984,.6,.8,22],
    ["Dancing Barefoot","Patti Smith Group","Wave",1979,.55,.55,15],
    ["Let's Get It On","Marvin Gaye","Let's Get It On",1973,.78,.5,24],
    ["What's Going On","Marvin Gaye","What's Going On",1971,.4,.45,40],
    ["Walking on Sunshine","Katrina and the Waves","Walking on Sunshine",1985,.95,.94,18],
    ["Baby, I Love Your Way","Peter Frampton","Frampton Comes Alive!",1976,.8,.35,11],
    ["Crimson and Clover","Tommy James and the Shondells","Crimson & Clover",1968,.6,.4,13],
    ["Smells Like Teen Spirit","Nirvana","Nevermind",1991,.32,.95,64],
    ["Pink Moon","Nick Drake","Pink Moon",1972,.3,.1,23],
    ["Waterloo Sunset","The Kinks","Something Else by the Kinks",1967,.68,.32,27],
    ["\u201CHeroes\u201D","David Bowie","\u201CHeroes\u201D",1977,.66,.76,66],
    ["Under Pressure","Queen & David Bowie","Hot Space",1982,.42,.78,34],
    ["Bohemian Rhapsody","Queen","A Night at the Opera",1975,.5,.82,57],
    ["Here Comes the Sun","The Beatles","Abbey Road",1969,.9,.5,72],
    ["A Day in the Life","The Beatles","Sgt. Pepper's Lonely Hearts Club Band",1967,.35,.6,36],
    ["Purple Rain","Prince","Purple Rain",1984,.34,.55,74],
    ["Kiss","Prince","Parade",1986,.88,.88,20],
    ["Superstition","Stevie Wonder","Talking Book",1972,.75,.85,33],
    ["Respect","Aretha Franklin","I Never Loved a Man the Way I Love You",1967,.78,.9,30],
    ["Jolene","Dolly Parton","Jolene",1973,.3,.6,25],
    ["Fast Car","Tracy Chapman","Tracy Chapman",1988,.3,.42,61],
    ["Landslide","Fleetwood Mac","Fleetwood Mac",1975,.32,.18,35],
    ["Once in a Lifetime","Talking Heads","Remain in Light",1980,.6,.78,26],
    ["This Must Be the Place (Naive Melody)","Talking Heads","Speaking in Tongues",1983,.82,.45,46],
    ["Love Will Tear Us Apart","Joy Division","Love Will Tear Us Apart",1980,.18,.7,28],
    ["There Is a Light That Never Goes Out","The Smiths","The Queen Is Dead",1986,.3,.52,56],
    ["Just Like Heaven","The Cure","Kiss Me, Kiss Me, Kiss Me",1987,.8,.78,32],
    ["Pictures of You","The Cure","Disintegration",1989,.25,.35,21],
    ["Last Nite","The Strokes","Is This It",2001,.68,.88,24],
    ["Maps","Yeah Yeah Yeahs","Fever to Tell",2003,.28,.6,30],
    ["Jesus, Etc.","Wilco","Yankee Hotel Foxtrot",2002,.4,.35,42],
    ["Chicago","Sufjan Stevens","Illinois",2005,.68,.62,47],
    ["Sweet Home Chicago","Robert Johnson","King of the Delta Blues Singers",1961,.6,.6,10],
    ["Mannish Boy","Muddy Waters","Mannish Boy",1955,.55,.7,14],
    ["Move On Up","Curtis Mayfield","Curtis",1970,.88,.9,29],
    ["Jesus Walks","Kanye West","The College Dropout",2004,.45,.85,27],
    ["Tiny Dancer","Elton John","Madman Across the Water",1971,.62,.4,31],
    ["God Only Knows","The Beach Boys","Pet Sounds",1966,.62,.3,43],
    ["Wouldn't It Be Nice","The Beach Boys","Pet Sounds",1966,.9,.7,16],
    ["Losing My Religion","R.E.M.","Out of Time",1991,.3,.55,37],
    ["Nightswimming","R.E.M.","Automatic for the People",1992,.4,.15,22],
    ["Creep","Radiohead","Pablo Honey",1993,.12,.55,29],
    ["Fake Plastic Trees","Radiohead","The Bends",1995,.2,.3,26],
    ["Everything in Its Right Place","Radiohead","Kid A",2000,.35,.4,18],
    ["Teenage Kicks","The Undertones","The Undertones",1979,.9,.92,12],
    ["Blitzkrieg Bop","Ramones","Ramones",1976,.85,.97,15],
    ["London Calling","The Clash","London Calling",1979,.3,.9,25],
    ["Dancing Queen","ABBA","Arrival",1976,.92,.8,26],
    ["Dancing On My Own","Robyn","Body Talk",2010,.3,.85,33],
    ["Mr. Brightside","The Killers","Hot Fuss",2004,.4,.94,31],
    ["Alright","Kendrick Lamar","To Pimp a Butterfly",2015,.65,.82,28],
    ["Hey Ya!","OutKast","Speakerboxxx/The Love Below",2003,.88,.95,30],
    ["Ms. Jackson","OutKast","Stankonia",2000,.5,.62,17],
    ["Bitter Sweet Symphony","The Verve","Urban Hymns",1997,.4,.62,21],
    ["Champagne Supernova","Oasis","(What's the Story) Morning Glory?",1995,.55,.58,19],
    ["1979","The Smashing Pumpkins","Mellon Collie and the Infinite Sadness",1995,.48,.5,45],
    ["Today","The Smashing Pumpkins","Siamese Dream",1993,.55,.78,24],
    ["Motion Sickness","Phoebe Bridgers","Stranger in the Alps",2017,.35,.6,22],
    ["Nights","Frank Ocean","Blonde",2016,.35,.5,30],
    ["Seven Nation Army","The White Stripes","Elephant",2003,.32,.88,23],
    ["Stand by Me","Ben E. King","Don't Play That Song!",1961,.75,.35,28],
    ["A Change Is Gonna Come","Sam Cooke","Ain't That Good News",1964,.3,.3,32],
    ["Gimme Shelter","The Rolling Stones","Let It Bleed",1969,.2,.85,26],
    ["Wild Horses","The Rolling Stones","Sticky Fingers",1971,.35,.25,18],
    ["Ceremony","New Order","Movement",1981,.5,.7,12],
    ["Lose Yourself","Eminem","8 Mile (Soundtrack)",2002,.35,.95,25],
  ];
  const slug = s => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
  const CATALOG = RAW.map(([t,a,al,y,cx,cy,pop]) => ({ id: slug(t+"-"+a), title:t, artist:a, album:al, year:y, cx, cy, pop }));

  // deterministic RNG
  function rng(seed){ let a = seed>>>0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const gauss = r => { let u=0,v=0; while(!u) u=r(); while(!v) v=r(); return Math.sqrt(-2*Math.log(u))*Math.cos(2*Math.PI*v); };
  const clamp = v => Math.max(0.02, Math.min(0.98, v));

  const TOTAL_LISTS = 1284;
  const r = rng(1999);
  const community = {};
  CATALOG.forEach((s, i) => {
    const picks = Math.round(s.pop * 3.1 + r()*6);
    // rank distribution skews by popularity: popular songs land at #1 more often
    const lean = s.pop / 74;
    const w = [0.12+0.22*lean, 0.2, 0.22, 0.22-0.06*lean, 0.24-0.16*lean].map(x=>x+r()*0.05);
    const ws = w.reduce((a,b)=>a+b,0);
    const ranks = w.map(x => Math.round(picks * x / ws));
    const pts = [];
    const spread = 0.1 + r()*0.08;
    for (let k=0; k<picks; k++) pts.push({ x: clamp(s.cx + gauss(r)*spread), y: clamp(s.cy + gauss(r)*spread) });
    community[s.id] = { picks, ranks, pts };
  });

  const artistCounts = {};
  CATALOG.forEach(s => { artistCounts[s.artist] = (artistCounts[s.artist]||0) + community[s.id].picks; });

  // Each NFC poster writes its own URL: Championship Vinyl Top 5.html?poster=<id>
  const POSTERS = { "cv-07": { id: "CV-07", place: "Beat Kitchen Chicago", logo: "/top5/beat-kitchen.webp", city: "Chicago", since: "Oct 3, 2026" } };
  window.CV_DATA = { CATALOG, community, artistCounts, TOTAL_LISTS, MIN_GROUP: 25, slug,
    POSTERS, POSTER: POSTERS["cv-07"] };
})();
