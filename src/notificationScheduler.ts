import cron from "node-cron"
import { prisma } from "./utils";
import { subDays } from "date-fns";
import webpush from 'web-push';
import i18n from "i18n";

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY;
if (!VAPID_PUBLIC_KEY) throw ("VAPID_PUBLIC_KEY is required");
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY;
if (!VAPID_PRIVATE_KEY) throw ("VAPID_PRIVATE_KEY is required");
const VAPID_EMAIL = process.env.VAPID_EMAIL;
if (!VAPID_EMAIL) throw ("VAPID_EMAIL is required");

webpush.setVapidDetails(
    `mailto:${VAPID_EMAIL}`,
    VAPID_PUBLIC_KEY,
    VAPID_PRIVATE_KEY
);

export default function initNotificationScheduler() {
    cron.schedule("0 12 * * 1", async () => {
        console.log("Running scheduled notification task...");
    
        try {
            const today = new Date();
            const deadlineWarning = subDays(today, -30);
            const deadlineExpired = today;
    
            const expiringSubscriptions = await prisma.subscription.findMany({
                where: {
                    user: {
                        vehicles: {
                            some: {
                                OR: [
                                    { isInsured: true, endDateInsurance: { lte: deadlineWarning, gt: deadlineExpired } },
                                    { hasBill: true, endDateBill: { lte: deadlineWarning, gt: deadlineExpired } },
                                    { endDateRevision: { lte: deadlineWarning, gt: deadlineExpired } }
                                ]
                            }
                        }
                    }
                },
            });
    
            const expiredSubscriptions = await prisma.subscription.findMany({
                where: {
                    user: {
                        vehicles: {
                            some: {
                                OR: [
                                    { isInsured: true, endDateInsurance: { lte: deadlineExpired } },
                                    { hasBill: true, endDateBill: { lte: deadlineExpired } },
                                    { endDateRevision: { lte: deadlineExpired } }
                                ]
                            }
                        }
                    }
                },
            });
    
            for (const sub of expiringSubscriptions) {
                await sendNotification(sub, "impendingExpiration", "impendingExpirationText");
            }
    
            for (const sub of expiredSubscriptions) {
                await sendNotification(sub, "expiredNotification", "expiredNotificationText");
            }
    
        } catch (error) {
            console.error("Error sending notification:", error);
        }
    });
    
    async function sendNotification(sub: any, titleKey: string, bodyKey: string) {
        try {
            i18n.setLocale(sub.locale);
            const pushSubscription = {
                endpoint: sub.endpoint,
                expirationTime: null,
                keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth,
                },
            };
            const payload = JSON.stringify({
                title: i18n.__(titleKey),
                body: i18n.__(bodyKey),
            });
    
            await webpush.sendNotification(pushSubscription, payload);
        } catch (error: any) {
            if (error.statusCode === 410) {
                console.warn(`Subscription invalid for endpoint: ${sub.endpoint}, removing from database.`);
                await prisma.subscription.delete({
                    where: { endpoint: sub.endpoint },
                });
            } else {
                console.error("Error sending notification:", error);
            }
        }
    }
}