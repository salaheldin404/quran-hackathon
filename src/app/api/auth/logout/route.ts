import { NextRequest, NextResponse } from "next/server";
import { clearSession } from "@/lib/oauth/session";

const QF_LOGOUT_URL = "https://oauth2.quran.foundation/oauth2/sessions/logout";
const SITE_URL = process.env.SITE_URL!;
export async function GET(req: NextRequest) {
  try {
    const idToken = req.cookies.get("qf_id_token")?.value;

    await clearSession();

    if (!idToken) {
      return NextResponse.redirect(QF_LOGOUT_URL);
    }

    // Logout from Quran Foundation SSO
    const logoutUrl = new URL(QF_LOGOUT_URL);

    logoutUrl.searchParams.set("id_token_hint", idToken);

    logoutUrl.searchParams.set("post_logout_redirect_uri", SITE_URL);

    return NextResponse.redirect(logoutUrl);
  } catch (error) {
    console.error(error);

    return NextResponse.redirect(new URL("/", process.env.SITE_URL));
  }
}
