import { TKeys, TProp, TPropTokens, TPropTypes } from '@/types';
/**
 * Create table keys for model
 */
export function toKeys(
  keys: TKeys[],
  propStack: TProp[]
): TProp[][] {
  if (!keys.length) {
    throw new Error(`missing keys`);
  }
  return keys.map(([pk, sk], index) => [
    toKey(pk, 'pk', index, propStack),
    toKey(sk == null ? pk : sk, 'sk', index, propStack)
  ]);
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
  // default type
  let type: TPropTypes = 'string';

  // if prefix but no name
  if (!name) {
    propStack.push(prop = {
      name: '',
      alias: alias,
      prefix: prefix,
      type: type,
      token: TPropTokens[type],
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
    // If prop is already a key, add new prop entry
    if (prop.isKey) {
      propStack.push(prop = {
        name: name,
        alias: alias,
        prefix: prefix,
        type: prop.type,
        token: prop.token,
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