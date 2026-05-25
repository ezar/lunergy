// LUNERGY — main game (React + Babel)
const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ===================== DATA =====================
const SOURCES = [
  {
    id: 'solar',
    name: 'SOLAR PANELS',
    short: 'SOLAR',
    icon: 'solar',
    color: '#ffcc33',
    cost: 8,
    baseOutput: 5,
    drainRate: 0,        // no fuel cost
    fuelMax: null,
    fact: "Lunar days last 14 Earth-days with no atmosphere, so each m² of panel can capture up to 1366 W of pure sunlight — almost double Earth's output.",
    modifiers: {
      day: 2.4,          // 2.4x output in lunar day
      night: 0.0,        // useless at night
      storm: 0.2,        // dust blocks 80% of light
      cold: 1.0,
      hot: 1.1,
    }
  },
  {
    id: 'fusion',
    name: 'NUCLEAR FUSION',
    short: 'FUSION',
    icon: 'fusion',
    color: '#66e0ff',
    cost: 22,
    baseOutput: 11,
    drainRate: 0.5,
    fuelMax: 100,
    fact: "Nuclear fusion fuses light atoms to release ~4× more energy than fission. 1 gram of fuel can equal the energy of 8 tons of oil — perfect for long missions.",
    modifiers: {
      day: 1.0, night: 1.0, storm: 1.0, cold: 1.0, hot: 0.85
    }
  },
  {
    id: 'helium3',
    name: 'HELIUM-3 REACTOR',
    short: 'HELIUM-3',
    icon: 'helium',
    color: '#ff99cc',
    cost: 30,
    baseOutput: 14,
    drainRate: 1.4,
    fuelMax: 60,
    fact: "Helium-3 is rare on Earth but abundant in lunar regolith — about 1.1 million tons sit on the Moon's surface. Just 1 ton could power a city for a year.",
    modifiers: {
      day: 1.0, night: 1.0, storm: 1.0, cold: 1.0, hot: 1.0
    }
  },
  {
    id: 'methane',
    name: 'METHANE BURNER',
    short: 'METHANE',
    icon: 'methane',
    color: '#33ff88',
    cost: 12,
    baseOutput: 7,
    drainRate: 0.9,
    fuelMax: 80,
    fact: "Methane (CH₄) can be synthesised on the Moon by combining hydrogen from ice with carbon from regolith — doubling as rocket propellant and an emergency power source.",
    modifiers: {
      day: 1.0, night: 1.0, storm: 1.0, cold: 0.55, hot: 1.0  // cold reduces combustion
    }
  },
];

// Possible environment conditions
const PHASES = ['day','night'];
const TEMPS = ['normal','cold','hot'];

function rollConditions(prev){
  // Smooth-ish progression: keep phase for 1-2 cycles, vary storm/temp
  const phase = Math.random() < 0.45 ? (prev?.phase === 'day' ? 'night' : 'day') : (prev?.phase || 'day');
  const storm = Math.random() < 0.28;
  const tempRoll = Math.random();
  let temp;
  if (phase === 'night' && tempRoll < 0.6) temp = 'cold';
  else if (phase === 'day' && tempRoll < 0.35) temp = 'hot';
  else temp = 'normal';
  return { phase, storm, temp };
}

// ===================== ICONS (CSS pixel art via divs) =====================
function PxIcon({ kind, size = 48, animate = false }){
  // each icon is a small grid of pixels
  const grids = {
    solar: [
      "....YYYY....",
      "...Y....Y...",
      "..Y.YY.Y.Y..",
      ".YYYYYYYYYY.",
      "BBBBBBBBBBBB",
      "B.B.B.B.B.BB",
      "BBBBBBBBBBBB",
      "B.B.B.B.B.BB",
      "BBBBBBBBBBBB",
      "..GG....GG..",
      "..GG....GG..",
      "............",
    ],
    fusion: [
      "....CCCC....",
      "..CCWWWWCC..",
      ".CWWWWWWWWC.",
      ".CWWWGGWWWC.",
      "CWWWGGGGWWWC",
      "CWWGGGGGGWWC",
      "CWWGGGGGGWWC",
      "CWWWGGGGWWWC",
      ".CWWWGGWWWC.",
      ".CWWWWWWWWC.",
      "..CCWWWWCC..",
      "....CCCC....",
    ],
    helium: [
      "....PPPP....",
      "..PPRRRRPP..",
      ".PRRRRRRRRP.",
      "PRRRWWWWRRRP",
      "PRRWWPPWWRRP",
      "PRRWWPPWWRRP",
      "PRRWPPPPWRRP",
      "PRRWWPPWWRRP",
      ".PRRWWWWRRP.",
      ".PRRRRRRRRP.",
      "..PPRRRRPP..",
      "....PPPP....",
    ],
    methane: [
      "....OOOO....",
      "...OYYYO....",
      "..OYYYYYO...",
      ".OYYYYYYO...",
      ".OYWWYYO....",
      "OYYWWYYYO...",
      "OYYYYYYYO...",
      ".OYYYYYO....",
      "..OYYYO.....",
      ".GGGGGGG....",
      ".GGGGGGG....",
      "GGGGGGGGG...",
    ],
  };
  const palette = {
    Y:'#ffe066', G:'#33ff88', B:'#1f4a8a', '.':'transparent',
    C:'#66e0ff', W:'#ffffff', P:'#ff99cc', R:'#aa3377',
    O:'#ff8833', '?':'#444'
  };
  const grid = grids[kind] || grids.solar;
  const cols = grid[0].length, rows = grid.length;
  const px = Math.floor(size / cols);
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns: `repeat(${cols}, ${px}px)`,
      gridTemplateRows: `repeat(${rows}, ${px}px)`,
      width: cols*px, height: rows*px,
      filter: animate ? 'drop-shadow(0 0 6px currentColor)' : 'none'
    }}>
      {grid.map((row, ri) => row.split('').map((ch, ci) => (
        <div key={`${ri}-${ci}`} style={{ background: palette[ch] || 'transparent' }} />
      )))}
    </div>
  );
}

// Pixel "base" (lunar habitat dome) drawn with CSS grid
function MoonBase({ damaged }){
  const G = [
    "............YYYY..........",
    "...........YYWWYY.........",
    "..........YYWWWWYY........",
    ".........YYYYYYYYYY.......",
    "........BBBBBBBBBBBB......",
    ".......BBCCCCCCCCCCBB.....",
    "......BBCCWWWWWWWWCCBB....",
    "......BCCWWXXXXWWWWCCB....",
    "......BCCWWXXXXWWWWCCB....",
    "......BCCWWWWWWWWWWCCB....",
    "......BCCWWGGGGWWWWCCB....",
    "......BCCWWGGGGWWWWCCB....",
    "......BCCWWWWWWWWWWCCB....",
    "......BBCCCCCCCCCCBB......",
    ".....SSSSSSSSSSSSSSSS.....",
    "....SSSSDDDDDDDDDDSSSS....",
    "...SSSSSDDDDDDDDDDSSSSS...",
    "..SSSSSSSSSSSSSSSSSSSSSS..",
  ];
  const palette = {
    Y:'#ffe066', W:'#ffffff', B:'#2a4cff',
    C:'#66e0ff', X:damaged ? '#ff4d4d' : '#3a7cff',
    G:damaged ? '#aa3333' : '#33ff88',
    S:'#5a5a82', D:'#3a3a62', '.':'transparent'
  };
  const px = 4;
  return (
    <div style={{
      display:'grid',
      gridTemplateColumns:`repeat(${G[0].length}, ${px}px)`,
      gridTemplateRows:`repeat(${G.length}, ${px}px)`,
      filter: damaged ? 'drop-shadow(0 0 8px #ff4d4d)' : 'drop-shadow(0 0 8px rgba(102,224,255,0.6))'
    }}>
      {G.map((row,ri) => row.split('').map((c,ci) => (
        <div key={`${ri}-${ci}`} style={{ background: palette[c] || 'transparent' }} />
      )))}
    </div>
  );
}

// ===================== SCREENS =====================
function TitleScreen({ onStart, onIntro, highScore }){
  return (
    <div style={{position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center'}}>
      <div style={{marginBottom:30}}>
        <div className="pulse-glow" style={{
          fontSize: 92, color:'var(--gold)', letterSpacing:8, textShadow:'4px 4px 0 #6a4cff, 8px 8px 0 #1a0d3d'
        }}>LUNERGY</div>
        <div style={{fontSize:12, color:'var(--cyan)', marginTop:14, letterSpacing:3}}>
          ⚡  MOON BASE SURVIVAL  ⚡
        </div>
      </div>

      <div style={{margin:'30px 0', display:'flex', gap:18, alignItems:'center'}}>
        <div style={{ animation:'star-twinkle 1.2s infinite' }}><PxIcon kind="solar" size={48}/></div>
        <div style={{ animation:'star-twinkle 1.7s infinite' }}><PxIcon kind="fusion" size={48}/></div>
        <div style={{ animation:'star-twinkle 1.4s infinite' }}><PxIcon kind="helium" size={48}/></div>
        <div style={{ animation:'star-twinkle 1.9s infinite' }}><PxIcon kind="methane" size={48}/></div>
      </div>

      <div style={{display:'flex', gap:20, marginTop:20}}>
        <button className="pxbtn gold" onClick={onStart}>► START MISSION</button>
        <button className="pxbtn" onClick={onIntro}>HOW TO PLAY</button>
      </div>

      {highScore > 0 && (
        <div style={{marginTop:30, fontSize:12, color:'var(--gold-bright)'}}>
          ★ HIGH SCORE: {highScore} ★
        </div>
      )}

      <div className="blink" style={{position:'absolute', bottom:24, fontSize:10, color:'var(--white)', letterSpacing:2}}>
        INSERT COIN — PRESS START
      </div>

      <div style={{position:'absolute', bottom:8, fontSize:8, color:'#6a6a82', letterSpacing:1}}>
        BY VLADIMIR · DENIZ · LEYRE · PETR    MENTOR: MR. ALBERT
      </div>
    </div>
  );
}

function IntroScreen({ onBack, onStart }){
  return (
    <div style={{position:'absolute', inset:'40px 60px', display:'flex', flexDirection:'column', alignItems:'center'}}>
      <div className="panel" style={{padding:'30px 40px', width:'100%', maxWidth:1000, background:'rgba(10,10,42,0.92)'}}>
        <div style={{fontSize:24, color:'var(--gold)', textAlign:'center', marginBottom:20, letterSpacing:3}}>
          ▼ MISSION BRIEFING ▼
        </div>
        <div className="vt" style={{fontSize:22, lineHeight:1.5, color:'var(--white)'}}>
          <p style={{marginBottom:14}}>► YEAR 2087. You command <span style={{color:'var(--gold)'}}>Outpost LUNERGY-1</span>, humanity's first permanent base on the Moon.</p>
          <p style={{marginBottom:14}}>► The base drains <span style={{color:'var(--red)'}}>energy every second</span>. If the bar hits ZERO, the crew is lost.</p>
          <p style={{marginBottom:14}}>► Activate up to <span style={{color:'var(--cyan)'}}>FOUR energy sources</span>. Each behaves differently depending on lunar conditions:</p>
          <div style={{display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:'8px 30px', margin:'12px 0', paddingLeft:20, fontSize:18}}>
            <div>☀ <b style={{color:'#ffcc33'}}>SOLAR</b> — strong by day, dead by night</div>
            <div>⚛ <b style={{color:'#66e0ff'}}>FUSION</b> — stable, expensive</div>
            <div>★ <b style={{color:'#ff99cc'}}>HELIUM-3</b> — explosive output, scarce fuel</div>
            <div>♨ <b style={{color:'#33ff88'}}>METHANE</b> — reliable, weak in cold</div>
          </div>
          <p style={{marginBottom:8}}>► Watch the <span style={{color:'var(--gold)'}}>conditions bar</span>: lunar day/night, dust storms and temperature change every ~15 seconds.</p>
          <p style={{color:'var(--gold-bright)', fontSize:18}}>► Survive as long as possible. Score = seconds alive × active efficiency.</p>
        </div>
      </div>
      <div style={{display:'flex', gap:20, marginTop:30}}>
        <button className="pxbtn" onClick={onBack}>← BACK</button>
        <button className="pxbtn gold" onClick={onStart}>► LAUNCH ►</button>
      </div>
    </div>
  );
}

// ===================== HUD =====================
function TopHUD({ score, time, conditions }){
  return (
    <div style={{position:'absolute', top:0, left:0, right:0, height:90, padding:'14px 24px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
      background:'linear-gradient(to bottom, rgba(5,3,15,0.95), rgba(5,3,15,0.0))',
      zIndex:5
    }}>
      <div>
        <div style={{fontSize:24, color:'var(--gold)', letterSpacing:3, textShadow:'2px 2px 0 #6a4cff'}}>LUNERGY</div>
        <div className="vt" style={{fontSize:18, color:'var(--cyan)', marginTop:2}}>OUTPOST L-1</div>
      </div>

      <div style={{display:'flex', gap:8}}>
        <ConditionPill icon={conditions.phase === 'day' ? '☀' : '☾'} label={conditions.phase === 'day' ? 'LUNAR DAY' : 'LUNAR NIGHT'} color={conditions.phase === 'day' ? '#ffcc33' : '#66e0ff'} />
        <ConditionPill icon={'※'} label={conditions.storm ? 'DUST STORM' : 'CLEAR SKY'} color={conditions.storm ? '#ff8833' : '#33ff88'} active={conditions.storm} />
        <ConditionPill icon={conditions.temp === 'cold' ? '❄' : conditions.temp === 'hot' ? '♨' : '◦'}
          label={conditions.temp === 'cold' ? '-180°C' : conditions.temp === 'hot' ? '+120°C' : '+20°C'}
          color={conditions.temp === 'cold' ? '#66e0ff' : conditions.temp === 'hot' ? '#ff4d4d' : '#aaaadd'} />
      </div>

      <div style={{textAlign:'right'}}>
        <div style={{fontSize:12, color:'var(--white)', letterSpacing:2}}>SCORE</div>
        <div style={{fontSize:28, color:'var(--gold)', textShadow:'2px 2px 0 #6a4cff'}}>{String(score).padStart(6,'0')}</div>
        <div style={{fontSize:10, color:'var(--cyan)', marginTop:2, letterSpacing:1}}>T+{Math.floor(time)}s</div>
      </div>
    </div>
  );
}

function ConditionPill({ icon, label, color, active }){
  return (
    <div className={"pill " + (active ? 'blink' : '')} style={{ borderColor: color, color }}>
      <span style={{fontSize:14}}>{icon}</span>
      <span>{label}</span>
    </div>
  );
}

// Tip: tiny floating educational fact toast
function FactToast({ fact, source }){
  if(!fact) return null;
  return (
    <div className="toast panel" style={{
      position:'absolute',
      left:'50%', transform:'translateX(-50%)',
      bottom:285, width:760, padding:'16px 22px',
      background:'rgba(10,10,42,0.96)',
      borderColor: source.color,
      zIndex:6
    }}>
      <div style={{display:'flex', alignItems:'flex-start', gap:14}}>
        <div style={{color: source.color, flexShrink:0}}>
          <PxIcon kind={source.icon} size={36} />
        </div>
        <div style={{flex:1}}>
          <div style={{fontSize:11, color: source.color, letterSpacing:2, marginBottom:8}}>
            ✦ DID YOU KNOW — {source.short} ✦
          </div>
          <div className="vt" style={{fontSize:19, lineHeight:1.35, color:'var(--white)'}}>
            {fact}
          </div>
        </div>
      </div>
    </div>
  );
}

function EventLog({ events }){
  return (
    <div className="panel" style={{
      position:'absolute', right:24, top:110, width:300, height:200,
      background:'rgba(10,10,42,0.85)', padding:'12px 14px',
      overflow:'hidden', zIndex:4
    }}>
      <div style={{fontSize:10, color:'var(--gold)', letterSpacing:2, marginBottom:8}}>▌SYSTEM LOG</div>
      <div className="vt" style={{fontSize:17, lineHeight:1.3, color:'#aaccff'}}>
        {events.slice(-7).map((e,i) => (
          <div key={i} style={{color: e.color || '#aaccff', marginBottom:2}}>
            <span style={{color:'#6a6a82'}}>[{String(e.t).padStart(3,'0')}] </span>{e.text}
          </div>
        ))}
        <span className="blink" style={{color:'var(--green)'}}>▌</span>
      </div>
    </div>
  );
}

function EnergyDisplay({ energy, net, status }){
  const color = energy > 60 ? '#33ff88' : energy > 30 ? '#ffcc33' : '#ff4d4d';
  const critical = energy < 25;
  return (
    <div className={"panel " + (critical ? 'shake' : '')} style={{
      position:'absolute', left:24, top:110, width:380, padding:'14px 18px',
      background:'rgba(10,10,42,0.88)', zIndex:4
    }}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'baseline', marginBottom:8}}>
        <div style={{fontSize:11, color:'var(--gold)', letterSpacing:2}}>▌BASE ENERGY</div>
        <div style={{fontSize:18, color, textShadow:'1px 1px 0 #000'}}>{Math.floor(energy)}%</div>
      </div>
      <div className="bar-frame">
        <div className="bar-fill" style={{ width: `${energy}%`, backgroundPosition: `${100-energy}% 0%` }}>
          <div className="bar-segs" />
        </div>
      </div>
      <div style={{display:'flex', justifyContent:'space-between', marginTop:8, fontSize:9, color:'#aaccff', letterSpacing:1}}>
        <span>NET: <span style={{color: net >= 0 ? '#33ff88' : '#ff4d4d'}}>{net >= 0 ? '+' : ''}{net.toFixed(1)}/s</span></span>
        <span className={critical ? 'blink' : ''} style={{color: critical ? '#ff4d4d' : '#33ff88'}}>● {status}</span>
      </div>
    </div>
  );
}

function SourceCard({ source, state, conditions, onToggle, disabled }){
  // compute effective output given conditions
  const m = source.modifiers;
  let mult = 1;
  mult *= (conditions.phase === 'day' ? m.day : m.night);
  if (conditions.storm) mult *= m.storm;
  if (conditions.temp === 'cold') mult *= m.cold;
  if (conditions.temp === 'hot') mult *= m.hot;
  const effective = (source.baseOutput * mult).toFixed(1);

  const fuelOut = state.fuel !== null && state.fuel <= 0;
  const isDisabled = disabled || fuelOut;
  const efficient = mult >= 1.5;
  const dead = mult <= 0.1;

  return (
    <div
      className={"source-card " + (state.on ? 'active' : '') + (isDisabled ? ' disabled' : '')}
      onClick={()=> !isDisabled && onToggle(source.id)}
      style={{ width:'100%', height:'100%' }}
    >
      <div style={{display:'flex', alignItems:'flex-start', gap:10, height:'100%'}}>
        <div style={{color: source.color, flexShrink:0, marginTop:2}}>
          <PxIcon kind={source.icon} size={56} animate={state.on}/>
        </div>
        <div style={{flex:1, minWidth:0, display:'flex', flexDirection:'column'}}>
          <div style={{fontSize:11, color: source.color, letterSpacing:1, marginBottom:5}}>
            {source.short}
          </div>

          {/* output */}
          <div className="vt" style={{fontSize:16, color:'var(--white)', lineHeight:1.2, marginBottom:4}}>
            <span style={{color:'#aaccff'}}>OUT:</span> <span style={{color: dead ? '#ff4d4d' : efficient ? '#33ff88' : '#ffcc33'}}>+{effective}/s</span>
            {mult !== 1 && (
              <span style={{color:'#aaccff', fontSize:13}}> (×{mult.toFixed(1)})</span>
            )}
          </div>

          {/* fuel bar */}
          {state.fuel !== null ? (
            <div style={{marginBottom:6}}>
              <div style={{display:'flex', justifyContent:'space-between', fontSize:8, color:'#aaccff', marginBottom:2}}>
                <span>FUEL</span>
                <span style={{color: state.fuel < 20 ? '#ff4d4d' : '#aaccff'}}>{Math.floor(state.fuel)}/{source.fuelMax}</span>
              </div>
              <div style={{background:'#000', border:'1px solid #6a6a82', height:8, padding:1}}>
                <div style={{
                  height:'100%',
                  width: `${(state.fuel / source.fuelMax)*100}%`,
                  background: state.fuel < 20 ? '#ff4d4d' : source.color,
                  transition:'width 0.2s'
                }}/>
              </div>
            </div>
          ) : (
            <div className="vt" style={{fontSize:14, color:'#33ff88', marginBottom:6}}>
              ∞ UNLIMITED FUEL
            </div>
          )}

          {/* status / toggle hint */}
          <div style={{marginTop:'auto', fontSize:9, letterSpacing:1, color: state.on ? '#33ff88' : '#aaccff'}}>
            {fuelOut ? <span style={{color:'#ff4d4d'}} className="blink">⚠ NO FUEL</span> :
             state.on ? <span className="blink">► ONLINE</span> :
             <span>► CLICK TO ACTIVATE</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN GAME COMPONENT =====================
function PlayingScreen({ onEnd, onPause }){
  const [energy, setEnergy] = useState(70);
  const [time, setTime] = useState(0);
  const [score, setScore] = useState(0);
  const [conditions, setConditions] = useState(()=> rollConditions());
  const [conditionTimer, setConditionTimer] = useState(15);
  const [events, setEvents] = useState([
    { t:0, text:'Outpost LUNERGY-1 online.', color:'#33ff88' },
    { t:0, text:'Awaiting power configuration…', color:'#ffcc33' },
  ]);
  const [factSource, setFactSource] = useState(null);
  const factTimerRef = useRef(null);

  // Per-source state
  const [sourceState, setSourceState] = useState(()=> {
    const s = {};
    SOURCES.forEach(src => {
      s[src.id] = { on:false, fuel: src.fuelMax };
    });
    return s;
  });

  // Compute net energy per second
  const net = useMemo(()=>{
    let gain = 0;
    SOURCES.forEach(src => {
      const st = sourceState[src.id];
      if(!st.on) return;
      if(st.fuel !== null && st.fuel <= 0) return;
      let mult = 1;
      mult *= (conditions.phase === 'day' ? src.modifiers.day : src.modifiers.night);
      if (conditions.storm) mult *= src.modifiers.storm;
      if (conditions.temp === 'cold') mult *= src.modifiers.cold;
      if (conditions.temp === 'hot') mult *= src.modifiers.hot;
      gain += src.baseOutput * mult;
    });
    const drain = 7; // base consumption
    return gain - drain;
  }, [sourceState, conditions]);

  const status = energy <= 0 ? 'OFFLINE' : net > 1 ? 'STABLE' : net < -1 ? 'DRAINING' : 'BALANCED';

  // Push a log event
  const log = useCallback((text, color='#aaccff')=>{
    setEvents(prev => {
      const next = [...prev, { t: Math.floor(time), text, color }];
      return next.slice(-20);
    });
  }, [time]);

  // Toggle source
  const toggleSource = useCallback((id)=>{
    setSourceState(prev => {
      const cur = prev[id];
      const next = { ...prev, [id]: { ...cur, on: !cur.on } };
      const src = SOURCES.find(s=>s.id===id);
      if(!cur.on){
        // turning on — show fact
        if(factTimerRef.current) clearTimeout(factTimerRef.current);
        setFactSource(src);
        factTimerRef.current = setTimeout(()=> setFactSource(null), 7000);
        log(`> ${src.short} activated.`, src.color);
      } else {
        log(`> ${src.short} deactivated.`, '#aaccff');
      }
      return next;
    });
  }, [log]);

  // Update background according to conditions
  useEffect(()=>{
    if(window.__lunergyBg){
      window.__lunergyBg.setDay(conditions.phase === 'day' ? 1 : 0);
      window.__lunergyBg.setStorm(conditions.storm ? 1 : 0);
    }
  }, [conditions]);

  // Main game tick — 10 fps for state updates
  useEffect(()=>{
    let alive = true;
    let last = performance.now();
    let condCountdown = 15;

    function loop(now){
      if(!alive) return;
      const dt = (now - last) / 1000;
      last = now;

      // Tick condition timer
      condCountdown -= dt;
      if(condCountdown <= 0){
        condCountdown = 14 + Math.random()*6;
        setConditions(prev => {
          const next = rollConditions(prev);
          // logs
          setEvents(ev => {
            const newE = [...ev];
            if(next.phase !== prev.phase)
              newE.push({ t: Math.floor(timeRef.current), text: `${next.phase === 'day' ? '☀ Sunrise' : '☾ Lunar night'} begins.`, color: next.phase === 'day' ? '#ffcc33' : '#66e0ff' });
            if(next.storm && !prev.storm)
              newE.push({ t: Math.floor(timeRef.current), text: '⚠ Dust storm incoming!', color: '#ff8833' });
            if(next.storm === false && prev.storm)
              newE.push({ t: Math.floor(timeRef.current), text: '✓ Storm clears.', color: '#33ff88' });
            if(next.temp !== prev.temp)
              newE.push({ t: Math.floor(timeRef.current), text: `Temperature: ${next.temp === 'cold' ? '-180°C frigid' : next.temp === 'hot' ? '+120°C scorching' : '+20°C nominal'}.`, color: '#aaccff' });
            return newE.slice(-20);
          });
          return next;
        });
      }
      setConditionTimer(condCountdown);

      // tick time + energy
      timeRef.current += dt;
      setTime(t => t + dt);

      // compute net using ref-captured state
      const sState = sourceStateRef.current;
      const cond = conditionsRef.current;
      let gain = 0;
      SOURCES.forEach(src => {
        const st = sState[src.id];
        if(!st.on) return;
        if(st.fuel !== null && st.fuel <= 0) return;
        let mult = 1;
        mult *= (cond.phase === 'day' ? src.modifiers.day : src.modifiers.night);
        if (cond.storm) mult *= src.modifiers.storm;
        if (cond.temp === 'cold') mult *= src.modifiers.cold;
        if (cond.temp === 'hot') mult *= src.modifiers.hot;
        gain += src.baseOutput * mult;
      });
      const drain = 7;
      const delta = (gain - drain) * dt;

      // burn fuel
      let fuelUpdates = null;
      SOURCES.forEach(src => {
        const st = sState[src.id];
        if(!st.on || st.fuel === null) return;
        const newFuel = Math.max(0, st.fuel - src.drainRate * dt);
        if(!fuelUpdates) fuelUpdates = { ...sState };
        fuelUpdates[src.id] = { ...st, fuel: newFuel };
        if(newFuel <= 0 && st.fuel > 0){
          setEvents(ev => [...ev, { t: Math.floor(timeRef.current), text: `⚠ ${src.short} out of fuel!`, color:'#ff4d4d' }].slice(-20));
          fuelUpdates[src.id].on = false;
        }
      });
      if(fuelUpdates){
        sourceStateRef.current = fuelUpdates;
        setSourceState(fuelUpdates);
      }

      setEnergy(e => {
        const n = Math.max(0, Math.min(100, e + delta));
        if(n <= 0 && e > 0){
          alive = false;
          setTimeout(()=> onEnd({ time: timeRef.current, score: scoreRef.current }), 100);
        }
        return n;
      });

      // score: while energy > 0, gain (1 + efficiencyBonus) points per second
      const scoreGain = (10 + Math.max(0, gain - drain) * 2) * dt;
      setScore(s => {
        const ns = s + scoreGain;
        scoreRef.current = ns;
        return ns;
      });

      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
    return ()=>{ alive = false; };
  }, []);

  // refs to keep loop in sync with state
  const sourceStateRef = useRef(sourceState);
  const conditionsRef = useRef(conditions);
  const timeRef = useRef(0);
  const scoreRef = useRef(0);
  useEffect(()=>{ sourceStateRef.current = sourceState; }, [sourceState]);
  useEffect(()=>{ conditionsRef.current = conditions; }, [conditions]);

  // Refuel button
  const refuel = useCallback((id)=>{
    setSourceState(prev => {
      const src = SOURCES.find(s=>s.id===id);
      if(scoreRef.current < 100) return prev;
      scoreRef.current -= 100;
      setScore(s => Math.max(0, s - 100));
      log(`+ ${src.short} refueled (-100 pts).`, '#33ff88');
      return { ...prev, [id]: { ...prev[id], fuel: src.fuelMax } };
    });
  }, [log]);

  const damaged = energy < 30;

  return (
    <div style={{position:'absolute', inset:0}}>
      <TopHUD score={Math.floor(score)} time={time} conditions={conditions} />

      <EnergyDisplay energy={energy} net={net} status={status} />

      {/* Condition timer + base art in the middle */}
      <div style={{position:'absolute', left:0, right:0, top:130, display:'flex', justifyContent:'center', zIndex:3, pointerEvents:'none'}}>
        <div style={{textAlign:'center'}}>
          <div className="vt" style={{fontSize:18, color:'var(--gold)', letterSpacing:2}}>
            ⟳ NEXT CONDITION SHIFT IN <span style={{color:'#fff'}}>{Math.ceil(conditionTimer)}s</span>
          </div>
        </div>
      </div>

      {/* Base art positioned over the moon surface */}
      <div style={{position:'absolute', left:'50%', top:330, transform:'translateX(-50%)', zIndex:3}}>
        <MoonBase damaged={damaged} />
        {damaged && (
          <div className="blink" style={{textAlign:'center', marginTop:8, fontSize:11, color:'#ff4d4d', letterSpacing:2}}>
            ⚠ CRITICAL ⚠
          </div>
        )}
      </div>

      <EventLog events={events} />

      <FactToast fact={factSource?.fact} source={factSource} />

      {/* Source cards row at bottom */}
      <div style={{position:'absolute', bottom:24, left:24, right:24, zIndex:5}}>
        <div style={{fontSize:11, color:'var(--gold)', letterSpacing:2, marginBottom:10, textShadow:'2px 2px 0 #000'}}>
          ▌POWER SOURCES — CLICK TO TOGGLE
        </div>
        <div style={{display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16}}>
          {SOURCES.map(src => (
            <div key={src.id} style={{position:'relative', height:160}}>
              <SourceCard
                source={src}
                state={sourceState[src.id]}
                conditions={conditions}
                onToggle={toggleSource}
              />
              {sourceState[src.id].fuel !== null && sourceState[src.id].fuel < src.fuelMax && (
                <button
                  onClick={(e)=>{ e.stopPropagation(); refuel(src.id); }}
                  disabled={Math.floor(score) < 100}
                  style={{
                    position:'absolute', bottom:6, right:6,
                    fontFamily:"'Press Start 2P'", fontSize:7,
                    padding:'4px 6px',
                    background: Math.floor(score) >= 100 ? 'var(--gold)' : '#444',
                    color: Math.floor(score) >= 100 ? '#2a1a00' : '#888',
                    border:'2px solid #000',
                    cursor: Math.floor(score) >= 100 ? 'pointer':'not-allowed',
                    letterSpacing:1
                  }}
                >REFUEL -100</button>
              )}
            </div>
          ))}
        </div>
      </div>

      <button onClick={onPause} style={{
        position:'absolute', top:24, left:'50%', transform:'translateX(-50%)',
        fontFamily:"'Press Start 2P'", fontSize:9,
        padding:'6px 10px', background:'rgba(10,10,42,0.9)', color:'#aaccff',
        border:'2px solid #6a4cff', cursor:'pointer', letterSpacing:1, zIndex:10
      }}>‖ QUIT</button>
    </div>
  );
}

function GameOverScreen({ time, score, highScore, isNewHigh, onRestart, onMenu }){
  return (
    <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(5,3,15,0.85)'}}>
      <div className="panel" style={{padding:'40px 60px', textAlign:'center', background:'rgba(10,10,42,0.95)'}}>
        <div style={{fontSize:48, color:'var(--red)', letterSpacing:6, marginBottom:20, textShadow:'4px 4px 0 #4d0000'}}>
          MISSION FAILED
        </div>
        <div className="vt" style={{fontSize:22, color:'var(--white)', marginBottom:24, lineHeight:1.4}}>
          The base ran out of energy.<br/>
          Crew evacuation initiated.
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:30, padding:'16px 24px', background:'#000', border:'2px solid var(--purple-bright)'}}>
          <div>
            <div style={{fontSize:9, color:'var(--cyan)', letterSpacing:2}}>SURVIVED</div>
            <div style={{fontSize:32, color:'var(--gold)', marginTop:4}}>{Math.floor(time)}s</div>
          </div>
          <div>
            <div style={{fontSize:9, color:'var(--cyan)', letterSpacing:2}}>FINAL SCORE</div>
            <div style={{fontSize:32, color:'var(--gold)', marginTop:4}}>{Math.floor(score)}</div>
          </div>
        </div>

        {isNewHigh && (
          <div className="blink pulse-glow" style={{fontSize:18, color:'var(--gold-bright)', marginBottom:20, letterSpacing:3}}>
            ★ NEW HIGH SCORE ★
          </div>
        )}
        {!isNewHigh && highScore > 0 && (
          <div style={{fontSize:11, color:'var(--cyan)', marginBottom:20, letterSpacing:2}}>
            HIGH SCORE: {highScore}
          </div>
        )}

        <div style={{display:'flex', gap:20, justifyContent:'center'}}>
          <button className="pxbtn gold" onClick={onRestart}>↻ TRY AGAIN</button>
          <button className="pxbtn" onClick={onMenu}>◄ MAIN MENU</button>
        </div>
      </div>
    </div>
  );
}

// ===================== ROOT =====================
function App(){
  const [screen, setScreen] = useState('title'); // title | intro | play | gameover
  const [result, setResult] = useState({ time: 0, score: 0 });
  const [highScore, setHighScore] = useState(()=> {
    try { return parseInt(localStorage.getItem('lunergy-high') || '0', 10); } catch(e){ return 0; }
  });
  const [isNewHigh, setIsNewHigh] = useState(false);

  // Set initial conditions on background
  useEffect(()=>{
    if(window.__lunergyBg){
      window.__lunergyBg.setDay(0);
      window.__lunergyBg.setStorm(0);
    }
  }, []);

  const startMission = ()=>{
    setIsNewHigh(false);
    setScreen('play');
  };
  const endMission = (r)=>{
    setResult(r);
    let nh = false;
    if(r.score > highScore){
      setHighScore(Math.floor(r.score));
      try { localStorage.setItem('lunergy-high', String(Math.floor(r.score))); } catch(e){}
      nh = true;
    }
    setIsNewHigh(nh);
    setScreen('gameover');
  };

  return (
    <>
      {screen === 'title' && <TitleScreen onStart={startMission} onIntro={()=>setScreen('intro')} highScore={highScore} />}
      {screen === 'intro' && <IntroScreen onBack={()=>setScreen('title')} onStart={startMission} />}
      {screen === 'play' && <PlayingScreen onEnd={endMission} onPause={()=> setScreen('title')} />}
      {screen === 'gameover' && <GameOverScreen time={result.time} score={result.score} highScore={highScore} isNewHigh={isNewHigh} onRestart={startMission} onMenu={()=>setScreen('title')} />}
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
