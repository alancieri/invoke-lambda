# Request for AWS Lambda Functions

Use this package as Lambda Layer to get a standard input for the API Request.<br />

### Install

```js
npm i request-lambda --save
```

### the API

```js
/**
* 
* @param fnName. The function name | the function ARN
* @param payload. The JSON that you want to provide to your Lambda function as input.
* @param args. The function region (string), and/or the options (object)
* @returns {Promise<any>}
*/

async invoke (fnName, payload, ...args) {}

/**
* 
* @param fnName. The function name | the function ARN
* @param payload. The JSON that you want to provide to your Lambda function as input.
* @param args. The function region (string), and/or the options (object)
* @returns {Promise<any>}
*/
async invokeEvent (fnName, payload, ...args) {}
```
**Note**. When uou use the invokeEvent API, the option key "InvocationType" has "Event" as value. You cannot override it by the options object.

### Usage

```js
const { invoke, invokeEvent } = require('invoke-lambda')

const myPayload = {
              key1: 'value1',
              key2: {},
              key3: true
}

// Invoke lambda by the ARN 
try {
    const response = await invoke('arn:aws:lambda:us-east-1:XXXXXXX:function:my-function-name', myPayload)
    console.log(response)
} catch (e) {
    console.log('Error:', e.message)
}

// Invoke lambda by the function name (you have to declare the proper region)
try {
    const response = await invoke('my-function-name', myPayload, 'us-east-1')
    console.log(response)
} catch (e) {
    console.log('Error:', e.message)
}

// With options
try {
    const response = await invoke('my-function-name', myPayload, 'us-east-1', {
        InvocationType: 'Event',
        Qualifier: 'prod'
    })
    console.log(response)
} catch (e) {
    console.log('Error:', e.message)
}
```

### Invoke asynchronously

```js
// Invoke the lambda function asynchronously (InvocationType: 'Event')
try {
    const response = await invokeEvent('my-function-name', myPayload, 'us-west-1')
    console.log(response)
} catch (e) {
   console.log('Error:', e.message)
}
```

### Options:
 
#### InvocationType (string)
Possible values:<br>
- **RequestResponse** (*default*). Invoke the function synchronously. Keep the connection open until the function returns a response or times out. The API response includes the function response and additional data.<br>
- **Event**. Invoke the function asynchronously. Send events that fail multiple times to the function's dead-letter queue (if it's configured). The API response only includes a status code.<br>
- **DryRun**. Validate parameter values and verify that the user or role has permission to invoke the function.

#### Qualifier (string)
Specify a version or alias to invoke a published version of the function.

#### ReturnParsedPayload (boolean)
If false, the invoke function will return the entire AWS lambda invoke response.
Otherwise, the function will return the parsed "Payload" lambda response.
This option works only for **RequestResponse**

