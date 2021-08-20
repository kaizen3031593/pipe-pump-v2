import { CanaryStack } from '../lib/canary-stack';
import { LambdaStack } from '../lib/lambda-stack';
import * as cdk from '@aws-cdk/core';
import * as pipelines from '@aws-cdk/pipelines';
import { githubUser, githubRepo, githubBranch, codeStarConnectionArn, awsAccount, awsRegion } from '../private/configuration';

/**
 * Stack to hold the pipeline
 */
export class MyPipelineStack extends cdk.Stack {
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

    pipeline.addStage(new MyApplication(this, 'Sandbox', {
      env: {
        account: awsAccount,
        region: awsRegion,
      }
    }));

    pipeline.addStage(new MyTestApp(this, 'Test', {
      env: {
        account: awsAccount,
        region: awsRegion,
      }
    }));

    pipeline.addStage(new MyProdApp(this, 'Prod', {
      env: {
        account: awsAccount,
        region: awsRegion,
      }
    }), {
      pre: [
        new pipelines.ManualApprovalStep('Pause'),
      ]
    }
    );
  }
}

class MyApplication extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const lambdaStack = new LambdaStack(this, 'api-endpoint');
  }
}

class MyTestApp extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new CanaryStack(this, 'test-endpoint');
  }
}

class MyProdApp extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    new LambdaStack(this, 'prod-endpoint');
  }
}