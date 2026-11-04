export function greet(name, now = new Date()) {
  if (!(now instanceof Date) || Number.isNaN(now.getTime())) {
    throw new TypeError('now must be a valid Date');
  }
  const hour = now.getHours();
  if (hour >= 5 && hour < 12) return `Guten Morgen ${name}`;
  if (hour >= 12 && hour < 18) return `Hallo ${name}`;
  return `Guten Abend ${name}`;
}

export function farewell(name) {
  return `Tschüss ${name}`;
}
