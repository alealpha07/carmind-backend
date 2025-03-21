import Local from "passport-local";
const LocalStrategy = Local.Strategy;
import bcrypt from "bcryptjs";
import { prisma } from "./utils";
import { DoneCallback, PassportStatic } from "passport";
import { User } from "@prisma/client";

function initialize(passport: PassportStatic) {
    const authenticateUser = async (username:string, password:string, done: Function) => {
        try {
            const user = await prisma.user.findUnique({ where: { email: username } });
            if (!user) {
                return done(null, false, { message: "wrongCredentialsError" });
            }
            const passwordsAreMatching = await bcrypt.compare(password, user.password);
            if (passwordsAreMatching) {
                return done(null, user);
            }
            else {
                return done(null, false, { message: "wrongCredentialsError" });
            }
        } catch (error) {
            return done(error);
        }
    };

    passport.use(new LocalStrategy({
        usernameField:"username"
    }, authenticateUser));

    passport.serializeUser((user: Express.User,done:DoneCallback) => done(null, (user as User).id));

    
    passport.deserializeUser(async (id:number,done:DoneCallback) => {
        try {
            const user = await prisma.user.findUnique({ where: { id: id } });
            if(!user){
                return done(null,false);
            }
            return done(null,user);
        } catch (error) {
            return done(error);
        }
    })
}

export default initialize;
