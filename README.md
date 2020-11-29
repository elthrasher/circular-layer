# circular layer aws-lambda-nodejs

It looks like the esbuild step in the aws-lambda-nodejs module fails if there is a Lambda Layer on the function to be built.

To see this in action, run `yarn projen` followed by `yarn synth` and you will get this error message:

```bash
$ cdk synth
Converting circular structure to JSON
    --> starting at object with constructor 'LayerVersion'
    |     property 'node' -> object with constructor 'ConstructNode'
    --- property 'host' closes the circle
Subprocess exited with error 1
error Command failed with exit code 1.
```

There's no problem using layers with aws-lambda. Additionally there is a workaround available since the function only needs a reference to the layer so instead of 

```typescript
const layer = new LayerVersion(this, 'ConfigLayer', {
    code: Code.fromAsset(`${__dirname}`),
    compatibleRuntimes: [Runtime.NODEJS_12_X],
});
new NodejsFunction(this, 'testNodejsFunction', {
    entry: `${__dirname}/function.ts`,
    layers: [layer],
});

```

we can work around the problem like this:

```typescript
const layer = new LayerVersion(this, 'ConfigLayer', {
    code: Code.fromAsset(`${__dirname}`),
    compatibleRuntimes: [Runtime.NODEJS_12_X],
});
new NodejsFunction(this, 'testNodejsFunction', {
    entry: `${__dirname}/function.ts`,
    layers: [{ layerVersionArn: layer.layerVersionArn } as LayerVersion]
});
```
