#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { awsAccount } from '../private/configuration';
import { MyPipelineStack } from './pipe';

const app = new cdk.App();
new MyPipelineStack(app, 'PipelinesStack', {
  env: {
    account: awsAccount,
    region: 'us-east-1',
  }
});
