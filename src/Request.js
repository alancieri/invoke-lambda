const AWS = require('aws-sdk')

const validate = (str) => typeof str === 'string' && str.indexOf('arn:') === 0 && str.split(':').length >= 6

const parse = (arn) => {
    const segments = arn.split(':')
    if (segments.length < 6 || segments[0] !== 'arn') throw new Error('Malformed ARN')
    const [
        ,
        //Skip "arn" literal
        partition,
        service,
        region,
        accountId,
        ...resource
    ] = segments
    
    return {
        partition,
        service,
        region,
        accountId,
        resource: resource.join(':'),
    }
}

const isRegion = (str) => {
    return /(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\d/g.test(str)
}

const isArn = (str) => {
    return validate(str)
}

const Request = {
    async invoke (fnName, payload, ...args) {
        
        let region = process.env.AWS_REGION || 'us-east-1'
        let options = {
            ReturnParsedPayload: true
        }
        args.map(element => {
            if (typeof element === 'string' && isRegion(element)) region = element
            if (typeof element === 'object') options = { ...options, ...element }
        })
        payload = JSON.parse(JSON.stringify(payload))
        const req = {
            FunctionName: fnName,
            Payload: JSON.stringify(payload, null, 2),
            InvocationType: 'RequestResponse'
        }
        if (options)
            for (const [key, value] of Object.entries(options))
                req[key] = value
        
        const res = await Request._call(req, region)
        
        if (res instanceof Error)
            throw new RequestLambdaError(res.message)
        return res
    },
    
    async _call (req, region) {
        try {
            
            if (isArn(req['FunctionName']))
                region = parse(req['FunctionName'])['region']
            
            const lambda = new AWS['Lambda']({ region })
            
            const ReturnParsedPayload = req['ReturnParsedPayload']
            delete req['ReturnParsedPayload']
            
            console.log({ InvokeStatement: req, Region: region })
            const data = await lambda.invoke(req).promise()
            
            if (req['InvocationType'] === 'RequestResponse') {
                if (!data.Payload)
                    return new Error('No Payload')
                const payload = JSON.parse(data.Payload)
                if (payload['errorType']) return new Error(payload['errorMessage'])
                if (ReturnParsedPayload)
                    return JSON.parse(data.Payload)
                return data
            }
            return data
        } catch (error) {
            return error
        }
    }
}

class RequestLambdaError extends Error {
    constructor (message) {
        super(message)
        this.name = 'RequestLambdaError'
        Error.captureStackTrace(this, RequestLambdaError)
    }
}

module.exports = {
    Request,
    invoke: (fnName, payload, ...args) => Request.invoke(fnName, payload, ...args),
}
