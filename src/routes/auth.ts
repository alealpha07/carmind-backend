import express, { Request, Response } from "express";
import prisma from "../connection";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "@prisma/client";
import { sanitizeParams } from "../utils";
const PASSWORD_SALT = 10;
const router = express.Router();

router.post("/register", async (request: Request, response: Response): Promise<any> => {
    try {
        const requiredParams = [
            "username", "password", "confirmPassword", "name", "surname", "birthDate"
        ];
        
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.body);
        
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }
        const user = await prisma.user.findUnique({ where: { email: sanitizedParams.username } });
        if (!!user) {
            return response.status(422).send(response.__("emailAlreadyTakenError"));
        }
        if (sanitizedParams.password != sanitizedParams.confirmPassword) {
            return response.status(422).send(response.__("passwordsNotMatchingError"));
        }
        const hashedPassword = await bcrypt.hash(sanitizedParams.password, PASSWORD_SALT);
        await prisma.user.create({
            data: {
                email: sanitizedParams.username,
                password: hashedPassword,
                name: sanitizedParams.name,
                surname: sanitizedParams.surname,
                birthDate: new Date(sanitizedParams.birthDate),
            }
        })
        response.send(response.__("userCreatedSuccessfully"));
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

router.post("/login", async (request: Request, response: Response, next) => {
    passport.authenticate("local", (error: Error, user: User, info: any) => {
        if (error) throw error;
        if (!user) return response.status(401).send(response.__(info.message));
        request.logIn(user, (error) => {
            response.send(response.__("loggedInSuccessfully"));
        })
    })(request, response, next)
})

router.get("/user", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send(response.__("unauthorizedError"));
        }

        const user = await prisma.user.findUnique({ where: { id: (request.user as User).id } });
        response.send(user);
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

router.post("/logout", (request: Request, response: Response, next) => {
    request.logOut((err) => {
        if (err) {
            return next(err);
        }
        response.send(response.__("loggedOutSuccessfully"));
    });
})

router.post("/reset", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send(response.__("unauthorizedError"));
        }

        const requiredParams = [
            "password", "newPassword","confirmNewPassword"
        ];
        
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.body);
        
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }
        const user = (request.user as User);
        const passwordsAreMatching = await bcrypt.compare(sanitizedParams.password, user.password);
        if (!passwordsAreMatching) {
            return response.status(422).send(response.__("passwordIncorrectError"));
        }
        if (sanitizedParams.newPassword != sanitizedParams.confirmNewPassword) {
            return response.status(422).send(response.__("passwordsNotMatchingError"));
        }
        const hashedPassword = await bcrypt.hash(sanitizedParams.newPassword, PASSWORD_SALT);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {           
                password: hashedPassword,
            }
        })
        response.send(response.__("passwordChangedSuccessfully"));
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

router.post("/editprofile", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send(response.__("unauthorizedError"));
        }

        const requiredParams = [
            "name", "surname", "birthDate"
        ];
        
        const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.body);
        
        if (missingParams.length > 0) {
            return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
        }

        const user = (request.user as User);
        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                name: sanitizedParams.name,
                surname: sanitizedParams.surname,
                birthDate: sanitizedParams.birthDate
            }
        })
        response.send(response.__("profileUpdatedSuccessfully"));
    } catch (error) {
        response.status(500).send(response.__("serverError"));
        console.error(error);
    }
})

export default router;