import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

let documentClient: DynamoDBDocumentClient | null = null;

export function getDynamoClient() {
  if (documentClient) return documentClient;

  const region = process.env.AWS_REGION;
  if (!region) {
    throw new Error("Missing AWS_REGION env var required for DynamoDB access");
  }

  const nativeClient = new DynamoDBClient({ region });
  documentClient = DynamoDBDocumentClient.from(nativeClient, {
    marshallOptions: { removeUndefinedValues: true },
    unmarshallOptions: { wrapNumbers: false },
  });

  return documentClient;
}
