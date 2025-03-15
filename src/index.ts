// #region imports
import express from "express";
import session from "express-session";
import cors from "cors";
import passport from "passport";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import inizializePassport from "./passportConfig";
import dotenv from "dotenv";
import i18n from "i18n";
import path from "path";
import initializeNotificationScheduler from "./notificationScheduler";
import fs from "fs";
// #endregion 

// #region inizialization
dotenv.config();
const app = express();
inizializePassport(passport);
const FRONT_END_URL = process.env.FRONT_END_URL;
if (!FRONT_END_URL) throw ("FRONT_END_URL is required");
const SESSION_SECRET = process.env.SESSION_SECRET;
if (!SESSION_SECRET) throw ("SESSION_SECRET is required");
const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) throw ("COOKIE_SECRET is required");
const PORT = process.env.PORT;
if (!PORT) throw ("PORT is required");
const LOCALES_DIRECTORY = path.resolve(__dirname, 'locales');
const LOCALES = fs.readdirSync(LOCALES_DIRECTORY)
    .filter(file => !fs.statSync(path.join(LOCALES_DIRECTORY, file)).isDirectory())
    .map(file => path.parse(file).name);
i18n.configure({
    locales: LOCALES,
    directory: LOCALES_DIRECTORY,
    defaultLocale: "en",
    queryParameter: "lang",
    autoReload: true,
    syncFiles: true,
    objectNotation: true,
});
// #endregion

// #region middleware
app.use(i18n.init);
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
import notification from "./routes/notification";
app.use("/subscribe", notification);
// #endregion

initializeNotificationScheduler();

app.listen(PORT, () => {
    console.log(`Server has started on http://localhost:${PORT}`);
})
