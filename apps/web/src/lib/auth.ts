import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { Pool } from "pg";
 
export const auth = betterAuth({
  database: new Pool({
    connectionString: process.env.NEXT_PUBLIC_DB,
  }),
  emailAndPassword: {  
    enabled: true
  },
  socialProviders: {
    google: { 
      clientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string, 
      clientSecret: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_SECRET as string, 
    }, 
  },
  plugins: [nextCookies()]
});