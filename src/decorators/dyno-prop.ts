import { TProp, TPropTokens } from "@/types";
import { entitiesMap } from "@/utils";

/**
 * DynoProp Decorator
 */
export function DynoProp({
  alias = '',
  isRequired = false
}: {
  alias?: string;  
  isRequired?: boolean
}): Function {
  return (proto: any, name: string) => {
    let entry = entitiesMap.get(proto);

    const reflectType = Reflect.getMetadata('design:type', proto, name);
    const dynamoType = designToType(reflectType);

    if (!entry) {
      entitiesMap.set(proto, entry = {
        entityName: '',
        tableName: '',
        index: [],
        props: new Map<string, TProp>(),
        aliases: new Set<string>()
      });
    }
    if (entry.props[name]) {
      throw new Error(`duplicate prop name "${name}" on entity`);
    }
    if (!alias) {
      alias = name;
    }
    if (entry.aliases.has(alias)) {
      throw new Error(`duplicate prop alias "${alias}" on entity`);
    }
    else {
      entry.aliases.add(alias);
    }
    entry.props.set(name, {
      name: name,
      alias: alias,
      type: dynamoType,
      prefix: '',
      isRequired: isRequired,
      isKey: false,
      index: 0
    });
  };
}

/**
 * Convert Entity Prop Design Type to Dynamo Type
 */
export function designToType(fn: any): TPropTokens {
  if (fn === Number) return TPropTokens.number;
  if (fn === String) return TPropTokens.string;
  if (fn === Boolean) return TPropTokens.boolean;
  if (fn === Array) return TPropTokens.list;
  if (fn === Object) return TPropTokens.map;
  if (fn === Set) return TPropTokens.stringSet;
  if (fn === Buffer) return TPropTokens.binary;
  throw new Error(`Invalid Property Type "${fn}"`);
}

// number = 'N',
// string = 'S',
// binary = 'B',
// boolean = 'BOOL',
// null = 'NULL',
// list = 'L',
// map = 'M',
// stringSet = 'SS', // new Set<string>();
// numberSet = 'NS', // new Set<number>();
// binarySet = 'BS', // new Set<buffer>();