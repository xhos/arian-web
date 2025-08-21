import { createAuthClient } from "better-auth/react"
import { jwtClient } from "better-auth/client/plugins"

export const authClient = createAuthClient({
  baseUrl: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  plugins: [jwtClient()],
})