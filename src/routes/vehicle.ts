import express, { Request, Response } from "express";
import prisma from "../connection";
import { User, Vehicle } from "@prisma/client";
import { sanitizeParams } from "../utils";
const router = express.Router();

router.post("/", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send("User not authenticated");
        }
        const requiredParams = [
            "type", "brand", "model", "registrationYear", "plateNumber",
            "isInsured", "startDateInsurance", "endDateInsurance", "hasBill", 
            "endDateBill", "endDateRevision"
        ];
        
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.body);
        
        if (missingParams.length > 0) {
            return response.status(422).send("Missing required params: " + missingParams.join(", "));
        }
        
        const user = (request.user as User);
        prisma.vehicle.create({
            data: {...sanitizedParams, ...{idUser: user.id}}
        })
        response.send("Vehicle created successfully");
    } catch (error) {
        response.status(500).send("Server error");
        console.error(error);
    }
})

export default router;