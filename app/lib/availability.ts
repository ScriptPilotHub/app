import { addMinutes, areIntervalsOverlapping, format, isBefore, parse } from "date-fns";

export type AvailabilityWindow = {
  weekday: number;
  start_time: string;
  end_time: string;
};

export type BookingWindow = {
  start_time: string;
  end_time: string;
};

export function calculateSlots({
  date,
  durationMinutes,
  availability,
  existing
}: {
  date: Date;
  durationMinutes: number;
  availability: AvailabilityWindow[];
  existing: BookingWindow[];
}) {
  const weekday = date.getDay();
  const window = availability.find((slot) => slot.weekday === weekday);

  if (!window) {
    return [];
  }

  const start = parse(window.start_time, "HH:mm:ss", date);
  const end = parse(window.end_time, "HH:mm:ss", date);
  const slots: { label: string; start: Date; end: Date }[] = [];

  let cursor = start;
  while (isBefore(addMinutes(cursor, durationMinutes), addMinutes(end, 1))) {
    const slotEnd = addMinutes(cursor, durationMinutes);
    const overlaps = existing.some((booking) =>
      areIntervalsOverlapping(
        { start: cursor, end: slotEnd },
        {
          start: new Date(booking.start_time),
          end: new Date(booking.end_time)
        },
        { inclusive: false }
      )
    );

    if (!overlaps) {
      slots.push({ label: format(cursor, "h:mm a"), start: cursor, end: slotEnd });
    }

    cursor = addMinutes(cursor, 15);
  }

  return slots;
}
