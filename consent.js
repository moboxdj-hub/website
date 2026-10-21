/* BASSROOM: banner de consentimiento + GA4 (solo tras aceptar). Consent Mode v2: todo denegado por defecto.
   gtag.js NO se descarga hasta que el visitante pulsa «Aceptar». Publicidad desactivada siempre. */
(function () {
  var GA4_ID = "G-1QLTFZ1BVH"; // ID de GA4 (formato G-XXXXXXX). Vacío = sin banner ni GA4.
  var KEY = "bassroom_consent_v1";
  if (!/^G-[A-Z0-9]+$/.test(GA4_ID)) return;

  function onReady(fn) { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn); else fn(); }
  onReady(function () {
    var l = document.querySelectorAll("[data-cookie-settings]");
    for (var i = 0; i < l.length; i++) l[i].hidden = false;
  });

  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
  gtag("consent", "default", {
    ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    analytics_storage: "denied", functionality_storage: "denied", personalization_storage: "denied",
    security_storage: "granted"
  });

  var gaLoaded = false;
  function loadGA() {
    if (gaLoaded) return;
    gaLoaded = true;
    gtag("consent", "update", { analytics_storage: "granted", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" });
    gtag("set", "ads_data_redaction", true);
    gtag("js", new Date());
    gtag("config", GA4_ID, { allow_google_signals: false, allow_ad_personalization_signals: false });
    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(GA4_ID);
    document.head.appendChild(s);
  }
  function get() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function set(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  function removeGaCookies() {
    var d = location.hostname.replace(/^www\./, "");
    document.cookie.split(";").forEach(function (c) {
      var n = c.split("=")[0].trim();
      if (n.indexOf("_ga") === 0) {
        document.cookie = n + "=; Max-Age=0; path=/";
        document.cookie = n + "=; Max-Age=0; path=/; domain=." + d;
        document.cookie = n + "=; Max-Age=0; path=/; domain=" + d;
      }
    });
  }
  window.bassroomConsent = {
    granted: function () { return get() === "granted"; },
    open: function () { show(true); }
  };
  // reserva_click a GA4 (solo si hay consentimiento). Vercel Analytics lo envía aparte.
  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("a[href]");
    if (!a) return;
    var h = a.getAttribute("href") || "";
    if ((h.indexOf("calendar.app.google") > -1 || /^\/reservar\/?$/.test(h)) && get() === "granted" && gaLoaded) {
      gtag("event", "reserva_click", { link_url: h, page_path: location.pathname, transport_type: "beacon" });
    }
    if (a.hasAttribute("data-cookie-settings")) { e.preventDefault(); show(true); }
  }, true);

  var css = ".ck{position:fixed;left:0;right:0;bottom:0;z-index:60;background:#080808;color:#f5f0e8;border-top:2px solid #c8ff00;font-family:var(--font-barlow),system-ui,sans-serif;padding-bottom:env(safe-area-inset-bottom,0);box-shadow:0 -8px 24px rgba(0,0,0,.45)}" +
    ".ck[hidden]{display:none}" +
    ".ck__in{max-width:72rem;margin:0 auto;padding:.875rem 1rem;display:flex;flex-direction:column;gap:.75rem}" +
    "@media(min-width:48rem){.ck__in{flex-direction:row;align-items:center;justify-content:space-between;gap:1.5rem;padding:.875rem 1.5rem}}" +
    ".ck__lbl{font-family:var(--font-space),ui-monospace,monospace;font-size:10px;letter-spacing:.22em;text-transform:uppercase;color:#c8ff00;margin:0 0 .25rem}" +
    ".ck__txt{font-size:.875rem;line-height:1.45;margin:0;color:#f5f0e8;max-width:46rem}.ck__txt a{color:#f5f0e8;text-decoration:underline;text-underline-offset:3px;white-space:nowrap}.ck__txt a:hover{color:#c8ff00}" +
    ".ck__btns{display:flex;gap:.5rem;flex-shrink:0}" +
    ".ck__b{flex:1 1 0;min-width:8rem;font-family:var(--font-space),ui-monospace,monospace;font-size:12px;font-weight:700;letter-spacing:.16em;text-transform:uppercase;min-height:2.75rem;padding:0 1.25rem;border:1px solid #c8ff00;background:transparent;color:#f5f0e8;cursor:pointer;border-radius:0;transition:background .15s,color .15s}" +
    ".ck__b:hover{background:#c8ff00;color:#080808}" +
    ".ck__b:focus-visible{outline:2px solid #f5f0e8;outline-offset:2px}";
  var box = null;
  function show(focus) {
    if (!box) {
      var st = document.createElement("style"); st.textContent = css; document.head.appendChild(st);
      box = document.createElement("div");
      box.className = "ck"; box.setAttribute("role", "region"); box.setAttribute("aria-label", "Aviso de cookies");
      box.innerHTML = '<div class="ck__in"><div><p class="ck__lbl">Cookies</p><p class="ck__txt">Usamos cookies de Google Analytics para saber cómo se usa la web. Solo se activan si aceptas. <a href="/cookies">Más información</a>.</p></div>' +
        '<div class="ck__btns"><button type="button" class="ck__b" data-ck="denied">Rechazar</button><button type="button" class="ck__b" data-ck="granted">Aceptar</button></div></div>';
      box.addEventListener("click", function (e) {
        var v = e.target.getAttribute && e.target.getAttribute("data-ck");
        if (!v) return;
        set(v); box.hidden = true;
        if (v === "granted") loadGA();
        else { gtag("consent", "update", { analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied" }); removeGaCookies(); }
      });
      (document.body || document.documentElement).appendChild(box);
    }
    box.hidden = false;
    if (focus) { var b = box.querySelector("button"); if (b) b.focus(); }
  }
  var c = get();
  if (c === "granted") loadGA();
  else if (c !== "denied") onReady(function () { show(false); });
})();
