import express, { Request, Response } from "express";
import prisma from "../connection";
import multer from "multer"
import path from "path"
import fs from "fs";
import { User, Vehicle } from "@prisma/client";
const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, req.query.id + "-" + req.query.type + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", upload.single("file"), async (request: Request, response: Response): Promise<any> => {
  try {
    if (!request.isAuthenticated()) {
      return response.status(401).send("User not authenticated");
    }
    if (!request.file) {
      return response.status(422).json("Error, file is missing!");
    }
    if (!request.query.id || !request.query.type) {
      return response.status(422).json("Error, vehicle or type are missing!");
    }

    let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(request.query.id), idUser:  (request.user as User).id} });
    if ( !!vehicle && vehicle[request.query.type as keyof Vehicle] != path.extname(request.file.originalname)){
      let fileName = request.query.id + "-" + request.query.type + vehicle[request.query.type as keyof Vehicle];
      const filePath = path.join(__dirname, "..", "..", "uploads", fileName);
      fs.unlinkSync(filePath);
    }

    await prisma.vehicle.update({
      where: { 
        id: Number(request.query.id),
        idUser: (request.user as User).id,
      },
      data: { 
        [request.query.type as keyof Vehicle]: path.extname(request.file.originalname)
      },
    });
    response.json("File uploaded successfully!");
  } catch (error) {
    response.status(500).send("Server error");
    console.error(error);
  }
})

router.get("/", async (request: Request, response: Response): Promise<any> => {
  try {
    if (!request.isAuthenticated()) {
      return response.status(401).send("User not authenticated");
    }
    if (!request.query.id || !request.query.type) {
      return response.status(422).json("Error, vehicle or type are missing!");
    }
    let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(request.query.id), idUser:  (request.user as User).id} });
    if (!vehicle){
      return response.status(404).json("Error, vehicle not found!");
    }
    if (!vehicle[request.query.type as keyof Vehicle]) {
      return response.status(422).json("Requested file is missing!");
    }

    let fileName = request.query.id + "-" + request.query.type + vehicle[request.query.type as keyof Vehicle];
    const filePath = path.join(__dirname, "..", "..", "uploads", fileName);
    if (!fs.existsSync(filePath)) {
      return response.status(404).json("File not found on server");
    }
    response.sendFile(filePath);
  } catch (error) {
    response.status(500).send("Server error");
    console.error(error);
  }
})

export default router;