// SOURCE: ECG OFFICIAL LOAD MANAGEMENT SCHEDULE - APRIL 25 TO MAY 1, 2026

export const SCHEDULE_DATES = [
  { date: "2026-04-25", day: "Saturday",  slots: [{ group:"A", start:"06:00", end:"12:00" }, { group:"B", start:"12:00", end:"18:00" }, { group:"C", start:"18:00", end:"00:00" }, { group:"A", start:"00:00", end:"06:00" }] },
  { date: "2026-04-26", day: "Sunday",    slots: [{ group:"B", start:"06:00", end:"12:00" }, { group:"C", start:"12:00", end:"18:00" }, { group:"A", start:"18:00", end:"00:00" }, { group:"B", start:"00:00", end:"06:00" }] },
  { date: "2026-04-27", day: "Monday",    slots: [{ group:"C", start:"06:00", end:"12:00" }, { group:"A", start:"12:00", end:"18:00" }, { group:"B", start:"18:00", end:"00:00" }, { group:"C", start:"00:00", end:"06:00" }] },
  { date: "2026-04-28", day: "Tuesday",   slots: [{ group:"A", start:"06:00", end:"12:00" }, { group:"B", start:"12:00", end:"18:00" }, { group:"C", start:"18:00", end:"00:00" }, { group:"A", start:"00:00", end:"06:00" }] },
  { date: "2026-04-29", day: "Wednesday", slots: [{ group:"B", start:"06:00", end:"12:00" }, { group:"C", start:"12:00", end:"18:00" }, { group:"A", start:"18:00", end:"00:00" }, { group:"B", start:"00:00", end:"06:00" }] },
  { date: "2026-04-30", day: "Thursday",  slots: [{ group:"C", start:"06:00", end:"12:00" }, { group:"A", start:"12:00", end:"18:00" }, { group:"B", start:"18:00", end:"00:00" }, { group:"C", start:"00:00", end:"06:00" }] },
  { date: "2026-05-01", day: "Friday",    slots: [{ group:"A", start:"06:00", end:"12:00" }, { group:"B", start:"12:00", end:"18:00" }, { group:"C", start:"18:00", end:"00:00" }, { group:"A", start:"00:00", end:"06:00" }] },
];

// Helper: Get current group(s) in outage right now
export function getCurrentOutageGroups() {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");

  const today = SCHEDULE_DATES.find(d => d.date === dateStr);
  if (!today) return [];

  return today.slots
    .filter(slot => {
      if (slot.end === "00:00") return timeStr >= slot.start;
      if (slot.start === "00:00") return timeStr < slot.end;
      return timeStr >= slot.start && timeStr < slot.end;
    })
    .map(slot => slot.group);
}

// Helper: Get next outage slot for a given group today
export function getNextSlot(group) {
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0];
  const timeStr = now.getHours().toString().padStart(2, "0") + ":" + now.getMinutes().toString().padStart(2, "0");
  const today = SCHEDULE_DATES.find(d => d.date === dateStr);
  if (!today) return null;

  // Find next upcoming slot for this group today
  const upcoming = today.slots.find(slot => slot.group === group && slot.start > timeStr);
  if (upcoming) return { ...upcoming, date: today.date, day: today.day };

  // Check tomorrow
  const todayIndex = SCHEDULE_DATES.indexOf(today);
  if (todayIndex < SCHEDULE_DATES.length - 1) {
    const tomorrow = SCHEDULE_DATES[todayIndex + 1];
    const nextSlot = tomorrow.slots.find(s => s.group === group);
    if (nextSlot) return { ...nextSlot, date: tomorrow.date, day: tomorrow.day };
  }
  return null;
}
