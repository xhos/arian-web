import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user as userTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const { email, password, displayName } = await request.json();

    const signUpResponse = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name: displayName,
      },
    });

    if (!signUpResponse?.user) {
      return NextResponse.json({ error: "Failed to create account" }, { status: 400 });
    }

    const user = signUpResponse.user;

    // since the user doesn't have a session yet, we use server-to-server auth
    // TODO: this is a bit of an anti-pattern
    const backendResponse = await fetch(
      `${process.env.ARIAND_URL}/arian.v1.UserService/CreateUser`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Internal-Key": process.env.API_KEY!,
        },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          display_name: displayName,
        }),
      }
    );

    if (!backendResponse.ok) {
      try {
        await db.delete(userTable).where(eq(userTable.id, user.id));
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }

      const errorText = await backendResponse.text();
      console.error("Backend user creation failed:", errorText);

      return NextResponse.json({ error: "Account creation failed" }, { status: 500 });
    }

    const sessionResponse = await auth.api.signInEmail({
      body: { email, password },
    });

    if (!sessionResponse?.token) {
      console.error("Failed to create session after signup");
    }

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: displayName,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Signup failed" }, { status: 500 });
  }
}
