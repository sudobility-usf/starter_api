import {
  initializeAuth,
  createCachedVerifier,
  getUserInfo as getFirebaseUserInfo,
  isSiteAdmin,
  isAnonymousUser,
} from "@sudobility/auth_service";
import { getRequiredEnv, getEnv } from "../lib/env-helper";

const isTestMode = getEnv("NODE_ENV") === "test" || getEnv("BUN_ENV") === "test";

if (!isTestMode) {
  initializeAuth({
    firebase: {
      projectId: getRequiredEnv("FIREBASE_PROJECT_ID"),
      clientEmail: getRequiredEnv("FIREBASE_CLIENT_EMAIL"),
      privateKey: getRequiredEnv("FIREBASE_PRIVATE_KEY"),
    },
    siteAdminEmails: getEnv("SITEADMIN_EMAILS"),
  });
}

const cachedVerifier = createCachedVerifier(300000);

export async function verifyIdToken(token: string) {
  if (isTestMode) {
    throw new Error("Firebase verification not available in test mode");
  }
  return cachedVerifier.verify(token);
}

export { isSiteAdmin, isAnonymousUser };
export { getFirebaseUserInfo as getUserInfo };
