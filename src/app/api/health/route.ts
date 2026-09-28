import { json } from "@/lib/http/response";

export function GET() {
  return json({ status: "ok", uptime: process.uptime() });
}
