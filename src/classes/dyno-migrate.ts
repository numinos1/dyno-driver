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
export class DynoMigrate {
  private dyno: DynoDriver;
  private db: DynamoDBClient;

  /**
   * Constructor
   */
  constructor(dyno: DynoDriver) {
    this.dyno = dyno;

    this.db = new DynamoDBClient({
      region: "local",
      endpoint: "http://localhost:8000",
    });
  }

  // --------------------------------------------------------------
  //                          Methods
  // --------------------------------------------------------------

  
}

