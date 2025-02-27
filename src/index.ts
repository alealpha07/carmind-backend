// #region imports
import express, { Request, Response } from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs"
import bodyParser from "body-parser";
import prisma from "./connection";
import inizializePassport from "./passportConfig";
import dotenv from "dotenv";
import { User } from "@prisma/client";

dotenv.config();
// #endregion 
// #region inizialization
const app = express();
inizializePassport(passport);
const FRONT_END_URL = process.env.FRONT_END_URL;
if (!FRONT_END_URL) throw ("FRONT_END_URL is required");
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw ("SESSION_SECRET is required");
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) throw ("COOKIE_SECRET is required");
// #endregion

// #region middlewhere
app.use(cors({ origin: [FRONT_END_URL], credentials: true }));
app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
app.use(session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));
app.use(cookieParser(COOKIE_SECRET));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.json());

// #endregion

// #region routes
import auth from "./routes/auth";
app.use("/auth", auth);
import upload from "./routes/upload";
app.use("/upload", upload);
import vehicle from "./routes/vehicle";
app.use("/vehicle", vehicle);

// #endregion

app.listen(process.env.PORT, () => {
    console.log(`Server has started on http://localhost:${process.env.PORT}`);
})
