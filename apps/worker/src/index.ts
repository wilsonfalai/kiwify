export const appName = "worker";

if (process.env.NODE_ENV !== "test") {
  console.log("worker bootstrap ready");
}
