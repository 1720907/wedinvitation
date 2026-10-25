import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCountdown,
  formatRsvpMessage,
  buildWhatsAppLink,
  generateGoogleCalendarUrl
} from './weddingLogic';

test('calculateCountdown calculates correct days, hours, minutes and seconds for future date', () => {
  const mockNow = new Date('2026-06-25T12:00:00Z');
  const targetDate = new Date('2026-06-27T15:30:45Z');

  const result = calculateCountdown(targetDate, mockNow);

  assert.equal(result.isExpired, false);
  assert.equal(result.days, 2);
  assert.equal(result.hours, 3);
  assert.equal(result.minutes, 30);
  assert.equal(result.seconds, 45);
});

test('calculateCountdown returns isExpired = true when target date has passed', () => {
  const mockNow = new Date('2027-01-01T00:00:00Z');
  const targetDate = new Date('2026-06-27T15:00:00Z');

  const result = calculateCountdown(targetDate, mockNow);
  assert.equal(result.isExpired, true);
  assert.equal(result.days, 0);
  assert.equal(result.hours, 0);
});

test('formatRsvpMessage formats positive attendance with companions and note', () => {
  const msg = formatRsvpMessage('María Elena', true, 2, 'Menú vegetariano por favor', 'Lesly & Jonatan', '27.06.2026');
  
  assert.match(msg, /María Elena/);
  assert.match(msg, /¡Sí, asistiré con mucha alegría!/);
  assert.match(msg, /\+2 persona\(s\)/);
  assert.match(msg, /Menú vegetariano por favor/);
  assert.match(msg, /27\.06\.2026/);
});

test('buildWhatsAppLink sanitizes phone number and encodes message correctly', () => {
  const link = buildWhatsAppLink('+51 (999) 888-777', 'Hola novios');
  assert.equal(link, 'https://wa.me/51999888777?text=Hola%20novios');
});

test('generateGoogleCalendarUrl creates valid Google Calendar link', () => {
  const url = generateGoogleCalendarUrl(
    'Boda Lesly & Jonatan',
    'Ceremonia y Fiesta',
    'Templo San Pedro',
    '2026-06-27T16:00:00Z',
    '2026-06-28T04:00:00Z'
  );

  assert.match(url, /calendar\.google\.com\/calendar\/render/);
  assert.match(url, /Boda\+Lesly\+%26\+Jonatan/);
  assert.match(url, /20260627T160000Z/);
});
