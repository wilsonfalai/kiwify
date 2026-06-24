import { healthStatus } from "./health.module.js";

export function healthResponse() {
  return {
    status: healthStatus(),
    service: "api"
  };
}
