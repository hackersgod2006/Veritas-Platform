import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import professionalsRouter from "./professionals";
import projectsRouter from "./projects";
import applicationsRouter from "./applications";
import messagesRouter from "./messages";
import waitlistRouter from "./waitlist";
import adminRouter from "./admin";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(professionalsRouter);
router.use(projectsRouter);
router.use(applicationsRouter);
router.use(messagesRouter);
router.use(waitlistRouter);
router.use(adminRouter);

export default router;
