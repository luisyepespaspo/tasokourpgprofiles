/* ============================================================
   MODALES · fichas editables
   ============================================================ */
window.Modals = (function () {
  "use strict";

  const A = window.App;
  const esc = A.esc;

  let modal = null;
  let lastFocus = null;

  const PALETTE = ["#ff6b9d", "#ffb26b", "#b28bff", "#6cc7ff", "#6bffb8", "#ff6b6b", "#e9c789", "#9aa7ff"];

  /* ---------- infraestructura ---------- */
  function val(name) {
    const el = document.querySelector('[data-modal] [name="' + name + '"]');
    return el ? String(el.value).trim() : "";
  }

  function shell(opts) {
    return '<div class="modal-backdrop" data-backdrop>' +
      '<div class="modal' + (opts.wide ? " modal--wide" : "") + '" role="dialog" aria-modal="true" aria-labelledby="modalTitle" data-modal>' +
        '<button class="modal__close" type="button" data-action="close-modal" aria-label="Cerrar">✕</button>' +
        '<header class="modal__head">' +
          '<p class="eyebrow">' + esc(opts.eyebrow) + "</p>" +
          '<h2 class="modal__title" id="modalTitle">' + esc(opts.title) + "</h2>" +
          (opts.jp ? '<p class="modal__jp">' + esc(opts.jp) + "</p>" : "") +
        "</header>" +
        '<div class="modal__body">' + opts.body + "</div>" +
        (opts.foot ? '<footer class="modal__foot">' + opts.foot + "</footer>" : "") +
      "</div></div>";
  }

  function fact(label, value) {
    if (!value) return "";
    return '<div class="fact"><dt>' + esc(label) + "</dt><dd>" + esc(value) + "</dd></div>";
  }

  function prose(title, text) {
    if (!text) return "";
    return '<section class="sheet__block"><h3>' + esc(title) + "</h3><p>" + esc(text) + "</p></section>";
  }

  function openModal(config) {
    if (!modal) lastFocus = document.activeElement;
    modal = {
      kind: config.kind,
      draft: Store.clone(config.draft),
      original: config.isNew ? null : Store.clone(config.draft),
      isNew: !!config.isNew,
      mode: config.mode || "view",
      releaseId: config.releaseId || null
    };
    document.body.classList.add("no-scroll");
    renderModal();
    const closeBtn = document.querySelector(".modal__close");
    if (closeBtn) closeBtn.focus({ preventScroll: true });
  }

  function close() {
    if (!modal) return;
    modal = null;
    document.getElementById("modalRoot").innerHTML = "";
    document.body.classList.remove("no-scroll");
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus({ preventScroll: true });
    lastFocus = null;
  }

  function renderModal() {
    if (!modal) {
      document.getElementById("modalRoot").innerHTML = "";
      return;
    }
    let html = "";
    if (modal.kind === "character") html = characterModal();
    else if (modal.kind === "member") html = memberModal();
    else if (modal.kind === "release") html = releaseModal();
    else if (modal.kind === "edition") html = editionModal();
    else if (modal.kind === "series") html = seriesModal();
    else if (modal.kind === "group") html = groupModal();
    else if (modal.kind === "settings") html = settingsModal();
    document.getElementById("modalRoot").innerHTML = html;
  }

  function persist() {
    return Store.mutate(function (s) {
      if (modal.kind === "series") {
        const index = s.series.findIndex(function (x) { return x.id === modal.draft.id; });
        if (index >= 0) s.series[index] = modal.draft;
        return;
      }
      if (modal.kind === "group") {
        Object.assign(s.group, modal.draft);
        return;
      }
      if (modal.kind === "settings") {
        s.meta.siteTitle = modal.draft.siteTitle || s.meta.siteTitle;
        s.meta.subtitle = modal.draft.subtitle || "";
        s.meta.intro = modal.draft.intro || "";
        return;
      }
      if (modal.kind === "edition") {
        const release = s.group.releases.find(function (r) { return r.id === modal.releaseId; });
        if (!release) return;
        release.editions = Array.isArray(release.editions) ? release.editions : [];
        const index = release.editions.findIndex(function (e) { return e.id === modal.draft.id; });
        if (index >= 0) release.editions[index] = modal.draft;
        else release.editions.push(modal.draft);
        return;
      }
      const list = modal.kind === "character" ? s.characters
        : modal.kind === "member" ? s.group.members
        : s.group.releases;
      const index = list.findIndex(function (x) { return x.id === modal.draft.id; });
      if (index >= 0) list[index] = modal.draft;
      else list.push(modal.draft);
    });
  }

  function commit(message) {
    const ok = persist();
    modal.isNew = false;
    modal.original = Store.clone(modal.draft);
    modal.mode = "view";
    A.render();
    renderModal();
    A.toast(ok ? message : "No se pudo guardar: el navegador está sin espacio. Exporta un respaldo.");
  }

  /* ---------- personaje ---------- */
  function openCharacter(id) {
    const c = A.state().characters.find(function (x) { return x.id === id; });
    if (c) openModal({ kind: "character", draft: c, mode: "view" });
  }

  function newCharacter(seriesId) {
    const s = A.state();
    const series = A.seriesById(seriesId) || s.series[0];
    openModal({
      kind: "character",
      isNew: true,
      mode: "edit",
      draft: {
        id: Store.uid("c"),
        seriesId: series ? series.id : "",
        role: "protagonist",
        name: "Nuevo personaje",
        nameJp: "",
        epithet: "",
        age: "",
        birthday: "",
        height: "",
        color: series ? series.accent : PALETTE[0],
        image: null,
        summary: "",
        personality: "",
        backstory: "",
        quote: "",
        tags: [],
        relationships: []
      }
    });
  }

  function characterModal() {
    const c = modal.draft;
    const series = A.seriesById(c.seriesId);
    return modal.mode === "edit" ? characterEdit(c, series) : characterView(c, series);
  }

  function characterView(c, series) {
    const relations = (c.relationships || []).map(function (rel) {
      const target = A.charById(rel.targetId);
      if (!target) return "";
      const targetSeries = A.seriesById(target.seriesId);
      return '<button class="rel-chip" type="button" data-action="open-character" data-id="' + esc(target.id) +
        '" style="--accent:' + esc(targetSeries ? targetSeries.accent : "#e9c789") + '">' +
        '<span class="rel-chip__label">' + esc(rel.label) + "</span>" +
        '<span class="rel-chip__name">' + esc(target.name) + "</span></button>";
    }).join("");

    const body = '<div class="sheet">' +
      '<div class="sheet__media">' + A.mediaHTML(c, "portrait") +
        (c.tags.length ? '<div class="tag-row">' + c.tags.map(function (t) {
          return '<span class="tag">' + esc(t) + "</span>";
        }).join("") + "</div>" : "") +
      "</div>" +
      '<div class="sheet__content">' +
        (c.epithet ? '<p class="sheet__epithet">“' + esc(c.epithet) + '”</p>' : "") +
        (c.summary ? '<p class="sheet__summary">' + esc(c.summary) + "</p>" : "") +
        '<dl class="facts">' +
          fact("Serie", series ? series.name : "") +
          fact("Rol", A.ROLE_LABEL[c.role] || "") +
          fact("Edad", c.age) +
          fact("Cumpleaños", c.birthday) +
          fact("Altura", c.height) +
        "</dl>" +
        prose("Personalidad", c.personality) +
        prose("Historia", c.backstory) +
        (c.quote ? '<blockquote class="quote">“' + esc(c.quote) + '”</blockquote>' : "") +
        (relations ? '<section class="sheet__block"><h3>Vínculos</h3><div class="rel-chips">' + relations + "</div></section>" : "") +
      "</div></div>";

    return shell({
      eyebrow: (series ? series.code : "PERSONAJE") + " · " + (A.ROLE_LABEL[c.role] || ""),
      title: c.name,
      jp: c.nameJp,
      body: body,
      wide: true,
      foot: '<button class="btn btn--danger btn--ghost" type="button" data-action="delete-character">Eliminar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--ghost" type="button" data-action="close-modal">Cerrar</button>' +
        '<button class="btn btn--primary" type="button" data-action="edit-character">Editar ficha</button>'
    });
  }

  function characterEdit(c) {
    const s = A.state();
    const others = s.characters.filter(function (x) { return x.id !== c.id; });
    const rels = (c.relationships || []).map(function (r) { return A.relRowHTML(r, others); }).join("");

    const seriesOptions = s.series.map(function (x) { return [x.id, x.code + " · " + x.name]; });
    const roleOptions = A.ROLE_ORDER.map(function (r) { return [r, A.ROLE_LABEL[r]]; });

    const body = '<div class="form-layout">' +
      '<aside class="form-aside">' +
        A.imageEditorHTML(c, "portrait") +
        A.colorFieldHTML(c.color) +
      "</aside>" +
      '<div class="form-main">' +
        '<div class="form-grid">' +
          A.fieldHTML("Nombre", "name", c.name) +
          A.fieldHTML("Nombre en japonés", "nameJp", c.nameJp, { placeholder: "水野 明" }) +
          A.fieldHTML("Serie", "seriesId", c.seriesId, { select: seriesOptions }) +
          A.fieldHTML("Rol", "role", c.role, { select: roleOptions }) +
          A.fieldHTML("Epíteto", "epithet", c.epithet, { full: true, placeholder: "Una frase que lo resuma" }) +
          A.fieldHTML("Edad", "age", c.age) +
          A.fieldHTML("Cumpleaños", "birthday", c.birthday) +
          A.fieldHTML("Altura", "height", c.height) +
          A.fieldHTML("Etiquetas", "tags", (c.tags || []).join(", "), { full: true, placeholder: "separa con comas: Voz, Center, 1ª generación" }) +
        "</div>" +
        '<div class="form-grid form-grid--single">' +
          A.fieldHTML("Resumen", "summary", c.summary, { textarea: true, rows: 3 }) +
          A.fieldHTML("Personalidad", "personality", c.personality, { textarea: true, rows: 3 }) +
          A.fieldHTML("Historia", "backstory", c.backstory, { textarea: true, rows: 4 }) +
          A.fieldHTML("Frase", "quote", c.quote, { textarea: true, rows: 2 }) +
        "</div>" +
        '<div class="form-block">' +
          '<div class="form-block__head"><h3>Vínculos</h3>' +
            '<button class="btn btn--sm btn--ghost" type="button" data-action="add-rel">+ Añadir vínculo</button>' +
          "</div>" +
          '<div class="rel-list" data-rel-list>' + rels + "</div>" +
          '<p class="hint">Los vínculos conectan personajes entre series. Aparecen en la ficha y se pueden abrir.</p>' +
        "</div>" +
      "</div></div>";

    return shell({
      eyebrow: modal.isNew ? "NUEVO PERSONAJE" : "EDITANDO FICHA",
      title: modal.isNew ? "Nuevo personaje" : c.name,
      jp: c.nameJp,
      body: body,
      wide: true,
      foot: '<button class="btn btn--ghost" type="button" data-action="cancel-edit">Cancelar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--primary" type="button" data-action="save-character">' +
        (modal.isNew ? "Crear personaje" : "Guardar cambios") + "</button>"
    });
  }

  function collectCharacter(c) {
    c.name = val("name") || c.name || "Personaje sin nombre";
    c.nameJp = val("nameJp");
    c.seriesId = val("seriesId") || c.seriesId;
    c.role = val("role") || c.role;
    c.epithet = val("epithet");
    c.age = val("age");
    c.birthday = val("birthday");
    c.height = val("height");
    c.color = val("color") || c.color;
    c.summary = val("summary");
    c.personality = val("personality");
    c.backstory = val("backstory");
    c.quote = val("quote");
    c.tags = val("tags").split(",").map(function (t) { return t.trim(); }).filter(Boolean);

    const url = val("imageUrl");
    c.image = url || c.image || null;

    c.relationships = Array.from(document.querySelectorAll("[data-rel-row]")).map(function (row) {
      return {
        targetId: row.querySelector("[data-rel-target]").value,
        label: row.querySelector("[data-rel-label]").value.trim()
      };
    }).filter(function (rel) { return rel.targetId && rel.targetId !== c.id; });
  }

  /* ---------- integrante ---------- */
  function openMember(id) {
    const m = A.state().group.members.find(function (x) { return x.id === id; });
    if (m) openModal({ kind: "member", draft: m, mode: "view" });
  }

  function newMember() {
    const g = A.state().group;
    openModal({
      kind: "member",
      isNew: true,
      mode: "edit",
      draft: {
        id: Store.uid("m"),
        name: "Nueva integrante",
        nameJp: "",
        characterId: "",
        generation: "1ª generación",
        position: "",
        birthday: "",
        height: "",
        color: PALETTE[Math.floor(Math.random() * PALETTE.length)],
        image: null,
        bio: ""
      }
    });
  }

  function memberModal() {
    const m = modal.draft;
    return modal.mode === "edit" ? memberEdit(m) : memberView(m);
  }

  function memberView(m) {
    const ch = m.characterId ? A.charById(m.characterId) : null;
    const series = ch ? A.seriesById(ch.seriesId) : null;

    const body = '<div class="sheet">' +
      '<div class="sheet__media">' + A.mediaHTML(m, "portrait") +
        '<div class="tag-row"><span class="tag">' + esc(m.generation || "Integrante") + "</span>" +
        (m.position ? '<span class="tag">' + esc(m.position) + "</span>" : "") + "</div>" +
      "</div>" +
      '<div class="sheet__content">' +
        '<p class="sheet__epithet">' + esc(m.position) + "</p>" +
        '<dl class="facts">' +
          fact("Generación", m.generation) +
          fact("Cumpleaños", m.birthday) +
          fact("Altura", m.height) +
        "</dl>" +
        prose("Sobre ella", m.bio) +
        (ch ? '<section class="sheet__block"><h3>Personaje vinculado</h3>' +
          '<button class="rel-chip" type="button" data-action="open-character" data-id="' + esc(ch.id) + '">' +
          '<span class="rel-chip__label">' + esc(series ? series.code : "") + "</span>" +
          '<span class="rel-chip__name">' + esc(ch.name) + "</span></button></section>" : "") +
      "</div></div>";

    return shell({
      eyebrow: "INTEGRANTE · " + (m.generation || ""),
      title: m.name,
      jp: m.nameJp,
      body: body,
      wide: true,
      foot: '<button class="btn btn--danger btn--ghost" type="button" data-action="delete-member">Eliminar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--ghost" type="button" data-action="close-modal">Cerrar</button>' +
        '<button class="btn btn--primary" type="button" data-action="edit-member">Editar ficha</button>'
    });
  }

  function memberEdit(m) {
    const chars = A.state().characters.map(function (c) {
      const series = A.seriesById(c.seriesId);
      return [c.id, (series ? series.code + " · " : "") + c.name];
    });
    const charOptions = [["", "— Sin vincular —"]].concat(chars);

    const body = '<div class="form-layout">' +
      '<aside class="form-aside">' +
        A.imageEditorHTML(m, "portrait") +
        A.colorFieldHTML(m.color) +
      "</aside>" +
      '<div class="form-main">' +
        '<div class="form-grid">' +
          A.fieldHTML("Nombre artístico", "name", m.name) +
          A.fieldHTML("Nombre en japonés", "nameJp", m.nameJp) +
          A.fieldHTML("Generación", "generation", m.generation, { placeholder: "1ª generación" }) +
          A.fieldHTML("Posición", "position", m.position, { placeholder: "Center · Voz principal" }) +
          A.fieldHTML("Cumpleaños", "birthday", m.birthday) +
          A.fieldHTML("Altura", "height", m.height) +
          A.fieldHTML("Personaje vinculado", "characterId", m.characterId, { select: charOptions, full: true }) +
          A.fieldHTML("Sobre ella", "bio", m.bio, { textarea: true, rows: 4, full: true }) +
        "</div>" +
      "</div></div>";

    return shell({
      eyebrow: modal.isNew ? "NUEVA INTEGRANTE" : "EDITANDO INTEGRANTE",
      title: modal.isNew ? "Nueva integrante" : m.name,
      jp: m.nameJp,
      body: body,
      wide: true,
      foot: '<button class="btn btn--ghost" type="button" data-action="cancel-edit">Cancelar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--primary" type="button" data-action="save-member">' +
        (modal.isNew ? "Crear integrante" : "Guardar cambios") + "</button>"
    });
  }

  function collectMember(m) {
    m.name = val("name") || m.name || "Integrante";
    m.nameJp = val("nameJp");
    m.generation = val("generation");
    m.position = val("position");
    m.birthday = val("birthday");
    m.height = val("height");
    m.characterId = val("characterId");
    m.color = val("color") || m.color;
    m.bio = val("bio");
    const url = val("imageUrl");
    m.image = url || m.image || null;
  }

  /* ---------- grupo ---------- */
  function openGroup() {
    const g = A.state().group;
    openModal({
      kind: "group",
      mode: "edit",
      draft: {
        name: g.name,
        nameJp: g.nameJp,
        agency: g.agency,
        label: g.label,
        debut: g.debut,
        color: g.color,
        concept: g.concept
      }
    });
  }

  function groupModal() {
    const g = modal.draft;
    const body = '<div class="form-grid">' +
      A.fieldHTML("Nombre del grupo", "name", g.name) +
      A.fieldHTML("Nombre en japonés", "nameJp", g.nameJp) +
      A.fieldHTML("Agencia", "agency", g.agency) +
      A.fieldHTML("Sello discográfico", "label", g.label) +
      A.fieldHTML("Fecha de debut", "debut", g.debut, { type: "date" }) +
      A.fieldHTML("Color del grupo", "color", g.color, { type: "color" }) +
      A.fieldHTML("Concepto", "concept", g.concept, { textarea: true, rows: 5, full: true }) +
    "</div>";

    return shell({
      eyebrow: "FICHA DEL GRUPO",
      title: "Editar grupo",
      jp: g.nameJp,
      body: body,
      foot: '<button class="btn btn--ghost" type="button" data-action="close-modal">Cancelar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--primary" type="button" data-action="save-group">Guardar grupo</button>'
    });
  }

  function collectGroup(g) {
    g.name = val("name") || g.name;
    g.nameJp = val("nameJp");
    g.agency = val("agency");
    g.label = val("label");
    g.debut = val("debut");
    g.color = val("color") || g.color;
    g.concept = val("concept");
  }

  /* ---------- serie ---------- */
  function openSeries(id) {
    const s = A.state().series.find(function (x) { return x.id === id; });
    if (s) openModal({ kind: "series", mode: "edit", draft: s });
  }

  function seriesModal() {
    const s = modal.draft;
    const body = '<div class="form-grid">' +
      A.fieldHTML("Código", "code", s.code, { placeholder: "SERIE I" }) +
      A.fieldHTML("Nombre", "name", s.name) +
      A.fieldHTML("Nombre en japonés", "nameJp", s.nameJp) +
      A.fieldHTML("Color de la serie", "color", s.accent, { type: "color" }) +
      A.fieldHTML("Descripción", "description", s.description, { textarea: true, rows: 4, full: true }) +
    "</div>";

    return shell({
      eyebrow: "FICHA DE LA SERIE",
      title: "Editar serie",
      jp: s.nameJp,
      body: body,
      foot: '<button class="btn btn--ghost" type="button" data-action="close-modal">Cancelar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--primary" type="button" data-action="save-series">Guardar serie</button>'
    });
  }

  function collectSeries(s) {
    s.code = val("code") || s.code;
    s.name = val("name") || s.name;
    s.nameJp = val("nameJp");
    s.accent = val("color") || s.accent;
    s.description = val("description");
  }

  /* ---------- ajustes ---------- */
  function openSettings() {
    openModal({ kind: "settings", mode: "edit", draft: Store.clone(A.state().meta) });
  }

  function settingsModal() {
    const m = modal.draft;
    const body = '<div class="form-grid form-grid--single">' +
      A.fieldHTML("Título del sitio", "siteTitle", m.siteTitle) +
      A.fieldHTML("Subtítulo", "subtitle", m.subtitle) +
      A.fieldHTML("Introducción", "intro", m.intro, { textarea: true, rows: 4 }) +
      "</div>" +
      '<div class="panel">' +
        '<h3 class="panel__title">Respaldo de datos</h3>' +
        '<p class="hint">Todo se guarda en este navegador. Si borras los datos del navegador o cambias de equipo, necesitarás un respaldo.</p>' +
        '<div class="panel__actions">' +
          '<button class="btn btn--sm" type="button" data-action="export">Exportar respaldo</button>' +
          '<button class="btn btn--sm" type="button" data-action="import">Importar respaldo</button>' +
          '<button class="btn btn--sm btn--danger" type="button" data-action="reset">Restaurar ejemplo</button>' +
        "</div>" +
      "</div>" +
      '<div class="panel">' +
        '<h3 class="panel__title">Cómo se usa</h3>' +
        '<ul class="help-list">' +
          "<li>Toca cualquier ficha (personaje, integrante o lanzamiento) para abrir su módulo.</li>" +
          "<li>Dentro del módulo, pulsa <strong>Editar</strong> para cambiar los datos y <strong>Guardar</strong> para confirmar.</li>" +
          "<li>Usa <strong>+ Personaje</strong>, <strong>+ Integrante</strong> y <strong>+ Lanzamiento</strong> para añadir contenido.</li>" +
          "<li>Las imágenes se suben desde la propia ficha o se pegan como URL.</li>" +
        "</ul>" +
      "</div>";

    return shell({
      eyebrow: "AJUSTES Y AYUDA",
      title: "Tu archivo",
      body: body,
      foot: '<button class="btn btn--ghost" type="button" data-action="close-modal">Cerrar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--primary" type="button" data-action="save-settings">Guardar ajustes</button>'
    });
  }

  function collectSettings(m) {
    m.siteTitle = val("siteTitle") || m.siteTitle;
    m.subtitle = val("subtitle");
    m.intro = val("intro");
  }

    /* ---------- lanzamientos ---------- */
  function releaseById(id) {
    return A.state().group.releases.find(function (r) { return r.id === id; });
  }

  function openRelease(id) {
    const r = releaseById(id);
    if (r) openModal({ kind: "release", draft: r, mode: "view", releaseId: r.id });
  }

  function newRelease() {
    const g = A.state().group;
    openModal({
      kind: "release",
      isNew: true,
      mode: "edit",
      draft: {
        id: Store.uid("r"),
        type: "single",
        title: "Nuevo lanzamiento",
        titleJp: "",
        date: new Date().toISOString().slice(0, 10),
        catalog: "",
        center: "",
        senbatsu: "",
        color: g.color,
        image: null,
        description: "",
        editions: [
          {
            id: Store.uid("e"),
            name: "Edición regular · CD",
            price: "",
            catalog: "",
            contents: "",
            color: g.color,
            image: null,
            discs: [
              {
                id: Store.uid("d"),
                mediaType: "CD",
                catalog: "",
                tracks: [{ title: "", duration: "", notes: "", lyrics: "" }]
              }
            ]
          }
        ]
      }
    });
  }

  function releaseModal() {
    const r = modal.draft;
    const html = modal.mode === "edit" ? releaseEdit(r) : releaseView(r);
    if (modal.mode === "edit") setTimeout(renumberTracks, 0);
    return html;
  }

  function tracklistHTML(tracks) {
    if (!tracks.length) return '<p class="empty">Sin pistas todavía.</p>';
    const total = A.totalDuration(tracks);
    return '<ol class="tracklist">' + tracks.map(function (t, i) {
      const lyrics = (t.lyrics || "").trim();
      return '<li class="tracklist__item" data-track-item>' +
        '<span class="tracklist__no">' + String(i + 1).padStart(2, "0") + "</span>" +
        '<span class="tracklist__main">' +
          '<span class="tracklist__title-row">' +
            '<span class="tracklist__title">' + esc(t.title) + "</span>" +
            '<button class="lyric-btn' + (lyrics ? " is-on" : "") + '" type="button" data-action="toggle-track-lyrics" aria-expanded="false" aria-label="Ver la letra">Letra</button>' +
          "</span>" +
          (t.notes ? '<span class="tracklist__notes">' + esc(t.notes) + "</span>" : "") +
        "</span>" +
        '<span class="tracklist__dur">' + esc(t.duration) + "</span>" +
        '<div class="track-lyrics" data-track-lyrics-panel hidden>' +
          (lyrics ? esc(lyrics) : '<span class="track-lyrics__empty">Todavía no hay letra para esta canción.</span>') +
        "</div>" +
        "</li>";
    }).join("") + "</ol>" +
      (total ? '<p class="tracklist__total">Duración total · ' + total + "</p>" : "");
  }

  function discViewHTML(disc) {
    const tracks = disc.tracks || [];
    return '<div class="disc">' +
      '<div class="disc__head">' +
        '<span class="disc__type">' + esc(disc.mediaType || "CD") + "</span>" +
        (disc.catalog ? '<span class="disc__cat">' + esc(disc.catalog) + "</span>" : "") +
        '<span class="disc__count">' + tracks.length + (tracks.length === 1 ? " pista" : " pistas") + "</span>" +
      "</div>" +
      tracklistHTML(tracks) +
      "</div>";
  }

  function editionSectionHTML(r, edition, index) {
    const discs = (edition.discs || []).map(discViewHTML).join("");
    return '<section class="edition" id="ed-' + esc(edition.id) + '">' +
      '<div class="edition__head">' +
        '<div class="edition__title">' +
          '<span class="edition__no">' + String(index + 1).padStart(2, "0") + "</span>" +
          '<h3 class="edition__name">' + esc(edition.name) + "</h3>" +
        "</div>" +
        '<button class="btn btn--sm btn--ghost" type="button" data-action="edit-edition" data-id="' + esc(edition.id) + '">Editar edición</button>' +
      "</div>" +
      '<div class="edition__grid">' +
        '<div class="edition__cover">' + A.mediaHTML(A.editionArtItem(r, edition), "cover") +
          (edition.price ? '<p class="edition__price">' + esc(edition.price) + "</p>" : "") +
          (edition.catalog ? '<p class="edition__catalog">' + esc(edition.catalog) + "</p>" : "") +
        "</div>" +
        '<div class="edition__content">' +
          (edition.contents ? '<p class="edition__contents">' + esc(edition.contents) + "</p>" : "") +
          (discs || '<p class="empty">Esta edición todavía no tiene discos.</p>') +
        "</div>" +
      "</div></section>";
  }

  function releaseView(r) {
    const editions = r.editions || [];
    const gallery = editions.map(function (edition) {
      return '<button class="release-thumb" type="button" data-action="scroll-edition" data-id="' + esc(edition.id) + '">' +
        A.mediaHTML(A.editionArtItem(r, edition), "cover") +
        '<span class="release-thumb__name">' + esc(edition.name) + "</span></button>";
    }).join("");

    const body = '<div class="release-detail">' +
      '<div class="release-hero">' +
        '<div class="release-hero__gallery">' +
          (gallery || '<p class="empty">Añade una edición para crear la primera portada.</p>') +
        "</div>" +
        '<div class="release-hero__info">' +
          (r.description ? '<p class="sheet__summary">' + esc(r.description) + "</p>" : "") +
          '<dl class="facts">' +
            fact("Tipo", A.TYPE_LABEL[r.type] || r.type) +
            fact("Fecha", A.fmtDate(r.date)) +
            fact("Sello", A.state().group.label) +
            fact("Catálogo", r.catalog) +
            fact("Center", r.center) +
            fact("Ediciones", String(editions.length)) +
          "</dl>" +
          (r.senbatsu ? '<section class="sheet__block"><h3>Senbatsu</h3><p>' + esc(r.senbatsu) + "</p></section>" : "") +
        "</div>" +
      "</div>" +
      '<div class="edition-list">' +
        (editions.length ? editions.map(function (edition, index) { return editionSectionHTML(r, edition, index); }).join("")
          : '<p class="empty">Este lanzamiento no tiene ediciones. Usa «+ Añadir edición» para crear la primera.</p>') +
      "</div></div>";

    return shell({
      eyebrow: "LANZAMIENTO · " + (A.TYPE_LABEL[r.type] || r.type),
      title: r.title,
      jp: r.titleJp,
      body: body,
      wide: true,
      foot: '<button class="btn btn--danger btn--ghost" type="button" data-action="delete-release">Eliminar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--ghost" type="button" data-action="close-modal">Cerrar</button>' +
        '<button class="btn btn--ghost" type="button" data-action="new-edition">+ Añadir edición</button>' +
        '<button class="btn btn--primary" type="button" data-action="edit-release">Editar lanzamiento</button>'
    });
  }

  function releaseEdit(r) {
    const typeOptions = [
      ["single", "CD Single"],
      ["album", "Álbum"],
      ["mini", "Mini álbum"],
      ["digital", "Digital"]
    ];
    const editionCount = (r.editions || []).length;

    const body = '<div class="form-layout">' +
      '<aside class="form-aside">' +
        A.imageEditorHTML(r, "cover") +
        A.colorFieldHTML(r.color) +
      "</aside>" +
      '<div class="form-main">' +
        '<div class="form-grid">' +
          A.fieldHTML("Título", "title", r.title) +
          A.fieldHTML("Título en japonés", "titleJp", r.titleJp) +
          A.fieldHTML("Tipo", "type", r.type, { select: typeOptions }) +
          A.fieldHTML("Fecha", "date", r.date, { type: "date" }) +
          A.fieldHTML("Número de catálogo general", "catalog", r.catalog, { placeholder: "RBCD-0101" }) +
          A.fieldHTML("Center", "center", r.center, { placeholder: "Nombre de la center" }) +
          A.fieldHTML("Senbatsu", "senbatsu", r.senbatsu, { full: true, placeholder: "Integrantes seleccionadas, separadas por comas" }) +
        "</div>" +
        '<div class="form-grid form-grid--single">' +
          A.fieldHTML("Descripción", "description", r.description, { textarea: true, rows: 3 }) +
        "</div>" +
        '<div class="panel">' +
          '<h3 class="panel__title">Ediciones y portadas</h3>' +
          '<p class="hint">Este lanzamiento tiene <strong>' + editionCount + '</strong> ' + (editionCount === 1 ? "edición" : "ediciones") +
            '. Cada edición guarda su propia portada, precio, catálogo, contenido y discos CD / DVD / Blu-ray. ' +
            'Cierra esta ventana y usa los botones de cada edición para cambiarlos.</p>' +
        "</div>" +
      "</div></div>";

    return shell({
      eyebrow: modal.isNew ? "NUEVO LANZAMIENTO" : "EDITANDO LANZAMIENTO",
      title: modal.isNew ? "Nuevo lanzamiento" : r.title,
      jp: r.titleJp,
      body: body,
      wide: true,
      foot: '<button class="btn btn--ghost" type="button" data-action="cancel-edit">Cancelar</button>' +
        '<span class="spacer"></span>' +
        '<button class="btn btn--primary" type="button" data-action="save-release">' +
        (modal.isNew ? "Crear lanzamiento" : "Guardar cambios") + "</button>"
    });
  }

  function collectRelease(r) {
    r.title = val("title") || r.title || "Sin título";
    r.titleJp = val("titleJp");
    r.type = val("type") || r.type;
    r.date = val("date");
    r.catalog = val("catalog");
    r.center = val("center");
    r.senbatsu = val("senbatsu");
    r.color = val("color") || r.color;
    r.description = val("description");
    const url = val("imageUrl");
    r.image = url || r.image || null;
  }

  /* ---------- edición de un lanzamiento ---------- */
  function currentRelease() {
    return modal && modal.releaseId ? releaseById(modal.releaseId) : null;
  }

  function newEdition() {
    const r = currentRelease();
    if (!r) return;
    openModal({
      kind: "edition",
      isNew: true,
      mode: "edit",
      releaseId: r.id,
      draft: {
        id: Store.uid("e"),
        name: "Nueva edición",
        price: "",
        catalog: "",
        contents: "",
        color: r.color,
        image: null,
        discs: [
          {
            id: Store.uid("d"),
            mediaType: "CD",
            catalog: "",
            tracks: [{ title: "", duration: "", notes: "", lyrics: "" }]
          }
        ]
      }
    });
  }

  function editEdition(editionId) {
    const r = currentRelease();
    if (!r) return;
    const edition = (r.editions || []).find(function (e) { return e.id === editionId; });
    if (edition) openModal({ kind: "edition", draft: edition, mode: "edit", releaseId: r.id });
  }

  function editionModal() {
    const edition = modal.draft;
    const discRows = (edition.discs || []).map(function (disc) { return A.discRowHTML(disc); }).join("");
    setTimeout(renumberTracks, 0);

    const body = '<div class="form-layout">' +
      '<aside class="form-aside">' +
        A.imageEditorHTML(edition, "cover") +
        A.colorFieldHTML(edition.color) +
      "</aside>" +
      '<div class="form-main">' +
        '<div class="form-grid">' +
          A.fieldHTML("Nombre de la edición", "name", edition.name) +
          A.fieldHTML("Precio", "price", edition.price, { placeholder: "¥2,090" }) +
          A.fieldHTML("Nº de catálogo de la edición", "catalog", edition.catalog, { placeholder: "RBCD-0101" }) +
          A.fieldHTML("Contenido incluido", "contents", edition.contents, { textarea: true, rows: 2, full: true, placeholder: "CD + Blu-ray. Incluye videoclip, Dance Shot y making-of." }) +
        "</div>" +
        '<div class="form-block">' +
          '<div class="form-block__head"><h3>Discos y tracklists</h3>' +
            '<button class="btn btn--sm btn--ghost" type="button" data-action="add-disc">+ Añadir disco</button>' +
          "</div>" +
          '<div data-disc-list>' + (discRows || "") + "</div>" +
          '<p class="hint">Cada disco puede ser CD, DVD, Blu-ray o Digital, con su propio catálogo y tracklist.</p>' +
        "</div>" +
      "</div></div>";

    return shell({
      eyebrow: modal.isNew ? "NUEVA EDICIÓN" : "EDITANDO EDICIÓN",
      title: modal.isNew ? "Nueva edición" : edition.name,
      jp: currentRelease() ? currentRelease().title : "",
      body: body,
      wide: true,
      foot: (modal.isNew ? "" : '<button class="btn btn--danger btn--ghost" type="button" data-action="delete-edition">Eliminar edición</button>') +
        '<span class="spacer"></span>' +
        '<button class="btn btn--ghost" type="button" data-action="cancel-edit">Volver al lanzamiento</button>' +
        '<button class="btn btn--primary" type="button" data-action="save-edition">' +
        (modal.isNew ? "Crear edición" : "Guardar edición") + "</button>"
    });
  }

  function collectEdition(edition) {
    edition.name = val("name") || edition.name || "Edición";
    edition.price = val("price");
    edition.catalog = val("catalog");
    edition.contents = val("contents");
    edition.color = val("color") || edition.color;
    const url = val("imageUrl");
    edition.image = url || edition.image || null;

    edition.discs = Array.from(document.querySelectorAll("[data-disc-row]")).map(function (row) {
      return {
        id: row.dataset.discId || Store.uid("d"),
        mediaType: row.querySelector("[data-disc-type]").value,
        catalog: row.querySelector("[data-disc-catalog]").value.trim(),
        tracks: Array.from(row.querySelectorAll("[data-track-row]")).map(function (trackRow) {
          const lyricsEl = trackRow.querySelector("[data-track-lyrics]");
          return {
            title: trackRow.querySelector("[data-track-title]").value.trim(),
            duration: trackRow.querySelector("[data-track-duration]").value.trim(),
            notes: trackRow.querySelector("[data-track-notes]").value.trim(),
            lyrics: lyricsEl ? lyricsEl.value.trim() : ""
          };
        }).filter(function (t) { return t.title; })
      };
    });
  }

  function backToRelease() {
    if (!modal || !modal.releaseId) {
      close();
      return;
    }
    openRelease(modal.releaseId);
  }

  function saveEdition() {
    collectEdition(modal.draft);
    const releaseId = modal.releaseId;
    const ok = persist();
    A.render();
    openRelease(releaseId);
    A.toast(ok ? "Edición guardada" : "No se pudo guardar: revisa el espacio del navegador");
  }

  function deleteEdition() {
    if (!modal || modal.isNew) return;
    const releaseId = modal.releaseId;
    const editionId = modal.draft.id;
    if (!window.confirm("¿Eliminar esta edición? Esta acción no se puede deshacer.")) return;
    Store.mutate(function (s) {
      const release = s.group.releases.find(function (r) { return r.id === releaseId; });
      if (!release) return;
      release.editions = (release.editions || []).filter(function (e) { return e.id !== editionId; });
    });
    A.render();
    openRelease(releaseId);
    A.toast("Edición eliminada");
  }

  /* ---------- acciones ---------- */

  function handleAction(action, el) {
    switch (action) {
      case "close-modal":
        close();
        return true;

      case "open-character":
        openCharacter(el.dataset.id);
        return true;

      case "new-character":
        newCharacter(el.dataset.series);
        return true;

      case "edit-character":
        modal.mode = "edit";
        renderModal();
        return true;

      case "save-character":
        collectCharacter(modal.draft);
        commit("Ficha guardada");
        return true;

      case "delete-character":
        deleteCharacter();
        return true;

      case "open-member":
        openMember(el.dataset.id);
        return true;

      case "new-member":
        newMember();
        return true;

      case "edit-member":
        modal.mode = "edit";
        renderModal();
        return true;

      case "save-member":
        collectMember(modal.draft);
        commit("Integrante guardada");
        return true;

      case "delete-member":
        deleteMember();
        return true;

      case "edit-group":
        openGroup();
        return true;

      case "edit-series":
        openSeries(el.dataset.id);
        return true;

      case "save-series":
        collectSeries(modal.draft);
        const okSeries = persist();
        close();
        A.render();
        A.toast(okSeries ? "Serie actualizada" : "No se pudo guardar la serie");
        return true;

      case "save-group":
        collectGroup(modal.draft);
        const okGroup = persist();
        close();
        A.render();
        A.toast(okGroup ? "Grupo actualizado" : "No se pudo guardar el grupo");
        return true;

      case "open-release":
        openRelease(el.dataset.id);
        return true;

      case "new-release":
        newRelease();
        return true;

      case "edit-release":
        modal.mode = "edit";
        renderModal();
        return true;

      case "save-release":
        collectRelease(modal.draft);
        commit("Lanzamiento guardado");
        return true;

      case "delete-release":
        deleteRelease();
        return true;

      case "new-edition":
        newEdition();
        return true;

      case "edit-edition":
        editEdition(el.dataset.id);
        return true;

      case "save-edition":
        saveEdition();
        return true;

      case "delete-edition":
        deleteEdition();
        return true;

      case "scroll-edition": {
        const target = document.getElementById("ed-" + el.dataset.id);
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        return true;
      }

      case "cancel-edit":
        if (!modal) return true;
        if (modal.kind === "edition") {
          backToRelease();
          return true;
        }
        if (modal.isNew) {
          close();
        } else {
          modal.draft = Store.clone(modal.original);
          modal.mode = "view";
          renderModal();
        }
        return true;

      case "add-rel": {
        if (!modal) return true;
        const others = A.state().characters.filter(function (c) { return c.id !== modal.draft.id; });
        const list = document.querySelector("[data-rel-list]");
        if (list) list.insertAdjacentHTML("beforeend", A.relRowHTML({ targetId: "", label: "" }, others));
        return true;
      }

      case "remove-rel": {
        const row = el.closest("[data-rel-row]");
        if (row) row.remove();
        return true;
      }

      case "add-disc": {
        const list = document.querySelector("[data-disc-list]");
        if (list) {
          list.insertAdjacentHTML("beforeend", A.discRowHTML({
            mediaType: "CD",
            catalog: "",
            tracks: [{ title: "", duration: "", notes: "", lyrics: "" }]
          }));
          renumberTracks();
        }
        return true;
      }

      case "remove-disc": {
        const row = el.closest("[data-disc-row]");
        if (row) row.remove();
        renumberTracks();
        return true;
      }

      case "add-disc-track": {
        const discRow = el.closest("[data-disc-row]");
        const list = discRow ? discRow.querySelector("[data-track-list]") : null;
        if (list) {
          list.insertAdjacentHTML("beforeend", A.trackRowHTML({ title: "", duration: "", notes: "", lyrics: "" }));
          renumberTracks();
        }
        return true;
      }

      case "add-track": {
        const list = document.querySelector("[data-track-list]");
        if (list) {
          list.insertAdjacentHTML("beforeend", A.trackRowHTML({ title: "", duration: "", notes: "", lyrics: "" }));
          renumberTracks();
        }
        return true;
      }

      case "remove-track": {
        const row = el.closest("[data-track-row]");
        if (row) row.remove();
        renumberTracks();
        return true;
      }

      case "toggle-lyrics": {
        const row = el.closest("[data-track-row]");
        const area = row ? row.querySelector("[data-track-lyrics]") : null;
        if (!area) return true;
        const open = area.hasAttribute("hidden");
        if (open) area.removeAttribute("hidden");
        else area.setAttribute("hidden", "");
        el.setAttribute("aria-expanded", open ? "true" : "false");
        el.classList.toggle("is-open", open);
        if (open) area.focus();
        return true;
      }

      case "toggle-track-lyrics": {
        const item = el.closest("[data-track-item]");
        const panel = item ? item.querySelector("[data-track-lyrics-panel]") : null;
        if (!panel) return true;
        const open = panel.hasAttribute("hidden");
        if (open) panel.removeAttribute("hidden");
        else panel.setAttribute("hidden", "");
        el.setAttribute("aria-expanded", open ? "true" : "false");
        el.classList.toggle("is-open", open);
        return true;
      }

      case "remove-image":
        if (!modal) return true;
        modal.draft.image = null;
        const url = document.querySelector('[data-modal] [name="imageUrl"]');
        if (url) url.value = "";
        refreshImageSlot();
        return true;

      case "save-settings":
        collectSettings(modal.draft);
        const okSettings = persist();
        close();
        A.render();
        A.toast(okSettings ? "Ajustes guardados" : "No se pudo guardar: revisa el espacio del navegador");
        return true;
    }
    return false;
  }

  /* ---------- borrar ---------- */
  function deleteCharacter() {
    if (!modal || modal.isNew) return;
    const id = modal.draft.id;
    if (!window.confirm("¿Eliminar este personaje? Esta acción no se puede deshacer.")) return;
    Store.mutate(function (s) {
      s.characters = s.characters.filter(function (c) { return c.id !== id; });
      s.characters.forEach(function (c) {
        c.relationships = c.relationships.filter(function (r) { return r.targetId !== id; });
      });
      s.group.members.forEach(function (m) {
        if (m.characterId === id) m.characterId = "";
      });
    });
    close();
    A.render();
    A.toast("Personaje eliminado");
  }

  function deleteMember() {
    if (!modal || modal.isNew) return;
    const id = modal.draft.id;
    if (!window.confirm("¿Eliminar esta integrante? Esta acción no se puede deshacer.")) return;
    Store.mutate(function (s) {
      s.group.members = s.group.members.filter(function (m) { return m.id !== id; });
    });
    close();
    A.render();
    A.toast("Integrante eliminada");
  }

  function deleteRelease() {
    if (!modal || modal.isNew) return;
    const id = modal.draft.id;
    if (!window.confirm("¿Eliminar este lanzamiento? Esta acción no se puede deshacer.")) return;
    Store.mutate(function (s) {
      s.group.releases = s.group.releases.filter(function (r) { return r.id !== id; });
    });
    close();
    A.render();
    A.toast("Lanzamiento eliminado");
  }

  /* ---------- imágenes ---------- */
  function resizeImage(file, max, quality) {
    return new Promise(function (resolve, reject) {
      const objectUrl = URL.createObjectURL(file);
      const img = new Image();
      img.onload = function () {
        try {
          const scale = Math.min(1, max / Math.max(img.width, img.height));
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, w, h);
          URL.revokeObjectURL(objectUrl);
          resolve(canvas.toDataURL("image/jpeg", quality || 0.82));
        } catch (err) {
          URL.revokeObjectURL(objectUrl);
          reject(err);
        }
      };
      img.onerror = function () {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("image"));
      };
      img.src = objectUrl;
    });
  }

  function refreshImageSlot() {
    if (!modal) return;
    const slot = document.querySelector("[data-image-slot]");
    if (!slot) return;
    const kind = modal.kind === "character" || modal.kind === "member" ? "portrait" : "cover";
    slot.innerHTML = A.mediaHTML(modal.draft, kind);
  }

  function renumberTracks() {
    Array.from(document.querySelectorAll("[data-track-list]")).forEach(function (list) {
      Array.from(list.querySelectorAll("[data-track-row]")).forEach(function (row, i) {
        const no = row.querySelector(".track-row__no");
        if (no) no.textContent = String(i + 1).padStart(2, "0");
      });
    });
  }

  document.addEventListener("change", function (e) {
    const input = e.target.closest("[data-pick-image]");
    if (!input) return;
    const file = input.files && input.files[0];
    if (!file || !modal) return;
    if (!file.type || file.type.indexOf("image/") !== 0) {
      A.toast("Selecciona un archivo de imagen válido");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      A.toast("La imagen es demasiado grande (máximo 10 MB)");
      return;
    }
    resizeImage(file, 900, 0.82).then(function (data) {
      return window.RemoteAssets ? window.RemoteAssets.toUrl(data) : data;
    }).then(function (data) {
      if (!modal) return;
      modal.draft.image = data;
      const url = document.querySelector('[data-modal] [name="imageUrl"]');
      if (url) url.value = "";
      refreshImageSlot();
      A.toast("Imagen lista. Guarda para confirmar.");
    }).catch(function () {
      A.toast("No se pudo procesar la imagen");
    });
  });

  return {
    openCharacter: openCharacter,
    openMember: openMember,
    openRelease: openRelease,
    openGroup: openGroup,
    openSettings: openSettings,
    close: close,
    handleAction: handleAction
  };
})();
