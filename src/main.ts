import { Function } from '@aws-cdk/aws-lambda';
import { NodejsFunction } from '@aws-cdk/aws-lambda-nodejs';
import { Code } from '@aws-cdk/aws-lambda/lib/code';
import { LayerVersion } from '@aws-cdk/aws-lambda/lib/layers';
import { Runtime } from '@aws-cdk/aws-lambda/lib/runtime';
import { App, Construct, Stack, StackProps } from '@aws-cdk/core';

export class MyStack extends Stack {
  constructor(scope: Construct, id: string, props: StackProps = {}) {
    super(scope, id, props);

    const layer = new LayerVersion(this, 'ConfigLayer', {
      code: Code.fromAsset(`${__dirname}`),
      compatibleRuntimes: [Runtime.NODEJS_12_X],
    });

    // This works
    new Function(this, 'testFunction', {
      code: Code.fromInline(
        'exports.handler = function(event, ctx, cb) { return cb(null, "hi"); }'
      ),
      handler: 'handler',
      layers: [layer],
      runtime: Runtime.NODEJS_12_X,
    });

    // This doesn't work if we uncomment the layer
    new NodejsFunction(this, 'testNodejsFunction', {
      entry: `${__dirname}/function.ts`,
      layers: [layer],
      runtime: Runtime.NODEJS_12_X,
    });
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new App();

new MyStack(app, 'my-stack-dev', { env: devEnv });
// new MyStack(app, 'my-stack-prod', { env: prodEnv });

app.synth();
