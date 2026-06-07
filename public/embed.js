(()=>{(function(){var $;let i=document.currentScript;if(!i)return;let c=i.getAttribute("data-box")||"";if(!c)return;let s=i.getAttribute("data-color")||"#7c5cff",k=i.getAttribute("data-cta")||"\u{1F513} \u89E3\u9396\u9818\u53D6",a=(()=>{try{return new URL(i.getAttribute("src")||"",window.location.href).origin}catch{return""}})(),g="keybox_member";function v(){try{let e=localStorage.getItem(g);if(!e)return null;let t=JSON.parse(e);return t&&typeof t.email=="string"&&t.email.includes("@")?t:null}catch{return null}}function M(e){try{localStorage.setItem(g,JSON.stringify(e))}catch{}}let p=document.createElement("div");p.setAttribute("data-keybox",c),($=i.parentNode)==null||$.insertBefore(p,i.nextSibling);let y=p.attachShadow({mode:"open"}),x=document.createElement("style");x.textContent=`
    .kb { font-family: 'Noto Sans TC', -apple-system, 'Segoe UI', sans-serif; background:#fff; border:1px solid #e7e5e4; border-radius:14px; padding:24px; box-shadow:0 6px 24px rgba(20,30,50,.06); color:#1c1917; line-height:1.7; }
    .kb-title { font-weight:900; font-size:1.15rem; margin:0 0 4px; }
    .kb-desc { color:#78716c; font-size:.9rem; margin:0 0 14px; white-space:pre-line; }
    .kb-meta { font-size:.78rem; color:#a8a29e; margin-bottom:12px; }
    .kb-form { display:flex; flex-direction:column; gap:9px; }
    .kb-input { width:100%; box-sizing:border-box; padding:11px 14px; border:1px solid #d6d3d1; border-radius:10px; font-size:.95rem; font-family:inherit; outline:none; }
    .kb-input:focus { border-color:${s}; }
    .kb-btn { width:100%; box-sizing:border-box; background:${s}; color:#fff; border:none; cursor:pointer; font-weight:900; font-size:1rem; padding:12px; border-radius:100px; font-family:inherit; }
    .kb-btn:disabled { opacity:.6; cursor:default; }
    .kb-note { text-align:center; color:#a8a29e; font-size:.72rem; margin:10px 0 0; }
    .kb-error { color:#dc2626; font-size:.85rem; margin-top:8px; display:none; }
    .kb-content { white-space:pre-wrap; word-break:break-word; font-size:.95rem; background:#fafaf9; border:1px solid #f0f1f4; border-radius:10px; padding:14px 16px; }
    .kb-content a { color:${s}; font-weight:700; }
    .kb-ok { font-size:.85rem; color:${s}; font-weight:700; margin-bottom:8px; }
    .kb-brand { text-align:right; margin-top:10px; }
    .kb-brand a { color:#c7c2bd; font-size:.7rem; text-decoration:none; }
    .kb-skel { height:88px; display:flex; align-items:center; justify-content:center; color:#a8a29e; font-size:.85rem; }
  `,y.appendChild(x);let r=document.createElement("div");r.className="kb",r.innerHTML='<div class="kb-skel">\u8CC7\u6599\u5305\u8F09\u5165\u4E2D\u2026</div>',y.appendChild(r);function o(e){return String(e==null?"":e).replace(/[<>&"]/g,t=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"})[t])}function E(e){return o(e).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>')}function h(e,t){r.innerHTML=`
      <div class="kb-ok">${t?"\u{1F513} \u6B61\u8FCE\u56DE\u4F86\uFF0C\u5DF2\u70BA\u4F60\u81EA\u52D5\u89E3\u9396":"\u{1F513} \u89E3\u9396\u6210\u529F\uFF01"}</div>
      <div class="kb-content">${E(e)}</div>
      <div class="kb-brand"><a href="${o(a)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `}async function w(e){try{let t=await fetch(`${a}/api/embed/unlock`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:c,...e})}),n=await t.json().catch(()=>({}));return t.ok?{ok:!0,content:n.content,welcomeBack:!!n.welcomeBack}:{ok:!1,error:n.error||"\u89E3\u9396\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66"}}catch{return{ok:!1,error:"\u9023\u7DDA\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66"}}}function C(e){let t=e.unlockMode==="keyword",n=e.quota?`\u5DF2\u9818\u53D6 ${e.claimed}/${e.quota}`:"";r.innerHTML=`
      ${e.title?`<p class="kb-title">\u{1F4E6} ${o(e.title)}</p>`:""}
      ${e.description?`<p class="kb-desc">${o(e.description)}</p>`:""}
      ${n?`<p class="kb-meta">${o(n)}</p>`:""}
      <form class="kb-form">
        <input class="kb-input" name="name" type="text" placeholder="\u4F60\u7684\u540D\u5B57" required>
        <input class="kb-input" name="email" type="email" placeholder="you@example.com" required>
        ${t?'<input class="kb-input" name="keyword" type="text" placeholder="\u95DC\u9375\u5B57" required>':""}
        <button class="kb-btn" type="submit">${o(k)}</button>
      </form>
      <p class="kb-error"></p>
      <p class="kb-note">\u586B\u4E00\u6B21\uFF0C\u4E4B\u5F8C\u7684\u514D\u8CBB\u8CC7\u6E90\u90FD\u81EA\u52D5\u89E3\u9396\u3002\u4E0D\u4E82\u767C\u4FE1\u3002</p>
      <div class="kb-brand"><a href="${o(a)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `;let b=r.querySelector("form"),S=r.querySelector(".kb-error");b.addEventListener("submit",async T=>{T.preventDefault();let m=new FormData(b),u=String(m.get("email")||"").trim(),f=String(m.get("name")||"").trim(),B=String(m.get("keyword")||"").trim();if(!u.includes("@")||!f)return;let l=b.querySelector("button");l.disabled=!0,l.textContent="\u8655\u7406\u4E2D\u2026";let d=await w({email:u,name:f,...t?{keyword:B}:{}});d.ok?(M({email:u,name:f}),h(d.content||"",!!d.welcomeBack)):(l.disabled=!1,l.textContent=k,S.textContent=d.error||"\u89E3\u9396\u5931\u6557",S.style.display="block")})}function z(e){r.innerHTML=`
      ${e.title?`<p class="kb-title">\u{1F4E6} ${o(e.title)}</p>`:""}
      <p class="kb-desc">${e.expired?"\u6B64\u8CC7\u6599\u5305\u5DF2\u904E\u671F\u3002":"\u6B64\u8CC7\u6599\u5305\u5DF2\u984D\u6EFF\u3002"}</p>
      <div class="kb-brand"><a href="${o(a)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `}async function L(){let e;try{let n=await fetch(`${a}/api/embed/box?code=${encodeURIComponent(c)}`);if(!n.ok)throw new Error(String(n.status));e=await n.json()}catch{r.innerHTML='<div class="kb-skel">\u8CC7\u6599\u5305\u8F09\u5165\u5931\u6557</div>';return}let t=v();if(t&&e.unlockMode==="email"&&!e.expired){let n=await w({email:t.email,name:t.name});if(n.ok)return h(n.content||"",!0)}if(e.expired||e.full)return z(e);C(e)}L()})();})();
