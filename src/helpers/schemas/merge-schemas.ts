import { TIndex, TModelSchema, TProp } from "@/types";
import { copyObject } from "@/utils";

/**
 * Merge all model schemas to create migrations
 * 
 * If all models map to unique tables, then no merging is necessary. 
 * 
 * But when two or more models map to the same DynamoDB table, it's critical that 
 * keys map to the same indices and data-types. Additinoally, if two models
 * share the same table, then keys must have unique value prefixes.
 * 
 * The mereged model schemas are used to generate the DynamoDB tables using
 * both the CDK and the direct DynamoDB API calls. The CDK is used to instantiate
 * DynamoDB in the cloud and the direct API is used to instantiate it in the 
 * local DynamoDB instace running in Docker (used for testing).
 */
export function mergeSchemas(schemas: TModelSchema[]): TModelSchema[] {
  return schemas.reduce((merged, schema) => {
    const match = merged.find(s => s.tableName === schema.tableName);
    const tableName = match?.tableName;

    if (!match) {
      merged.push(copyObject(schema));
    }
    else if (match.removalPolicy !== schema.removalPolicy) {
      throw new Error(`Removal Policy Mismatch "${match.removalPolicy}" != "${schema.removalPolicy}" on table "${tableName}"`);
    }
    else {
      schema.tableIndex.forEach((indexProp, i) => {
        const matchProp = match.tableIndex[i];

        if (!matchProp) {
          match.tableIndex.push(indexProp);
        }
        else {
          try {
            compareProps(matchProp, indexProp);
          }
          catch (error) {
            throw new Error(`${error.message} on table "${tableName}" at key[${i}]`);
          }
        }
      });
    }

    return merged;
  }, [] as TModelSchema[]);
}

/**
 * Compare Props
 */
function compareProps(
  matchProp: TIndex,
  indexProp: TIndex,
) {
  if (matchProp.pk.alias !== indexProp.pk.alias) {
    throw new Error(`Alias collision "${matchProp.pk.alias}" !== '${indexProp.pk.alias}"`);
  }
  if (matchProp.pk.type !== indexProp.pk.type) {
    throw new Error(`Token mismatch "${matchProp.pk.type}" !== '${indexProp.pk.type}"`);
  }
  if (!matchProp.pk.prefix || !indexProp.pk.prefix) {
    throw new Error(`Missing prefix`);
  }
  if (matchProp.pk.prefix === indexProp.pk.prefix) {
    throw new Error(`Prefix collision "${matchProp.pk.prefix}" === '${indexProp.pk.prefix}"`);
  }
  if (matchProp.rcu !== indexProp.rcu) {
    throw new Error(`RCU mismatch ${matchProp.rcu} !== ${indexProp.rcu}`);
  }
  if (matchProp.wcu !== indexProp.wcu) {
    throw new Error(`WCU mismatch ${matchProp.wcu} !== ${indexProp.wcu}`);
  }
  const props = new Set<string>();

  matchProp.project.forEach(prop => props.add(prop));
  indexProp.project.forEach(prop => props.add(prop));

  props.forEach(prop => {
    if (!matchProp.project.includes(prop)
      || !indexProp.project.includes(prop)
    ) {
      throw new Error(`Project mismatched property "${prop}"`);
    } 
  });
}