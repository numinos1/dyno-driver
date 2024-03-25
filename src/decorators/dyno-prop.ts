import { TProp, TPropTokens, TPropTypes } from "@/types";
import { entitiesMap } from "@/utils";

/**
 * DynoProp Decorator
 */
export function DynoProp({
  type,
  alias = '',
  isRequired = false
}: {
  type: TPropTypes;
  alias?: string;  
  isRequired?: boolean
}): Function {
  return (proto: any, name: string) => {
    let entry = entitiesMap.get(proto);

    if (!entry) {
      entitiesMap.set(proto, entry = {
        entityName: '',
        tableName: '',
        keys: [],
        props: new Map<string, TProp>()
      });
    }
    if (entry.props[name]) {
      throw new Error(`duplicate prop "${name}" on entity`);
    }
    entry.props.set(name, {
      name: name,
      alias: alias,
      type: type,
      token: TPropTokens[type],
      prefix: '',
      isRequired: isRequired,
      isKey: false,
      index: 0
    });
  };
}
