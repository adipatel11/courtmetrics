import { GetCommand, PutCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoClient } from "./aws/dynamo";

export type UserRecord = {
  email: string;
  hashedPassword: string;
  createdAt: string;
};

export const normalizeEmail = (email: string) => email.trim().toLowerCase();

function getTableName() {
  const tableName = process.env.AWS_DYNAMO_USERS_TABLE;
  if (!tableName) {
    throw new Error("AWS_DYNAMO_USERS_TABLE env var is required");
  }
  return tableName;
}

export async function createUser(user: {
  email: string;
  hashedPassword: string;
}) {
  const client = getDynamoClient();
  const tableName = getTableName();
  const item: UserRecord = {
    email: normalizeEmail(user.email),
    hashedPassword: user.hashedPassword,
    createdAt: new Date().toISOString(),
  };

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: item,
      ConditionExpression: "attribute_not_exists(email)",
    })
  );

  return item;
}

export async function findUserByEmail(email: string) {
  const client = getDynamoClient();
  const tableName = getTableName();
  const normalizedEmail = normalizeEmail(email);
  const result = await client.send(
    new GetCommand({
      TableName: tableName,
      Key: { email: normalizedEmail },
      ConsistentRead: true,
    })
  );

  return result.Item as UserRecord | undefined;
}
