import { configure as serverlessExpress } from '@codegenie/serverless-express';
import type {
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Handler,
} from 'aws-lambda';
import { app } from './app.js';
import { connectToDatabase } from './database/dynamo.js';

let serverlessExpressInstance: Handler | undefined;

async function setup(
  event: APIGatewayProxyEvent,
  context: Context,
  callback: Parameters<Handler>[2],
): Promise<APIGatewayProxyResult | void> {
  await connectToDatabase();
  serverlessExpressInstance = serverlessExpress({ app });
  return serverlessExpressInstance(event, context, callback) as
    | Promise<APIGatewayProxyResult>
    | void;
}

export const handler: Handler = (
  event: APIGatewayProxyEvent,
  context: Context,
  callback,
) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (serverlessExpressInstance) {
    return serverlessExpressInstance(event, context, callback);
  }

  return setup(event, context, callback);
};
