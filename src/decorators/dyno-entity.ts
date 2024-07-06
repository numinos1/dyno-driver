import { TEntityIndex, TProp } from "@/types";
import { entitiesMap } from "@/utils";

/**
 * DynoEntity Decorator
 */
export function DynoEntity({
  tableName,
  index
}: {
  tableName?: string,
  index: TEntityIndex[]
}): Function {
  return (entity: Function) => {
    const className = entity.toString().match(/class (\S+)/)[1];
    let entry = entitiesMap.get(entity.prototype);

    if (!entry) {
      entitiesMap.set(entity, entry = {
        entityName: '',
        tableName: '',
        index: [],
        props: new Map<string, TProp>()
      });
    }
    entry.entityName = className;
    entry.tableName = tableName || '';
    entry.index = index;
  };
}
