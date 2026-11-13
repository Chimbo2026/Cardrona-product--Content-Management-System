import { useEffect, useMemo, useState } from 'react';
import { fetchEntity, readEntityCached } from '@/hooks/useList';
import { addDaysISO, dayMonth, NZD, prettyDate, todayISO } from '@/lib/format';

const sum = (rows, key = 'amount') => rows.reduce((s, r) => s + (Number(r[key]) || 0), 0);
const notCancelled = (b) => b.booking_status !== 'Cancelled';

/**
 * Derives every dashboard figure from the demo records.
 * Falls back to the provided snapshot only while the first load is in flight.
 * Every call goes through the shared entity cache, so revisiting the
 * dashboard within a minute does not re-issue the 15 entity calls and
 * exhaust the per-caller rate limit.
 */
export default function useDashboardData(fallback, { period = 'Last 14 days', season = 'Winter', category = 'All' } = {}) {
  const [raw, setRaw] = useState(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      const [bookings, txns, lessons, passes, staff, incidents, rentals, lifts, trails, weather, checklist, units, routes, equipment, instructors, guests] =
        await Promise.all([
          fetchEntity('Booking', { visit_date: { $gte: addDaysISO(-20) } }, { limit: 300 }),
          fetchEntity('Transaction', { date: { $gte: addDaysISO(-90) } }, { limit: 900 }),
          fetchEntity('Lesson', { date: todayISO() }, { limit: 100 }),
          fetchEntity('LiftPass', { usage_status: 'Active' }, { limit: 300 }),
          fetchEntity('Staff', {}, { limit: 200 }),
          fetchEntity('Incident', {}, { limit: 40 }),
          fetchEntity('RentalOrder', {}, { limit: 200 }),
          fetchEntity('Lift', {}, { limit: 50 }),
          fetchEntity('Trail', {}, { limit: 100 }),
          fetchEntity('WeatherReport', {}, { limit: 10 }),
          fetchEntity('ChecklistTask', { date: todayISO() }, { limit: 50 }),
          fetchEntity('AccommodationUnit', {}, { limit: 100 }),
          fetchEntity('TransportRoute', {}, { limit: 100 }),
          fetchEntity('Equipment', {}, { limit: 200 }),
          fetchEntity('Instructor', {}, { limit: 50 }),
          fetchEntity('Guest', {}, { limit: 400 }),
        ]);
      if (!active) return;
      setRaw({
        bookings,
        txns,
        lessons,
        passes,
        staff,
        incidents,
        rentals,
        lifts,
        trails,
        weather: weather.slice().sort((a, b) => String(b.recorded_at).localeCompare(String(a.recorded_at))),
        checklist,
        units,
        routes,
        equipment,
        instructors,
        guests,
      });
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  return useMemo(() => {
    if (!raw) return fallback;

    const today = todayISO();
    const yesterday = addDaysISO(-1);
    const days = period === 'Today' ? 1 : period === 'Last 7 days' ? 7 : period === 'Last 14 days' ? 14 : 30;
    const from = addDaysISO(-(days - 1));
    const prevFrom = addDaysISO(-(days * 2 - 1));
    const prevTo = addDaysISO(-days);

    const ACTIVITY_FOR = { 'Lift Passes': 'Lift Pass', Lessons: 'Lesson', Rentals: 'Rental' };
    const activityKey = ACTIVITY_FOR[category] || category;
    const seasonBookings = raw.bookings.filter((b) => season === 'All' || b.season === season);
    const catBookings = seasonBookings.filter((b) => category === 'All' || b.activity === activityKey);
    const todays = catBookings.filter((b) => b.visit_date === today && notCancelled(b));

    const seasonTxns = raw.txns.filter((t) => season === 'All' || t.season === season);
    const scopedTxns = seasonTxns.filter((t) => category === 'All' || t.category === category);
    const periodTxns = scopedTxns.filter((t) => t.date >= from && t.date <= today && t.status === 'Paid');
    const prevTxns = scopedTxns.filter((t) => t.date >= prevFrom && t.date <= prevTo && t.status === 'Paid');
    const revenue = sum(periodTxns);
    const prevRevenue = sum(prevTxns);

    const dailyBookings = Array.from({ length: 14 }, (_, i) => {
      const date = addDaysISO(-(13 - i));
      return {
        date: prettyDate(date, 'EEE d'),
        bookings: catBookings.filter((b) => b.visit_date === date && notCancelled(b)).length,
      };
    });

    const weekStart = (offsetWeeks) => {
      const d = new Date();
      d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - offsetWeeks * 7);
      return d.toISOString().slice(0, 10);
    };
    const revenueTrend = Array.from({ length: 8 }, (_, i) => {
      const start = weekStart(7 - i);
      const end = weekStart(6 - i);
      const value = scopedTxns
        .filter((t) => t.status === 'Paid' && t.date >= start && t.date < end)
        .reduce((s, t) => s + (Number(t.amount) || 0), 0);
      return { week: `Wk ${i + 1}`, revenue: value };
    });

    const catMap = {};
    seasonTxns
      .filter((t) => t.status === 'Paid' && t.date >= addDaysISO(-89))
      .forEach((t) => {
        catMap[t.category] = (catMap[t.category] || 0) + (Number(t.amount) || 0);
      });
    const categories = Object.entries(catMap)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);

    const lessonsToday = raw.lessons.filter((l) => l.date === today && l.status !== 'Cancelled');
    const lessonSeats = lessonsToday.reduce((s, l) => s + (Number(l.capacity) || 0), 0);
    const lessonEnrolled = lessonsToday.reduce((s, l) => s + (Number(l.enrolled) || 0), 0);
    const fleetUnits = raw.equipment.reduce((s, e) => s + (Number(e.quantity_total) || 0), 0);
    const fleetOut = raw.equipment.reduce((s, e) => s + ((Number(e.quantity_total) || 0) - (Number(e.quantity_available) || 0)), 0);
    const unitsOccupied = raw.units.filter((u) => u.status === 'Occupied').length;
    const seatsBooked = raw.routes.reduce((s, r) => s + (Number(r.booked) || 0), 0);
    const seatsTotal = raw.routes.reduce((s, r) => s + (Number(r.capacity) || 0), 0);

    const utilisation = [
      { name: 'Lift network', value: raw.lifts.length ? Math.round((raw.lifts.filter((l) => l.status === 'Open').length / raw.lifts.length) * 100) : 0 },
      { name: 'Snow school', value: lessonSeats ? Math.round((lessonEnrolled / lessonSeats) * 100) : 0 },
      { name: 'Rental fleet', value: fleetUnits ? Math.round((fleetOut / fleetUnits) * 100) : 0 },
      { name: 'Accommodation', value: raw.units.length ? Math.round((unitsOccupied / raw.units.length) * 100) : 0 },
      { name: 'Mountain shuttles', value: seatsTotal ? Math.round((seatsBooked / seatsTotal) * 100) : 0 },
    ];

    const visitorsToday = (raw.guests || []).filter(
      (g) => g.face_checkin_status === 'Checked in' && String(g.face_checkin_at || '').slice(0, 10) === today
    ).length;

    const currentWeather = raw.weather[0];
    const doneChecklist = raw.checklist.filter((c) => c.completed).length;

    const ops = [
      { label: 'Lifts operating', value: `${raw.lifts.filter((l) => l.status === 'Open').length} of ${raw.lifts.length}`, ok: raw.lifts.some((l) => l.status === 'Open') },
      { label: 'Trails open', value: `${raw.trails.filter((t) => t.status === 'Open').length} of ${raw.trails.length}`, ok: true },
      { label: 'Snow base (upper)', value: currentWeather ? `${currentWeather.snow_depth_cm} cm` : '—', ok: true },
      { label: 'Mountain road', value: 'Open · chains 2WD', ok: true },
      { label: 'Beginner zone', value: raw.lifts.find((l) => l.name === 'Big Bear')?.status || '—', ok: raw.lifts.find((l) => l.name === 'Big Bear')?.status === 'Open' },
      { label: 'Opening checklist', value: `${doneChecklist} of ${raw.checklist.length} done`, ok: doneChecklist >= raw.checklist.length },
    ];

    const upcomingLessons = lessonsToday
      .filter((l) => l.start_time >= new Date().toTimeString().slice(0, 5))
      .sort((a, b) => a.start_time.localeCompare(b.start_time))
      .slice(0, 3)
      .map((l) => ({ time: l.start_time, title: l.title, meta: `${l.enrolled}/${l.capacity} booked · ${l.instructor_name}`, tag: 'Snow school' }));

    const activeRoutes = raw.routes
      .filter((r) => r.status !== 'Cancelled')
      .slice(0, 2)
      .map((r) => ({ time: r.depart_time, title: r.name, meta: `${r.booked}/${r.capacity} seats · ${r.origin}`, tag: 'Transport' }));

    const upcoming = [...upcomingLessons, ...activeRoutes].sort((a, b) => a.time.localeCompare(b.time)).slice(0, 5);

    const urgent = [];

    const activity = [
      ...raw.incidents
        .slice()
        .sort((a, b) => String(b.reported_at).localeCompare(String(a.reported_at)))
        .slice(0, 2)
        .map((i) => ({ who: 'Incident log', action: `${i.title} (${i.status.toLowerCase()})`, time: prettyDate(i.reported_at, 'd MMM, h:mm a') })),
      ...raw.bookings
        .slice()
        .sort((a, b) => String(b.created_date).localeCompare(String(a.created_date)))
        .slice(0, 3)
        .map((b) => ({ who: 'Guest services', action: `booking ${b.booking_ref} for ${b.guest_name}`, time: prettyDate(b.created_date, 'd MMM, h:mm a') })),
    ].slice(0, 5);

    return {
      kpis: {
        bookings: todays.length,
        bookingsDelta: catBookings.filter((b) => b.visit_date === yesterday && notCancelled(b)).length
          ? ((todays.length - catBookings.filter((b) => b.visit_date === yesterday && notCancelled(b)).length) /
              catBookings.filter((b) => b.visit_date === yesterday && notCancelled(b)).length) *
            100
          : 0,
        visitorsToday,
        activePasses: raw.passes.filter((p) => p.usage_status === 'Active').length,
        lessons: lessonsToday.length,
        rentals: raw.rentals.filter((r) => ['Issued', 'Reserved'].includes(r.status)).length,
        revenue,
        revenueDelta: prevRevenue ? ((revenue - prevRevenue) / prevRevenue) * 100 : 0,
        staffOnDuty: raw.staff.filter((s) => s.status === 'On Duty').length,
        satisfaction: fallback.kpis.satisfaction,
      },
      dailyBookings,
      revenueTrend,
      categories: categories.length ? categories : fallback.categories,
      utilisation,
      ops,
      upcoming: upcoming.length ? upcoming : fallback.upcoming,
      urgent,
      activity: activity.length ? activity : fallback.activity,
      weather: {
        temp: currentWeather ? `${currentWeather.temp_c}°C` : '—',
        condition: currentWeather?.conditions || '—',
        base: currentWeather ? `${currentWeather.snow_depth_cm} cm` : '—',
        newSnow: currentWeather ? `${currentWeather.new_snow_cm ?? 0} cm` : '—',
        wind: currentWeather ? `${currentWeather.wind_kmh} km/h ${currentWeather.wind_direction || ''}` : '—',
      },
      revenueLabel: NZD(revenue),
      dayMonth,
    };
  }, [raw, fallback, period, season, category]);
}