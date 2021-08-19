import { CanaryStack } from '../lib/canary-stack';
import { LambdaStack } from '../lib/lambda-stack';
import * as cdk from '@aws-cdk/core';
import * as pipelines from '@aws-cdk/pipelines';
import { githubUser, githubRepo, githubBranch, codeStarConnectionArn, awsAccount } from '../private/configuration';

/**
 * Stack to hold the pipeline
 */
class MyPipelineStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const pipeline = new pipelines.CodePipeline(this, 'Pipeline', {
      synth: new pipelines.ShellStep('Synth', {
        input: pipelines.CodePipelineSource.connection(`${githubUser}/${githubRepo}`, githubBranch, {
          connectionArn: codeStarConnectionArn,
        }),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
      }),
    });

    pipeline.addStage(new MyApplication(this, 'Prod', {
      env: {
        account: awsAccount,
        region: 'us-east-1',
      }
    }));
  }
}

class MyApplication extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const canaryStack = new CanaryStack(this, 'Canary');
    const lambdaStack = new LambdaStack(this, 'Lambda');
  }
}
