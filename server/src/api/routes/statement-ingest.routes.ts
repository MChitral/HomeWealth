import { Router, type Request } from "express";
import multer from "multer";
import type { ApplicationServices } from "@application/services";
import { requireUser } from "@api/utils/auth";
import { sendError, sendSuccess } from "@server-shared/utils/api-response";
import {
  IngestRequestError,
  shouldMountStatementIngest,
} from "@application/services/statement-ingest.service";
import { MAX_PDF_BYTES } from "@application/services/statement-ingest/pdf-items";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { files: 1, fileSize: MAX_PDF_BYTES },
});

function handleIngestError(res: Parameters<typeof sendError>[0], error: unknown): void {
  if (error instanceof IngestRequestError) {
    sendError(res, error.status, error.message);
    return;
  }
  sendError(res, 400, "Failed to process statement", error);
}

export function registerStatementIngestRoutes(
  router: Router,
  services: ApplicationServices,
  env: NodeJS.ProcessEnv = process.env
): void {
  if (!shouldMountStatementIngest(env)) {
    return;
  }

  router.post(
    "/mortgages/:id/statements",
    upload.single("file"),
    async (req: Request, res) => {
      const user = requireUser(req, res);
      if (!user) return;
      const file = req.file;
      if (!file?.buffer) {
        sendError(res, 400, "A PDF file part named file is required");
        return;
      }
      try {
        const preview = await services.statementIngest.upload({
          userId: user.id,
          mortgageId: req.params.id,
          bytes: new Uint8Array(file.buffer),
        });
        sendSuccess(res, preview, 201);
      } catch (error) {
        handleIngestError(res, error);
      }
    }
  );

  router.get("/mortgages/:id/statements/:stagedId", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    try {
      const preview = await services.statementIngest.getPreview({
        userId: user.id,
        mortgageId: req.params.id,
        stagedId: req.params.stagedId,
      });
      sendSuccess(res, preview);
    } catch (error) {
      handleIngestError(res, error);
    }
  });

  router.post("/mortgages/:id/statements/:stagedId/reject", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    try {
      const result = await services.statementIngest.reject({
        userId: user.id,
        mortgageId: req.params.id,
        stagedId: req.params.stagedId,
      });
      sendSuccess(res, result);
    } catch (error) {
      handleIngestError(res, error);
    }
  });

  router.post("/mortgages/:id/statements/:stagedId/confirm", async (req, res) => {
    const user = requireUser(req, res);
    if (!user) return;
    try {
      await services.statementIngest.confirm({
        userId: user.id,
        mortgageId: req.params.id,
        stagedId: req.params.stagedId,
      });
    } catch (error) {
      handleIngestError(res, error);
    }
  });
}
