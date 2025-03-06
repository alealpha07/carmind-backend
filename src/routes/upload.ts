import express, { Request, Response } from "express";
import prisma from "../connection";
import multer from "multer"
import path from "path"
import fs from "fs";
import { User, Vehicle } from "@prisma/client";
import { sanitizeParams } from "../utils";
const router = express.Router();

type AvailableFiles =  {
  registrationCardFileExtension: boolean,
  maintenanceFileExtension: boolean,
  insuranceFileExtension: boolean,
  vehicleImageFileExtension: boolean
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, req.query.id + "-" + req.query.type + path.extname(file.originalname)),
});
const upload = multer({ storage });

router.post("/", upload.single("file"), async (request: Request, response: Response): Promise<any> => {
  try {
    if (!request.isAuthenticated()) {
      return response.status(401).send(response.__("unauthorizedError"));
    }
    if (!request.file) {
      return response.status(422).json(response.__("fileMissingError"));
    }

    const requiredParams = [
      "id", "type"
    ];

    const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);

    if (missingParams.length > 0) {
      return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
    }

    let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(sanitizedParams.id), idUser: (request.user as User).id } });
    if (!!vehicle && !!vehicle[sanitizedParams.type as keyof Vehicle] && vehicle[sanitizedParams.type as keyof Vehicle] != path.extname(request.file.originalname)) {
      let fileName = sanitizedParams.id + "-" + sanitizedParams.type + vehicle[sanitizedParams.type as keyof Vehicle];
      const filePath = path.join(__dirname, "..", "..", "uploads", fileName);
      fs.unlinkSync(filePath);
    }

    await prisma.vehicle.update({
      where: {
        id: Number(sanitizedParams.id),
        idUser: (request.user as User).id,
      },
      data: {
        [sanitizedParams.type as keyof Vehicle]: path.extname(request.file.originalname)
      },
    });
    response.json(response.__("fileUploadedSuccessfully"));
  } catch (error) {
    response.status(500).send(response.__("serverError"));
    console.error(error);
  }
})

router.get("/", async (request: Request, response: Response): Promise<any> => {
  try {
    if (!request.isAuthenticated()) {
      return response.status(401).send(response.__("unauthorizedError"));
    }
    const requiredParams = [
      "id", "type"
    ];
    const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);
    if (missingParams.length > 0) {
      return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
    }
    let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(sanitizedParams.id), idUser: (request.user as User).id } });
    if (!vehicle) {
      return response.status(404).json(response.__("vehicleNotFoundError"));
    }
    if (!vehicle[sanitizedParams.type as keyof Vehicle]) {
      return response.status(422).json(response.__("fileNotFoundError"));
    }

    let fileName = sanitizedParams.id + "-" + sanitizedParams.type + vehicle[sanitizedParams.type as keyof Vehicle];
    const filePath = path.join(__dirname, "..", "..", "uploads", fileName);
    if (!fs.existsSync(filePath)) {
      return response.status(404).json(response.__("fileNotFoundError"));
    }
    response.sendFile(filePath);
  } catch (error) {
    response.status(500).send(response.__("serverError"));
    console.error(error);
  }
})

  router.get("/available", async (request: Request, response: Response): Promise<any> => {
    try {
      if (!request.isAuthenticated()) {
        return response.status(401).send(response.__("unauthorizedError"));
      }
      const requiredParams = ["id"];
      const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);
      if (missingParams.length > 0) {
        return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
      }
      let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(sanitizedParams.id), idUser: (request.user as User).id } });
      if (!vehicle) {
        return response.status(404).json(response.__("vehicleNotFoundError"));
      }
      let availableFiles: AvailableFiles = {
        registrationCardFileExtension: false,
        maintenanceFileExtension: false,
        insuranceFileExtension: false,
        vehicleImageFileExtension: false
      };
  
      Object.keys(availableFiles).forEach((type) => {
        let fileName = sanitizedParams.id + "-" + type + vehicle[type as keyof Vehicle];
        const filePath = path.join(__dirname, "..", "..", "uploads", fileName);
        if (fs.existsSync(filePath)) {
          availableFiles[type as keyof AvailableFiles] = true;
        }
      })
      response.json(availableFiles);
    } catch (error) {
      response.status(500).send(response.__("serverError"));
      console.error(error);
    }
  })

router.delete("/", async (request: Request, response: Response): Promise<any> => {
  try {
    if (!request.isAuthenticated()) {
      return response.status(401).send(response.__("unauthorizedError"));
    }
    const requiredParams = [
      "id", "type"
    ];

    const { sanitizedParams, missingParams } = sanitizeParams(requiredParams, request.query);

    if (missingParams.length > 0) {
      return response.status(422).send(response.__("missingRequiredParamsError") + missingParams.map((p => response.__(p))).join(", "));
    }

    let vehicle = await prisma.vehicle.findFirst({ where: { id: Number(sanitizedParams.id), idUser: (request.user as User).id } });
    if (!!vehicle && !!vehicle[sanitizedParams.type as keyof Vehicle]) {
      let fileName = sanitizedParams.id + "-" + sanitizedParams.type + vehicle[sanitizedParams.type as keyof Vehicle];
      const filePath = path.join(__dirname, "..", "..", "uploads", fileName);
      fs.unlinkSync(filePath);
    }

    await prisma.vehicle.update({
      where: {
        id: Number(sanitizedParams.id),
        idUser: (request.user as User).id,
      },
      data: {
        [sanitizedParams.type as keyof Vehicle]: null
      },
    });
    response.json(response.__("fileDeletedSuccessfully"));
  } catch (error) {
    response.status(500).send(response.__("serverError"));
    console.error(error);
  }
})

export default router;