import { TEntityIndex, TIndex, TProp, TPropTokens } from '@/types';
/**
 * Create table index from entity index for model
 */
export function toIndex(
  index: TEntityIndex[],
  propStack: TProp[]
): TIndex[] {
  return index.map(({ pk, sk, wcu, rcu, project }, i) => {
    if (wcu && !rcu) {
      throw new Error(`key[${i}] missing rcu`);
    }
    if (!wcu && rcu) {
      throw new Error(`key[${i}] missing wcu`);
    }
    if (Array.isArray(project)) {
      project.forEach(name => {
        if (!propStack.find(prop => prop.name === name)) {
          throw new Error(`key[${i}] invalid projection prop "${name}"`);
        }
      });
    }
    return {
      pk: toKey(pk, 'pk', i, propStack),
      sk: toKey(sk == null ? pk : sk, 'sk', i, propStack),
      wcu: wcu || 0,
      rcu: rcu || 0,
      project: project || []
    };
  });
}

/**
 * Create table key for model
 */
function toKey(
  propName: string,
  keyName: string,
  index: number,
  propStack: TProp[]
): TProp {
  const alias = keyName + (index ? index : '');
  let prop: TProp | undefined;

  if (!propName) {
    throw new Error(`key[${index}] missing prop name`);
  }
  let [prefix, name] = propName.split('#');

  // only name, no prefix
  if (prefix) {
    if (name === undefined) {
      name = prefix;
      prefix = '';
    }
    else {
      prefix = `${prefix}#`
    }
  }

  // if prefix but no name
  if (!name) {
    propStack.push(prop = {
      name: '',
      alias: alias,
      prefix: prefix,
      type: TPropTokens.string,
      isRequired: false,
      isKey: true,
      index: index
    });
  }
  else {
    // search for existing prop
    prop = propStack.find(prop => prop.name === name);

    // throw if prop not defined
    if (!prop) {
      throw new Error(`key[${index}] ${name} is not a prop`);
    }
    // throw if not a proper index types
    if (prop.type !== 'S'
      && prop.type !== 'N'
      && prop.type !== 'B'
    ) {
        throw new Error(`key[${index}] invalid type "${prop.type}"`);
    }
    // If prop is already a key, add new prop entry
    if (prop.isKey) {
      propStack.push(prop = {
        name: name,
        alias: alias,
        prefix: prefix,
        type: prop.type,
        isRequired: !index,
        isKey: true,
        index: index
      });
    }
    // make the prop a key
    else {
      prop.alias = alias;
      prop.prefix = prefix;
      prop.isRequired = !index;
      prop.isKey = true;
      prop.index = index;
    }
  }
  return prop;
}