import express, { Request, Response } from "express";
import multer from "multer"
import path from "path"
import fs from "fs";
import { AvailableFiles } from "../types"
import { User, Vehicle } from "@prisma/client";
import { sanitizeParams, UPLOAD_DIR, prisma, generateFileName, isAuthenticated } from "../utils";
const router = express.Router();
const UPLOAD_FILE_DIR = "uploads/";

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, UPLOAD_FILE_DIR),
    filename: (req, file, cb) => {
        const requiredParams = ["id", "type"];
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, req.query);
        if (missingParams.length > 0) {
            return console.error ("Missing required params: " + missingParams.join(", "));
        }
        cb(null, generateFileName(sanitizedParams.id, sanitizedParams.type, path.extname(file.originalname)))
    },
});
const upload = multer({ storage });

router.post("/", upload.single("file"), isAuthenticated, async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.file) {
            return response.status(422).json(response.__("fileMissingError"));
        }

        const requiredParams = ["id", "type"];
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }

        if (!Object.keys(new AvailableFiles()).includes(sanitizedParams.type)) {
            return response.status(422).send(response.__("typeNotFoundError"));
        }

        let { id, type } = sanitizedParams;
        let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(id), idUser: (request.user as User).id } });
        if (!!vehicle && vehicle[type as keyof Vehicle] != path.extname(request.file.originalname)) {
            const filePath = path.join(UPLOAD_DIR, generateFileName(id, type, vehicle[type as keyof Vehicle] as string));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await prisma.vehicle.update({
            where: {
                id: Number(id),
                idUser: (request.user as User).id,
            },
            data: {
                [type as keyof Vehicle]: path.extname(request.file.originalname)
            },
        });
        response.json(response.__("fileUploadedSuccessfully"));
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

router.get("/", isAuthenticated, async (request: Request, response: Response): Promise<any> => {
    try {
        const requiredParams = ["id", "type"];
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }

        if (!Object.keys(new AvailableFiles()).includes(sanitizedParams.type)) {
            return response.status(422).send(response.__("typeNotFoundError"));
        }

        let { id, type } = sanitizedParams;
        let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(id), idUser: (request.user as User).id } });
        if (!vehicle) {
            return response.status(404).json(response.__("vehicleNotFoundError"));
        }
        if (!vehicle[type as keyof Vehicle]) {
            return response.status(422).json(response.__("fileNotFoundError"));
        }

        const filePath = path.join(UPLOAD_DIR, generateFileName(id, type, vehicle[type as keyof Vehicle] as string));
        if (!fs.existsSync(filePath)) {
            return response.status(404).json(response.__("fileNotFoundError"));
        }
        response.sendFile(filePath);
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

router.delete("/", isAuthenticated, async (request: Request, response: Response): Promise<any> => {
    try {
        const requiredParams = ["id", "type"];
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }

        if (!Object.keys(new AvailableFiles()).includes(sanitizedParams.type)) {
            return response.status(422).send(response.__("typeNotFoundError"));
        }

        let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(sanitizedParams.id), idUser: (request.user as User).id } });
        if (!!vehicle) {
            const filePath = path.join(UPLOAD_DIR, generateFileName(sanitizedParams.id, sanitizedParams.type, vehicle[sanitizedParams.type as keyof Vehicle] as string));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await prisma.vehicle.update({
            where: {
                id: Number(sanitizedParams.id),
                idUser: (request.user as User).id,
            },
            data: {
                [sanitizedParams.type as keyof Vehicle]: null
            },
        });
        response.json(response.__("fileDeletedSuccessfully"));
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

export default router;