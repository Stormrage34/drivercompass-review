"use server";

import { redirect } from "next/navigation";
import { finalizeAccountDeletion } from "@/lib/account-deletion";
import { destroySession } from "@/lib/auth";

/**
 * POST-only confirmation. Opening the emailed link renders the page; nothing is
 * deleted until this action runs.
 */
export async function confirmAccountDeletionAction(formData: FormData): Promise<void> {
  const token = String(formData.get("token") ?? "");
  const result = await finalizeAccountDeletion(token);

  if (result.status === "invalid") {
    redirect("/account/delete/confirm?error=invalid");
  }
  if (result.status === "employer_with_company") {
    redirect("/account/delete/confirm?error=company");
  }

  try {
    await destroySession();
  } catch {
    // The link may be opened on a device without a session; deletion already
    // invalidated every session for the account.
  }

  redirect("/account/deleted");
}
