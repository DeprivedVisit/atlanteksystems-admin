import { useState, useEffect, useRef } from "react";

const QUESTS = {
  morning:  { label:"🌅 Mañana",       color:"#f59e0b", tasks:[
    { id:"wake",       label:"⏰ Alarma — Agua + Noticias",      xp:10 },
    { id:"shower",     label:"🚿 Baño + Café",                   xp:15 },
    { id:"breakfast",  label:"🍳 Desayuno + Agenda del día",     xp:20 },
  ]},
  learning: { label:"📚 Aprendizaje",   color:"#8b5cf6", tasks:[
    { id:"netacad",    label:"🖥️ Netacad — 1 hora",             xp:50 },
    { id:"openenglish",label:"🗣️ Open English — 1 hora",        xp:50 },
    { id:"coding",     label:"👨‍💻 Programación — 1 hora",       xp:50 },
    { id:"duolingo",   label:"🦜 Duolingo diario",               xp:25 },
  ]},
  work:     { label:"🏠 Home Office",   color:"#3b82f6", tasks:[
    { id:"work1", label:"💻 Bloque 1 (9:30–12:30)", xp:80 },
    { id:"work2", label:"💻 Bloque 2 (2–5pm)",      xp:80 },
    { id:"work3", label:"💻 Bloque 3 (6–9pm)",      xp:80 },
    { id:"work4", label:"💻 Bloque 4 sprint",        xp:60 },
  ]},
  free:     { label:"🌇 Tiempo Libre",  color:"#10b981", tasks:[
    { id:"sunset",  label:"🌅 Sunset + Smoke",  xp:20 },
    { id:"pokemon", label:"🎮 Pokémon GO",       xp:15 },
  ]},
  projects: { label:"🗂️ Proyectos",    color:"#ef4444", tasks:[
    { id:"barber",   label:"💈 armandojosebarber",            xp:100 },
    { id:"ecopollo", label:"🍗 ecopollo-cartago",             xp:100 },
    { id:"loop",     label:"🌐 loop-landings.com",            xp:100 },
    { id:"licores",  label:"🥃 rblicorescr",                  xp:100 },
    { id:"rflx",     label:"🚗 rflxdetail",                   xp:100 },
    { id:"tattoo",   label:"🎨 App Citas — Tatuajes",         xp:150 },
    { id:"salon",    label:"💇 App Citas — Salón de Belleza", xp:150 },
  ]},
  night:    { label:"🌙 Cierre",        color:"#6366f1", tasks:[
    { id:"review", label:"✅ Revisión + Plan mañana", xp:30 },
    { id:"news",   label:"📺 Noticias para dormir",   xp:10 },
    { id:"sleep",  label:"😴 Dormir 8 horas",         xp:40 },
  ]},
};

const ALL_TASKS = Object.values(QUESTS).flatMap(q => q.tasks);

const ACHIEVEMENTS = [
  { id:"first_day",     icon:"🌱", label:"Primer Día",           desc:"Completa tu primer día",                     check:s=> s.totalDays>=1 },
  { id:"perfect_day",   icon:"⭐", label:"Día Perfecto",          desc:"100% en un día",                             check:s=> s.perfectDays>=1 },
  { id:"week_streak",   icon:"🔥", label:"Semana Imparable",      desc:"7 días seguidos",                            check:s=> s.maxStreak>=7 },
  { id:"month_streak",  icon:"🌙", label:"Mes de Hierro",         desc:"30 días seguidos",                           check:s=> s.maxStreak>=30 },
  { id:"streak_100",    icon:"💯", label:"Centurión",             desc:"100 días de racha",                          check:s=> s.maxStreak>=100 },
  { id:"level5",        icon:"⚔️", label:"Aventurero",           desc:"Llega al nivel 5",                           check:s=> s.level>=5 },
  { id:"level10",       icon:"🏆", label:"Veterano",              desc:"Llega al nivel 10",                          check:s=> s.level>=10 },
  { id:"level18",       icon:"👑", label:"Leyenda",               desc:"Llega al nivel 18",                          check:s=> s.level>=18 },
  { id:"xp1000",        icon:"💎", label:"Mil XP",                desc:"Acumula 1,000 XP totales",                   check:s=> s.totalXP>=1000 },
  { id:"xp10000",       icon:"🌟", label:"Diez Mil XP",           desc:"Acumula 10,000 XP",                          check:s=> s.totalXP>=10000 },
  { id:"all_learning",  icon:"📚", label:"Triple Estudio",        desc:"3 cursos completos en un día",               check:s=> s.allLearningDays>=1 },
  { id:"duolingo7",     icon:"🦜", label:"Streak Duolingo x7",    desc:"Duolingo 7 días seguidos",                   check:s=> s.duolingoStreak>=7 },
  { id:"netacad10",     icon:"🖥️", label:"Networker",            desc:"Netacad 10 días",                            check:s=> s.netacadDays>=10 },
  { id:"coding30",      icon:"👨‍💻", label:"Code Monkey",          desc:"Programa 30 días",                           check:s=> s.codingDays>=30 },
  { id:"proj3",         icon:"🚀", label:"Multi-proyecto",        desc:"3 proyectos en un día",                      check:s=> s.maxProjDay>=3 },
  { id:"proj_all",      icon:"🏅", label:"Cierra Todo",           desc:"Completa los 7 proyectos",                   check:s=> s.projectsDone>=7 },
  { id:"tattoo_done",   icon:"🎨", label:"Artista Digital",       desc:"Termina la app de tatuajes",                 check:s=> s.tattooCheck },
  { id:"salon_done",    icon:"💇", label:"Beauty Tech",           desc:"Termina la app de salón",                    check:s=> s.salonCheck },
  { id:"allwork",       icon:"💼", label:"Full Day Grind",        desc:"4 bloques de trabajo en un día",             check:s=> s.allWorkDays>=1 },
  { id:"work30",        icon:"🏠", label:"Home Office Pro",       desc:"30 días completando todos los bloques",      check:s=> s.allWorkDays>=30 },
  { id:"early_bird",    icon:"🐦", label:"Early Bird",            desc:"Mañana completa 10 días",                    check:s=> s.morningDays>=10 },
  { id:"night_owl",     icon:"🦉", label:"Night Owl",             desc:"Cierre nocturno 10 días",                    check:s=> s.nightDays>=10 },
  { id:"pokemon_hunter",icon:"🎮", label:"Pokémon Hunter",        desc:"Pokémon GO 20 días",                         check:s=> s.pokemonDays>=20 },
  { id:"sunset_lover",  icon:"🌇", label:"Sunset Lover",          desc:"Ve el sunset 15 días",                       check:s=> s.sunsetDays>=15 },
];

function xpToLevel(xp) {
  let level=1, threshold=200, accumulated=0;
  while(xp >= accumulated+threshold){ accumulated+=threshold; level++; threshold=Math.floor(threshold*1.18); }
  return { level, progress:xp-accumulated, threshold };
}

const TITLES = [[1,"Novato Digital"],[3,"Aprendiz Constante"],[5,"Trabajador Incansable"],[8,"Maestro de Rutinas"],[12,"Desarrollador Élite"],[18,"Leyenda Productiva"]];
function getTitle(lvl){ let t=TITLES[0][1]; for(const [l,n] of TITLES) if(lvl>=l) t=n; return t; }

function load(key,def){ try{ const v=localStorage.getItem(key); return v?JSON.parse(v):def; }catch{return def;} }
function save(key,val){ try{ localStorage.setItem(key,JSON.stringify(val)); }catch{} }

function computeStats(history,level,totalXP){
  let maxStreak=0,streak=0,perfectDays=0,totalDays=history.length;
  let allLearningDays=0,allWorkDays=0,morningDays=0,nightDays=0;
  let duolingoStreak=0,netacadDays=0,codingDays=0,pokemonDays=0,sunsetDays=0;
  let maxProjDay=0,projectsDone=0,tattooCheck=false,salonCheck=false;
  let prev=null;
  history.forEach(day=>{
    const d=new Date(day.date);
    if(day.completionPct===100) perfectDays++;
    if(prev){ const diff=(d-new Date(prev))/86400000; if(diff<=1){streak++;maxStreak=Math.max(maxStreak,streak);}else streak=1; }else{streak=1;maxStreak=1;}
    prev=day.date;
    const c=day.checked||{};
    if(c.netacad&&c.openenglish&&c.coding) allLearningDays++;
    if(c.work1&&c.work2&&c.work3&&c.work4) allWorkDays++;
    if(c.wake&&c.shower&&c.breakfast) morningDays++;
    if(c.review&&c.news&&c.sleep) nightDays++;
    if(c.duolingo) duolingoStreak++; else duolingoStreak=0;
    if(c.netacad) netacadDays++;
    if(c.coding) codingDays++;
    if(c.pokemon) pokemonDays++;
    if(c.sunset) sunsetDays++;
    if(c.tattoo){tattooCheck=true;projectsDone++;}
    if(c.salon){salonCheck=true;projectsDone++;}
    const pd=["barber","ecopollo","loop","licores","rflx","tattoo","salon"].filter(id=>c[id]).length;
    maxProjDay=Math.max(maxProjDay,pd);
  });
  return {level,totalXP,totalDays,perfectDays,streak,maxStreak,allLearningDays,allWorkDays,morningDays,nightDays,duolingoStreak,netacadDays,codingDays,pokemonDays,sunsetDays,maxProjDay,projectsDone,tattooCheck,salonCheck};
}

function XPPopup({amount,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,1100);return()=>clearTimeout(t);},[]);
  return <div style={{position:"fixed",top:"40%",left:"50%",zIndex:9999,pointerEvents:"none",animation:"xpPop 1.1s ease forwards",fontSize:"2.8rem",fontWeight:900,color:"#fbbf24",textShadow:"0 0 30px #f59e0b,0 2px 0 #000",fontFamily:"'Black Ops One',cursive",letterSpacing:3}}>+{amount} XP</div>;
}

function AchToast({ach,onDone}){
  useEffect(()=>{const t=setTimeout(onDone,3000);return()=>clearTimeout(t);},[]);
  return(
    <div style={{position:"fixed",bottom:28,left:"50%",transform:"translateX(-50%)",zIndex:9998,background:"linear-gradient(135deg,#1e1b4b,#312e81)",border:"1px solid #6366f1",borderRadius:16,padding:"14px 22px",display:"flex",alignItems:"center",gap:14,boxShadow:"0 0 40px #6366f188",animation:"slideUp 0.4s ease",minWidth:270}}>
      <span style={{fontSize:32}}>{ach.icon}</span>
      <div>
        <div style={{fontSize:9,color:"#a5b4fc",letterSpacing:3,fontFamily:"'Black Ops One',cursive"}}>LOGRO DESBLOQUEADO</div>
        <div style={{fontSize:15,fontWeight:700,color:"#f9fafb",fontFamily:"'Rajdhani',sans-serif"}}>{ach.label}</div>
        <div style={{fontSize:11,color:"#818cf8"}}>{ach.desc}</div>
      </div>
    </div>
  );
}

function TaskRow({task,checked,onToggle,color}){
  return(
    <button onClick={()=>onToggle(task.id)} style={{display:"flex",alignItems:"center",gap:12,width:"100%",background:checked?`${color}18`:"transparent",border:"none",cursor:"pointer",padding:"10px 14px",borderRadius:10,transition:"background 0.15s"}}>
      <div style={{width:22,height:22,borderRadius:6,flexShrink:0,transition:"all 0.2s",border:checked?`2px solid ${color}`:"2px solid #374151",background:checked?color:"transparent",boxShadow:checked?`0 0 10px ${color}88`:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {checked&&<span style={{color:"#000",fontSize:13,fontWeight:900}}>✓</span>}
      </div>
      <span style={{flex:1,textAlign:"left",fontSize:14,color:checked?"#6b7280":"#e5e7eb",textDecoration:checked?"line-through":"none",fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{task.label}</span>
      <span style={{fontSize:11,fontFamily:"'Black Ops One',cursive",color:checked?color:"#4b5563",background:checked?`${color}22`:"#1f2937",padding:"2px 7px",borderRadius:20,border:`1px solid ${checked?color+"44":"#374151"}`}}>+{task.xp}</span>
    </button>
  );
}

function QuestSection({id,quest,checked,onToggle}){
  const [open,setOpen]=useState(true);
  const done=quest.tasks.filter(t=>checked[t.id]).length;
  const total=quest.tasks.length;
  const secXP=quest.tasks.filter(t=>checked[t.id]).reduce((s,t)=>s+t.xp,0);
  return(
    <div style={{background:"#111827",border:`1px solid ${quest.color}33`,borderRadius:14,overflow:"hidden",marginBottom:10,boxShadow:done===total?`0 0 20px ${quest.color}33`:"none",transition:"box-shadow 0.4s"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",display:"flex",alignItems:"center",gap:12,padding:"13px 16px",background:"none",border:"none",cursor:"pointer",borderBottom:open?`1px solid ${quest.color}22`:"none"}}>
        <div style={{width:8,height:8,borderRadius:"50%",flexShrink:0,background:quest.color,boxShadow:`0 0 8px ${quest.color}`}}/>
        <span style={{flex:1,textAlign:"left",fontSize:15,fontWeight:700,color:"#f9fafb",fontFamily:"'Rajdhani',sans-serif",letterSpacing:1}}>{quest.label}</span>
        {done===total&&<span style={{fontSize:12}}>✅</span>}
        <span style={{fontSize:11,color:quest.color,fontFamily:"'Black Ops One',cursive"}}>{secXP}XP</span>
        <div style={{fontSize:11,color:"#9ca3af",background:"#1f2937",padding:"2px 8px",borderRadius:20,fontFamily:"'Rajdhani',sans-serif",fontWeight:600}}>{done}/{total}</div>
        <span style={{color:"#6b7280",fontSize:10}}>{open?"▲":"▼"}</span>
      </button>
      {open&&<div style={{padding:"6px 4px"}}>{quest.tasks.map(task=><TaskRow key={task.id} task={task} checked={!!checked[task.id]} onToggle={onToggle} color={quest.color}/>)}</div>}
    </div>
  );
}

export default function GarettRPG(){
  const [tab,setTab]=useState("today");
  const [checked,setChecked]=useState(()=>load("grpg-checked",{}));
  const [totalXP,setTotalXP]=useState(()=>load("grpg-xp",0));
  const [history,setHistory]=useState(()=>load("grpg-history",[]));
  const [unlocked,setUnlocked]=useState(()=>new Set(load("grpg-unlocked",[])));
  const [popup,setPopup]=useState(null);
  const [achToast,setAchToast]=useState(null);
  const popKey=useRef(0);
  const toastQueue=useRef([]);
  const showingToast=useRef(false);

  const currentXP=ALL_TASKS.filter(t=>checked[t.id]).reduce((s,t)=>s+t.xp,0);
  const grandXP=totalXP+currentXP;
  const {level,progress,threshold}=xpToLevel(grandXP);
  const title=getTitle(level);
  const pct=Math.min(100,Math.round((progress/threshold)*100));
  const todayDone=ALL_TASKS.filter(t=>checked[t.id]).length;
  const todayTotal=ALL_TASKS.length;
  const dayPct=Math.round((todayDone/todayTotal)*100);

  const streak=(()=>{
    if(!history.length) return 0;
    let s=1,prev=new Date(history[history.length-1]?.date);
    for(let i=history.length-2;i>=0;i--){
      const d=new Date(history[i].date);
      if((prev-d)/86400000<=1){s++;prev=d;}else break;
    }
    return s;
  })();

  const stats=computeStats(history,level,grandXP);
  const streakColor=streak>=7?"#ef4444":streak>=3?"#f59e0b":"#6b7280";

  function drainToasts(){
    if(showingToast.current||!toastQueue.current.length) return;
    showingToast.current=true;
    setAchToast(toastQueue.current.shift());
  }

  function checkAchievements(newUnlocked,statsNow){
    const toAdd=[];
    for(const a of ACHIEVEMENTS){
      if(!newUnlocked.has(a.id)&&a.check(statsNow)){newUnlocked.add(a.id);toAdd.push(a);}
    }
    if(toAdd.length){
      toastQueue.current.push(...toAdd);
      drainToasts();
      save("grpg-unlocked",[...newUnlocked]);
      setUnlocked(new Set(newUnlocked));
    }
  }

  function handleToggle(id){
    const task=ALL_TASKS.find(t=>t.id===id);
    if(!task) return;
    const wasChecked=!!checked[id];
    const next={...checked,[id]:!checked[id]};
    setChecked(next); save("grpg-checked",next);
    if(!wasChecked){
      popKey.current++;
      setPopup({key:popKey.current,xp:task.xp});
      const tempXP=Object.keys(next).filter(k=>next[k]).reduce((s,k)=>{const t=ALL_TASKS.find(x=>x.id===k);return t?s+t.xp:s;},totalXP);
      const {level:lv}=xpToLevel(tempXP);
      checkAchievements(new Set(unlocked),computeStats(history,lv,tempXP));
    }
  }

  function resetDay(){
    const earned=ALL_TASKS.filter(t=>checked[t.id]).reduce((s,t)=>s+t.xp,0);
    const newTotal=totalXP+earned;
    const newHistory=[...history,{date:new Date().toISOString(),completionPct:dayPct,checked:{...checked}}];
    setTotalXP(newTotal); save("grpg-xp",newTotal);
    setHistory(newHistory); save("grpg-history",newHistory);
    setChecked({}); save("grpg-checked",{});
    const {level:lv}=xpToLevel(newTotal);
    checkAchievements(new Set(unlocked),computeStats(newHistory,lv,newTotal));
  }

  return(
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Black+Ops+One&family=Rajdhani:wght@400;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0} body{background:#030712}
        @keyframes xpPop{0%{opacity:0;transform:translate(-50%,-50%) scale(0.4)}30%{opacity:1;transform:translate(-50%,-80%) scale(1.3)}70%{opacity:1;transform:translate(-50%,-95%) scale(1)}100%{opacity:0;transform:translate(-50%,-115%) scale(0.8)}}
        @keyframes slideUp{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        @keyframes barPulse{0%,100%{box-shadow:0 0 8px #3b82f6aa}50%{box-shadow:0 0 22px #3b82f6}}
        ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:#030712} ::-webkit-scrollbar-thumb{background:#1f2937;border-radius:3px}
      `}</style>

      {popup&&<XPPopup key={popup.key} amount={popup.xp} onDone={()=>setPopup(null)}/>}
      {achToast&&<AchToast ach={achToast} onDone={()=>{setAchToast(null);showingToast.current=false;setTimeout(drainToasts,400);}}/>}

      <div style={{minHeight:"100vh",background:"#030712",fontFamily:"'Rajdhani',sans-serif",color:"#f9fafb",backgroundImage:"radial-gradient(ellipse at 15% 10%,#1e3a5f28 0%,transparent 55%),radial-gradient(ellipse at 85% 90%,#37309322 0%,transparent 55%)"}}>
        <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:1,backgroundImage:"repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px)"}}/>
        <div style={{maxWidth:560,margin:"0 auto",padding:"20px 14px 40px",position:"relative",zIndex:2}}>

          {/* HEADER */}
          <div style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:20,padding:"24px 20px 18px",marginBottom:14,boxShadow:"0 0 50px #3b82f610"}}>
            <div style={{fontSize:9,letterSpacing:4,color:"#4b5563",fontFamily:"'Black Ops One',cursive",marginBottom:8,textAlign:"center"}}>GARETT QUEST SYSTEM</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:16,marginBottom:12}}>
              <div style={{width:64,height:64,borderRadius:16,background:"linear-gradient(135deg,#f59e0b22,#ef444422)",border:"2px solid #f59e0b44",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <span style={{fontSize:26,fontFamily:"'Black Ops One',cursive",background:"linear-gradient(135deg,#f59e0b,#ef4444)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>L{level}</span>
              </div>
              <div>
                <div style={{fontSize:19,fontWeight:700,color:"#f9fafb",fontFamily:"'Black Ops One',cursive",letterSpacing:1}}>{title}</div>
                <div style={{fontSize:11,color:"#6b7280",letterSpacing:2}}>{grandXP.toLocaleString()} XP TOTAL</div>
              </div>
            </div>
            <div style={{marginBottom:4}}>
              <div style={{height:10,background:"#1f2937",borderRadius:5,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:5,width:`${pct}%`,background:"linear-gradient(90deg,#3b82f6,#8b5cf6)",animation:"barPulse 2s ease infinite",transition:"width 0.5s ease"}}/>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#4b5563",marginTop:3,fontFamily:"'Black Ops One',cursive"}}>
                <span>{progress} / {threshold} XP</span><span>→ LVL {level+1}</span>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginTop:14}}>
              {[{label:"XP HOY",value:currentXP,color:"#f59e0b"},{label:"TAREAS",value:`${todayDone}/${todayTotal}`,color:"#3b82f6"},{label:"RACHA",value:`${streak}🔥`,color:streakColor},{label:"LOGROS",value:`${unlocked.size}/${ACHIEVEMENTS.length}`,color:"#a78bfa"}].map(s=>(
                <div key={s.label} style={{background:"#111827",borderRadius:10,padding:"9px 6px",border:`1px solid ${s.color}33`,textAlign:"center"}}>
                  <div style={{fontSize:14,fontWeight:900,color:s.color,fontFamily:"'Black Ops One',cursive",lineHeight:1.1}}>{s.value}</div>
                  <div style={{fontSize:8,color:"#6b7280",letterSpacing:1.5,marginTop:2}}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* DAY PROGRESS */}
          <div style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:12,padding:"11px 16px",marginBottom:12,display:"flex",alignItems:"center",gap:12}}>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#6b7280",letterSpacing:2,marginBottom:5,fontFamily:"'Black Ops One',cursive"}}>PROGRESO DEL DÍA</div>
              <div style={{height:8,background:"#1f2937",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",borderRadius:4,width:`${dayPct}%`,background:dayPct===100?"linear-gradient(90deg,#f59e0b,#ef4444)":"linear-gradient(90deg,#10b981,#3b82f6)",transition:"width 0.4s ease"}}/>
              </div>
            </div>
            <div style={{fontSize:22,fontWeight:900,color:dayPct===100?"#fbbf24":"#9ca3af",fontFamily:"'Black Ops One',cursive"}}>{dayPct}%</div>
          </div>

          {/* TABS */}
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:14}}>
            {[{id:"today",label:"⚔️ Hoy"},{id:"achievements",label:"🏆 Logros"},{id:"stats",label:"📊 Stats"}].map(t=>(
              <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"9px 4px",borderRadius:10,border:`1px solid ${tab===t.id?"#3b82f644":"#1f2937"}`,cursor:"pointer",fontFamily:"'Black Ops One',cursive",fontSize:11,letterSpacing:0.5,background:tab===t.id?"linear-gradient(135deg,#1e3a5f,#1e1b4b)":"#0d1117",color:tab===t.id?"#93c5fd":"#4b5563",transition:"all 0.2s"}}>{t.label}</button>
            ))}
          </div>

          {/* TODAY */}
          {tab==="today"&&<>
            {Object.entries(QUESTS).map(([id,quest])=><QuestSection key={id} id={id} quest={quest} checked={checked} onToggle={handleToggle}/>)}
            <button onClick={resetDay} style={{width:"100%",padding:"14px",marginTop:6,marginBottom:8,background:"#0d1117",border:"1px solid #374151",borderRadius:12,color:"#6b7280",fontSize:11,cursor:"pointer",letterSpacing:2,fontFamily:"'Black Ops One',cursive",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="#ef4444";e.currentTarget.style.color="#ef4444"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="#374151";e.currentTarget.style.color="#6b7280"}}>
              ⚔️ CERRAR DÍA Y GUARDAR XP
            </button>
          </>}

          {/* ACHIEVEMENTS */}
          {tab==="achievements"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {ACHIEVEMENTS.map(a=>{
              const has=unlocked.has(a.id);
              return(
                <div key={a.id} style={{background:has?"#0f172a":"#0d1117",border:`1px solid ${has?"#6366f1":"#1f2937"}`,borderRadius:14,padding:"14px 12px",opacity:has?1:0.5,transition:"all 0.3s",boxShadow:has?"0 0 16px #6366f122":"none"}}>
                  <div style={{fontSize:26,marginBottom:8}}>{has?a.icon:"🔒"}</div>
                  <div style={{fontSize:12,fontWeight:700,color:has?"#e5e7eb":"#6b7280",fontFamily:"'Rajdhani',sans-serif",lineHeight:1.2,marginBottom:4}}>{a.label}</div>
                  <div style={{fontSize:10,color:has?"#818cf8":"#374151",lineHeight:1.4}}>{a.desc}</div>
                  {has&&<div style={{fontSize:9,color:"#4ade80",marginTop:6,letterSpacing:1}}>✓ DESBLOQUEADO</div>}
                </div>
              );
            })}
          </div>}

          {/* STATS */}
          {tab==="stats"&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
            {[
              {icon:"🔥",label:"Racha actual",   value:`${streak} días`},
              {icon:"⚡",label:"Racha máxima",   value:`${stats.maxStreak} días`},
              {icon:"⭐",label:"Días perfectos", value:stats.perfectDays},
              {icon:"📅",label:"Total días",     value:stats.totalDays},
              {icon:"💎",label:"XP total",       value:grandXP.toLocaleString()},
              {icon:"📚",label:"Días estudio",   value:stats.allLearningDays},
              {icon:"💼",label:"Días trabajo completo",value:stats.allWorkDays},
              {icon:"🖥️",label:"Días Netacad",  value:stats.netacadDays},
              {icon:"👨‍💻",label:"Días Coding",   value:stats.codingDays},
              {icon:"🦜",label:"Días Duolingo",  value:stats.duolingoStreak},
              {icon:"🎮",label:"Días Pokémon",   value:stats.pokemonDays},
              {icon:"🌇",label:"Días Sunset",    value:stats.sunsetDays},
            ].map(s=>(
              <div key={s.label} style={{background:"#0d1117",border:"1px solid #1f2937",borderRadius:14,padding:"14px 12px"}}>
                <div style={{fontSize:24,marginBottom:6}}>{s.icon}</div>
                <div style={{fontSize:20,fontWeight:900,color:"#f9fafb",fontFamily:"'Black Ops One',cursive"}}>{s.value}</div>
                <div style={{fontSize:10,color:"#6b7280",marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>}

        </div>
      </div>
    </>
  );
}
