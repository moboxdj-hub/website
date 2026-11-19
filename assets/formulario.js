/* Bassroom DJs School: formulario «Quiero empezar». Sin servicios externos de formularios:
   el envío va a un Apps Script propio de la cuenta de la escuela (correo + hoja de Google). */
(function () {
  var ENDPOINT = "__ENDPOINT__";
  var PRIV = "/privacidad";
  var overlay, panel, form, lastFocus, started;

  function track(name) { try { window.va && window.va("event", { name: name }); } catch (e) {} }

  function chips(name, options, row) {
    return '<div class="qe-chips' + (row ? ' qe-chips--row' : '') + '">' + options.map(function (o) {
      return '<label class="qe-chip"><input type="radio" name="' + name + '" value="' + o + '"><span>' + o + '</span></label>';
    }).join("") + "</div>";
  }

  function build() {
    overlay = document.createElement("div");
    overlay.className = "qe-overlay";
    overlay.id = "quiero-empezar";
    overlay.innerHTML =
      '<div class="qe-panel" role="dialog" aria-modal="true" aria-labelledby="qe-title">' +
      '<button type="button" class="qe-close" aria-label="Cerrar">&times;</button>' +
      '<div class="qe-head"><div class="qe-kicker">Bassroom DJs School</div>' +
      '<h2 class="qe-title" id="qe-title">Quiero empezar</h2>' +
      '<p class="qe-intro">Cuéntame un poco sobre ti y Mónica se pondrá en contacto contigo.</p></div>' +
      '<form novalidate>' +
      '<div class="qe-field"><label class="qe-label" for="qe-nombre">Nombre</label><input class="qe-input" id="qe-nombre" name="nombre" type="text" autocomplete="name" required maxlength="120"></div>' +
      '<div class="qe-field"><label class="qe-label" for="qe-tel">Teléfono</label><input class="qe-input" id="qe-tel" name="telefono" type="tel" autocomplete="tel" inputmode="tel" required maxlength="40"></div>' +
      '<div class="qe-field"><label class="qe-label" for="qe-ig">Instagram <span class="qe-opt">(opcional)</span></label><input class="qe-input" id="qe-ig" name="instagram" type="text" placeholder="@tuusuario" autocapitalize="none" maxlength="80"></div>' +
      '<fieldset class="qe-field"><legend>¿Cómo ha sido tu contacto con el mundo DJ hasta ahora?</legend>' +
      chips("contacto", ["Parto de cero", "He probado por mi cuenta con YouTube o tutoriales", "He estado en otra escuela o curso"]) + "</fieldset>" +
      '<fieldset class="qe-field"><legend>¿Tienes equipo para practicar o aún no?</legend>' + chips("equipo", ["Sí", "Aún no"], true) + "</fieldset>" +
      '<fieldset class="qe-field"><legend>¿Qué te gustaría conseguir?</legend>' +
      chips("objetivo", ["Disfrutarlo como hobby", "Pinchar en público", "Dedicarme profesionalmente"]) + "</fieldset>" +
      '<div class="qe-field"><label class="qe-label" for="qe-motivo">¿Qué te ha hecho querer aprender ahora? <span class="qe-opt">(opcional)</span></label><textarea class="qe-input" id="qe-motivo" name="motivo" maxlength="1000"></textarea></div>' +
      '<div class="qe-trap" aria-hidden="true"><label>Web<input type="text" name="web" tabindex="-1" autocomplete="off"></label></div>' +
      '<button class="qe-submit" type="submit">Enviar</button>' +
      '<p class="qe-error" role="alert" hidden></p>' +
      '<p class="qe-legal">Al enviarlo, aceptas que Mónica use estos datos solo para contactarte. Más información en la <a href="' + PRIV + '">política de privacidad</a>.</p>' +
      "</form>" +
      '<div class="qe-done" role="status"><div class="qe-kicker">Bassroom DJs School</div><h2>¡Gracias!</h2>' +
      "<p>Hemos recibido tus respuestas. Mónica se pondrá en contacto contigo muy pronto.</p>" +
      '<button type="button" class="qe-btn2" data-qe-close>Cerrar</button></div></div>';
    document.body.appendChild(overlay);
    panel = overlay.querySelector(".qe-panel");
    form = overlay.querySelector("form");
    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    overlay.querySelector(".qe-close").addEventListener("click", close);
    overlay.querySelector("[data-qe-close]").addEventListener("click", close);
    form.addEventListener("submit", submit);
    form.addEventListener("input", function () { if (!started) { started = true; track("formulario_iniciado"); } });
  }

  function open(e) {
    if (e) e.preventDefault();
    if (!overlay) build();
    lastFocus = document.activeElement;
    overlay.setAttribute("data-open", "true");
    document.body.classList.add("qe-lock");
    track("quiero_empezar_click");
    setTimeout(function () { if (panel.getAttribute("data-sent") !== "true") overlay.querySelector("#qe-nombre").focus(); }, 30);
  }

  function close() {
    if (!overlay) return;
    overlay.removeAttribute("data-open");
    document.body.classList.remove("qe-lock");
    if (lastFocus && lastFocus.focus) lastFocus.focus();
    if (location.hash === "#quiero-empezar") history.replaceState(null, "", location.pathname + location.search);
  }

  function showError(msg) {
    var p = form.querySelector(".qe-error");
    p.textContent = msg; p.hidden = !msg;
  }

  function submit(e) {
    e.preventDefault();
    showError("");
    var f = form.elements;
    var nombre = f.nombre.value.trim(), tel = f.telefono.value.trim();
    if (!nombre) { showError("Escribe tu nombre."); f.nombre.focus(); return; }
    if (tel.replace(/\D/g, "").length < 6) { showError("Escribe un teléfono válido para que Mónica pueda contactarte."); f.telefono.focus(); return; }
    function val(n) { var c = form.querySelector('input[name="' + n + '"]:checked'); return c ? c.value : ""; }
    var data = {
      nombre: nombre, telefono: tel, instagram: f.instagram.value.trim(),
      contacto: val("contacto"), equipo: val("equipo"), objetivo: val("objetivo"),
      motivo: f.motivo.value.trim(), web: f.web.value, pagina: location.pathname
    };
    var btn = form.querySelector(".qe-submit");
    btn.disabled = true; btn.textContent = "Enviando…";
    fetch(ENDPOINT, { method: "POST", body: JSON.stringify(data) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.ok) throw new Error("no ok");
        panel.setAttribute("data-sent", "true");
        track("solicitud_enviada");
        overlay.scrollTop = 0;
        overlay.querySelector(".qe-btn2").focus();
      })
      .catch(function () {
        btn.disabled = false; btn.textContent = "Enviar";
        showError("No se ha podido enviar. Revisa tu conexión e inténtalo de nuevo.");
      });
  }

  document.addEventListener("click", function (e) {
    var a = e.target.closest && e.target.closest("[data-quiero-empezar]");
    if (a) open(e);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && overlay && overlay.getAttribute("data-open") === "true") close();
  });
  if (location.hash === "#quiero-empezar") { if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", open); else open(); }
})();
