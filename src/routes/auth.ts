import express, {Request, Response} from "express";
import prisma from "../connection";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "@prisma/client";
import { RequiredKeys } from "@prisma/client/runtime/library";
const PASSWORD_SALT = 10;
const router = express.Router();

router.post("/register", async (request: Request, response: Response): Promise<any> => {
    try {
        const username = request.body.username;
        const password = request.body.password;
        const confirmPassword = request.body.confirmPassword;
        if (!username || !password || !confirmPassword) {
            return response.status(422).send("Username,password,confirmedPassword are required");
        }
        const user = await prisma.user.findUnique({ where: { email: username } });
        if (!!user) {
            return response.status(422).send("User with that email already exists");
        }
        if (password != confirmPassword) {
            return response.status(422).send("Passwords are not matching");
        }
        const hashedPassword = await bcrypt.hash(password, PASSWORD_SALT);
        await prisma.user.create({
            data: {
                email: username,
                password: hashedPassword,
                name: "admin",
                surname: "admin",
                birthDate: new Date(1970, 1, 1),
            }
        })
        response.send("User created succesfly");
    } catch (error) {
        response.status(500).send("Server error");
        console.error(error);
    }
})
router.post("/login", async (request:Request, response:Response, next) => {
    passport.authenticate("local", (error: Error, user: User, info: any) => {
        if (error) throw error;
        if (!user) return response.status(401).send(info.message);
        request.logIn(user, (error) => {
            response.send("User successfully logged in");
        })
    })(request, response, next)
})

router.get("/user", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send("User not authenticated");
        }

        const user = await prisma.user.findUnique({ where: { id: (request.user as User).id } });
        response.send(user);
    } catch (error) {
        response.status(500).send("Server error");
        console.error(error);
    }
})

router.post("/logout", (request:Request, response:Response, next) => {
    request.logOut((err) => {
        if (err) {
            return next(err);
        }
        response.send("Logged out successfully");
    });
})

export default router;