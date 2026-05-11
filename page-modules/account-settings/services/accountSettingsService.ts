import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth/authOptions";

export async function getAccountSettingsPageData() {
  return getServerSession(authOptions);
}
