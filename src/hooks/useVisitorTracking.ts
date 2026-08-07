import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const ID_KEY = "jm_visitor_id";
const PING_KEY = "jm_visitor_last_ping";
const DAY_MS = 24 * 60 * 60 * 1000;
const HEARTBEAT_MS = 60 * 1000;

const getVisitorId = () => {
  let id = localStorage.getItem(ID_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(ID_KEY, id);
  }
  return id;
};

/** Registers the browser as a visitor once, then keeps an "online" heartbeat. */
export const useVisitorTracking = () => {
  useEffect(() => {
    let stopped = false;
    const visitorId = getVisitorId();

    const ping = async () => {
      if (stopped) return;
      const now = Date.now();
      const last = Number(localStorage.getItem(PING_KEY) || 0);
      const newWindow = !last || now - last > DAY_MS;

      const { error } = await supabase.rpc("track_visit", { _visitor_id: visitorId });
      if (error) return;
      if (newWindow) localStorage.setItem(PING_KEY, String(now));
    };


    ping();
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") ping();
    }, HEARTBEAT_MS);

    return () => {
      stopped = true;
      window.clearInterval(interval);
    };
  }, []);
};
