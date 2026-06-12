import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.json({
    status: "ok",
    service: "Elyashar Agent",
  });
});

export default router;
