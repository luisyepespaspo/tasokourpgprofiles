/* ============================================================
   GUARDADO LOCAL
   Todo se guarda en el navegador. No hace falta servidor ni base
   de datos. Exporta un respaldo para no perder nada.
   ============================================================ */
const Store = (function () {
  const KEY = "crossline.archive.v1";

  let state = null;

  function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function uid(prefix) {
    return prefix + "_" + Math.random().toString(36).slice(2, 9);
  }

  function normalize(data) {
    const s = data || {};

    s.meta = Object.assign(
      { siteTitle: "Mi archivo", subtitle: "", intro: "" },
      s.meta || {}
    );
    delete s.meta.version;

    s.series = Array.isArray(s.series) ? s.series : [];

    const legacySeries = {
      "Amanecer de cristal": {
        name: "Tasogare Kousaten",
        nameJp: "黄昏交差点",
        accent: "#e0527f",
        description: "En el cruce que solo existe al atardecer, una chica que perdió su nombre descubre que su voz puede devolver recuerdos a quienes la escuchan. Cada canción es una moneda: se paga con un recuerdo propio."
      },
      "Eclipse de ceniza": {
        name: "R.P.G",
        nameJp: "アール・ピー・ジー",
        accent: "#2f7fc1",
        description: "Un juego de rol que se juega con vidas reales. Cuando la ciudad empieza a olvidar a sus habitantes, una idol caída vuelve para reunir a su antiguo equipo y reescribir el final antes de que se agote el turno."
      }
    };

    s.series.forEach(function (se) {
      const fix = legacySeries[se.name];
      if (fix) Object.assign(se, fix);
    });

    s.group = s.group || {};
    s.group.members = Array.isArray(s.group.members) ? s.group.members : [];
    s.group.releases = Array.isArray(s.group.releases) ? s.group.releases : [];
    s.group.name = s.group.name || "El grupo";
    s.group.nameJp = s.group.nameJp || "";
    s.group.color = s.group.color || "#e9c789";
    if (s.group.name === "Going Up" && s.group.color === "#e9c789") s.group.color = "#2f7fc1";

    s.characters = Array.isArray(s.characters) ? s.characters : [];

    s.characters.forEach(function (c) {
      c.id = c.id || uid("c");
      c.name = c.name || "Personaje sin nombre";
      c.nameJp = c.nameJp || "";
      c.seriesId = c.seriesId || (s.series[0] && s.series[0].id) || "";
      c.role = c.role || "supporting";
      c.epithet = c.epithet || "";
      c.summary = c.summary || "";
      c.personality = c.personality || "";
      c.backstory = c.backstory || "";
      c.quote = c.quote || "";
      c.color = c.color || "#e9c789";
      c.image = c.image || null;
      c.tags = Array.isArray(c.tags) ? c.tags : [];
      c.relationships = Array.isArray(c.relationships) ? c.relationships : [];
      ["age", "birthday", "height"].forEach(function (k) {
        c[k] = c[k] != null ? String(c[k]) : "";
      });
    });

    s.group.members.forEach(function (m) {
      m.id = m.id || uid("m");
      m.name = m.name || "Integrante";
      m.nameJp = m.nameJp || "";
      m.characterId = m.characterId || "";
      m.generation = m.generation || "";
      m.position = m.position || "";
      m.birthday = m.birthday || "";
      m.height = m.height || "";
      m.color = m.color || "#e9c789";
      m.image = m.image || null;
      m.bio = m.bio || "";
    });

    s.group.releases.forEach(function (r) {
      r.id = r.id || uid("r");
      r.type = r.type || "single";
      r.title = r.title || "Sin título";
      r.titleJp = r.titleJp || "";
      r.date = r.date || "";
      r.catalog = r.catalog || "";
      r.center = r.center || "";
      r.senbatsu = r.senbatsu || "";
      r.description = r.description || "";
      r.color = r.color || "#e9c789";
      r.image = r.image || null;

      const legacyTracks = Array.isArray(r.tracks) ? r.tracks : [];

      let editions = Array.isArray(r.editions) ? r.editions : [];
      editions = editions.map(function (edition) {
        if (typeof edition === "string") edition = { name: edition };
        if (!edition || typeof edition !== "object") edition = {};
        edition.id = edition.id || uid("e");
        edition.name = edition.name || "Edición";
        edition.price = edition.price || "";
        edition.catalog = edition.catalog || "";
        edition.contents = edition.contents || "";
        edition.image = edition.image || null;
        edition.color = edition.color || r.color;
        edition.discs = Array.isArray(edition.discs) ? edition.discs : [];
        edition.discs = edition.discs.map(function (disc) {
          if (!disc || typeof disc !== "object") disc = {};
          disc.id = disc.id || uid("d");
          disc.mediaType = disc.mediaType || "CD";
          disc.catalog = disc.catalog || "";
          disc.tracks = Array.isArray(disc.tracks) ? disc.tracks : [];
          disc.tracks.forEach(function (t) {
            t.title = t.title || "";
            t.duration = t.duration || "";
            t.notes = t.notes || "";
            t.lyrics = t.lyrics || "";
          });
          return disc;
        });
        return edition;
      });

      if (!editions.length) {
        editions.push({
          id: uid("e"),
          name: "Edición regular",
          price: "",
          catalog: r.catalog,
          contents: "",
          image: r.image,
          color: r.color,
          discs: []
        });
      }

      const hasTracks = editions.some(function (edition) {
        return edition.discs.some(function (disc) { return disc.tracks.length > 0; });
      });

      if (!hasTracks && legacyTracks.length) {
        let disc = editions[0].discs.find(function (d) { return d.mediaType === "CD"; });
        if (!disc) {
          disc = { id: uid("d"), mediaType: "CD", catalog: editions[0].catalog || r.catalog, tracks: [] };
          editions[0].discs.push(disc);
        }
        disc.tracks = legacyTracks.map(function (t) {
          return { title: t.title || "", duration: t.duration || "", notes: t.notes || "", lyrics: t.lyrics || "" };
        });
      }

      r.editions = editions;
      delete r.tracks;
    });

    return s;
  }

  function load() {
    let raw = null;
    try {
      raw = window.localStorage.getItem(KEY);
    } catch (e) {
      raw = null;
    }
    if (raw) {
      try {
        state = normalize(JSON.parse(raw));
        return;
      } catch (e) {
        state = null;
      }
    }
    state = normalize(clone(SEED));
  }

  function save() {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
      return true;
    } catch (e) {
      return false;
    }
  }

  load();

  return {
    get: function () {
      return state;
    },

    mutate: function (fn) {
      if (typeof fn === "function") fn(state);
      normalize(state);
      return save();
    },

    reset: function () {
      state = normalize(clone(SEED));
      return save();
    },

    exportData: function () {
      return JSON.stringify(state, null, 2);
    },

    importData: function (text) {
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        throw new Error("json");
      }
      if (!data || !Array.isArray(data.characters) || !data.group) {
        throw new Error("formato");
      }
      state = normalize(data);
      save();
      return true;
    },

    uid: uid,
    clone: clone
  };
})();
