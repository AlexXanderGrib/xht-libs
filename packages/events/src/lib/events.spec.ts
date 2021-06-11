/* eslint-disable @typescript-eslint/no-explicit-any */
import { randomBytes } from 'crypto';
import { EventEmitter } from 'events';
import { EventBus } from './bus';
import { EventEmitter as TypedEmitter } from './emitter';
import { Subscription } from './shared';

type GenericEmitter = {
  on(event: string, cb: Subscription<any>): GenericEmitter;
  off(event: string, cb: Subscription<any>): GenericEmitter;
  once(event: string, cb: Subscription<any>): GenericEmitter;
  eventNames(): (keyof any)[];
  listeners(event: string): Subscription<any>[];
  emit(event: string, data: any): void;
};

describe('Events', () => {
  describe('Emitter', () => {
    const suit = (ee: GenericEmitter, name: string) => {
      test(`${name}.on`, () => {
        const fn = jest.fn();

        ee.on('event1', fn);
        ee.emit('event1', undefined);
        expect(fn).toHaveBeenCalledWith(undefined);

        ee.emit('event1', undefined);
        ee.emit('event1:fake', undefined);
        expect(fn).toBeCalledTimes(2);
      });

      test(`${name}.once`, () => {
        const fn = jest.fn();

        ee.once('event2', fn);
        ee.emit('event2', undefined);
        ee.emit('event2', undefined);

        expect(fn).toBeCalledTimes(1);
      });

      test(`${name}.listeners`, () => {
        expect(ee.listeners('nonexistent')).toEqual([]);

        const listener = () => void 0;

        ee.on('event3', listener);
        ee.on('event3', listener);

        expect(ee.listeners('event3').length).toBe(2);

        ee.off('event3', listener);
        expect(ee.listeners('event3').length).toBe(1);
      });

      test(`${name}.eventNames`, () => {
        const noop = () => void 0;

        ee.on('a', noop);
        ee.on('b', noop);

        const events = ee.eventNames();

        expect(events.includes('a')).toBeTruthy();
        expect(events.includes('b')).toBeTruthy();
        expect(events.includes('c')).toBeFalsy();
      });
    };

    suit(new EventEmitter() as any, 'events.EventEmitter');
    suit(new TypedEmitter(), 'xxhax.EventEmitter');
  });

  describe('Bus', () => {
    const bus = new EventBus<any>();

    test('Subscribe', () => {
      const fn = jest.fn();
      bus.subscribe(fn);

      const object = {
        id: Math.random(),
        data: randomBytes(10),
      };

      bus.emit(object);

      expect(fn).toBeCalledWith(object);
    });
  });
});
