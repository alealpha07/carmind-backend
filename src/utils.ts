export function sanitizeParams(requiredParams: Array<string>, requestParams: any) {
    const sanitizedParams:any = {};
    const missingParams:Array<string> = [];
    
    requiredParams.forEach((param: string) => {
        if (requestParams[param] === undefined || requestParams[param] === "" || requestParams[param] === null) {
            missingParams.push(param);
        } else {
            sanitizedParams[param] = requestParams[param];
        }
    });
    
    return { sanitizedParams, missingParams };
}
