import { Router, type IRouter } from "express";
import healthRouter from "./health";
import audioRouter from "./audio";

const router: IRouter = Router();

router.use(healthRouter);
router.use("/audio", audioRouter);

export default router;
