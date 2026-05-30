import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getStoredToken } from "./auth-storage";

type EchoInstance = Echo<"reverb">;

let echo: EchoInstance | null = null;

function broadcastAuthEndpoint(): string {
  const explicit = import.meta.env.VITE_BROADCAST_AUTH_ENDPOINT;
  if (explicit) return explicit;

  const apiBase = import.meta.env.VITE_API_URL;
  if (apiBase) {
    return `${new URL(apiBase).origin}/broadcasting/auth`;
  }

  return "/broadcasting/auth";
}

export function getEcho(): EchoInstance {
  if (echo) return echo;

  echo = new Echo({
    broadcaster: "reverb",
    client: new Pusher(import.meta.env.VITE_REVERB_APP_KEY ?? "", {
      wsHost: import.meta.env.VITE_REVERB_HOST ?? window.location.hostname,
      wsPort: Number(import.meta.env.VITE_REVERB_PORT ?? 80),
      wssPort: Number(import.meta.env.VITE_REVERB_PORT ?? 443),
      forceTLS: (import.meta.env.VITE_REVERB_SCHEME ?? "https") === "https",
      enabledTransports: ["ws", "wss"],
      cluster: "mt1",
      authEndpoint: broadcastAuthEndpoint(),
      auth: {
        headers: {
          Authorization: `Bearer ${getStoredToken() ?? ""}`,
          Accept: "application/json",
        },
      },
    }),
  });

  return echo;
}

export function disconnectEcho(): void {
  echo?.disconnect();
  echo = null;
}
