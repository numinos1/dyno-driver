import { Entity5Mock } from "./entity-5.mock";
import { makeId } from '../test-utils';

/**
 * Generate Entity5Mock Document
 */
export function Item5Mock(doc?: Partial<Entity5Mock>): Entity5Mock {
  return {
    repoId: makeId(11),
    docId: makeId(11),
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
        name: 'Paul Amadeus Dineach',
        age: 53,
        address: '1945 Starcross Drive',
        city: 'Leyland',
        state: 'CT',
        zip: 84123,
        phone: '801-575-5555'
      }),
      'utf8'
    ),
    ...doc
  };
}