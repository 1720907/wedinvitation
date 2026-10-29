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

interface WeddingConfig {
  novios: {
    el: string;
    ella: string;
    monograma: string;
    frase: string;
  };
  padres: {
    novio: string;
    novia: string;
  };
  fecha: {
    iso: string;
    dia: string;
    mes: string;
    anio: string;
    horaCeremonia: string;
    horaRecepcion: string;
    textoCorto: string;
  };
  lugares: {
    ceremonia: {
      titulo: string;
      nombre: string;
      direccion: string;
      hora: string;
      mapsUrl: string;
      embedUrl: string;
    };
    recepcion: {
      titulo: string;
      nombre: string;
      direccion: string;
      hora: string;
      mapsUrl: string;
      embedUrl: string;
    };
  };
  banco: {
    bcp: string;
    bbva: string;
    cci: string;
    yapeNumero: string;
    titular: string;
  };
  whatsapp: string;
  albumUrl: string;
}

const DEFAULT_CONFIG: WeddingConfig = {
  novios: {
    el: "Jorge",
    ella: "Adriana",
    monograma: "J&A",
    frase: "Hay sueños que nacen en el corazón y, de la mano de Dios, encuentran el camino para hacerse realidad. El nuestro nos llevó a descubrir el mundo juntos, a extrañarnos sin dejar de sentirnos cerca y a encontrar, en los brazos del otro, ese hogar al que siempre queremos volver."
  },
  padres: {
    novio: "Jorge y Ana",
    novia: "José y Gianni"
  },
  fecha: {
    iso: "2027-02-27T11:30:00",
    dia: "27",
    mes: "Febrero",
    anio: "2027",
    horaCeremonia: "11:30 AM",
    horaRecepcion: "01:30 PM",
    textoCorto: "27.02.2027"
  },
  lugares: {
    ceremonia: {
      titulo: "Ceremonia Religiosa",
      nombre: "Templo de San Pedro Apóstol",
      direccion: "Plaza Principal, Urubamba — Cusco",
      hora: "11:30 am",
      mapsUrl: "https://maps.google.com/?q=Templo+de+San+Pedro+Apostol+Urubamba",
      embedUrl: "https://www.google.com/maps?q=Templo+de+San+Pedro+Apostol+Urubamba&output=embed"
    },
    recepcion: {
      titulo: "La Recepción",
      nombre: "Hotel La Casona de Yucay",
      direccion: "Plaza Manco II 104, Yucay — Urubamba, Cusco",
      hora: "1:30 pm",
      mapsUrl: "https://maps.google.com/?q=Hotel+La+Casona+de+Yucay+Cusco",
      embedUrl: "https://www.google.com/maps?q=Hotel+La+Casona+de+Yucay+Cusco&output=embed"
    }
  },
  banco: {
    bcp: "191-00124578-0-12",
    bbva: "0011-0057-0224974567",
    cci: "002-1910012457801299-45",
    yapeNumero: "999 888 777",
    titular: "Jorge & Adriana"
  },
  whatsapp: "51999888777",
  albumUrl: "https://photos.google.com/"
};

// Carrusel de 5 fotos en Polaroid con animación de alejamiento lento (Ken Burns)
const POLAROID_CAROUSEL_PHOTOS = [
  {
    id: 1,
    src: "./assets/aistudio/carrusel1.jpeg",
    alt: "Foto polaroid 1",
    caption: "“Nuestro lugar favorito en el mundo siempre será estar juntos”"
  },
  {
    id: 2,
    src: "./assets/aistudio/carrusel2.jpeg",
    alt: "Foto polaroid 2",
    caption: "“De la mano, hacia todos los sueños que nos quedan por vivir”"
  },
  {
    id: 3,
    src: "./assets/aistudio/carrusel3.jpeg",
    alt: "Foto polaroid 3",
    caption: "“Cuando las palabras dejan de ser necesarias a través de nuestra mirada”"
  },
  {
    id: 4,
    src: "./assets/aistudio/carrusel4.jpeg",
    alt: "Foto polaroid 4",
    caption: "“Los brazos a los que siempre queremos volver”"
  },
  {
    id: 5,
    src: "./assets/aistudio/carrusel5.jpeg",
    alt: "Foto polaroid 5",
    caption: "“El comienzo de nuestro para siempre. 🤍”"
  }
];

export default function App() {
  const [config, setConfig] = useState<WeddingConfig>(DEFAULT_CONFIG);
  const [countdown, setCountdown] = useState<CountdownResult>(() =>
    calculateCountdown(DEFAULT_CONFIG.fecha.iso)
  );
  
  // Audio state
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [audioStatus, setAudioStatus] = useState<string>("Toca para reproducir");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthIntervalRef = useRef<number | null>(null);

  // RSVP Form state
  const [rsvpName, setRsvpName] = useState<string>('');
  const [rsvpWillAttend, setRsvpWillAttend] = useState<boolean>(true);
  const [rsvpCompanions, setRsvpCompanions] = useState<number>(0);
  const [rsvpNote, setRsvpNote] = useState<string>('');
  const [rsvpSubmittedToast, setRsvpSubmittedToast] = useState<boolean>(false);

  // Modal / Drawer state for Maps & Experiences
  const [activeMapModal, setActiveMapModal] = useState<{ title: string; embedUrl: string; mapsUrl: string } | null>(null);
  const [showExperiencesDrawer, setShowExperiencesDrawer] = useState<boolean>(false);
  const [selectedExperience, setSelectedExperience] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<string | null>(null);

  // Hero couple photo zoom-out trigger
  const [heroAnimated, setHeroAnimated] = useState<boolean>(false);
  // Fixed initial mobile viewport height to fill full screen without dynamic resize jumps on scroll
  const [heroMobileHeight, setHeroMobileHeight] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setHeroMobileHeight(window.innerHeight);
    }
    const timer = setTimeout(() => {
      setHeroAnimated(true);
    }, 120);
    return () => clearTimeout(timer);
  }, []);

  // Sección 4: Carrusel de 5 fotos Polaroid con alejamiento lento cada 4 segundos
  const [polaroidIdx, setPolaroidIdx] = useState<number>(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setPolaroidIdx((prev) => (prev + 1) % POLAROID_CAROUSEL_PHOTOS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Scroll Reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -50px 0px' }
    );

    const elements = document.querySelectorAll('.reveal-item');
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

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

  // WhatsApp RSVP submission
  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rsvpName.trim()) {
      alert("Por favor ingresa tu nombre y apellido");
      return;
    }

    const message = formatRsvpMessage(
      rsvpName,
      rsvpWillAttend,
      rsvpCompanions,
      rsvpNote,
      `${config.novios.el} & ${config.novios.ella}`,
      config.fecha.textoCorto
    );

    const waLink = buildWhatsAppLink(config.whatsapp, message);
    setRsvpSubmittedToast(true);
    setTimeout(() => {
      window.open(waLink, '_blank');
      setRsvpSubmittedToast(false);
    }, 400);
  };

  // Honeymoon experiences list
  const EXPERIENCES = [
    {
      id: "exp1",
      titulo: "Noche en Casona del Valle Sagrado",
      subtitulo: "Nuestra estancia romántica rodeada de las montañas de Cusco",
      sugerido: "S/ 250 o libre",
      icono: "🏰"
    },
    {
      id: "exp2",
      titulo: "Cena Romántica de Recién Casados",
      subtitulo: "Brindis especial bajo las estrellas con gastronomía andina",
      sugerido: "S/ 180 o libre",
      icono: "🍷"
    },
    {
      id: "exp3",
      titulo: "Excursión en Velero & Atardecer",
      subtitulo: "Aventura y paseo en velero durante nuestra luna de miel",
      sugerido: "S/ 150 o libre",
      icono: "⛵"
    }
  ];

  return (
    <div className="min-h-screen bg-[#141812] text-[#2C2C2A] flex justify-center pt-0 pb-8 px-0 sm:px-4">
      {/* Background Audio Element */}
      <audio
        ref={audioRef}
        src="assets/audio/A Thousand years.mp3"
        loop
        preload="auto"
      />

      {/* Main Invitation Canvas (Proportional Mobile-First 480px) */}
      <main className="w-full max-w-[480px] bg-[#ECE7DF] shadow-[0_25px_80px_rgba(0,0,0,0.65)] relative overflow-hidden flex flex-col">
        
        {/* Layer 0: Continuous Texture Wallpaper */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-45 mix-blend-multiply z-0"
          style={{
            backgroundImage: `url('/assets/aistudio/imagen_fondo.jpg_a5ae7893.png')`,
            backgroundRepeat: 'repeat',
            backgroundSize: '360px auto'
          }}
        />

        {/* Botanical leaf vine motifs trailing down the sides */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 select-none z-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='140' height='260' viewBox='0 0 140 260' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%235C6B57' fill-opacity='0.55'%3E%3Cpath d='M10 20 C25 15, 35 25, 30 40 C20 35, 12 28, 10 20 Z'/%3E%3Cpath d='M30 40 C45 35, 55 45, 50 60 C40 55, 32 48, 30 40 Z'/%3E%3Cpath d='M25 80 C15 75, 10 65, 18 55 C22 65, 28 72, 25 80 Z'/%3E%3Cpath d='M125 140 C110 135, 100 145, 105 160 C115 155, 123 148, 125 140 Z'/%3E%3Cpath d='M105 160 C90 155, 80 165, 85 180 C95 175, 103 168, 105 160 Z'/%3E%3Cpath d='M120 200 C130 195, 135 185, 127 175 C123 185, 117 192, 120 200 Z'/%3E%3C/g%3E%3Cpath d='M15 15 Q30 50 20 90 T25 170 T15 250' fill='none' stroke='%235C6B57' stroke-width='0.7' stroke-opacity='0.45'/%3E%3Cpath d='M130 135 Q110 170 120 210' fill='none' stroke='%235C6B57' stroke-width='0.7' stroke-opacity='0.45'/%3E%3C/svg%3E")`,
            backgroundRepeat: 'repeat-y',
            backgroundPosition: 'left center, right center',
            backgroundSize: '100% 260px'
          }}
        />

        {/* =================================================================
             SECCIÓN 1: HERO (foto_cover_clean + Marco Verde Oval + Iniciales)
        {/* =================================================================
             SECCIÓN 1: HERO (foto_cover_clean + Marco Verde Oval + Iniciales)
             En celular: 100% de la pantalla fija (sin saltos de zoom al escrolear).
             En PC: Formato centrado proporcional nativo.
             ================================================================= */}
        <section 
          id="hero-invitation"
          className="relative w-full h-[100svh] sm:!h-auto overflow-hidden select-none bg-[#2C3426] flex items-center justify-center flex-shrink-0"
          style={heroMobileHeight && typeof window !== 'undefined' && window.innerWidth < 640 ? { height: `${heroMobileHeight}px` } : undefined}
        >
          {/* Contenedor proporcional centrado que llena la altura en celular sin deformar */}
          <div 
            className="h-full w-auto absolute left-1/2 -translate-x-1/2 sm:static sm:translate-x-0 sm:w-full sm:h-auto overflow-hidden flex-shrink-0"
            style={{ aspectRatio: '1149 / 1951' }}
          >
            {/* Base Hero Frame Background: foto_cover_clean.jpg */}
            <img 
              src="./assets/aistudio/foto_cover_clean.jpg" 
              alt="Cubierta de invitación fina con marco barroco verde" 
              className="absolute inset-0 w-full h-full object-cover z-0"
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
                src="./assets/aistudio/portada.jpeg"
                alt="Foto de la pareja" 
                onLoad={() => setHeroAnimated(true)}
                className={`w-full h-full object-cover object-center ${
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

              {/* Iniciales encima de la foto (iniciales_ca9ceab3.png) */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-2">
                <img 
                  src="./assets/aistudio/iniciales_ca9ceab3_1.png" 
                  alt="Monograma de los novios" 
                  className="w-[80%] max-w-[185px] object-contain drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)] filter brightness-120 opacity-50"
                />
              </div>
            </div>
          </div>

          {/* Contenido inferior de la cubierta: Fecha + Reproduce Nuestra Canción (fijado bajo el marco barroco) */}
          <div className="absolute top-[65.5%] inset-x-0 z-20 flex flex-col items-center text-center px-4 sm:px-6">
            
            {/* Fecha en tipografía Serif clásica con alto espaciado (permanece estrictamente debajo del marco) */}
            <p className="font-serif text-[#F7F4EE] text-2xl sm:text-3xl md:text-4xl tracking-[0.14em] font-light drop-shadow-[0_2px_5px_rgba(0,0,0,0.5)]">
              {config.fecha.textoCorto}
            </p>

            {/* Texto "REPRODUCE NUESTRA CANCIÓN" */}
            <p className="font-serif text-[#E3DCD2] text-[11px] sm:text-[13px] tracking-[0.26em] uppercase mt-3 sm:mt-5 mb-2 sm:mb-2.5 font-medium drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
              Reproduce Nuestra Canción
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
             SECCIÓN 2: SOBRE ABIERTO + CARTA DE BIENVENIDA (NOS CASAMOS)
             ================================================================= */}
        <section className="relative px-5 pt-12 flex flex-col items-center reveal-item">
          
          <div className="w-full max-w-[360px] relative">
            {/* Contenedor del Sobre Abierto Realista */}
            <div className="w-full relative z-10 flex justify-center -mb-10">
              {/* Capa 1: Fondo del sobre con la solapa interior y trasera */}
              <img
                src="./assets/aistudio/sobreabierto1_a0f8ad35.png"
                alt="Sobre abierto fondo"
                className="w-full h-auto object-contain drop-shadow-[0_12px_24px_rgba(0,0,0,0.18)] block select-none"
              />

              {/* Capa 2: Frente del sobre con solapas y bolsillo frontal exactamente superpuesto */}
              <img
                src="./assets/aistudio/sobreabierto2_d3a8449e.png"
                alt="Sobre abierto frente"
                className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none z-10"
              />
            </div>
            


            {/* Tarjeta de Papel Rasgado que emerge del sobre */}
            <div className="shadow-torn-paper -mt-[130px] mx-2 relative z-20">
              {/* Sello de Cera Verde Salvia colocado a caballo exactamente en el borde superior del tarjetón */}
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 w-20 h-20 z-30 shadow-wax-seal wax-seal-anim cursor-pointer">
                <img
                  src="./assets/aistudio/imagen_sello_75c97831.png"
                  alt="Sello de cera J&A"
                  className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform"
                />
              </div>

              <div className="relative px-7 sm:px-9 pt-14 pb-16 sm:pb-20 text-center">
                {/* Imagen del papel */}
                <img 
                  src="./assets/aistudio/papel3_clean.png" 
                  alt="Tarjetón de papel artesanal rasgado" 
                  className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0 filter drop-shadow-[0_16px_28px_rgba(20,24,18,0.22)]"
                />
                

                {/* Flor prensada romántica en la esquina (flor_9aee3096.png) */}
                <img 
                  src="./assets/aistudio/flor_9aee3096.png" 
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

                  {/* Cuadro de bendición de los Padres */}
                  <div className="bg-[#ECE7DF]/85 border border-[#C5A059]/30 rounded-sm py-4 px-4 text-center space-y-3">
                    <div>
                      <p className="font-display text-[10px] tracking-[0.2em] text-[#5C6B57] uppercase font-semibold">
                        Padres del Novio
                      </p>
                      <p className="font-serif text-base font-semibold text-[#2C2C2A] mt-0.5">
                        {config.padres.novio}
                      </p>
                    </div>
                    <div className="h-[1px] w-16 bg-[#C5A059]/30 mx-auto" />
                    <div>
                      <p className="font-display text-[10px] tracking-[0.2em] text-[#5C6B57] uppercase font-semibold">
                        Padres de la Novia
                      </p>
                      <p className="font-serif text-base font-semibold text-[#2C2C2A] mt-0.5">
                        {config.padres.novia}
                      </p>
                    </div>
                  </div>

                  <p className="font-serif italic text-sm text-[#2C2C2A]/80 mt-5">
                    "Nos haría inmensamente felices que nos acompañes en este día tan especial, en el que celebraremos nuestro para siempre junto a nuestras personas favoritas: ustedes."
                  </p>
                </div>
              </div>
            </div>

                

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 3: MEDALLÓN BARROCO DE FECHA (papel6_03599585.png) & CUENTA REGRESIVA
             ================================================================= */}
        <section className="relative px-5 -mt-10 pb-8 flex flex-col items-center reveal-item">
          <div className="w-full max-w-[360px] flex flex-col items-center">
            
            {/* Medallón Barroco Terracota con texturas talladas en 3D (papel6_03599585.png) */}
            <div className="relative z-20 w-96 h-96 -mt-6 flex items-center justify-center shadow-cameo pointer-events-none">
              {/* Imagen del camafeo real con relieve */}
              <img 
                src="./assets/aistudio/papel6_03599585.png" 
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
            <div className="relative z-10 w-full -mt-16 shadow-torn-paper">
              <div className="relative z-10 px-6 py-10 text-center">
                {/* Imagen del papel */}
                <img 
                  src="./assets/aistudio/papel3_clean_rotated.png" 
                  alt="Tarjetón de papel artesanal rasgado" 
                  className="absolute inset-0 w-full h-full inset-0 object-fill pointer-events-none select-none z-10 filter drop-shadow-[0_16px_28px_rgba(20,24,18,0.22)]"
                />
                
                <p className="relative z-20 font-script text-3xl text-[#5A1E28] mb-2 font-normal">
                  Faltan
                </p>

                {/* Contador regresivo con numerales tabulares */}
                <div className="relative z-20 grid grid-cols-4 gap-2 tabular-nums max-w-xs mx-auto">
                  <div className="bg-[#ECE7DF]/70 py-2 rounded border border-[#C5A059]/20">
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2C2A] block leading-none">
                      {String(countdown.days).padStart(2, '0')}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#5C6B57] font-semibold mt-1 block">
                      Días
                    </span>
                  </div>
                  <div className="bg-[#ECE7DF]/70 py-2 rounded border border-[#C5A059]/20">
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2C2A] block leading-none">
                      {String(countdown.hours).padStart(2, '0')}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#5C6B57] font-semibold mt-1 block">
                      Horas
                    </span>
                  </div>
                  <div className="bg-[#ECE7DF]/70 py-2 rounded border border-[#C5A059]/20">
                    <span className="font-display text-2xl sm:text-3xl font-semibold text-[#2C2C2A] block leading-none">
                      {String(countdown.minutes).padStart(2, '0')}
                    </span>
                    <span className="font-sans text-[9px] tracking-[0.2em] uppercase text-[#5C6B57] font-semibold mt-1 block">
                      Minutos
                    </span>
                  </div>
                  <div className="bg-[#ECE7DF]/70 py-2 rounded border border-[#C5A059]/20">
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
                      "2027-02-27T23:59:59"
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
        <section className="relative px-5 py-6 reveal-item">
          <div className="w-full max-w-[400px] mx-auto relative">

            {/* Sello de vintage calligraphy decorativo en la esquina (papel_decoracion_2_6b80d71f.png) */}
            <div className="absolute -top-3 -right-2 z-40 w-14 h-14 rotate-6 drop-shadow-md pointer-events-none">
              <img
                src="./assets/aistudio/papel_decoracion_2_6b80d71f.png"
                alt="Sello vintage"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Foto enmarcada en papel artesanal real */}
            <div className="relative transform -rotate-0.5 filter drop-shadow-[0_15px_30px_rgba(0,0,0,0.22)]">
              {/* Imagen del Papel Artesanal Real (papel1_14fb074a.png) como fondo del contenedor */}
              <img
                src="./assets/aistudio/papel1_14fb074a_limpio.png"
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
                          className={`w-full h-full object-cover object-top ${isActive ? 'animate-polaroid-zoomout' : 'scale-100'
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
        <section className="relative px-5 py-8 reveal-item">
          
          {/* Tarjeta 1: CEREMONIA RELIGIOSA */}
          <div className="w-full max-w-[360px] sm:max-w-[385px] mx-auto relative drop-shadow-[0_16px_32px_rgba(0,0,0,0.22)]">

            {/* Sello de cera verde superior fijando la hoja de itinerario */}
            <div className="absolute -top-3 -left-1 w-20 h-20 z-30 rotate-[-6deg] pointer-events-none select-none drop-shadow-md">
              <img 
                src="./assets/aistudio/imagen_sello_75c97831.png" 
                alt="Sello J&A" 
                className="w-full h-full object-contain"
              />
            </div>
            {/* Imagen del Papel Artesanal (papel4_97b148ae.png) como fondo del contenedor */}
            <img 
              src="./assets/aistudio/papel4_97b148ae.png" 
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
                  src="./assets/aistudio/sketch_iglesia.png" 
                  alt="Templo de San Pedro Apóstol" 
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
                <p className="font-script text-xl sm:text-2xl text-[#3E4E39] leading-tight">
                  – Urubamba – Cusco
                </p>
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

          {/* Tarjeta 2: LA RECEPCIÓN */}
          <div className="w-full max-w-[360px] sm:max-w-[385px] mx-auto relative drop-shadow-[0_16px_32px_rgba(0,0,0,0.22)]">
            {/* Imagen del Papel Artesanal (papel4_97b148ae.png) como fondo del contenedor */}
            <img 
              src="./assets/aistudio/papel4_97b148ae.png" 
              alt="Papel artesanal Recepción" 
              className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
            />

            {/* Contenido sobre el papel siguiendo la proporción y tipografía de referencia */}
            <div className="relative z-10 px-7 pt-10 pb-11 sm:px-9 sm:pt-12 sm:pb-12 text-center flex flex-col items-center">
              {/* Título: RECEPCIÓN en serifa clásica espaciada */}
              <h3 className="font-serif text-[#4F5E46] tracking-[0.24em] text-base sm:text-[17px] uppercase font-light leading-snug">
                RECEPCIÓN
              </h3>

              {/* Grabado arquitectónico auténtico de La Casona */}
              <div className="w-full max-w-[270px] sm:max-w-[290px] my-5 flex justify-center">
                <img 
                  src="./assets/aistudio/sketch_recepcion.png" 
                  alt="Hotel La Casona de Yucay" 
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
        <section className="relative px-5 py-6 reveal-item">
          <div className="w-full max-w-[360px] sm:max-w-[385px] mx-auto relative">
            
            {/* Sello de cera verde superior fijando la hoja de itinerario */}
            <div className="w-20 h-20 mx-auto -mb-10 relative z-30 wax-seal-anim cursor-pointer">
              <img 
                src="./assets/aistudio/imagen_sello_75c97831.png" 
                alt="Sello J&A" 
                className="w-full h-full object-contain filter drop-shadow-md hover:scale-105 transition-transform"
              />
            </div>

            {/* Hoja de Itinerario en papel artesanal real vertical (papel3_clean.png) */}
            <div className="relative z-10 drop-shadow-[0_16px_32px_rgba(20,24,18,0.22)]">
              {/* Imagen de fondo papel3_clean vertical */}
              <img 
                src="./assets/aistudio/papel3_clean.png" 
                alt="Papel artesanal Itinerario" 
                className="absolute inset-0 w-full h-full object-fill z-0 pointer-events-none select-none"
              />

              {/* Contenido sobre el papel */}
              <div className="relative z-10 px-6 pt-14 pb-12 sm:px-8 sm:pt-16 sm:pb-14">
                
                {/* Título: ITINERARIO */}
                <h3 className="font-serif tracking-[0.26em] text-base sm:text-[17px] uppercase font-normal text-[#384831] text-center mb-7 sm:mb-8">
                  ITINERARIO
                </h3>

                {/* Línea de tiempo vertical: iconos grandes y texto compacto en el lado derecho */}
                <div className="flex flex-col">
                  {[
                    {
                      hora: "11:30 am",
                      titulo: "Ceremonia religiosa",
                      icon: (
                        <img 
                          src="./assets/aistudio/icono_anillos_48b04619.png" 
                          alt="Ceremonia religiosa" 
                          className="w-16 h-16 sm:w-18 sm:h-18 object-contain filter drop-shadow-xs"
                        />
                      )
                    },
                    {
                      hora: "3:00 pm",
                      titulo: "Llegada a recepcion",
                      icon: (
                        <img 
                          src="./assets/aistudio/icono_despedida_dcfd3b04.png" 
                          alt="Llegada a recepcion" 
                          className="w-18 h-10 sm:w-20 sm:h-11 object-contain opacity-90 rotate-y-180"
                        />
                      )
                    },
                    {
                      hora: "3:30 pm",
                      titulo: "Votos matrimoniales",
                      icon: (
                        <img 
                          src="./assets/aistudio/icono_votos.png" 
                          alt="Votos matrimoniales" 
                          className="w-16 h-16 sm:w-18 sm:h-18 object-contain filter drop-shadow-xs"
                        />
                      )
                    },
                    {
                      hora: "4:30 pm",
                      titulo: "Coctel",
                      icon: (
                        <img 
                          src="./assets/aistudio/icono_coctel_2fb88822.png" 
                          alt="Coctel" 
                          className="w-16 h-16 sm:w-18 sm:h-18 object-contain filter drop-shadow-xs"
                        />
                      )
                    },
                    {
                      hora: "6:00 pm",
                      titulo: "Cena",
                      icon: (
                        <img 
                          src="./assets/aistudio/icono_cena_f73c8000.png" 
                          alt="Cena" 
                          className="w-16 h-16 sm:w-18 sm:h-18 object-contain filter drop-shadow-xs"
                        />
                      )
                    },
                    {
                      hora: "8:00 pm",
                      titulo: "Fiesta",
                      icon: (
                        <img 
                          src="./assets/aistudio/icono_fiesta_a951966a.png" 
                          alt="Fiesta" 
                          className="w-16 h-16 sm:w-18 sm:h-18 object-contain filter drop-shadow-xs"
                        />
                      )
                    },
                    {
                      hora: "12:00 am",
                      titulo: "Fin de fiesta",
                      icon: (
                        <img 
                          src="./assets/aistudio/icono_despedida_dcfd3b04.png" 
                          alt="Fin de fiesta" 
                          className="w-18 h-10 sm:w-20 sm:h-11 object-contain opacity-90"
                        />
                      )
                    }
                  ].map((event, idx, arr) => {
                    const isFirst = idx === 0;
                    const isLast = idx === arr.length - 1;
                    return (
                      <div key={idx} className="grid grid-cols-[1.2fr_34px_1.05fr] items-center min-h-[74px] sm:min-h-[82px]">
                        {/* Columna 1: Iconos sustancialmente más grandes y alineados hacia el eje */}
                        <div className="flex items-center justify-end pr-2.5 sm:pr-3.5">
                          <div className="w-18 h-18 sm:w-20 sm:h-20 flex items-center justify-end">
                            {event.icon}
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
                            <line x1="3" y1="34" x2="3" y2="46" stroke="#5C6E52" strokeWidth="1.3" />
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
        <section className="relative z-20 px-5 py-8 reveal-item">
          <div className="w-full max-w-[360px] sm:max-w-[385px] mx-auto relative flex flex-col items-center">
            
            {/* Foto de la pareja enmarcada en papel artesanal real tipo marco/Polaroid */}
            <div className="relative w-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.22)] transform -rotate-0.5">
              {/* Fondo de textura de papel artesanal */}
              <img 
                src="./assets/aistudio/papel1_14fb074a_limpio.png" 
                alt="Fondo textura papel" 
                className="absolute inset-0 w-full h-full object-fill pointer-events-none select-none z-0"
              />

              {/* Contenedor de la foto con generoso margen inferior de papel para que el camafeo descanse sobre él */}
              <div className="relative z-10 px-7 pt-7 pb-20 sm:px-8 sm:pt-8 sm:pb-24">
                <div className="w-full aspect-[4/3] overflow-hidden rounded-xs border border-[#C5A059]/25 shadow-md bg-[#232920]">
                  <img 
                    src="./assets/aistudio/carrusel2.jpeg" 
                    alt="Foto momento especial" 
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
            </div>

            {/* Camafeo Barroco de Código de Vestimenta superpuesto exactamente sobre el marco inferior de papel */}
            <div className="relative z-20 w-96 h-96 sm:w-96 sm:h-96 -mt-22 sm:-mt-26 flex items-center justify-center shadow-cameo">
              <img 
                src="./assets/aistudio/papel6_03599585.png" 
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
                  ELEGANTE
                </p>

                {/* Detalle de vestimenta en serifa blanca de alto contraste y excelente lectura */}
                <div className="space-y-1.5 mt-1.5 text-center w-[90%]">
                  <p className="font-serif text-[10px] sm:text-[11px] text-white leading-snug drop-shadow-xs">
                    <span className="font-semibold">Mujeres:</span> Vestido largo (se sugiere evitar tonos blanco, beige y similares)
                  </p>
                  <p className="font-serif text-[10px] sm:text-[11px] text-white leading-snug drop-shadow-xs">
                    <span className="font-semibold">Hombres:</span> Terno y corbata
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 8: SUGERENCIA DE REGALOS & LUNA DE MIEL
             ================================================================= */}
        <section className="relative z-10 px-5 py-8 -mt-30 reveal-item">
          <div className="max-w-[400px] mx-auto relative">
            
            <div className="shadow-torn-paper relative z-20">
              <div className="deckle-card px-6 pt-10 pb-8 text-center">
                
                <h3 className="font-display text-sm tracking-[0.25em] text-[#5C6B57] uppercase font-semibold">
                  Sugerencia de Regalos
                </h3>

                {/* Ilustración de Caja de Regalo */}
                <div className="my-4 flex justify-center">
                  <svg className="w-12 h-12 text-[#5A1E28]/85" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <rect x="3" y="8" width="18" height="4" rx="1"/>
                    <path d="M12 8v13M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
                    <path d="M7.5 8a2.5 2.5 0 0 1 0-5C11 3 12 8 12 8s1-5 4.5-5a2.5 2.5 0 0 1 0 5"/>
                  </svg>
                </div>

                <p className="font-serif italic text-base text-[#2C2C2A]/90 leading-relaxed max-w-xs mx-auto mb-5">
                  “¡Tu presencia es el mejor regalo! Pero si deseas tener un detalle con nosotros para nuestra Luna de Miel, estaremos muy agradecidos.”
                </p>

                {/* Cuentas Bancarias con botón de Copiar */}
                <div className="bg-[#ECE7DF]/80 border border-[#C5A059]/40 rounded-sm p-4 text-center space-y-3 font-sans text-xs">
                  <div>
                    <span className="font-display text-[10px] tracking-wider uppercase text-[#5C6B57] font-semibold block">
                      BBVA Banco Continental
                    </span>
                    <p className="font-mono text-sm font-semibold text-[#2C2C2A] mt-0.5">
                      {config.banco.bbva}
                    </p>
                    <button 
                      onClick={() => handleCopy(config.banco.bbva, "Número de cuenta BBVA")}
                      className="text-[10px] uppercase tracking-wider text-[#5A1E28] font-semibold underline mt-1 cursor-pointer"
                    >
                      Copiar Cuenta
                    </button>
                  </div>

                  <div className="h-[1px] w-20 bg-[#C5A059]/30 mx-auto" />

                  <div>
                    <span className="font-display text-[10px] tracking-wider uppercase text-[#5C6B57] font-semibold block">
                      Código de Cuenta Interbancario (CCI)
                    </span>
                    <p className="font-mono text-xs font-semibold text-[#2C2C2A] mt-0.5">
                      {config.banco.cci}
                    </p>
                    <button 
                      onClick={() => handleCopy(config.banco.cci, "CCI")}
                      className="text-[10px] uppercase tracking-wider text-[#5A1E28] font-semibold underline mt-1 cursor-pointer"
                    >
                      Copiar CCI
                    </button>
                  </div>

                  <div className="h-[1px] w-20 bg-[#C5A059]/30 mx-auto" />

                  <div>
                    <span className="inline-block bg-[#5A1E28] text-[#F7F4EE] text-[9px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold">
                      Yape / Plin
                    </span>
                    <p className="font-mono text-sm font-bold text-[#2C2C2A] mt-1">
                      {config.banco.yapeNumero}
                    </p>
                    <p className="text-[11px] text-[#2C2C2A]/70">
                      Titular: {config.banco.titular}
                    </p>
                    <button 
                      onClick={() => handleCopy(config.banco.yapeNumero, "Número de Yape")}
                      className="text-[10px] uppercase tracking-wider text-[#5A1E28] font-semibold underline mt-1 cursor-pointer"
                    >
                      Copiar Yape
                    </button>
                  </div>
                </div>

                {/* Botón para desplegar Experiencias de Luna de Miel */}
                <div className="mt-5">
                  <button 
                    onClick={() => setShowExperiencesDrawer(!showExperiencesDrawer)}
                    className="btn-tactile bg-[#5C6B57] text-[#F7F4EE] font-sans text-[11px] tracking-[0.16em] uppercase px-6 py-2.5 rounded-full shadow hover:bg-[#3E4A37] cursor-pointer"
                  >
                    {showExperiencesDrawer ? "Ocultar Experiencias ▴" : "Ver Experiencias de Luna de Miel ▾"}
                  </button>
                </div>

                {/* Experiencias de Luna de Miel Desplegables */}
                {showExperiencesDrawer && (
                  <div className="mt-6 space-y-3 text-left">
                    <p className="font-display text-[10px] tracking-[0.15em] text-[#5A1E28] uppercase text-center font-semibold mb-2">
                      Aporta a un momento especial de nuestro viaje:
                    </p>
                    {EXPERIENCES.map((exp) => (
                      <div 
                        key={exp.id} 
                        className="bg-[#ECE7DF] p-3 rounded border border-[#C5A059]/30 flex items-center justify-between gap-3 shadow-xs"
                      >
                        <div className="text-2xl flex-shrink-0">{exp.icono}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-serif font-bold text-sm text-[#2C2C2A] truncate">{exp.titulo}</h4>
                          <p className="font-serif text-xs text-[#2C2C2A]/80 leading-tight">{exp.subtitulo}</p>
                          <span className="inline-block font-sans text-[10px] text-[#5C6B57] font-semibold mt-0.5">
                            Sugerido: {exp.sugerido}
                          </span>
                        </div>
                        <button 
                          onClick={() => {
                            setSelectedExperience(exp.titulo);
                            handleCopy(`${config.banco.bbva}`, `Datos para ${exp.titulo}`);
                          }}
                          className="btn-tactile bg-[#22281F] text-[#F7F4EE] font-sans text-[10px] tracking-wider uppercase px-3 py-1.5 rounded-full flex-shrink-0 hover:bg-[#5A1E28] cursor-pointer"
                        >
                          Aportar
                        </button>
                      </div>
                    ))}

                    {selectedExperience && (
                      <div className="bg-[#D8A7B1]/20 border border-[#5A1E28]/30 rounded p-3 text-center mt-3">
                        <p className="font-serif font-bold text-xs text-[#5A1E28]">
                          ¡Gracias por tu cariño para: {selectedExperience}!
                        </p>
                        <p className="text-[11px] text-[#2C2C2A]/80 mt-1 font-sans">
                          Puedes realizar tu transferencia a la cuenta BBVA o Yape mostrada arriba.
                        </p>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 9: FOTOGRAFÍA ANDINA 3 & QR PARA SUBIR FOTOS
             ================================================================= */}
        <section className="relative px-5 py-8 reveal-item">
          <div className="max-w-[400px] mx-auto relative flex flex-col items-center">
            
            {/* Foto íntima de pareja en los Andes (couple_photo_3.jpg) */}
            <div className="w-full bg-[#F7F4EE] p-3 shadow-lg rounded-sm border border-[#C5A059]/20 mb-6">
              <div className="w-full h-72 overflow-hidden rounded-xs">
                <img 
                  src="./assets/aistudio/couple_photo_3.jpg" 
                  alt="Momento íntimo de los novios con ovejas y nevados de fondo" 
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>

            {/* Tarjeta con Código QR de Álbum de Fotos */}
            <div className="w-full shadow-torn-paper">
              <div className="deckle-card px-6 pt-8 pb-8 text-center">
                <h3 className="font-display text-sm tracking-[0.25em] text-[#5C6B57] uppercase font-semibold">
                  Álbum Compartido
                </h3>
                <p className="font-serif italic text-base text-[#2C2C2A]/85 mt-2 mb-4">
                  Escanea el código QR o pulsa el botón para subir las fotos y videos que tomes durante nuestra boda.
                </p>

                {/* Código QR Generado */}
                <div className="inline-block p-3 bg-white rounded border border-[#C5A059]/40 shadow-xs my-2">
                  <img 
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&color=2C2C2A&bgcolor=F7F4EE&data=${encodeURIComponent(config.albumUrl)}`} 
                    alt="Código QR Álbum de Boda" 
                    className="w-32 h-32 mx-auto"
                  />
                </div>

                <div className="mt-4">
                  <a 
                    href={config.albumUrl} 
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
        <section className="relative px-5 pt-8 pb-12 reveal-item">
          <div className="max-w-[400px] mx-auto relative">
            
            {/* Tarjeta de Confirmación ingresando en el sobre inferior */}
            <div className="shadow-torn-paper mx-2 relative z-20">
              <div className="deckle-card px-6 pt-8 pb-16 text-center">
                <h3 className="font-display text-sm tracking-[0.25em] text-[#5A1E28] uppercase font-semibold">
                  Confirmar Asistencia
                </h3>
                <p className="font-serif italic text-base text-[#2C2C2A]/90 mt-2 mb-5">
                  Nos encantará compartir este día con ustedes, rodeados de detalles, flores y momentos inolvidables.<br/>
                  Por favor confirma tu asistencia antes del 30 de mayo.
                </p>

                {/* Formulario RSVP Interactivo */}
                <form onSubmit={handleRsvpSubmit} className="space-y-3.5 text-left max-w-xs mx-auto font-sans text-xs">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#5C6B57] font-semibold mb-1">
                      Nombre y Apellido
                    </label>
                    <input 
                      type="text" 
                      required
                      value={rsvpName}
                      onChange={(e) => setRsvpName(e.target.value)}
                      placeholder="Ej. Familia Rodríguez / Carlos Mendoza" 
                      className="w-full px-3 py-2 rounded bg-[#ECE7DF]/90 border border-[#C5A059]/40 text-[#2C2C2A] placeholder:text-[#2C2C2A]/40 focus:outline-none focus:border-[#5A1E28]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#5C6B57] font-semibold mb-1">
                      ¿Podrás acompañarnos?
                    </label>
                    <select 
                      value={rsvpWillAttend ? 'si' : 'no'}
                      onChange={(e) => setRsvpWillAttend(e.target.value === 'si')}
                      className="w-full px-3 py-2 rounded bg-[#ECE7DF]/90 border border-[#C5A059]/40 text-[#2C2C2A] focus:outline-none focus:border-[#5A1E28]"
                    >
                      <option value="si">¡Sí, asistiré con mucha alegría!</option>
                      <option value="no">Lamentablemente no podré asistir</option>
                    </select>
                  </div>

                  {rsvpWillAttend && (
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider text-[#5C6B57] font-semibold mb-1">
                        Acompañantes adicionales
                      </label>
                      <input 
                        type="number" 
                        min="0" 
                        max="6"
                        value={rsvpCompanions}
                        onChange={(e) => setRsvpCompanions(Math.max(0, parseInt(e.target.value) || 0))}
                        className="w-full px-3 py-2 rounded bg-[#ECE7DF]/90 border border-[#C5A059]/40 text-[#2C2C2A] focus:outline-none focus:border-[#5A1E28]"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] uppercase tracking-wider text-[#5C6B57] font-semibold mb-1">
                      Restricción alimentaria o dedicatoria (opcional)
                    </label>
                    <input 
                      type="text" 
                      value={rsvpNote}
                      onChange={(e) => setRsvpNote(e.target.value)}
                      placeholder="Ej. Alergia a mariscos / ¡Felicidades!" 
                      className="w-full px-3 py-2 rounded bg-[#ECE7DF]/90 border border-[#C5A059]/40 text-[#2C2C2A] placeholder:text-[#2C2C2A]/40 focus:outline-none focus:border-[#5A1E28]"
                    />
                  </div>

                  <div className="pt-2 text-center">
                    <button 
                      type="submit"
                      className="btn-tactile w-full bg-[#22281F] text-[#F7F4EE] font-sans text-[11px] tracking-[0.2em] uppercase py-3 rounded-full shadow-[0_6px_18px_rgba(0,0,0,0.3)] hover:bg-[#5A1E28] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Confirmar por WhatsApp</span>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.299.144.347.491 1.2.534 1.287.043.087.072.188.014.303-.058.116-.087.188-.173.289l-.26.302c-.087.087-.178.181-.077.355.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86.173.086.275.072.376-.044.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.043.073.043.419-.101.824z"/>
                      </svg>
                    </button>
                  </div>
                </form>

                {rsvpSubmittedToast && (
                  <p className="text-[11px] text-[#5C6B57] font-semibold mt-3 animate-fade-in">
                    Abriendo WhatsApp con tu confirmación...
                  </p>
                )}

              </div>
            </div>

            {/* Sobre de Cierre Inferior (sobrecerrado_3948ed67.png) */}
            <div className="w-full -mt-10 relative z-30 flex justify-center">
              <img 
                src="./assets/aistudio/sobrecerrado_3948ed67.png" 
                alt="Sobre de cierre" 
                className="w-full h-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.35)]"
              />

              {/* Sello de Cera verde sellando el sobre inferior */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-22 h-22 z-40 shadow-wax-seal wax-seal-anim cursor-pointer">
                <img 
                  src="./assets/aistudio/imagen_sello_75c97831.png" 
                  alt="Sello de Cera J&A" 
                  className="w-full h-full object-contain filter drop-shadow-lg"
                />
              </div>
            </div>

          </div>
        </section>

        {/* =================================================================
             SECCIÓN 11: MENSAJE FINAL DE DESPEDIDA & PIE DE PAPELERÍA
             ================================================================= */}
        <footer className="px-6 pt-4 pb-14 text-center reveal-item relative z-20">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="h-[1px] w-12 bg-[#5A1E28]/40"></span>
            <span className="text-[#5A1E28] text-sm">♥</span>
            <span className="h-[1px] w-12 bg-[#5A1E28]/40"></span>
          </div>

          <h2 className="font-script text-5xl text-[#2C2C2A] mb-3">
            ¡Te esperamos!
          </h2>

          <p className="font-serif italic text-base text-[#2C2C2A]/85 max-w-xs mx-auto leading-relaxed">
            “El amor no consiste en mirarse el uno al otro, sino en mirar juntos en la misma dirección.”
          </p>

          <p className="font-display text-xs tracking-[0.3em] text-[#5C6B57] uppercase font-semibold mt-6">
            {config.novios.el} &amp; {config.novios.ella} • {config.fecha.textoCorto}
          </p>

          <p className="text-[10px] font-sans tracking-[0.2em] text-[#2C2C2A]/60 uppercase mt-4">
            Urubamba — Cusco, Perú
          </p>
        </footer>

      </main>

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

      {/* Toast Notification flotante para copiado */}
      {copyToast && (
        <div className="fixed bottom-6 z-50 bg-[#22281F] text-[#F7F4EE] font-sans text-xs tracking-wider px-5 py-2.5 rounded-full shadow-2xl border border-[#C5A059]/60 animate-bounce">
          {copyToast}
        </div>
      )}
    </div>
  );
}
