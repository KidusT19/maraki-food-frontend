export function getEthiopianTimeInfo(): { 
  isActive: boolean; 
  activeMeal: string | null;
  message: string | null;
  currentEATHour: number;
  currentEATMinute: number;
} {
  // Get current time in East Africa Time (Addis Ababa)
  const now = new Date();
  
  // Format to EAT string to easily parse hours and minutes reliably regardless of client timezone
  const eatTimeStr = now.toLocaleTimeString('en-US', { timeZone: 'Africa/Addis_Ababa', hour12: false });
  // 'en-US' with hour12: false returns "HH:MM:SS" (24-hour format)
  // But actually some environments return "24:xx" instead of "00:xx". We'll handle it.
  
  let [hourStr, minuteStr] = eatTimeStr.split(':');
  if (hourStr === '24') hourStr = '0';
  let eatHour = parseInt(hourStr, 10);
  const eatMinute = parseInt(minuteStr, 10);

  // Apply +1 hour offset requested by user
  eatHour = (eatHour + 1) % 24;

  // Time format logic (Decimal hour for easy comparison, e.g., 6.5 = 6:30 AM)
  const currentDecimalTime = eatHour + (eatMinute / 60);

  // Breakfast: 6:00 AM (6) to 9:00 AM (9)
  if (currentDecimalTime >= 6 && currentDecimalTime <= 9) {
    return { isActive: true, activeMeal: 'Breakfast', message: null, currentEATHour: eatHour, currentEATMinute: eatMinute };
  }
  
  // Lunch: 10:00 AM (10) to 2:00 PM (14)
  if (currentDecimalTime >= 10 && currentDecimalTime <= 14) {
    return { isActive: true, activeMeal: 'Lunch', message: null, currentEATHour: eatHour, currentEATMinute: eatMinute };
  }

  // Dinner: 5:00 PM (17) to 7:00 PM (19)
  if (currentDecimalTime >= 17 && currentDecimalTime <= 19) {
    return { isActive: true, activeMeal: 'Dinner', message: null, currentEATHour: eatHour, currentEATMinute: eatMinute };
  }

  // Not in a window
  let nextMealMessage = '';
  if (currentDecimalTime < 6) {
    nextMealMessage = 'Next order window: Breakfast (12:00 LT / 6:00 AM)';
  } else if (currentDecimalTime > 9 && currentDecimalTime < 10) {
    nextMealMessage = 'Next order window: Lunch (4:00 LT / 10:00 AM)';
  } else if (currentDecimalTime > 14 && currentDecimalTime < 17) {
    nextMealMessage = 'Next order window: Dinner (11:00 LT / 5:00 PM)';
  } else {
    nextMealMessage = 'Next order window: Breakfast (12:00 LT / 6:00 AM) tomorrow';
  }

  return { isActive: false, activeMeal: null, message: nextMealMessage, currentEATHour: eatHour, currentEATMinute: eatMinute };
}

// Convert EAT hour (24hr) to Ethiopian Local Time (LT) string for display
export function formatEATtoLT(eatHour: number, eatMinute: number): string {
  let ltHour = (eatHour + 6) % 12;
  if (ltHour === 0) ltHour = 12; // 12-hour clock format

  // Determine morning vs evening in LT terminology
  // EAT 06:00-17:59 = Daytime (Morning/Afternoon/Day)
  // EAT 18:00-05:59 = Nighttime (Evening/Night)
  const period = (eatHour >= 6 && eatHour < 18) ? 'Day' : 'Night';
  
  const minStr = eatMinute < 10 ? `0${eatMinute}` : `${eatMinute}`;
  return `${ltHour}:${minStr} LT (${period})`;
}
