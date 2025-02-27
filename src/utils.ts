export function sanitizeParams(requiredParams: Array<string>, requestBody: any) {
    const sanitizedParams:any = {};
    const missingParams:Array<string> = [];
    
    requiredParams.forEach((param: string) => {
        if (requestBody[param] === undefined || requestBody[param] === "" || requestBody[param] === null) {
            missingParams.push(param);
        } else {
            sanitizedParams[param] = requestBody[param];
        }
    });
    
    return { sanitizedParams, missingParams };
}
