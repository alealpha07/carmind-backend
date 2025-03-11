import express, { Request, Response } from "express";
import path from "path"
import fs from "fs";
import { User, Vehicle } from "@prisma/client";
import { sanitizeParams, UPLOAD_DIR, prisma, generateFileName, isAuthenticated } from "../utils";
import {AvailableFiles} from "../types"
const router = express.Router();

router.post("/", isAuthenticated,async (request: Request, response: Response): Promise<any> => {
    try {
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

router.get("/", isAuthenticated, async (request: Request, response: Response): Promise<any> => {
    try { 
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

router.put("/", isAuthenticated, async (request: Request, response: Response): Promise<any> => {
    try {
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

router.delete("/", isAuthenticated, async (request: Request, response: Response): Promise<any> => {
    try {
        const requiredParams = ["id"];
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }

        let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(sanitizedParams.id)} });
        if (!!vehicle) {
            Object.keys(new AvailableFiles()).forEach((type) => {
                let fileName = generateFileName(sanitizedParams.id, type, vehicle[type as keyof Vehicle] as string);
                const filePath = path.join(UPLOAD_DIR, fileName);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                }
            })       
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