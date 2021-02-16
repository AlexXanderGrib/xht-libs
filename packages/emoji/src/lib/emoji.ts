import { emoji } from './data';

export { emoji };

const entries = Object.entries(emoji);

export const map = new Map<keyof typeof emoji, string>(entries as []);

export function random(count = 1) {
  const emojis: string[] = [];

  for (let i = 0; i < count; i++) {
    const [, char] = entries[Math.floor(Math.random() * entries.length)];

    emojis.push(char);
  }

  return emojis;
}

export function namesOf(emoji: string) {
  const names: string[] = [];

  for (const [name, value] of entries) {
    if (value === emoji) names.push(name);
  }

  return names;
}
