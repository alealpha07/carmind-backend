import express, { Request, Response } from "express";
import prisma from "../connection";
import { User, Vehicle } from "@prisma/client";
import { sanitizeParams } from "../utils";
const router = express.Router();

router.post("/", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send(response.__("unauthorizedError"));
        }
        const requiredParams = [
            "type", "brand", "model", "registrationYear", "plateNumber",
            "isInsured", "startDateInsurance", "endDateInsurance", "hasBill", 
            "endDateBill", "endDateRevision"
        ];
        
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.body);
        
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }
        
        const user = (request.user as User);
        await prisma.vehicle.create({
            data: {...sanitizedParams, ...{idUser: user.id}}
        })
        response.send(response.__("vehicleCreatedSuccessfully"));
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

router.get("/", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send(response.__("unauthorizedError"));
        }        
        const user = (request.user as User);
        const vehicles = await prisma.vehicle.findMany({
            where: {idUser: user.id}
        })
        response.json(vehicles);
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

router.put("/", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send(response.__("unauthorizedError"));
        }
        const requiredParams = [
            "type", "brand", "model", "registrationYear", "plateNumber",
            "isInsured", "startDateInsurance", "endDateInsurance", "hasBill", 
            "endDateBill", "endDateRevision", "id"
        ];
        
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.body);
        
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }
        
        const {id,...sanitizeParamsNoId} = sanitizedParams;
        await prisma.vehicle.update({
            where: {id},
            data: sanitizeParamsNoId
        })
        response.send(response.__("vehicleUpdatedSuccessfully"));
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

router.delete("/", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send(response.__("unauthorizedError"));
        }
        const requiredParams = ["id"];
        
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);
        
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }

        await prisma.vehicle.delete({
            where: {id:Number(sanitizedParams.id)}
        })
        response.send(response.__("vehicleDeletedSuccessfully"));
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

export default router;