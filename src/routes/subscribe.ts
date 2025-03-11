import express, { Request, Response } from "express";
import { User} from "@prisma/client";
import { sanitizeParams, prisma, isAuthenticated} from "../utils";

const router = express.Router();

router.post("/", isAuthenticated, async (request: Request, response: Response): Promise<any> => {
    try {
        const requiredParams = [
            "endpoint", "keys"
        ];
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.body);
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }
        
        const user = (request.user as User);
        const {endpoint,keys} = sanitizedParams;
        const existing = await prisma.subscription.findUnique({ where: { endpoint } });
        if (!existing) {
            await prisma.subscription.create({ data: { endpoint, p256dh: keys.p256dh, auth: keys.auth, idUser: user.id }});
        }
        response.status(201).json({ message: response.__("subscribedSuccesfully") });
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

export default router;