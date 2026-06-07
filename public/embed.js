(()=>{(function(){var $;let a=document.currentScript;if(!a)return;let d=a.getAttribute("data-box")||"";if(!d)return;let s=a.getAttribute("data-color")||"#7c5cff",M=a.getAttribute("data-cta")||"\u{1F513} \u89E3\u9396\u9818\u53D6",l=(()=>{try{return new URL(a.getAttribute("src")||"",window.location.href).origin}catch{return""}})(),x="keybox_member";function E(){try{let e=localStorage.getItem(x);if(!e)return null;let t=JSON.parse(e);return t&&typeof t.email=="string"&&t.email.includes("@")?t:null}catch{return null}}function L(e){try{localStorage.setItem(x,JSON.stringify(e))}catch{}}let u=document.createElement("div");u.setAttribute("data-keybox",d),($=a.parentNode)==null||$.insertBefore(u,a.nextSibling);let f=u.attachShadow({mode:"open"}),h=document.createElement("style");h.textContent=`
    .kb { font-family: 'Noto Sans TC', -apple-system, 'Segoe UI', sans-serif; background:#fff; border:1px solid #e7e5e4; border-radius:14px; padding:26px; box-shadow:0 6px 24px rgba(20,30,50,.06); color:#1c1917; line-height:1.7; text-align:center; }
    .kb-title { font-weight:900; font-size:1.2rem; margin:0 0 6px; }
    .kb-desc { color:#78716c; font-size:.9rem; margin:0 0 16px; white-space:pre-line; }
    .kb-meta { font-size:.78rem; color:#a8a29e; margin-bottom:12px; }
    .kb-btn { display:inline-block; background:${s}; color:#fff; border:none; cursor:pointer; font-weight:900; font-size:1rem; padding:13px 40px; border-radius:100px; font-family:inherit; }
    .kb-btn:disabled { opacity:.6; cursor:default; }
    .kb-content { text-align:left; white-space:pre-wrap; word-break:break-word; font-size:.95rem; background:#fafaf9; border:1px solid #f0f1f4; border-radius:10px; padding:14px 16px; }
    .kb-content a { color:${s}; font-weight:700; }
    .kb-ok { font-size:.9rem; color:${s}; font-weight:700; margin-bottom:10px; text-align:left; }
    .kb-brand { text-align:right; margin-top:10px; }
    .kb-brand a { color:#c7c2bd; font-size:.7rem; text-decoration:none; }
    .kb-skel { height:88px; display:flex; align-items:center; justify-content:center; color:#a8a29e; font-size:.85rem; }
    /* \u2500\u2500 register modal\uFF08\u6BD4\u7167\u9801\u5BF6\u5EAB free-gate\uFF09\u2500\u2500 */
    .kb-overlay { display:none; position:fixed; inset:0; z-index:999999; background:rgba(0,0,0,.6); padding:16px; overflow:auto; align-items:center; justify-content:center; }
    .kb-overlay.open { display:flex; }
    .kb-modal { max-width:380px; width:100%; margin:auto; background:#fff; border-radius:16px; padding:30px 26px; position:relative; text-align:center; font-family:'Noto Sans TC', -apple-system, 'Segoe UI', sans-serif; color:#1c1917; }
    .kb-close { position:absolute; top:10px; right:14px; background:none; border:none; font-size:24px; line-height:1; cursor:pointer; color:#9aa0a8; }
    .kb-emoji { font-size:2rem; }
    .kb-mtitle { font-weight:900; font-size:1.3rem; margin:6px 0 18px; line-height:1.4; }
    .kb-input { width:100%; box-sizing:border-box; padding:11px 14px; margin-bottom:10px; border:1px solid #d2d2d7; border-radius:10px; font-size:.95rem; font-family:inherit; outline:none; text-align:left; }
    .kb-input:focus { border-color:${s}; }
    .kb-submit { width:100%; box-sizing:border-box; background:${s}; color:#fff; border:none; cursor:pointer; font-weight:900; font-size:1.05rem; padding:13px; border-radius:100px; font-family:inherit; margin-top:4px; }
    .kb-submit:disabled { opacity:.6; cursor:default; }
    .kb-note { color:#9aa0a8; font-size:.74rem; margin-top:12px; line-height:1.6; }
    .kb-error { color:#dc2626; font-size:.85rem; margin-top:8px; display:none; }
  `,f.appendChild(h);let i=document.createElement("div");i.className="kb",i.innerHTML='<div class="kb-skel">\u8CC7\u6599\u5305\u8F09\u5165\u4E2D\u2026</div>',f.appendChild(i);let o=document.createElement("div");o.className="kb-overlay",f.appendChild(o);function r(e){return String(e==null?"":e).replace(/[<>&"]/g,t=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"})[t])}function z(e){return r(e).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>')}function b(){o.classList.remove("open"),document.body.style.overflow=""}function w(e,t){b(),i.innerHTML=`
      <div class="kb-ok">${t?"\u{1F513} \u6B61\u8FCE\u56DE\u4F86\uFF0C\u5DF2\u70BA\u4F60\u81EA\u52D5\u89E3\u9396":"\u{1F513} \u89E3\u9396\u6210\u529F\uFF01"}</div>
      <div class="kb-content">${z(e)}</div>
      <div class="kb-brand"><a href="${r(l)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `}async function v(e){try{let t=await fetch(`${l}/api/embed/unlock`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:d,...e})}),n=await t.json().catch(()=>({}));return t.ok?{ok:!0,content:n.content,welcomeBack:!!n.welcomeBack}:{ok:!1,error:n.error||"\u89E3\u9396\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66"}}catch{return{ok:!1,error:"\u9023\u7DDA\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66"}}}function T(e){let t=e.unlockMode==="keyword";o.innerHTML=`
      <div class="kb-modal">
        <button type="button" class="kb-close" aria-label="\u95DC\u9589">&times;</button>
        <div class="kb-emoji">\u{1F513}</div>
        <h3 class="kb-mtitle">\u586B\u4E00\u6B21\uFF0C\u4E4B\u5F8C\u514D\u8CBB\u8CC7\u6E90\u90FD\u723D\u9818</h3>
        <form>
          <input class="kb-input" name="name" type="text" placeholder="\u4F60\u7684\u540D\u5B57" required>
          <input class="kb-input" name="email" type="email" placeholder="you@example.com" required>
          ${t?'<input class="kb-input" name="keyword" type="text" placeholder="\u95DC\u9375\u5B57" required>':""}
          <button class="kb-submit" type="submit">\u4E0B\u8F09</button>
        </form>
        <p class="kb-error"></p>
        <p class="kb-note">\u9084\u6703\u5BC4\u9001\u771F\u7684\u6709\u6599\u7684\u6587\u7AE0\uFF0C\u4E0D\u4E82\u767C\u3002</p>
      </div>
    `,o.addEventListener("click",c=>{c.target===o&&b()}),o.querySelector(".kb-close").addEventListener("click",b),document.addEventListener("keydown",c=>{c.key==="Escape"&&b()});let n=o.querySelector("form"),S=o.querySelector(".kb-error");n.addEventListener("submit",async c=>{c.preventDefault();let k=new FormData(n),g=String(k.get("email")||"").trim(),y=String(k.get("name")||"").trim(),N=String(k.get("keyword")||"").trim();if(!g.includes("@")||!y)return;let p=n.querySelector(".kb-submit");p.disabled=!0,p.textContent="\u8655\u7406\u4E2D\u2026";let m=await v({email:g,name:y,...t?{keyword:N}:{}});m.ok?(L({email:g,name:y}),w(m.content||"",!!m.welcomeBack)):(p.disabled=!1,p.textContent="\u4E0B\u8F09",S.textContent=m.error||"\u89E3\u9396\u5931\u6557",S.style.display="block")})}function C(){o.classList.add("open"),document.body.style.overflow="hidden"}function q(e){let t=e.quota?`\u5DF2\u9818\u53D6 ${e.claimed}/${e.quota}`:"";i.innerHTML=`
      ${e.title?`<p class="kb-title">\u{1F4E6} ${r(e.title)}</p>`:""}
      ${e.description?`<p class="kb-desc">${r(e.description)}</p>`:""}
      ${t?`<p class="kb-meta">${r(t)}</p>`:""}
      <button type="button" class="kb-btn">${r(M)}</button>
      <div class="kb-brand"><a href="${r(l)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `,T(e),i.querySelector(".kb-btn").addEventListener("click",C)}function H(e){i.innerHTML=`
      ${e.title?`<p class="kb-title">\u{1F4E6} ${r(e.title)}</p>`:""}
      <p class="kb-desc">${e.expired?"\u6B64\u8CC7\u6599\u5305\u5DF2\u904E\u671F\u3002":"\u6B64\u8CC7\u6599\u5305\u5DF2\u984D\u6EFF\u3002"}</p>
      <div class="kb-brand"><a href="${r(l)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `}async function B(){let e;try{let n=await fetch(`${l}/api/embed/box?code=${encodeURIComponent(d)}`);if(!n.ok)throw new Error(String(n.status));e=await n.json()}catch{i.innerHTML='<div class="kb-skel">\u8CC7\u6599\u5305\u8F09\u5165\u5931\u6557</div>';return}let t=E();if(t&&e.unlockMode==="email"&&!e.expired){let n=await v({email:t.email,name:t.name});if(n.ok)return w(n.content||"",!0)}if(e.expired||e.full)return H(e);q(e)}B()})();})();
