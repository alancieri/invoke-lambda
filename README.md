# Request for AWS Lambda Functions

Use this package as Lambda Layer to get a standard input for the API Request.<br />

### Install

```
npm i request-lambda --save
```

### Usage

```js
const { invoke } = require('invoke-lambda')

const myPayload = {
              key1: 'value1',
              key2: {},
              key3: true
}

// Invoke lambda by the ARN 
try {
    await invoke('arn:aws:lambda:us-east-1:XXXXXXX:function:my-function-name', payload)
} catch (e) {
    console.log(e)
}

// Invoke lambda by the function name (you have explicit the region)
try {
    await invoke('my-function-name', payload, 'us-east-1')
} catch (e) {
    console.log(e)
}

// With options
try {
    await invoke('my-function-name', payload, 'us-east-1', {
        InvocationType: 'Event',
        Qualifier: 'prod'
    })
} catch (e) {
    console.log(e)
}

```

### Options:
 
#### InvocationType (string)
Possible values:<br>
**RequestResponse** (*default*). Invoke the function synchronously. Keep the connection open until the function returns a response or times out. The API response includes the function response and additional data.<br>
**Event**. Invoke the function asynchronously. Send events that fail multiple times to the function's dead-letter queue (if it's configured). The API response only includes a status code.<br>
**DryRun**. Validate parameter values and verify that the user or role has permission to invoke the function.

#### Qualifier (string)
Specify a version or alias to invoke a published version of the function.

#### ReturnParsedPayload (boolean)
If false, the invoke function will return the entire AWS lambda invoke response.
Otherwise, the function will return the parsed "Payload" lambda response.
This option works only for **RequestResponse**

