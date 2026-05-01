const CUSTOM_HOLIDAYS = {
  'VN': {
    2026: {
      holidays: { '2026-05-01': '劳动节' },
      workdays: []
    }
  }
};
function isDateCustomHoliday(date, region) {
  const year = date.getFullYear();
  const dateStr = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  const regionData = CUSTOM_HOLIDAYS[region];
  if (!regionData || !regionData[year]) return false;
  return dateStr in regionData[year].holidays;
}
function isDateCustomWorkday(date, region) {
  return false;
}
const getWorkDaysInMonth = (year, month, region, restDays, upToDate) => {
  let workdays = 0;
  const maxDays = new Date(year, month + 1, 0).getDate();
  const days = upToDate !== undefined ? Math.min(upToDate, maxDays) : maxDays;
  for (let i = 1; i <= days; i++) {
    const d = new Date(year, month, i);
    const day = d.getDay();
    const isStandardWeekend = restDays === 2 ? (day === 0 || day === 6) : (day === 0);
    if (isDateCustomHoliday(d, region)) {
      // not
    } else if (isDateCustomWorkday(d, region)) {
      workdays++;
    } else if (!isStandardWeekend) {
      workdays++;
    }
  }
  return workdays;
};

const d = new Date('2026-05-02T00:50:07+07:00');
const year = d.getFullYear();
const month = d.getMonth();
const upToDate = Math.max(0, d.getDate() - 1);
console.log("Calculated:", getWorkDaysInMonth(year, month, 'VN', 2, upToDate));
