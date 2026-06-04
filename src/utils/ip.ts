import type { Request } from "express";
import { UAParser } from "ua-parser-js";

export const IpAddress = (req: Request) => {
  const forwarded = req.headers["x-forwarded-for"];

  let ip = "";

  if (typeof forwarded === "string") {
    ip = forwarded.split(",")[0]?.trim() ?? "";
  } else if (Array.isArray(forwarded)) {
    ip = forwarded[0] ?? "";
  } else {
    ip = req.socket.remoteAddress || req.ip || "";
  }

  return ip;
};

export const Device = (req: Request) => {
  const userAgent = req.headers["user-agent"] || "";

  const parser = new UAParser(userAgent);
  const result = parser.getResult();

  return {
    type: result.device.type || "desktop",
    browser: result.browser.name || "unknown",
    os: result.os.name || "unknown",
  };
};
