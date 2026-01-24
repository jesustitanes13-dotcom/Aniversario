export type StatItem = {
  label: string;
  value: string;
};

export type PlayerStats = {
  name: string;
  subtitle: string;
  stats: StatItem[];
};

export type PlaceCard = {
  id: string;
  title: string;
  description: string;
  mapQuery: string;
};

export type PlaylistSong = {
  title: string;
  artist: string;
  url: string;
  isStart?: boolean;
};

export type PlaylistGroup = {
  id: string;
  label: string;
  songs: PlaylistSong[];
};

export type StoryMoment = {
  title: string;
  description: string;
};

export type BucketItem = {
  id: string;
  label: string;
  done: boolean;
};

export const heroContent = {
  eyebrow: "Aniversario",
  title: "Nataly Gomez",
  subtitle: "Una historia de amor contada como una experiencia premium.",
  startDate: "2024-01-26T00:00:00",
  backgroundImage: "/images/portada.jpg",
};

export const storyParagraphs = [
  "PORTADA",
  "26 de Enero",
  "COMO ME ENAMORE DE TI",
  "JESUS/NATALY ♡",
  "INDICE ♡",
  "• AGRADECIMIENTOS",
  "• COMO NOS CONOCIMOS",
  "• PORQUE TU",
  "• NUESTROS MEJORES MOMENTOS",
  "AGRADECIMIENTOS",
  "PRIMERO TE QUIERO AGRADECER POR LLEGAR A MI VIDA, POR HACER MI VIDA MAS LINDA, POR DARME ESE APOYO Y MOTIVACION DESDE EL PRIMER DIA, QUE APESAR DE PASAR POR MALOS MOMENTOS TU SIEMPRE ESTUVISTES AHI PARA MI.",
  "GRACIAS POR SIEMPRE SER TU MISMA, POR SER TAN AMOROSA, POR DARME TODO ESE AMOR.",
  "POR APOYARME EN TUS MIS OBJETIVOS Y POR ENTENDERLOS.",
  "COMO NOS CONOCIMOS",
  "NOS CONOCIMOS PORQUE TU AMIGO ERIC NOS AYUDO A JUNTARNOS, EMPEZAMOS A HABLAR PRIMERO POR INSTAGRAM, ANTES DE ESO NOS HACIAMOS UNAS MIRADITAS POR LOS PASILLOS, DESPUES DE ESO HABLAMOS UN RATO EL DIA DE ESO EN EL ASADO, ME SENTI MUY BIEN Y COMODO ESE DIA, DESPUES DECIDISTE GRABAR NUESTROS PARTIDOS, AHI EMPEZAMOS A HABLAR MUCHO MAS, HASTA QUE ENERO VINISTE A MI CASA Y CONOCISTE A MIS FAMILIA.",
  "PORQUE TU",
  "TE ELEGI SER LA COMPANERA DE MI VIDA, PORQUE ME DEMOSTRASTES SER UNA MUJER CON UN GRAN CORAZON, NOBLE, HULMILDE, SENCILLA, AMABLE, CON BUEN SENTIDO DEL HUMOR, CONVERSADORA Y UNA BUENA PERSONA.",
  "ERES LA COMBI COMPLETA MI AMOR.",
  "NUESTROS MEJORES MOMENTOS",
  "DESPUES QUE TERMINO LA TEMPORADA, FUIMOS A NUESTRO SEGUNDO VIAJE EN CORPUS, TAMBIEN LOS DISFRUTE MUCHISMO MI AMOR.",
  "DESPUES NUESTRA GRADUACION TAMBIEN FUE UN MOMENTO ESPECIAL.",
];

export const storyMoments: StoryMoment[] = [
  {
    title: "Bracho Bracho",
    description:
      "Cuando fuiste a mi primer juego, estaba un poco nervioso porque la verdad queria que te dieras cuenta que jugaba bien y que era bueno, no queria hacer nada malo jajajajaja, al final del dia subiste una historia con mi fan-shirt, me encanto.",
  },
  {
    title: "Tu juego",
    description:
      "Cuando fui a tu juego, me encanto verte jugar mi amor, desearia verte jugar mas.",
  },
  {
    title: "Viaje con tu familia",
    description:
      "Cuando me fui de viaje con tu familia por casi una semana, fue una de las mejores semanas en mi vida, disfrute muchisimo estar contigo y tu familia. (4 dias sin echarme un pedito, casi se me explota un pulmon jajajajaja).",
  },
  {
    title: "Camisetas del Barca",
    description:
      "Cuando nos pusimos las camisetas del Barca, al final eliminaron a mi barquita, pero el estar matching contigo me hizo feliz mi amor.",
  },
  {
    title: "Show de Disney",
    description:
      "Cuando fuimos todos al show de Disney, me encanto porque pudiste conocer mas a mi familia que esta un poco loquita jajaja (vi a Rayo McQueen yeeees).",
  },
  {
    title: "Evento de temporada",
    description:
      "Cuando fuimos al evento de temporada en mi equipo, me sentia muy orgulloso por como fue mi temporada y tambien muy bien porque te distes cuenta que soy el goat :).",
  },
  {
    title: "Prom invitation",
    description:
      "Cuando te pedi que fueras al prom conmigo, estuviste toda una semana haciendome directas de que hay que pedir eso jajajaja, te sorprendi mamiiii.",
  },
  {
    title: "Nuestro prom",
    description:
      "Cuando fuimos al prom, estaba muy nervioso y no queria ir porque no sabia bailar muy bien, pero tu me diste una confianza tan grande que me senti muy bien y relajado.",
  },
  {
    title: "Roblox",
    description:
      "Cuando jugamos Roblox con mis hermanos jajajaja, estuvimos hasta tarde jugando muchos juegos.",
  },
  {
    title: "Regreso de Florida",
    description:
      "Cuando regrese de Florida y me ayudaste a recoger todo mi cuarto.",
  },
  {
    title: "Tu cumpleanos",
    description:
      "En tu cumpleanos, mi familia y yo tratamos de darte el mejor dia para ti.",
  },
  {
    title: "Grupo Frontera",
    description:
      "Uno de los regalos fue el concierto de Grupo Frontera, fue una de las mejores noches que he tenido en mi vida, cantar todas esas canciones junto al amor de mi vida es algo inexplicable.",
  },
  {
    title: "Futbol americano",
    description:
      "Cuando fuimos al juego de futbol americano y nos fuimos con las camisetas de Messi y Pedri, mis idolos :).",
  },
  {
    title: "Convention con la familia",
    description:
      "Cuando fuimos al convention center con toda mi familia, me siento muy feliz que pudiste conocer a mis otros primos, me encanto esa noche.",
  },
];

export const playerStats: PlayerStats[] = [
  {
    name: "Nataly",
    subtitle: "Nivel Dios en ternura",
    stats: [
      { label: "Nivel de hermosura", value: "10000" },
      { label: "Pedos echados", value: "3" },
      { label: "Horas en TikTok", value: "10000000" },
      { label: "Horas de sueño", value: "1000000000" },
      { label: "Risas sin razón", value: "1000000" },
      { label: "Juegos grabados para Jesus Bracho", value: "Todos" },
      { label: "Estilo", value: "10/10" },
      { label: "Humildad", value: "10000" },
      { label: "Amor", value: "100000" },
      { label: "Horas de trabajo", value: "10000" },
      { label: "Horas libres en la universidad", value: "10000" },
      { label: "Clases canceladas", value: "100000" },
      { label: "Fotos aesthetic", value: "100000" },
      { label: "Nivel de canto", value: "Nivel Dios" },
      { label: "TSI Math", value: "961" },
      { label: "Chips comidos", value: "1000000" },
      { label: "Cafes", value: "1000000000" },
      { label: "Veces echo copy a su novio", value: "10000000" },
      { label: "Nivel en baloncesto", value: "Nivel Dios" },
      { label: "Partidos ganados en volleyball", value: "3" },
    ],
  },
  {
    name: "Jesus",
    subtitle: "Jugador competitivo",
    stats: [
      { label: "Pedos echados", value: "1000000" },
      { label: "Goles dedicados a Nataly", value: "Todos" },
      { label: "Horas en Clash Royale", value: "10000" },
      { label: "Horas en Warzone", value: "100000" },
      { label: "Juguetes en su colección", value: "20" },
      { label: "Juguetes regalados por Nataly", value: "12" },
      { label: "Nivel de soccer", value: "Nivel Dios" },
      { label: "Camisetas de soccer en su armario", value: "40" },
      { label: "Carreritas hechas", value: "10000" },
      { label: "Clases canceladas", value: "1" },
      { label: "Goles anotados", value: "40" },
      { label: "TSI Math", value: "961" },
      { label: "Chips comidos", value: "10" },
      { label: "Cafes", value: "14" },
      { label: "Veces echo copy a su novia", value: "1" },
      { label: "Partidos ganados en volleyball", value: "3" },
    ],
  },
];

export const places: PlaceCard[] = [
  {
    id: "mcallen-memorial",
    title: "McAllen Memorial",
    description: "Donde todo comenzó con miradas en los pasillos.",
    mapQuery: "McAllen Memorial High School McAllen TX",
  },
  {
    id: "estadio",
    title: "El Estadio",
    description: "Donde me grababas los goles y te convertiste en mi fan #1.",
    mapQuery: "McAllen Veterans Memorial Stadium McAllen TX",
  },
  {
    id: "convention-center",
    title: "Convention Center",
    description: "Nuestra noche mágica de Prom.",
    mapQuery: "McAllen Convention Center McAllen TX",
  },
  {
    id: "tinseltown",
    title: "Cine Tinseltown",
    description: "Nuestras citas favoritas viendo películas.",
    mapQuery: "Tinseltown McAllen TX",
  },
  {
    id: "plaza-mall",
    title: "Plaza Mall",
    description: "Caminatas eternas juntos.",
    mapQuery: "La Plaza Mall McAllen TX",
  },
  {
    id: "payne-arena",
    title: "Payne Arena",
    description: "El concierto inolvidable de Grupo Frontera.",
    mapQuery: "Payne Arena Hidalgo TX",
  },
  {
    id: "museo-edinburg",
    title: "Museo de Edinburg",
    description: "Una de nuestras salidas más especiales y diferentes.",
    mapQuery: "Museum of South Texas History Edinburg TX",
  },
];

export const galleryTexts = {
  intro:
    "Bueno, en esta seccion estaran un recap de todas las fotos mas importantes para nosotros, las que han marcado nuestra relacion y nuestra historia.",
  risas:
    "Esta seccion es de las fotos mas chistosas de nosotros mi amor, donde salimos como unos loquitos o haciendo cosas locas jajajaja, amo saber que puedo ser yo mismo, asi tipo bobito y hacer locuras y tu siempre me sigas la corriente, gracias por siempre ser chistosa y hacerme reir mi amor.",
  familiares:
    "Estas son fotos de nosotros con nuestras familias, han tenido un papel muy importante en nuestra relacion, ya que gracias a Dios nuestras dos familia nos han abierto a cada uno las puertas de nuestras casa y nos han tratado como si fueramos sus propios hijos, le doy muchas gracias a tu familia por todo el gran apoyo y amor que siempre me han dado, gracias por todo familia Gomez Ibarra.",
  regalos:
    "Esta es una parte de algunos de los regalos que nos hemos dado, gracias por todos los regalos que me has dado mi princesa.",
  mejores:
    "Las mejores fotos que nos hemos tomado mi princesa.",
};

export const playlistGroups: PlaylistGroup[] = [
  {
    id: "top-1",
    label: "Top 1",
    songs: [
      {
        title: "Cosas que no te dije",
        artist: "Saiko",
        url: "https://youtu.be/8obld3JrBNM?si=CLbXjUZp2Nt_4F2g",
        isStart: true,
      },
      {
        title: "Hecha pa' mi",
        artist: "Grupo Frontera",
        url: "https://youtu.be/IbE7peGTpmc?si=A2aKdEj4kJzLhg71",
      },
      {
        title: "Ella es mi todo",
        artist: "Kaleth Morales, Juank Ricardo",
        url: "https://youtu.be/eEtl66C8ogs?si=YwHig0rMucY-2xGm",
      },
      {
        title: "Regalo de Dios",
        artist: "Julion Alvarez y su Norteño Banda",
        url: "https://youtu.be/-RjwFR6H7_w?si=0Ayd-ovwmFZyXSr5",
      },
      {
        title: "Lo tienes todo",
        artist: "Julion Alvarez y su Norteño Banda",
        url: "https://youtu.be/a_wBQrUdcvk?si=zy7kWhoT34trAprK",
      },
      {
        title: "Cafune",
        artist: "Micro TDH",
        url: "https://youtu.be/MDSZK3PSjlY?si=0hcFs3OQIiIzHvzk",
      },
      {
        title: "Todo de ti",
        artist: "Rauw Alejandro",
        url: "https://youtu.be/Tr5bEXN6mvE?si=JjanUnmZzl6ERjgA",
      },
      {
        title: "Mi tesoro",
        artist: "Ramon Ayala",
        url: "https://youtu.be/Zx2jO2szITQ?si=dHNRTGBehSmDUEmz",
      },
      {
        title: "Sin mirar las senales",
        artist: "Rels B",
        url: "https://youtu.be/4OT447-Eldg?si=aFauATGdelekVy_b",
      },
      {
        title: "Te encontre",
        artist: "El Vega",
        url: "https://youtu.be/8g3KHA8ROiA?si=vcFBBqbRDF9FnPhc",
      },
    ],
  },
  {
    id: "top-2",
    label: "Top 2",
    songs: [
      {
        title: "Amor",
        artist: "Emmanuel Cortes",
        url: "https://youtu.be/TX-1dI8t6WM?si=cWNa82D4QEC8cjju",
      },
      {
        title: "Deseandote",
        artist: "Frankie Ruiz",
        url: "https://youtu.be/DkfIXSg4Jv8?si=IwEiyZuVUNqvrbFn",
      },
    ],
  },
  {
    id: "top-3",
    label: "Top 3",
    songs: [
      {
        title: "Besame sin sentir",
        artist: "Micro TDH",
        url: "https://youtu.be/n0x7jpD7upQ?si=3lhww5NrSaozVyyP",
      },
      {
        title: "Te vi",
        artist: "Micro TDH y Piso 21",
        url: "https://youtu.be/wH42bwvHMdM?si=2FI6yxXoLssyBRn1",
      },
      {
        title: "Tu sonrisa",
        artist: "Elvis Crespo",
        url: "https://youtu.be/qLl2R3z6DaA?si=pCo-qPu4ynYhtI0N",
      },
      {
        title: "Hasta ese dia",
        artist: "Lasso",
        url: "https://youtu.be/-aErzz-5zfI?si=WrvU5lTVSxpIPLdW",
      },
      {
        title: "Por fin te encontre",
        artist: "Cali y el Dandee",
        url: "https://youtu.be/_kxz7WX4mLU?si=7QGHwQ_1dVSJ8KG-",
      },
      {
        title: "Quiero decirte",
        artist: "Guaco",
        url: "https://youtu.be/7c-zrzeAtq4?si=k0pddzXKXHk5dsNo",
      },
      {
        title: "Mi princesa",
        artist: "Victor Muñoz",
        url: "https://youtu.be/dEw0532aC18?si=Cs0shDbF0Fx41Jtv",
      },
    ],
  },
  {
    id: "top-4",
    label: "Top 4",
    songs: [
      {
        title: "Me gustas",
        artist: "Grupo Frontera",
        url: "https://youtu.be/7P8bNA5gOqA?si=bp5cWlsyq0bZq00b",
      },
      {
        title: "El color de tus ojos",
        artist: "Banda MS",
        url: "https://youtu.be/7UO0O6ADu4Q?si=H5eN9Sw4xSfdgN7o",
      },
      {
        title: "Finales de agosto",
        artist: "Saiko",
        url: "https://youtu.be/4zUzFqdVkJk?si=ZtG2xo26qdG3JQQ2",
      },
      {
        title: "Pretty girl",
        artist: "Rels B, Tempoe",
        url: "https://youtu.be/te8IxX9cQDg?si=nG_ZACYFPJu4S2mb",
      },
      {
        title: "Me gusta tu",
        artist: "Manu Chao",
        url: "https://youtu.be/rs6Y4kZ8qtw?si=elKOFsskBfwD51g7",
      },
      {
        title: "Mami",
        artist: "Peso Pluma, Chino Pacas",
        url: "https://youtu.be/Lb3YHv1LEWw?si=En4QppgkOR7e0gbF",
      },
      {
        title: "Vivo",
        artist: "Guaco",
        url: "https://youtu.be/BSQoW0hcA0M?si=rQ6MT6_J1RWspzFJ",
      },
    ],
  },
  {
    id: "top-5",
    label: "Top 5",
    songs: [
      {
        title: "Lo eres todo",
        artist: "Guaco",
        url: "https://youtu.be/9K-52HzMJgA?si=bzMJSW-fsL71MpWg",
      },
      {
        title: "Es por ti",
        artist: "Juanes",
        url: "https://youtu.be/-9l5t3MWss8?si=OuPvyOTeQatlEexW",
      },
      {
        title: "El poeta",
        artist: "Chino y Nacho",
        url: "https://youtu.be/NudmLhxEx_s?si=ZxqeEX5W9OusK0If",
      },
    ],
  },
];

export const bucketList: BucketItem[] = [
  { id: "viaje-familia", label: "Viaje familia", done: true },
  { id: "cine", label: "Ver una pelicula en el cine", done: true },
  { id: "graduarnos-hs", label: "Graduarnos de high school", done: true },
  { id: "universidad", label: "Entrar a la universidad", done: true },
  { id: "primer-concierto", label: "Primer concierto juntos", done: true },
  { id: "museo", label: "Ir a un museo", done: true },
  { id: "trend-tiktok", label: "Hacer un trend de tiktok", done: true },
  { id: "marching-outfits", label: "Marching outfits", done: true },
  { id: "prom", label: "Prom juntos", done: true },
  { id: "gym-juntos", label: "Ir al gym juntos", done: true },
  { id: "dibujo", label: "Un dibujo hecho por nosotros", done: true },
  { id: "caminata-convention", label: "Caminata por el convention", done: true },
  { id: "caminata-mall", label: "Caminata por el mall", done: true },
  { id: "casarnos", label: "Casarnos", done: false },
  { id: "barca", label: "Ir a un juego del barca juntos", done: false },
  { id: "camp-nou", label: "Ir al Camp Nou", done: false },
  { id: "viajar-juntos", label: "Viajar juntos", done: false },
  { id: "zoologico", label: "Ir al zoologico", done: false },
  {
    id: "harry-potter",
    label: "Ir al castillo de Harry Potter",
    done: false,
  },
  { id: "stranger-things", label: "Terminar Stranger Things", done: false },
  {
    id: "graduarse-uni",
    label: "Graduarse de la universidad",
    done: false,
  },
  { id: "trabajos", label: "Tener trabajos", done: false },
  { id: "papas", label: "Mantener a nuestros papas", done: false },
  { id: "hijos", label: "Tener hijos", done: false },
  { id: "mascota", label: "Tener mascota", done: false },
  { id: "casa", label: "Tener una casa", done: false },
];

export const loveLetter = [
  "Bueno mi amor esto seria lo ultimo que veras del website que hice para los dos, la verdad tenia esta idea desde hace tiempo, pero lo deje para este momento indicado, me llevo bastante tiempo y lo hice con mucho cariño mi amor, espero que te guste mucho, le puse muchas cosas y lo seguire actualizando poco a poco si mi amor.",
  "Pero bueno esta carta es mas que todo para un agradecimiento infinito y tambien para decirte FELIZ SEGUNDO ANIVERSARIO, YA SON 24 meses juntos mi amor, estoy muy emocionado y feliz por esto que hemos alcanzado los dos juntos mi amor, me parece increible ya todo el tiempo que hemos pasado juntos, te amo demasiado mi amor, haciendo la website me puse a ver todas nuestras fotos mi amor y Dios mio la verdad si hemos hecho muchas cosas mi reina, hemos hecho de todo mi amor, te amo demasiado, gracias por estos dos anos juntos, gracias por cada risa, sonrisa, lagrima, abrazo, mirada y cada te amo amor.",
  "Valoro todas las cosas que has hecho por mi, por hacerme feliz y buscar siempre lo mejor para nosotros, has hecho mucho por mi amor, te doy las gracias de todo corazon en serio, nunca voy a olvidar todo esto, lo mucho que me has ayudado con el idioma y con mi adaptacion a este pais, gracias por todo mi amor, espero que sigamos asi, se que hemos tenido momentos dificiles pero asi son las relaciones, yo lo unico que no quiero es que te sientas con miedo amor, yo siempre voy a estar para ti mi princesa hermosa, siempre para todo lo que necesites, yo quiero darte todo en esta vida, y quiero esforzarme mas y mas para darte todo lo que te mereces mi amor, te doy muchas gracias por estos dos anos mi amor, espero que puedan ser muchos mas a tu lado.",
];
