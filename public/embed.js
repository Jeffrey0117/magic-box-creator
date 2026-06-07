(()=>{(function(){var S;let i=document.currentScript;if(!i)return;let m=i.getAttribute("data-box")||"";if(!m)return;let c=i.getAttribute("data-color")||"#7c5cff",L=i.getAttribute("data-cta")||"\u{1F513} \u89E3\u9396\u9818\u53D6",M=i.getAttribute("data-title")||"",T=i.getAttribute("data-desc")||"",s=(()=>{try{return new URL(i.getAttribute("src")||"",window.location.href).origin}catch{return""}})(),h="keybox_member";function z(){try{let e=localStorage.getItem(h);if(!e)return null;let t=JSON.parse(e);return t&&typeof t.email=="string"&&t.email.includes("@")?t:null}catch{return null}}function C(e){try{localStorage.setItem(h,JSON.stringify(e))}catch{}}let k=document.createElement("div");k.setAttribute("data-keybox",m),(S=i.parentNode)==null||S.insertBefore(k,i.nextSibling);let g=k.attachShadow({mode:"open"}),w=document.createElement("style");w.textContent=`
    .kb { font-family: 'Noto Sans TC', -apple-system, 'Segoe UI', sans-serif; background:#fff; border:1px solid #e7e5e4; border-radius:14px; padding:26px; box-shadow:0 6px 24px rgba(20,30,50,.06); color:#1c1917; line-height:1.7; text-align:center; }
    .kb-title { font-weight:900; font-size:1.2rem; margin:0 0 6px; }
    .kb-desc { color:#78716c; font-size:.9rem; margin:0 0 16px; white-space:pre-line; }
    .kb-meta { font-size:.78rem; color:#a8a29e; margin-bottom:12px; }
    .kb-btn { display:inline-block; background:${c}; color:#fff; border:none; cursor:pointer; font-weight:900; font-size:1rem; padding:13px 40px; border-radius:100px; font-family:inherit; }
    .kb-btn:disabled { opacity:.6; cursor:default; }
    .kb-content { text-align:left; white-space:pre-wrap; word-break:break-word; font-size:.95rem; background:#fafaf9; border:1px solid #f0f1f4; border-radius:10px; padding:14px 16px; }
    .kb-content a { color:${c}; font-weight:700; }
    .kb-ok { font-size:.9rem; color:${c}; font-weight:700; margin-bottom:10px; text-align:left; }
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
    .kb-input:focus { border-color:${c}; }
    .kb-submit { width:100%; box-sizing:border-box; background:${c}; color:#fff; border:none; cursor:pointer; font-weight:900; font-size:1.05rem; padding:13px; border-radius:100px; font-family:inherit; margin-top:4px; }
    .kb-submit:disabled { opacity:.6; cursor:default; }
    .kb-note { color:#9aa0a8; font-size:.74rem; margin-top:12px; line-height:1.6; }
    .kb-error { color:#dc2626; font-size:.85rem; margin-top:8px; display:none; }
  `,g.appendChild(w);let a=document.createElement("div");a.className="kb",a.innerHTML='<div class="kb-skel">\u8CC7\u6599\u5305\u8F09\u5165\u4E2D\u2026</div>',g.appendChild(a);let r=document.createElement("div");r.className="kb-overlay",g.appendChild(r);function o(e){return String(e==null?"":e).replace(/[<>&"]/g,t=>({"<":"&lt;",">":"&gt;","&":"&amp;",'"':"&quot;"})[t])}function H(e){return o(e).replace(/(https?:\/\/[^\s<]+)/g,'<a href="$1" target="_blank" rel="noopener">$1</a>')}function d(){r.classList.remove("open"),document.body.style.overflow=""}function v(e,t){d(),a.innerHTML=`
      <div class="kb-ok">${t?"\u{1F513} \u6B61\u8FCE\u56DE\u4F86\uFF0C\u5DF2\u70BA\u4F60\u81EA\u52D5\u89E3\u9396":"\u{1F513} \u89E3\u9396\u6210\u529F\uFF01"}</div>
      <div class="kb-content">${H(e)}</div>
      <div class="kb-brand"><a href="${o(s)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `}async function $(e){try{let t=await fetch(`${s}/api/embed/unlock`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({code:m,...e})}),n=await t.json().catch(()=>({}));return t.ok?{ok:!0,content:n.content,sent:!!n.sent,welcomeBack:!!n.welcomeBack}:{ok:!1,error:n.error||"\u89E3\u9396\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66"}}catch{return{ok:!1,error:"\u9023\u7DDA\u5931\u6557\uFF0C\u8ACB\u7A0D\u5F8C\u518D\u8A66"}}}function E(e){d(),a.innerHTML=`
      <p class="kb-title">\u{1F4EC} \u5DF2\u5BC4\u5230\u4F60\u7684\u4FE1\u7BB1\uFF01</p>
      <p class="kb-desc">\u8CC7\u6E90\u5DF2\u5BC4\u5230 <strong>${o(e)}</strong>
\u6C92\u770B\u5230\u7684\u8A71\uFF0C\u7FFB\u4E00\u4E0B\u5783\u573E\u4FE1\u4EF6\u593E\u3002</p>
      <div class="kb-brand"><a href="${o(s)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `}function q(e){let t=e.unlockMode==="keyword";r.innerHTML=`
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
    `,r.addEventListener("click",p=>{p.target===r&&d()}),r.querySelector(".kb-close").addEventListener("click",d),document.addEventListener("keydown",p=>{p.key==="Escape"&&d()});let n=r.querySelector("form"),b=r.querySelector(".kb-error");n.addEventListener("submit",async p=>{p.preventDefault();let y=new FormData(n),u=String(y.get("email")||"").trim(),x=String(y.get("name")||"").trim(),I=String(y.get("keyword")||"").trim();if(!u.includes("@")||!x)return;let f=n.querySelector(".kb-submit");f.disabled=!0,f.textContent="\u8655\u7406\u4E2D\u2026";let l=await $({email:u,name:x,...t?{keyword:I}:{}});l.ok?(C({email:u,name:x}),l.sent&&!l.content?E(u):v(l.content||"",!!l.welcomeBack)):(f.disabled=!1,f.textContent="\u4E0B\u8F09",b.textContent=l.error||"\u89E3\u9396\u5931\u6557",b.style.display="block")})}function B(){r.classList.add("open"),document.body.style.overflow="hidden"}function A(e){let t=e.quota?`\u5DF2\u9818\u53D6 ${e.claimed}/${e.quota}`:"",n=M||e.title,b=T||e.description;a.innerHTML=`
      ${n?`<p class="kb-title">\u{1F4E6} ${o(n)}</p>`:""}
      ${b?`<p class="kb-desc">${o(b)}</p>`:""}
      ${t?`<p class="kb-meta">${o(t)}</p>`:""}
      <button type="button" class="kb-btn">${o(L)}</button>
      <div class="kb-brand"><a href="${o(s)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `,q(e),a.querySelector(".kb-btn").addEventListener("click",B)}function O(e){a.innerHTML=`
      ${e.title?`<p class="kb-title">\u{1F4E6} ${o(e.title)}</p>`:""}
      <p class="kb-desc">${e.expired?"\u6B64\u8CC7\u6599\u5305\u5DF2\u904E\u671F\u3002":"\u6B64\u8CC7\u6599\u5305\u5DF2\u984D\u6EFF\u3002"}</p>
      <div class="kb-brand"><a href="${o(s)}" target="_blank" rel="noopener">\u{1F511} Powered by KeyBox</a></div>
    `}async function _(){let e;try{let n=await fetch(`${s}/api/embed/box?code=${encodeURIComponent(m)}`);if(!n.ok)throw new Error(String(n.status));e=await n.json()}catch{a.innerHTML='<div class="kb-skel">\u8CC7\u6599\u5305\u8F09\u5165\u5931\u6557</div>';return}let t=z();if(t&&e.unlockMode==="email"&&!e.expired){let n=await $({email:t.email,name:t.name});if(n.ok)return n.sent&&!n.content?E(t.email):v(n.content||"",!0)}if(e.expired||e.full)return O(e);A(e)}_()})();})();
