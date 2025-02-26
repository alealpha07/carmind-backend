import express, { Request, Response } from "express";
import prisma from "../connection";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "@prisma/client";
const PASSWORD_SALT = 10;
const router = express.Router();

router.post("/register", async (request: Request, response: Response): Promise<any> => {
    try {
        const username = request.body.username;
        const password = request.body.password;
        const confirmPassword = request.body.confirmPassword;
        const name = request.body.name;
        const surname = request.body.surname;
        const birthDate = request.body.birthDate;
        if (!username || !password || !confirmPassword || !name || !surname || !birthDate) {
            return response.status(422).send("Username, password, confirmedPassword, name, surname, birthdate are required");
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
                name: name,
                surname: surname,
                birthDate: new Date(birthDate),
            }
        })
        response.send("User created succesfly");
    } catch (error) {
        response.status(500).send("Server error");
        console.error(error);
    }
})

router.post("/login", async (request: Request, response: Response, next) => {
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

router.post("/logout", (request: Request, response: Response, next) => {
    request.logOut((err) => {
        if (err) {
            return next(err);
        }
        response.send("Logged out successfully");
    });
})

router.post("/reset", async (request: Request, response: Response): Promise<any> => {
    try {
        if (!request.isAuthenticated()) {
            return response.status(401).send("User not authenticated");
        }

        const password = request.body.password;
        const newPassword = request.body.newPassword;
        const confirmNewPassword = request.body.confirmNewPassword;

        if (!password || !newPassword || !confirmNewPassword) {
            return response.status(422).send("password, new password and confirm new password are required");
        }
        const user = (request.user as User);
        const passwordsAreMatching = await bcrypt.compare(password, user.password);
        if (!passwordsAreMatching) {
            return response.status(422).send("Password is incorrect");
        }
        if (newPassword != confirmNewPassword) {
            return response.status(422).send("New passwords are not matching");
        }
        const hashedPassword = await bcrypt.hash(newPassword, PASSWORD_SALT);

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {           
                password: hashedPassword,
            }
        })
        response.send("Password changed correctly");
    } catch (error) {
        response.status(500).send("Server error");
        console.error(error);
    }
})

export default router;