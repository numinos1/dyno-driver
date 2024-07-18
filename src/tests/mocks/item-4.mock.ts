import { Entity4Mock } from "./entity-4.mock";
import { makeId } from '../test-utils';
/**
 * Example of every use-case
 */
export const item4Mock: Entity4Mock = {
  repoId: makeId(11),
  docId: makeId(11),
  alias: 'xyzabcd',
  total: 1234,
  isBig: true,
  ages: [1, 25, 53, 14, 21, 47],
  names: ['andrew', 'sylvia', 'sam', 'analee'],
  list: [1, 2, 'three', 'four', true, [1, 2, 3, 4], { a: 1 }],
  colors: new Set<string>(['a', 'b', 'c']),
  years: new Set<number>([1, 2, 3, 4]),
  meta: { a: 1, b: '1234', c: [1, 2, 3], d: { e: { f: 12233, g: true, h: false } } },
  meta2: { a: 1, b: 2, c: 3 },
  body: Buffer.from(
    JSON.stringify({
      name: 'Paul Dineach',
      age: 53,
      address: '1945 Starcross Drive',
      city: 'Leyland',
      state: 'CT',
      zip: 84123,
      phone: '801-575-5555'
    }),
    'utf8'
  )
};

/**
 * Generate Entity4 Item for Tests
 */
export function Item4Mock(from?: Partial<Entity4Mock>): Entity4Mock {
  return {
    repoId: from?.repoId || makeId(11),
    docId: from?.docId || makeId(11),
    alias: makeId(20),
    total: 1234678,
    isBig: false,
    ages: [1, 2, 3],
    names: ['nancy', 'drew'],
    list: [{ name: 'matt', age: 45, city: 'Lehi' }],
    colors: new Set<string>(['green', 'red', 'blue']),
    years: new Set<number>([1971, 1972, 1973]),
    meta: { stuff: makeId(20) },
    meta2: { moreStuff: 123123213133 },
    body: Buffer.from(
      JSON.stringify({
        name: 'Paul Dineach',
        age: 53,
        address: '1945 Starcross Drive',
        city: 'Leyland',
        state: 'CT',
        zip: 84123,
        phone: '801-575-5555'
      }),
      'utf8'
    )
  };
}