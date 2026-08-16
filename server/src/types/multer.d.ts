declare module "multer" {
  import type { RequestHandler } from "express";

  interface Multer {
    single(fieldName: string): RequestHandler;
  }

  interface Options {
    storage?: unknown;
    limits?: { files?: number; fileSize?: number };
  }

  function multer(options?: Options): Multer;
  namespace multer {
    function memoryStorage(): unknown;
  }

  export = multer;
}

declare namespace Express {
  interface Request {
    file?: {
      buffer: Buffer;
      mimetype: string;
      originalname: string;
      size: number;
    };
  }
}
