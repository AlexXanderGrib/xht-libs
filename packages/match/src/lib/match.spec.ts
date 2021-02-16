import { createMatcher, createTMatcher } from './match';

describe('Matcher', () => {
  test('T Matcher', () => {
    type _InputConnectionType = 'consumer' | 'corporate' | 'hosting';
    type _OutputConnectionType = 'user' | 'enterprise' | 'hosting';

    const matcher = createTMatcher({
      consumer: 'user',
      corporate: 'enterprise',
      hosting: 'hosting',
    } as const);

    const receiverConnectionType = 'corporate' as _InputConnectionType;

    const outputConnectionType: _OutputConnectionType = matcher(
      receiverConnectionType
    );

    expect(outputConnectionType).toBe('enterprise');
  });

  test('Matcher', () => {
    class Test1 {
      static match(subject) {
        return (
          typeof subject === 'object' && subject && subject instanceof this
        );
      }
    }

    class Test2 extends Test1 {}

    const matcher = createMatcher<any, any>([
      [Test2, 2],
      [Test1, 1],

      ['a', 'b'],
    ]);

    expect(matcher(new Test1())).toBe(1);
    expect(matcher(new Test2())).toBe(2);
    expect(matcher('a')).toBe('b');
    expect(matcher(Test1)).toBe(undefined);
  });
});
