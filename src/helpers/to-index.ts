import { TEntityIndex, TIndex, TProp, TPropMap, TPropTokens } from '@/types';
/**
 * Create table index from entity index for model
 */
export function toIndex(
  index: TEntityIndex[],
  propStack: TProp[],
  propMap: TPropMap,
  tableName: string
): TIndex[] {
  return index.map(({ pk, sk, wcu, rcu, project }, index) => {
    if (wcu && !rcu) {
      throw new Error(`key[${index}] missing rcu`);
    }
    if (!wcu && rcu) {
      throw new Error(`key[${index}] missing wcu`);
    }
    if (Array.isArray(project)) {
      project.forEach(name => {
        if (!propStack.find(prop => prop.name === name)) {
          throw new Error(`key[${index}] invalid projection prop "${name}"`);
        }
      });
    }
    return {
      name: index
        ? `${tableName}-gsi-${index}`
        : tableName,
      pk: toKey(pk, 'pk', index, propStack, propMap),
      sk: toKey(sk == null ? pk : sk, 'sk', index, propStack, propMap),
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
  propStack: TProp[],
  propMap: TPropMap
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
  // Create virtual prop name for key lookups
  const virtualName = `__${alias}`;

  // if prefix but no name
  if (!name) {
    propStack.push(prop = {
      name: virtualName,
      alias: alias,
      prefix: prefix,
      type: TPropTokens.string,
      isStatic: true,
      isRequired: false,
      isKey: true,
      index: index
    });

    // Add a new propMap entry for the virtual name
    propMap.set(virtualName, prop);
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
        isStatic: false,
        isKey: true,
        index: index
      });
      // Add a new propMap entry for the virtual name
      propMap.set(virtualName, prop);
    }
    // make the prop a key
    else {
      prop.alias = alias;
      prop.prefix = prefix;
      prop.isRequired = !index;
      prop.isKey = true;
      prop.index = index;

      // Add a new propMap entry for the virtual name
      propMap.set(virtualName, {
        ...prop,
        name: virtualName
      });
    }
  }
  return prop;
}