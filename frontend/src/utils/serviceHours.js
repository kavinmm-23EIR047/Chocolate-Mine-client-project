/**
 * Service Hours Configuration and Utilities
 * Define business hours and check if current time is within service
 */

// Service hours in 24-hour format (IST)
// Modify these according to your business needs
export const SERVICE_HOURS = {
  enabled: true, // Toggle service hours check
  startTime: 9, // 9 AM
  endTime: 23, // 11 PM
  daysOfWeek: [0, 1, 2, 3, 4, 5, 6], // 0=Sunday to 6=Saturday (0-6 means everyday)
};

// You can also define per-day hours if needed
export const SERVICE_HOURS_DETAILED = {
  0: { enabled: false }, // Sunday: Closed
  1: { enabled: true, startTime: 9, endTime: 23 }, // Monday
  2: { enabled: true, startTime: 9, endTime: 23 }, // Tuesday
  3: { enabled: true, startTime: 9, endTime: 23 }, // Wednesday
  4: { enabled: true, startTime: 9, endTime: 23 }, // Thursday
  5: { enabled: true, startTime: 9, endTime: 23 }, // Friday
  6: { enabled: true, startTime: 9, endTime: 23 }, // Saturday
};

/**
 * Check if current time is within service hours
 * @returns {object} { isWithinHours: boolean, startTime: number, endTime: number, currentHour: number }
 */
export const isWithinServiceHours = () => {
  const now = new Date();
  const currentDay = now.getDay();
  const currentHour = now.getHours();

  // Check if service hours are enabled
  if (!SERVICE_HOURS.enabled) {
    return {
      isWithinHours: true,
      message: 'Service hours check disabled',
      currentHour,
      currentDay,
      enabled: false
    };
  }

  // Use detailed hours if available, otherwise use generic hours
  let dayConfig = SERVICE_HOURS_DETAILED[currentDay];
  
  let startTime = SERVICE_HOURS.startTime;
  let endTime = SERVICE_HOURS.endTime;
  let isServiceDay = true;

  if (dayConfig) {
    if (!dayConfig.enabled) {
      isServiceDay = false;
    } else {
      startTime = dayConfig.startTime || startTime;
      endTime = dayConfig.endTime || endTime;
    }
  } else {
    isServiceDay = SERVICE_HOURS.daysOfWeek.includes(currentDay);
  }

  if (!isServiceDay) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return {
      isWithinHours: false,
      message: `Closed on ${days[currentDay]}`,
      currentHour,
      currentDay,
      startTime,
      endTime,
      enabled: true
    };
  }

  const isWithinHours = currentHour >= startTime && currentHour < endTime;

  return {
    isWithinHours,
    message: isWithinHours 
      ? 'Within service hours' 
      : `Outside service hours (${startTime}:00-${endTime}:00)`,
    currentHour,
    currentDay,
    startTime,
    endTime,
    enabled: true,
    daysOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  };
};

/**
 * Get formatted service hours message
 */
export const getServiceHoursMessage = () => {
  const hours = isWithinServiceHours();
  if (!hours.enabled) {
    return 'Service hours check disabled';
  }

  const day = hours.daysOfWeek ? hours.daysOfWeek[hours.currentDay] : `Day ${hours.currentDay}`;
  
  if (!hours.isWithinHours) {
    if (hours.message.includes('Closed')) {
      return `Closed today (${day})`;
    }
    return `Outside service hours. Hours: ${hours.startTime}:00 - ${hours.endTime}:00`;
  }

  return `${day}, ${hours.currentHour}:00 - Service Active ✓`;
};

/**
 * Should we play notification sound?
 * Returns true if within service hours
 */
export const shouldPlayNotificationSound = () => {
  const hours = isWithinServiceHours();
  return hours.isWithinHours;
};

export default {
  isWithinServiceHours,
  getServiceHoursMessage,
  shouldPlayNotificationSound,
  SERVICE_HOURS,
  SERVICE_HOURS_DETAILED
};
