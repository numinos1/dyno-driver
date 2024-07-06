import { TModelSchema, TProp } from "@/types";
import { copyObject } from "@/utils";

/**
 * Merge all model schemas to create migrations
 * 
 * When models map to unique tables then no merging is necessary. But when
 * two or more models map to the same DynamoDB table it's critical that their
 * keys map to the same indices and data-types. Additinoally, if two models 
 * are going to share the same table then they need to have unique value prefixes.
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
    else if (match.billingMode !== schema.billingMode) {
      throw new Error(`Billing Mismatch "${match.billingMode}" != "${schema.billingMode}" on table "${tableName}"`);
    }
    else if (match.removalPolicy !== schema.removalPolicy) {
      throw new Error(`Removal Policy Mismatch "${match.removalPolicy}" != "${schema.removalPolicy}" on table "${tableName}"`);
    }
    else {
      schema.tableKeys.forEach((schemaProp, index) => {
        const matchProp = match.tableKeys[index];

        if (!matchProp) {
          match.tableKeys.push(schemaProp);
        }
        else {
          compareProps(matchProp[0], schemaProp[0], tableName, index);
        }
      });
    }

    return merged;
  }, []);
}

/**
 * Compare Props
 */
function compareProps(
  propA: TProp,
  propB: TProp,
  tableName: string,
  index: number,
) {
  if (propA.alias !== propB.alias) {
    throw new Error(`Alias collision "${propA.alias}" !== '${propB.alias}" on table "${tableName}" at key[${index}]`);
  }
  if (propA.token !== propB.token) {
    throw new Error(`Token mismatch "${propA.token}" !== '${propB.token}" on table "${tableName}" at key[${index}]`);
  }
  if (!propA.prefix || !propB.prefix) {
    throw new Error(`Missing prefix on table "${tableName}" at key[${index}]`);
  }
  if (propA.prefix === propB.prefix) {
    throw new Error(`Prefix collision "${propA.prefix}" === '${propB.prefix}" on table "${tableName}" at key[${index}]`);
  }
}