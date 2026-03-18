"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from '../lib/supabase';

// ─── ADMIN CREDENTIALS ───────────────────────────────────────────────────────
const ADMIN_EMAIL = "admin@clearcut.io";
const ADMIN_PASSWORD = "clearcut-admin-2026";

// ─── DESIGN SYSTEM ───────────────────────────────────────────────────────────
const C = {
  bg:       "#07070F",
  bgNav:    "rgba(7,7,15,0.85)",
  bgCard:   "#0D0D1A",
  bgCard2:  "#12121F",
  bgCard3:  "#1A1A2E",
  accent:   "#7C6FFF",
  accent2:  "#4F8EFF",
  grad:     "linear-gradient(135deg, #7C6FFF, #4F8EFF)",
  gradText: "linear-gradient(135deg, #A78BFA, #60A5FA)",
  pink:     "#F472B6",
  cyan:     "#22D3EE",
  success:  "#34D399",
  warning:  "#FBBF24",
  danger:   "#F87171",
  text:     "#F1F0FA",
  textMuted:"#8887A0",
  textDim:  "#4B4A62",
  border:   "#1C1C30",
  borderL:  "#252540",
};

const gStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${C.bg}; color: ${C.text}; font-family: 'Inter', system-ui, sans-serif; overflow-x: hidden; }
  ::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #2A2A45; border-radius: 9px; }
  ::selection { background: rgba(124,111,255,0.3); }
  input, textarea, select { font-family: inherit; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes bounce { 0%,80%,100%{transform:scale(0.6);opacity:0.4}40%{transform:scale(1);opacity:1} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)} }
  @keyframes float { 0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)} }
  @keyframes marquee { from{transform:translateX(0)}to{transform:translateX(-50%)} }
  @keyframes pulse { 0%,100%{opacity:1}50%{opacity:0.5} }
  @keyframes scaleIn { from{opacity:0;transform:scale(0.95)}to{opacity:1;transform:scale(1)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(30px)}to{opacity:1;transform:translateY(0)} }
  @keyframes glow { 0%,100%{box-shadow:0 0 20px rgba(124,111,255,0.3)}50%{box-shadow:0 0 40px rgba(124,111,255,0.6)} }
  .nav-link { color: ${C.textMuted}; text-decoration:none; font-size:14px; font-weight:500; transition:color 0.2s; cursor:pointer; }
  .nav-link:hover { color: ${C.text}; }
  .btn-primary { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 22px;border-radius:10px;border:none;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;background:${C.grad};color:#fff;transition:transform 0.2s,box-shadow 0.2s,opacity 0.2s;box-shadow:0 4px 20px rgba(124,111,255,0.35); }
  .btn-primary:hover { transform:scale(1.05);box-shadow:0 8px 30px rgba(124,111,255,0.5); }
  .btn-secondary { display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:11px 22px;border-radius:10px;cursor:pointer;font-family:inherit;font-size:14px;font-weight:600;background:transparent;color:${C.text};border:1px solid ${C.borderL};transition:all 0.2s; }
  .btn-secondary:hover { background:${C.bgCard2};border-color:${C.accent};transform:scale(1.03); }
  .btn-ghost { background:none;border:none;cursor:pointer;font-family:inherit;color:${C.textMuted};transition:color 0.2s; }
  .btn-ghost:hover { color:${C.text}; }
  .card { background:${C.bgCard};border:1px solid ${C.border};border-radius:16px;padding:1.5rem; }
  .input { width:100%;padding:10px 14px;background:${C.bgCard2};border:1px solid ${C.borderL};border-radius:10px;color:${C.text};font-size:14px;font-family:inherit;outline:none;transition:border-color 0.2s,box-shadow 0.2s; }
  .input:focus { border-color:${C.accent};box-shadow:0 0 0 3px rgba(124,111,255,0.15); }
  .badge { display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;font-size:11px;font-weight:600; }
  .fade-in { animation: fadeIn 0.5s ease both; }
  .scale-in { animation: scaleIn 0.3s ease both; }
  select { background:${C.bgCard2};border:1px solid ${C.borderL};border-radius:10px;color:${C.text};padding:10px 14px;font-size:14px;font-family:inherit;outline:none;cursor:pointer; }
  select:focus { border-color:${C.accent}; }
  table { border-collapse:collapse; width:100%; }
  tr:hover td { background:rgba(255,255,255,0.02); }
`;

// ─── CURSOR FOLLOWER ──────────────────────────────────────────────────────────
function CursorFollower() {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const pos = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => {
      target.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    let raf;
    const animate = () => {
      pos.current.x += (target.current.x - pos.current.x) * 0.12;
      pos.current.y += (target.current.y - pos.current.y) * 0.12;
      if (cursorRef.current) {
        cursorRef.current.style.left = pos.current.x + "px";
        cursorRef.current.style.top = pos.current.y + "px";
      }
      raf = requestAnimationFrame(animate);
    };
    animate();
    return () => { window.removeEventListener("mousemove", move); cancelAnimationFrame(raf); };
  }, []);

  return (
    <>
      <div ref={cursorRef} style={{ position:"fixed", width:"36px", height:"36px", borderRadius:"50%", border:`1.5px solid rgba(124,111,255,0.5)`, pointerEvents:"none", zIndex:9999, transform:"translate(-50%,-50%)", transition:"width 0.2s, height 0.2s, border-color 0.2s", mixBlendMode:"difference" }} />
      <div ref={dotRef} style={{ position:"fixed", width:"5px", height:"5px", borderRadius:"50%", background:C.accent, pointerEvents:"none", zIndex:9999, transform:"translate(-50%,-50%)" }} />
    </>
  );
}

// ─── COOKIE BANNER ────────────────────────────────────────────────────────────
function CookieBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const accepted = localStorage.getItem("cc_cookies");
    if (!accepted) setTimeout(() => setShow(true), 1500);
  }, []);
  if (!show) return null;
  return (
    <div className="scale-in" style={{ position:"fixed", bottom:"24px", left:"24px", zIndex:500, maxWidth:"420px", background:C.bgCard, border:`1px solid ${C.borderL}`, borderRadius:"16px", padding:"1.25rem 1.5rem", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
      <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"6px" }}>🍪 Cookies & confidentialité</div>
      <div style={{ fontSize:"12px", color:C.textMuted, marginBottom:"1rem", lineHeight:1.6 }}>
        Nous utilisons des cookies pour améliorer votre expérience et analyser le trafic. Vos données ne sont jamais revendues.
      </div>
      <div style={{ display:"flex", gap:"8px" }}>
        <button className="btn-primary" style={{ flex:1, padding:"8px", fontSize:"12px" }} onClick={() => { localStorage.setItem("cc_cookies","true"); setShow(false); }}>Accepter</button>
        <button className="btn-secondary" style={{ flex:1, padding:"8px", fontSize:"12px" }} onClick={() => { localStorage.setItem("cc_cookies","declined"); setShow(false); }}>Refuser</button>
      </div>
    </div>
  );
}

// ─── EXIT INTENT POPUP ────────────────────────────────────────────────────────
function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const triggered = useRef(false);

  useEffect(() => {
    const shown = sessionStorage.getItem("cc_exit");
    if (shown) return;
    const handler = (e) => {
      if (e.clientY < 10 && !triggered.current) {
        triggered.current = true;
        sessionStorage.setItem("cc_exit", "1");
        setTimeout(() => setShow(true), 200);
      }
    };
    document.addEventListener("mouseleave", handler);
    return () => document.removeEventListener("mouseleave", handler);
  }, []);

  if (!show) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }} onClick={() => setShow(false)}>
      <div className="scale-in" style={{ background:C.bgCard, border:`1px solid ${C.borderL}`, borderRadius:"24px", padding:"2.5rem", maxWidth:"460px", width:"90%", textAlign:"center", position:"relative" }} onClick={e => e.stopPropagation()}>
        <button className="btn-ghost" style={{ position:"absolute", top:"16px", right:"16px", fontSize:"20px" }} onClick={() => setShow(false)}>×</button>
        <div style={{ fontSize:"40px", marginBottom:"1rem" }}>🎁</div>
        <div style={{ fontSize:"11px", color:C.accent, fontWeight:700, letterSpacing:"1px", textTransform:"uppercase", marginBottom:"8px" }}>Offre exclusive</div>
        <h2 style={{ fontSize:"1.8rem", fontWeight:800, letterSpacing:"-1px", marginBottom:"10px" }}>Attends ! Tu pars déjà ?</h2>
        <p style={{ color:C.textMuted, fontSize:"14px", lineHeight:1.7, marginBottom:"1.5rem" }}>
          Profite de <strong style={{ color:C.text }}>−20% sur ton premier mois</strong> avec le code ci-dessous. Offre valable 24h uniquement.
        </p>
        {!claimed ? (
          <>
            <div style={{ background:C.bgCard2, border:`2px dashed ${C.accent}`, borderRadius:"12px", padding:"14px", marginBottom:"1.5rem", fontFamily:"monospace", fontSize:"1.4rem", fontWeight:800, letterSpacing:"3px", color:C.accent }}>
              BIENVENUE20
            </div>
            <button className="btn-primary" style={{ width:"100%", padding:"14px", fontSize:"15px" }} onClick={() => setClaimed(true)}>
              Utiliser ce code →
            </button>
          </>
        ) : (
          <div style={{ padding:"1rem", background:"rgba(52,211,153,0.1)", border:`1px solid rgba(52,211,153,0.3)`, borderRadius:"12px", color:C.success, fontWeight:600 }}>
            ✓ Code copié ! Utilise-le au checkout.
          </div>
        )}
        <div style={{ fontSize:"11px", color:C.textDim, marginTop:"1rem" }}>Valable sur les plans Pro, Creator et Business</div>
      </div>
    </div>
  );
}

// ─── ONBOARDING MODAL ────────────────────────────────────────────────────────
function OnboardingModal({ onClose }) {
  const [step, setStep] = useState(0);
  const steps = [
    { icon:"🎬", title:"Bienvenue sur ClearCut !", desc:"ClearCut supprime automatiquement les sous-titres incrustés de tes vidéos grâce à l'IA. Zéro effort, résultat pro en quelques secondes.", color:C.accent },
    { icon:"⬆️", title:"Uploade ta vidéo", desc:"Glisse-dépose n'importe quelle vidéo (MP4, MOV, MKV). Notre IA détecte et supprime les sous-titres, même les plus complexes sur fonds animés.", color:C.accent2 },
    { icon:"⚡", title:"L'IA fait le travail", desc:"Notre modèle analyse chaque frame et reconstruit le fond vidéo là où se trouvaient les sous-titres. Traitement en moins de 60 secondes pour les courtes vidéos.", color:C.pink },
    { icon:"📥", title:"Télécharge le résultat", desc:"Ta vidéo propre est prête. Télécharge-la en HD, partage-la ou traite-en d'autres. Tes 20 crédits gratuits sont déjà disponibles !", color:C.success },
  ];
  const s = steps[step];
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:700, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(6px)" }}>
      <div className="scale-in" style={{ background:C.bgCard, border:`1px solid ${C.borderL}`, borderRadius:"24px", padding:"2.5rem", maxWidth:"480px", width:"90%", textAlign:"center" }}>
        <div style={{ fontSize:"52px", marginBottom:"1rem", animation:"float 3s ease-in-out infinite" }}>{s.icon}</div>
        <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginBottom:"1.5rem" }}>
          {steps.map((_, i) => (
            <div key={i} style={{ width: i === step ? "24px" : "6px", height:"6px", borderRadius:"999px", background: i === step ? s.color : C.borderL, transition:"all 0.3s" }} />
          ))}
        </div>
        <h2 style={{ fontSize:"1.5rem", fontWeight:800, letterSpacing:"-0.5px", marginBottom:"10px" }}>{s.title}</h2>
        <p style={{ color:C.textMuted, fontSize:"14px", lineHeight:1.8, marginBottom:"2rem" }}>{s.desc}</p>
        <div style={{ display:"flex", gap:"10px" }}>
          {step > 0 && <button className="btn-secondary" style={{ flex:1 }} onClick={() => setStep(s => s-1)}>← Retour</button>}
          <button className="btn-primary" style={{ flex:2 }} onClick={() => step < steps.length-1 ? setStep(s => s+1) : onClose()}>
            {step < steps.length-1 ? "Suivant →" : "Commencer ! 🚀"}
          </button>
        </div>
        <button className="btn-ghost" style={{ marginTop:"1rem", fontSize:"12px" }} onClick={onClose}>Passer le tutoriel</button>
      </div>
    </div>
  );
}

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────
const TRANSLATIONS = {
  fr: {
    nav_features:"Fonctionnalités", nav_how:"Comment ça marche", nav_pricing:"Tarifs",
    login:"Connexion", signup:"Commencer gratuit",
    credits_left:"Crédits restants", credits:"crédits", buy_credits:"Recharger",
    usage_history:"Historique d'utilisation", manage_account:"Gérer mon compte", referral:"Parrainer", sign_out:"Déconnexion",
    dashboard:"Dashboard", upload:"Uploader une vidéo", batch:"Traitement batch",
  },
  en: {
    nav_features:"Features", nav_how:"How it works", nav_pricing:"Pricing",
    login:"Sign in", signup:"Start for free",
    credits_left:"Credits left", credits:"credits", buy_credits:"Top up",
    usage_history:"Usage history", manage_account:"Manage account", referral:"Refer friends", sign_out:"Sign out",
    dashboard:"Dashboard", upload:"Upload video", batch:"Batch processing",
  },
};

// ─── NAV ─────────────────────────────────────────────────────────────────────
function Nav({ page, setPage, user, setUser, lang, setLang }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const logout = () => { setUser(null); setPage("home"); setProfileOpen(false); };
  const T = TRANSLATIONS[lang];
  const creditPct = Math.min(100, (user?.credits / (user?.maxCredits || 20)) * 100);

  return (
    <nav style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 2rem", height:"64px", background:C.bgNav, backdropFilter:"blur(16px)", borderBottom:`1px solid ${C.border}`, position:"sticky", top:0, zIndex:100 }}>
      <div onClick={() => setPage("home")} style={{ display:"flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
        <div style={{ width:"28px", height:"28px", borderRadius:"8px", background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"13px", fontWeight:800, color:"#fff" }}>C</div>
        <span style={{ fontWeight:800, fontSize:"17px", letterSpacing:"-0.5px" }}>ClearCut</span>
      </div>

      <div style={{ display:"flex", gap:"28px", alignItems:"center" }}>
        {[[T.nav_features,"features"],[T.nav_how,"how"],[T.nav_pricing,"pricing"],["Blog","blog"]].map(([l,p]) => (
          <span key={p} className="nav-link" onClick={() => setPage(p)}>{l}</span>
        ))}
      </div>

      <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
        {/* Language switcher */}
        <button onClick={() => setLang(lang==="fr"?"en":"fr")} style={{ padding:"5px 10px", borderRadius:"8px", border:`1px solid ${C.borderL}`, background:"transparent", color:C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:600 }}>
          {lang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
        </button>

        {user ? (
          <>
            {user.isAdmin && (
              <button style={{ padding:"8px 14px", fontSize:"13px", borderRadius:"10px", border:`1px solid rgba(248,113,113,0.4)`, background:"rgba(248,113,113,0.1)", color:C.danger, cursor:"pointer", fontFamily:"inherit", fontWeight:600, display:"inline-flex", alignItems:"center", gap:"6px" }}
                onClick={() => setPage("admin")}>⚙ Admin</button>
            )}
            <button className="btn-secondary" style={{ padding:"8px 14px", fontSize:"13px" }} onClick={() => setPage("dashboard")}>Dashboard</button>

            {/* Profile dropdown */}
            <div style={{ position:"relative" }}>
              <div onClick={() => setProfileOpen(o=>!o)} style={{ width:"36px", height:"36px", borderRadius:"50%", background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", fontWeight:800, color:"#fff", cursor:"pointer", border:`2px solid ${profileOpen ? C.accent : "transparent"}`, transition:"border 0.2s" }}>
                {user.name?.[0]?.toUpperCase() || "U"}
              </div>
              {profileOpen && (
                <div className="scale-in" style={{ position:"absolute", right:0, top:"44px", width:"240px", background:C.bgCard, border:`1px solid ${C.borderL}`, borderRadius:"16px", padding:"8px", boxShadow:"0 20px 60px rgba(0,0,0,0.5)", zIndex:200 }}>
                  {/* User info */}
                  <div style={{ padding:"10px 12px", marginBottom:"4px" }}>
                    <div style={{ fontWeight:700, fontSize:"14px" }}>{user.name}</div>
                    <div style={{ fontSize:"11px", color:C.textMuted }}>{user.email}</div>
                    <div style={{ fontSize:"11px", color:C.accent, marginTop:"2px" }}>Plan {user.plan}</div>
                  </div>

                  {/* Credits bar */}
                  <div style={{ padding:"10px 12px", background:C.bgCard2, borderRadius:"10px", marginBottom:"6px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"6px" }}>
                      <span style={{ fontSize:"12px", color:C.textMuted }}>{T.credits_left}</span>
                      <span style={{ fontSize:"12px", fontWeight:700, color: creditPct < 20 ? C.danger : C.text }}>{user.credits} {T.credits}</span>
                    </div>
                    <div style={{ height:"4px", background:C.border, borderRadius:"999px", overflow:"hidden" }}>
                      <div style={{ width:`${creditPct}%`, height:"100%", background: creditPct < 20 ? C.danger : C.grad, borderRadius:"999px" }} />
                    </div>
                    <button className="btn-primary" style={{ width:"100%", padding:"7px", fontSize:"12px", marginTop:"8px" }} onClick={()=>{setPage("pricing");setProfileOpen(false);}}>
                      {T.buy_credits} →
                    </button>
                  </div>

                  {/* Menu items */}
                  {[
                    { icon:"📊", label:T.usage_history, action:()=>{setPage("usage");setProfileOpen(false);} },
                    { icon:"⚙", label:T.manage_account, action:()=>{setPage("settings");setProfileOpen(false);} },
                    { icon:"🎁", label:T.referral, action:()=>{setPage("referral");setProfileOpen(false);} },
                  ].map((item,i) => (
                    <button key={i} onClick={item.action} style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"8px", border:"none", background:"transparent", color:C.text, cursor:"pointer", fontFamily:"inherit", fontSize:"13px", textAlign:"left", transition:"background 0.15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=C.bgCard2}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span>{item.icon}</span>{item.label}
                    </button>
                  ))}

                  <div style={{ borderTop:`1px solid ${C.border}`, marginTop:"4px", paddingTop:"4px" }}>
                    <button onClick={logout} style={{ width:"100%", display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"8px", border:"none", background:"transparent", color:C.danger, cursor:"pointer", fontFamily:"inherit", fontSize:"13px", textAlign:"left", transition:"background 0.15s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(248,113,113,0.08)"}
                      onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span>→</span>{T.sign_out}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <span className="nav-link" onClick={() => setPage("login")}>{T.login}</span>
            <button className="btn-primary" style={{ padding:"9px 18px", fontSize:"13px" }} onClick={() => setPage("signup")}>{T.signup} →</button>
          </>
        )}
      </div>
    </nav>
  );
}

// ─── MARQUEE ─────────────────────────────────────────────────────────────────
function Marquee() {
  const items = ["TikTok","YouTube Shorts","Instagram Reels","Snapchat","LinkedIn","Twitter/X","Podcast","Twitch","YouTube","Dailymotion","Facebook","Pinterest"];
  return (
    <div style={{ overflow:"hidden", borderTop:`1px solid ${C.border}`, borderBottom:`1px solid ${C.border}`, padding:"12px 0", background:C.bgCard, maskImage:"linear-gradient(to right,transparent,black 10%,black 90%,transparent)" }}>
      <div style={{ display:"flex", animation:"marquee 25s linear infinite", width:"max-content", gap:"0" }}>
        {[...items,...items].map((item,i) => (
          <span key={i} style={{ padding:"0 28px", fontSize:"13px", fontWeight:500, color:C.textMuted, whiteSpace:"nowrap", display:"flex", alignItems:"center", gap:"10px" }}>
            <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:C.accent, display:"inline-block" }} />
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── BEFORE/AFTER SLIDER ─────────────────────────────────────────────────────
function BeforeAfterSlider() {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef(null);
  const dragging = useRef(false);

  const updatePos = (clientX) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = Math.max(5, Math.min(95, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pct);
  };

  const onMouseDown = (e) => { dragging.current = true; e.preventDefault(); };
  const onMouseMove = (e) => { if (dragging.current) updatePos(e.clientX); };
  const onMouseUp   = () => { dragging.current = false; };
  const onTouchMove = (e) => updatePos(e.touches[0].clientX);

  useEffect(() => {
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => { window.removeEventListener("mousemove", onMouseMove); window.removeEventListener("mouseup", onMouseUp); };
  }, []);

  // Fake "subtitle" lines for the BEFORE side
  const subtitleLines = [
    { top:"62%", text:"Bonjour à tous !" },
    { top:"72%", text:"Aujourd'hui on va parler..." },
  ];

  return (
    <div ref={containerRef} style={{ borderRadius:"20px", overflow:"hidden", border:`1px solid ${C.borderL}`, aspectRatio:"9/16", maxWidth:"260px", margin:"0 auto", position:"relative", cursor:"ew-resize", userSelect:"none", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}>
      {/* AFTER layer (clean, full width) */}
      <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, #0a0a18, #13123a, #0d0d22)", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <div style={{ width:"100%", height:"100%", background:"linear-gradient(180deg,#0f0f2a 0%,#1a1040 50%,#0a0a18 100%)", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ color:"rgba(255,255,255,0.08)", fontSize:"11px", fontWeight:600, textAlign:"center", letterSpacing:"2px", textTransform:"uppercase" }}>VIDÉO PROPRE</div>
        </div>
      </div>

      {/* BEFORE layer (with subtitles, clipped to left of slider) */}
      <div style={{ position:"absolute", inset:0, clipPath:`inset(0 ${100-sliderPos}% 0 0)` }}>
        <div style={{ width:"100%", height:"100%", background:"linear-gradient(180deg,#0f0f2a 0%,#1a1040 50%,#0a0a18 100%)" }} />
        {subtitleLines.map((s,i) => (
          <div key={i} style={{ position:"absolute", top:s.top, left:"8%", right:"8%", background:"rgba(0,0,0,0.75)", borderRadius:"4px", padding:"5px 10px", fontSize:"11px", textAlign:"center", color:"rgba(255,255,255,0.9)", fontWeight:500 }}>{s.text}</div>
        ))}
      </div>

      {/* LABELS */}
      <div style={{ position:"absolute", top:"12px", left:"12px", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(6px)", borderRadius:"6px", padding:"3px 8px", fontSize:"10px", fontWeight:700, color:"rgba(255,255,255,0.5)", zIndex:4, opacity: sliderPos > 20 ? 1 : 0, transition:"opacity 0.2s" }}>AVANT</div>
      <div style={{ position:"absolute", top:"12px", right:"12px", background:"rgba(52,211,153,0.2)", backdropFilter:"blur(6px)", borderRadius:"6px", padding:"3px 8px", fontSize:"10px", fontWeight:700, color:C.success, zIndex:4, opacity: sliderPos < 80 ? 1 : 0, transition:"opacity 0.2s" }}>APRÈS ✓</div>

      {/* SLIDER LINE */}
      <div style={{ position:"absolute", top:0, bottom:0, left:`${sliderPos}%`, width:"2px", background:"#fff", zIndex:5, transform:"translateX(-50%)" }}>
        {/* Handle */}
        <div onMouseDown={onMouseDown} onTouchStart={e=>updatePos(e.touches[0].clientX)} onTouchMove={onTouchMove}
          style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"36px", height:"36px", borderRadius:"50%", background:"#fff", display:"flex", alignItems:"center", justifyContent:"center", boxShadow:"0 4px 16px rgba(0,0,0,0.5)", cursor:"ew-resize", gap:"3px" }}>
          <div style={{ display:"flex", gap:"3px" }}>
            <span style={{ fontSize:"11px", color:"#333" }}>◀</span>
            <span style={{ fontSize:"11px", color:"#333" }}>▶</span>
          </div>
        </div>
      </div>

      {/* Hint text at bottom */}
      <div style={{ position:"absolute", bottom:"14px", left:0, right:0, textAlign:"center", zIndex:6 }}>
        <div style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"rgba(0,0,0,0.6)", backdropFilter:"blur(8px)", borderRadius:"999px", padding:"5px 12px", fontSize:"11px", color:"rgba(255,255,255,0.6)", fontWeight:500 }}>
          ←  Glisse pour comparer  →
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ─────────────────────────────────────────────────────────────
function LandingPage({ setPage }) {
  return (
    <div>
      {/* HERO */}
      <section style={{ minHeight:"calc(100vh - 64px)", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"4rem 2rem 2rem", position:"relative", overflow:"hidden" }}>
        {/* BG glows */}
        <div style={{ position:"absolute", top:"15%", left:"15%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle, rgba(124,111,255,0.12) 0%, transparent 70%)", pointerEvents:"none" }} />
        <div style={{ position:"absolute", top:"20%", right:"10%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle, rgba(79,142,255,0.1) 0%, transparent 70%)", pointerEvents:"none" }} />

        {/* BADGE */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"6px 16px", borderRadius:"999px", background:"rgba(124,111,255,0.1)", border:`1px solid rgba(124,111,255,0.25)`, fontSize:"12px", fontWeight:600, color:C.accent, marginBottom:"2rem", animation:"fadeIn 0.6s ease both" }}>
          <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.success, animation:"pulse 2s infinite" }} />
          🚀 PROPULSÉ PAR L'IA · BÊTA OUVERTE
        </div>

        {/* MAIN LAYOUT */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"4rem", alignItems:"center", maxWidth:"1100px", width:"100%" }}>
          {/* LEFT */}
          <div style={{ animation:"slideUp 0.7s ease both" }}>
            <h1 style={{ fontSize:"clamp(2.8rem, 5vw, 4.2rem)", fontWeight:900, letterSpacing:"-2px", lineHeight:1.05, marginBottom:"1.5rem" }}>
              Supprime les<br/>
              <span style={{ background:C.gradText, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>sous-titres</span><br/>
              en 1 clic ✦
            </h1>
            <p style={{ fontSize:"16px", color:C.textMuted, lineHeight:1.8, marginBottom:"2rem", maxWidth:"420px", textAlign:"center" }}>
              Uploade ta vidéo. L'IA détecte et supprime les sous-titres incrustés en <strong style={{ color:C.text }}>quelques secondes</strong>. Résultat HD garanti.
            </p>

            <div style={{ display:"flex", gap:"12px", marginBottom:"2rem", flexWrap:"wrap" }}>
              <button className="btn-primary" style={{ fontSize:"15px", padding:"13px 26px" }} onClick={() => setPage("signup")}>
                ✦ Générer gratuitement — Gratuit
              </button>
              <button className="btn-secondary" style={{ fontSize:"15px", padding:"13px 26px" }} onClick={() => setPage("how")}>
                ▶ Voir les exemples
              </button>
            </div>

            {/* STATS */}
            <div style={{ display:"flex", gap:"0", background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"12px", overflow:"hidden" }}>
              {[["10k+","Créateurs"],["99.2%","Précision IA"],["4.1M+","Vidéos traitées"],["< 60s","Par vidéo"]].map(([v,l],i) => (
                <div key={i} style={{ flex:1, padding:"12px", textAlign:"center", borderRight: i<3 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ fontSize:"16px", fontWeight:800, letterSpacing:"-0.5px" }}>{v}</div>
                  <div style={{ fontSize:"10px", color:C.textMuted, marginTop:"2px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — BEFORE/AFTER SLIDER */}
          <div style={{ position:"relative", animation:"slideUp 0.9s ease both" }}>
            {/* Floating badges */}
            <div style={{ position:"absolute", top:"-20px", right:"-10px", background:C.bgCard, border:`1px solid ${C.borderL}`, borderRadius:"12px", padding:"10px 14px", zIndex:10, animation:"float 3s ease-in-out infinite" }}>
              <div style={{ fontSize:"10px", color:C.textMuted, marginBottom:"3px" }}>TRAITÉ AUJOURD'HUI</div>
              <div style={{ fontSize:"18px", fontWeight:800, color:C.success }}>+2 841</div>
              <div style={{ fontSize:"10px", color:C.textMuted }}>vidéos nettoyées</div>
            </div>

            <div style={{ position:"absolute", bottom:"20px", right:"-20px", background:C.bgCard, border:`1px solid ${C.borderL}`, borderRadius:"12px", padding:"10px 14px", zIndex:10, animation:"float 3s ease-in-out infinite 1.5s" }}>
              <div style={{ fontSize:"18px", fontWeight:800, color:C.accent }}>99.2%</div>
              <div style={{ fontSize:"10px", color:C.textMuted }}>précision IA</div>
            </div>

            <div style={{ position:"absolute", bottom:"-10px", left:"-10px", background:C.bgCard, border:`1px solid ${C.borderL}`, borderRadius:"12px", padding:"8px 14px", zIndex:10, display:"flex", alignItems:"center", gap:"8px" }}>
              <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:C.success, animation:"pulse 2s infinite" }} />
              <span style={{ fontSize:"12px", fontWeight:600, color:C.success }}>+12k créateurs actifs</span>
            </div>

            <BeforeAfterSlider />
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <Marquee />

      {/* HOW IT WORKS */}
      <section id="how" style={{ padding:"6rem 2rem", maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent, border:`1px solid rgba(124,111,255,0.2)`, marginBottom:"1rem" }}>Comment ça marche</div>
          <h2 style={{ fontSize:"2.5rem", fontWeight:900, letterSpacing:"-1.5px" }}>3 étapes, c'est tout</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1.5rem" }}>
          {[
            { n:"01", icon:"⬆️", title:"Uploade ta vidéo", desc:"MP4, MOV, MKV, AVI — n'importe quel format. Glisse-dépose ou colle un lien YouTube/TikTok.", color:C.accent },
            { n:"02", icon:"🤖", title:"L'IA analyse", desc:"Notre modèle détecte les sous-titres incrustés frame par frame et reconstruit le fond original.", color:C.accent2 },
            { n:"03", icon:"📥", title:"Télécharge", desc:"Ta vidéo propre est prête en HD. Télécharge-la ou traites-en d'autres.", color:C.pink },
          ].map((s,i) => (
            <div key={i} className="card" style={{ position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", top:"1rem", right:"1rem", fontSize:"3rem", fontWeight:900, color:`${s.color}10`, letterSpacing:"-2px" }}>{s.n}</div>
              <div style={{ fontSize:"32px", marginBottom:"1rem" }}>{s.icon}</div>
              <h3 style={{ fontSize:"1.1rem", fontWeight:700, marginBottom:"8px" }}>{s.title}</h3>
              <p style={{ fontSize:"13px", color:C.textMuted, lineHeight:1.7 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURES */}
      <section style={{ padding:"4rem 2rem 6rem", maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <div className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent, border:`1px solid rgba(124,111,255,0.2)`, marginBottom:"1rem" }}>Fonctionnalités</div>
          <h2 style={{ fontSize:"2.5rem", fontWeight:900, letterSpacing:"-1.5px" }}>Tout ce dont tu as besoin</h2>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
          {[
            { icon:"⚡", title:"Ultra rapide", desc:"Moins de 60s pour une vidéo courte. Notre infra GPU traite en parallèle.", color:C.accent },
            { icon:"🎯", title:"99.2% de précision", desc:"Fonctionne sur tous les types de sous-titres, même stylisés ou animés.", color:C.accent2 },
            { icon:"🌍", title:"Toutes les langues", desc:"Français, anglais, japonais, arabe, hindi — aucune limite de langue.", color:C.pink },
            { icon:"📱", title:"Tous les formats", desc:"MP4, MOV, MKV, AVI, WebM. Résolution jusqu'à 4K.", color:C.cyan },
            { icon:"🔒", title:"100% privé", desc:"Tes vidéos sont supprimées 24h après traitement. Jamais partagées.", color:C.success },
            { icon:"🔄", title:"Traitement batch", desc:"Upload plusieurs vidéos d'un coup et télécharge tout en ZIP.", color:C.warning },
          ].map((f,i) => (
            <div key={i} className="card" style={{ transition:"transform 0.2s, border-color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.borderColor=f.color+"44"; }}
              onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.borderColor=C.border; }}>
              <div style={{ fontSize:"24px", marginBottom:"10px" }}>{f.icon}</div>
              <h3 style={{ fontSize:"14px", fontWeight:700, marginBottom:"6px" }}>{f.title}</h3>
              <p style={{ fontSize:"13px", color:C.textMuted, lineHeight:1.6 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING PREVIEW */}
      <section style={{ padding:"4rem 2rem 6rem", maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"3rem" }}>
          <h2 style={{ fontSize:"2.5rem", fontWeight:900, letterSpacing:"-1.5px" }}>Tarifs simples</h2>
          <p style={{ color:C.textMuted, marginTop:"10px" }}>Commence gratuitement, scale sans limites</p>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", alignItems:"start" }}>
          {[
            { name:"Free", price:"0€", credits:"20 crédits offerts\npuis 10/mois", features:["720p max","5 min par vidéo","Support communauté"], popular:false },
            { name:"Pro", price:"19€", credits:"800 crédits/mois", features:["1080p","30 min par vidéo","Support prioritaire","API accès"], popular:false },
            { name:"Creator", price:"49€", credits:"3 000 crédits/mois", features:["4K","Illimité","Support dédié","API + Webhooks","Batch illimité"], popular:true },
            { name:"Business", price:"99€", credits:"10 000 crédits/mois", features:["4K","Illimité","SLA garanti","API avancée","White label"], popular:false },
          ].map((p,i) => (
            <div key={i} className="card" style={{ position:"relative", border: p.popular ? `2px solid ${C.accent}` : `1px solid ${C.border}`, transform: p.popular ? "scale(1.03)" : "scale(1)", boxShadow: p.popular ? `0 0 40px rgba(124,111,255,0.2)` : "none" }}>
              {p.popular && <div style={{ position:"absolute", top:"-12px", left:"50%", transform:"translateX(-50%)", background:C.grad, color:"#fff", fontSize:"10px", fontWeight:700, padding:"4px 12px", borderRadius:"999px", whiteSpace:"nowrap" }}>⭐ POPULAIRE</div>}
              <div style={{ fontSize:"14px", fontWeight:700, marginBottom:"4px" }}>{p.name}</div>
              <div style={{ fontSize:"2rem", fontWeight:900, letterSpacing:"-1px", marginBottom:"4px" }}>{p.price}<span style={{ fontSize:"13px", fontWeight:400, color:C.textMuted }}>/mois</span></div>
              <div style={{ fontSize:"12px", color:C.textMuted, marginBottom:"1rem", whiteSpace:"pre-line" }}>{p.credits}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginBottom:"1.25rem" }}>
                {p.features.map((f,j) => <div key={j} style={{ fontSize:"12px", color:C.textMuted, display:"flex", gap:"8px" }}><span style={{ color:C.success }}>✓</span>{f}</div>)}
              </div>
              <button className={p.popular ? "btn-primary" : "btn-secondary"} style={{ width:"100%", padding:"10px", fontSize:"13px" }} onClick={() => setPage("pricing")}>
                {p.name === "Free" ? "Commencer gratuit" : "Choisir ce plan"}
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding:"4rem 2rem 6rem", textAlign:"center" }}>
        <div style={{ maxWidth:"600px", margin:"0 auto" }}>
          <h2 style={{ fontSize:"2.8rem", fontWeight:900, letterSpacing:"-1.5px", marginBottom:"1rem" }}>
            Prêt à nettoyer<br/>
            <span style={{ background:C.gradText, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>tes vidéos ?</span>
          </h2>
          <p style={{ color:C.textMuted, marginBottom:"2rem", lineHeight:1.8 }}>20 crédits gratuits, aucune carte bancaire requise.</p>
          <button className="btn-primary" style={{ padding:"15px 32px", fontSize:"16px" }} onClick={() => setPage("signup")}>
            ✦ Commencer gratuitement →
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop:`1px solid ${C.border}`, padding:"2rem", display:"flex", justifyContent:"space-between", alignItems:"center", maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
          <div style={{ width:"22px", height:"22px", borderRadius:"6px", background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px", color:"#fff", fontWeight:800 }}>C</div>
          <span style={{ fontWeight:700, fontSize:"14px" }}>ClearCut</span>
        </div>
        <div style={{ fontSize:"12px", color:C.textDim, textAlign:"center" }}>
          © 2026 ClearCut · KEVININDUSTRIE SAS · SIREN 932 737 992 · Paris
        </div>
        <div style={{ display:"flex", gap:"20px" }}>
          {[["CGU","cgu"],["Confidentialité","privacy"],["Contact","contact"]].map(([l,p]) => <span key={l} style={{ fontSize:"12px", color:C.textDim, cursor:"pointer", transition:"color 0.2s" }} onMouseEnter={e=>e.currentTarget.style.color=C.text} onMouseLeave={e=>e.currentTarget.style.color=C.textDim} onClick={()=>setPage(p)}>{l}</span>)}
        </div>
      </footer>
    </div>
  );
}

// ─── AUTH PAGE ────────────────────────────────────────────────────────────────
function AuthPage({ type, setPage, setUser, showOnboarding }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handle = async () => {
    setLoading(true);
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const adminUser = { name:"Admin", email, plan:"Business", credits:9999, isAdmin:true };
      setUser(adminUser);
      setTimeout(() => { setPage("admin"); setLoading(false); }, 50);
      return;
    }
    if (type === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { full_name: name } } });
      if (error) { alert(error.message); setLoading(false); return; }
      const u = { name: name || email.split("@")[0], email, plan:"Free", credits:20, id: data.user?.id };
      setUser(u);
      // Notify admin of new signup
      fetch('/api/notify-signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name: u.name, email }) }).catch(()=>{});
      showOnboarding();
      setPage("dashboard");
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { alert(error.message); setLoading(false); return; }
      const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single();
      setUser({ name: profile?.name || email.split("@")[0], email, plan: profile?.plan || "Free", credits: profile?.credits || 20, id: data.user.id });
      setPage("dashboard");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: `${process.env.NEXT_PUBLIC_URL}/auth/callback` } });
    if (error) alert(error.message);
    setGoogleLoading(false);
  };

  return (
    <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div className="fade-in" style={{ width:"100%", maxWidth:"400px" }}>
        <div style={{ textAlign:"center", marginBottom:"2rem" }}>
          <h1 style={{ fontSize:"1.8rem", fontWeight:900, letterSpacing:"-1px", marginBottom:"6px" }}>
            {type === "login" ? "Content de te revoir 👋" : "Rejoins ClearCut ✦"}
          </h1>
          <p style={{ color:C.textMuted, fontSize:"14px" }}>
            {type === "login" ? "Connecte-toi à ton compte" : "20 crédits gratuits, aucune CB requise"}
          </p>
        </div>

        <div className="card" style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {/* Google */}
          <button className="btn-secondary" style={{ width:"100%", gap:"10px", justifyContent:"center" }} onClick={handleGoogle} disabled={googleLoading}>
            {googleLoading ? <span style={{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.2)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> : "G"}
            {googleLoading ? "Connexion..." : `Continuer avec Google`}
          </button>

          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ flex:1, height:"1px", background:C.border }} />
            <span style={{ fontSize:"11px", color:C.textDim }}>ou</span>
            <div style={{ flex:1, height:"1px", background:C.border }} />
          </div>

          {type === "signup" && (
            <div>
              <label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Nom complet</label>
              <input className="input" placeholder="Jean Dupont" value={name} onChange={e=>setName(e.target.value)} />
            </div>
          )}
          <div>
            <label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Email</label>
            <input className="input" type="email" placeholder="jean@exemple.com" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} />
          </div>
          <div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
              <label style={{ fontSize:"12px", color:C.textMuted }}>Mot de passe</label>
              {type === "login" && <span style={{ fontSize:"12px", color:C.accent, cursor:"pointer" }}>Oublié ?</span>}
            </div>
            <input className="input" type="password" placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handle()} />
          </div>

          {type === "signup" && (
            <div style={{ background:"rgba(124,111,255,0.08)", border:`1px solid rgba(124,111,255,0.2)`, borderRadius:"10px", padding:"10px 12px", fontSize:"12px", color:C.textMuted }}>
              🎁 <strong style={{ color:C.text }}>20 crédits offerts</strong> à l'inscription + 10 crédits gratuits chaque mois
            </div>
          )}

          <button className="btn-primary" style={{ width:"100%", padding:"12px", marginTop:"4px" }} onClick={handle} disabled={loading}>
            {loading ? <><span style={{ width:"14px", height:"14px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> Chargement...</> : type === "login" ? "Se connecter →" : "Créer mon compte →"}
          </button>

          <div style={{ textAlign:"center", fontSize:"13px", color:C.textMuted }}>
            {type === "login" ? <>Pas de compte ? <span style={{ color:C.accent, cursor:"pointer" }} onClick={()=>setPage("signup")}>S'inscrire</span></> : <>Déjà un compte ? <span style={{ color:C.accent, cursor:"pointer" }} onClick={()=>setPage("login")}>Se connecter</span></>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ user, setPage, lang }) {
  const T = TRANSLATIONS[lang||"fr"];
  const maxCredits = user?.maxCredits || 20;
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  useEffect(() => {
    if (!user?.id) { setLoadingJobs(false); return; }
    fetch(`/api/jobs?userId=${user.id}`)
      .then(r => r.json())
      .then(({ jobs }) => { setJobs(jobs || []); setLoadingJobs(false); })
      .catch(() => setLoadingJobs(false));
  }, [user?.id]);

  const totalCreditsUsed = jobs.reduce((a,j) => a + (j.credits_used||0), 0);
  const doneJobs = jobs.filter(j => j.status === "done");
  const creditPct = Math.min(100, (totalCreditsUsed / maxCredits) * 100);

  const statusCfg = {
    done:       { bg:"rgba(52,211,153,0.1)",  color:C.success, label:"✓ Terminé" },
    processing: { bg:"rgba(251,191,36,0.1)",  color:C.warning, label:"⟳ En cours" },
    error:      { bg:"rgba(248,113,113,0.1)", color:C.danger,  label:"✕ Erreur" },
  };

  const barData = [0,0,0,0,0,0,totalCreditsUsed];
  const maxBar = Math.max(...barData, 1);
  const days = ["L","M","M","J","V","S","A"];

  return (
    <div style={{ padding:"2rem", maxWidth:"1100px", margin:"0 auto" }}>
      <div style={{ marginBottom:"2rem" }}>
        <h1 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.8px" }}>Bonjour, {user?.name?.split(" ")[0] || "!"} 👋</h1>
        <p style={{ color:C.textMuted, fontSize:"14px" }}>Voici un résumé de ton activité</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:"1.5rem", marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
            {[
              { label:"Crédits restants", value:user?.credits||0, sub:`Plan ${user?.plan||"Free"}`, color:C.accent },
              { label:"Vidéos traitées", value:doneJobs.length, sub:"au total", color:C.cyan },
              { label:"Crédits utilisés", value:totalCreditsUsed, sub:"au total", color:C.pink },
            ].map((k,i) => (
              <div key={i} className="card" style={{ padding:"1rem" }}>
                <div style={{ fontSize:"11px", color:C.textMuted, marginBottom:"6px", textTransform:"uppercase", letterSpacing:"0.5px" }}>{k.label}</div>
                <div style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.5px", color:k.color }}>{k.value}</div>
                <div style={{ fontSize:"11px", color:C.textMuted, marginTop:"3px" }}>{k.sub}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
              <span style={{ fontSize:"13px", fontWeight:600 }}>Crédits utilisés</span>
              <span style={{ fontSize:"13px", color: creditPct > 80 ? C.danger : C.textMuted }}>{totalCreditsUsed} / {maxCredits}</span>
            </div>
            <div style={{ height:"6px", background:C.bgCard2, borderRadius:"999px", overflow:"hidden", marginBottom:"8px" }}>
              <div style={{ height:"100%", width:`${creditPct}%`, background: creditPct > 80 ? C.danger : C.grad, borderRadius:"999px", transition:"width 1s ease" }} />
            </div>
            {creditPct > 70 && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"12px", color:C.warning }}>⚠ Crédits bientôt épuisés</span>
                <button className="btn-primary" style={{ padding:"5px 14px", fontSize:"12px" }} onClick={()=>setPage("pricing")}>Recharger →</button>
              </div>
            )}
          </div>

          <div style={{ display:"flex", gap:"10px" }}>
            <button className="btn-primary" style={{ flex:1, padding:"12px", fontSize:"14px" }} onClick={()=>setPage("process")}>⬆ Uploader une vidéo</button>
            <button className="btn-secondary" style={{ flex:1, padding:"12px", fontSize:"14px" }} onClick={()=>setPage("batch")}>📦 Traitement batch</button>
          </div>
        </div>

        <div className="card">
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
            <span style={{ fontSize:"13px", fontWeight:600 }}>Activité récente</span>
            <button className="btn-ghost" style={{ fontSize:"12px", color:C.accent }} onClick={()=>setPage("usage")}>Voir tout →</button>
          </div>
          <div style={{ display:"flex", gap:"6px", alignItems:"flex-end", height:"80px", marginBottom:"8px" }}>
            {barData.map((v,i)=>(
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                <div style={{ width:"100%", height:`${(v/maxBar)*70}px`, background:i===barData.length-1?C.grad:`${C.accent}44`, borderRadius:"4px 4px 0 0", transition:"height 0.3s", minHeight: v>0?"4px":"0" }} />
                <span style={{ fontSize:"9px", color:C.textDim }}>{days[i]}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:"10px", display:"flex", justifyContent:"space-between" }}>
            <div>
              <div style={{ fontSize:"11px", color:C.textMuted }}>Total crédits</div>
              <div style={{ fontWeight:700, color:C.accent }}>{totalCreditsUsed}</div>
            </div>
            <div>
              <div style={{ fontSize:"11px", color:C.textMuted }}>Vidéos</div>
              <div style={{ fontWeight:700 }}>{doneJobs.length}</div>
            </div>
            <div>
              <div style={{ fontSize:"11px", color:C.textMuted }}>Erreurs</div>
              <div style={{ fontWeight:700, color: jobs.filter(j=>j.status==="error").length>0?C.danger:C.text }}>{jobs.filter(j=>j.status==="error").length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ fontSize:"13px", fontWeight:700 }}>Historique récent</span>
          <button className="btn-ghost" style={{ fontSize:"12px", color:C.accent }} onClick={()=>setPage("usage")}>Voir tout →</button>
        </div>
        {loadingJobs ? (
          <div style={{ padding:"3rem", textAlign:"center", color:C.textMuted, fontSize:"13px" }}>Chargement...</div>
        ) : jobs.length === 0 ? (
          <div style={{ padding:"3rem", textAlign:"center" }}>
            <div style={{ fontSize:"32px", marginBottom:"10px" }}>🎬</div>
            <div style={{ fontWeight:600, marginBottom:"6px" }}>Aucune vidéo traitée pour l'instant</div>
            <div style={{ fontSize:"13px", color:C.textMuted, marginBottom:"1.5rem" }}>Upload ta première vidéo pour commencer</div>
            <button className="btn-primary" style={{ padding:"10px 24px", fontSize:"14px" }} onClick={()=>setPage("process")}>⬆ Uploader une vidéo</button>
          </div>
        ) : (
          <table>
            <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["Crédits","Fichier","Statut","Date",""].map((h,i)=>(
                <th key={i} style={{ padding:"10px 16px", textAlign:i===0?"center":"left", fontSize:"11px", color:C.textMuted, fontWeight:500, textTransform:"uppercase" }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {jobs.slice(0,10).map((j,i)=>{
                const sc = statusCfg[j.status] || statusCfg.error;
                return (
                  <tr key={j.id} style={{ borderBottom: i<Math.min(jobs.length,10)-1?`1px solid ${C.border}`:"none" }}>
                    <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color: (j.credits_used||0)>0?C.danger:C.textDim }}>{(j.credits_used||0)>0?`-${j.credits_used}`:"—"}</td>
                    <td style={{ padding:"12px 16px", fontWeight:500, fontSize:"13px" }}>{j.filename||"—"}</td>
                    <td style={{ padding:"12px 16px" }}><span className="badge" style={{ background:sc.bg, color:sc.color, fontSize:"11px" }}>{sc.label}</span></td>
                    <td style={{ padding:"12px 16px", fontSize:"11px", color:C.textDim }}>{new Date(j.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", hour:"2-digit", minute:"2-digit" })}</td>
                    <td style={{ padding:"12px 16px" }}>
                      {j.status==="done" && j.output_url && <a href={j.output_url} target="_blank" rel="noopener noreferrer"><button className="btn-secondary" style={{ padding:"4px 12px", fontSize:"11px" }}>↓ Télécharger</button></a>}
                      {j.status==="error" && <button className="btn-secondary" style={{ padding:"4px 12px", fontSize:"11px", color:C.warning }}>↻ Retry</button>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── PROCESS PAGE ─────────────────────────────────────────────────────────────
function ProcessPage({ setPage }) {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processing, setProcessing] = useState(false);

  const start = () => {
    if (!file) return;
    setProcessing(true);
    let p = 0;
    const iv = setInterval(() => {
      p += Math.random() * 8 + 2;
      if (p >= 100) { p = 100; clearInterval(iv); setTimeout(()=>setPage("result"), 600); }
      setProgress(Math.min(100, p));
    }, 200);
  };

  return (
    <div style={{ padding:"2rem", maxWidth:"700px", margin:"0 auto" }}>
      <h1 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.8px", marginBottom:"0.5rem" }}>Uploader une vidéo</h1>
      <p style={{ color:C.textMuted, fontSize:"14px", marginBottom:"2rem" }}>Formats acceptés : MP4, MOV, MKV, AVI, WebM · Max 2 Go</p>

      <div
        className="card"
        onDragOver={e=>{e.preventDefault();setDragging(true)}}
        onDragLeave={()=>setDragging(false)}
        onDrop={e=>{e.preventDefault();setDragging(false);setFile(e.dataTransfer.files[0])}}
        style={{ border:`2px dashed ${dragging ? C.accent : C.borderL}`, borderRadius:"20px", padding:"3rem", textAlign:"center", cursor:"pointer", transition:"all 0.2s", background: dragging ? "rgba(124,111,255,0.05)" : C.bgCard }}
        onClick={()=>document.getElementById("fi").click()}>
        <input id="fi" type="file" accept="video/*" style={{ display:"none" }} onChange={e=>setFile(e.target.files[0])} />
        {file ? (
          <>
            <div style={{ fontSize:"36px", marginBottom:"10px" }}>🎬</div>
            <div style={{ fontWeight:600, marginBottom:"4px" }}>{file.name}</div>
            <div style={{ fontSize:"13px", color:C.textMuted }}>{(file.size/1024/1024).toFixed(1)} MB</div>
          </>
        ) : (
          <>
            <div style={{ fontSize:"40px", marginBottom:"12px", opacity:0.5 }}>⬆️</div>
            <div style={{ fontWeight:600, marginBottom:"6px" }}>Glisse ta vidéo ici</div>
            <div style={{ fontSize:"13px", color:C.textMuted }}>ou clique pour parcourir</div>
          </>
        )}
      </div>

      {processing && (
        <div className="card" style={{ marginTop:"1.5rem" }}>
          <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
            <span style={{ fontSize:"13px", fontWeight:600 }}>Suppression en cours…</span>
            <span style={{ fontSize:"13px", color:C.accent, fontWeight:700 }}>{Math.round(progress)}%</span>
          </div>
          <div style={{ height:"8px", background:C.bgCard2, borderRadius:"999px", overflow:"hidden" }}>
            <div style={{ height:"100%", width:`${progress}%`, background:C.grad, borderRadius:"999px", transition:"width 0.2s" }} />
          </div>
          <div style={{ fontSize:"12px", color:C.textMuted, marginTop:"8px" }}>L'IA analyse chaque frame…</div>
        </div>
      )}

      {!processing && file && (
        <button className="btn-primary" style={{ width:"100%", padding:"14px", fontSize:"15px", marginTop:"1.5rem" }} onClick={start}>
          ✦ Supprimer les sous-titres
        </button>
      )}
    </div>
  );
}

// ─── PRICING PAGE ─────────────────────────────────────────────────────────────
function PricingPage({ setPage, setCheckoutPlan }) {
  const [cycle, setCycle] = useState("monthly");
  const plans = [
    { name:"Free", monthly:0, yearly:0, credits:20, perCredit:"—", features:["20 crédits offerts","10 crédits/mois","720p max","5 min par vidéo","Support communauté"] },
    { name:"Pro", monthly:19, yearly:15, credits:500, perCredit:"0,038€", features:["500 crédits/mois","1080p max","30 min par vidéo","Support prioritaire","Accès API","= 250 vidéos/mois"] },
    { name:"Creator", monthly:49, yearly:39, credits:1500, perCredit:"0,033€", features:["1 500 crédits/mois","4K max","Vidéos illimitées","Support dédié","API + Webhooks","Batch illimité","= 750 vidéos/mois"], popular:true },
    { name:"Business", monthly:99, yearly:79, credits:4000, perCredit:"0,025€", features:["4 000 crédits/mois","4K max","SLA 99.9%","API avancée","White label","Manager dédié","= 2 000 vidéos/mois"] },
  ];
  const planColor = { Free:C.textMuted, Pro:C.accent2, Creator:C.accent, Business:C.pink };

  return (
    <div style={{ padding:"4rem 2rem", maxWidth:"1100px", margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <h1 style={{ fontSize:"2.8rem", fontWeight:900, letterSpacing:"-1.5px", marginBottom:"10px" }}>Tarifs simples et transparents</h1>
        <p style={{ color:C.textMuted, marginBottom:"1.5rem" }}>Commence gratuitement. Upgrade quand tu es prêt.</p>
        <div style={{ display:"inline-flex", background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"3px", gap:"2px" }}>
          {[["monthly","Mensuel"],["yearly","Annuel (−20%)"]].map(([v,l]) => (
            <button key={v} style={{ padding:"7px 18px", borderRadius:"8px", border: cycle===v ? `1px solid ${C.borderL}` : "1px solid transparent", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight:500, background: cycle===v ? C.bgCard2 : "transparent", color: cycle===v ? C.text : C.textMuted, transition:"all 0.15s" }} onClick={()=>setCycle(v)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", alignItems:"start" }}>
        {plans.map((p,i) => (
          <div key={i} className="card" style={{ position:"relative", border: p.popular ? `2px solid ${C.accent}` : `1px solid ${C.border}`, boxShadow: p.popular ? `0 0 50px rgba(124,111,255,0.15)` : "none" }}>
            {p.popular && <div style={{ position:"absolute", top:"-13px", left:"50%", transform:"translateX(-50%)", background:C.grad, color:"#fff", fontSize:"10px", fontWeight:700, padding:"4px 14px", borderRadius:"999px" }}>⭐ POPULAIRE</div>}
            <div style={{ fontSize:"14px", fontWeight:700, color:planColor[p.name], marginBottom:"4px" }}>{p.name}</div>
            <div style={{ fontSize:"2.2rem", fontWeight:900, letterSpacing:"-1px", marginBottom:"2px" }}>
              {p.monthly === 0 ? "Gratuit" : `${cycle==="yearly" ? p.yearly : p.monthly}€`}
              {p.monthly > 0 && <span style={{ fontSize:"13px", fontWeight:400, color:C.textMuted }}>/mois</span>}
            </div>
            {p.monthly > 0 && cycle === "yearly" && <div style={{ fontSize:"11px", color:C.success, marginBottom:"6px" }}>💰 Économise {(p.monthly - p.yearly)*12}€/an</div>}
            <div style={{ fontSize:"12px", color:C.textMuted, marginBottom:"1rem" }}>{p.credits.toLocaleString("fr-FR")} crédits/mois</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"7px", marginBottom:"1.5rem" }}>
              {p.features.map((f,j) => <div key={j} style={{ fontSize:"12px", color:C.textMuted, display:"flex", gap:"8px", alignItems:"flex-start" }}><span style={{ color:C.success, flexShrink:0 }}>✓</span>{f}</div>)}
            </div>
            <button className={p.popular ? "btn-primary" : "btn-secondary"} style={{ width:"100%", padding:"10px", fontSize:"13px" }}
              onClick={() => { if(p.monthly > 0) { setCheckoutPlan({...p, billingCycle:cycle}); setPage("checkout"); } else setPage("signup"); }}>
              {p.monthly === 0 ? "Commencer gratuit" : "Choisir ce plan"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CHECKOUT PAGE ────────────────────────────────────────────────────────────
function CheckoutPage({ plan, setPage, setUser, user }) {
  const [cardName, setCardName] = useState("");
  const [cardNum, setCardNum] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const fmtCard = v => v.replace(/\D/g,"").replace(/(\d{4})/g,"$1 ").trim().slice(0,19);
  const fmtExp = v => { const d=v.replace(/\D/g,""); return d.length>=3?d.slice(0,2)+"/"+d.slice(2,4):d; };
  const price = plan ? (plan.billingCycle==="yearly" ? plan.yearly : plan.monthly) : 0;
  const tva = price * 0.2;

  if (success) return (
    <div style={{ minHeight:"calc(100vh - 64px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div className="card scale-in" style={{ maxWidth:"440px", textAlign:"center", padding:"3rem" }}>
        <div style={{ fontSize:"52px", marginBottom:"1rem" }}>🎉</div>
        <h2 style={{ fontSize:"1.6rem", fontWeight:800, marginBottom:"10px" }}>Paiement réussi !</h2>
        <p style={{ color:C.textMuted, marginBottom:"2rem" }}>Ton plan {plan?.name} est actif. Tes crédits sont disponibles.</p>
        <button className="btn-primary" style={{ width:"100%" }} onClick={()=>setPage("dashboard")}>Aller au dashboard →</button>
      </div>
    </div>
  );

  if (!plan) return <div style={{ padding:"2rem", textAlign:"center" }}><button className="btn-primary" onClick={()=>setPage("pricing")}>← Choisir un plan</button></div>;

  return (
    <div style={{ padding:"2rem", maxWidth:"900px", margin:"0 auto" }}>
      <h1 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.8px", marginBottom:"2rem" }}>Finaliser l'abonnement</h1>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 380px", gap:"1.5rem" }}>
        {/* FORM */}
        <div className="card" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div style={{ fontSize:"13px", fontWeight:600, color:C.textMuted, letterSpacing:"0.5px", textTransform:"uppercase", marginBottom:"4px" }}>Informations de paiement</div>
          <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Nom sur la carte</label><input className="input" placeholder="Jean Dupont" value={cardName} onChange={e=>setCardName(e.target.value)} /></div>
          <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Numéro de carte</label><input className="input" placeholder="1234 5678 9012 3456" value={cardNum} onChange={e=>setCardNum(fmtCard(e.target.value))} maxLength={19} /></div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Expiration</label><input className="input" placeholder="MM/AA" value={expiry} onChange={e=>setExpiry(fmtExp(e.target.value))} maxLength={5} /></div>
            <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>CVC</label><input className="input" placeholder="123" value={cvc} onChange={e=>setCvc(e.target.value.replace(/\D/g,"").slice(0,3))} /></div>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:"8px", fontSize:"12px", color:C.textDim, marginTop:"4px" }}>
            <span>🔒</span> Paiement sécurisé via Stripe · Données chiffrées TLS
          </div>
          <button className="btn-primary" style={{ width:"100%", padding:"14px", fontSize:"15px", marginTop:"8px" }}
            onClick={() => { setLoading(true); setTimeout(()=>{ if(user) setUser({...user, plan:plan.name, credits:plan.credits}); setSuccess(true); setLoading(false); }, 1800); }}
            disabled={loading}>
            {loading ? <><span style={{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,0.3)", borderTopColor:"#fff", borderRadius:"50%", display:"inline-block", animation:"spin 0.7s linear infinite" }} /> Traitement…</> : `Payer ${price.toFixed(2)}€ TTC →`}
          </button>
        </div>

        {/* SUMMARY */}
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div className="card">
            <div style={{ fontSize:"13px", fontWeight:700, marginBottom:"1rem" }}>Récapitulatif</div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px", fontSize:"13px" }}>
              <span style={{ color:C.textMuted }}>Plan {plan.name}</span>
              <span>{price.toFixed(2)}€</span>
            </div>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px", fontSize:"13px" }}>
              <span style={{ color:C.textMuted }}>TVA (20%)</span>
              <span>{tva.toFixed(2)}€</span>
            </div>
            <div style={{ borderTop:`1px solid ${C.border}`, paddingTop:"10px", display:"flex", justifyContent:"space-between", fontWeight:700 }}>
              <span>Total TTC</span>
              <span style={{ color:C.accent }}>{(price + tva).toFixed(2)}€/mois</span>
            </div>
          </div>
          <div className="card" style={{ fontSize:"12px", color:C.textMuted, lineHeight:1.7 }}>
            <div style={{ fontWeight:600, color:C.text, marginBottom:"6px" }}>Ce qui est inclus :</div>
            {plan.features?.map((f,i) => <div key={i}>✓ {f}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BILLING PAGE ─────────────────────────────────────────────────────────────
function BillingPage({ user, setPage }) {
  const [tab, setTab] = useState("sub");
  const invoices = [
    { id:"INV-2026-03", date:"1 Mar 2026", amount:"23,40€", status:"Payée", plan:"Pro" },
    { id:"INV-2026-02", date:"1 Fév 2026", amount:"23,40€", status:"Payée", plan:"Pro" },
    { id:"INV-2026-01", date:"1 Jan 2026", amount:"23,40€", status:"Payée", plan:"Pro" },
  ];

  return (
    <div style={{ padding:"2rem", maxWidth:"800px", margin:"0 auto" }}>
      <h1 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.8px", marginBottom:"2rem" }}>Abonnement & Facturation</h1>

      <div style={{ display:"flex", gap:"4px", background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"4px", marginBottom:"1.5rem" }}>
        {[["sub","Mon abonnement"],["invoices","Factures"],["payment","Paiement"]].map(([v,l]) => (
          <button key={v} style={{ flex:1, padding:"8px", borderRadius:"7px", border: tab===v ? `1px solid ${C.borderL}` : "1px solid transparent", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight:500, background: tab===v ? C.bgCard2 : "transparent", color: tab===v ? C.text : C.textMuted, transition:"all 0.15s" }} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === "sub" && (
        <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div className="card" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontSize:"11px", color:C.textMuted, marginBottom:"4px", textTransform:"uppercase", letterSpacing:"0.5px" }}>Plan actuel</div>
              <div style={{ fontSize:"1.4rem", fontWeight:800, letterSpacing:"-0.5px" }}>{user?.plan || "Free"}</div>
              <div style={{ fontSize:"13px", color:C.textMuted, marginTop:"4px" }}>
                {user?.credits} crédits disponibles · Renouvellement le 1er Avr 2026
              </div>
            </div>
            <button className="btn-primary" onClick={()=>setPage("pricing")}>Upgrader →</button>
          </div>

          <div className="card">
            <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"1rem" }}>Utilisation ce mois</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"1rem" }}>
              {[["Crédits utilisés","12 / 20"],["Vidéos traitées","4"],["Stockage","1.2 GB"]].map(([l,v],i) => (
                <div key={i} style={{ background:C.bgCard2, borderRadius:"10px", padding:"1rem" }}>
                  <div style={{ fontSize:"11px", color:C.textMuted, marginBottom:"6px" }}>{l}</div>
                  <div style={{ fontSize:"1.1rem", fontWeight:700 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" style={{ border:`1px solid rgba(248,113,113,0.2)` }}>
            <div style={{ fontSize:"13px", fontWeight:600, color:C.danger, marginBottom:"8px" }}>Zone de danger</div>
            <div style={{ fontSize:"13px", color:C.textMuted, marginBottom:"1rem" }}>L'annulation prend effet à la fin de la période en cours.</div>
            <button className="btn-secondary" style={{ color:C.danger, borderColor:"rgba(248,113,113,0.3)", fontSize:"13px" }}>Annuler mon abonnement</button>
          </div>
        </div>
      )}

      {tab === "invoices" && (
        <div className="card">
          <table>
            <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["Facture","Date","Plan","Montant","Statut",""].map((h,i) => <th key={i} style={{ padding:"8px 12px", textAlign:i===0?"left":"center", fontSize:"11px", color:C.textMuted, fontWeight:500, textTransform:"uppercase" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {invoices.map((inv,i) => (
                <tr key={i} style={{ borderBottom: i<invoices.length-1 ? `1px solid ${C.border}` : "none" }}>
                  <td style={{ padding:"12px", fontFamily:"monospace", fontSize:"12px", color:C.textMuted }}>{inv.id}</td>
                  <td style={{ padding:"12px", textAlign:"center", fontSize:"13px" }}>{inv.date}</td>
                  <td style={{ padding:"12px", textAlign:"center" }}><span className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent }}>{inv.plan}</span></td>
                  <td style={{ padding:"12px", textAlign:"center", fontWeight:700 }}>{inv.amount}</td>
                  <td style={{ padding:"12px", textAlign:"center" }}><span className="badge" style={{ background:"rgba(52,211,153,0.1)", color:C.success }}>{inv.status}</span></td>
                  <td style={{ padding:"12px", textAlign:"center" }}><button className="btn-secondary" style={{ padding:"4px 10px", fontSize:"11px" }}>↓ PDF</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "payment" && (
        <div className="card">
          <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"1rem" }}>Moyen de paiement</div>
          <div style={{ display:"flex", alignItems:"center", gap:"14px", padding:"14px", background:C.bgCard2, borderRadius:"10px", border:`1px solid ${C.borderL}`, marginBottom:"1rem" }}>
            <div style={{ width:"40px", height:"26px", background:"#1A1F71", borderRadius:"4px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"9px", color:"#fff", fontWeight:800 }}>VISA</div>
            <div>
              <div style={{ fontSize:"13px", fontWeight:500 }}>•••• •••• •••• 4242</div>
              <div style={{ fontSize:"11px", color:C.textMuted }}>Expire 12/28</div>
            </div>
            <span className="badge" style={{ marginLeft:"auto", background:"rgba(52,211,153,0.1)", color:C.success }}>Défaut</span>
          </div>
          <button className="btn-secondary" style={{ fontSize:"13px" }}>+ Ajouter une carte</button>
        </div>
      )}
    </div>
  );
}

// ─── REFERRAL PAGE ────────────────────────────────────────────────────────────
function ReferralPage({ user }) {
  const refCode = user ? `CLEAR-${user.name.split(" ")[0].toUpperCase()}-${Math.random().toString(36).slice(2,6).toUpperCase()}` : "CLEAR-XXXX";
  const refLink = `https://clearcut.io/signup?ref=${refCode}`;
  const [copied, setCopied] = useState(false);
  const copy = (txt) => { navigator.clipboard?.writeText(txt); setCopied(true); setTimeout(()=>setCopied(false), 2000); };

  const friends = [
    { name:"Sophie M.", joined:"12 Fév 2026", status:"Pro", earned:"10 crédits" },
    { name:"Théo R.", joined:"28 Fév 2026", status:"Free", earned:"En attente" },
  ];

  return (
    <div style={{ padding:"2rem", maxWidth:"800px", margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:"2.5rem" }}>
        <div style={{ fontSize:"48px", marginBottom:"12px" }}>🎁</div>
        <h1 style={{ fontSize:"2rem", fontWeight:900, letterSpacing:"-1px", marginBottom:"10px" }}>Parraine tes amis</h1>
        <p style={{ color:C.textMuted, fontSize:"14px", lineHeight:1.8 }}>
          Invite un ami → il reçoit <strong style={{ color:C.text }}>+20 crédits bonus</strong> · Toi tu reçois <strong style={{ color:C.text }}>+50 crédits</strong> quand il s'abonne
        </p>
      </div>

      {/* HOW */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"2rem" }}>
        {[["📨","Partage ton lien","Envoie ton lien unique à tes amis créateurs"],["✅","Ils s'inscrivent","Ils créent un compte avec ton lien et reçoivent +20 crédits"],["💰","Tu gagnes des crédits","+50 crédits quand ton filleul prend un abonnement payant"]].map(([icon,title,desc],i) => (
          <div key={i} className="card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:"28px", marginBottom:"10px" }}>{icon}</div>
            <div style={{ fontSize:"13px", fontWeight:700, marginBottom:"6px" }}>{title}</div>
            <div style={{ fontSize:"12px", color:C.textMuted, lineHeight:1.6 }}>{desc}</div>
          </div>
        ))}
      </div>

      {/* LINK */}
      <div className="card" style={{ marginBottom:"1.5rem" }}>
        <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"12px" }}>Ton lien de parrainage</div>
        <div style={{ display:"flex", gap:"8px", marginBottom:"12px" }}>
          <input className="input" value={refLink} readOnly style={{ flex:1, fontFamily:"monospace", fontSize:"12px" }} />
          <button className="btn-primary" style={{ padding:"10px 18px", whiteSpace:"nowrap", fontSize:"13px" }} onClick={()=>copy(refLink)}>
            {copied ? "✓ Copié !" : "Copier"}
          </button>
        </div>
        <div style={{ display:"flex", gap:"8px" }}>
          <div style={{ flex:1, background:C.bgCard2, borderRadius:"10px", padding:"10px", textAlign:"center" }}>
            <div style={{ fontFamily:"monospace", fontWeight:800, fontSize:"14px", letterSpacing:"1px" }}>{refCode}</div>
            <div style={{ fontSize:"11px", color:C.textMuted, marginTop:"3px" }}>Ton code promo</div>
          </div>
          <button className="btn-secondary" style={{ fontSize:"13px" }} onClick={()=>copy(refCode)}>Copier le code</button>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[["2","Filleuls inscrits"],["1","Abonnés payants"],["60","Crédits gagnés"]].map(([v,l],i)=>(
          <div key={i} className="card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:"2rem", fontWeight:900, color:C.accent }}>{v}</div>
            <div style={{ fontSize:"12px", color:C.textMuted, marginTop:"4px" }}>{l}</div>
          </div>
        ))}
      </div>

      {/* FRIENDS TABLE */}
      <div className="card">
        <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"1rem" }}>Tes filleuls</div>
        {friends.length === 0 ? (
          <div style={{ textAlign:"center", padding:"2rem", color:C.textMuted, fontSize:"13px" }}>Aucun filleul pour l'instant. Partage ton lien !</div>
        ) : (
          <table>
            <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
              {["Nom","Inscription","Statut","Crédits gagnés"].map((h,i)=><th key={i} style={{ padding:"8px 12px", textAlign:i===0?"left":"center", fontSize:"11px", color:C.textMuted, fontWeight:500, textTransform:"uppercase" }}>{h}</th>)}
            </tr></thead>
            <tbody>
              {friends.map((f,i)=>(
                <tr key={i} style={{ borderBottom: i<friends.length-1 ? `1px solid ${C.border}` : "none" }}>
                  <td style={{ padding:"12px", fontWeight:500, fontSize:"13px" }}>{f.name}</td>
                  <td style={{ padding:"12px", textAlign:"center", fontSize:"12px", color:C.textMuted }}>{f.joined}</td>
                  <td style={{ padding:"12px", textAlign:"center" }}><span className="badge" style={{ background: f.status==="Free" ? "rgba(85,84,106,0.2)" : "rgba(124,111,255,0.1)", color: f.status==="Free" ? C.textMuted : C.accent }}>{f.status}</span></td>
                  <td style={{ padding:"12px", textAlign:"center", fontWeight:600, color: f.earned==="En attente" ? C.textMuted : C.success }}>{f.earned}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS PAGE ────────────────────────────────────────────────────────────
function SettingsPage({ user, setUser, setPage }) {
  const [name, setName] = useState(user?.name || "");
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const save = () => { setUser({...user, name}); setSaved(true); setTimeout(()=>setSaved(false), 2000); };
  const [apiKey] = useState("ck_live_" + Math.random().toString(36).slice(2, 18));

  return (
    <div style={{ padding:"2rem", maxWidth:"700px", margin:"0 auto" }}>
      <h1 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.8px", marginBottom:"2rem" }}>Paramètres</h1>

      <div style={{ display:"flex", gap:"4px", background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"10px", padding:"4px", marginBottom:"1.5rem" }}>
        {[["profile","Profil"],["security","Sécurité"],["api","API"],["danger","Danger"]].map(([v,l]) => (
          <button key={v} style={{ flex:1, padding:"8px", borderRadius:"7px", border: tab===v ? `1px solid ${C.borderL}` : "1px solid transparent", cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight:500, background: tab===v ? C.bgCard2 : "transparent", color: tab===v && v==="danger" ? C.danger : tab===v ? C.text : C.textMuted, transition:"all 0.15s" }} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === "profile" && (
        <div className="card" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Nom complet</label><input className="input" value={name} onChange={e=>setName(e.target.value)} /></div>
          <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Email <span style={{ fontSize:"11px", color:C.textDim, marginLeft:"6px" }}>Non modifiable</span></label><input className="input" value={user?.email} readOnly style={{ opacity:0.5 }} /></div>
          <button className="btn-primary" style={{ alignSelf:"flex-start", padding:"10px 24px" }} onClick={save}>{saved ? "✓ Sauvegardé !" : "Sauvegarder"}</button>
        </div>
      )}

      {tab === "security" && (
        <div className="card" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Mot de passe actuel</label><input className="input" type="password" placeholder="••••••••" /></div>
          <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Nouveau mot de passe</label><input className="input" type="password" placeholder="••••••••" /></div>
          <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Confirmer</label><input className="input" type="password" placeholder="••••••••" /></div>
          <button className="btn-primary" style={{ alignSelf:"flex-start", padding:"10px 24px" }}>Changer le mot de passe</button>
        </div>
      )}

      {tab === "api" && (
        <div className="card" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div style={{ fontSize:"13px", color:C.textMuted, lineHeight:1.7 }}>Utilise ta clé API pour intégrer ClearCut dans tes propres outils.</div>
          <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Clé API</label>
            <div style={{ display:"flex", gap:"8px" }}>
              <input className="input" value={apiKey} readOnly style={{ fontFamily:"monospace", fontSize:"12px", flex:1 }} />
              <button className="btn-secondary" style={{ padding:"10px 16px", fontSize:"12px" }} onClick={()=>navigator.clipboard?.writeText(apiKey)}>Copier</button>
            </div>
          </div>
          <button className="btn-secondary" style={{ alignSelf:"flex-start", fontSize:"13px" }}>↻ Régénérer la clé</button>
        </div>
      )}

      {tab === "danger" && (
        <div className="card" style={{ border:`1px solid rgba(248,113,113,0.2)` }}>
          <div style={{ fontSize:"13px", fontWeight:600, color:C.danger, marginBottom:"8px" }}>Supprimer mon compte</div>
          <div style={{ fontSize:"13px", color:C.textMuted, marginBottom:"1rem", lineHeight:1.7 }}>Cette action est irréversible. Toutes tes vidéos et données seront supprimées définitivement.</div>
          <button className="btn-secondary" style={{ color:C.danger, borderColor:"rgba(248,113,113,0.3)", fontSize:"13px" }} onClick={()=>{ setUser(null); setPage("home"); }}>Supprimer mon compte définitivement</button>
        </div>
      )}
    </div>
  );
}

// ─── AI CHAT WIDGET ───────────────────────────────────────────────────────────
function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ role:"assistant", text:"Bonjour ! Je suis l'assistant ClearCut. Comment puis-je vous aider ?" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { if (open && bottomRef.current) bottomRef.current.scrollIntoView({ behavior:"smooth" }); }, [messages, open]);

  const send = async () => {
    const text = input.trim(); if (!text || loading) return;
    setInput("");
    const newMessages = [...messages, { role:"user", text }];
    setMessages(newMessages); setLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000,
          system:"Tu es l'assistant support de ClearCut, un SaaS de suppression de sous-titres par IA. Réponds en français, de façon concise et utile.",
          messages: newMessages.map(m => ({ role:m.role, content:m.text })) }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role:"assistant", text: data.content?.[0]?.text || "Désolé, une erreur s'est produite." }]);
    } catch { setMessages(prev => [...prev, { role:"assistant", text:"Erreur de connexion." }]); }
    setLoading(false);
  };

  return (
    <>
      {open && (
        <div style={{ position:"fixed", bottom:"90px", right:"24px", zIndex:1000, width:"360px", maxHeight:"520px", background:C.bgCard, border:`1px solid ${C.borderL}`, borderRadius:"16px", display:"flex", flexDirection:"column", boxShadow:"0 24px 60px rgba(0,0,0,0.6)", overflow:"hidden" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"14px 16px", borderBottom:`1px solid ${C.border}`, background:C.bgCard2 }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"14px", flexShrink:0 }}>✦</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:"14px", fontWeight:600 }}>Assistant ClearCut</div>
              <div style={{ fontSize:"11px", color:C.success, display:"flex", alignItems:"center", gap:"4px" }}><span style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.success, display:"inline-block" }} /> En ligne</div>
            </div>
            <button className="btn-ghost" style={{ fontSize:"18px" }} onClick={()=>setOpen(false)}>×</button>
          </div>
          <div style={{ flex:1, overflowY:"auto", padding:"16px", display:"flex", flexDirection:"column", gap:"12px", minHeight:0 }}>
            {messages.map((m,i) => (
              <div key={i} style={{ display:"flex", justifyContent: m.role==="user" ? "flex-end" : "flex-start" }}>
                {m.role==="assistant" && <div style={{ width:"24px", height:"24px", borderRadius:"6px", flexShrink:0, marginRight:"8px", marginTop:"2px", background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px" }}>✦</div>}
                <div style={{ maxWidth:"78%", padding:"10px 13px", borderRadius: m.role==="user" ? "12px 12px 4px 12px" : "12px 12px 12px 4px", background: m.role==="user" ? C.grad : C.bgCard2, border: m.role==="user" ? "none" : `1px solid ${C.border}`, fontSize:"13px", lineHeight:1.6, whiteSpace:"pre-wrap" }}>{m.text}</div>
              </div>
            ))}
            {loading && <div style={{ display:"flex", gap:"8px", alignItems:"center" }}><div style={{ width:"24px", height:"24px", borderRadius:"6px", background:C.grad, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"10px" }}>✦</div><div style={{ background:C.bgCard2, border:`1px solid ${C.border}`, borderRadius:"12px 12px 12px 4px", padding:"10px 14px", display:"flex", gap:"4px", alignItems:"center" }}>{[0,1,2].map(i=><span key={i} style={{ width:"6px", height:"6px", borderRadius:"50%", background:C.textDim, display:"inline-block", animation:`bounce 1s ease-in-out ${i*0.15}s infinite` }}/>)}</div></div>}
            <div ref={bottomRef} />
          </div>
          <div style={{ padding:"12px 14px", borderTop:`1px solid ${C.border}`, display:"flex", gap:"8px", alignItems:"flex-end" }}>
            <textarea style={{ resize:"none", flex:1, minHeight:"38px", maxHeight:"90px", lineHeight:1.5, padding:"9px 12px", fontSize:"13px", background:C.bgCard2, border:`1px solid ${C.borderL}`, borderRadius:"10px", color:C.text, fontFamily:"inherit", outline:"none" }} placeholder="Posez votre question..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}}} rows={1} />
            <button className="btn-primary" style={{ padding:"9px 14px", fontSize:"16px", opacity: input.trim()&&!loading ? 1 : 0.4 }} onClick={send} disabled={!input.trim()||loading}>↑</button>
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(o=>!o)} style={{ position:"fixed", bottom:"24px", right:"24px", zIndex:1001, width:"56px", height:"56px", borderRadius:"16px", background:C.grad, border:"none", cursor:"pointer", boxShadow:"0 8px 24px rgba(124,111,255,0.5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"22px", transition:"transform 0.2s, box-shadow 0.2s" }}
        onMouseEnter={e=>{e.currentTarget.style.transform="scale(1.1)";e.currentTarget.style.boxShadow="0 12px 32px rgba(124,111,255,0.7)";}}
        onMouseLeave={e=>{e.currentTarget.style.transform="scale(1)";e.currentTarget.style.boxShadow="0 8px 24px rgba(124,111,255,0.5)";}}>
        {open ? "×" : "✦"}
      </button>
    </>
  );
}

// ─── FULL ADMIN DASHBOARD ────────────────────────────────────────────────────
function AdminDashboard({ setPage }) {
  const [tab, setTab] = useState("analytics");

  const tabs = [["analytics","◈ Analytics"],["users","◉ Utilisateurs"],["subs","◊ Abonnements"],["promo","◎ Codes promo"],["jobs","▶ Jobs vidéo"]];

  return (
    <div style={{ padding:"1.5rem", maxWidth:"1200px", margin:"0 auto" }}>
      {/* HEADER */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <span className="badge" style={{ background:"rgba(248,113,113,0.12)", color:C.danger, border:`1px solid rgba(248,113,113,0.25)` }}>ADMIN</span>
          <h1 style={{ fontSize:"1.3rem", fontWeight:800, letterSpacing:"-0.5px" }}>ClearCut Dashboard</h1>
        </div>
        <button className="btn-secondary" style={{ fontSize:"12px" }} onClick={()=>setPage("home")}>← Retour au site</button>
      </div>

      {/* TABS */}
      <div style={{ display:"flex", gap:"4px", background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"12px", padding:"4px", marginBottom:"1.5rem", overflowX:"auto" }}>
        {tabs.map(([v,l]) => (
          <button key={v} style={{ flex:1, padding:"9px 12px", borderRadius:"9px", border: tab===v ? `1px solid ${C.borderL}` : "1px solid transparent", cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:600, background: tab===v ? C.bgCard2 : "transparent", color: tab===v ? C.text : C.textMuted, transition:"all 0.15s", whiteSpace:"nowrap" }} onClick={()=>setTab(v)}>{l}</button>
        ))}
      </div>

      {tab === "analytics" && <AdminAnalytics />}
      {tab === "users"     && <AdminUsers />}
      {tab === "subs"      && <AdminSubscriptions />}
      {tab === "promo"     && <AdminPromo />}
      {tab === "jobs"      && <AdminJobs />}
    </div>
  );
}

// ── Analytics ──
function AdminAnalytics() {
  const [period, setPeriod] = useState("30j");
  const [metric, setMetric] = useState("mrr");
  const [tooltip, setTooltip] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const svgRef = useRef(null);

  const periods = ["7j","30j","90j","12m","YTD"];

  const chartData = {
    mrr:     [3100,3250,3400,3550,3700,3800,3950,4100,4300,4500,4700,4820],
    users:   [1200,1280,1350,1420,1500,1580,1650,1720,1780,1840,1890,1924],
    videos:  [8200,8800,9100,9600,10200,10800,11200,11800,12400,13100,13800,14200],
    credits: [82000,88000,91000,96000,102000,108000,112000,118000,124000,131000,138000,142000],
  };
  const months = ["Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc","Jan","Fév","Mar"];
  const metricLabels = { mrr:"MRR (€)", users:"Utilisateurs", videos:"Vidéos/jour", credits:"Crédits utilisés" };
  const metricColors = { mrr:C.accent, users:C.cyan, videos:C.pink, credits:C.warning };

  const data = chartData[metric];
  const maxVal = Math.max(...data);
  const minVal = Math.min(...data);
  const W = 700, H = 180, PAD = 10;
  const pts = data.map((v,i) => ({ x: PAD + (i/(data.length-1))*(W-PAD*2), y: PAD + (1-(v-minVal)/(maxVal-minVal||1))*(H-PAD*2) }));
  const pathD = pts.map((p,i)=>i===0?`M${p.x},${p.y}`:`L${p.x},${p.y}`).join(" ");
  const areaD = `${pathD} L${pts[pts.length-1].x},${H} L${pts[0].x},${H} Z`;

  const handleSvgMove = (e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const xPct = (e.clientX - rect.left) / rect.width;
    const idx = Math.round(xPct * (data.length - 1));
    if (idx >= 0 && idx < data.length) {
      const pt = pts[idx];
      setTooltip({ idx, x: (pt.x/W)*100, y: (pt.y/H)*100, value: data[idx] });
    }
  };

  const monthlyRevenue = [
    { m:"Oct",  pro:1240, creator:980, biz:600, credits:180 },
    { m:"Nov",  pro:1310, creator:1050, biz:650, credits:210 },
    { m:"Déc",  pro:1380, creator:1120, biz:720, credits:240 },
    { m:"Jan",  pro:1420, creator:1180, biz:750, credits:260 },
    { m:"Fév",  pro:1480, creator:1240, biz:780, credits:290 },
    { m:"Mar",  pro:1540, creator:1300, biz:820, credits:320 },
  ];
  const maxRev = Math.max(...monthlyRevenue.map(r=>r.pro+r.creator+r.biz+r.credits));

  const selM = selectedMonth !== null ? monthlyRevenue[selectedMonth] : null;

  return (
    <div>
      {/* KPIs */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(6,1fr)", gap:"10px", marginBottom:"1.5rem" }}>
        {[
          { l:"MRR", v:"4 820€", c:"+12.4%", col:C.accent },
          { l:"ARR", v:"57 840€", c:"+14.1%", col:C.accent2 },
          { l:"Utilisateurs actifs", v:"1 924", c:"+8.7%", col:C.cyan },
          { l:"Churn rate", v:"2.3%", c:"−0.4pt", col:C.success },
          { l:"ARPU", v:"2.51€", c:"+3.2%", col:C.pink },
          { l:"Vidéos/jour", v:"474", c:"+6.8%", col:C.warning },
        ].map((k,i) => (
          <div key={i} className="card" style={{ padding:"1rem" }}>
            <div style={{ fontSize:"10px", color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"6px" }}>{k.l}</div>
            <div style={{ fontSize:"1.2rem", fontWeight:800, letterSpacing:"-0.5px", color:k.col }}>{k.v}</div>
            <div style={{ fontSize:"11px", color:C.success, marginTop:"3px" }}>▲ {k.c}</div>
          </div>
        ))}
      </div>

      {/* CHART */}
      <div className="card" style={{ marginBottom:"1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
          <div style={{ display:"flex", gap:"6px" }}>
            {Object.entries(metricLabels).map(([k,l]) => (
              <button key={k} style={{ padding:"5px 12px", borderRadius:"8px", border:`1px solid ${metric===k ? metricColors[k]+"55" : C.borderL}`, background: metric===k ? `${metricColors[k]}15` : "transparent", color: metric===k ? metricColors[k] : C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:"11px", fontWeight:600, transition:"all 0.15s" }} onClick={()=>setMetric(k)}>{l}</button>
            ))}
          </div>
          <div style={{ display:"flex", gap:"4px" }}>
            {periods.map(p => (
              <button key={p} style={{ padding:"4px 10px", borderRadius:"6px", border:`1px solid ${period===p ? C.borderL : "transparent"}`, background: period===p ? C.bgCard2 : "transparent", color: period===p ? C.text : C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:"11px", fontWeight:500 }} onClick={()=>setPeriod(p)}>{p}</button>
            ))}
          </div>
        </div>

        <div style={{ position:"relative" }} onMouseLeave={()=>setTooltip(null)}>
          <svg ref={svgRef} viewBox={`0 0 ${W} ${H}`} style={{ width:"100%", height:"180px", overflow:"visible" }} onMouseMove={handleSvgMove}>
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={metricColors[metric]} stopOpacity="0.2"/>
                <stop offset="100%" stopColor={metricColors[metric]} stopOpacity="0"/>
              </linearGradient>
            </defs>
            <path d={areaD} fill="url(#areaGrad)" />
            <path d={pathD} fill="none" stroke={metricColors[metric]} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            {tooltip && (
              <>
                <line x1={pts[tooltip.idx].x} y1={PAD} x2={pts[tooltip.idx].x} y2={H-PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1" strokeDasharray="4,3"/>
                <circle cx={pts[tooltip.idx].x} cy={pts[tooltip.idx].y} r="5" fill={metricColors[metric]} stroke="#fff" strokeWidth="2"/>
              </>
            )}
          </svg>

          {/* Tooltip */}
          {tooltip && (
            <div style={{ position:"absolute", top:`${tooltip.y}%`, left:`${Math.min(tooltip.x, 75)}%`, transform:"translate(10px,-50%)", background:C.bgCard, border:`1px solid ${metricColors[metric]}44`, borderRadius:"10px", padding:"8px 12px", fontSize:"12px", pointerEvents:"none", zIndex:10, whiteSpace:"nowrap", boxShadow:`0 0 0 1px ${metricColors[metric]}22` }}>
              <div style={{ fontSize:"10px", color:C.textMuted, marginBottom:"3px" }}>{months[tooltip.idx]}</div>
              <div style={{ fontWeight:700, color:metricColors[metric] }}>{tooltip.value.toLocaleString("fr-FR")}{metric==="mrr"?"€":""}</div>
            </div>
          )}

          {/* X labels */}
          <div style={{ display:"flex", justifyContent:"space-between", marginTop:"6px" }}>
            {months.map((m,i) => <span key={i} style={{ fontSize:"10px", color:C.textDim }}>{m}</span>)}
          </div>
        </div>
      </div>

      {/* REVENUE TOTAL + MONTHLY BARS */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", marginBottom:"1.5rem" }}>
        <div className="card">
          <div style={{ fontSize:"11px", color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"8px" }}>Revenus totaux depuis Jan 2025</div>
          <div style={{ fontSize:"2rem", fontWeight:900, letterSpacing:"-1px", color:C.accent, marginBottom:"4px" }}>148 920€</div>
          <div style={{ fontSize:"12px", color:C.textMuted }}>Net Stripe · TVA incluse</div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"8px", marginTop:"1rem" }}>
            {[["Pro","74 160€",C.accent2],["Creator","52 200€",C.accent],["Business","22 560€",C.pink]].map(([l,v,col],i)=>(
              <div key={i} style={{ background:C.bgCard2, borderRadius:"8px", padding:"8px" }}>
                <div style={{ fontSize:"10px", color:C.textMuted, marginBottom:"3px" }}>{l}</div>
                <div style={{ fontSize:"13px", fontWeight:700, color:col }}>{v}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize:"11px", color:C.textMuted, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"12px" }}>Revenus mensuels · Cliquer pour détail</div>
          <div style={{ display:"flex", gap:"6px", alignItems:"flex-end", height:"80px" }}>
            {monthlyRevenue.map((r,i) => {
              const total = r.pro+r.creator+r.biz+r.credits;
              const h = (total/maxRev)*70;
              const isSelected = selectedMonth === i;
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px", cursor:"pointer" }} onClick={()=>setSelectedMonth(isSelected ? null : i)}>
                  <div style={{ width:"100%", height:`${h}px`, background: isSelected ? C.success : C.grad, borderRadius:"4px 4px 0 0", transition:"all 0.2s" }} />
                  <span style={{ fontSize:"9px", color: isSelected ? C.success : C.textDim }}>{r.m}</span>
                </div>
              );
            })}
          </div>
          {selM && (
            <div style={{ marginTop:"12px", padding:"10px", background:C.bgCard2, borderRadius:"8px", fontSize:"12px" }}>
              <div style={{ fontWeight:700, marginBottom:"6px", color:C.success }}>Détail {monthlyRevenue[selectedMonth].m}</div>
              {[["Pro",selM.pro,C.accent2],["Creator",selM.creator,C.accent],["Business",selM.biz,C.pink],["Crédits",selM.credits,C.warning]].map(([l,v,col],i)=>(
                <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"4px" }}>
                  <span style={{ color:C.textMuted }}>{l}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:"60px", height:"4px", background:C.border, borderRadius:"2px", overflow:"hidden" }}>
                      <div style={{ width:`${(v/(selM.pro+selM.creator+selM.biz+selM.credits))*100}%`, height:"100%", background:col, borderRadius:"2px" }} />
                    </div>
                    <span style={{ fontWeight:600, color:col }}>{v}€</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* PLAN BREAKDOWN */}
      <div className="card">
        <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"1rem" }}>Répartition par plan</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
          {[["Free","892","46.4%",C.textMuted],["Pro","631","32.8%",C.accent2],["Creator","284","14.7%",C.accent],["Business","117","6.1%",C.pink]].map(([plan,n,pct,col],i)=>(
            <div key={i}>
              <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"5px" }}>
                <span style={{ fontSize:"12px", fontWeight:600, color:col }}>{plan}</span>
                <span style={{ fontSize:"12px", color:C.textMuted }}>{n} users</span>
              </div>
              <div style={{ height:"5px", background:C.border, borderRadius:"999px", overflow:"hidden" }}>
                <div style={{ width:pct, height:"100%", background:col, borderRadius:"999px" }} />
              </div>
              <div style={{ fontSize:"11px", color:C.textDim, marginTop:"3px", textAlign:"right" }}>{pct}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Users ──
function AdminUsers() {
  const [search, setSearch] = useState("");
  const [filterPlan, setFilterPlan] = useState("Tous");
  const [editUser, setEditUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const planColors = { Free:C.textMuted, Pro:C.accent2, Creator:C.accent, Business:C.pink };

  useEffect(() => {
    fetch('/api/admin/users')
      .then(r => r.json())
      .then(({ profiles }) => {
        if (profiles) {
          setUsers(profiles.map(p => ({
            id: p.id,
            name: p.name || "—",
            email: p.email || "—",
            plan: p.plan || "Free",
            credits: p.credits || 0,
            videos: 0,
            revenue: "0€",
            status: "actif",
            joined: new Date(p.created_at).toLocaleDateString("fr-FR", { day:"numeric", month:"short", year:"numeric" }),
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filtered = users.filter(u =>
    (filterPlan === "Tous" || u.plan === filterPlan) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const saveEdit = () => {
    setUsers(prev => prev.map(u => u.id === editUser.id ? editUser : u));
    setEditUser(null);
  };

  return (
    <div>
      <div style={{ display:"flex", gap:"10px", marginBottom:"1rem", alignItems:"center" }}>
        <input className="input" placeholder="🔍 Rechercher par nom ou email…" value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1 }} />
        <select value={filterPlan} onChange={e=>setFilterPlan(e.target.value)} style={{ width:"140px" }}>
          {["Tous","Free","Pro","Creator","Business"].map(p=><option key={p}>{p}</option>)}
        </select>
        <div style={{ fontSize:"13px", color:C.textMuted, whiteSpace:"nowrap" }}>
          <strong style={{ color:C.success }}>{users.length}</strong> utilisateurs réels
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign:"center", padding:"3rem", color:C.textMuted }}>
          <div style={{ fontSize:"24px", marginBottom:"8px", animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</div>
          <div>Chargement des utilisateurs...</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign:"center", padding:"3rem", color:C.textMuted }}>
          Aucun utilisateur trouvé
        </div>
      ) : (
        <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table>
          <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {["Utilisateur","Plan","Crédits","Vidéos","Revenus","Statut","Inscrit",""].map((h,i)=>(
              <th key={i} style={{ padding:"10px 14px", textAlign:i===0?"left":"center", fontSize:"11px", color:C.textMuted, fontWeight:500, textTransform:"uppercase", letterSpacing:"0.4px" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((u,i)=>(
              <tr key={u.id} style={{ borderBottom: i<filtered.length-1 ? `1px solid ${C.border}` : "none" }}>
                <td style={{ padding:"12px 14px" }}>
                  <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                    <div style={{ width:"32px", height:"32px", borderRadius:"8px", background:`${planColors[u.plan]}22`, border:`1px solid ${planColors[u.plan]}44`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"12px", fontWeight:700, color:planColors[u.plan], flexShrink:0 }}>{u.name[0]}</div>
                    <div>
                      <div style={{ fontSize:"13px", fontWeight:600 }}>{u.name}</div>
                      <div style={{ fontSize:"11px", color:C.textMuted }}>{u.email}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}><span className="badge" style={{ background:`${planColors[u.plan]}15`, color:planColors[u.plan] }}>{u.plan}</span></td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontWeight:600, fontSize:"13px", color: u.credits < 50 ? C.warning : C.text }}>{u.credits.toLocaleString("fr-FR")}</td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"13px", color:C.textMuted }}>{u.videos}</td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontWeight:600, fontSize:"13px" }}>{u.revenue}</td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}><span className="badge" style={{ background: u.status==="actif" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)", color: u.status==="actif" ? C.success : C.danger }}>{u.status}</span></td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"11px", color:C.textMuted }}>{u.joined}</td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}><button className="btn-secondary" style={{ padding:"4px 12px", fontSize:"11px" }} onClick={()=>setEditUser({...u})}>Modifier</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}

      {/* EDIT MODAL */}
      {editUser && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }} onClick={()=>setEditUser(null)}>
          <div className="card scale-in" style={{ width:"420px", position:"relative" }} onClick={e=>e.stopPropagation()}>
            <button className="btn-ghost" style={{ position:"absolute", top:"12px", right:"12px", fontSize:"18px" }} onClick={()=>setEditUser(null)}>×</button>
            <div style={{ fontWeight:700, fontSize:"15px", marginBottom:"1rem" }}>Modifier — {editUser.name}</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div>
                <label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Plan</label>
                <select value={editUser.plan} onChange={e=>setEditUser({...editUser, plan:e.target.value})} style={{ width:"100%" }}>
                  {["Free","Pro","Creator","Business"].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Crédits</label>
                <input className="input" type="number" value={editUser.credits} onChange={e=>setEditUser({...editUser, credits:+e.target.value})} />
                <div style={{ display:"flex", gap:"6px", marginTop:"6px" }}>
                  {[50,100,500,1000].map(n=>(
                    <button key={n} className="btn-secondary" style={{ flex:1, padding:"5px", fontSize:"11px" }} onClick={()=>setEditUser({...editUser, credits:editUser.credits+n})}>+{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Statut</label>
                <select value={editUser.status} onChange={e=>setEditUser({...editUser, status:e.target.value})} style={{ width:"100%" }}>
                  <option>actif</option><option>suspendu</option>
                </select>
              </div>
              <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
                <button className="btn-primary" style={{ flex:2 }} onClick={saveEdit}>Sauvegarder</button>
                <button className="btn-secondary" style={{ flex:1, color:C.danger, borderColor:"rgba(248,113,113,0.3)", fontSize:"13px" }} onClick={()=>{ setUsers(prev=>prev.filter(u=>u.id!==editUser.id)); setEditUser(null); }}>Supprimer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Subscriptions ──
function AdminSubscriptions() {
  const [filter, setFilter] = useState("Tous");
  const [subs, setSubs] = useState([
    { id:1, user:"Sophie Martin",   plan:"Creator", amount:"49€",  cycle:"mensuel", status:"actif",    renewal:"1 Avr 2026",  since:"12 Jan 2026" },
    { id:2, user:"Théo Rousseau",   plan:"Pro",     amount:"19€",  cycle:"mensuel", status:"actif",    renewal:"28 Mar 2026", since:"28 Jan 2026" },
    { id:3, user:"Lucas Bernard",   plan:"Business",amount:"99€",  cycle:"annuel",  status:"actif",    renewal:"3 Jan 2027",  since:"3 Jan 2026" },
    { id:4, user:"Emma Leroy",      plan:"Pro",     amount:"19€",  cycle:"mensuel", status:"annulé",   renewal:"—",           since:"20 Déc 2025" },
    { id:5, user:"Nathan Moreau",   plan:"Creator", amount:"470€", cycle:"annuel",  status:"actif",    renewal:"8 Fév 2027",  since:"8 Fév 2026" },
    { id:6, user:"Marie Petit",     plan:"Pro",     amount:"190€", cycle:"annuel",  status:"actif",    renewal:"15 Mar 2027", since:"15 Mar 2025" },
  ]);
  const planColors = { Free:C.textMuted, Pro:C.accent2, Creator:C.accent, Business:C.pink };
  const filtered = subs.filter(s => filter==="Tous" || (filter==="Actifs"&&s.status==="actif") || (filter==="Annulés"&&s.status==="annulé"));
  const mrr = subs.filter(s=>s.status==="actif"&&s.cycle==="mensuel").reduce((a,s)=>a+parseInt(s.amount),0);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"1rem" }}>
        <div style={{ display:"flex", gap:"6px" }}>
          {["Tous","Actifs","Annulés"].map(f=>(
            <button key={f} style={{ padding:"6px 14px", borderRadius:"8px", border:`1px solid ${filter===f ? C.accent : C.borderL}`, background: filter===f ? "rgba(124,111,255,0.1)" : "transparent", color: filter===f ? C.accent : C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:500 }} onClick={()=>setFilter(f)}>{f}</button>
          ))}
        </div>
        <div style={{ fontSize:"13px" }}>MRR actif : <strong style={{ color:C.success }}>{mrr}€</strong></div>
      </div>

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table>
          <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {["Utilisateur","Plan","Montant","Cycle","Statut","Prochain renouvellement","Depuis",""].map((h,i)=>(
              <th key={i} style={{ padding:"10px 14px", textAlign:i===0?"left":"center", fontSize:"11px", color:C.textMuted, fontWeight:500, textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((s,i)=>(
              <tr key={s.id} style={{ borderBottom: i<filtered.length-1?`1px solid ${C.border}`:"none" }}>
                <td style={{ padding:"12px 14px", fontWeight:500, fontSize:"13px" }}>{s.user}</td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}><span className="badge" style={{ background:`${planColors[s.plan]}15`, color:planColors[s.plan] }}>{s.plan}</span></td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontWeight:700 }}>{s.amount}</td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"12px", color:C.textMuted }}>{s.cycle}</td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}><span className="badge" style={{ background: s.status==="actif"?"rgba(52,211,153,0.1)":"rgba(248,113,113,0.1)", color: s.status==="actif"?C.success:C.danger }}>{s.status}</span></td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"12px", color:C.textMuted }}>{s.renewal}</td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"11px", color:C.textDim }}>{s.since}</td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}>
                  <button className="btn-secondary" style={{ padding:"4px 10px", fontSize:"11px", color: s.status==="actif"?C.danger:C.success, borderColor: s.status==="actif"?"rgba(248,113,113,0.3)":"rgba(52,211,153,0.3)" }}
                    onClick={()=>setSubs(prev=>prev.map(x=>x.id===s.id?{...x,status:x.status==="actif"?"annulé":"actif"}:x))}>
                    {s.status==="actif"?"Annuler":"Réactiver"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Promo codes ──
function AdminPromo() {
  const [showCreate, setShowCreate] = useState(false);
  const [codes, setCodes] = useState([
    { id:1, code:"LAUNCH50",    type:"Pourcentage",      value:"50%",    plans:["Pro","Creator","Business"], uses:142, maxUses:200, expiry:"31 Mar 2026", active:true },
    { id:2, code:"BIENVENUE20", type:"Pourcentage",      value:"20%",    plans:["Pro","Creator","Business"], uses:89,  maxUses:null, expiry:"—",          active:true },
    { id:3, code:"CREDITS100",  type:"Crédits offerts",  value:"100 cr", plans:["Pro","Creator"],            uses:34,  maxUses:100,  expiry:"30 Avr 2026", active:true },
    { id:4, code:"VIP10",       type:"Montant fixe",     value:"10€",    plans:["Business"],                 uses:12,  maxUses:50,   expiry:"30 Jun 2026", active:false },
  ]);
  const [newCode, setNewCode] = useState({ code:"", type:"Pourcentage", value:"", maxUses:"", expiry:"", plans:["Pro","Creator","Business"] });

  const togglePlan = (p) => setNewCode(prev => ({ ...prev, plans: prev.plans.includes(p) ? prev.plans.filter(x=>x!==p) : [...prev.plans,p] }));

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"1rem" }}>
        <button className="btn-primary" style={{ fontSize:"13px" }} onClick={()=>setShowCreate(true)}>+ Créer un code promo</button>
      </div>

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table>
          <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {["Code","Type","Valeur","Plans","Utilisations","Expiration","Statut",""].map((h,i)=>(
              <th key={i} style={{ padding:"10px 14px", textAlign:i===0?"left":"center", fontSize:"11px", color:C.textMuted, fontWeight:500, textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {codes.map((c,i)=>(
              <tr key={c.id} style={{ borderBottom: i<codes.length-1?`1px solid ${C.border}`:"none" }}>
                <td style={{ padding:"12px 14px", fontFamily:"monospace", fontWeight:700, fontSize:"13px", color:C.accent }}>{c.code}</td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"12px", color:C.textMuted }}>{c.type}</td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontWeight:700 }}>{c.value}</td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}><div style={{ display:"flex", gap:"3px", justifyContent:"center", flexWrap:"wrap" }}>{c.plans.map(p=><span key={p} style={{ fontSize:"10px", padding:"1px 6px", borderRadius:"4px", background:"rgba(124,111,255,0.1)", color:C.accent }}>{p}</span>)}</div></td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ fontSize:"12px", marginBottom:"3px" }}>{c.uses}{c.maxUses?` / ${c.maxUses}`:""}</div>
                  {c.maxUses && <div style={{ height:"3px", background:C.border, borderRadius:"2px" }}><div style={{ width:`${(c.uses/c.maxUses)*100}%`, height:"100%", background:C.accent, borderRadius:"2px" }}/></div>}
                </td>
                <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"12px", color:C.textMuted }}>{c.expiry}</td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}><span className="badge" style={{ background: c.active?"rgba(52,211,153,0.1)":"rgba(85,84,106,0.2)", color: c.active?C.success:C.textDim }}>{c.active?"Actif":"Pausé"}</span></td>
                <td style={{ padding:"12px 14px", textAlign:"center" }}>
                  <div style={{ display:"flex", gap:"4px", justifyContent:"center" }}>
                    <button className="btn-secondary" style={{ padding:"3px 8px", fontSize:"10px" }} onClick={()=>setCodes(prev=>prev.map(x=>x.id===c.id?{...x,active:!x.active}:x))}>{c.active?"Pause":"Activer"}</button>
                    <button className="btn-secondary" style={{ padding:"3px 8px", fontSize:"10px", color:C.danger, borderColor:"rgba(248,113,113,0.3)" }} onClick={()=>setCodes(prev=>prev.filter(x=>x.id!==c.id))}>✕</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CREATE MODAL */}
      {showCreate && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", zIndex:600, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:"blur(4px)" }} onClick={()=>setShowCreate(false)}>
          <div className="card scale-in" style={{ width:"460px" }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:700, fontSize:"15px", marginBottom:"1.25rem" }}>Créer un code promo</div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Code</label>
                <input className="input" placeholder="EX: SUMMER30" value={newCode.code} onChange={e=>setNewCode({...newCode,code:e.target.value.toUpperCase()})} style={{ fontFamily:"monospace", fontWeight:700, letterSpacing:"1px" }} /></div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Type</label>
                  <select style={{ width:"100%" }} value={newCode.type} onChange={e=>setNewCode({...newCode,type:e.target.value})}>
                    <option>Pourcentage</option><option>Crédits offerts</option><option>Montant fixe</option>
                  </select></div>
                <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Valeur</label>
                  <input className="input" placeholder="Ex: 30 ou 100" value={newCode.value} onChange={e=>setNewCode({...newCode,value:e.target.value})} /></div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
                <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Max utilisations <span style={{ color:C.textDim }}>(vide = illimité)</span></label>
                  <input className="input" placeholder="Ex: 200" type="number" value={newCode.maxUses} onChange={e=>setNewCode({...newCode,maxUses:e.target.value})} /></div>
                <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Date d'expiration</label>
                  <input className="input" type="date" value={newCode.expiry} onChange={e=>setNewCode({...newCode,expiry:e.target.value})} /></div>
              </div>
              <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"8px", display:"block" }}>Plans éligibles</label>
                <div style={{ display:"flex", gap:"6px" }}>
                  {["Free","Pro","Creator","Business"].map(p=>(
                    <button key={p} style={{ flex:1, padding:"7px", borderRadius:"8px", border:`1px solid ${newCode.plans.includes(p)?C.accent:C.borderL}`, background: newCode.plans.includes(p)?"rgba(124,111,255,0.1)":"transparent", color: newCode.plans.includes(p)?C.accent:C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:500 }} onClick={()=>togglePlan(p)}>{p}</button>
                  ))}
                </div>
              </div>
              {newCode.code && <div style={{ padding:"10px 12px", background:"rgba(124,111,255,0.08)", borderRadius:"8px", fontSize:"12px", color:C.textMuted }}>
                Code <strong style={{ color:C.accent, fontFamily:"monospace" }}>{newCode.code}</strong> : {newCode.type} de <strong style={{ color:C.text }}>{newCode.value}</strong> sur {newCode.plans.join(", ")}
              </div>}
              <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
                <button className="btn-primary" style={{ flex:2 }} onClick={()=>{
                  setCodes(prev=>[...prev,{ id:Date.now(), ...newCode, uses:0, active:true, expiry:newCode.expiry||"—", maxUses:newCode.maxUses?+newCode.maxUses:null }]);
                  setShowCreate(false);
                  setNewCode({ code:"", type:"Pourcentage", value:"", maxUses:"", expiry:"", plans:["Pro","Creator","Business"] });
                }}>Créer le code</button>
                <button className="btn-secondary" style={{ flex:1 }} onClick={()=>setShowCreate(false)}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Video Jobs ──
function AdminJobs() {
  const [filter, setFilter] = useState("Tous");
  const jobs = [
    { id:"job_a1b2c3", user:"Sophie Martin",  file:"tiktok_final.mp4",    size:"45 MB",  dur:"0:42",  credits:2, status:"done",       time:"Il y a 5 min" },
    { id:"job_d4e5f6", user:"Lucas Bernard",  file:"youtube_vlog_ep12.mp4",size:"820 MB", dur:"18:30", credits:18,status:"done",       time:"Il y a 12 min" },
    { id:"job_g7h8i9", user:"Camille Dubois", file:"reel_mode.mp4",        size:"28 MB",  dur:"0:28",  credits:2, status:"processing", time:"En cours" },
    { id:"job_j0k1l2", user:"Théo Rousseau",  file:"anime_ep03.mkv",       size:"720 MB", dur:"22:00", credits:22,status:"queued",     time:"En attente" },
    { id:"job_m3n4o5", user:"Emma Leroy",     file:"short_fail.mp4",       size:"12 MB",  dur:"0:15",  credits:0, status:"error",      time:"Il y a 2h" },
    { id:"job_p6q7r8", user:"Nathan Moreau",  file:"batch_001.mp4",        size:"156 MB", dur:"4:20",  credits:5, status:"done",       time:"Il y a 1h" },
  ];
  const statusCfg = {
    done:       { bg:"rgba(52,211,153,0.1)",  color:C.success, label:"✓ Terminé" },
    processing: { bg:"rgba(251,191,36,0.1)",  color:C.warning, label:"⟳ En cours" },
    queued:     { bg:"rgba(79,142,255,0.1)",  color:C.accent2, label:"◷ File d'att." },
    error:      { bg:"rgba(248,113,113,0.1)", color:C.danger,  label:"✕ Erreur" },
  };
  const filtered = jobs.filter(j => filter==="Tous" || j.status === filter.toLowerCase().replace(" ","_").replace("é","e").replace("è","e"));

  return (
    <div>
      <div style={{ display:"flex", gap:"6px", marginBottom:"1rem" }}>
        {["Tous","done","processing","queued","error"].map((f,i)=>{
          const labels = ["Tous","Terminés","En cours","File d'attente","Erreurs"];
          return (
            <button key={f} style={{ padding:"6px 14px", borderRadius:"8px", border:`1px solid ${filter===f?C.accent:C.borderL}`, background: filter===f?"rgba(124,111,255,0.1)":"transparent", color: filter===f?C.accent:C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:"12px", fontWeight:500 }} onClick={()=>setFilter(f)}>{labels[i]}</button>
          );
        })}
      </div>

      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <table>
          <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {["Job ID","Utilisateur","Fichier","Durée","Crédits","Statut","Date","Action"].map((h,i)=>(
              <th key={i} style={{ padding:"10px 14px", textAlign:i===0?"left":"center", fontSize:"11px", color:C.textMuted, fontWeight:500, textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map((j,i)=>{
              const sc = statusCfg[j.status];
              return (
                <tr key={j.id} style={{ borderBottom: i<filtered.length-1?`1px solid ${C.border}`:"none" }}>
                  <td style={{ padding:"12px 14px", fontFamily:"monospace", fontSize:"11px", color:C.textDim }}>{j.id}</td>
                  <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"12px" }}>{j.user}</td>
                  <td style={{ padding:"12px 14px", textAlign:"center" }}>
                    <div style={{ fontSize:"12px", fontWeight:500 }}>{j.file}</div>
                    <div style={{ fontSize:"10px", color:C.textDim }}>{j.size}</div>
                  </td>
                  <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"12px", fontFamily:"monospace", color:C.textMuted }}>{j.dur}</td>
                  <td style={{ padding:"12px 14px", textAlign:"center", fontWeight:600, fontSize:"13px" }}>{j.credits > 0 ? j.credits : "—"}</td>
                  <td style={{ padding:"12px 14px", textAlign:"center" }}><span className="badge" style={{ background:sc.bg, color:sc.color }}>{sc.label}</span></td>
                  <td style={{ padding:"12px 14px", textAlign:"center", fontSize:"11px", color:C.textMuted }}>{j.time}</td>
                  <td style={{ padding:"12px 14px", textAlign:"center" }}>
                    {j.status==="done"  && <button className="btn-secondary" style={{ padding:"3px 10px", fontSize:"10px" }}>Voir</button>}
                    {j.status==="error" && <button className="btn-secondary" style={{ padding:"3px 10px", fontSize:"10px", color:C.warning, borderColor:"rgba(251,191,36,0.3)" }}>↻ Retry</button>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── FEATURES PAGE ────────────────────────────────────────────────────────────
function FeaturesPage({ setPage }) {
  return (
    <div style={{ padding:"4rem 2rem", maxWidth:"1100px", margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:"4rem" }}>
        <div className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent, border:`1px solid rgba(124,111,255,0.2)`, marginBottom:"1rem" }}>Fonctionnalités</div>
        <h1 style={{ fontSize:"3rem", fontWeight:900, letterSpacing:"-2px", marginBottom:"1rem" }}>
          Tout pour supprimer<br/>
          <span style={{ background:C.gradText, WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent" }}>n'importe quel sous-titre</span>
        </h1>
        <p style={{ color:C.textMuted, fontSize:"16px", maxWidth:"520px", margin:"0 auto", lineHeight:1.8 }}>
          ClearCut utilise un modèle d'inpainting vidéo de pointe pour détecter et supprimer les sous-titres incrustés, quelle que soit leur position ou leur style.
        </p>
      </div>

      {/* MAIN FEATURES */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"3rem" }}>
        {[
          { icon:"🤖", title:"IA de détection avancée", desc:"Notre modèle analyse chaque frame de ta vidéo pour détecter avec précision tous les types de sous-titres : incrustés, brûlés, animés, sur fond complexe. Même les sous-titres stylisés façon TikTok ou YouTube.", tag:"Technologie" },
          { icon:"🎨", title:"Reconstruction du fond", desc:"Après suppression, l'IA reconstruit intelligemment le fond vidéo à l'emplacement exact des sous-titres. Le résultat est indiscernable de la vidéo originale sans texte.", tag:"Qualité" },
          { icon:"⚡", title:"Traitement GPU ultra-rapide", desc:"Notre infrastructure cloud utilise des GPU dernière génération pour traiter tes vidéos en quelques secondes. Une vidéo de 60 secondes est traitée en moins d'une minute.", tag:"Performance" },
          { icon:"📦", title:"Batch processing", desc:"Upload jusqu'à 50 vidéos d'un coup. ClearCut les traite en parallèle et te génère un ZIP prêt à télécharger. Idéal pour les créateurs qui publient en masse.", tag:"Productivité" },
        ].map((f,i) => (
          <div key={i} className="card" style={{ display:"flex", gap:"1.25rem" }}
            onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent+"55"}
            onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>
            <div style={{ fontSize:"32px", flexShrink:0 }}>{f.icon}</div>
            <div>
              <div className="badge" style={{ background:"rgba(124,111,255,0.08)", color:C.accent, marginBottom:"8px" }}>{f.tag}</div>
              <h3 style={{ fontSize:"15px", fontWeight:700, marginBottom:"8px" }}>{f.title}</h3>
              <p style={{ fontSize:"13px", color:C.textMuted, lineHeight:1.7 }}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* FORMATS */}
      <div className="card" style={{ marginBottom:"2rem" }}>
        <h3 style={{ fontSize:"15px", fontWeight:700, marginBottom:"1.25rem" }}>Formats & compatibilité</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem" }}>
          {[
            { label:"Formats vidéo", items:["MP4","MOV","MKV","AVI","WebM","FLV"] },
            { label:"Résolutions", items:["480p","720p","1080p","1440p","4K (2160p)"] },
            { label:"Langues", items:["Français","Anglais","Japonais","Arabe","Hindi","+ toutes"] },
            { label:"Sources", items:["TikTok","YouTube","Instagram","Twitch","Fichier local","URL directe"] },
          ].map((g,i) => (
            <div key={i} style={{ background:C.bgCard2, borderRadius:"12px", padding:"1rem" }}>
              <div style={{ fontSize:"11px", color:C.textMuted, fontWeight:600, textTransform:"uppercase", letterSpacing:"0.5px", marginBottom:"10px" }}>{g.label}</div>
              {g.items.map((item,j) => <div key={j} style={{ fontSize:"13px", display:"flex", alignItems:"center", gap:"8px", marginBottom:"5px" }}><span style={{ color:C.success, fontSize:"10px" }}>✓</span>{item}</div>)}
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ textAlign:"center", padding:"3rem", background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:"20px" }}>
        <h2 style={{ fontSize:"1.8rem", fontWeight:800, letterSpacing:"-1px", marginBottom:"10px" }}>Prêt à essayer ?</h2>
        <p style={{ color:C.textMuted, marginBottom:"1.5rem" }}>20 crédits offerts, aucune carte bancaire requise.</p>
        <button className="btn-primary" style={{ padding:"14px 32px", fontSize:"15px" }} onClick={()=>setPage("signup")}>Commencer gratuitement →</button>
      </div>
    </div>
  );
}

// ─── HOW IT WORKS PAGE ────────────────────────────────────────────────────────
function HowItWorksPage({ setPage }) {
  const [activeExample, setActiveExample] = useState(0);
  const examples = [
    { label:"TikTok", before:"Sous-titres colorés animés en bas", after:"Vidéo propre, fond reconstitué" },
    { label:"YouTube", before:"Sous-titres blancs sur fond noir", after:"Vidéo propre, aucune trace" },
    { label:"Anime", before:"Sous-titres de fansub incrustés", after:"Vidéo japonaise originale propre" },
    { label:"Reel", before:"Texte incrusté sur fond complexe", after:"Fond reconstruit par l'IA" },
  ];

  return (
    <div style={{ padding:"4rem 2rem", maxWidth:"1000px", margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:"4rem" }}>
        <div className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent, border:`1px solid rgba(124,111,255,0.2)`, marginBottom:"1rem" }}>Comment ça marche</div>
        <h1 style={{ fontSize:"3rem", fontWeight:900, letterSpacing:"-2px", marginBottom:"1rem" }}>Simple comme bonjour</h1>
        <p style={{ color:C.textMuted, fontSize:"16px", lineHeight:1.8 }}>3 étapes et tu as ta vidéo propre. L'IA fait tout le travail.</p>
      </div>

      {/* STEPS */}
      <div style={{ position:"relative", marginBottom:"4rem" }}>
        {/* Connecting line */}
        <div style={{ position:"absolute", left:"32px", top:"60px", bottom:"60px", width:"2px", background:`linear-gradient(to bottom, ${C.accent}, ${C.accent2}, ${C.pink})`, zIndex:0 }} />

        {[
          { n:"01", icon:"⬆️", title:"Upload ta vidéo", color:C.accent,
            desc:"Glisse-dépose ton fichier ou colle un lien YouTube/TikTok/Instagram directement. On accepte tous les formats courants jusqu'à 2 Go. Tu peux aussi en uploader plusieurs d'un coup pour le batch.",
            tips:["MP4, MOV, MKV, AVI, WebM acceptés","Colle un lien URL directement","Drag & drop ou clic pour parcourir","Jusqu'à 50 fichiers en batch"] },
          { n:"02", icon:"🤖", title:"L'IA analyse et supprime", color:C.accent2,
            desc:"Notre modèle passe ta vidéo frame par frame. Il détecte la position exacte de chaque sous-titre, même les plus stylisés. Ensuite il utilise l'inpainting pour reconstruire le fond à l'endroit exact du texte.",
            tips:["Détection frame par frame","Fonctionne sur tous les styles de texte","Reconstruction intelligente du fond","Préserve la qualité HD originale"] },
          { n:"03", icon:"📥", title:"Télécharge le résultat", color:C.pink,
            desc:"Ta vidéo propre est prête en quelques secondes. Télécharge-la en HD, compare avant/après, ou traites-en d'autres directement. En batch, tu récupères un ZIP de toutes tes vidéos.",
            tips:["Téléchargement HD instantané","Comparaison avant/après intégrée","ZIP automatique pour le batch","Historique de 30 jours"] },
        ].map((s,i) => (
          <div key={i} style={{ display:"flex", gap:"1.5rem", marginBottom:"2rem", position:"relative", zIndex:1 }}>
            <div style={{ width:"64px", height:"64px", borderRadius:"16px", background:`${s.color}18`, border:`2px solid ${s.color}44`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <div style={{ fontSize:"20px" }}>{s.icon}</div>
              <div style={{ fontSize:"9px", fontWeight:800, color:s.color, letterSpacing:"1px" }}>{s.n}</div>
            </div>
            <div className="card" style={{ flex:1 }}>
              <h3 style={{ fontSize:"16px", fontWeight:800, marginBottom:"8px", color:s.color }}>{s.title}</h3>
              <p style={{ fontSize:"13px", color:C.textMuted, lineHeight:1.7, marginBottom:"1rem" }}>{s.desc}</p>
              <div style={{ display:"flex", flexWrap:"wrap", gap:"6px" }}>
                {s.tips.map((t,j) => <span key={j} style={{ background:`${s.color}12`, border:`1px solid ${s.color}25`, color:C.textMuted, fontSize:"11px", padding:"3px 10px", borderRadius:"999px" }}>{t}</span>)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* EXAMPLES */}
      <div style={{ marginBottom:"3rem" }}>
        <h2 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-1px", marginBottom:"1.5rem", textAlign:"center" }}>Exemples par type de vidéo</h2>
        <div style={{ display:"flex", gap:"8px", justifyContent:"center", marginBottom:"1.5rem", flexWrap:"wrap" }}>
          {examples.map((e,i) => (
            <button key={i} style={{ padding:"7px 18px", borderRadius:"999px", border:`1px solid ${i===activeExample ? C.accent : C.borderL}`, background: i===activeExample ? "rgba(124,111,255,0.15)" : "transparent", color: i===activeExample ? C.accent : C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:"13px", fontWeight:500, transition:"all 0.2s" }} onClick={()=>setActiveExample(i)}>{e.label}</button>
          ))}
        </div>
        <div className="card" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1rem", textAlign:"center" }}>
          <div style={{ background:C.bgCard2, borderRadius:"12px", padding:"1.5rem" }}>
            <div style={{ fontSize:"11px", color:C.danger, fontWeight:600, textTransform:"uppercase", marginBottom:"8px" }}>AVANT</div>
            <div style={{ fontSize:"32px", marginBottom:"8px" }}>🎬</div>
            <div style={{ fontSize:"13px", color:C.textMuted }}>{examples[activeExample].before}</div>
          </div>
          <div style={{ background:"rgba(52,211,153,0.05)", border:`1px solid rgba(52,211,153,0.15)`, borderRadius:"12px", padding:"1.5rem" }}>
            <div style={{ fontSize:"11px", color:C.success, fontWeight:600, textTransform:"uppercase", marginBottom:"8px" }}>APRÈS ✓</div>
            <div style={{ fontSize:"32px", marginBottom:"8px" }}>✨</div>
            <div style={{ fontSize:"13px", color:C.textMuted }}>{examples[activeExample].after}</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ marginBottom:"3rem" }}>
        <h2 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-1px", marginBottom:"1.5rem", textAlign:"center" }}>Questions fréquentes</h2>
        {[
          ["Combien de temps prend le traitement ?","Généralement entre 15 et 90 secondes selon la durée et la résolution de ta vidéo. Les vidéos courtes (< 1 min) sont prêtes en moins de 30 secondes."],
          ["La qualité vidéo est-elle dégradée ?","Non. On préserve la qualité originale. Le seul traitement effectué est la reconstruction du fond là où se trouvaient les sous-titres."],
          ["Ça fonctionne sur des sous-titres animés ?","Oui. Notre modèle gère les sous-titres statiques, animés, semi-transparents et même les effets stylisés populaires sur TikTok."],
          ["Mes vidéos sont-elles stockées ?","Tes vidéos sont supprimées automatiquement 24h après traitement. Elles ne sont jamais partagées ni utilisées pour entraîner des modèles."],
        ].map(([q,a],i) => {
          const [open, setOpen] = useState(false);
          return (
            <div key={i} className="card" style={{ marginBottom:"8px", cursor:"pointer" }} onClick={()=>setOpen(o=>!o)}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:"14px", fontWeight:600 }}>{q}</span>
                <span style={{ color:C.textMuted, transition:"transform 0.2s", transform: open ? "rotate(45deg)" : "none" }}>+</span>
              </div>
              {open && <p style={{ fontSize:"13px", color:C.textMuted, marginTop:"10px", lineHeight:1.7 }}>{a}</p>}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign:"center" }}>
        <button className="btn-primary" style={{ padding:"14px 32px", fontSize:"15px" }} onClick={()=>setPage("signup")}>Essayer gratuitement →</button>
      </div>
    </div>
  );
}

// ─── BLOG PAGE ────────────────────────────────────────────────────────────────
function BlogPage({ setPage }) {
  const [selectedArticle, setSelectedArticle] = useState(null);

  const articles = [
    { tag:"Tutoriel", date:"10 Mar 2026", title:"Comment supprimer les sous-titres d'une vidéo TikTok en 2026", desc:"Guide complet pour supprimer les sous-titres incrustés de tes TikToks et Reels avant de les reposter sur d'autres plateformes.", read:"4 min", emoji:"📱",
      content:`## Pourquoi supprimer les sous-titres de tes TikToks ?

Quand tu reposts une vidéo TikTok sur YouTube Shorts, Instagram Reels ou d'autres plateformes, les sous-titres incrustés posent problème. Ils cassent l'expérience visuelle et peuvent réduire la portée de ta vidéo.

## La méthode avec ClearCut

**Étape 1 — Upload ta vidéo**
Connecte-toi à ClearCut et glisse ta vidéo TikTok dans la zone d'upload. Les formats MP4, MOV et WebM sont acceptés.

**Étape 2 — L'IA détecte les sous-titres**
Notre modèle analyse chaque frame de ta vidéo en moins de 30 secondes. Il identifie précisément la position de chaque texte incrusté.

**Étape 3 — Reconstruction du fond**
L'inpainting vidéo reconstruit le fond original à l'emplacement des sous-titres. Le résultat est indiscernable de la vidéo originale.

**Étape 4 — Télécharge et reposte**
Ta vidéo propre est prête en HD. Télécharge-la et reposte-la sur toutes tes plateformes.

## Résultats typiques

- Vidéo de 30 secondes : traitée en 15-20 secondes
- Vidéo de 60 secondes : traitée en 30-40 secondes
- Précision : 99.2% sur les sous-titres TikTok standard

## Conclusion

Avec ClearCut, tu peux reposter tes TikToks en quelques secondes sur toutes tes plateformes. C'est la solution la plus rapide du marché pour les créateurs qui publient en masse.` },

    { tag:"Cas d'usage", date:"5 Mar 2026", title:"Réutiliser le contenu YouTube sans sous-titres : le guide du créateur", desc:"Stratégie complète pour maximiser la réutilisation de ton contenu vidéo sur plusieurs plateformes en supprimant les sous-titres.", read:"6 min", emoji:"🎬",
      content:`## La stratégie du contenu recyclé

Les créateurs YouTube les plus efficaces ne créent pas du contenu from scratch pour chaque plateforme. Ils recyclent intelligemment leurs vidéos existantes.

## Pourquoi les sous-titres bloquent la réutilisation

YouTube génère automatiquement des sous-titres pour l'accessibilité. Quand tu exportes une vidéo avec ces sous-titres incrustés, impossible de la réutiliser proprement sur TikTok ou Instagram qui ont leurs propres systèmes de sous-titres.

## Le workflow optimal

**1. Produis ta vidéo YouTube**
Crée ton contenu normalement avec tes sous-titres YouTube.

**2. Identifie les segments réutilisables**
Repère les meilleurs moments de ta vidéo (hooks, points clés, moments forts).

**3. Exporte les clips**
Exporte les clips en MP4 depuis ton éditeur vidéo.

**4. Supprime les sous-titres avec ClearCut**
Upload tous tes clips en batch sur ClearCut. En quelques minutes, tu as tous tes clips propres.

**5. Reposte sur toutes les plateformes**
TikTok, Reels, Shorts — chaque plateforme reçoit une vidéo adaptée avec ses propres sous-titres.

## Calcul du ROI

Un créateur qui publie 3 vidéos YouTube/semaine peut générer 15-20 clips courts recyclés. Avec ClearCut, le traitement prend moins de 5 minutes pour l'ensemble du batch.` },

    { tag:"IA", date:"28 Fév 2026", title:"Comment fonctionne la suppression de sous-titres par IA ?", desc:"On vous explique en détail la technologie derrière ClearCut : inpainting vidéo, détection de texte et reconstruction du fond.", read:"8 min", emoji:"🤖",
      content:`## La technologie derrière ClearCut

ClearCut utilise deux technologies d'IA combinées : la détection de texte et l'inpainting vidéo.

## Étape 1 : Détection du texte

Notre modèle de détection analyse chaque frame de la vidéo. Il identifie les régions contenant du texte en analysant les patterns visuels caractéristiques des sous-titres : contours nets, couleurs contrastées, position répétitive dans la frame.

La détection fonctionne même sur des sous-titres animés, semi-transparents ou stylisés.

## Étape 2 : Masking

Une fois le texte détecté, le modèle génère un masque précis qui délimite exactement la zone occupée par les sous-titres sur chaque frame.

## Étape 3 : Inpainting vidéo

C'est là que la magie opère. L'inpainting vidéo reconstruit le fond de la vidéo à l'emplacement exact des sous-titres. Le modèle utilise les frames adjacentes (avant et après) pour deviner avec précision ce qui se trouve derrière le texte.

Cette technique est bien plus efficace que l'inpainting image classique car elle peut exploiter la cohérence temporelle de la vidéo.

## Pourquoi c'est différent des solutions concurrentes

La plupart des outils utilisent simplement un flou ou une couleur unie pour masquer les sous-titres. ClearCut reconstruit réellement le fond, ce qui donne un résultat indiscernable de la vidéo originale.

## Limites actuelles

- Les sous-titres sur des fonds très complexes (patterns animés) peuvent parfois laisser des artefacts mineurs
- Les vidéos avec plus de 50% de frames contenant des sous-titres prennent plus de temps à traiter` },

    { tag:"Comparatif", date:"20 Fév 2026", title:"ClearCut vs méthodes manuelles : quel temps tu économises vraiment ?", desc:"On a comparé la suppression manuelle sous After Effects avec ClearCut. Les résultats parlent d'eux-mêmes.", read:"5 min", emoji:"⚡",
      content:`## Le test : 10 vidéos TikTok de 30 secondes

On a demandé à un monteur professionnel de supprimer les sous-titres de 10 vidéos TikTok standard en utilisant After Effects. Puis on a fait la même chose avec ClearCut.

## Résultats After Effects

- Temps moyen par vidéo : 12 minutes
- Total pour 10 vidéos : 2h00
- Qualité : excellente
- Difficulté : nécessite maîtrise d'After Effects

**Workflow After Effects :**
1. Import de la vidéo (1 min)
2. Identification des zones de texte (2 min)
3. Masking frame par frame (6 min)
4. Rendu (3 min)

## Résultats ClearCut

- Temps moyen par vidéo : 45 secondes
- Total pour 10 vidéos en batch : 4 minutes
- Qualité : 99.2% identique
- Difficulté : aucune compétence requise

## Conclusion

ClearCut est **27x plus rapide** qu'After Effects pour cette tâche. Pour un créateur qui traite 50 vidéos par mois, c'est 10 heures économisées.

À 50€/h pour un monteur freelance, ClearCut fait économiser 500€/mois — bien plus que le coût de l'abonnement Creator à 49€/mois.` },

    { tag:"Tutoriel", date:"15 Fév 2026", title:"Supprimer les sous-titres d'anime en masse avec le batch processing", desc:"Comment traiter une saison entière d'anime pour supprimer les sous-titres de fansub grâce au mode batch de ClearCut.", read:"7 min", emoji:"🎌",
      content:`## Le problème des sous-titres de fansub

Les passionnés d'anime qui veulent retravailler des épisodes pour les réseaux sociaux se heurtent souvent au même problème : les sous-titres de fansub sont incrustés directement dans la vidéo et impossible à supprimer sans outil spécialisé.

## ClearCut et les sous-titres d'anime

Les sous-titres d'anime ont des caractéristiques particulières :
- Position variable (pas toujours en bas de l'écran)
- Styles variés (karaoke, dialogue, signes traduits)
- Fonds parfois complexes

Notre modèle a été entraîné spécifiquement sur ce type de contenu et atteint 97.8% de précision sur les sous-titres d'anime standard.

## Traiter une saison entière en batch

**Étape 1 — Prépare tes fichiers**
Rassemble tous tes épisodes dans un dossier. ClearCut accepte MKV, MP4 et AVI.

**Étape 2 — Upload en batch**
Va sur ClearCut > Traitement batch. Glisse tous tes épisodes d'un coup (jusqu'à 50 fichiers).

**Étape 3 — Lance le traitement**
ClearCut traite tous les épisodes en parallèle sur nos GPU. Une saison de 12 épisodes de 24 minutes est traitée en environ 45 minutes.

**Étape 4 — Télécharge le ZIP**
Une fois le traitement terminé, télécharge ton ZIP contenant tous les épisodes propres.

## Coût estimé

Pour une saison de 12 épisodes de 24 minutes :
- Crédits nécessaires : environ 144 crédits
- Coût avec le plan Creator : inclus dans les 3000 crédits/mois` },

    { tag:"Mise à jour", date:"1 Fév 2026", title:"ClearCut v2.0 : 4K, traitement batch et nouvelles langues", desc:"Découvrez toutes les nouveautés de ClearCut v2.0 : support 4K, batch jusqu'à 50 vidéos et 12 nouvelles langues détectées.", read:"3 min", emoji:"🚀",
      content:`## ClearCut v2.0 est là !

Après 3 mois de développement intensif, on est très fiers de sortir ClearCut v2.0. Cette mise à jour majeure apporte des fonctionnalités que vous nous avez massivement demandées.

## Nouvelles fonctionnalités

**Support 4K**
ClearCut traite désormais les vidéos jusqu'en 4K (3840×2160). La qualité de reconstruction est maintenue à ce niveau de résolution.

**Batch processing jusqu'à 50 vidéos**
Vous pouvez maintenant uploader jusqu'à 50 vidéos en une seule fois. Toutes sont traitées en parallèle sur nos GPU et vous recevez un ZIP à télécharger.

**12 nouvelles langues détectées**
Notre modèle de détection supporte maintenant 47 langues dont : arabe, hindi, bengali, tamoul, hébreu, persan, et plus encore.

**Interface repensée**
Le dashboard a été entièrement redesigné avec l'historique détaillé, les statistiques d'utilisation et un meilleur suivi des crédits.

## Améliorations de performance

- Vitesse de traitement : +40% par rapport à v1
- Précision de détection : améliorée de 96.8% à 99.2%
- Temps de rendu 4K : optimisé de 40%

## Merci à la communauté

Ces fonctionnalités ont été développées grâce à vos retours. Continuez à nous envoyer vos suggestions sur contact@clearcut.io.` },
  ];

  const tagColor = { Tutoriel:C.accent, "Cas d'usage":C.cyan, IA:C.pink, Comparatif:C.warning, "Mise à jour":C.success };

  if (selectedArticle !== null) {
    const a = articles[selectedArticle];
    return (
      <div style={{ padding:"4rem 2rem", maxWidth:"720px", margin:"0 auto" }}>
        <button className="btn-ghost" style={{ marginBottom:"2rem", display:"flex", alignItems:"center", gap:"8px", fontSize:"14px" }} onClick={()=>setSelectedArticle(null)}>← Retour au blog</button>
        <div style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"1.5rem" }}>
          <span className="badge" style={{ background:`${tagColor[a.tag]}18`, color:tagColor[a.tag] }}>{a.tag}</span>
          <span style={{ fontSize:"12px", color:C.textDim }}>{a.date} · {a.read} de lecture</span>
        </div>
        <div style={{ fontSize:"52px", marginBottom:"1.5rem", textAlign:"center" }}>{a.emoji}</div>
        <h1 style={{ fontSize:"2rem", fontWeight:900, letterSpacing:"-1px", marginBottom:"1rem", lineHeight:1.2 }}>{a.title}</h1>
        <div style={{ fontSize:"14px", color:C.textMuted, lineHeight:1.8 }}>
          {a.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} style={{ fontSize:"1.2rem", fontWeight:800, color:C.text, margin:"2rem 0 0.8rem", letterSpacing:"-0.5px" }}>{line.slice(3)}</h2>;
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} style={{ fontWeight:700, color:C.text, margin:"0.8rem 0 0.4rem" }}>{line.slice(2,-2)}</p>;
            if (line.startsWith('- ')) return <div key={i} style={{ display:"flex", gap:"8px", marginBottom:"4px" }}><span style={{ color:C.accent }}>•</span><span>{line.slice(2)}</span></div>;
            if (line === '') return <br key={i} />;
            return <p key={i} style={{ margin:"0.4rem 0" }}>{line}</p>;
          })}
        </div>
        <div style={{ marginTop:"3rem", padding:"1.5rem", background:C.bgCard, borderRadius:"16px", textAlign:"center" }}>
          <p style={{ color:C.textMuted, marginBottom:"1rem" }}>Prêt à essayer ClearCut ?</p>
          <button className="btn-primary" style={{ padding:"12px 28px" }} onClick={()=>setPage("signup")}>Commencer gratuitement →</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding:"4rem 2rem", maxWidth:"1000px", margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <div className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent, border:`1px solid rgba(124,111,255,0.2)`, marginBottom:"1rem" }}>Blog</div>
        <h1 style={{ fontSize:"2.8rem", fontWeight:900, letterSpacing:"-2px", marginBottom:"10px" }}>Guides & Ressources</h1>
        <p style={{ color:C.textMuted, fontSize:"15px" }}>Tutoriels, cas d'usage et actualités pour les créateurs de contenu</p>
      </div>

      <div className="card" style={{ display:"grid", gridTemplateColumns:"1fr 280px", gap:"2rem", marginBottom:"2rem", border:`1px solid ${C.borderL}`, cursor:"pointer" }}
        onClick={()=>setSelectedArticle(0)}
        onMouseEnter={e=>e.currentTarget.style.borderColor=C.accent+"44"}
        onMouseLeave={e=>e.currentTarget.style.borderColor=C.borderL}>
        <div>
          <div style={{ display:"flex", gap:"8px", alignItems:"center", marginBottom:"1rem" }}>
            <span className="badge" style={{ background:`${tagColor[articles[0].tag]}18`, color:tagColor[articles[0].tag] }}>{articles[0].tag}</span>
            <span style={{ fontSize:"12px", color:C.textDim }}>{articles[0].date} · {articles[0].read} de lecture</span>
          </div>
          <h2 style={{ fontSize:"1.4rem", fontWeight:800, letterSpacing:"-0.5px", marginBottom:"10px", lineHeight:1.3 }}>{articles[0].title}</h2>
          <p style={{ fontSize:"14px", color:C.textMuted, lineHeight:1.7, marginBottom:"1.5rem" }}>{articles[0].desc}</p>
          <span style={{ color:C.accent, fontSize:"13px", fontWeight:600 }}>Lire l'article →</span>
        </div>
        <div style={{ background:C.bgCard2, borderRadius:"12px", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"72px" }}>{articles[0].emoji}</div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"1rem" }}>
        {articles.slice(1).map((a,i) => (
          <div key={i} className="card" style={{ cursor:"pointer", transition:"transform 0.2s, border-color 0.2s" }}
            onClick={()=>setSelectedArticle(i+1)}
            onMouseEnter={e=>{e.currentTarget.style.transform="translateY(-4px)";e.currentTarget.style.borderColor=C.borderL;}}
            onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";e.currentTarget.style.borderColor=C.border;}}>
            <div style={{ fontSize:"32px", marginBottom:"10px" }}>{a.emoji}</div>
            <div style={{ display:"flex", gap:"6px", alignItems:"center", marginBottom:"8px" }}>
              <span className="badge" style={{ background:`${tagColor[a.tag]}18`, color:tagColor[a.tag], fontSize:"10px" }}>{a.tag}</span>
              <span style={{ fontSize:"11px", color:C.textDim }}>{a.read}</span>
            </div>
            <h3 style={{ fontSize:"13px", fontWeight:700, lineHeight:1.4, marginBottom:"8px" }}>{a.title}</h3>
            <p style={{ fontSize:"12px", color:C.textMuted, lineHeight:1.6 }}>{a.desc}</p>
            <div style={{ marginTop:"12px", fontSize:"12px", color:C.accent, fontWeight:600 }}>Lire →</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CGU PAGE ─────────────────────────────────────────────────────────────────
function CGUPage() {
  const sections = [
    { title:"1. Présentation de la société", content:`ClearCut est un service édité par la société KEVININDUSTRIE, SAS au capital de 500€, immatriculée au RCS de Paris sous le numéro SIREN 932 737 992, dont le siège social est situé à Paris, France.\n\nPrésident : Kevin Nedzvedsky\nDate de création : 05 septembre 2024\nContact : contact@clearcut.io` },
    { title:"2. Objet", content:"Les présentes Conditions Générales d'Utilisation (CGU) ont pour objet de définir les modalités d'accès et d'utilisation du service ClearCut (ci-après « le Service »), accessible à l'adresse clearcut.io.\n\nToute utilisation du Service implique l'acceptation pleine et entière des présentes CGU." },
    { title:"3. Description du Service", content:"ClearCut est un service SaaS (Software as a Service) permettant la suppression automatique de sous-titres incrustés dans des fichiers vidéo, grâce à des technologies d'intelligence artificielle.\n\nLe Service est accessible via abonnement mensuel ou annuel, ou via un quota de crédits gratuits limités." },
    { title:"4. Accès au Service", content:"L'accès au Service nécessite la création d'un compte utilisateur. L'utilisateur s'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.\n\nL'utilisateur est seul responsable de toute utilisation faite depuis son compte. KEVININDUSTRIE se réserve le droit de suspendre ou supprimer tout compte en cas de violation des présentes CGU." },
    { title:"5. Crédits et abonnements", content:"Le Service fonctionne sur la base d'un système de crédits. L'utilisateur dispose de 20 crédits offerts à l'inscription, puis de 10 crédits gratuits par mois sur le plan Free.\n\nLes abonnements payants (Pro, Creator, Business) sont facturés mensuellement ou annuellement via Stripe. Les paiements sont non remboursables sauf disposition légale contraire." },
    { title:"6. Propriété intellectuelle", content:"Tous les éléments du Service (interface, algorithmes, marques, logos) sont la propriété exclusive de KEVININDUSTRIE et sont protégés par les lois françaises et internationales relatives à la propriété intellectuelle.\n\nL'utilisateur conserve l'intégralité des droits sur les vidéos qu'il uploade et traite via le Service." },
    { title:"7. Données personnelles", content:"KEVININDUSTRIE traite les données personnelles des utilisateurs conformément à sa Politique de Confidentialité et au Règlement Général sur la Protection des Données (RGPD).\n\nLes vidéos uploadées sont automatiquement supprimées de nos serveurs dans un délai de 24 heures après traitement." },
    { title:"8. Limitation de responsabilité", content:"KEVININDUSTRIE s'efforce d'assurer la disponibilité du Service 24h/24, 7j/7, mais ne peut garantir une disponibilité sans interruption.\n\nKEVININDUSTRIE ne saurait être tenue responsable des dommages directs ou indirects résultant de l'utilisation ou de l'impossibilité d'utiliser le Service." },
    { title:"9. Droit applicable", content:"Les présentes CGU sont soumises au droit français. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux de Paris." },
    { title:"10. Modification des CGU", content:"KEVININDUSTRIE se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés de toute modification substantielle par email. L'utilisation continue du Service après modification vaut acceptation des nouvelles CGU.\n\nDernière mise à jour : Mars 2026" },
  ];

  return (
    <div style={{ padding:"4rem 2rem", maxWidth:"800px", margin:"0 auto" }}>
      <div style={{ marginBottom:"3rem" }}>
        <div className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent, border:`1px solid rgba(124,111,255,0.2)`, marginBottom:"1rem" }}>Légal</div>
        <h1 style={{ fontSize:"2.5rem", fontWeight:900, letterSpacing:"-1.5px", marginBottom:"10px" }}>Conditions Générales d'Utilisation</h1>
        <p style={{ color:C.textMuted, fontSize:"14px" }}>En vigueur au 1er mars 2026 · KEVININDUSTRIE SAS</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
        {sections.map((s,i) => (
          <div key={i} className="card">
            <h2 style={{ fontSize:"15px", fontWeight:700, color:C.accent, marginBottom:"12px" }}>{s.title}</h2>
            <p style={{ fontSize:"13px", color:C.textMuted, lineHeight:1.8, whiteSpace:"pre-line" }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── PRIVACY PAGE ─────────────────────────────────────────────────────────────
function PrivacyPage() {
  const sections = [
    { title:"1. Responsable du traitement", content:"KEVININDUSTRIE SAS\nSIREN : 932 737 992\nSiège : Paris, France\nPrésident : Kevin Nedzvedsky\nContact DPO : privacy@clearcut.io" },
    { title:"2. Données collectées", content:"Nous collectons les données suivantes :\n\n• Données d'identification : nom, adresse email\n• Données de connexion : adresse IP, logs de connexion, cookies de session\n• Données de paiement : traitées directement par Stripe (nous ne stockons aucune donnée bancaire)\n• Données d'utilisation : historique de traitement, crédits consommés, préférences" },
    { title:"3. Finalités du traitement", content:"Vos données sont utilisées pour :\n\n• Fournir et améliorer le Service\n• Gérer votre compte et votre abonnement\n• Envoyer des communications transactionnelles\n• Assurer la sécurité et prévenir la fraude\n• Respecter nos obligations légales" },
    { title:"4. Base légale", content:"Le traitement de vos données repose sur :\n\n• L'exécution du contrat (fourniture du Service)\n• Votre consentement (cookies, communications marketing)\n• Notre intérêt légitime (sécurité, amélioration du Service)\n• Le respect de nos obligations légales" },
    { title:"5. Conservation des données", content:"• Données de compte : durée de vie du compte + 3 ans\n• Vidéos uploadées : suppression automatique sous 24h après traitement\n• Données de facturation : 10 ans (obligation légale)\n• Logs de connexion : 12 mois" },
    { title:"6. Partage des données", content:"Nous ne vendons jamais vos données. Nous partageons vos données uniquement avec :\n\n• Stripe (paiements) — conforme PCI DSS\n• Supabase (base de données) — hébergement UE\n• Replicate (traitement IA) — données vidéo uniquement, supprimées après traitement" },
    { title:"7. Vos droits (RGPD)", content:"Conformément au RGPD, vous disposez des droits suivants :\n\n• Droit d'accès à vos données\n• Droit de rectification\n• Droit à l'effacement (« droit à l'oubli »)\n• Droit à la portabilité\n• Droit d'opposition au traitement\n\nPour exercer vos droits : privacy@clearcut.io\nRéponse sous 30 jours.\n\nVous pouvez également introduire une réclamation auprès de la CNIL (cnil.fr)." },
    { title:"8. Cookies", content:"Nous utilisons des cookies techniques (nécessaires au fonctionnement) et analytiques (avec votre consentement).\n\nVous pouvez gérer vos préférences via la bannière cookies affichée lors de votre première visite.\n\nDernière mise à jour : Mars 2026" },
  ];

  return (
    <div style={{ padding:"4rem 2rem", maxWidth:"800px", margin:"0 auto" }}>
      <div style={{ marginBottom:"3rem" }}>
        <div className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent, border:`1px solid rgba(124,111,255,0.2)`, marginBottom:"1rem" }}>Légal</div>
        <h1 style={{ fontSize:"2.5rem", fontWeight:900, letterSpacing:"-1.5px", marginBottom:"10px" }}>Politique de Confidentialité</h1>
        <p style={{ color:C.textMuted, fontSize:"14px" }}>En vigueur au 1er mars 2026 · Conforme RGPD</p>
      </div>
      <div style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
        {sections.map((s,i) => (
          <div key={i} className="card">
            <h2 style={{ fontSize:"15px", fontWeight:700, color:C.accent, marginBottom:"12px" }}>{s.title}</h2>
            <p style={{ fontSize:"13px", color:C.textMuted, lineHeight:1.8, whiteSpace:"pre-line" }}>{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── CONTACT PAGE ─────────────────────────────────────────────────────────────
function ContactPage() {
  const [form, setForm] = useState({ name:"", email:"", subject:"", message:"" });
  const [sent, setSent] = useState(false);
  const subjects = ["Question sur mon abonnement","Problème technique","Demande de remboursement","Partenariat","Autre"];

  return (
    <div style={{ padding:"4rem 2rem", maxWidth:"800px", margin:"0 auto" }}>
      <div style={{ textAlign:"center", marginBottom:"3rem" }}>
        <div className="badge" style={{ background:"rgba(124,111,255,0.1)", color:C.accent, border:`1px solid rgba(124,111,255,0.2)`, marginBottom:"1rem" }}>Contact</div>
        <h1 style={{ fontSize:"2.5rem", fontWeight:900, letterSpacing:"-1.5px", marginBottom:"10px" }}>On est là pour t'aider</h1>
        <p style={{ color:C.textMuted, fontSize:"15px" }}>Réponse sous 24h en jours ouvrés</p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"1.5rem", marginBottom:"2rem" }}>
        {[
          { icon:"📧", title:"Email", value:"contact@clearcut.io", sub:"Réponse sous 24h" },
          { icon:"🏢", title:"Société", value:"KEVININDUSTRIE SAS", sub:"SIREN 932 737 992 · Paris" },
        ].map((c,i) => (
          <div key={i} className="card" style={{ textAlign:"center" }}>
            <div style={{ fontSize:"28px", marginBottom:"8px" }}>{c.icon}</div>
            <div style={{ fontSize:"13px", fontWeight:700, marginBottom:"4px" }}>{c.title}</div>
            <div style={{ fontSize:"13px", color:C.accent }}>{c.value}</div>
            <div style={{ fontSize:"11px", color:C.textMuted, marginTop:"3px" }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {sent ? (
        <div className="card scale-in" style={{ textAlign:"center", padding:"3rem" }}>
          <div style={{ fontSize:"48px", marginBottom:"1rem" }}>✅</div>
          <h2 style={{ fontSize:"1.4rem", fontWeight:800, marginBottom:"8px" }}>Message envoyé !</h2>
          <p style={{ color:C.textMuted, fontSize:"14px" }}>On te répond sous 24h. Vérifie tes spams si tu ne reçois rien.</p>
        </div>
      ) : (
        <div className="card" style={{ display:"flex", flexDirection:"column", gap:"1rem" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
            <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Nom</label><input className="input" placeholder="Jean Dupont" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></div>
            <div><label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Email</label><input className="input" type="email" placeholder="jean@exemple.com" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></div>
          </div>
          <div>
            <label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Sujet</label>
            <select style={{ width:"100%" }} value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}>
              <option value="">Choisir un sujet…</option>
              {subjects.map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontSize:"12px", color:C.textMuted, marginBottom:"5px", display:"block" }}>Message</label>
            <textarea className="input" rows={5} placeholder="Décris ton problème ou ta question..." value={form.message} onChange={e=>setForm({...form,message:e.target.value})} style={{ resize:"vertical" }} />
          </div>
          <button className="btn-primary" style={{ padding:"13px", fontSize:"14px" }} onClick={()=>{ if(form.name&&form.email&&form.message) setSent(true); }}>
            Envoyer le message →
          </button>
        </div>
      )}
    </div>
  );
}

// ─── USAGE PAGE ───────────────────────────────────────────────────────────────
function UsagePage({ user, setPage }) {
  const [period, setPeriod] = useState("7j");
  const history = [
    { date:"17 Mar 2026, 11:30", feature:"Suppression sous-titres", file:"tiktok_vlog.mp4", credits:2, dur:"0:42" },
    { date:"17 Mar 2026, 10:15", feature:"Suppression sous-titres", file:"reel_insta.mp4", credits:2, dur:"0:31" },
    { date:"16 Mar 2026, 18:44", feature:"Suppression sous-titres", file:"youtube_ep03.mp4", credits:8, dur:"4:12" },
    { date:"16 Mar 2026, 14:20", feature:"Suppression sous-titres", file:"anime_op.mkv", credits:4, dur:"1:30" },
    { date:"15 Mar 2026, 09:05", feature:"Batch processing", file:"batch_5_videos.zip", credits:14, dur:"—" },
    { date:"14 Mar 2026, 21:30", feature:"Suppression sous-titres", file:"short_clip.mp4", credits:2, dur:"0:28" },
  ];
  const totalSpent = history.reduce((a,h)=>a+h.credits,0);
  const barData = [2,5,8,3,12,6,totalSpent];
  const maxBar = Math.max(...barData);

  return (
    <div style={{ padding:"2rem", maxWidth:"900px", margin:"0 auto" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"2rem" }}>
        <div>
          <h1 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.8px" }}>Historique d'utilisation</h1>
          <p style={{ color:C.textMuted, fontSize:"13px" }}>Consulte ta consommation de crédits</p>
        </div>
        <div style={{ display:"flex", gap:"4px" }}>
          {["7j","30j","90j"].map(p=>(
            <button key={p} style={{ padding:"6px 14px", borderRadius:"8px", border:`1px solid ${period===p?C.accent:C.borderL}`, background: period===p?"rgba(124,111,255,0.1)":"transparent", color: period===p?C.accent:C.textMuted, cursor:"pointer", fontFamily:"inherit", fontSize:"12px" }} onClick={()=>setPeriod(p)}>{p}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"1rem", marginBottom:"1.5rem" }}>
        {[
          { l:"Coût total", v:"4.32€", col:C.accent },
          { l:"Crédits utilisés", v:totalSpent, col:C.cyan },
          { l:"Générations", v:history.length, col:C.pink },
          { l:"Fonctionnalités", v:"1", col:C.warning },
        ].map((s,i)=>(
          <div key={i} className="card" style={{ padding:"1rem" }}>
            <div style={{ fontSize:"11px", color:C.textMuted, marginBottom:"6px", textTransform:"uppercase" }}>{s.l}</div>
            <div style={{ fontSize:"1.4rem", fontWeight:800, color:s.col }}>{s.v}</div>
          </div>
        ))}
      </div>

      {/* Bar chart */}
      <div className="card" style={{ marginBottom:"1.5rem" }}>
        <div style={{ fontSize:"13px", fontWeight:600, marginBottom:"1rem" }}>Dépenses — {period}</div>
        <div style={{ display:"flex", gap:"8px", alignItems:"flex-end", height:"80px" }}>
          {barData.map((v,i)=>(
            <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
              <div style={{ width:"100%", height:`${(v/maxBar)*70}px`, background:i===barData.length-1?C.grad:`${C.accent}44`, borderRadius:"4px 4px 0 0", transition:"height 0.3s" }} />
              <span style={{ fontSize:"9px", color:C.textDim }}>{["L","M","M","J","V","S","A"][i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* History table */}
      <div className="card" style={{ padding:0, overflow:"hidden" }}>
        <div style={{ padding:"14px 16px", borderBottom:`1px solid ${C.border}`, fontSize:"13px", fontWeight:600 }}>Historique détaillé</div>
        <table>
          <thead><tr style={{ borderBottom:`1px solid ${C.border}` }}>
            {["Crédits","Fonctionnalité","Fichier","Durée","Date"].map((h,i)=>(
              <th key={i} style={{ padding:"10px 16px", textAlign:i===0?"center":"left", fontSize:"11px", color:C.textMuted, fontWeight:500, textTransform:"uppercase" }}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {history.map((h,i)=>(
              <tr key={i} style={{ borderBottom: i<history.length-1?`1px solid ${C.border}`:"none" }}>
                <td style={{ padding:"12px 16px", textAlign:"center", fontWeight:700, color:C.danger }}>-{h.credits}</td>
                <td style={{ padding:"12px 16px", fontSize:"13px" }}>{h.feature}</td>
                <td style={{ padding:"12px 16px", fontSize:"12px", color:C.textMuted, fontFamily:"monospace" }}>{h.file}</td>
                <td style={{ padding:"12px 16px", fontSize:"12px", color:C.textMuted }}>{h.dur}</td>
                <td style={{ padding:"12px 16px", fontSize:"11px", color:C.textDim }}>{h.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── BATCH PAGE ───────────────────────────────────────────────────────────────
function BatchPage({ setPage, user, setUser }) {
  const [files, setFiles] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [done, setDone] = useState(false);
  const [progress, setProgress] = useState({});

  const addFiles = (newFiles) => {
    const arr = Array.from(newFiles).slice(0, 50);
    setFiles(prev => [...prev, ...arr.map(f => ({ file:f, id:Math.random().toString(36).slice(2) }))].slice(0,50));
  };

  const remove = (id) => setFiles(prev => prev.filter(f=>f.id!==id));

  const startBatch = () => {
    if (!files.length) return;
    setProcessing(true);
    files.forEach((f,i) => {
      let p = 0;
      const iv = setInterval(() => {
        p += Math.random()*15+5;
        if (p >= 100) { p=100; clearInterval(iv); }
        setProgress(prev => ({...prev, [f.id]: Math.min(100,p)}));
      }, 200 + i*100);
    });
    setTimeout(() => { setProcessing(false); setDone(true); }, 4000 + files.length*500);
  };

  const totalCredits = files.length * 2;

  if (done) return (
    <div style={{ padding:"2rem", maxWidth:"600px", margin:"0 auto", textAlign:"center" }}>
      <div className="card scale-in" style={{ padding:"3rem" }}>
        <div style={{ fontSize:"52px", marginBottom:"1rem" }}>🎉</div>
        <h2 style={{ fontSize:"1.5rem", fontWeight:800, marginBottom:"8px" }}>Batch terminé !</h2>
        <p style={{ color:C.textMuted, marginBottom:"2rem" }}>{files.length} vidéos traitées · {totalCredits} crédits utilisés</p>
        <button className="btn-primary" style={{ width:"100%", padding:"14px", marginBottom:"10px" }}>⬇ Télécharger le ZIP</button>
        <button className="btn-secondary" style={{ width:"100%", padding:"14px" }} onClick={()=>setPage("dashboard")}>← Retour au dashboard</button>
      </div>
    </div>
  );

  return (
    <div style={{ padding:"2rem", maxWidth:"800px", margin:"0 auto" }}>
      <h1 style={{ fontSize:"1.6rem", fontWeight:800, letterSpacing:"-0.8px", marginBottom:"0.5rem" }}>Traitement batch</h1>
      <p style={{ color:C.textMuted, fontSize:"14px", marginBottom:"2rem" }}>Upload jusqu'à 50 vidéos — toutes traitées en parallèle → ZIP à télécharger</p>

      {/* Drop zone */}
      <div className="card" style={{ border:`2px dashed ${C.borderL}`, textAlign:"center", padding:"2.5rem", cursor:"pointer", marginBottom:"1.5rem" }}
        onClick={()=>document.getElementById("batch-fi").click()}
        onDragOver={e=>e.preventDefault()}
        onDrop={e=>{e.preventDefault();addFiles(e.dataTransfer.files);}}>
        <input id="batch-fi" type="file" accept="video/*" multiple style={{ display:"none" }} onChange={e=>addFiles(e.target.files)} />
        <div style={{ fontSize:"36px", marginBottom:"10px" }}>📦</div>
        <div style={{ fontWeight:600, marginBottom:"4px" }}>Glisse tes vidéos ici</div>
        <div style={{ fontSize:"13px", color:C.textMuted }}>ou clique pour sélectionner · Max 50 fichiers</div>
      </div>

      {files.length > 0 && (
        <>
          <div className="card" style={{ padding:0, overflow:"hidden", marginBottom:"1.5rem" }}>
            <div style={{ padding:"12px 16px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:"13px", fontWeight:600 }}>{files.length} fichier{files.length>1?"s":""} · {totalCredits} crédits</span>
              {!processing && <button className="btn-ghost" style={{ fontSize:"12px", color:C.danger }} onClick={()=>setFiles([])}>Tout supprimer</button>}
            </div>
            {files.map((f,i)=>(
              <div key={f.id} style={{ display:"flex", alignItems:"center", gap:"12px", padding:"10px 16px", borderBottom: i<files.length-1?`1px solid ${C.border}`:"none" }}>
                <span style={{ fontSize:"18px" }}>🎬</span>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"13px", fontWeight:500 }}>{f.file.name}</div>
                  <div style={{ fontSize:"11px", color:C.textMuted }}>{(f.file.size/1024/1024).toFixed(1)} MB</div>
                  {processing && (
                    <div style={{ marginTop:"4px", height:"3px", background:C.border, borderRadius:"999px", overflow:"hidden" }}>
                      <div style={{ width:`${progress[f.id]||0}%`, height:"100%", background: (progress[f.id]||0)>=100?C.success:C.grad, borderRadius:"999px", transition:"width 0.2s" }} />
                    </div>
                  )}
                </div>
                {!processing && <button className="btn-ghost" style={{ fontSize:"16px", color:C.textMuted }} onClick={()=>remove(f.id)}>×</button>}
                {processing && <span style={{ fontSize:"11px", color: (progress[f.id]||0)>=100?C.success:C.textMuted }}>{(progress[f.id]||0)>=100?"✓":Math.round(progress[f.id]||0)+"%"}</span>}
              </div>
            ))}
          </div>

          {!processing && (
            <button className="btn-primary" style={{ width:"100%", padding:"14px", fontSize:"15px" }} onClick={startBatch}>
              ✦ Lancer le batch ({totalCredits} crédits)
            </button>
          )}
          {processing && (
            <div className="card" style={{ textAlign:"center", padding:"1.5rem" }}>
              <div style={{ fontSize:"24px", marginBottom:"8px", animation:"spin 1s linear infinite", display:"inline-block" }}>⟳</div>
              <div style={{ fontWeight:600 }}>Traitement en cours…</div>
              <div style={{ fontSize:"13px", color:C.textMuted, marginTop:"4px" }}>{Object.values(progress).filter(p=>p>=100).length} / {files.length} terminées</div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [page, setPage] = useState("home");
  const [user, setUser] = useState(null);
  const [checkoutPlan, setCheckoutPlan] = useState(null);
  const [adminAuth, setAdminAuth] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lang, setLang] = useState("fr");

  useEffect(() => {
    setTimeout(() => {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data: profile }) => {
            setUser({ name: profile?.name || session.user.email.split("@")[0], email: session.user.email, plan: profile?.plan || "Free", credits: profile?.credits || 20, maxCredits: 20, id: session.user.id });
            setPage("dashboard");
          });
        }
      });
    }, 500);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        supabase.from("profiles").select("*").eq("id", session.user.id).single().then(({ data: profile }) => {
          setUser({ name: profile?.name || session.user.email.split("@")[0], email: session.user.email, plan: profile?.plan || "Free", credits: profile?.credits || 20, maxCredits: 20, id: session.user.id });
          setPage("dashboard");
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const requireAuth = (p) => {
    const authPages = ["dashboard","process","result","batch","billing","settings","referral","usage","profile"];
    if (!user && authPages.includes(p)) setPage("login");
    else setPage(p);
  };

  const renderPage = () => {
    switch (page) {
      case "home":     return <LandingPage setPage={requireAuth} lang={lang} />;
      case "pricing":  return <PricingPage setPage={requireAuth} setCheckoutPlan={setCheckoutPlan} lang={lang} />;
      case "login":    return <AuthPage type="login" setPage={setPage} setUser={setUser} showOnboarding={()=>setShowOnboarding(true)} />;
      case "signup":   return <AuthPage type="signup" setPage={setPage} setUser={setUser} showOnboarding={()=>setShowOnboarding(true)} />;
      case "checkout": return <CheckoutPage plan={checkoutPlan} setPage={setPage} setUser={setUser} user={user} />;
      case "dashboard":return <Dashboard user={user} setPage={setPage} lang={lang} />;
      case "process":  return <ProcessPage setPage={setPage} />;
      case "batch":    return <BatchPage setPage={setPage} user={user} setUser={setUser} />;
      case "billing":  return <BillingPage user={user} setPage={setPage} />;
      case "settings": return <SettingsPage user={user} setUser={setUser} setPage={setPage} />;
      case "referral": return <ReferralPage user={user} />;
      case "usage":    return <UsagePage user={user} setPage={setPage} />;
      case "admin":    return user?.isAdmin ? <AdminDashboard setPage={setPage} /> : <AuthPage type="login" setPage={setPage} setUser={setUser} showOnboarding={()=>setShowOnboarding(true)} onAdminLogin={(u)=>{ setUser(u); }} />;
      case "cgu":      return <CGUPage />;
      case "privacy":  return <PrivacyPage />;
      case "contact":  return <ContactPage />;
      case "blog":     return <BlogPage setPage={setPage} />;
      case "features": return <FeaturesPage setPage={setPage} />;
      case "how":      return <HowItWorksPage setPage={setPage} />;
      default:         return <LandingPage setPage={requireAuth} lang={lang} />;
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:C.bg, color:C.text, fontFamily:"'Inter', system-ui, sans-serif" }}>
      <style>{gStyle}</style>
      <CursorFollower />
      <CookieBanner />
      <ExitIntentPopup />
      {showOnboarding && <OnboardingModal onClose={()=>setShowOnboarding(false)} />}
      <Nav page={page} setPage={requireAuth} user={user} setUser={setUser} lang={lang} setLang={setLang} />
      {renderPage()}
      <AIChatWidget />
    </div>
  );
}
