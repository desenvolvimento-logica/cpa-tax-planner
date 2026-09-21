import { supabase } from "@/integrations/supabase/app-client";

const HUB_ORIGIN = "https://hub-logica.vercel.app";

declare global {
  interface Window {
    __luziaSessionListener?: boolean;
  }
}

export function initializeHubSessionListener() {
  if (typeof window === "undefined" || window.__luziaSessionListener) return;

  window.__luziaSessionListener = true;

  window.addEventListener("message", (event: MessageEvent) => {
    if (event.origin !== HUB_ORIGIN) return;
    const data = event.data as
      | { type?: string; access_token?: string; refresh_token?: string }
      | undefined;
    if (data?.type !== "LUZIA_SESSION") return;
    if (!data.access_token || !data.refresh_token) return;

    supabase.auth
      .setSession({ access_token: data.access_token, refresh_token: data.refresh_token })
      .then(async ({ error }) => {
        if (error) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
        const nome =
          (typeof meta['full_name'] === "string" ? meta['full_name'] : undefined) ??
          (typeof meta['name'] === "string" ? meta['name'] : undefined) ??
          user.email?.split("@")[0] ??
          "";
        // A tabela tp_profiles vive no banco do Hub, fora dos tipos gerados localmente.
        const db = supabase as unknown as {
          from: (table: string) => { upsert: (values: Record<string, unknown>) => Promise<unknown> };
        };
        await db.from("tp_profiles").upsert({ id: user.id, nome, email: user.email ?? "" });
      })
      .catch((error) => console.error("[LUZIA_SESSION]", error));
  });

  try {
    window.parent?.postMessage({ type: "LUZIA_READY" }, HUB_ORIGIN);
  } catch {
    // ignora
  }
}

initializeHubSessionListener();

export {};
