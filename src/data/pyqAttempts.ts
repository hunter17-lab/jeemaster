// Shared mapping of months available per JEE Main year (shift-wise from 2019+)
export const PYQ_SHIFT_START_YEAR = 2019;

export const getMonthsForYear = (year: number | string): string[] => {
  const y = Number(year);
  if (y === 2020) return ["January", "September"];
  if (y === 2021) return ["February", "March", "July", "August"];
  if (y === 2022) return ["June", "July"];
  // Default for 2019, 2023, 2024, 2025+
  return ["January", "April"];
};

export const PYQ_SHIFTS = ["Shift 1", "Shift 2"] as const;

export const monthEmoji: Record<string, string> = {
  January: "❄️",
  February: "💝",
  March: "🌷",
  April: "🌸",
  June: "☀️",
  July: "🌞",
  August: "🏖️",
  September: "🍂",
};
