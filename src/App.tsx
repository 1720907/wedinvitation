/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  calculateCountdown,
  CountdownResult,
  formatRsvpMessage,
  buildWhatsAppLink,
  generateGoogleCalendarUrl
} from './utils/weddingLogic';

// =================================================================
// 1. DICCIONARIO CENTRALIZADO DE IMÁGENES Y RECURSOS MULTIMEDIA
// =================================================================
export const IMAGES = {
  // Fondos y Texturas Artesanales
  fondoContinuo: './assets/aistudio/imagen_fondo.jpg_a5ae7893.png',
  papel1Limpio: './assets/aistudio/papel1_14fb074a_limpio.png',
  papel3Clean: './assets/aistudio/papel3_clean.png',
  papel3CleanRotated: './assets/aistudio/papel3_clean_rotated.png',
  papel4: './assets/aistudio/papel4_97b148ae.png',
  papel6Medallon: './assets/aistudio/papel6_03599585.png',
  papelDecoracion1: './assets/aistudio/papel_decoracion_1819d25f.png',
  papelDecoracion2: './assets/aistudio/papel_decoracion_2_6b80d71f.png',
  sombraHero: './assets/aistudio/sombra_baa5a2e0.png',
  selloCera: './assets/aistudio/imagen_sello_75c97831.png',
  florPrensada: './assets/aistudio/flor_9aee3096.png',

  // Hero y Portada
  heroCover: './assets/aistudio/foto_cover_clean.jpg',
  heroFotoPareja: './assets/aistudio/portada.jpeg',

  // Sobres
  sobreAbiertoFondo: './assets/aistudio/sobreabierto1_a0f8ad35.png',
  sobreAbiertoFrente: './assets/aistudio/sobreabierto2_d3a8449e.png',
  sobreCerrado: './assets/aistudio/sobrecerrado_3948ed67.png',

  // Bocetos Artísticos
  sketchIglesia: './assets/aistudio/sketch_iglesia.png',
  sketchRecepcion: './assets/aistudio/sketch_recepcion.png',

  // Iconos de Itinerario
  iconoAnillos: './assets/aistudio/icono_anillos_48b04619.png',
  iconoDespedida: './assets/aistudio/icono_despedida_dcfd3b04.png',
  iconoVotos: './assets/aistudio/icono_votos.png',
  iconoCoctel: './assets/aistudio/icono_coctel_2fb88822.png',
  iconoCena: './assets/aistudio/icono_cena_f73c8000.png',
  iconoFiesta: './assets/aistudio/icono_fiesta_a951966a.png',

  // Fotos Carrusel Polaroid
  carrusel1: './assets/aistudio/carrusel1.jpeg',
  carrusel2: './assets/aistudio/carrusel2.jpeg',
  carrusel3: './assets/aistudio/carrusel3.jpeg',
  carrusel4: './assets/aistudio/carrusel4.jpeg',
  carrusel5: './assets/aistudio/carrusel5.jpeg',

  // Audio / Música de fondo
  cancionBoda: 'assets/audio/A Thousand years.mp3',
} as const;

// =================================================================
// 2. CONFIGURACIÓN CENTRALIZADA DE DATOS DE LA BODA (DATOS SENSIBLES Y EVENTO)
// =================================================================
export interface ItineraryItemConfig {
  hora: string;
  titulo: string;
  iconoSrc: string;
  alt: string;
  variant: 'standard' | 'wide-flipped' | 'wide';
}

export interface WeddingConfig {
  novios: {
    el: string;
    ella: string;
    nombresJuntos: string;
    monograma: string;
    frase: string;
    invitacionCarta: string;
  };
  padres: {
    columna1: [string, string];
    columna2: [string, string];
  };
  fecha: {
    iso: string;
    isoFin: string;
    dia: string;
    mes: string;
    anio: string;
    horaCeremonia: string;
    horaRecepcion: string;
    textoCorto: string;
    fechaLimiteRsvp: string;
  };
  lugares: {
    ceremonia: {
      titulo: string;
      nombre: string;
      localidad: string;
      direccion: string;
      hora: string;
      mapsUrl: string;
      embedUrl: string;
    };
    recepcion: {
      titulo: string;
      nombre: string;
      localidad: string;
      direccion: string;
      hora: string;
      mapsUrl: string;
      embedUrl: string;
    };
  };
  itinerario: ItineraryItemConfig[];
  vestimenta: {
    categoria: string;
    damas: string;
    caballeros: string;
    nota: string;
  };
  banco: {
    nombreBanco: string;
    bcp: string;
    cci: string;
    titularBcp: string;
    metodoMovilTitulo: string;
    yapeAdriana: string;
    titularAdriana: string;
    yapeJorge: string;
    titularJorge: string;
    mensaje: string;
    agradecimiento: string;
  };
  album: {
    url: string;
    qrApiBaseUrl: string;
    titulo: string;
    descripcion: string;
    instruccion: string;
  };
  rsvp: {
    apiUrl: string;
    storageKey: string;
    sessionExpirationMs: number;
    codigoEjemploPlaceholder: string;
    parrafo1: string;
    parrafo2: string;
    fraseCierre: string;
  };
  despedida: {
    titulo: string;
    frase: string;
    saludo: string;
    firma: string;
    ubicacion: string;
  };
  whatsapp: string;
  albumUrl: string;
  audioUrl: string;
}

// Configuración inicial sin datos sensibles expuestos en el código fuente.
// Todos los datos sensibles y del evento son inyectados desde Google Apps Script tras validar el código de invitado
// y se almacenan de forma segura en localStorage durante 24 horas.
export const DEFAULT_CONFIG: WeddingConfig = {
  novios: {
    el: "",
    ella: "",
    nombresJuntos: "",
    monograma: "J&A",
    frase: "",
    invitacionCarta: ""
  },
  padres: {
    columna1: ["", ""],
    columna2: ["", ""]
  },
  fecha: {
    iso: "2027-02-27T11:30:00",
    isoFin: "2027-02-27T23:59:59",
    dia: "",
    mes: "",
    anio: "",
    horaCeremonia: "",
    horaRecepcion: "",
    textoCorto: "",
    fechaLimiteRsvp: ""
  },
  lugares: {
    ceremonia: {
      titulo: "Ceremonia Religiosa",
      nombre: "",
      localidad: "",
      direccion: "",
      hora: "",
      mapsUrl: "",
      embedUrl: ""
    },
    recepcion: {
      titulo: "Recepción",
      nombre: "",
      localidad: "",
      direccion: "",
      hora: "",
      mapsUrl: "",
      embedUrl: ""
    }
  },
  itinerario: [],
  vestimenta: {
    categoria: "ELEGANTE",
    damas: "",
    caballeros: "",
    nota: ""
  },
  banco: {
    nombreBanco: "",
    bcp: "",
    cci: "",
    titularBcp: "",
    metodoMovilTitulo: "Yape / Plin",
    yapeAdriana: "",
    titularAdriana: "",
    yapeJorge: "",
    titularJorge: "",
    mensaje: "",
    agradecimiento: ""
  },
  album: {
    url: "",
    qrApiBaseUrl: "https://api.qrserver.com/v1/create-qr-code/",
    titulo: "Álbum Compartido",
    descripcion: "",
    instruccion: ""
  },
  rsvp: {
    apiUrl: "https://script.google.com/macros/s/AKfycbz0lazax4EV4fb5F1MW6Js4nvupFJgMIxp_QSS2vTFkCllo0NUcIeshSPOVFU4K0MAl/exec",
    storageKey: "sesionBodaJA",
    sessionExpirationMs: 24 * 60 * 60 * 1000, // 24 horas en milisegundos
    codigoEjemploPlaceholder: "Ej: K9X2P",
    parrafo1: "",
    parrafo2: "",
    fraseCierre: ""
  },
  despedida: {
    titulo: "¡Te esperamos!",
    frase: "",
    saludo: "Con todo nuestro cariño,",
    firma: "",
    ubicacion: ""
  },
  whatsapp: "",
  albumUrl: "",
  audioUrl: IMAGES.cancionBoda
};

// Carrusel de 5 fotos en Polaroid con animación de alejamiento lento (Ken Burns)
const POLAROID_CAROUSEL_PHOTOS = [
  {
    id: 1,
    src: IMAGES.carrusel1,
    alt: "Foto polaroid 1",
    caption: "“Nuestro lugar favorito en el mundo siempre será estar juntos”"
  },
  {
    id: 2,
    src: IMAGES.carrusel2,
    alt: "Foto polaroid 2",
    caption: "“De la mano, hacia todos los sueños que nos quedan por vivir”"
  },
  {
    id: 3,
    src: IMAGES.carrusel3,
    alt: "Foto polaroid 3",
    caption: "“Cuando las palabras dejan de ser necesarias a través de nuestra mirada”"
  },
  {
    id: 4,
    src: IMAGES.carrusel4,
    alt: "Foto polaroid 4",
    caption: "“Los brazos a los que siempre queremos volver”"
  },
  {
    id: 5,
    src: IMAGES.carrusel5,
    alt: "Foto polaroid 5",
    caption: "“El comienzo de nuestro para siempre. 🤍”"
  }
];

const GUEST_API_URL = DEFAULT_CONFIG.rsvp.apiUrl;
const SESSION_STORAGE_KEY = DEFAULT_CONFIG.rsvp.storageKey;
const SESSION_EXPIRATION_MS = DEFAULT_CONFIG.rsvp.sessionExpirationMs;

interface GuestData {
  codigo: string;
  invitado: string;
  pases: number;
  confirmados?: number;
  estado?: 'Confirmado' | 'Declinado' | null;
}

interface StoredSessionData {
  codigo: string;
  invitado?: string;
  pases?: number;
  confirmados?: number;
  estado?: 'Confirmado' | 'Declinado' | null;
  configuracion?: WeddingConfig;
  timestamp: number;
}

// Sanitización estricta contra XSS: elimina etiquetas o caracteres peligrosos y convierte números de Sheets a string
function sanitizePlainText(input: unknown, maxLen = 600): string {
  if (input === null || input === undefined) return '';
  const str = typeof input === 'string' ? input : typeof input === 'number' || typeof input === 'boolean' ? String(input) : '';
  return str.replace(/[<>]/g, '').trim().slice(0, maxLen);
}

// Sanitización segura de URLs (solo permite https://, http:// o rutas relativas de assets)
function sanitizeUrl(input: unknown, fallback = ''): string {
  const clean = sanitizePlainText(input, 1000);
  if (!clean) return fallback;
  if (
    clean.startsWith('https://') ||
    clean.startsWith('http://') ||
    clean.startsWith('./assets/') ||
    clean.startsWith('/assets/') ||
    clean.startsWith('assets/')
  ) {
    return clean;
  }
  return fallback;
}

// Resuelve referencias al diccionario IMAGES (ej. "IMAGES.iconoAnillos" o "iconoAnillos") o rutas directas
function resolveImageReference(input: unknown, fallback: string): string {
  const clean = sanitizePlainText(input, 300);
  if (!clean) return fallback;
  const key = clean.startsWith('IMAGES.') ? clean.slice('IMAGES.'.length) : clean;
  if (key in IMAGES) {
    return IMAGES[key as keyof typeof IMAGES];
  }
  return sanitizeUrl(clean, fallback);
}

function sanitizeGuestCode(input: unknown): string {
  if (input === null || input === undefined) return '';
  const str = typeof input === 'string' ? input : String(input);
  return str.replace(/[^A-Za-z0-9_-]/g, '').toUpperCase().slice(0, 14);
}

function asRecord(val: unknown): Record<string, unknown> {
  return val && typeof val === 'object' && !Array.isArray(val) ? (val as Record<string, unknown>) : {};
}

function sanitizeParentsTuple(input: unknown, fallback: [string, string]): [string, string] {
  if (Array.isArray(input)) {
    return [
      sanitizePlainText(input[0], 120) || fallback[0],
      sanitizePlainText(input[1], 120) || fallback[1]
    ];
  }
  if (typeof input === 'string' && input.trim()) {
    const parts = input.split(',').map((s) => sanitizePlainText(s, 120));
    return [parts[0] || fallback[0], parts[1] || fallback[1]];
  }
  return fallback;
}

// Normaliza y fusiona de forma segura el objeto configuracion proveniente de Google Apps Script o localStorage
function mergeAndSanitizeConfig(rawConfig: unknown, base: WeddingConfig = DEFAULT_CONFIG): WeddingConfig {
  const root = asRecord(rawConfig);
  const novios = asRecord(root.novios);
  const padres = asRecord(root.padres);
  const fecha = asRecord(root.fecha);
  const lugares = asRecord(root.lugares);
  const ceremonia = asRecord(lugares.ceremonia);
  const recepcion = asRecord(lugares.recepcion);
  const vestimenta = asRecord(root.vestimenta);
  const banco = asRecord(root.banco);
  const album = asRecord(root.album);
  const rsvp = asRecord(root.rsvp);
  const despedida = asRecord(root.despedida);

  const rawItinerario = Array.isArray(root.itinerario) ? root.itinerario : null;
  const sanitizedItinerario: ItineraryItemConfig[] = rawItinerario
    ? rawItinerario
        .map((itemRaw) => {
          const item = asRecord(itemRaw);
          const titulo = sanitizePlainText(item.titulo, 120);
          const hora = sanitizePlainText(item.hora, 60);
          if (!titulo && !hora) return null;
          const rawVariant = sanitizePlainText(item.variant, 30);
          const variant: ItineraryItemConfig['variant'] =
            rawVariant === 'wide-flipped' || rawVariant === 'wide' || rawVariant === 'standard'
              ? rawVariant
              : 'standard';

          return {
            hora,
            titulo,
            iconoSrc: resolveImageReference(item.iconoSrc, IMAGES.iconoAnillos),
            alt: sanitizePlainText(item.alt, 120) || titulo,
            variant
          };
        })
        .filter((it): it is ItineraryItemConfig => it !== null)
    : base.itinerario;

  const el = sanitizePlainText(novios.el, 80) || base.novios.el;
  const ella = sanitizePlainText(novios.ella, 80) || base.novios.ella;
  const nombresJuntos =
    sanitizePlainText(novios.nombresJuntos, 140) ||
    (el && ella ? `${el} & ${ella}` : base.novios.nombresJuntos);

  const resolvedAlbumUrl =
    sanitizeUrl(album.url) || sanitizeUrl(root.albumUrl) || base.album.url || base.albumUrl;

  return {
    novios: {
      el,
      ella,
      nombresJuntos,
      monograma: sanitizePlainText(novios.monograma, 20) || base.novios.monograma,
      frase: sanitizePlainText(novios.frase, 800) || base.novios.frase,
      invitacionCarta: sanitizePlainText(novios.invitacionCarta, 800) || base.novios.invitacionCarta
    },
    padres: {
      columna1: sanitizeParentsTuple(padres.columna1, base.padres.columna1),
      columna2: sanitizeParentsTuple(padres.columna2, base.padres.columna2)
    },
    fecha: {
      iso: sanitizePlainText(fecha.iso, 60) || base.fecha.iso,
      isoFin: sanitizePlainText(fecha.isoFin, 60) || base.fecha.isoFin,
      dia: sanitizePlainText(fecha.dia, 20) || base.fecha.dia,
      mes: sanitizePlainText(fecha.mes, 40) || base.fecha.mes,
      anio: sanitizePlainText(fecha.anio, 20) || base.fecha.anio,
      horaCeremonia: sanitizePlainText(fecha.horaCeremonia, 40) || base.fecha.horaCeremonia,
      horaRecepcion: sanitizePlainText(fecha.horaRecepcion, 40) || base.fecha.horaRecepcion,
      textoCorto: sanitizePlainText(fecha.textoCorto, 40) || base.fecha.textoCorto,
      fechaLimiteRsvp: sanitizePlainText(fecha.fechaLimiteRsvp, 80) || base.fecha.fechaLimiteRsvp
    },
    lugares: {
      ceremonia: {
        titulo: sanitizePlainText(ceremonia.titulo, 100) || base.lugares.ceremonia.titulo,
        nombre: sanitizePlainText(ceremonia.nombre, 160) || base.lugares.ceremonia.nombre,
        localidad: sanitizePlainText(ceremonia.localidad, 120) || base.lugares.ceremonia.localidad,
        direccion: sanitizePlainText(ceremonia.direccion, 220) || base.lugares.ceremonia.direccion,
        hora: sanitizePlainText(ceremonia.hora, 40) || base.lugares.ceremonia.hora,
        mapsUrl: sanitizeUrl(ceremonia.mapsUrl, base.lugares.ceremonia.mapsUrl),
        embedUrl: sanitizeUrl(ceremonia.embedUrl, base.lugares.ceremonia.embedUrl)
      },
      recepcion: {
        titulo: sanitizePlainText(recepcion.titulo, 100) || base.lugares.recepcion.titulo,
        nombre: sanitizePlainText(recepcion.nombre, 160) || base.lugares.recepcion.nombre,
        localidad: sanitizePlainText(recepcion.localidad, 120) || base.lugares.recepcion.localidad,
        direccion: sanitizePlainText(recepcion.direccion, 220) || base.lugares.recepcion.direccion,
        hora: sanitizePlainText(recepcion.hora, 40) || base.lugares.recepcion.hora,
        mapsUrl: sanitizeUrl(recepcion.mapsUrl, base.lugares.recepcion.mapsUrl),
        embedUrl: sanitizeUrl(recepcion.embedUrl, base.lugares.recepcion.embedUrl)
      }
    },
    itinerario: sanitizedItinerario,
    vestimenta: {
      categoria: sanitizePlainText(vestimenta.categoria, 60) || base.vestimenta.categoria,
      damas: sanitizePlainText(vestimenta.damas, 300) || base.vestimenta.damas,
      caballeros: sanitizePlainText(vestimenta.caballeros, 300) || base.vestimenta.caballeros,
      nota: sanitizePlainText(vestimenta.nota, 400) || base.vestimenta.nota
    },
    banco: {
      nombreBanco: sanitizePlainText(banco.nombreBanco, 120) || base.banco.nombreBanco,
      bcp: sanitizePlainText(banco.bcp, 80) || base.banco.bcp,
      cci: sanitizePlainText(banco.cci, 80) || base.banco.cci,
      titularBcp: sanitizePlainText(banco.titularBcp, 120) || base.banco.titularBcp,
      metodoMovilTitulo: sanitizePlainText(banco.metodoMovilTitulo, 60) || base.banco.metodoMovilTitulo,
      yapeAdriana: sanitizePlainText(banco.yapeAdriana, 40) || base.banco.yapeAdriana,
      titularAdriana: sanitizePlainText(banco.titularAdriana, 120) || base.banco.titularAdriana,
      yapeJorge: sanitizePlainText(banco.yapeJorge, 40) || base.banco.yapeJorge,
      titularJorge: sanitizePlainText(banco.titularJorge, 120) || base.banco.titularJorge,
      mensaje: sanitizePlainText(banco.mensaje, 600) || base.banco.mensaje,
      agradecimiento: sanitizePlainText(banco.agradecimiento, 300) || base.banco.agradecimiento
    },
    album: {
      url: resolvedAlbumUrl,
      qrApiBaseUrl: sanitizeUrl(album.qrApiBaseUrl, base.album.qrApiBaseUrl),
      titulo: sanitizePlainText(album.titulo, 100) || base.album.titulo,
      descripcion: sanitizePlainText(album.descripcion, 600) || base.album.descripcion,
      instruccion: sanitizePlainText(album.instruccion, 600) || base.album.instruccion
    },
    rsvp: {
      apiUrl: base.rsvp.apiUrl,
      storageKey: base.rsvp.storageKey,
      sessionExpirationMs: base.rsvp.sessionExpirationMs,
      codigoEjemploPlaceholder:
        sanitizePlainText(rsvp.codigoEjemploPlaceholder, 40) || base.rsvp.codigoEjemploPlaceholder,
      parrafo1: sanitizePlainText(rsvp.parrafo1, 600) || base.rsvp.parrafo1,
      parrafo2: sanitizePlainText(rsvp.parrafo2, 600) || base.rsvp.parrafo2,
      fraseCierre: sanitizePlainText(rsvp.fraseCierre, 200) || base.rsvp.fraseCierre
    },
    despedida: {
      titulo: sanitizePlainText(despedida.titulo, 100) || base.despedida.titulo,
      frase: sanitizePlainText(despedida.frase, 600) || base.despedida.frase,
      saludo: sanitizePlainText(despedida.saludo, 100) || base.despedida.saludo,
      firma: sanitizePlainText(despedida.firma, 120) || nombresJuntos || base.despedida.firma,
      ubicacion: sanitizePlainText(despedida.ubicacion, 100) || base.despedida.ubicacion
    },
    whatsapp: sanitizePlainText(root.whatsapp, 40) || base.whatsapp,
    albumUrl: resolvedAlbumUrl,
    audioUrl: resolveImageReference(root.audioUrl, base.audioUrl)
  };
}

// Lectura segura de localStorage con validación de esquema, configuración y expiración de 24h
function getValidStoredSession(): StoredSessionData | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    const record = parsed as Record<string, unknown>;
    const cleanCode = sanitizeGuestCode(record.codigo);
    const timestamp = typeof record.timestamp === 'number' ? record.timestamp : Number(record.timestamp);

    if (!cleanCode || !Number.isFinite(timestamp)) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    const now = Date.now();
    if (now - timestamp < SESSION_EXPIRATION_MS && timestamp <= now + 60000) {
      const cleanInvitado = sanitizePlainText(record.invitado, 100);
      const rawPases = typeof record.pases === 'number' ? record.pases : parseInt(String(record.pases ?? ''), 10);
      const cleanPases = Number.isFinite(rawPases) && rawPases > 0 && rawPases <= 20 ? rawPases : undefined;
      const rawConfirmados =
        typeof record.confirmados === 'number'
          ? record.confirmados
          : parseInt(String(record.confirmados ?? ''), 10);
      const cleanConfirmados =
        Number.isFinite(rawConfirmados) && rawConfirmados >= 0 && rawConfirmados <= 20
          ? rawConfirmados
          : undefined;
      const rawEstado = sanitizePlainText(record.estado, 20);
      const cleanEstado: 'Confirmado' | 'Declinado' | null =
        rawEstado === 'Confirmado' || rawEstado === 'Declinado' ? rawEstado : null;

      const sanitizedConfig = record.configuracion
        ? mergeAndSanitizeConfig(record.configuracion, DEFAULT_CONFIG)
        : undefined;

      return {
        codigo: cleanCode,
        invitado: cleanInvitado || undefined,
        pases: cleanPases,
        confirmados: cleanConfirmados,
        estado: cleanEstado,
        configuracion: sanitizedConfig,
        timestamp
      };
    } else {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  } catch {
    try {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Ignorar errores de almacenamiento restringido
    }
    return null;
  }
}

function saveStoredSession(data: GuestData, configuracion?: WeddingConfig): void {
  if (typeof window === 'undefined') return;
  try {
    const payload: StoredSessionData = {
      codigo: sanitizeGuestCode(data.codigo),
      invitado: sanitizePlainText(data.invitado, 100),
      pases: Math.max(1, Math.min(20, Math.floor(Number(data.pases) || 1))),
      confirmados:
        typeof data.confirmados === 'number' && Number.isFinite(data.confirmados)
          ? Math.max(0, Math.min(20, Math.floor(data.confirmados)))
          : undefined,
      estado: data.estado ?? null,
      configuracion: configuracion ? mergeAndSanitizeConfig(configuracion, DEFAULT_CONFIG) : undefined,
      timestamp: Date.now()
    };
    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignorar errores de cuota o modo privado
  }
}

function clearStoredSession(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
  } catch {
    // Ignorar errores
  }
}

export default function App() {
  // Inicialización síncrona desde localStorage válido (< 24h) para restaurar tanto el código como la configuración sin exponer datos sensibles
  const [initialSession] = useState<StoredSessionData | null>(() => getValidStoredSession());

  const [config, setConfig] = useState<WeddingConfig>(() =>
    initialSession?.configuracion ?? DEFAULT_CONFIG
  );
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    calculateCountdown((initialSession?.configuracion ?? DEFAULT_CONFIG).fecha.iso)
  );
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioStatus, setAudioStatus] = useState<string>("Toca para reproducir");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  // Guest Access / Validation state (Google Apps Script API)
  const [accessCode, setAccessCode] = useState<string>(() => initialSession?.codigo ?? '');
  const [isAccessLoading, setIsAccessLoading] = useState<boolean>(false);
  const [accessError, setAccessError] = useState<string | null>(null);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => Boolean(initialSession));
  const [guestData, setGuestData] = useState<GuestData | null>(() =>
    initialSession
      ? {
          codigo: initialSession.codigo,
          invitado: initialSession.invitado || 'Cargando...',
          pases: initialSession.pases || 1,
          confirmados: initialSession.confirmados,
          estado: initialSession.estado ?? null
        }
      : null
  );

  // RSVP Form state (Google Apps Script API)
  const [isRsvpModalOpen, setIsRsvpModalOpen] = useState<boolean>(false);
  const [rsvpAttendance, setRsvpAttendance] = useState<'si' | 'no'>(() =>
    initialSession?.estado === 'Declinado' ? 'no' : 'si'
  );
  const [rsvpConfirmedCount, setRsvpConfirmedCount] = useState<number>(() =>
    initialSession?.confirmados && initialSession.confirmados > 0
      ? initialSession.confirmados
      : initialSession?.pases || 1
  );
  const [rsvpMessage, setRsvpMessage] = useState<string>('');
  const [isRsvpSubmitting, setIsRsvpSubmitting] = useState<boolean>(false);
  const [rsvpFeedback, setRsvpFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [lastSubmittedStatus, setLastSubmittedStatus] = useState<'Confirmado' | 'Declinado' | null>(
    () => initialSession?.estado ?? null
  );
  const [lastSubmittedCount, setLastSubmittedCount] = useState<number>(
    () => initialSession?.confirmados ?? 0
  );

  // Modal state for Maps
  const [activeMapModal, setActiveMapModal] = useState<{ title: string; embedUrl: string; mapsUrl: string } | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Hero couple photo zoom-out trigger
  const [heroAnimated, setHeroAnimated] = useState<boolean>(false);
  // Initial mobile viewport height scaled to ~125% so the hero appears zoomed in and completes on scroll
  const [heroMobileHeight, setHeroMobileHeight] = useState<number | null>(null);

  useEffect(() => {
    let lastWidth = typeof window !== 'undefined' ? window.innerWidth : 0;
    const calculateHeroHeight = () => {
      if (typeof window !== 'undefined') {
        if (window.innerWidth < 640) {
          // ~110% of mobile viewport height as requested so hero is enlarged and completes on scroll
          setHeroMobileHeight(Math.round(window.innerHeight * 1.1));
        } else {
          setHeroMobileHeight(null);
        }
      }
    };

    calculateHeroHeight();

    const handleResize = () => {
      if (typeof window !== 'undefined') {
        // Only update if width changes (orientation flip), preventing jitter when mobile browser URL bar hides/shows
        if (window.innerWidth !== lastWidth) {
          lastWidth = window.innerWidth;
          calculateHeroHeight();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => {
      setHeroAnimated(true);
    }, 120);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Bloquear arrastre nativo de imágenes en cualquier navegador para evitar copias fantasma (ghosting)
  useEffect(() => {
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };
    window.addEventListener('dragstart', handleDragStart, { capture: true });
    return () => {
      window.removeEventListener('dragstart', handleDragStart, { capture: true });
    };
  }, []);

  // Sección 4: Carrusel de 5 fotos Polaroid con alejamiento lento cada 4 segundos
  const [polaroidIdx, setPolaroidIdx] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPolaroidIdx((prev) => (prev + 1) % POLAROID_CAROUSEL_PHOTOS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Scroll Reveal observer granular para que cada elemento aparezca individualmente al hacer scroll
  useEffect(() => {
    if (!isUnlocked) return;
    let observer: IntersectionObserver | null = null;
    const timer = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
      );

      const elements = document.querySelectorAll('.reveal-item');
      elements.forEach((el) => observer?.observe(el));
    }, 60);

    return () => {
      clearTimeout(timer);
      observer?.disconnect();
    };
  }, [isUnlocked]);

  // Countdown timer interval
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(calculateCountdown(config.fecha.iso));
    }, 1000);
    return () => clearInterval(timer);
  }, [config.fecha.iso]);

  // Romantic acoustic piano melody generator (fallback when MP3 fails or offline)
  const startRomanticSynthPiano = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Romantic wedding chords progression: D, A, Bm, F#m, G, D, G, A
      const chords = [
        [293.66, 369.99, 440.00], // D Major
        [220.00, 277.18, 329.63], // A Major
        [246.94, 293.66, 369.99], // B Minor
        [185.00, 220.00, 277.18], // F# Minor
        [196.00, 246.94, 293.66], // G Major
        [293.66, 369.99, 440.00], // D Major
        [196.00, 246.94, 293.66], // G Major
        [220.00, 277.18, 329.63]  // A Major
      ];

      let chordIdx = 0;
      const playChord = () => {
        if (!isPlaying && synthIntervalRef.current) return;
        const currentChord = chords[chordIdx % chords.length];
        currentChord.forEach((freq, noteIdx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, ctx.currentTime);

          // Soft acoustic piano envelope
          const noteStart = ctx.currentTime + noteIdx * 0.18;
          gain.gain.setValueAtTime(0.0001, noteStart);
          gain.gain.exponentialRampToValueAtTime(0.08, noteStart + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 1.8);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(noteStart);
          osc.stop(noteStart + 1.9);
        });
        chordIdx++;
      };

      playChord();
      synthIntervalRef.current = window.setInterval(playChord, 1800);
    } catch {
      // Audio context not allowed without interaction
    }
  };

  const stopRomanticSynthPiano = () => {
    if (synthIntervalRef.current) {
      clearInterval(synthIntervalRef.current);
      synthIntervalRef.current = null;
    }
  };

  // Audio Toggle with smooth fade
  const toggleAudio = () => {
    const audio = audioRef.current;
    if (!isPlaying) {
      setIsPlaying(true);
      setAudioStatus("Reproduciendo nuestra canción ♪");

      if (audio) {
        audio.volume = 0;
        audio
          .play()
          .then(() => {
            let vol = 0;
            const fade = setInterval(() => {
              if (vol < 0.75) {
                vol = Math.min(0.75, vol + 0.08);
                audio.volume = vol;
              } else {
                clearInterval(fade);
              }
            }, 100);
          })
          .catch(() => {
            // Fallback to soothing acoustic piano synthesis
            startRomanticSynthPiano();
          });
      } else {
        startRomanticSynthPiano();
      }
    } else {
      setIsPlaying(false);
      setAudioStatus("Música en pausa");
      stopRomanticSynthPiano();

      if (audio && !audio.paused) {
        let vol = audio.volume;
        const fade = setInterval(() => {
          if (vol > 0.08) {
            vol = Math.max(0, vol - 0.08);
            audio.volume = vol;
          } else {
            clearInterval(fade);
            audio.pause();
          }
        }, 80);
      }
    }
  };

  // Copy text helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyToast(`¡${label} copiado al portapapeles!`);
    setTimeout(() => setCopyToast(null), 2500);
  };

  const handleCopyField = (text: string, label: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setCopyToast(`¡${label} copiado al portapapeles!`);
    setTimeout(() => {
      setCopiedField((curr) => (curr === fieldId ? null : curr));
    }, 2200);
    setTimeout(() => setCopyToast(null), 2500);
  };

  // Función centralizada y segura para consultar el Apps Script y sincronizar localStorage (24h)
  const consultarCodigo = async (rawCode: string, isAutoRestore = false) => {
    const cleanCode = sanitizeGuestCode(rawCode);
    if (!cleanCode) return;

    if (!isAutoRestore) {
      setIsAccessLoading(true);
      setAccessError(null);
    }

    try {
      const res = await fetch(GUEST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Clave para evitar problemas de CORS
        },
        body: JSON.stringify({
          accion: 'consultar',
          codigo: cleanCode
        })
      });
      const data = await res.json();
      if (data && data.encontrado) {
        const rawPases = parseInt(String(data.pases ?? '1'), 10);
        const pasesCount = Number.isFinite(rawPases) && rawPases > 0 && rawPases <= 20 ? rawPases : 1;
        const safeInvitado = sanitizePlainText(data.invitado || data.nombre, 100) || 'Invitado Especial';

        const rawConfirmados = parseInt(String(data.confirmados ?? ''), 10);
        const confirmadosCount =
          Number.isFinite(rawConfirmados) && rawConfirmados >= 0 && rawConfirmados <= 20
            ? rawConfirmados
            : undefined;
        const rawEstado = sanitizePlainText(data.estado, 20);
        const safeEstado: 'Confirmado' | 'Declinado' | null =
          rawEstado === 'Confirmado' || rawEstado === 'Declinado' ? rawEstado : null;

        // Hidratar y sanitizar toda la configuración de la boda devuelta por la API
        const nextConfig = data.configuracion
          ? mergeAndSanitizeConfig(data.configuracion, DEFAULT_CONFIG)
          : config;

        const verifiedGuest: GuestData = {
          codigo: cleanCode,
          invitado: safeInvitado,
          pases: pasesCount,
          confirmados: confirmadosCount,
          estado: safeEstado
        };

        // Guardar tanto los datos del invitado como la configuración de la boda en localStorage (24h de validez)
        saveStoredSession(verifiedGuest, nextConfig);

        setConfig(nextConfig);
        setCountdown(calculateCountdown(nextConfig.fecha.iso));
        setGuestData(verifiedGuest);

        if (safeEstado === 'Declinado') {
          setRsvpAttendance('no');
          setRsvpConfirmedCount(pasesCount);
          setLastSubmittedStatus('Declinado');
          setLastSubmittedCount(0);
        } else if (safeEstado === 'Confirmado') {
          setRsvpAttendance('si');
          const countToSet = confirmadosCount && confirmadosCount > 0 ? confirmadosCount : pasesCount;
          setRsvpConfirmedCount(countToSet);
          setLastSubmittedStatus('Confirmado');
          setLastSubmittedCount(countToSet);
        } else {
          setRsvpAttendance('si');
          setRsvpConfirmedCount(pasesCount);
        }

        setIsUnlocked(true);
      } else {
        // Limpiar por seguridad si el código ingresado o almacenado fue revocado
        clearStoredSession();
        setConfig(DEFAULT_CONFIG);
        setIsUnlocked(false);
        setGuestData(null);
        setAccessError(data?.error || 'Código no encontrado');
      }
    } catch (err) {
      console.error('Error al consultar código:', err);
      if (!isAutoRestore) {
        setAccessError('Hubo un inconveniente al consultar el código. Intenta de nuevo.');
      }
    } finally {
      if (!isAutoRestore) {
        setIsAccessLoading(false);
      }
    }
  };

  // Verificar y refrescar automáticamente los pases y la configuración si hay una sesión válida (< 24h) al cargar la página
  useEffect(() => {
    if (initialSession?.codigo) {
      consultarCodigo(initialSession.codigo, true);
    }
  }, [initialSession]);

  // Evento del formulario de acceso manual
  const handleValidateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    await consultarCodigo(accessCode, false);
  };

  // Google Sheets RSVP Submission (Google Apps Script API)
  const handleRsvpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestData) return;

    setIsRsvpSubmitting(true);
    setRsvpFeedback(null);

    const confirmados = rsvpAttendance === 'si'
      ? (guestData.pases > 1 ? rsvpConfirmedCount : 1)
      : 0;
    const nuevoEstado: 'Confirmado' | 'Declinado' = rsvpAttendance === 'si' ? 'Confirmado' : 'Declinado';

    const datosAEnviar = {
      accion: 'guardar',
      codigo: sanitizeGuestCode(guestData.codigo),
      estado: nuevoEstado,
      confirmados: confirmados,
      mensaje: sanitizePlainText(rsvpMessage, 400)
    };

    try {
      const res = await fetch(GUEST_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8' // Clave para evitar problemas de CORS
        },
        body: JSON.stringify(datosAEnviar)
      });
      const respuesta = await res.json();
      if (respuesta.exito) {
        setRsvpFeedback({
          type: 'success',
          message: '¡Muchas gracias! Tu respuesta ha sido registrada.'
        });
        setLastSubmittedStatus(nuevoEstado);
        setLastSubmittedCount(confirmados);

        const updatedGuest: GuestData = {
          ...guestData,
          confirmados,
          estado: nuevoEstado
        };
        setGuestData(updatedGuest);
        saveStoredSession(updatedGuest, config);
      } else {
        throw new Error(respuesta.error || 'Ocurrió un error.');
      }
    } catch (err) {
      console.error('Error al guardar RSVP:', err);
      setRsvpFeedback({
        type: 'error',
        message: 'Hubo un error al guardar tu respuesta. Por favor intenta de nuevo.'
      });
    } finally {
      setIsRsvpSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh bg-[#141812] text-[#2C2C2A] flex justify-center pt-0 pb-0 px-0 sm:px-4">
      {/* Background Audio Element */}
      <audio
        ref={audioRef}
        src={config.audioUrl}
        loop
        preload="auto"
      />

      {/* =================================================================
           1) VISTA FLOTANTE INICIAL (PANTALLA DE ACCESO CON CÓDIGO - SIN NADA DETRÁS)
           ================================================================= */}
      {!isUnlocked && (
        <div
          id="pantalla-acceso"
          className="fixed inset-0 w-full h-dvh bg-[#141812] flex items-center justify-center p-5 select-none animate-fade-in z-50 overflow-y-auto"
        >
          <div className="relative w-full max-w-[380px] my-auto shadow-torn-paper">
            <div className="relative px-6 sm:px-8 pt-8 pb-9 text-center flex flex-col items-center w-full">
              {/* Textura de papel artesanal idéntica a la sección de álbum compartido */}
              <img
                src={IMAGES.papel4}
                alt="Papel artesanal"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />

              <div className="relative z-10 w-full flex flex-col items-center">
                {/* Sello de cera artesanal */}
                <div className="w-16 h-16 mb-2 flex items-center justify-center">
                  <img
                    src={IMAGES.selloCera}
                    alt={`Sello de boda ${config.novios.monograma}`}
                    className="w-full h-full object-contain filter drop-shadow-md"
                  />
                </div>

                {/* Título en tipografía clásica (estilo sugerencia de regalos) */}
                <h2 className="font-serif text-[18px] sm:text-[20px] tracking-[0.24em] text-[#3A4436] uppercase font-normal leading-snug">
                  Bienvenido a<br />
                  <span className="text-[20px] sm:text-[22px] tracking-[0.28em] font-medium">Nuestra Boda</span>
                </h2>

                <div className="my-3 flex items-center justify-center gap-2">
                  <span className="h-[1px] w-10 bg-[#C5A059]/40"></span>
                  <span className="text-[#5A1E28] text-xs">✦</span>
                  <span className="h-[1px] w-10 bg-[#C5A059]/40"></span>
                </div>

                {/* Mensaje descriptivo */}
                <p className="font-serif italic text-[13.5px] sm:text-[14.5px] text-[#2C2C2A]/85 leading-relaxed max-w-[270px] mx-auto mb-4">
                  Ingresa el código que te enviamos para ver tus pases:
                </p>

                {/* Marco de tarjeta impresa (sin fondo plano, dejando ver el papel artesanal como en sugerencia de regalos) */}
                <form onSubmit={handleValidateCode} className="w-full border border-[#3A4436]/30 rounded-2xl p-4 sm:p-5 space-y-4">
                  <div className="text-center">
                    <span className="font-serif italic text-[11px] text-[#5C6B57] block mb-2">
                      Código de invitado
                    </span>
                    <input
                      type="text"
                      id="codigo-input"
                      value={accessCode}
                      onChange={(e) => {
                        setAccessCode(e.target.value.toUpperCase());
                        if (accessError) setAccessError(null);
                      }}
                      placeholder={config.rsvp.codigoEjemploPlaceholder}
                      maxLength={14}
                      className="w-full font-serif uppercase tracking-[0.25em] text-[19px] sm:text-[21px] font-semibold text-center py-2 px-3 bg-[#ECE7DF]/75 border border-[#3A4436]/30 rounded-xl text-[#2C2C2A] placeholder:text-[#2C2C2A]/35 focus:outline-none focus:border-[#5A1E28] focus:bg-[#ECE7DF] transition-all"
                    />
                  </div>

                  {accessError && (
                    <p id="error" className="font-serif italic text-[12px] text-[#8A2525] animate-fade-in leading-snug">
                      {accessError}
                    </p>
                  )}

                  <button
                    type="submit"
                    id="btn-consultar"
                    disabled={isAccessLoading || !accessCode.trim()}
                    className="btn-tactile w-full py-2.5 rounded-full bg-[#22281F] text-[#F7F4EE] hover:bg-[#5C6B57] font-serif uppercase tracking-[0.18em] text-[11px] sm:text-xs font-medium transition-all active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
                  >
                    {isAccessLoading ? 'Consultando...' : 'Entrar'}
                  </button>
                </form>

                {/* Frase final */}
                <p className="font-serif italic text-[12px] text-[#3A4436]/75 mt-4 tracking-wide">
                  {config.novios.el && config.novios.ella
                    ? `${config.novios.el} & ${config.novios.ella}${config.fecha.textoCorto ? ` · ${config.fecha.textoCorto}` : ''}`
                    : 'Invitación Exclusiva'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
           2) INVITACIÓN PRINCIPAL (SE MUESTRA SOLO TRAS VALIDAR EL CÓDIGO)
           ================================================================= */}
      {isUnlocked && (
        <main id="pantalla-invitacion" className="w-full max-w-[480px] bg-[#ECE7DF] shadow-[0_25px_80px_rgba(0,0,0,0.65)] relative overflow-hidden flex flex-col animate-fade-in">

        {/* =================================================================
             SECCIÓN 1: HERO (foto_cover_clean + Marco Verde Oval + Iniciales)
        {/* ================================================================= */}
        <section 
          id="hero-invitation"
          className="relative w-full h-[110svh] sm:!h-auto overflow-hidden select-none bg-[#2C3426] flex items-center justify-center flex-shrink-0"
          style={heroMobileHeight && typeof window !== 'undefined' && window.innerWidth < 640 ? { height: `${heroMobileHeight}px` } : undefined}
        >
          {/* Contenedor proporcional centrado que llena la altura en celular sin deformar */}
          <div 
            className="h-full w-auto absolute left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 sm:w-full sm:h-auto overflow-hidden flex-shrink-0"
            style={{ aspectRatio: '1149 / 1951' }}
          >
            {/* Base Hero Frame Background: foto_cover_clean.jpg */}
            <img 
              src={IMAGES.heroCover} 
              alt="Cubierta de invitación fina con marco barroco verde" 
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none select-none"
            />

          {/* Oval Cutout Area inside the Ornate Baroque Green Frame */}
          {/* Exact measured relative bounds: left 26.8%, top 15.2%, width 46.4%, height 39.4% */}
          <div 
            className="absolute z-10 overflow-hidden"
            style={{
              left: '26.8%',
              top: '15.2%',
              width: '46.4%',
              height: '39.5%',
              clipPath: 'ellipse(49.8% 49.8% at 50% 50%)'
            }}
          >
            {/* Foto de dos personas con efecto de aparición de alejamiento (zoom-out) */}
            <div className="w-full h-full relative overflow-hidden bg-[#2C3426]">
              <img 
                src={IMAGES.heroFotoPareja}
                alt={`Foto de ${config.novios.nombresJuntos}`}
                draggable={false}
                onLoad={() => setHeroAnimated(true)}
                className={`w-full h-full object-cover object-center select-none ${
                  heroAnimated ? 'animate-zoom-out-appear' : 'scale-125 opacity-0'
                }`}
              />

              {/* Sombra sutil interna tipo viñeta para integrar con el relieve del marco */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(0,0,0,0) 55%, rgba(30,36,26,0.3) 85%, rgba(18,22,15,0.6) 100%)'
                }}
              />
              
            </div>
          </div>

          {/* Contenido inferior de la cubierta: Fecha + Reproduce Nuestra Canción (fijado bajo el marco barroco) */}
          <div className="absolute top-[65.5%] inset-x-0 z-20 flex flex-col items-center text-center px-4 sm:px-6">
            
            {/* Fecha en tipografía Serif clásica con alto espaciado (permanece estrictamente debajo del marco) */}
            <p className="font-serif text-[#F7F4EE] text-2xl sm:text-3xl md:text-4xl tracking-[0.14em] font-light drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
              {config.fecha.textoCorto}
            </p>

            {/* Texto "REPRODUCE NUESTRA CANCIÓN" */}
            <p className="font-serif text-[#E3DCD2] text-[11px] sm:text-[13px] tracking-[0.26em] uppercase mt-7 sm:mt-5 mb-2.5 sm:mb-2.5 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)] leading-relaxed text-center">
              Reproduce<br />Nuestra Canción
            </p>

            {/* Botón Táctil de Audio con Ondas de Sonido */}
            <div className="relative flex items-center justify-center">
              {isPlaying && (
                <div className="absolute w-14 h-14 sm:w-16 sm:h-16 rounded-full border border-[#C5A059]/60 animate-audio-wave pointer-events-none" />
              )}
              <button 
                onClick={toggleAudio}
                aria-label={isPlaying ? "Pausar nuestra canción" : "Reproducir nuestra canción"}
                className="btn-tactile w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-gradient-to-b from-[#4A5544]/90 to-[#2A3425]/95 text-[#F7F4EE] border-2 border-[#C5A059]/70 shadow-[0_8px_20px_rgba(0,0,0,0.45)] flex items-center justify-center cursor-pointer hover:border-[#F7F4EE] focus:outline-none"
              >
                {isPlaying ? (
                  <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5 fill-current" viewBox="0 0 24 24">
                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 ml-0.5 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                )}
              </button>
            </div>

            <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.18em] text-[#C5A059] uppercase mt-1 sm:mt-1.5 drop-shadow">
              {audioStatus}
            </span>

            {/* Indicador sutil de deslizamiento */}
            <div className="mt-3 sm:mt-4 animate-bounce opacity-80 flex flex-col items-center">
              <span className="text-[9px] sm:text-[10px] font-sans tracking-[0.2em] text-[#F7F4EE]/70 uppercase">
                Desliza hacia abajo
              </span>
              <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#C5A059] mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          </div>
        </section>

        {/* =================================================================
             CUERPO DE LA INVITACIÓN POST-HERO CON FONDO TEXTURIZADO CONTINUO (imagen_fondo)
             ================================================================= */}
        <div 
          id="invitacion-cuerpo"
          className="relative w-full flex flex-col"
          style={{
            backgroundImage: `url('${IMAGES.fondoContinuo}')`,
            backgroundRepeat: 'repeat-y',
            backgroundSize: '100% auto',
            backgroundColor: '#ECE7DF'
          }}
        >
          <div className="w-full flex justify-center relative z-10">
            <img 
              src={IMAGES.sombraHero}
              alt="Sombra" 
              className="w-4/5 h-auto opacity-70" 
            />
          </div>

        {/* =================================================================
             SECCIÓN 2: SOBRE ABIERTO + CARTA DE BIENVENIDA (NOS CASAMOS)
             ================================================================= */}
        <section className="relative z-20 px-5 pt-12 flex flex-col items-center">
          
          <div className="w-full max-w-[360px] relative">
            {/* Contenedor del Sobre Abierto Realista */}
            <div className="w-full relative z-10 flex justify-center -mb-10 reveal-item">
              {/* Capa 1: Fondo del sobre con la solapa interior y trasera */}
              <img
                src={IMAGES.sobreAbiertoFondo}
                alt="Sobre abierto fondo"
                className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] block select-none"
              />

              {/* Capa 2: Frente del sobre con solapas y bolsillo frontal exactamente superpuesto */}
              <img
                src={IMAGES.sobreAbiertoFrente}
                alt="Sobre abierto frente"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
              />
            </div>

            {/* Tarjeta de Papel Rasgado que emerge del sobre */}
            <div className="shadow-torn-paper -mt-[130px] mx-2 relative z-20 reveal-item">
              {/* Sello de Cera Verde Salvia colocado a caballo exactamente en el borde superior del tarjetón */}
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 w-20 h-20 z-30 wax-seal-anim">
                <img
                  src={IMAGES.selloCera}
                  alt={`Sello de cera ${config.novios.monograma}`}
                  className="w-full h-full object-contain filter drop-shadow-md"
                />
              </div>

              <div className="relative px-7 sm:px-9 pt-14 pb-16 sm:pb-20 text-center">
                {/* Imagen del papel */}
                <img 
                  src={IMAGES.papel3Clean} 
                  alt="Tarjetón de papel artesanal rasgado" 
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0 filter drop-shadow-[0_16px_28px_rgba(20,24,18,0.22)]"
                />

                {/* Flor prensada romántica en la esquina (flor_9aee3096.png) */}
                <img 
                  src={IMAGES.florPrensada} 
                  alt="Flor prensada" 
                  className="absolute -top-2 -right-1 w-16 h-32 object-contain opacity-85 pointer-events-none rotate-12 z-10"
                />

                <div className="relative z-10">                
                  {/* Mensaje de amor & bendición de los padres */}
                  <p className="font-serif italic text-base text-[#2C2C2A]/90 leading-relaxed max-w-xs mx-auto mb-6">
                    “{config.novios.frase}”
                  </p>

                  <p className="font-display text-[11px] tracking-[0.3em] text-[#5C6B57] uppercase mb-4 font-semibold">
                    Nuestra Boda
                  </p>

                  {/* Nombres Caligráficos de los Novios */}
                  <div className="my-4">
                    <h1 className="font-script text-6xl text-[#2C2C2A] leading-tight">
                      {config.novios.el}
                    </h1>
                    <span className="text-3xl text-[#5A1E28] block my-0.5">&amp;</span>
                    <h1 className="font-script text-6xl text-[#2C2C2A] leading-tight">
                      {config.novios.ella}
                    </h1>
                  </div>

                  {/* Separador fino de oro */}
                  <div className="flex items-center justify-center gap-3 my-6">
                    <span className="h-[1px] w-14 bg-[#C5A059]/50"></span>
                    <span className="text-[#5A1E28] text-xs">✦</span>
                    <span className="h-[1px] w-14 bg-[#C5A059]/50"></span>
                  </div>
                  <p className="font-display text-[11px] tracking-[0.3em] text-[#5C6B57] uppercase mb-4 font-semibold">
                    Con la bendición de nuestros padres:
                  </p>
                  {/* Nombres de los Padres en dos columnas */}
                  <div className="grid grid-cols-2 gap-x-2 sm:gap-x-4 max-w-[340px] mx-auto py-1 text-center reveal-item reveal-delay-1">
                    <div className="space-y-1 sm:space-y-1.5">
                      <p className="font-serif text-[13px] sm:text-[14.5px] font-medium text-[#2C2C2A] leading-tight">
                        {config.padres.columna1[0]}
                      </p>
                      <p className="font-serif text-[13px] sm:text-[14.5px] font-medium text-[#2C2C2A] leading-tight">
                        {config.padres.columna1[1]}
                      </p>
                    </div>
                    <div className="space-y-1 sm:space-y-1.5">
                      <p className="font-serif text-[13px] sm:text-[14.5px] font-medium text-[#2C2C2A] leading-tight">
                        {config.padres.columna2[0]}
                      </p>
                      <p className="font-serif text-[13px] sm:text-[14.5px] font-medium text-[#2C2C2A] leading-tight">
                        {config.padres.columna2[1]}
                      </p>
                    </div>
                  </div>

                  <p className="font-serif italic text-sm text-[#2C2C2A]/80 mt-5 reveal-item reveal-delay-2">
                    "{config.novios.invitacionCarta}"
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 3: MEDALLÓN BARROCO DE FECHA (papel6_03599585.png) & CUENTA REGRESIVA
             ================================================================= */}
        <section className="relative z-10 px-5 -mt-10 pb-8 flex flex-col items-center">
          <div className="w-full max-w-[360px] relative flex flex-col items-center">
            
            {/* Papel manuscrito decorativo detrás del medallón y bajo la carta de bienvenida (Ref 1) */}
            <img
              src={IMAGES.papelDecoracion1}
              alt=""
              aria-hidden="true"
              className="absolute -top-6 right-1 sm:right-0 w-42 sm:w-46 h-auto object-contain pointer-events-none select-none z-0 rotate-[2deg] opacity-95"
            />

            {/* Flor prensada decorativa asomando detrás del lado izquierdo de la cuenta regresiva */}
            <img
              src={IMAGES.florPrensada}
              alt=""
              aria-hidden="true"
              className="absolute bottom-6 -left-5 sm:-left-6 w-20 sm:w-22 h-auto object-contain pointer-events-none select-none z-0 -rotate-[24deg] opacity-90 drop-shadow-sm"
            />

            {/* Medallón Barroco Terracota con texturas talladas en 3D (papel6_03599585.png) */}
            <div className="relative z-20 w-96 h-96 -mt-6 flex items-center justify-center shadow-cameo pointer-events-none reveal-item">
              {/* Imagen del camafeo real con relieve */}
              <img 
                src={IMAGES.papel6Medallon} 
                alt="Camafeo barroco de fecha en terracota" 
                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-lg select-none"
              />

              {/* Texto dentro del Camafeo Barroco */}
              <div className="relative z-10 text-center text-[#F9F6F0] px-8 pt-2 select-none">
                <p className="font-script text-4xl text-[#D8A7B1] mb-1">
                  {config.fecha.mes}
                </p>
                <p className="font-display text-6xl sm:text-7xl font-bold tracking-tight text-[#F9F6F0] leading-none my-1 drop-shadow-md">
                  {config.fecha.dia}
                </p>
                <p className="font-display text-sm tracking-[0.35em] text-[#C5A059] uppercase mt-2 font-semibold">
                  {config.fecha.anio}
                </p>
              </div>
            </div>

            {/* Tarjeta de Cuenta Regresiva de Papel Rasgado superpuesta debajo */}
            <div className="relative z-10 w-full -mt-16 shadow-torn-paper reveal-item">
              <div className="relative z-10 px-6 py-10 text-center">
                {/* Imagen del papel */}
                <img 
                  src={IMAGES.papel3CleanRotated} 
                  alt="Tarjetón de papel artesanal rasgado" 
                  className="absolute inset-0 w-full h-full inset-0 object-fill pointer-events-none select-none z-10 filter drop-shadow-[0_16px_28px_rgba(20,24,18,0.22)]"
                />
                
                <p className="relative z-20 font-script text-3xl text-[#5A1E28] mb-2 font-normal">
                  Faltan
                </p>

                {/* Contador regresivo con numerales tabulares */}
                <div className="relative z-20 grid grid-cols-4 gap-2 tabular-nums max-w-xs mx-auto">
                  <div className="py-2">
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2C2A] block leading-none">
                      {String(countdown.days).padStart(2, '0')}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#5C6B57] font-semibold mt-1 block">
                      Días
                    </span>
                  </div>
                  <div className="py-2">
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2C2A] block leading-none">
                      {String(countdown.hours).padStart(2, '0')}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#5C6B57] font-semibold mt-1 block">
                      Horas
                    </span>
                  </div>
                  <div className="py-2">
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2C2A] block leading-none">
                      {String(countdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#5C6B57] font-semibold mt-1 block">
                      Minutos
                    </span>
                  </div>
                  <div className="py-2">
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2C2A] block leading-none">
                      {String(countdown.seconds).padStart(2, '0')}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#5C6B57] font-semibold mt-1 block">
                      Segundos
                    </span>
                  </div>
                </div>

                {/* Botón para agendar en Google Calendar */}
                <div className="mt-5 relative z-20 flex justify-center">
                  <a 
                    href={generateGoogleCalendarUrl(
                      `Boda ${config.novios.el} & ${config.novios.ella}`,
                      `Celebración del matrimonio de ${config.novios.el} y ${config.novios.ella}`,
                      config.lugares.ceremonia.nombre,
                      config.fecha.iso,
                      config.fecha.isoFin
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-tactile inline-flex items-center gap-1.5 font-sans text-[10px] tracking-[0.16em] uppercase text-[#5C6B57] font-semibold hover:text-[#5A1E28]"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Agendar en Google Calendar</span>
                  </a>
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 4: FOTOGRAFÍA DE PAREJA (Carrusel Polaroid de 5 fotos con alejamiento lento)
             ================================================================= */}
        <section className="relative z-40 px-5 py-6">
          <div className="w-full max-w-[400px] mx-auto relative reveal-item">

            {/* Foto enmarcada en papel artesanal real */}
            <div className="relative z-10 transform -rotate-0.5 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.22)]">
              {/* Imagen del Papel Artesanal Real (papel1_14fb074a.png) como fondo del contenedor */}
              <img
                src={IMAGES.papel1Limpio}
                alt="Contenedor de papel artesanal"
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />

              {/* Contenido sobre el papel */}
              <div className="relative z-10 px-8 pt-7 pb-9 pt-9 sm:px-9 sm:pt-8 sm:pb-10 sm:pt-10 flex flex-col">
                {/* Marco fotográfico con carrusel de alejamiento lento (Ken Burns zoom-out en bucle continuo) */}
                <div className="w-full h-84 sm:h-94 overflow-hidden rounded-xs relative bg-[#1D211A] select-none pointer-events-none shadow-md border border-[#C5A059]/25">
                  {POLAROID_CAROUSEL_PHOTOS.map((photo, idx) => {
                    const isActive = idx === polaroidIdx;
                    return (
                      <div
                        key={photo.src}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                          }`}
                      >
                        <img
                          key={isActive ? `polaroid-active-${idx}` : `polaroid-idle-${idx}`}
                          src={photo.src}
                          alt={photo.alt}
                          draggable={false}
                          className={`w-full h-full object-cover object-top select-none pointer-events-none ${isActive ? 'animate-polaroid-zoomout' : 'scale-100'
                            }`}
                          loading="eager"
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Frase poética que transiciona suavemente con cada foto sobre el papel */}
                <div className="relative min-h-[48px] sm:min-h-[52px] flex items-center justify-center mt-6 sm:mt-8 px-3">
                  {POLAROID_CAROUSEL_PHOTOS.map((photo, idx) => (
                    <p
                      key={photo.src}
                      className={`font-script text-2xl sm:text-[26px] text-center text-[#2C2C2A] absolute inset-x-0 transition-all duration-700 leading-snug ${idx === polaroidIdx
                        ? 'opacity-100 translate-y-0 scale-100'
                        : 'opacity-0 translate-y-2 scale-95 pointer-events-none'
                        }`}
                    >
                      {photo.caption}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
             SECCIÓN 5: LUGAR DE LA IGLESIA Y LA RECEPCIÓN (Papel Artesanal papel4 & Grabados Finos)
             ================================================================= */}
        <section className="relative z-30 px-5 py-8">
          
          {/* Contenedor de Ceremonia con decoración de estampilla caligráfica conectando con la foto superior (Ref 2) */}
          <div className="w-full max-w-[360px] sm:max-w-[385px] mx-auto relative mb-10 reveal-item">
            
            {/* Papel de estampilla caligráfica (papel_decoracion_2) detrás entre la Polaroid y Ceremonia (Ref 2) */}
            <img
              src={IMAGES.papelDecoracion2}
              alt=""
              aria-hidden="true"
              className="absolute -top-28 -left-5 sm:-left-6 w-72 sm:w-80 h-auto object-contain pointer-events-none select-none z-0 -rotate-1 opacity-95"
            />

            {/* Flor prensada asomando entre Ceremonia y Recepción por el borde derecho */}
            <img
              src={IMAGES.florPrensada}
              alt=""
              aria-hidden="true"
              className="absolute -bottom-14 -right-4 sm:-right-6 w-22 sm:w-26 h-auto object-contain pointer-events-none select-none z-0 rotate-[20deg] opacity-90 drop-shadow-sm"
            />

            {/* Tarjeta 1: CEREMONIA RELIGIOSA */}
            <div className="w-full relative z-10 drop-shadow-[0_16px_32px_rgba(0,0,0,0.22)]">

              {/* Sello de cera verde superior fijando la hoja de itinerario */}
              <div className="absolute -top-3 -left-1 w-20 h-20 z-30 rotate-[-6deg] pointer-events-none select-none drop-shadow-md">
                <img 
                  src={IMAGES.selloCera} 
                  alt={`Sello ${config.novios.monograma}`}
                  className="w-full h-full object-contain"
                />
              </div>
              {/* Imagen del Papel Artesanal (papel4_97b148ae.png) como fondo del contenedor */}
              <img 
                src={IMAGES.papel4} 
                alt="Papel artesanal Ceremonia" 
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />

              {/* Contenido sobre el papel siguiendo la proporción y tipografía de referencia */}
              <div className="relative z-10 px-7 pt-10 pb-11 sm:px-9 sm:pt-12 sm:pb-12 text-center flex flex-col items-center">
                {/* Título: CEREMONIA RELIGIOSA en serifa clásica espaciada */}
                <h3 className="font-serif text-[#4F5E46] tracking-[0.24em] text-base sm:text-[17px] uppercase font-light leading-snug">
                  CEREMONIA<br />RELIGIOSA
                </h3>

                {/* Grabado arquitectónico auténtico del Templo */}
                <div className="w-full max-w-[240px] sm:max-w-[260px] my-5 flex justify-center">
                  <img 
                    src={IMAGES.sketchIglesia} 
                    alt={config.lugares.ceremonia.nombre}
                    className="w-full h-auto object-contain mix-blend-multiply opacity-90"
                  />
                </div>

                {/* Hora en números romanos con estilo editorial */}
                <p className="font-serif text-lg sm:text-xl font-normal text-[#384632] tracking-wide mb-1">
                  {config.lugares.ceremonia.hora}
                </p>

                {/* Nombre de la iglesia y localidad en caligrafía cursiva fluida */}
                <div className="mb-6 space-y-0.5">
                  <p className="font-script text-2xl sm:text-[27px] text-[#2C3827] leading-tight">
                    {config.lugares.ceremonia.nombre}
                  </p>
                  {config.lugares.ceremonia.localidad && (
                    <p className="font-script text-xl sm:text-2xl text-[#3E4E39] leading-tight">
                      {config.lugares.ceremonia.localidad}
                    </p>
                  )}
                </div>

                {/* Botón verde oliva redondeado para Ver Ubicación */}
                <button 
                  onClick={() => setActiveMapModal({
                    title: config.lugares.ceremonia.nombre,
                    embedUrl: config.lugares.ceremonia.embedUrl,
                    mapsUrl: config.lugares.ceremonia.mapsUrl
                  })}
                  className="btn-tactile bg-[#4E6136] hover:bg-[#41522D] text-white font-serif text-[13px] sm:text-[14px] tracking-wider px-7 py-2.5 sm:px-8 sm:py-2.5 rounded-[9px] shadow-[0_4px_12px_rgba(78,97,54,0.35)] hover:shadow-[0_6px_16px_rgba(78,97,54,0.45)] transition-all duration-300 cursor-pointer inline-flex items-center justify-center underline underline-offset-3 decoration-white/75"
                >
                  Ver ubicación
                </button>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: LA RECEPCIÓN */}
          <div className="w-full max-w-[360px] sm:max-w-[385px] mx-auto relative z-10 drop-shadow-[0_16px_32px_rgba(0,0,0,0.22)] reveal-item">
            {/* Imagen del Papel Artesanal (papel4_97b148ae.png) como fondo del contenedor */}
            <img 
              src={IMAGES.papel4} 
              alt="Papel artesanal Recepción" 
              className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
            />

            {/* Contenido sobre el papel siguiendo la proporción y tipografía de referencia */}
            <div className="relative z-10 px-7 pt-10 pb-11 sm:px-9 sm:pt-12 sm:pb-12 text-center flex flex-col items-center">
              {/* Título: RECEPCIÓN en serifa clásica espaciada */}
              <h3 className="font-serif text-[#4F5E46] tracking-[0.24em] text-base sm:text-[17px] uppercase font-light leading-snug">
                {config.lugares.recepcion.titulo}
              </h3>

              {/* Grabado arquitectónico auténtico de La Casona */}
              <div className="w-full max-w-[270px] sm:max-w-[290px] my-5 flex justify-center">
                <img 
                  src={IMAGES.sketchRecepcion} 
                  alt={config.lugares.recepcion.nombre}
                  className="w-full h-auto object-contain mix-blend-multiply opacity-90"
                />
              </div>

              {/* Hora en números romanos con estilo editorial */}
              <p className="font-serif text-lg sm:text-xl font-normal text-[#384632] tracking-wide mb-1">
                {config.lugares.recepcion.hora}
              </p>

              {/* Nombre de la recepción en caligrafía cursiva fluida */}
              <div className="mb-6 space-y-0.5">
                <p className="font-script text-2xl sm:text-[27px] text-[#2C3827] leading-tight">
                  {config.lugares.recepcion.nombre}
                </p>
                {config.lugares.recepcion.localidad && (
                  <p className="font-script text-xl sm:text-2xl text-[#3E4E39] leading-tight">
                    {config.lugares.recepcion.localidad}
                  </p>
                )}
              </div>

              {/* Botón verde oliva redondeado para Ver Ubicación */}
              <button 
                onClick={() => setActiveMapModal({
                  title: config.lugares.recepcion.nombre,
                  embedUrl: config.lugares.recepcion.embedUrl,
                  mapsUrl: config.lugares.recepcion.mapsUrl
                })}
                className="btn-tactile bg-[#4E6136] hover:bg-[#41522D] text-white font-serif text-[13px] sm:text-[14px] tracking-wider px-7 py-2.5 sm:px-8 sm:py-2.5 rounded-[9px] shadow-[0_4px_12px_rgba(78,97,54,0.35)] hover:shadow-[0_6px_16px_rgba(78,97,54,0.45)] transition-all duration-300 cursor-pointer inline-flex items-center justify-center underline underline-offset-3 decoration-white/75"
              >
                Ver ubicación
              </button>
            </div>
          </div>

        </section>

        {/* =================================================================
             SECCIÓN 6: ITINERARIO EN LÍNEA DE TIEMPO VERTICAL (papel3_clean)
             ================================================================= */}
        <section className="relative z-20 px-5 py-6">
          <div className="w-full max-w-[360px] sm:max-w-[385px] mx-auto relative">
            
            {/* Papel de estampilla caligráfica (papel_decoracion_2) detrás del Itinerario asomando a ambos lados (Ref 3) */}
            <img
              src={IMAGES.papelDecoracion1}
              alt=""
              aria-hidden="true"
              className="absolute -top-50 left-1/2  w-[50%] max-w-[420px] h-auto object-contain pointer-events-none select-none z-0 opacity-95"
            />

            {/* Flor prensada asomando detrás de la esquina inferior derecha del Itinerario (Ref 3) */}
            <img
              src={IMAGES.florPrensada}
              alt=""
              aria-hidden="true"
              className="absolute bottom-8 -right-4 sm:-right-5 w-24 sm:w-28 h-auto object-contain pointer-events-none select-none z-0 rotate-[18deg] opacity-95 drop-shadow-sm"
            />

            {/* Sello de cera verde superior fijando la hoja de itinerario */}
            <div className="w-20 h-20 mx-auto -mb-15 relative z-30 wax-seal-anim">
              <img 
                src={IMAGES.selloCera} 
                alt={`Sello ${config.novios.monograma}`}
                className="w-full h-full object-contain filter drop-shadow-md"
              />
            </div>

            {/* Hoja de Itinerario en papel artesanal real vertical (papel3_clean.png) */}
            <div className="w-[88%] sm:w-[86%] mx-auto relative z-10 drop-shadow-[0_16px_32px_rgba(20,24,18,0.22)] reveal-item">
              {/* Imagen de fondo papel3_clean vertical */}
              <img 
                src={IMAGES.papel3Clean} 
                alt="Papel artesanal Itinerario" 
                className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none select-none"
              />

              {/* Contenido sobre el papel */}
              <div className="relative z-10 px-4 pt-14 pb-12 sm:px-6 sm:pt-16 sm:pb-14">
                
                {/* Título: ITINERARIO */}
                <h3 className="font-serif tracking-[0.26em] text-base sm:text-[17px] uppercase font-normal text-[#384831] text-center mb-7 sm:mb-8">
                  ITINERARIO
                </h3>

                {/* Línea de tiempo vertical: cada momento viene desde config.itinerario y aparece progresivamente */}
                <div className="flex flex-col">
                  {config.itinerario.map((event, idx, arr) => {
                    const isFirst = idx === 0;
                    const isLast = idx === arr.length - 1;
                    return (
                      <div key={idx} className="grid grid-cols-[1.2fr_34px_1.05fr] items-center min-h-[74px] sm:min-h-[82px] reveal-item">
                        {/* Columna 1: Iconos sustancialmente más grandes y alineados hacia el eje */}
                        <div className="flex items-center justify-end pr-2.5 sm:pr-3.5">
                          <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-end">
                            <img
                              src={event.iconoSrc}
                              alt={event.alt}
                              className={
                                event.variant === 'wide-flipped'
                                  ? 'w-18 h-10 sm:w-20 sm:h-11 object-contain opacity-90 rotate-y-180'
                                  : event.variant === 'wide'
                                    ? 'w-18 h-10 sm:w-20 sm:h-11 object-contain opacity-90'
                                    : 'w-16 h-16 sm:w-18 sm:h-18 object-contain filter drop-shadow-xs'
                              }
                            />
                          </div>
                        </div>

                        {/* Columna 2: Eje vertical centrado con conector horizontal de topes */}
                        <div className="w-8.5 h-full flex items-center justify-center relative">
                          <svg className="w-full h-full overflow-visible" viewBox="0 0 34 80" preserveAspectRatio="none">
                            {/* Línea vertical superior */}
                            {!isFirst && (
                              <line x1="17" y1="0" x2="17" y2="40" stroke="#5C6E52" strokeWidth="1.3" />
                            )}
                            {/* Línea vertical inferior */}
                            {!isLast && (
                              <line x1="17" y1="40" x2="17" y2="80" stroke="#5C6E52" strokeWidth="1.3" />
                            )}
                            {/* Marca horizontal con topes verticales en los extremos */}
                            <line x1="3" y1="40" x2="31" y2="40" stroke="#5C6E52" strokeWidth="1.3" />
                            <line x1="3" y1="34" x2="31" y2="34" stroke="#5C6E52" strokeWidth="1.3" />
                            <line x1="31" y1="34" x2="31" y2="46" stroke="#5C6E52" strokeWidth="1.3" />
                          </svg>
                        </div>

                        {/* Columna 3: Hora y Nombre del evento compactos, sin ocupar demasiado ancho hacia la derecha */}
                        <div className="flex flex-col justify-center pl-2.5 sm:pl-3.5 py-1 text-left max-w-[125px] sm:max-w-[140px]">
                          <p className="font-serif text-[15px] sm:text-[16px] font-medium text-[#384831] leading-tight tracking-wide">
                            {event.hora}
                          </p>
                          <p className="font-serif text-[12.5px] sm:text-[13.5px] text-[#2C3827] leading-snug mt-0.5">
                            {event.titulo}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 7: FOTOGRAFÍA & CÓDIGO DE VESTIMENTA (papel6)
             ================================================================= */}
        <section className="relative z-20 px-5 py-8">
          <div className="w-full max-w-[360px] sm:max-w-[385px] mx-auto relative flex flex-col items-center">
            
            {/* Foto de la pareja enmarcada en papel artesanal real tipo marco/Polaroid */}
            <div className="relative w-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.22)] transform -rotate-0.5 reveal-item">
              {/* Fondo de textura de papel artesanal */}
              <img 
                src={IMAGES.papel1Limpio} 
                alt="Fondo textura papel" 
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />

              {/* Contenedor de la foto con generoso margen inferior de papel para que el camafeo descanse sobre él */}
              <div className="relative z-10 px-7 pt-7 pb-20 sm:px-8 sm:pt-8 sm:pb-24">
                <div className="w-full aspect-[4/3] overflow-hidden rounded-xs border border-[#C5A059]/25 shadow-md bg-[#232920]">
                  <img 
                    src={IMAGES.carrusel2} 
                    alt="Foto momento especial" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* Camafeo Barroco de Código de Vestimenta superpuesto exactamente sobre el marco inferior de papel */}
            <div className="relative z-20 w-115 h-115 -mt-22 sm:-mt-26 flex pt-23 justify-center shadow-cameo reveal-item">
              <img 
                src={IMAGES.papel6Medallon} 
                alt="Camafeo barroco de vestimenta" 
                className="absolute inset-0 w-full h-full object-contain filter drop-shadow-md select-none"
              />

              {/* Contenido legible y nítido centrado en la zona interior del camafeo (idéntico a imagen de referencia) */}
              <div className="relative z-10 text-center text-white px-7 pt-1 flex flex-col items-center max-w-[215px] sm:max-w-[235px]">
                {/* Título en dos líneas */}
                <p className="font-serif text-[12px] sm:text-[13px] tracking-[0.24em] uppercase text-white font-normal leading-tight text-center drop-shadow-xs">
                  CÓDIGO DE<br />VESTIMENTA
                </p>

                {/* Iconos de Traje y Vestido en blanco nítido */}
                <div className="flex justify-center items-center gap-4 my-2 text-white">
                  {/* Icono Terno / Chaqueta formal */}
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-xs" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 7 L10 4 L14 12 L18 4 L22 7 L22 23 L20 24 L14 25 L8 24 L6 23 Z" />
                    <path d="M10 4 L14 14 L18 4" />
                    <path d="M14 14 L14 25" />
                    <polygon points="13,7 15,7 15.5,12 14,14 12.5,12" fill="currentColor" />
                    <path d="M10 14 L6 23" />
                    <path d="M18 14 L22 23" />
                  </svg>

                  {/* Icono Vestido de fiesta largo */}
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-xs" viewBox="0 0 28 28" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 4 L10 8 Q14 10 18 8 L19 4" />
                    <path d="M10 8 Q14 11 18 8 L17 14 Q14 16 11 14 Z" fill="currentColor" fillOpacity="0.25" />
                    <path d="M11 14 Q8 21 6 25 Q14 26.5 22 25 Q20 21 17 14 Z" fill="currentColor" fillOpacity="0.25" />
                    <path d="M14 15 Q14 20 14 25" strokeWidth="1" strokeOpacity="0.6" />
                  </svg>
                </div>  

                {/* Categoría: ELEGANTE FORMAL */}
                <p className="font-serif text-[10px] sm:text-[11px] tracking-[0.22em] uppercase text-white font-bold my-1 drop-shadow-xs">
                  {config.vestimenta.categoria}
                </p>

                {/* Detalle de vestimenta en serifa blanca de alto contraste y excelente lectura */}
                <div className="space-y-1.5 mt-1.5 text-center w-[90%]">
                  <p className="font-serif text-[10px] sm:text-[11px] text-white leading-snug drop-shadow-xs">
                    <span className="font-semibold">Damas:</span> {config.vestimenta.damas}
                  </p>
                  <p className="font-serif text-[10px] sm:text-[11px] text-white leading-snug drop-shadow-xs">
                    <span className="font-semibold">Caballeros:</span> {config.vestimenta.caballeros}
                  </p>
                  <p className="font-serif text-[10px] sm:text-[11px] text-white leading-snug drop-shadow-xs">
                    {config.vestimenta.nota}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 8: SUGERENCIA DE REGALOS & LUNA DE MIEL
             ================================================================= */}
        <section className="relative z-10 px-5 pt-4 pb-2 -mt-30">
          <div className="w-full max-w-[360px] sm:max-w-[390px] mx-auto relative">

            {/* Papel manuscrito decorativo detrás del camafeo de vestimenta y sobre la tarjeta de regalos (Ref 4) */}
            <img
              src={IMAGES.papelDecoracion1}
              alt=""
              aria-hidden="true"
              className="absolute -top-52 right-1 sm:right-2 w-48 sm:w-52 h-auto object-contain pointer-events-none select-none z-0 rotate-[1deg] opacity-95"
            />

            {/* Flor prensada decorativa asomando en la parte inferior izquierda conectando con Álbum Compartido */}
            <img
              src={IMAGES.florPrensada}
              alt=""
              aria-hidden="true"
              className="absolute -bottom-12 -left-4 sm:-left-5 w-22 sm:w-26 h-auto object-contain pointer-events-none select-none z-0 -rotate-[22deg] opacity-90 drop-shadow-sm"
            />

            <div className="w-full relative z-10 filter drop-shadow-[0_16px_32px_rgba(20,24,18,0.24)] transform -rotate-0.5 reveal-item">
              
              {/* Imagen del Papel Artesanal Real (papel1_14fb074a_limpio.png) como contenedor */}
              <img 
                src={IMAGES.papel1Limpio} 
                alt="Contenedor de papel artesanal regalos" 
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />

              {/* Contenido sobre el papel artesanal - Estilo Tarjeta Impresa Física */}
              <div className="relative z-10 px-6 sm:px-8 pt-8 pb-9 text-center flex flex-col items-center w-full">
                
                {/* Título en tipografía clásica de imprenta fina */}
                <h3 className="font-serif text-[18px] sm:text-[20px] tracking-[0.24em] text-[#3A4436] uppercase font-normal leading-snug">
                  Sugerencia de<br />
                  <span className="text-[20px] sm:text-[22px] tracking-[0.28em] font-medium">Regalos</span>
                </h3>

                {/* Ilustración de Regalo estilo Boceto a Tinta Clásico */}
                <div className="my-3 flex justify-center items-center">
                  <svg className="w-14 h-14 text-[#3A4436]/75" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                    {/* Moño / Lazo */}
                    <path d="M 50 33 C 43 21, 30 21, 32 30 C 33 37, 46 36, 50 36 Z" />
                    <path d="M 50 33 C 57 21, 70 21, 68 30 C 67 37, 54 36, 50 36 Z" />
                    <circle cx="50" cy="34" r="2.2" />
                    {/* Tapa de la caja */}
                    <path d="M 28 36 L 72 36 L 70 44 L 30 44 Z" />
                    {/* Cinta en la tapa */}
                    <path d="M 47 36 L 47 44" />
                    <path d="M 53 36 L 53 44" />
                    {/* Cuerpo de la caja */}
                    <path d="M 32 44 L 34 75 C 34 76.5, 35.5 77.5, 37.5 77.5 L 62.5 77.5 C 64.5 77.5, 66 76.5, 66 75 L 68 44" />
                    {/* Cinta en el cuerpo */}
                    <path d="M 47 44 L 47 77.5" />
                    <path d="M 53 44 L 53 77.5" />
                    {/* Trazos sutiles de sombreado a mano */}
                    <path d="M 36 49 L 43 47" strokeWidth="0.8" opacity="0.5" />
                    <path d="M 36 57 L 43 55" strokeWidth="0.8" opacity="0.5" />
                    <path d="M 36 65 L 43 63" strokeWidth="0.8" opacity="0.5" />
                  </svg>
                </div>

                {/* Mensaje cálido impreso */}
                <p className="font-serif italic text-[13.5px] sm:text-[14.5px] text-[#2C2C2A]/85 leading-relaxed max-w-[270px] mx-auto mb-4">
                  {config.banco.mensaje}
                </p>

                {/* Marco de tarjeta impresa con aparición fluida */}
                <div className="w-full border border-[#3A4436]/30 rounded-2xl p-4 sm:p-5 space-y-4 reveal-item reveal-delay-1">
                  
                  {/* Banco de Crédito del Perú (BCP) */}
                  <div className="text-center pb-3 border-b border-[#3A4436]/15">
                    <h4 className="font-serif uppercase tracking-[0.16em] text-[12.5px] sm:text-[13.5px] text-[#2C3328] font-semibold mb-2.5">
                      {config.banco.nombreBanco}
                    </h4>

                    {/* Número de cuenta */}
                    <div className="mb-2.5">
                      <span className="font-serif italic text-[11px] text-[#5C6B57] block">
                        Número de cuenta
                      </span>
                      <p className="font-serif italic text-[11px] text-[#5C6B57] mt-0.5">
                        Titular: <span className="not-italic text-[#2C2C2A] font-medium">{config.banco.titularBcp}</span>
                      </p>
                      <p className="font-serif text-[15px] sm:text-base font-medium tracking-wider text-[#2C2C2A] select-all my-0.5">
                        {config.banco.bcp}
                      </p>
                      <button
                        onClick={() => handleCopyField(config.banco.bcp, "Número de cuenta BCP", "bcp")}
                        className="mt-0.5 inline-flex items-center gap-1 px-3 py-0.5 rounded-full border border-[#3A4436]/25 hover:border-[#3A4436]/60 text-[9px] tracking-[0.14em] font-serif uppercase text-[#3A4436]/80 hover:text-[#3A4436] transition-all bg-transparent cursor-pointer active:scale-95"
                      >
                        {copiedField === 'bcp' ? (
                          <span className="text-[#5A1E28] font-semibold italic">✓ Copiado</span>
                        ) : (
                          <span>Copiar cuenta</span>
                        )}
                      </button>
                    </div>

                    {/* Número de cuenta interbancaria (CCI) */}
                    <div>
                      <span className="font-serif italic text-[11px] text-[#5C6B57] block">
                        Número de cuenta interbancaria (CCI)
                      </span>
                      <p className="font-serif text-[13px] sm:text-[14px] font-medium tracking-wider text-[#2C2C2A] select-all break-all my-0.5">
                        {config.banco.cci}
                      </p>
                      <button
                        onClick={() => handleCopyField(config.banco.cci, "Cuenta interbancaria (CCI)", "cci")}
                        className="mt-0.5 inline-flex items-center gap-1 px-3 py-0.5 rounded-full border border-[#3A4436]/25 hover:border-[#3A4436]/60 text-[9px] tracking-[0.14em] font-serif uppercase text-[#3A4436]/80 hover:text-[#3A4436] transition-all bg-transparent cursor-pointer active:scale-95"
                      >
                        {copiedField === 'cci' ? (
                          <span className="text-[#5A1E28] font-semibold italic">✓ Copiado</span>
                        ) : (
                          <span>Copiar CCI</span>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Sección YAPE / PLIN */}
                  <div className="text-center pt-0.5">
                    <h4 className="font-serif uppercase tracking-[0.2em] text-[12px] sm:text-[13px] text-[#2C3328] font-semibold mb-2.5">
                      {config.banco.metodoMovilTitulo}
                    </h4>

                    <div className="space-y-3">
                      {/* Adriana Valencia León */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-serif text-[15px] sm:text-base font-medium tracking-wider text-[#2C2C2A] select-all">
                            {config.banco.yapeAdriana}
                          </span>
                          <button
                            onClick={() => handleCopyField(config.banco.yapeAdriana, `Número ${config.banco.metodoMovilTitulo} (${config.novios.ella})`, "yapeAdriana")}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#3A4436]/25 hover:border-[#3A4436]/60 text-[8.5px] tracking-[0.12em] font-serif uppercase text-[#3A4436]/80 hover:text-[#3A4436] transition-all bg-transparent cursor-pointer active:scale-95"
                          >
                            {copiedField === 'yapeAdriana' ? (
                              <span className="text-[#5A1E28] font-semibold italic">✓ Copiado</span>
                            ) : (
                              <span>Copiar</span>
                            )}
                          </button>
                        </div>
                        <p className="font-serif italic text-[11px] text-[#5C6B57] mt-0.5">
                          Titular: <span className="not-italic text-[#2C2C2A] font-medium">{config.banco.titularAdriana}</span>
                        </p>
                      </div>

                      {/* Jorge Cerón Ruiz */}
                      <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center gap-2">
                          <span className="font-serif text-[15px] sm:text-base font-medium tracking-wider text-[#2C2C2A] select-all">
                            {config.banco.yapeJorge}
                          </span>
                          <button
                            onClick={() => handleCopyField(config.banco.yapeJorge, `Número ${config.banco.metodoMovilTitulo} (${config.novios.el})`, "yapeJorge")}
                            className="inline-flex items-center px-2.5 py-0.5 rounded-full border border-[#3A4436]/25 hover:border-[#3A4436]/60 text-[8.5px] tracking-[0.12em] font-serif uppercase text-[#3A4436]/80 hover:text-[#3A4436] transition-all bg-transparent cursor-pointer active:scale-95"
                          >
                            {copiedField === 'yapeJorge' ? (
                              <span className="text-[#5A1E28] font-semibold italic">✓ Copiado</span>
                            ) : (
                              <span>Copiar</span>
                            )}
                          </button>
                        </div>
                        <p className="font-serif italic text-[11px] text-[#5C6B57] mt-0.5">
                          Titular: <span className="not-italic text-[#2C2C2A] font-medium">{config.banco.titularJorge}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Frase final de agradecimiento estilo editorial */}
                <p className="font-serif italic text-[12px] sm:text-[13px] text-[#3A4436]/80 mt-4 tracking-wide">
                  {config.banco.agradecimiento}
                </p>

              </div>

            </div>
          </div>
        </section>

        {/* =================================================================
             SECCIÓN 9: QR PARA SUBIR FOTOS
             ================================================================= */}
        <section className="relative z-20 px-5 py-8">
          <div className="max-w-[400px] mx-auto relative flex flex-col items-center">
            {/* Tarjeta con Código QR de Álbum de Fotos */}
            <div className="relative z-10 w-full shadow-torn-paper reveal-item">
              <div className="px-6 pt-8 pb-8 text-center">
                {/* Imagen de fondo de papel real */}
                <img
                  src={IMAGES.papel4}
                  alt="Contenedor de papel artesanal regalos"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
                />
                <h3 className="font-display text-sm tracking-[0.25em] text-[#5C6B57] uppercase font-semibold relative z-10">
                  {config.album.titulo}
                </h3>
                <p className="font-serif italic text-base text-[#2C2C2A]/85 mt-2 mb-4 relative z-10">
                  {config.album.descripcion}
                </p>

                {/* Código QR Generado */}
                <div className="inline-block p-3 bg-white rounded border border-[#C5A059]/40 shadow-xs my-2 relative z-10 reveal-item reveal-delay-1">
                  <img 
                    src={`${config.album.qrApiBaseUrl}?size=150x150&color=2C2C2A&bgcolor=F7F4EE&data=${encodeURIComponent(config.album.url)}`} 
                    alt="Código QR Álbum de Boda" 
                    className="w-32 h-32 mx-auto"
                  />
                </div>

                <p className="font-serif italic text-base text-[#2C2C2A]/85 mt-2 mb-4 relative z-10">
                  {config.album.instruccion}
                </p>
                               
                <div className="mt-4 mb-4 relative z-10">
                  <a 
                    href={config.album.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="btn-tactile inline-flex items-center gap-2 bg-[#22281F] text-[#F7F4EE] font-sans text-[11px] tracking-[0.18em] uppercase px-6 py-2.5 rounded-full shadow hover:bg-[#5C6B57]"
                  >
                    <span>Abrir álbum digital 📷</span>
                  </a>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 10: CONFIRMAR ASISTENCIA (RSVP) & SOBRE DE CIERRE
             ================================================================= */}
        <section className="relative z-10 px-5 pt-10 pb-16">
          <div className="max-w-[400px] mx-auto relative">
            
            {/* Papel manuscrito decorativo invertido asomando por encima y por debajo de la sección de confirmación (Ref 5) */}
            <img
              src={IMAGES.papelDecoracion1}
              alt=""
              aria-hidden="true"
              className="absolute -top-14 left-1/2 -translate-x-1/2 w-60 sm:w-64 h-auto object-contain pointer-events-none select-none z-0 rotate-180 opacity-95"
            />
            <img
              src={IMAGES.papelDecoracion1}
              alt=""
              aria-hidden="true"
              className="absolute -bottom-16 left-1/2 -translate-x-1/2 w-56 sm:w-60 h-auto object-contain pointer-events-none select-none z-0 rotate-180 opacity-90"
            />

            {/* Tarjeta de Confirmación ingresando en el sobre inferior */}
            <div className="shadow-torn-paper mx-2 relative z-20 reveal-item">
              <div className="px-6 sm:px-8 pt-8 pb-16 text-center">

                {/* tarjeta de papel real */}
                <img
                  src={IMAGES.papel3Clean}
                  alt="Contenedor de papel artesanal regalos"
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
                />

                {/* Ícono de sobre con checkmark */}
                <div className="w-8 h-8 mx-auto mb-2.5 text-[#B59359] flex items-center justify-center relative z-10">
                  <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3.5" y="5" width="17" height="14" rx="2" />
                    <path d="m3.5 6.5 8.5 6 8.5-6" />
                    <path d="m14 16 2 2 4.5-4.5" strokeWidth="1.8" />
                  </svg>
                </div>

                {/* Título en tipografía display clásica y armónica con el resto de la invitación */}
                <h3 className="relative z-10 font-display font-semibold text-sm sm:text-[15px] tracking-[0.24em] text-[#3A4436] uppercase mb-4">
                  CONFIRMA TU ASISTENCIA
                </h3>

                {/* Mensaje descriptivo en elegante serifa editorial */}
                <p className="relative z-10 font-serif text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#2C2C2A]/90 max-w-[320px] mx-auto mb-3">
                  {config.rsvp.parrafo1}
                </p>

                <p className="relative z-10 font-serif text-[14.5px] sm:text-[15.5px] leading-relaxed text-[#2C2C2A]/90 max-w-[320px] mx-auto mb-5">
                  {config.rsvp.parrafo2}
                </p>

                {/* Línea divisoria */}
                <div className="w-full h-[1px] bg-[#C5A059]/40 my-4 relative z-10"></div>

                {/* Fecha límite */}
                <p className="relative z-10 font-serif italic text-[14px] sm:text-[15px] text-[#5C6B57] mb-1">
                  Confirma tu asistencia hasta el
                </p>

                <p className="relative z-10 font-display font-semibold text-[17px] sm:text-lg tracking-wider text-[#2C2C2A] mb-2.5">
                  {config.fecha.fechaLimiteRsvp}
                </p>

                <p className="relative z-10 font-serif italic text-base sm:text-[17px] text-[#5A1E28] mb-5">
                  {config.rsvp.fraseCierre}
                </p>

                {/* Botón Confirmar que abre el modal interactivo */}
                <div className="pt-1 text-center relative z-10">
                  <button 
                    type="button"
                    onClick={() => setIsRsvpModalOpen(true)}
                    className="btn-tactile inline-flex items-center justify-center px-8 py-2.5 bg-[#22281F] text-[#F7F4EE] font-sans text-[11px] sm:text-xs font-semibold tracking-[0.2em] uppercase rounded-full shadow-[0_5px_15px_rgba(0,0,0,0.22)] hover:bg-[#5C6B57] transition-all cursor-pointer active:scale-95"
                  >
                    Confirmar
                  </button>
                </div>

              </div>
            </div>

            {/* Sobre de Cierre Inferior (sobrecerrado_3948ed67.png) */}
            <div className="w-full -mt-20 relative z-10 flex justify-center reveal-item">
              <img 
                src={IMAGES.sobreCerrado} 
                alt="Sobre de cierre" 
                className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)]"
              />

              {/* Sello de Cera verde sellando el sobre inferior */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-22 h-22 z-40 wax-seal-anim">
                <img 
                  src={IMAGES.selloCera} 
                  alt={`Sello de Cera ${config.novios.monograma}`}
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 11: MENSAJE FINAL DE DESPEDIDA & PIE DE PAPELERÍA
             ================================================================= */}
        <footer className="px-6 pt-4 pb-14 text-center relative z-20">
          <div className="reveal-item">
            <div className="flex items-center justify-center gap-3 mb-4">
              <span className="h-[1px] w-12 bg-[#5A1E28]/40"></span>
              <span className="text-[#5A1E28] text-sm">♥</span>
              <span className="h-[1px] w-12 bg-[#5A1E28]/40"></span>
            </div>

            <h2 className="font-script text-5xl text-[#2C2C2A] mb-4">
              {config.despedida.titulo}
            </h2>
          </div>

          <p className="font-serif italic text-base sm:text-lg text-[#2C2C2A]/85 max-w-md mx-auto leading-relaxed reveal-item reveal-delay-1">
            “{config.despedida.frase}”
          </p>

          <div className="reveal-item reveal-delay-2">
            <p className="font-serif italic text-sm text-[#5C6B57] mt-6">
              {config.despedida.saludo}
            </p>

            <p className="font-display text-xs sm:text-sm tracking-[0.3em] text-[#3A4436] uppercase font-semibold mt-1.5">
              {config.novios.el} &amp; {config.novios.ella}
            </p>

            <p className="text-[10px] sm:text-xs font-sans tracking-[0.25em] text-[#2C2C2A]/60 uppercase mt-3">
              {config.despedida.ubicacion}
            </p>
          </div>
        </footer>

        </div>

      </main>
      )}

      {/* =================================================================
           MODAL INTERACTIVO DE MAPA / UBICACIÓN
           ================================================================= */}
      {activeMapModal && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-[#F7F4EE] rounded-sm max-w-md w-full p-5 border border-[#C5A059]/40 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-[#C5A059]/30">
              <h4 className="font-serif font-bold text-lg text-[#2C2C2A]">{activeMapModal.title}</h4>
              <button 
                onClick={() => setActiveMapModal(null)}
                aria-label="Cerrar mapa"
                className="text-[#2C2C2A]/70 hover:text-[#5A1E28] p-1 font-bold text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 rounded overflow-hidden border border-[#C5A059]/30 shadow-inner h-64">
              <iframe 
                src={activeMapModal.embedUrl} 
                className="w-full h-full border-0" 
                loading="lazy"
                title={activeMapModal.title}
              />
            </div>

            <div className="flex justify-between items-center gap-3 pt-2">
              <a 
                href={activeMapModal.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-tactile bg-[#22281F] text-[#F7F4EE] font-sans text-xs tracking-wider uppercase px-4 py-2.5 rounded-full"
              >
                Abrir en Google Maps ↗
              </a>
              <button 
                onClick={() => setActiveMapModal(null)}
                className="btn-tactile bg-[#ECE7DF] text-[#2C2C2A] border border-[#2C2C2A]/30 font-sans text-xs tracking-wider uppercase px-4 py-2.5 rounded-full"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
           MODAL INTERACTIVO DE CONFIRMACIÓN DE ASISTENCIA (RSVP)
           ================================================================= */}
      {isRsvpModalOpen && (
        <div 
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-[#FBF9F5] rounded-2xl max-w-sm w-full p-6 border border-[#C5A059]/40 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Botón cerrar */}
            <button 
              onClick={() => setIsRsvpModalOpen(false)}
              aria-label="Cerrar confirmación"
              className="absolute top-4 right-4 text-[#2C2C2A]/60 hover:text-[#5A1E28] p-1 font-bold text-lg cursor-pointer transition-colors"
            >
              ✕
            </button>

            {/* Encabezado con datos del invitado (desde Sheet) */}
            <div className="text-center pb-3 border-b border-[#C5A059]/30">
              <div className="w-8 h-8 mx-auto mb-1 text-[#B59359] flex items-center justify-center">
                <svg className="w-7 h-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3.5" y="5" width="17" height="14" rx="2" />
                  <path d="m3.5 6.5 8.5 6 8.5-6" />
                  <path d="m14 16 2 2 4.5-4.5" strokeWidth="1.8" />
                </svg>
              </div>

              <h4 className="font-display font-semibold text-sm tracking-[0.22em] text-[#3A4436] uppercase">
                Confirmar Asistencia
              </h4>

              {/* Información traída desde el Sheet */}
              <h2 id="nombre-invitado" className="font-serif text-[17px] sm:text-[19px] font-semibold text-[#2C2C2A] mt-1.5 leading-snug">
                {guestData ? guestData.invitado : 'Cargando...'}
              </h2>

              <p id="info-pases" className="font-serif italic text-xs sm:text-[13px] text-[#5C6B57] mt-0.5">
                {guestData ? `Pases asignados: ${guestData.pases}` : ''}
              </p>
            </div>

            {/* Mensaje de feedback de confirmación */}
            {rsvpFeedback?.type === 'success' ? (
              <div className="py-4 text-center space-y-3 animate-fade-in">
                <div className="bg-[#5C6B57]/15 border border-[#5C6B57]/40 rounded-xl p-4">
                  <span className="text-2xl block mb-1">🕊️</span>
                  <p id="mensaje-feedback" className="font-serif text-[15px] font-semibold text-[#2C3328] mb-1">
                    {rsvpFeedback.message}
                  </p>
                  <p className="font-serif italic text-xs text-[#5C6B57]">
                    Estado registrado: <span className="font-medium text-[#2C2C2A]">{lastSubmittedStatus}</span>
                    {lastSubmittedStatus === 'Confirmado' && (
                      <span> ({lastSubmittedCount} {lastSubmittedCount === 1 ? 'persona' : 'personas'})</span>
                    )}
                  </p>
                </div>

                <p className="font-serif italic text-xs text-[#2C2C2A]/75">
                  Puedes modificar tu respuesta en cualquier momento durante tu visita.
                </p>

                <div className="space-y-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setRsvpFeedback(null)}
                    className="btn-tactile w-full py-2.5 rounded-full border border-[#3A4436]/35 text-[#2C2C2A] font-serif uppercase tracking-[0.16em] text-[10.5px] hover:bg-[#ECE7DF] transition-all cursor-pointer active:scale-95"
                  >
                    Modificar mi respuesta
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsRsvpModalOpen(false)}
                    className="btn-tactile w-full py-2.5 rounded-full bg-[#22281F] text-[#F7F4EE] hover:bg-[#5C6B57] font-serif uppercase tracking-[0.16em] text-[10.5px] transition-all cursor-pointer active:scale-95"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            ) : (
              /* Formulario de Confirmación */
              <form id="form-rsvp" onSubmit={handleRsvpSubmit} className="space-y-4 text-left mt-4">
                <h3 className="font-serif italic text-[14px] sm:text-[15px] text-[#2C2C2A] font-medium text-center">
                  ¿Nos acompañarás en este día tan especial?
                </h3>

                {/* Opciones de asistencia */}
                <div className="space-y-2">
                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${rsvpAttendance === 'si' ? 'bg-[#5C6B57]/12 border-[#5C6B57] text-[#2C2C2A]' : 'bg-[#ECE7DF]/70 border-[#3A4436]/20 text-[#2C2C2A]/80'}`}>
                    <input 
                      type="radio" 
                      name="asistencia" 
                      value="si" 
                      required
                      checked={rsvpAttendance === 'si'}
                      onChange={() => setRsvpAttendance('si')}
                      className="accent-[#5C6B57] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-serif text-[14.5px] font-medium">¡Sí, ahí estaré!</span>
                  </label>

                  <label className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${rsvpAttendance === 'no' ? 'bg-[#5A1E28]/10 border-[#5A1E28] text-[#2C2C2A]' : 'bg-[#ECE7DF]/70 border-[#3A4436]/20 text-[#2C2C2A]/80'}`}>
                    <input 
                      type="radio" 
                      name="asistencia" 
                      value="no" 
                      required
                      checked={rsvpAttendance === 'no'}
                      onChange={() => setRsvpAttendance('no')}
                      className="accent-[#5A1E28] w-4 h-4 cursor-pointer"
                    />
                    <span className="font-serif text-[14.5px] font-medium">No podré asistir</span>
                  </label>
                </div>

                {/* Desplegable dinámico: solo visible si tiene más de 1 pase y marca "Sí" */}
                {rsvpAttendance === 'si' && (guestData?.pases ?? 0) > 1 && (
                  <div id="contenedor-desplegable" className="mt-3 text-left animate-fade-in">
                    <label htmlFor="select-pases" className="font-serif italic text-[12px] sm:text-[13px] text-[#5C6B57] block mb-1">
                      ¿Cuántas personas asistirán?
                    </label>
                    <select 
                      id="select-pases"
                      value={rsvpConfirmedCount}
                      onChange={(e) => setRsvpConfirmedCount(parseInt(e.target.value, 10))}
                      className="w-full px-3 py-2 rounded-xl bg-[#ECE7DF]/85 border border-[#3A4436]/30 text-[#2C2C2A] font-serif text-[14px] focus:outline-none focus:border-[#5A1E28] cursor-pointer"
                    >
                      {Array.from({ length: guestData?.pases ?? 1 }, (_, i) => i + 1).map((num) => (
                        <option key={num} value={num}>
                          {num === 1 ? '1 persona' : `${num} personas`}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Campo opcional de mensaje */}
                <div className="mt-3 text-left">
                  <label htmlFor="mensaje-invitado" className="font-serif italic text-[12px] sm:text-[13px] text-[#5C6B57] block mb-1">
                    Déjales un mensaje a los novios (opcional):
                  </label>
                  <textarea 
                    id="mensaje-invitado" 
                    rows={3} 
                    value={rsvpMessage}
                    onChange={(e) => setRsvpMessage(e.target.value)}
                    placeholder="¡Felicidades!"
                    className="w-full px-3 py-2 rounded-xl bg-[#ECE7DF]/85 border border-[#3A4436]/30 text-[#2C2C2A] font-serif text-[13.5px] placeholder:text-[#2C2C2A]/35 focus:outline-none focus:border-[#5A1E28] transition-colors resize-none"
                  />
                </div>

                {rsvpFeedback?.type === 'error' && (
                  <p className="font-serif italic text-xs text-[#8A2525] text-center animate-fade-in">
                    {rsvpFeedback.message}
                  </p>
                )}

                <div className="pt-2 text-center space-y-2">
                  <button 
                    type="submit" 
                    id="btn-enviar"
                    disabled={isRsvpSubmitting}
                    className="btn-tactile w-full bg-[#22281F] text-[#F7F4EE] hover:bg-[#5C6B57] font-serif uppercase tracking-[0.18em] text-[11px] sm:text-xs py-3 rounded-full shadow-[0_4px_14px_rgba(0,0,0,0.2)] cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isRsvpSubmitting ? 'Guardando...' : 'Confirmar Respuesta'}
                  </button>

                  <button 
                    type="button"
                    onClick={() => setIsRsvpModalOpen(false)}
                    className="w-full text-[10.5px] uppercase font-serif tracking-wider text-[#3A4436]/70 hover:text-[#3A4436] py-1 cursor-pointer transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}


      {/* Toast Notification flotante para copiado */}
      {copyToast && (
        <div className="fixed bottom-6 z-50 bg-[#22281F] text-[#F7F4EE] font-sans text-xs tracking-wider px-5 py-2.5 rounded-full shadow-2xl border border-[#C5A059]/60 animate-bounce">
          {copyToast}
        </div>
      )}
    </div>
  );
}
