/* ============================================================
   APP · utilidades, renderizado y navegación
   ============================================================ */
window.App = (function () {
  "use strict";

  /* ---------- utilidades ---------- */
  const $ = function (sel, root) { return (root || document).querySelector(sel); };
  const $$ = function (sel, root) { return Array.from((root || document).querySelectorAll(sel)); };

  const esc = function (value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  };

  const ROLE_LABEL = { protagonist: "Protagonista", antagonist: "Antagonista", supporting: "Secundario" };
  const TYPE_LABEL = { single: "CD Single", album: "Álbum", mini: "Mini álbum", digital: "Digital" };
  const ROLE_ORDER = ["protagonist", "antagonist", "supporting"];

  const state = function () { return Store.get(); };
  const seriesById = function (id) { return state().series.find(function (s) { return s.id === id; }); };
  const charById = function (id) { return state().characters.find(function (c) { return c.id === id; }); };

  const editionsOf = function (r) { return (r && r.editions) || []; };

  const releaseCoverImage = function (r) {
    const editions = editionsOf(r);
    for (let i = 0; i < editions.length; i += 1) {
      if (editions[i].image) return editions[i].image;
    }
    return r.image || null;
  };

  const releaseArtItem = function (r) {
    return {
      title: r.title,
      titleJp: r.titleJp,
      color: r.color,
      type: r.type,
      image: releaseCoverImage(r)
    };
  };

  const editionArtItem = function (r, edition) {
    return {
      name: r.title,
      titleJp: r.titleJp,
      color: edition.color || r.color,
      image: edition.image || null,
      variant: edition.name
    };
  };

  const editionTrackCount = function (edition) {
    return (edition.discs || []).reduce(function (n, d) { return n + (d.tracks || []).length; }, 0);
  };

  const releaseTrackCount = function (r) {
    return editionsOf(r).reduce(function (n, e) { return n + editionTrackCount(e); }, 0);
  };

  const releaseEditionCount = function (r) {
    return editionsOf(r).length;
  };

  const initials = function (name) {
    const parts = String(name || "").trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return "?";
    return parts.slice(0, 2).map(function (p) { return p[0]; }).join("").toUpperCase();
  };

  const fmtDate = function (iso) {
    if (!iso) return "Sin fecha";
    const d = new Date(iso + "T12:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("es-ES", { day: "2-digit", month: "short", year: "numeric" });
  };

  const byDateDesc = function (a, b) { return String(b.date || "").localeCompare(String(a.date || "")); };

  const totalTracks = function (s) {
    return s.group.releases.reduce(function (n, r) { return n + releaseTrackCount(r); }, 0);
  };

  const totalEditions = function (s) {
    return s.group.releases.reduce(function (n, r) { return n + releaseEditionCount(r); }, 0);
  };

  const durationSeconds = function (value) {
    const m = String(value || "").match(/(\d+):(\d{1,2})/);
    return m ? Number(m[1]) * 60 + Number(m[2]) : 0;
  };

  const totalDuration = function (tracks) {
    const total = tracks.reduce(function (n, t) { return n + durationSeconds(t.duration); }, 0);
    if (!total) return "";
    const m = Math.floor(total / 60);
    const s = total % 60;
    return m + ":" + String(s).padStart(2, "0");
  };

  const slug = function (text) {
    return String(text || "archivo").toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "archivo";
  };

  function toast(message) {
    const root = document.getElementById("toastRoot");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    root.appendChild(el);
    requestAnimationFrame(function () { el.classList.add("is-in"); });
    setTimeout(function () {
      el.classList.remove("is-in");
      setTimeout(function () { el.remove(); }, 300);
    }, 2800);
  }

  function download(filename, text) {
    const blob = new Blob([text], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  /* ---------- arte / imágenes ---------- */
  function artHTML(item, kind) {
    const name = item.name || item.title || "?";
    const jp = item.nameJp || item.titleJp || "";
    const type = kind === "cover" ? (TYPE_LABEL[item.type] || "") : "";
    return '<span class="art art--' + kind + ' art--empty" style="--c:' + esc(item.color || "#e9c789") + '">' +
      (item.variant ? '<span class="art__variant">' + esc(item.variant) + '</span>' : '') +
      (type ? '<span class="art__type">' + esc(type) + '</span>' : '') +
      '</span>';
  }

  function mediaHTML(item, kind) {
    if (item.image) {
      return '<span class="art art--' + kind + '" style="--c:' + esc(item.color || "#e9c789") + '">' +
        '<img class="art__img" src="' + esc(item.image) + '" alt="' + esc(item.name || item.title || "") + '" loading="lazy">' +
        '<span class="art__shade" aria-hidden="true"></span>' +
        '</span>';
    }
    return artHTML(item, kind);
  }

  /* ---------- formularios (usados por los modales) ---------- */
  function fieldHTML(label, name, value, opts) {
    opts = opts || {};
    const id = "f_" + name;
    const common = 'name="' + name + '" id="' + id + '" placeholder="' + esc(opts.placeholder || "") + '"';
    let control;
    if (opts.textarea) {
      control = '<textarea ' + common + ' rows="' + (opts.rows || 3) + '">' + esc(value) + "</textarea>";
    } else if (opts.select) {
      control = '<select ' + common + ">" + opts.select.map(function (pair) {
        return '<option value="' + esc(pair[0]) + '"' +
          (String(pair[0]) === String(value) ? " selected" : "") + ">" + esc(pair[1]) + "</option>";
      }).join("") + "</select>";
    } else {
      control = '<input ' + common + ' type="' + (opts.type || "text") + '" value="' + esc(value) + '">';
    }
    return '<label class="field' + (opts.full ? " field--full" : "") + '" for="' + id + '">' +
      '<span class="field__label">' + esc(label) + "</span>" + control + "</label>";
  }

  function colorFieldHTML(value) {
    return '<label class="field"><span class="field__label">Color de la ficha</span>' +
      '<span class="color-wrap"><input type="color" name="color" value="' + esc(value || "#e9c789") + '">' +
      '<span class="color-wrap__hex">' + esc(value || "#e9c789") + "</span></span></label>";
  }

  function imageEditorHTML(item, kind) {
    const isData = String(item.image || "").indexOf("data:") === 0;
    return '<div class="image-editor">' +
      '<div class="image-editor__art" data-image-slot>' + mediaHTML(item, kind) + "</div>" +
      '<div class="image-editor__actions">' +
        '<label class="btn btn--sm">Subir imagen<input type="file" accept="image/*" data-pick-image hidden></label>' +
        '<button class="btn btn--sm btn--ghost" type="button" data-action="remove-image">Quitar</button>' +
        '<input class="image-editor__url" type="url" name="imageUrl" placeholder="o pega una URL de imagen" value="' +
          esc(isData ? "" : (item.image || "")) + '">' +
        '<p class="hint">La imagen se guarda dentro de este navegador.</p>' +
      "</div></div>";
  }

  function relRowHTML(rel, others) {
    const options = others.map(function (o) {
      return '<option value="' + esc(o.id) + '"' + (o.id === rel.targetId ? " selected" : "") + ">" +
        esc(o.name) + "</option>";
    }).join("");
    return '<div class="rel-row" data-rel-row>' +
      '<select data-rel-target><option value="">— Elegir personaje —</option>' + options + "</select>" +
      '<input data-rel-label value="' + esc(rel.label || "") + '" placeholder="Tipo de vínculo">' +
      '<button class="icon-btn" type="button" data-action="remove-rel" aria-label="Quitar vínculo">✕</button>' +
      "</div>";
  }

  function trackRowHTML(track) {
    const lyrics = track.lyrics || "";
    const hasLyrics = lyrics.trim().length > 0;
    return '<div class="track-row" data-track-row>' +
      '<span class="track-row__no"></span>' +
      '<span class="track-row__fields">' +
        '<input data-track-title value="' + esc(track.title || "") + '" placeholder="Título de la pista">' +
        '<input data-track-notes value="' + esc(track.notes || "") + '" placeholder="Créditos: letra / música / arreglo (opcional)">' +
        '<span class="track-row__lyricbar">' +
          '<button class="lyric-btn' + (hasLyrics ? " is-on" : "") + '" type="button" data-action="toggle-lyrics" aria-expanded="false" aria-label="Ver o editar la letra">Letra</button>' +
          '<span class="track-row__lyricstate">' + (hasLyrics ? "Letra añadida" : "Sin letra") + "</span>" +
        "</span>" +
        '<textarea class="track-lyrics-input" data-track-lyrics rows="5" placeholder="Pega aquí la letra de la canción (opcional)" hidden>' + esc(lyrics) + "</textarea>" +
      "</span>" +
      '<input data-track-duration value="' + esc(track.duration || "") + '" placeholder="3:45" class="track-row__dur">' +
      '<button class="icon-btn" type="button" data-action="remove-track" aria-label="Quitar pista">✕</button>' +
      "</div>";
  }

  function discRowHTML(disc) {
    disc = disc || {};
    const types = ["CD", "DVD", "Blu-ray", "Digital"];
    const options = types.map(function (t) {
      return '<option value="' + esc(t) + '"' + (String(disc.mediaType || "CD") === t ? " selected" : "") + ">" + esc(t) + "</option>";
    }).join("");
    const rows = (disc.tracks || []).map(trackRowHTML).join("");
    return '<div class="disc-editor" data-disc-row data-disc-id="' + esc(disc.id || "") + '">' +
      '<div class="disc-editor__head">' +
        '<select data-disc-type aria-label="Tipo de disco">' + options + "</select>" +
        '<input data-disc-catalog value="' + esc(disc.catalog || "") + '" placeholder="Nº de catálogo del disco">' +
        '<button class="icon-btn" type="button" data-action="remove-disc" aria-label="Quitar disco">✕</button>' +
      "</div>" +
      '<div class="track-list" data-track-list>' + rows + "</div>" +
      '<div class="disc-editor__actions">' +
        '<button class="btn btn--sm btn--ghost" type="button" data-action="add-disc-track">+ Añadir pista</button>' +
      "</div>" +
      "</div>";
  }

  /* ---------- portada / hero ---------- */
  function portalHTML(p) {
    return '<a class="portal' + (p.center ? " portal--center" : "") + '" href="' + p.href + '" style="--accent:' + esc(p.accent) + '">' +
      '<span class="portal__code">' + esc(p.code) + "</span>" +
      '<span class="portal__name">' + esc(p.name) + "</span>" +
      '<span class="portal__jp">' + esc(p.nameJp) + "</span>" +
      '<span class="portal__meta">' + esc(p.meta) + "</span>" +
      '<span class="portal__cta">Entrar <span aria-hidden="true">→</span></span>' +
      "</a>";
  }

  function heroHTML(s) {
    const members = s.group.members.length;
    const releases = s.group.releases.length;
    const a = s.series[0];
    const b = s.series[1];
    const singles = s.group.releases.filter(function (r) { return r.type === "single" || r.type === "digital"; }).length;

    const marqueeText = (s.group.nameJp || s.group.name) + " ✦ " +
      s.group.members.map(function (m) { return m.nameJp || m.name; }).join(" ✦ ") + " ✦ ";

    const countChars = function (id) {
      return s.characters.filter(function (c) { return c.seriesId === id; }).length;
    };

    return '<section class="hero" id="inicio">' +
      '<span class="hero__bg" aria-hidden="true">交差</span>' +
      '<div class="hero__inner container">' +
        '<p class="eyebrow eyebrow--center">ARCHIVO DE PERSONAJES <span class="star">✦</span> DISCOGRAFÍA</p>' +
        '<h1 class="hero__title">' + esc(s.meta.siteTitle) + "</h1>" +
        '<p class="hero__jp">' + esc(s.group.nameJp) + "</p>" +
        '<p class="hero__sub">' + esc(s.meta.subtitle) + "</p>" +
        '<p class="hero__intro">' + esc(s.meta.intro) + "</p>" +
        '<div class="hero__actions">' +
          '<a class="btn btn--primary" href="#personajes">Explorar personajes</a>' +
          '<a class="btn btn--ghost" href="#discografia">Ver discografía</a>' +
        "</div>" +
      "</div>" +
      '<div class="portals container">' +
        (a ? portalHTML({ href: "#personajes", code: "SERIE I", name: a.name, nameJp: a.nameJp, accent: a.accent, meta: countChars(a.id) + " personajes" }) : "") +
        (b ? portalHTML({ href: "#personajes", code: "SERIE II", name: b.name, nameJp: b.nameJp, accent: b.accent, meta: countChars(b.id) + " personajes · incluye a " + s.group.name }) : "") +
      "</div>" +
      '<div class="marquee" aria-hidden="true"><div class="marquee__track">' +
        "<span>" + esc(marqueeText.repeat(3)) + "</span><span>" + esc(marqueeText.repeat(3)) + "</span>" +
      "</div></div>" +
      '<div class="stats container">' +
        statHTML("Series", s.series.length) +
        statHTML("Personajes", s.characters.length) +
        statHTML("Integrantes", members) +
        statHTML("Lanzamientos", releases) +
      "</div>" +
      "</section>";
  }

  function statHTML(label, value) {
    return '<div class="stat"><span class="stat__value">' + value + '</span><span class="stat__label">' + esc(label) + "</span></div>";
  }

  /* ---------- personajes ---------- */
  function characterCardHTML(c) {
    const series = seriesById(c.seriesId);
    return '<button class="char-card" type="button" data-action="open-character" data-id="' + esc(c.id) +
      '" style="--accent:' + esc(series ? series.accent : "#e9c789") + ';--char:' + esc(c.color || "#e9c789") + '">' +
      '<span class="char-card__media">' + mediaHTML(c, "portrait") +
        '<span class="badge badge--role">' + esc(ROLE_LABEL[c.role] || "Personaje") + "</span>" +
        '<span class="badge badge--series"><i></i>' + esc(series ? series.code : "") + "</span>" +
      "</span>" +
      '<span class="char-card__body">' +
        '<span class="char-card__name">' + esc(c.name) + "</span>" +
        (c.nameJp ? '<span class="char-card__jp">' + esc(c.nameJp) + "</span>" : "") +
        '<span class="char-card__epithet">' + esc(c.epithet) + "</span>" +
      "</span>" +
      '<span class="char-card__line" aria-hidden="true"></span>' +
      "</button>";
  }

  function seriesBlockHTML(series, filterRole) {
    const all = state().characters.filter(function (c) { return c.seriesId === series.id; });
    const list = all.filter(function (c) { return filterRole === "all" || c.role === filterRole; });
    return '<article class="series-block" style="--accent:' + esc(series.accent) + '">' +
      '<header class="series-block__head">' +
        '<div class="series-block__id">' +
          '<span class="series-block__code">' + esc(series.code) + ' <span class="dot"></span> ' + esc(series.nameJp) + "</span>" +
          '<h3 class="series-block__title">' + esc(series.name) + "</h3>" +
          '<p class="series-block__desc">' + esc(series.description) + "</p>" +
        "</div>" +
        '<div class="series-block__side">' +
          '<span class="series-block__count">' + all.length + (all.length === 1 ? " personaje" : " personajes") + "</span>" +
          '<button class="btn btn--sm btn--ghost" type="button" data-action="edit-series" data-id="' + esc(series.id) + '">Editar serie</button>' +
          '<button class="btn btn--sm" type="button" data-action="new-character" data-series="' + esc(series.id) + '">+ Personaje</button>' +
        "</div>" +
      "</header>" +
      (list.length
        ? '<div class="char-grid">' + list.map(characterCardHTML).join("") + "</div>"
        : '<p class="empty">No hay personajes con este filtro.</p>') +
      "</article>";
  }

  function charactersHTML(s, filterRole) {
    const counts = { all: s.characters.length };
    ROLE_ORDER.forEach(function (r) {
      counts[r] = s.characters.filter(function (c) { return c.role === r; }).length;
    });
    const chips = [["all", "Todos"]].concat(ROLE_ORDER.map(function (r) { return [r, ROLE_LABEL[r]]; }))
      .map(function (pair) {
        return '<button class="chip' + (filterRole === pair[0] ? " is-active" : "") + '" type="button" data-action="filter-role" data-value="' +
          pair[0] + '">' + esc(pair[1]) + "<span>" + counts[pair[0]] + "</span></button>";
      }).join("");

    return '<section class="section" id="personajes">' +
      '<div class="container">' +
        '<div class="section__head">' +
          '<div class="section__intro">' +
            '<p class="eyebrow">ELENCO</p>' +
            '<h2 class="section__title">Personajes</h2>' +
            '<p class="lead">Dos series, un mismo elenco que se cruza. Toca una ficha para ver y editar su historia, personalidad, vínculos y canciones.</p>' +
          "</div>" +
          '<div class="filters">' + chips + "</div>" +
        "</div>" +
        s.series.map(function (series) { return seriesBlockHTML(series, filterRole); }).join("") +
      "</div></section>";
  }

  /* ---------- grupo ---------- */
  function memberCardHTML(m) {
    const ch = m.characterId ? charById(m.characterId) : null;
    const series = ch ? seriesById(ch.seriesId) : null;
    return '<button class="member-card" type="button" data-action="open-member" data-id="' + esc(m.id) +
      '" style="--mc:' + esc(m.color || "#e9c789") + ';--accent:' + esc(series ? series.accent : "#e9c789") + '">' +
      '<span class="member-card__media">' + mediaHTML(m, "portrait") +
        '<span class="member-card__gen">' + esc(m.generation) + "</span>" +
      "</span>" +
      '<span class="member-card__body">' +
        '<span class="member-card__pos">' + esc(m.position) + "</span>" +
        '<span class="member-card__name">' + esc(m.name) + "</span>" +
        '<span class="member-card__jp">' + esc(m.nameJp) + "</span>" +
        (ch ? '<span class="member-card__link"><i></i>' + esc(series ? series.code : "") + " · " + esc(ch.name) + "</span>" : "") +
      "</span>" +
      "</button>";
  }

  function groupHTML(s) {
    const g = s.group;
    return '<section class="section section--group" id="grupo" style="--accent:' + esc(g.color) + '">' +
      '<div class="container">' +
        '<div class="section__head">' +
          '<div class="section__intro">' +
            '<p class="eyebrow">DENTRO DE R.P.G.</p>' +
            '<h2 class="section__title">' + esc(g.name) + "</h2>" +
            '<p class="lead">El grupo idol que existe dentro de R.P.G. Integrantes, generaciones y su discografía.</p>' +
          "</div>" +
          '<button class="btn btn--sm btn--gold" type="button" data-action="edit-group">Editar grupo</button>' +
        "</div>" +
        '<div class="group-banner">' +
          '<span class="group-banner__watermark" aria-hidden="true">' + esc(g.nameJp) + "</span>" +
          '<div class="group-banner__top">' +
            '<span class="group-banner__mark">' + esc(g.name) + "</span>" +
            '<span class="group-banner__jp">' + esc(g.nameJp) + "</span>" +
          "</div>" +
          '<p class="group-banner__concept">' + esc(g.concept) + "</p>" +
          '<dl class="group-facts">' +
            '<div><dt>Debut</dt><dd>' + esc(fmtDate(g.debut)) + "</dd></div>" +
            '<div><dt>Agencia</dt><dd>' + esc(g.agency) + "</dd></div>" +
            '<div><dt>Sello</dt><dd>' + esc(g.label) + "</dd></div>" +
            '<div><dt>Integrantes</dt><dd>' + g.members.length + "</dd></div>" +
          "</dl>" +
        "</div>" +
        '<div class="subhead-row">' +
          '<h3 class="subhead">Integrantes <span>' + g.members.length + "</span></h3>" +
          '<button class="btn btn--sm" type="button" data-action="new-member">+ Integrante</button>' +
        "</div>" +
        '<div class="member-grid">' +
          (g.members.length ? g.members.map(memberCardHTML).join("") : '<p class="empty">Todavía no hay integrantes.</p>') +
        "</div>" +
      "</div></section>";
  }

  /* ---------- discografía ---------- */
  function releaseCardHTML(r) {
    const editions = releaseEditionCount(r);
    const typeLabel = TYPE_LABEL[r.type] || r.type;
    return '<button class="release-card" type="button" data-action="open-release" data-id="' + esc(r.id) + '">' +
      '<span class="release-card__cover">' + mediaHTML(releaseArtItem(r), "cover") +
        (editions ? '<span class="release-card__eds">' + editions + (editions === 1 ? " edición" : " ediciones") + "</span>" : "") +
      "</span>" +
      '<span class="release-card__body">' +
        '<span class="release-card__meta">' +
          '<span class="badge badge--type badge--' + esc(r.type) + '">' + esc(typeLabel) + "</span>" +
          '<span class="release-card__date">' + esc(fmtDate(r.date)) + "</span>" +
        "</span>" +
        '<span class="release-card__title">' + esc(r.title) + "</span>" +
        (r.titleJp ? '<span class="release-card__jp">' + esc(r.titleJp) + "</span>" : "") +
        (r.center ? '<span class="release-card__sub">Center · ' + esc(r.center) + "</span>" : "") +
      "</span>" +
      "</button>";
  }

  function discographyHTML(s, filterRelease) {
    const all = s.group.releases.slice().sort(byDateDesc);
    const match = function (r) {
      if (filterRelease === "all") return true;
      if (filterRelease === "single") return r.type === "single";
      if (filterRelease === "album") return r.type === "album";
      if (filterRelease === "other") return r.type === "mini" || r.type === "digital";
      return true;
    };
    const list = all.filter(match);

    const chips = [["all", "Todo"], ["single", "Singles"], ["album", "Álbumes"], ["other", "Otros"]]
      .map(function (pair) {
        return '<button class="chip' + (filterRelease === pair[0] ? " is-active" : "") + '" type="button" data-action="filter-release" data-value="' +
          pair[0] + '">' + pair[1] + "</button>";
      }).join("");

    const groups = new Map();
    list.forEach(function (r) {
      const year = (r.date || "").slice(0, 4) || "Sin año";
      if (!groups.has(year)) groups.set(year, []);
      groups.get(year).push(r);
    });

    const body = list.length ? Array.from(groups.entries()).map(function (entry) {
      return '<div class="year-group">' +
        '<h3 class="year">' + esc(entry[0]) + "<span>" + entry[1].length + "</span></h3>" +
        '<div class="release-grid">' + entry[1].map(releaseCardHTML).join("") + "</div>" +
        "</div>";
    }).join("") : '<p class="empty">No hay lanzamientos con este filtro.</p>';

    return '<section class="section" id="discografia">' +
      '<div class="container">' +
        '<div class="section__head">' +
          '<div class="section__intro">' +
            '<p class="eyebrow">DISCOGRAFÍA</p>' +
            '<h2 class="section__title">Singles y álbumes</h2>' +
            '<p class="lead">' + all.length + " lanzamientos · " + totalEditions(s) + " ediciones · " + totalTracks(s) +
              " pistas. Abre cualquier lanzamiento para ver sus portadas, precios, catálogos, discos CD / DVD / Blu-ray y tracklists." +
            "</p>" +
          "</div>" +
          '<button class="btn btn--sm btn--primary" type="button" data-action="new-release">+ Lanzamiento</button>' +
        "</div>" +
        '<div class="filters filters--left">' + chips + "</div>" +
        body +
      "</div></section>";
  }

  /* ---------- render ---------- */
  let filterRole = "all";
  let filterRelease = "all";

  function render() {
    const s = state();
    const title = s.meta.siteTitle || "Mi archivo";

    const brand = document.getElementById("brandTitle");
    if (brand) brand.textContent = title;
    const footerTitle = document.getElementById("footerTitle");
    if (footerTitle) footerTitle.textContent = title;
    document.title = title + " · Personajes y discografía";

    document.getElementById("app").innerHTML =
      heroHTML(s) +
      charactersHTML(s, filterRole) +
      groupHTML(s) +
      discographyHTML(s, filterRelease);

    const year = document.getElementById("footerYear");
    if (year) year.textContent = new Date().getFullYear();

    updateActiveNav();
  }

  /* ---------- navegación ---------- */
  function updateActiveNav() {
    const ids = ["inicio", "personajes", "grupo", "discografia"];
    const y = window.scrollY + 160;
    let current = "inicio";
    ids.forEach(function (id) {
      const el = document.getElementById(id);
      if (el && el.getBoundingClientRect().top + window.scrollY <= y) current = id;
    });
    $$(".nav__link").forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + current);
    });
  }

  /* ---------- exportar / importar / reiniciar ---------- */
  function doExport() {
    const s = state();
    download(slug(s.meta.siteTitle) + "-respaldo-" + new Date().toISOString().slice(0, 10) + ".json",
      Store.exportData());
    toast("Respaldo descargado");
  }

  function doReset() {
    if (!window.confirm("Esto borrará todos tus cambios y volverá al contenido de ejemplo. ¿Continuar?")) return;
    Store.reset();
    filterRole = "all";
    filterRelease = "all";
    if (window.Modals) window.Modals.close();
    render();
    toast("Contenido de ejemplo restaurado");
  }

  /* ---------- eventos ---------- */
  function boot() {
    render();

    window.addEventListener("scroll", function () {
      document.getElementById("topbar").classList.toggle("is-scrolled", window.scrollY > 12);
      updateActiveNav();
    }, { passive: true });

    document.addEventListener("click", function (e) {
      if (e.target.hasAttribute && e.target.hasAttribute("data-backdrop")) {
        if (window.Modals) window.Modals.close();
        return;
      }
      const el = e.target.closest("[data-action]");
      if (!el) return;
      const action = el.dataset.action;

      if (window.Modals && window.Modals.handleAction(action, el, e)) return;

      if (action === "filter-role") {
        filterRole = el.dataset.value || "all";
        render();
      } else if (action === "filter-release") {
        filterRelease = el.dataset.value || "all";
        render();
      } else if (action === "settings") {
        if (window.Modals) window.Modals.openSettings();
      } else if (action === "export") {
        doExport();
      } else if (action === "import") {
        document.getElementById("importInput").click();
      } else if (action === "reset") {
        doReset();
      }
    });

    const importInput = document.getElementById("importInput");
    importInput.addEventListener("change", function () {
      const file = importInput.files && importInput.files[0];
      importInput.value = "";
      if (!file) return;
      file.text().then(function (text) {
        try {
          Store.importData(text);
          filterRole = "all";
          filterRelease = "all";
          if (window.Modals) window.Modals.close();
          render();
          toast("Respaldo importado");
        } catch (err) {
          toast("Ese archivo no es un respaldo válido");
        }
      });
    });

    document.addEventListener("error", function (e) {
      if (e.target && e.target.tagName === "IMG" && e.target.closest(".art")) {
        e.target.style.display = "none";
      }
    }, true);

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && window.Modals) window.Modals.close();
    });
  }

  return {
    esc: esc,
    state: state,
    seriesById: seriesById,
    charById: charById,
    initials: initials,
    fmtDate: fmtDate,
    totalTracks: totalTracks,
    totalDuration: totalDuration,
    fieldHTML: fieldHTML,
    colorFieldHTML: colorFieldHTML,
    imageEditorHTML: imageEditorHTML,
    relRowHTML: relRowHTML,
    trackRowHTML: trackRowHTML,
    discRowHTML: discRowHTML,
    mediaHTML: mediaHTML,
    releaseArtItem: releaseArtItem,
    editionArtItem: editionArtItem,
    releaseCoverImage: releaseCoverImage,
    releaseTrackCount: releaseTrackCount,
    releaseEditionCount: releaseEditionCount,
    toast: toast,
    render: render,
    byDateDesc: byDateDesc,
    ROLE_LABEL: ROLE_LABEL,
    TYPE_LABEL: TYPE_LABEL,
    ROLE_ORDER: ROLE_ORDER,
    boot: boot
  };
})();

App.boot();
