export function getEpochTime() {
  return Math.floor(Date.now() / 1000);
}

export function timeToEpochFromBase(timeStr, baseEpoch) {
  var parts = timeStr.split(':');
  var hours = parseInt(parts[0], 10);
  var minutes = parseInt(parts[1], 10);

  var baseDate = new Date(baseEpoch * 1000);
  var targetDate = new Date(
    baseDate.getFullYear(),
    baseDate.getMonth(),
    baseDate.getDate(),
    hours,
    minutes,
    0,
    0
  );

  return Math.floor(targetDate.getTime() / 1000);
}

export function timeStringToEpoch(timeString) {
  var parts = timeString.split(':');
  var hours = parseInt(parts[0], 10);
  var minutes = parseInt(parts[1], 10);
  var seconds = parseInt(parts[2], 10);

  if (
    isNaN(hours) || hours < 0 || hours > 23 ||
    isNaN(minutes) || minutes < 0 || minutes > 59 ||
    isNaN(seconds) || seconds < 0 || seconds > 59
  ) {
    throw new Error('Invalid time format. Expected "HH:mm:ss"');
  }

  return (hours * 3600 + minutes * 60 + seconds) * 1000;
}
