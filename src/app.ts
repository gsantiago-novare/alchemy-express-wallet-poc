import express from "express";
import type { Express, Request, Response } from "express";
import MockRouters from "./routes/test/index";
import {AuthenticationRouter} from "./routes/auth/index";
import { TransactionRouter } from "./routes/transaction/index";

const app: Express = express();
const port: number = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// TODO: Add validation middleware for request bodies and parameters.
// Use Zod for schema validation

app.get("/express/test", (_req: Request, res: Response): void => {
  console.log("Server is running");
  res.send("<p>express.js test route</p>");
});

app.use("/express/mock", MockRouters.MockRouter);
app.use("/express/authentication", AuthenticationRouter);
app.use("/express/transaction", TransactionRouter);

export default app;