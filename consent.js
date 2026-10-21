/* BASSROOM: banner de consentimiento + GA4 (solo tras aceptar). Consent Mode v2: todo denegado por defecto. */
(function () {
  var GA4_ID = "{{GA4_ID}}";
  var KEY = "bassroom_consent_v1";
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", functionality_storage: "denied", personalization_storage: "denied",
    security_storage: "granted", wait_for_update: 500
  });
  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded || !GA4_ID || GA4_ID.indexOf("{{") === 0) return;
    gaLoaded = true;
    gtag("consent", "update", { analytics_storage: "granted" });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
    gtag("js", new Date());
    gtag("config", GA4_ID, { anonymize_ip: true });
  }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function removeGaCookies() {
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n.indexOf("_ga") === 0) {
        var d = location.hostname.replace(/^www\./, "");
        document.cookie = n + "=; Max-Age=0; path=/";
        document.cookie = n + "=; Max-Age=0; path=/; domain=." + d;
      }
    });
  }
  window.bassroomConsent = {
    granted: function () { return get() === "granted"; },
    open: function () { show(); }
  };
  // reserva_click a GA4 (solo si hay consentimiento). Vercel Analytics lo envía aparte.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if ((h.indexOf("calendar.app.google") > -1 || /^\/reservar\/?$/.test(h)) && get() === "granted" && gaLoaded) {
      gtag("event", "reserva_click", { link_url: h, page_path: location.pathname, transport_type: "beacon" });
    }
    if (a.hasAttribute("data-cookie-settings")) { e.preventDefault(); show(); }
  }, true);

  var css = ".ck{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#080808;color:#f5f0e8;border-top:2px solid #c8ff00;font-family:var(--font-barlow),system-ui,sans-serif}" +
    ".ck__in{max-width:72rem;margin:0 auto;padding:1rem;display:flex;flex-direction:column;gap:.75rem}" +
    "@media(min-width:48rem){.ck__in{flex-direction:row;align-items:center;justify-content:space-between;padding:1rem 1.5rem}}" +
    ".ck__lbl{font-family:var(--font-space),ui-monospace,monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#c8ff00;margin:0 0 .25rem}" +
    ".ck__txt{font-size:.875rem;line-height:1.5;margin:0;color:#f5f0e8;max-width:46rem}.ck__txt a{color:#f5f0e8;text-decoration:underline;text-underline-offset:3px}.ck__txt a:hover{color:#c8ff00}" +
    ".ck__btns{display:flex;gap:.5rem;flex-shrink:0}" +
    ".ck__b{font-family:var(--font-space),ui-monospace,monospace;font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;height:2.5rem;padding:0 1rem;border:1px solid #c8ff00;cursor:pointer}" +
    ".ck__b--ok{background:#c8ff00;color:#080808}.ck__b--ok:hover{background:#f5f0e8;border-color:#f5f0e8}" +
    ".ck__b--no{background:transparent;color:#f5f0e8;border-color:#2a2a2a}.ck__b--no:hover{border-color:#f5f0e8}" +
    ".ck__b:focus-visible{outline:2px solid #f5f0e8;outline-offset:2px}";
  var box = null;
  function show() {
    if (box) { box.hidden = false; return; }
    var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
    box = document.createElement("div");
    box.className = "ck"; box.setAttribute("role", "dialog"); box.setAttribute("aria-live", "polite"); box.setAttribute("aria-label", "Cookies");
    box.innerHTML = '<div class="ck__in"><div><p class="ck__lbl">Cookies</p><p class="ck__txt">Usamos cookies de analítica (Google Analytics) solo si las aceptas, para saber cómo se usa la web. Puedes cambiar tu elección cuando quieras. <a href="/cookies">Política de cookies</a>.</p></div>' +
      '<div class="ck__btns"><button type="button" class="ck__b ck__b--no" data-ck="denied">Rechazar</button><button type="button" class="ck__b ck__b--ok" data-ck="granted">Aceptar</button></div></div>';
    box.addEventListener("click", function (e) {
      var v = e.target.getAttribute && e.target.getAttribute("data-ck");
      if (!v) return;
      set(v); box.hidden = true;
      if (v === "granted") loadGA();
      else { gtag("consent", "update", { analytics_storage: "denied" }); removeGaCookies(); }
    });
    (document.body || document.documentElement).appendChild(box);
  }
  var c = get();
  if (c === "granted") loadGA();
  else if (c !== "denied") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", show); else show();
  }
})();
