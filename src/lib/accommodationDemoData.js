import { addDaysISO, todayISO } from '@/lib/format';
import { cardronaImage } from '@/lib/cardronaImages';

const today = todayISO();

export const accommodationDemoUnits = [
  { unit_name: 'Apartment 201', unit_type: 'Two Bedroom Apartment', rate_per_night: 360, image_url: cardronaImage('two-bedroom-apartment.webp'), guest_name: 'Sophie Larsen', guest_count: 3, booking_ref: 'CRD-2610', status: 'Occupied', check_in: addDaysISO(-2), check_out: addDaysISO(2) },
  { unit_name: 'Apartment 202', unit_type: 'Two Bedroom Apartment', rate_per_night: 360, image_url: cardronaImage('two-bedroom-apartment.webp'), guest_name: 'Ryo Nakamura', guest_count: 2, booking_ref: 'CRD-2525', status: 'Occupied', check_in: addDaysISO(-1), check_out: addDaysISO(3) },
  { unit_name: 'Apartment 203', unit_type: 'Two Bedroom Apartment', rate_per_night: 360, image_url: cardronaImage('two-bedroom-apartment.webp'), guest_name: '', guest_count: 2, booking_ref: '', status: 'Cleaning', check_in: '', check_out: '' },
  { unit_name: 'Apartment 204', unit_type: 'Two Bedroom Apartment', rate_per_night: 360, image_url: cardronaImage('two-bedroom-apartment.webp'), guest_name: 'Isla Mackenzie', guest_count: 4, booking_ref: 'CRD-2680', status: 'Occupied', check_in: addDaysISO(-3), check_out: addDaysISO(2) },
  { unit_name: 'Chalet 1', unit_type: 'Four Bedroom Apartment', rate_per_night: 480, image_url: cardronaImage('four-bedroom-apartment.webp'), guest_name: 'Emma Whitcombe', guest_count: 5, booking_ref: 'CRD-2524', status: 'Occupied', check_in: addDaysISO(-3), check_out: addDaysISO(2) },
  { unit_name: 'Chalet 2', unit_type: 'Four Bedroom Apartment', rate_per_night: 480, image_url: cardronaImage('four-bedroom-apartment.webp'), guest_name: 'Daniel Okafor', guest_count: 4, booking_ref: 'CRD-2559', status: 'Occupied', check_in: addDaysISO(-1), check_out: addDaysISO(1) },
  { unit_name: 'Studio 1', unit_type: 'Studio Apartment', rate_per_night: 220, image_url: cardronaImage('studio-apartment.webp'), guest_name: 'Freya Sanderson', guest_count: 2, booking_ref: 'CRD-2701', status: 'Occupied', check_in: addDaysISO(-2), check_out: addDaysISO(1) },
  { unit_name: 'Studio 2', unit_type: 'Studio Apartment', rate_per_night: 220, image_url: cardronaImage('studio-apartment.webp'), guest_name: '', guest_count: 2, booking_ref: '', status: 'Available', check_in: '', check_out: '' },
  { unit_name: 'Loft 3', unit_type: 'Three Bedroom Loft', rate_per_night: 420, image_url: cardronaImage('three-bedroom-loft.webp'), guest_name: 'Jack Rimu', guest_count: 4, booking_ref: 'CRD-2714', status: 'Reserved', check_in: today, check_out: addDaysISO(3) },
  { unit_name: 'Loft 4', unit_type: 'Three Bedroom Loft', rate_per_night: 420, image_url: cardronaImage('three-bedroom-loft.webp'), guest_name: 'Aria Patel', guest_count: 3, booking_ref: 'CRD-2698', status: 'Reserved', check_in: addDaysISO(2), check_out: addDaysISO(5) },
  { unit_name: 'Apartment 301', unit_type: 'Three Bedroom Apartment', rate_per_night: 410, image_url: cardronaImage('three-bedroom-apartment.webp'), guest_name: '', guest_count: 4, booking_ref: '', status: 'Available', check_in: '', check_out: '' },
  { unit_name: 'Apartment 302', unit_type: 'Three Bedroom Apartment', rate_per_night: 410, image_url: cardronaImage('three-bedroom-apartment.webp'), guest_name: '', guest_count: 4, booking_ref: '', status: 'Cleaning', check_in: today, check_out: '' },
];
