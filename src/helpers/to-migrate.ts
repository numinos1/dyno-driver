import {
  DynamoDBClient,
  DeleteTableCommand,
  DeleteTableCommandInput,
  DescribeTableCommand,
  ListTablesCommand,
  CreateTableCommand,
  CreateTableCommandInput
} from "@aws-sdk/client-dynamodb"; 
import { DynoDriver } from "@/classes/dyno-driver";

const COMPARE_TABLE_PROPS = [
  'AttributeDefinitions',
  'GlobalSecondaryIndexes',
  'KeySchema',
  'TableName'
];

/**
 * Migrate DynamoDb Tables
 */
export async function toMigrate(dyno: DynoDriver) {
  const db = new DynamoDBClient({
    region: "local",
    endpoint: "http://localhost:8000",
  });

  const dbTables = await getDbTables();

  return dbTables;

  // --------------------------------------------------------------
  //                          Methods
  // --------------------------------------------------------------

  /**
   * Get Table Props
   **/
  async function getDbTables() {
    const names = await getDbTableNames();
    const tables = {};

    for (let i = 0; i < names.length; i++) {
      const TableName = names[i];
      tables[TableName] = getDbTableProps(TableName);
    }
    return tables;
  }

  /**
   * Get Table Names
   */
  async function getDbTableNames() {
    const result = await db.send(
      new ListTablesCommand({ Limit: 100 })
    );
    return result.TableNames || [];
  }

  /**
   * Get Table Props
   */
  async function getDbTableProps(TableName: string) {
    const config = await db.send(
      new DescribeTableCommand({ TableName })
    );
    return config.Table;
  }
}

