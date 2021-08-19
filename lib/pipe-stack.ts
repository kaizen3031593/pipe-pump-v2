import * as lambda from '@aws-cdk/aws-lambda';
import * as apigw from '@aws-cdk/aws-apigateway';
import * as cdk from '@aws-cdk/core';
import * as path from 'path';

export class PipeStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const dateFn = new lambda.Function(this, 'DateLambda', {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.fromAsset(path.join(__dirname, '../lambda')),
      handler: 'date.handler',
    });

    // Add API Gateway backed by Lambda
    new apigw.LambdaRestApi(this, 'Endpoint', {
      description: 'first endpoint',
      handler: dateFn,
    });
  }
}