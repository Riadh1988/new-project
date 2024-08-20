import NextAuth from 'next-auth';
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from '../../../lib/db';
import { Admin, Supervisor, Recruitment } from '../../../models/Access';
import { mongooseConnect } from '../../../lib/mongoose';

async function getUserRole(email) {
  await mongooseConnect();
  const user = await Admin.findOne({ email }) || await Supervisor.findOne({ email }) || await Recruitment.findOne({ email });
  return user?.role || null;
}

export const authOptions = {
  secret: process.env.SECRET,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  adapter: MongoDBAdapter(clientPromise),
  session: {
    jwt: true, // Use JSON Web Tokens for session management
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        secure: process.env.NODE_ENV === true, // Set to true in production for HTTPS
        path: '/',
        sameSite: 'lax', // Ensure cookies are sent with cross-origin requests
      },
    },
  },
  callbacks: {
    session: async ({ session, token, user }) => {
      const role = await getUserRole(session?.user?.email);
      if (role) {
        session.user.role = role;
        return session;
      } else {
        return null; // Return null to signify no session if role is not found
      }
    },
  },
};

export default NextAuth(authOptions);

export async function isAuthorizedRequest(req, res, roles) {
  const session = await getServerSession(req, res, authOptions);
  const userRole = await getUserRole(session?.user?.email);
  if (!roles.includes(userRole)) {
    res.status(401).end();
    throw 'Not authorized';
  }
}
