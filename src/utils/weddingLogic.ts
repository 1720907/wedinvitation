export interface CountdownResult {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
}

export function calculateCountdown(targetDate: string | Date, now: Date = new Date()): CountdownResult {
  const targetMs = new Date(targetDate).getTime();
  const currentMs = now.getTime();
  const diffMs = targetMs - currentMs;

  if (diffMs <= 0 || isNaN(diffMs)) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  const secondsTotal = Math.floor(diffMs / 1000);
  const days = Math.floor(secondsTotal / (3600 * 24));
  const hours = Math.floor((secondsTotal % (3600 * 24)) / 3600);
  const minutes = Math.floor((secondsTotal % 3600) / 60);
  const seconds = secondsTotal % 60;

  return {
    days,
    hours,
    minutes,
    seconds,
    isExpired: false
  };
}

export function formatRsvpMessage(
  guestName: string,
  willAttend: boolean,
  companionsCount: number = 0,
  note: string = '',
  coupleNames: string = 'Jorge & Adriana',
  weddingDate: string = '27.06.2026'
): string {
  const cleanName = guestName.trim() || 'Invitado/a';
  const statusText = willAttend
    ? '¡Sí, asistiré con mucha alegría!'
    : 'Lamentablemente no podré acompañarlos, pero les envío un fuerte abrazo.';
  
  let msg = `¡Hola ${coupleNames}! Soy *${cleanName}*.\n\n${statusText}\nFecha del evento: ${weddingDate}`;
  
  if (willAttend && companionsCount > 0) {
    msg += `\nAcompañantes: +${companionsCount} persona(s)`;
  }
  
  if (note && note.trim().length > 0) {
    msg += `\nNota / Mensaje: ${note.trim()}`;
  }

  return msg;
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const sanitizedPhone = phone.replace(/[^0-9]/g, '');
  return `https://wa.me/${sanitizedPhone}?text=${encodeURIComponent(message)}`;
}

export function generateGoogleCalendarUrl(
  title: string,
  details: string,
  location: string,
  startIso: string,
  endIso: string
): string {
  const formatUtc = (isoStr: string) => {
    const d = new Date(isoStr);
    return d.toISOString().replace(/-|:|\.\d+/g, '');
  };

  const dates = `${formatUtc(startIso)}/${formatUtc(endIso)}`;
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    details: details,
    location: location,
    dates: dates
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
