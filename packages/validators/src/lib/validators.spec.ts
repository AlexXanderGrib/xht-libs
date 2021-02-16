import * as v from './validators';

describe('Validators', () => {
  test(v.isClass.name, () => {
    class A {}

    expect(v.isClass(A)).toBeTruthy();
    expect(v.isClass(() => A)).toBeFalsy();
  });

  test(v.isCallable.name, () => {
    class B {}

    expect(v.isCallable(B)).toBeFalsy();
    expect(v.isCallable(() => B)).toBeTruthy();
  });

  test(v.hasProp.name, () => {
    const prop = '1';
    const value = Math.random();

    const object: unknown = {
      [prop]: value,
    };

    expect(v.hasProp(object, prop)).toBeTruthy();
    expect(v.hasProp(object, prop) && object[prop]).toBe(value);
    expect(v.hasProp(object, value)).toBeFalsy();
  });
});
