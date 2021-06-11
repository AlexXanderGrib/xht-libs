import { ParsedUserAgent, parseUserAgent } from './user-agent-parser';

const samples: [string, string, ParsedUserAgent][] = [
  [
    'Xbox One',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; Xbox; Xbox One) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.102 Safari/537.36 Edge/18.19041',
    {
      os: { name: 'Windows', version: '10' },
      device: 'Xbox One',
    },
  ],
  [
    'Android 8 ',
    'Mozilla/5.0 (Linux; Android 8.0.0; SM-N9500 Build/R16NW; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/63.0.3239.83 Mobile Safari/537.36 T7/10.13 baiduboxapp/10.13.0.11 (Baidu; P1 8.0.0)',
    {
      device: 'SM-N9500 (R16NW)',
      os: {
        name: 'Android',
        version: '8.0.0',
      },
    },
  ],
  [
    'iPhone 7 (FaceBook App)',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 12_4_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 [FBAN/FBIOS;FBDV/iPhone9,2;FBMD/iPhone;FBSN/iOS;FBSV/12.4.1;FBSS/3;FBID/phone;FBLC/en_US;FBOP/5;FBCR/Sprint]',
    {
      device: 'iPhone',
      os: {
        name: 'iOS',
        version: '12.4.1',
      },
    },
  ],
  [
    'XXHAX Test Client (made up)',
    'XXHAX Test Client/1.4.8.8',
    {
      data: {
        'XXHAX Test Client': {
          version: '1.4.8.8'
        }
      }
    }
  ]
];

describe('User Agent Parser', () => {
  for (const [testName, userAgent, sample] of samples) {
    it(`should parse ${testName}'s user agent`, () =>
      expect(parseUserAgent(userAgent)).toMatchObject(sample));
  }
});
