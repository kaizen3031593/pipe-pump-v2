#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { MyPipelineStack } from '../pipe';

const app = new cdk.App();
new MyPipelineStack(app, 'PipelinesStack', {
  
});
