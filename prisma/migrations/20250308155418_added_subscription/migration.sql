-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Subscription_endpoint_key" ON "Subscription"("endpoint");
