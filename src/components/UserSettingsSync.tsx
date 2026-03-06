"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useTheme } from "next-themes";

export function UserSettingsSync() {
  const { data: session, status } = useSession();
  const { setTheme } = useTheme();

  useEffect(() => {
    if (status !== "authenticated") return;

    fetch("/api/user/settings")
      .then((r) => r.json())
      .then((data) => {
        if (data.theme) setTheme(data.theme);
      })
      .catch(() => {});
  }, [status, setTheme]);

  return null;
}
