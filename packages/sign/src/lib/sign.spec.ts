import { generateKeyPairSync, randomBytes } from 'crypto';
import {
  AsymmetricAuthority,
  Authority,
  AuthorityFacade,
  HmacAuthority,
} from './sign';

describe('Crypto', () => {
  const someObject = {
    a: 'b',
    data: 1.009,
    env: process.env,
  };

  const someBuffer = randomBytes(8);
  const someString = someBuffer.toString();

  const _ = <D, S>(authority: Authority<D, S>, data: D) => {
    const signature = authority.sign(data);

    return authority.check(data, signature);
  };

  const suit = (authority: Authority) => {
    const facade = new AuthorityFacade(authority, JSON.stringify);

    test('w/ String', () => expect(_(authority, someString)).toBeTruthy());
    test('w/ String', () => expect(_(authority, someBuffer)).toBeTruthy());
    test(`w/ Object + ${AuthorityFacade.name}`, () => {
      expect(_(facade, someObject)).toBeTruthy();
    });
  };

  describe(HmacAuthority.name, () => {
    const authority = new HmacAuthority(someString);

    suit(authority);
  });

  describe(AsymmetricAuthority.name, () => {
    const { privateKey, publicKey } = generateKeyPairSync('ec', {
      namedCurve: 'sect239k1',
    });

    const authority = new AsymmetricAuthority(publicKey, privateKey);

    suit(authority);
  });
});
