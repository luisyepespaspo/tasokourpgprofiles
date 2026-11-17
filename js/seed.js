/* ============================================================
   CONTENIDO INICIAL (ejemplo editable)
   Puedes cambiar absolutamente todo desde la propia web.
   ============================================================ */
const _track = function (title, duration, notes, lyrics) {
  return { title: title, duration: duration || "", notes: notes || "", lyrics: lyrics || "" };
};

/* Letras de ejemplo. Son solo texto: puedes cambiarlas desde la web
   abriendo un lanzamiento, editando una edición y pulsando «Letra». */
const LYRICS_BELL =
  "はじまりのベルが鳴る\n" +
  "黄昏の交差点で\n" +
  "なくした名前を呼ぶ声\n" +
  "まだ知らない私の声\n" +
  "\n" +
  "ひとつ数えて 目を閉じる\n" +
  "ふたつ数えて 息をのむ\n" +
  "みっつ目で 世界が変わる\n" +
  "最後の鐘が 私を待っている";

const LYRICS_BLUE =
  "青い時間が街を包む\n" +
  "窓の灯りがひとつずつ消える\n" +
  "さよならはまだ言わないで\n" +
  "この歌が終わるまでは\n" +
  "\n" +
  "Blue hour, blue hour\n" +
  "名前のない想いを\n" +
  "Blue hour, blue hour\n" +
  "君の声で溶かして";

const LYRICS_CROSSLINE =
  "交差する線の上で\n" +
  "ふたりは違う過去を抱いて\n" +
  "それでも同じ歌を歌う\n" +
  "夜明けまで 声を重ねて\n" +
  "\n" +
  "Crossline, crossline\n" +
  "消えないように\n" +
  "Crossline, crossline\n" +
  "ここにいるよと";

const _disc = function (mediaType, catalog, tracks) {
  return { mediaType: mediaType, catalog: catalog || "", tracks: tracks || [] };
};

const _edition = function (name, price, catalog, contents, discs, image) {
  return {
    name: name,
    price: price || "",
    catalog: catalog || "",
    contents: contents || "",
    image: image || null,
    discs: discs || []
  };
};

const SEED = {
  meta: {
    siteTitle: "TASOGARE × R.P.G.",
    subtitle: "Dos historias. Un mismo archivo.",
    intro: "Un archivo vivo de personajes y canciones: dos series que se cruzan en un grupo idol que no debería existir."
  },

  series: [
    {
      id: "s1",
      code: "SERIE I",
      name: "Tasogare Kousaten",
      nameJp: "黄昏交差点",
      accent: "#e0527f",
      description: "En el cruce que solo existe al atardecer, una chica que perdió su nombre descubre que su voz puede devolver recuerdos a quienes la escuchan. Cada canción es una moneda: se paga con un recuerdo propio."
    },
    {
      id: "s2",
      code: "SERIE II",
      name: "R.P.G",
      nameJp: "アール・ピー・ジー",
      accent: "#2f7fc1",
      description: "Un juego de rol que se juega con vidas reales. Cuando la ciudad empieza a olvidar a sus habitantes, una idol caída vuelve para reunir a su antiguo equipo y reescribir el final antes de que se agote el turno."
    }
  ],

  characters: [
    {
      id: "c1", seriesId: "s1", role: "protagonist",
      name: "Akira Mizuno", nameJp: "水野 明",
      epithet: "La voz que no se rinde",
      age: "17", birthday: "21 de marzo", height: "158 cm",
      color: "#ff6b9d", image: null,
      summary: "Una chica que descubre que puede hacer que la gente recuerde cosas que nunca vivió. Canta para encontrar el nombre que le falta, aunque cada canción le cueste un recuerdo propio.",
      personality: "Impulsiva, leal y terrible para mentir. Se ríe fuerte y llora en silencio. Necesita ser vista, pero le aterra que la vean de verdad.",
      backstory: "Creció en un orfanato al norte de la ciudad. A los trece encontró un cassette con una canción que nadie más podía oír. Desde entonces persigue esa melodía: la única pista sobre su familia.",
      quote: "Si esta canción existe, entonces yo también existo.",
      tags: ["Voz principal", "Center", "1ª generación"],
      relationships: [
        { targetId: "c3", label: "Rival y espejo" },
        { targetId: "c2", label: "Compañera de grupo" },
        { targetId: "c7", label: "Mentora" }
      ]
    },
    {
      id: "c2", seriesId: "s1", role: "protagonist",
      name: "Yui Sakamoto", nameJp: "坂本 結衣",
      epithet: "La líder que cuenta los silencios",
      age: "18", birthday: "2 de mayo", height: "165 cm",
      color: "#ffb26b", image: null,
      summary: "La perfección tiene un precio y Yui lo paga en cuotas. Capitana del grupo, sostiene a todos mientras esconde que su familia está a punto de desmoronarse.",
      personality: "Serena, estratega, demasiado responsable. Sonríe primero y respira después. Odia pedir ayuda aunque la necesite.",
      backstory: "Hija de un director de orquesta y de una bailarina retirada. Creció entre ensayos. Entró al grupo para salvar la casa familiar, no por amor al escenario.",
      quote: "Mientras yo cuente los tiempos, nadie se va a caer.",
      tags: ["Líder", "Voz", "1ª generación"],
      relationships: [
        { targetId: "c1", label: "Compañera y ancla" },
        { targetId: "c5", label: "Amiga de la infancia" },
        { targetId: "c4", label: "Prima" }
      ]
    },
    {
      id: "c3", seriesId: "s1", role: "antagonist",
      name: "Ren Tachibana", nameJp: "橘 蓮",
      epithet: "El ídolo que aprendió a sonreír de mentira",
      age: "19", birthday: "17 de agosto", height: "172 cm",
      color: "#b28bff", image: null,
      summary: "Ren sabe exactamente qué decir para que todos lo amen. También sabe exactamente qué decir para destruir a alguien sin que se note. Fue la primera persona que creyó en Akira; ahora quiere ser la última.",
      personality: "Encantador, calculador, profundamente solo. Colecciona favores como otros coleccionan discos. Cree que el amor es una transacción.",
      backstory: "Debutó en un grupo que se disolvió tras un escándalo. Salió sin contrato, sin nombre y con una deuda que sigue pagando. Ve en CROSSLINE su última oportunidad, y no piensa compartirla.",
      quote: "No necesito que me quieran. Necesito que no puedan mirar a otro.",
      tags: ["Rap", "Performance", "1ª generación"],
      relationships: [
        { targetId: "c1", label: "Rivalidad" },
        { targetId: "c6", label: "Deuda pendiente" },
        { targetId: "c7", label: "Antiguo socio" }
      ]
    },
    {
      id: "c4", seriesId: "s2", role: "protagonist",
      name: "Hina Kurose", nameJp: "黒瀬 陽菜",
      epithet: "La luz que aprendió a apagarse",
      age: "17", birthday: "9 de octubre", height: "156 cm",
      color: "#6cc7ff", image: null,
      summary: "Hina fue la idol más famosa de su ciudad hasta que desapareció sin explicación. Ahora vuelve a un escenario que ya no la recuerda, con una lista de nombres que debe salvar antes de que los borren.",
      personality: "Dulce en apariencia, obstinada hasta el dolor. Recuerda a todos menos a sí misma. Tiene un humor extraño que aparece en los peores momentos.",
      backstory: "Formó parte de un grupo idol desaparecido en un incendio del que no hay registros oficiales. Despertó un año después, en otra ciudad, con la certeza de que alguien borró su historia a propósito.",
      quote: "No vengo a que me recuerden. Vengo a recordarlos yo.",
      tags: ["Voz", "Visual", "2ª generación"],
      relationships: [
        { targetId: "c6", label: "Excompañera" },
        { targetId: "c2", label: "Prima" },
        { targetId: "c8", label: "Aliado" }
      ]
    },
    {
      id: "c5", seriesId: "s2", role: "protagonist",
      name: "Sora Amane", nameJp: "天音 空",
      epithet: "La bailarina que recuerda con el cuerpo",
      age: "16", birthday: "30 de junio", height: "160 cm",
      color: "#6bffb8", image: null,
      summary: "Sora no recuerda su infancia, pero su cuerpo recuerda cada coreografía. Cuando baila, ve fragmentos de una ciudad que no existe en ningún mapa.",
      personality: "Enérgica, directa, incapaz de quedarse quieta. Dice la verdad sin filtro y se disculpa con abrazos.",
      backstory: "Fue encontrada bailando sola en una estación vacía. No tenía documentos, pero sí cicatrices en los pies de alguien que llevaba años entrenando.",
      quote: "Si dejo de bailar, se me olvida quién soy.",
      tags: ["Dance", "Performance", "2ª generación"],
      relationships: [
        { targetId: "c2", label: "Amiga de la infancia" },
        { targetId: "c1", label: "Se cruzan en un callejón" }
      ]
    },
    {
      id: "c6", seriesId: "s2", role: "antagonist",
      name: "Mei Fujisaki", nameJp: "藤崎 命",
      epithet: "La que escribe finales para otros",
      age: "20", birthday: "12 de enero", height: "168 cm",
      color: "#ff6b6b", image: null,
      summary: "Compositora y letrista del grupo, Mei construye las canciones que hacen llorar a la gente. También decide qué historias merecen ser contadas. Y cuáles deben desaparecer.",
      personality: "Elegante, fría, brutalmente honesta. Habla en metáforas para no tener que mentir. Su forma de querer es controlar.",
      backstory: "Perdió a su hermana en el mismo incendio que borró el grupo de Hina. Desde entonces reescribe la realidad por encargo, convencida de que el olvido es una forma de misericordia.",
      quote: "Todo final es una decisión editorial.",
      tags: ["Letras", "Voz", "2ª generación"],
      relationships: [
        { targetId: "c4", label: "Excompañera" },
        { targetId: "c3", label: "Deuda pendiente" }
      ]
    },
    {
      id: "c7", seriesId: "s1", role: "supporting",
      name: "Kaede Morisawa", nameJp: "森沢 楓",
      epithet: "La productora que escribe con cicatrices",
      age: "27", birthday: "5 de diciembre", height: "170 cm",
      color: "#e9c789", image: null,
      summary: "Kaede dejó los escenarios hace diez años. Ahora produce el grupo desde la sombra y protege a sus integrantes con una ferocidad que asusta.",
      personality: "Pragmática, protectora, alérgica a los reflectores. Fuma cuando nadie la ve y llora solo con música clásica.",
      backstory: "Fue la líder del grupo idol que se disolvió tras el incendio. Salió sin explicar nada. Nadie sabe que ella sacó a Hina del edificio.",
      quote: "Yo ya tuve mi turno. Ahora el escenario es de ellas.",
      tags: ["Producción", "Mentora", "Ex-idol"],
      relationships: [
        { targetId: "c1", label: "Mentora" },
        { targetId: "c3", label: "Antiguo socio" },
        { targetId: "c4", label: "La rescató" }
      ]
    },
    {
      id: "c8", seriesId: "s2", role: "supporting",
      name: "Nao Kirishima", nameJp: "桐島 直",
      epithet: "El periodista que colecciona verdades",
      age: "24", birthday: "14 de febrero", height: "178 cm",
      color: "#9aa7ff", image: null,
      summary: "Nao investiga la desaparición del grupo idol que nadie recuerda. Tiene una libreta llena de nombres tachados y la sospecha de que el próximo tachado será el suyo.",
      personality: "Curioso, incansable, un poco cobarde. Prefiere una verdad incómoda a una mentira cómoda.",
      backstory: "Su hermana mayor era fan del grupo desaparecido. Cuando Nao intentó buscar información, descubrió que las páginas, los discos y las fotos habían sido borrados de todos los archivos.",
      quote: "Si no queda registro, ¿cómo sabemos que pasó?",
      tags: ["Investigación", "Aliado"],
      relationships: [
        { targetId: "c6", label: "Fuente" },
        { targetId: "c3", label: "Sospecha" },
        { targetId: "c4", label: "Aliado" }
      ]
    }
  ],

  group: {
    name: "Going Up",
    nameJp: "ゴーイング・アップ",
    agency: "STARDUST AGENCY (ficticia)",
    label: "Ribbon Records",
    debut: "2024-03-20",
    color: "#2f7fc1",
    concept: "El grupo idol que aparece dentro de R.P.G. (texto de ejemplo: edítalo con el concepto real del grupo).",

    members: [
      {
        id: "m1", name: "Akira Mizuno", nameJp: "水野 明", characterId: "c1",
        color: "#ff6b9d", generation: "1ª generación", position: "Center · Voz principal",
        birthday: "21 de marzo", height: "158 cm", image: null,
        bio: "La primera voz del grupo. Antes de debutar cantaba en estaciones de tren para pagarse el alquiler."
      },
      {
        id: "m2", name: "Yui Sakamoto", nameJp: "坂本 結衣", characterId: "c2",
        color: "#ffb26b", generation: "1ª generación", position: "Líder · Voz",
        birthday: "2 de mayo", height: "165 cm", image: null,
        bio: "Capitana y responsable de que el grupo llegue puntual a todo. Nadie sabe cómo lo consigue."
      },
      {
        id: "m3", name: "Ren Tachibana", nameJp: "橘 蓮", characterId: "c3",
        color: "#b28bff", generation: "1ª generación", position: "Rap · Performance",
        birthday: "17 de agosto", height: "172 cm", image: null,
        bio: "El único miembro que escribe sus propios raps. También el único que nunca ha perdido una discusión."
      },
      {
        id: "m4", name: "Hina Kurose", nameJp: "黒瀬 陽菜", characterId: "c4",
        color: "#6cc7ff", generation: "2ª generación", position: "Voz · Visual",
        birthday: "9 de octubre", height: "156 cm", image: null,
        bio: "Se unió al grupo sin recordar haber audicionado. Todos coinciden en que su voz suena a una canción que ya conocían."
      },
      {
        id: "m5", name: "Sora Amane", nameJp: "天音 空", characterId: "c5",
        color: "#6bffb8", generation: "2ª generación", position: "Dance · Performance",
        birthday: "30 de junio", height: "160 cm", image: null,
        bio: "Coreógrafa no oficial del grupo. Aprende las canciones antes de escucharlas."
      },
      {
        id: "m6", name: "Mei Fujisaki", nameJp: "藤崎 命", characterId: "c6",
        color: "#ff6b6b", generation: "2ª generación", position: "Voz · Letras",
        birthday: "12 de enero", height: "168 cm", image: null,
        bio: "Escribe casi todo el repertorio. Dice que las canciones tristes venden más porque nadie se atreve a desmentirlas."
      }
    ],

    releases: [
      {
        id: "r1", type: "single",
        title: "Hajimari no Bell", titleJp: "はじまりのベル",
        date: "2024-03-20", catalog: "RBCD-0101",
        center: "Akira Mizuno",
        senbatsu: "Akira, Yui, Ren",
        color: "#ff6b9d", image: null,
        description: "Single de debut de la primera generación. Un campanario que suena a medianoche y tres voces que todavía no saben que están contando la misma historia.",
        editions: [
          _edition(
            "Edición limitada A · CD + Blu-ray", "¥2,090", "RBCD-0101",
            "Blu-ray con el videoclip de «Hajimari no Bell», Dance Shot Ver. y making-of.",
            [
              _disc("CD", "RBCD-0101", [
                _track("Hajimari no Bell", "4:12", "Letra y música: Kaede Morisawa · Arreglo: Shinji Kameda", LYRICS_BELL),
                _track("Blue Hour", "3:58", "Letra y música: Mei Fujisaki · Arreglo: Ryo Takahashi", LYRICS_BLUE),
                _track("Hajimari no Bell (Instrumental)", "4:12"),
                _track("Blue Hour (Instrumental)", "3:58")
              ]),
              _disc("Blu-ray", "RBCD-0101B", [
                _track("Hajimari no Bell (Music Video)", "4:18"),
                _track("Hajimari no Bell (Dance Shot Ver.)", "4:22"),
                _track("Making-of & entrevista", "12:04")
              ])
            ]
          ),
          _edition(
            "Edición limitada B · CD + DVD", "¥2,090", "RBCD-0102",
            "DVD con el videoclip de «Blue Hour», Close-up Ver. y making-of.",
            [
              _disc("CD", "RBCD-0102", [
                _track("Hajimari no Bell", "4:12", "Letra y música: Kaede Morisawa · Arreglo: Shinji Kameda", LYRICS_BELL),
                _track("Blue Hour", "3:58", "Letra y música: Mei Fujisaki · Arreglo: Ryo Takahashi", LYRICS_BLUE),
                _track("Hajimari no Bell (Instrumental)", "4:12"),
                _track("Blue Hour (Instrumental)", "3:58")
              ]),
              _disc("DVD", "RBCD-0102B", [
                _track("Blue Hour (Music Video)", "4:03"),
                _track("Blue Hour (Close-up Ver.)", "4:00"),
                _track("Making-of & entrevista", "10:47")
              ])
            ]
          ),
          _edition(
            "Edición regular · CD", "¥1,200", "RBCD-0103",
            "Solo CD. Portada regular con el campanario al atardecer.",
            [
              _disc("CD", "RBCD-0103", [
                _track("Hajimari no Bell", "4:12", "Letra y música: Kaede Morisawa · Arreglo: Shinji Kameda", LYRICS_BELL),
                _track("Blue Hour", "3:58", "Letra y música: Mei Fujisaki · Arreglo: Ryo Takahashi", LYRICS_BLUE),
                _track("Hajimari no Bell (Instrumental)", "4:12"),
                _track("Blue Hour (Instrumental)", "3:58")
              ])
            ]
          )
        ]
      },
      {
        id: "r2", type: "single",
        title: "Crossline", titleJp: "クロスライン",
        date: "2024-11-06", catalog: "RBCD-0104",
        center: "Ren Tachibana",
        senbatsu: "Ren, Akira, Hina, Yui, Sora, Mei",
        color: "#b28bff", image: null,
        description: "El single que presentó a la segunda generación. Seis nombres en la portada, dos series en el mismo estribillo.",
        editions: [
          _edition(
            "Edición limitada A · CD + Blu-ray", "¥2,090", "RBCD-0104",
            "Blu-ray con el videoclip de «Crossline», Dance Shot Ver. y making-of.",
            [
              _disc("CD", "RBCD-0104", [
                _track("Crossline", "3:51", "Letra y música: Mei Fujisaki · Arreglo: Yuki Sato", LYRICS_CROSSLINE),
                _track("Parallel Heart", "4:05", "Letra: Yui Sakamoto · Música: Kaede Morisawa"),
                _track("Crossline (Instrumental)", "3:51"),
                _track("Parallel Heart (Instrumental)", "4:05")
              ]),
              _disc("Blu-ray", "RBCD-0104B", [
                _track("Crossline (Music Video)", "3:58"),
                _track("Crossline (Dance Shot Ver.)", "3:55"),
                _track("Making-of & entrevista", "14:20")
              ])
            ]
          ),
          _edition(
            "Edición limitada B · CD + DVD", "¥2,090", "RBCD-0105",
            "DVD con el videoclip de «Parallel Heart», Close-up Ver. y making-of.",
            [
              _disc("CD", "RBCD-0105", [
                _track("Crossline", "3:51", "Letra y música: Mei Fujisaki · Arreglo: Yuki Sato", LYRICS_CROSSLINE),
                _track("Parallel Heart", "4:05", "Letra: Yui Sakamoto · Música: Kaede Morisawa"),
                _track("Crossline (Instrumental)", "3:51"),
                _track("Parallel Heart (Instrumental)", "4:05")
              ]),
              _disc("DVD", "RBCD-0105B", [
                _track("Parallel Heart (Music Video)", "4:11"),
                _track("Parallel Heart (Close-up Ver.)", "4:07"),
                _track("Making-of & entrevista", "11:38")
              ])
            ]
          ),
          _edition(
            "Edición regular · CD", "¥1,200", "RBCD-0106",
            "Solo CD. Portada regular con las dos series cruzándose.",
            [
              _disc("CD", "RBCD-0106", [
                _track("Crossline", "3:51", "Letra y música: Mei Fujisaki · Arreglo: Yuki Sato", LYRICS_CROSSLINE),
                _track("Parallel Heart", "4:05", "Letra: Yui Sakamoto · Música: Kaede Morisawa"),
                _track("Crossline (Instrumental)", "3:51"),
                _track("Parallel Heart (Instrumental)", "4:05")
              ])
            ]
          )
        ]
      },
      {
        id: "r3", type: "album",
        title: "INTERSECT", titleJp: "インターセクト",
        date: "2025-02-26", catalog: "RBAD-0101",
        center: "Akira Mizuno",
        senbatsu: "Akira, Yui, Ren, Hina, Sora, Mei",
        color: "#e9c789", image: null,
        description: "Primer álbum completo. Diez pistas que funcionan como los diez capítulos de un cruce: cada canción pertenece a una serie, pero el disco solo tiene sentido completo.",
        editions: [
          _edition(
            "Edición limitada · 2CD + Blu-ray", "¥3,850", "RBAD-0101",
            "Segundo disco con versiones alternativas y Blu-ray con tres videoclips, making-of y un resumen del primer concierto.",
            [
              _disc("CD", "RBAD-0101", [
                _track("Overture -Intersect-", "1:44", "Música: Kaede Morisawa"),
                _track("Crossline", "3:51", "Letra y música: Mei Fujisaki", LYRICS_CROSSLINE),
                _track("Hajimari no Bell", "4:12", "Letra y música: Kaede Morisawa", LYRICS_BELL),
                _track("Glass no Yume", "3:36", "Letra: Hina Kurose · Música: Mei Fujisaki"),
                _track("Blue Hour", "3:58", "Letra y música: Mei Fujisaki", LYRICS_BLUE),
                _track("Parallel Heart", "4:05", "Letra: Yui Sakamoto · Música: Kaede Morisawa"),
                _track("Koi no Radar", "3:44", "Letra y música: Sora Amane"),
                _track("Nemuri no Uta", "4:28", "Letra y música: Mei Fujisaki"),
                _track("Ashita no Kakera", "4:02", "Letra: Akira Mizuno · Música: Kaede Morisawa"),
                _track("INTERSECT", "5:10", "Letra y música: Mei Fujisaki")
              ]),
              _disc("CD", "RBAD-0101B", [
                _track("Glass no Yume (Acoustic Ver.)", "3:51"),
                _track("Blue Hour (Piano Ver.)", "4:10"),
                _track("Parallel Heart (Live at Crossline Hall)", "4:18"),
                _track("INTERSECT (Instrumental)", "5:10")
              ]),
              _disc("Blu-ray", "RBAD-0101C", [
                _track("INTERSECT (Music Video)", "5:24"),
                _track("Hajimari no Bell (Music Video)", "4:18"),
                _track("Crossline (Music Video)", "3:58"),
                _track("Making-of del álbum", "18:42"),
                _track("Resumen del primer concierto", "22:10")
              ])
            ]
          ),
          _edition(
            "Edición regular · CD", "¥2,500", "RBAD-0102",
            "Solo CD con las diez canciones del álbum y portada alternativa.",
            [
              _disc("CD", "RBAD-0102", [
                _track("Overture -Intersect-", "1:44", "Música: Kaede Morisawa"),
                _track("Crossline", "3:51", "Letra y música: Mei Fujisaki", LYRICS_CROSSLINE),
                _track("Hajimari no Bell", "4:12", "Letra y música: Kaede Morisawa", LYRICS_BELL),
                _track("Glass no Yume", "3:36", "Letra: Hina Kurose · Música: Mei Fujisaki"),
                _track("Blue Hour", "3:58", "Letra y música: Mei Fujisaki", LYRICS_BLUE),
                _track("Parallel Heart", "4:05", "Letra: Yui Sakamoto · Música: Kaede Morisawa"),
                _track("Koi no Radar", "3:44", "Letra y música: Sora Amane"),
                _track("Nemuri no Uta", "4:28", "Letra y música: Mei Fujisaki"),
                _track("Ashita no Kakera", "4:02", "Letra: Akira Mizuno · Música: Kaede Morisawa"),
                _track("INTERSECT", "5:10", "Letra y música: Mei Fujisaki")
              ])
            ]
          )
        ]
      },
      {
        id: "r4", type: "single",
        title: "Yozora Letter", titleJp: "夜空レター",
        date: "2025-07-16", catalog: "RBCD-0107",
        center: "Hina Kurose",
        senbatsu: "Hina, Sora, Mei, Akira, Yui",
        color: "#6cc7ff", image: null,
        description: "Primer center de Hina. Una carta escrita al cielo que nadie recuerda haber enviado.",
        editions: [
          _edition(
            "Edición limitada A · CD + Blu-ray", "¥2,090", "RBCD-0107",
            "Blu-ray con el videoclip de «Yozora Letter», Dance Shot Ver. y making-of.",
            [
              _disc("CD", "RBCD-0107", [
                _track("Yozora Letter", "4:21", "Letra: Hina Kurose · Música: Mei Fujisaki"),
                _track("Hoshi no Naka de", "3:47", "Letra y música: Sora Amane"),
                _track("Yozora Letter (Instrumental)", "4:21"),
                _track("Hoshi no Naka de (Instrumental)", "3:47")
              ]),
              _disc("Blu-ray", "RBCD-0107B", [
                _track("Yozora Letter (Music Video)", "4:27"),
                _track("Yozora Letter (Dance Shot Ver.)", "4:24"),
                _track("Making-of & entrevista", "13:16")
              ])
            ]
          ),
          _edition(
            "Edición regular · CD", "¥1,200", "RBCD-0108",
            "Solo CD. Portada regular con Hina bajo el cielo nocturno.",
            [
              _disc("CD", "RBCD-0108", [
                _track("Yozora Letter", "4:21", "Letra: Hina Kurose · Música: Mei Fujisaki"),
                _track("Hoshi no Naka de", "3:47", "Letra y música: Sora Amane"),
                _track("Yozora Letter (Instrumental)", "4:21"),
                _track("Hoshi no Naka de (Instrumental)", "3:47")
              ])
            ]
          )
        ]
      },
      {
        id: "r5", type: "mini",
        title: "AFTERGLOW", titleJp: "アフターグロウ",
        date: "2026-01-21", catalog: "RBAD-0103",
        center: "Sora Amane",
        senbatsu: "Sora, Hina, Mei, Akira, Ren",
        color: "#6bffb8", image: null,
        description: "Mini álbum de invierno. Seis canciones sobre lo que queda cuando se apagan las luces del escenario.",
        editions: [
          _edition(
            "Edición limitada · CD + DVD", "¥2,500", "RBAD-0103",
            "DVD con el videoclip de «AFTERGLOW», Dance Shot Ver. y making-of.",
            [
              _disc("CD", "RBAD-0103", [
                _track("AFTERGLOW", "1:12", "Música: Kaede Morisawa"),
                _track("Summer Regret", "3:59", "Letra y música: Mei Fujisaki"),
                _track("Hadaka no Kokoro", "4:14", "Letra: Akira Mizuno · Música: Kaede Morisawa"),
                _track("Sidewalk no Koi", "3:33", "Letra y música: Hina Kurose"),
                _track("Kagerou", "4:07", "Letra y música: Sora Amane"),
                _track("AFTERGLOW (Reprise)", "2:40", "Música: Kaede Morisawa")
              ]),
              _disc("DVD", "RBAD-0103B", [
                _track("AFTERGLOW (Music Video)", "4:02"),
                _track("AFTERGLOW (Dance Shot Ver.)", "3:59"),
                _track("Making-of & entrevista", "15:08")
              ])
            ]
          ),
          _edition(
            "Edición regular · CD", "¥1,800", "RBAD-0104",
            "Solo CD. Portada regular con las seis integrantes bajo la nieve.",
            [
              _disc("CD", "RBAD-0104", [
                _track("AFTERGLOW", "1:12", "Música: Kaede Morisawa"),
                _track("Summer Regret", "3:59", "Letra y música: Mei Fujisaki"),
                _track("Hadaka no Kokoro", "4:14", "Letra: Akira Mizuno · Música: Kaede Morisawa"),
                _track("Sidewalk no Koi", "3:33", "Letra y música: Hina Kurose"),
                _track("Kagerou", "4:07", "Letra y música: Sora Amane"),
                _track("AFTERGLOW (Reprise)", "2:40", "Música: Kaede Morisawa")
              ])
            ]
          )
        ]
      },
      {
        id: "r6", type: "digital",
        title: "Kage to Hikari", titleJp: "影と光",
        date: "2026-09-09", catalog: "—",
        center: "Mei Fujisaki",
        senbatsu: "Mei, Hina, Akira",
        color: "#ff6b6b", image: null,
        description: "Single digital sorpresa. La primera canción escrita y centrada por Mei, publicada sin aviso un martes a las 00:00.",
        editions: [
          _edition(
            "Edición digital", "—", "—",
            "Distribución digital. Sin soporte físico; incluye una portada digital exclusiva.",
            [
              _disc("Digital", "—", [
                _track("Kage to Hikari", "4:33", "Letra y música: Mei Fujisaki"),
                _track("Kage to Hikari (Instrumental)", "4:33")
              ])
            ]
          )
        ]
      }
    ]
  }
};
