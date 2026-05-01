const CUSTOM_HOLIDAYS = {
  'CN': {
    2026: {
      holidays: {
        '2026-05-01': '劳动节', '2026-05-02': '劳动节', '2026-05-03': '劳动节', '2026-05-04': '劳动节', '2026-05-05': '劳动节'
      },
      workdays: ['2026-05-09']
    }
  }
};
function isDateCustomHoliday(d) {
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return dateStr in CUSTOM_HOLIDAYS['CN'][2026].holidays;
}
function isDateCustomWorkday(d) {
  const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  return CUSTOM_HOLIDAYS['CN'][2026].workdays.includes(dateStr);
}
function getWorkDaysInMonth(year, month, restDays, upToDate) {
  let workdays = 0;
  const maxDays = new Date(year, month + 1, 0).getDate();
  const days = upToDate !== undefined ? Math.min(upToDate, maxDays) : maxDays;
  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    const day = d.getDay();
    const isStandardWeekend = restDays === 2 ? (day === 0 || day === 6) : (day === 0);
    const isHoliday = isDateCustomHoliday(d);
    const isWorkday = isDateCustomWorkday(d);
    
    if (isHoliday) {
      // no
    } else if (isWorkday) {
      workdays++;
    } else if (!isStandardWeekend) {
      workdays++;
    }
  }
  return workdays;
}

const currentMonthWorkDays = getWorkDaysInMonth(2026, 4, 2);
const pastWorkDaysThisMonth = getWorkDaysInMonth(2026, 4, 2, 1);
const earnedThisMonth = Math.max(0, pastWorkDaysThisMonth * (25000 / currentMonthWorkDays));
console.log({ currentMonthWorkDays, pastWorkDaysThisMonth, earnedThisMonth });
