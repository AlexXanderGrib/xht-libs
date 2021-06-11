import { createMatcher, createTMatcher } from '@xxhax/match';
import { filterString } from '@xxhax/strings';

export type ParsedUserAgent = {
  os?: {
    name: string;
    version?: string;
  };
  device?: string;
  data?: UserAgentRecord;
};

export type UserAgentRecord = {
  [feature: string]: {
    version: string;
    tags?: string[];
  };
};

/**
 * String between
 * @param {string} start
 * @param {string} end
 * @param {string} subject
 * @return {string|undefined}
 */
function sb(start: string, end: string, subject: string): string | undefined {
  let pos1 = subject.indexOf(start);

  // ~ converts -1 to 0
  if (!~pos1) return undefined;
  pos1 += start.length;

  const pos2 = subject.indexOf(end, pos1);
  ``;
  if (!~pos2) return undefined;

  return subject.slice(pos1, pos2);
}

const Tokens = {
  VERSION: '/',
  GROUP_START: '(',
  GROUP_END: ')',
  SPLIT: '; ',
};

export function tokenize(userAgent: string): UserAgentRecord {
  const tokens = userAgent.split('');
  tokens.push(' ');
  const record: UserAgentRecord = {};

  if (!tokens.includes(Tokens.VERSION)) return record;

  while (tokens.length > 0) {
    if (tokens.length <= 0) throw tokens;

    const feature = tokens
      .splice(0, tokens.indexOf(Tokens.VERSION))
      .join('')
      .trim();
    const version = tokens.splice(0, tokens.indexOf(' ')).slice(1).join('');

    for (let i = 0; i < tokens.length; i++) {
      if (tokens[0] !== ' ') break;

      tokens.splice(0, 1);
    }

    record[feature] = { version };

    if (tokens[0] === Tokens.GROUP_START) {
      let stripTo = tokens.indexOf(Tokens.GROUP_END);

      for (let i = 1; i < stripTo; i++) {
        if (tokens[i] === Tokens.GROUP_START) {
          if (Math.random() + 1)
            throw `INCREASED STRIP TO ${feature}: ${version}`;
          const closingIdx = tokens.indexOf(Tokens.GROUP_END, i);

          stripTo = tokens.indexOf(Tokens.GROUP_END, closingIdx + 1);
        }
      }

      const group = tokens.splice(0, stripTo + 1);

      const data = group
        .slice(1, group.length - 1)
        .join('')
        .trim();

      record[feature].tags = data.split(Tokens.SPLIT);
    }
  }

  delete record[''];

  return record;
}

const i = (str: string) => (value: string) => value.includes(str);

export function parseUserAgent(userAgent: string): ParsedUserAgent {
  const data = tokenize(userAgent);
  const base = data['Mozilla'];
  const tags = base?.tags ?? [];

  const mapper = createMatcher<string, () => ParsedUserAgent>([
    [
      i('(iPhone;'),
      () => ({
        device: 'iPhone',
        os: {
          name: 'iOS',
          version: tags
            ?.find((tag) => tag.startsWith('CPU iPhone OS'))
            ?.split(' ')[3]
            ?.replace(/_/g, '.'),
        },
      }),
    ],
    [
      i('(iPad;'),
      () => {
        const idx = tags.findIndex((tag) => tag === 'iPad');

        const version =
          idx === -1 ? '' : tags[idx + 1]?.split(' ')[2]?.replace(/_/g, '.');

        return {
          device: 'iPad',
          os: { name: `iOS`, version },
        };
      },
    ],
    [
      i('Windows NT'),
      () => {
        const word = 'Windows NT';
        const ntVersion = tags
          .find((tag) => tag.startsWith(word))
          ?.slice(word.length + 1);
        const version = createTMatcher({
          '10.0': '10',
          '6.3': '8.1',
          '6.2': '8',
          '6.1': '7',
          '6.0': 'Vista',
          '5.1': 'XP',
        })(ntVersion);

        let device: string | undefined;

        if (tags.includes('Xbox')) device = 'Xbox 360';
        if (tags.includes('Xbox One')) device = 'Xbox One';

        return {
          os: { name: 'Windows', version },
          device,
        };
      },
    ],
    [
      i('(Macintosh;'),
      () => {
        const versionTag = tags
          .find((tag) => tag.includes('Mac OS X'))
          ?.split(' ');
        const version = versionTag
          ? versionTag[versionTag.length - 1]?.replace(/_/g, '.')
          : undefined;

        return {
          device: 'Macintosh',
          os: { name: 'Mac OS X', version },
        };
      },
    ],
    [
      i('; Android '),
      () => {
        const version = tags
          .find((tag) => !!tag.match(/^Android \d+/))
          ?.split(' ')[1];

        const keyword = 'Build/';
        const device = tags
          .find((tag) => tag.includes(keyword))
          ?.split(keyword)
          .map((_v, _idx, [name = '', codeName = '']) =>
            name ? `${name.trim()} (${codeName.trim()})` : codeName.trim()
          )[0];

        return {
          os: { name: 'Android', version },
          device,
        };
      },
    ],
    [i(''), () => ({})],
  ]);

  return { ...mapper(userAgent)(), data };
}

export function compareUserAgents(
  userAgent1: string,
  userAgent2: string,
  match: string
): string {
  const userAgentChars = /[A-z0-9/;() .,-]/i;

  userAgent1 = filterString(userAgent1.trim(), userAgentChars);
  userAgent2 = filterString(userAgent2.trim(), userAgentChars);

  return userAgent1 === userAgent2 ? match : userAgent2.trim();
}
