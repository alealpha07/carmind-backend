import path from "path"
import { PrismaClient } from "@prisma/client";
import { Request, Response, NextFunction } from "express";

export const prisma = new PrismaClient();;

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

export const UPLOAD_DIR = path.join(__dirname, "..", "uploads")

export function generateFileName(id: string, type: string, extension: string){
    return `${id}-${type}${extension}`;
}

export function isAuthenticated(request: Request, response: Response, next: NextFunction): void{
    if (!request.isAuthenticated()) {
        response.status(401).send(response.__("unauthorizedError"));
    }
    else{
        next();
    }
}
