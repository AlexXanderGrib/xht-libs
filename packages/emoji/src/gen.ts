import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(
  readFileSync(__dirname + '/../emoji.json', { encoding: 'utf8' })
);

const compat = Object.entries<string>(
  JSON.parse(
    readFileSync(__dirname + '/../emoji.compat.json', { encoding: 'utf8' })
  )
);

let code = 'export const emoji = {\n';

const map = new Map<string, { description?: string; value: string }>();

for (const { emoji, description, aliases } of data) {
  const currentCompat = compat
    .filter(([, value]) => value === emoji)
    .map(([key]) => key.toLowerCase());

  currentCompat.length > 0 && console.log(currentCompat);

  const names = new Set<string>([...currentCompat, ...aliases]);

  Array.from(names).forEach((name) =>
    map.set(name, { value: emoji, description })
  );
}

const entries = Array.from(map).sort(([k1], [k2]) =>
  k1 > k2 ? 1 : k1 < k2 ? -1 : 0
);

for (const [name, { value: emoji, description }] of entries) {
  code += `\t/** ${emoji} - ${description} */\n\t"${name}": "${emoji}", \n`;
}

code += '\n};';

writeFileSync(__dirname + '/./lib/data.ts', code);
