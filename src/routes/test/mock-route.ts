import express, { Request, Response } from "express";
import MockController from "../../controller/test/mock-controller";

const MockRouter = express.Router();

MockRouter.get("/test", MockController.mockCall);

export default MockRouter;