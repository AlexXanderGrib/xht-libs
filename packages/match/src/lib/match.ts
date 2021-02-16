import { hasProp, isCallable } from '@xxhax/validators';

/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Limited, by well-typed version of `createMatcher`
 * @template T Record
 * @param {T} mapping
 */
export function createTMatcher<T extends Record<any, any>>(mapping: T) {
  // Types are so scary
  return <S extends keyof any>(
    subject: S
  ): S extends keyof T ? T[S] : unknown => mapping[subject as keyof T];
}

type MatcherFN<Subject> = (something: Subject) => boolean;
type Matcher<Subject> =
  | Subject
  | MatcherFN<Subject>
  | { match: MatcherFN<Subject> };
type Mapping<K, V> = Iterable<[Matcher<K>, V]>;

function useMatcher<T>(m: Matcher<T>): MatcherFN<T> {
  if (isCallable(m)) return m;

  if (hasProp(m, 'match') && isCallable(m.match)) {
    return m.match;
  }

  return (something) => something === m;
}

export function createMatcher<K extends keyof any, V>(mapping: Mapping<K, V>) {
  return (arg: K): V | undefined => {
    for (const [matcher, value] of mapping) {
      const match = useMatcher(matcher);

      if (match(arg)) {
        return value;
      }
    }

    return undefined;
  };
}
