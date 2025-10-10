import { randomUUID } from "crypto";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";
import { getDynamoClient } from "./aws/dynamo";
import { MatchRow } from "./types";
import { sanitize } from "./transform";
import { normalizeEmail } from "./userRepository";

export type MatchRecord = {
  userEmail: string;
  matchId: string;
  match: MatchRow;
  createdAt: string;
  updatedAt: string;
};

function getTableName() {
  const tableName = process.env.AWS_DYNAMO_MATCHES_TABLE;
  if (!tableName) {
    throw new Error("AWS_DYNAMO_MATCHES_TABLE env var is required");
  }
  return tableName;
}

export async function listMatchesForUser(email: string) {
  const client = getDynamoClient();
  const tableName = getTableName();
  const normalizedEmail = normalizeEmail(email);

  const response = await client.send(
    new QueryCommand({
      TableName: tableName,
      KeyConditionExpression: "userEmail = :userEmail",
      ExpressionAttributeValues: {
        ":userEmail": normalizedEmail,
      },
      ScanIndexForward: true,
    })
  );

  return (response.Items as MatchRecord[] | undefined) ?? [];
}

export async function createMatchForUser(email: string, match: MatchRow) {
  const client = getDynamoClient();
  const tableName = getTableName();
  const normalizedEmail = normalizeEmail(email);

  const sanitized = sanitize([match])[0];
  if (!sanitized) {
    throw new Error("Match payload failed validation");
  }
  const now = new Date().toISOString();
  const record: MatchRecord = {
    userEmail: normalizedEmail,
    matchId: randomUUID(),
    match: sanitized,
    createdAt: now,
    updatedAt: now,
  };

  await client.send(
    new PutCommand({
      TableName: tableName,
      Item: record,
    })
  );

  return record;
}
