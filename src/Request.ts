import AWS from "aws-sdk";
import { isAWSRegion, isAWSArn, parseAWSArn } from "./helpers";

type JSONObject =
  | string
  | number
  | boolean
  | { [x: string]: JSONObject }
  | Array<JSONObject>;

type RequestObject = {
  FunctionName: string;
  Payload: JSONObject;
  InvocationType: string;
  [x: string]: string | JSONObject;
};

export const Request = {
  async invokeEvent(fnName: string, payload: JSONObject, ...args) {
    let region = process.env.AWS_REGION || "us-east-1";
    let options = {};
    args.map((element) => {
      if (typeof element === "string" && isAWSRegion(element)) region = element;
      if (typeof element === "object") options = { ...options, ...element };
    });
    options["InvocationType"] = "Event";
    return Request.invoke(fnName, payload, region, options);
  },

  async invoke(fnName: string, payload: JSONObject, ...args) {
    let region = process.env.AWS_REGION || "us-east-1";
    let options = {
      ReturnParsedPayload: true,
    };
    args.map((element) => {
      if (typeof element === "string" && isAWSRegion(element)) region = element;
      if (typeof element === "object") options = { ...options, ...element };
    });
    payload = JSON.parse(JSON.stringify(payload));

    const req: RequestObject = {
      FunctionName: fnName,
      Payload: JSON.stringify(payload, null, 2),
      InvocationType: "RequestResponse",
    };

    if (options)
      for (const [key, value] of Object.entries(options)) req[key] = value;

    const res = await Request._call(req, region);

    if (res instanceof Error) throw new RequestLambdaError(res.message);
    return res;
  },

  async _call(req: RequestObject, region: string) {
    try {
      if (isAWSArn(req["FunctionName"]))
        region = parseAWSArn(req["FunctionName"])["region"];

      const lambda = new AWS["Lambda"]({ region });

      const ReturnParsedPayload = req["ReturnParsedPayload"];
      delete req["ReturnParsedPayload"];

      // console.log({ InvokeStatement: req, Region: region })
      const data = await lambda.invoke(req).promise();

      if (req["InvocationType"] === "RequestResponse") {
        if (!data.Payload) return new Error("No Payload");
        const payload =
          data.Payload && typeof data.Payload === "string"
            ? JSON.parse(data.Payload)
            : "";
        if (payload["errorType"]) return new Error(payload["errorMessage"]);
        if (ReturnParsedPayload && typeof data.Payload === "string")
          return JSON.parse(data.Payload);
        return data;
      }
      return data;
    } catch (error) {
      return error;
    }
  },
};

class RequestLambdaError extends Error {
  public name: string;

  constructor(message) {
    super(message);
    this.name = "RequestLambdaError";
    Error.captureStackTrace(this, RequestLambdaError);
  }
}

export function invoke(fnName: string, payload: JSONObject, ...args) {
  return Request.invoke(fnName, payload, ...args);
}

export function invokeEvent(fnName: string, payload: JSONObject, ...args) {
  return Request.invokeEvent(fnName, payload, ...args);
}
