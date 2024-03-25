import { TKeys, TProp } from "@/types";
import { entitiesMap } from "@/utils";

/**
 * DynoEntity Decorator
 */
export function DynoEntity({
  tableName,
  keys
}: {
  tableName?: string,
  keys: TKeys[]
}): Function {
  return (entity: Function) => {
    const className = entity.toString().match(/class (\S+)/)[1];
    let entry = entitiesMap.get(entity.prototype);

    if (!entry) {
      entitiesMap.set(entity, entry = {
        entityName: '',
        tableName: '',
        keys: [],
        props: new Map<string, TProp>()
      });
    }
    entry.entityName = className;
    entry.tableName = tableName || '';
    entry.keys = keys;
  };
}
