import { CreateTableCommandInput } from "@aws-sdk/client-dynamodb";
import { diffObjects } from "@/utils";
import { TMigrationSchema, TMigrationType } from "@/types";

/**
 * Compare Model and CDK Schemas
 */
export function compareSchemas(
  modelSchemas: CreateTableCommandInput[],
  dynamoSchemas: CreateTableCommandInput[]
): TMigrationSchema[] {
  const tables = new Set<string>();

  modelSchemas.forEach(schema =>
    tables.add(schema.TableName)
  );
  dynamoSchemas.forEach(schema =>
    tables.add(schema.TableName)
  );

  return [...tables].map(tableName => {
    let diffStatus: TMigrationType = '';

    const modelSchema = modelSchemas.find(schema =>
      schema.TableName === tableName
    );
    const dynamoSchema = dynamoSchemas.find(schema =>
      schema.TableName === tableName
    );

    if (modelSchema && !dynamoSchema) {
      diffStatus = 'CREATE';
    }
    else if (!dynamoSchema && modelSchema) {
      diffStatus = 'DELETE';
    }
    else if (!diffObjects(modelSchema, dynamoSchema)) {
      diffStatus = 'UPDATE';
    }
    return {
      tableName,
      diffStatus,
      modelSchema,
      dynamoSchema
    };
  });
} 
