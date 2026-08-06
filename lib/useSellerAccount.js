"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useSellerAccount() {
  const [account, setAccount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    supabase.auth.getUser().then(async ({ data }) => {
      const uid = data?.user?.id;
      if (!uid) {
        if (!cancelled) {
          setAccount(null);
          setLoading(false);
        }
        return;
      }
      const { data: acc } = await supabase
        .from("seller_accounts")
        .select("status, seller_id, sellers(name)")
        .eq("user_id", uid)
        .maybeSingle();
      if (!cancelled) {
        setAccount(acc);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { account, loading };
}