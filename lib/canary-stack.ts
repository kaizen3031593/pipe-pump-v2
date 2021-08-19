import * as cdk from '@aws-cdk/core';
import * as synthetics from '@aws-cdk/aws-synthetics';
import * as cw from '@aws-cdk/aws-cloudwatch';
import * as cw_actions from '@aws-cdk/aws-cloudwatch-actions';
import * as sns from '@aws-cdk/aws-sns';
import * as path from 'path';

export class CanaryStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const canary = new synthetics.Canary(this, 'test-pipeline', {
      test: synthetics.Test.custom({
        code: synthetics.Code.fromAsset(path.join(__dirname, '../canary')),
        handler: 'canary.handler',
      }),
      schedule: synthetics.Schedule.once(),
      runtime: synthetics.Runtime.SYNTHETICS_NODEJS_PUPPETEER_3_1,
    });

    const alarm = new cw.Alarm(this, 'pipelineAlarm', {
      metric: canary.metricSuccessPercent(),
      threshold: 90,
      comparisonOperator: cw.ComparisonOperator.LESS_THAN_OR_EQUAL_TO_THRESHOLD,
      evaluationPeriods: 2,
    });

    const topic = new sns.Topic(this, 'pipelineTopic', {
      displayName: 'My Pipeline Topic',
    });

    alarm.addAlarmAction(new cw_actions.SnsAction(topic));
  }
}
