const validateAWSArn = (str) => typeof str === 'string' && str.indexOf('arn:') === 0 && str.split(':').length >= 6

const parseAWSArn = (arn) => {
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

const isAWSRegion = (str) => {
    return /(us(-gov)?|ap|ca|cn|eu|sa)-(central|(north|south)?(east|west)?)-\d/g.test(str)
}

const isAWSArn = (str) => {
    return validateAWSArn(str)
}

module.exports = { validateAWSArn, parseAWSArn, isAWSRegion, isAWSArn }
