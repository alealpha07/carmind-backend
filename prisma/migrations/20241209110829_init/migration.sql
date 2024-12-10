-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "surname" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "address" TEXT
);

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "idUser" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "registrationYear" INTEGER NOT NULL,
    "plateNumber" TEXT NOT NULL,
    "isInsured" BOOLEAN NOT NULL,
    "startDateInsurance" DATETIME NOT NULL,
    "endDateInsurance" DATETIME NOT NULL,
    "hasBill" BOOLEAN NOT NULL,
    "endDateBill" DATETIME NOT NULL,
    "endDateRevision" DATETIME NOT NULL,
    "insuranceFileExtension" TEXT,
    "maintenanceFileExtension" TEXT,
    "registrationCardFileExtension" TEXT,
    "vehicleImageFileExtension" TEXT,
    CONSTRAINT "Vehicle_idUser_fkey" FOREIGN KEY ("idUser") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_idUser_key" ON "Vehicle"("idUser");
