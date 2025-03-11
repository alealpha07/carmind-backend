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
import webpush from 'web-push';
import cron from "node-cron"
import {prisma} from "./utils";

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
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
if (!VAPID_PUBLIC_KEY) throw ("VAPID_PUBLIC_KEY is required");
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
if (!VAPID_PRIVATE_KEY) throw ("VAPID_PRIVATE_KEY is required");

webpush.setVapidDetails(
    "",
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
  );
// #endregion

// #region middleware
i18n.configure({
    locales: ["en", "it"],
    directory: path.resolve(__dirname, "locales"),
    defaultLocale: "en",
    queryParameter: "lang",
    autoReload: true,
    syncFiles: true,
    objectNotation: true,
});
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

app.post("/subscribe", async (req, res) => {
    const { endpoint, keys } = req.body;

    try {
        const existing = await prisma.subscription.findUnique({ where: { endpoint } });
        if (!existing) {
            await prisma.subscription.create({ data: { endpoint, p256dh: keys.p256dh, auth: keys.auth } });
        }
        res.status(201).json({ message: "Subscribed successfully!" });
    } catch (error) {
        res.status(500).json({ error: "Failed to save subscription" });
    }
});

cron.schedule("*/2 * * * *", async () => {
    console.log("Running scheduled notification task...");
    const payload = JSON.stringify({ title: "New Notification", body: "Automated alert!" });

    try {
        const subscriptions = await prisma.subscription.findMany();

        for (const sub of subscriptions) {
            const pushSubscription = {
                endpoint: sub.endpoint,
                expirationTime: null,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };
 
            try {
                let result = await webpush.sendNotification(pushSubscription, payload);
            } catch (error: any) {
                if (error.statusCode === 410) {
                    // If the subscription is invalid, remove it from the database
                    console.log(`Subscription invalid for endpoint: ${sub.endpoint}, removing from database.`);
                    await prisma.subscription.delete({
                        where: { endpoint: sub.endpoint },
                    });
                } else {
                    console.error("Error sending notification:", error);
                }
            }
        }
    } catch (error) {
        console.error("Error sending notification:", error);
    }
});

// #endregion

app.listen(process.env.PORT, () => {
    console.log(`Server has started on http://localhost:${process.env.PORT}`);
})
