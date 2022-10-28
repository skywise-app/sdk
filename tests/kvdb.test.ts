import { kvdb } from '../src';

describe('kvdb', () => {
    beforeAll(() => {
        class LocalStorageMock {
            store: Record<string, string> = {};

            clear() {
                this.store = {};
            }

            getItem(key: string) {
                return key in this.store ? this.store[key] : null;
            }

            setItem(key: string, value: string | number) {
                this.store[key] = String(value);
            }

            removeItem(key: string) {
                delete this.store[key];
            }
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        global.localStorage = new LocalStorageMock();
    });

    afterEach(() => {
        global.localStorage.clear();
    });

    it('get / set', () => {
        expect(kvdb.get('test')).toBe(null);

        kvdb.set('test', 1);
        expect(kvdb.get('test')).toBe(1);

        kvdb.set('test', '2');
        expect(kvdb.get('test')).toBe(2);

        kvdb.set('test', 'a');
        expect(kvdb.get('test')).toBe('a');

        kvdb.set('test', [1, '2']);
        expect(kvdb.get('test')).toEqual([1, '2']);

        kvdb.set('test', []);
        expect(kvdb.get('test')).toEqual([]);

        kvdb.set('test', {});
        expect(kvdb.get('test')).toEqual({});

        kvdb.set('test', { a: 1 });
        expect(kvdb.get('test')).toEqual({ a: 1 });
    });

    it('add to list', () => {
        expect(kvdb.get('test')).toBe(null);

        kvdb.addToList('test', 1);
        expect(kvdb.get('test')).toEqual([1]);

        kvdb.addToList('test', '2');
        expect(kvdb.get('test')).toEqual([1, '2']);

        kvdb.addToList('test', '1');
        expect(kvdb.get('test')).toEqual([1, '2', '1']);

        kvdb.addToList('test', 1);
        expect(kvdb.get('test')).toEqual([1, '2', '1']);
    });

    it('remove from list', () => {
        expect(kvdb.get('test')).toBe(null);

        kvdb.removeFromList('test', 1);
        expect(kvdb.get('test')).toEqual([]);

        kvdb.addToList('test', 1);
        expect(kvdb.get('test')).toEqual([1]);

        kvdb.removeFromList('test', '1');
        expect(kvdb.get('test')).toEqual([1]);

        kvdb.removeFromList('test', 1);
        expect(kvdb.get('test')).toEqual([]);
    });
});
