import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import connectDb from "@/lib/db"
import User from "@/models/user.model"
import bcrypt from "bcryptjs"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
  credentials: {
    email: {
      type: "email",
      label: "Email",
      placeholder: "johndoe@gmail.com",
    },
    password: {
      type: "password",
      label: "Password",
      placeholder: "*****",
    },
  },
  async authorize(credentials, request) {
    if(!credentials.email || !credentials.password){
      throw new Error("Please fill all the fields")
    }
    const email = credentials.email;
    const password = credentials.password as string;
    await connectDb();

    const user = await User.findOne({email});
    if(!user){
      throw new Error("User not found");
    }

    const isPasswordValid = bcrypt.compare(password, user.password);
    if(!isPasswordValid){
      throw new Error("Invalid password");
    }

    return {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
    }

  }
}),
    Google({
        clientId: process.env.AUTH_GOOGLE_ID as string,
        clientSecret: process.env.AUTH_GOOGLE_SECRET as string,
    })
  ],
  callbacks: {
    async signIn({ user, account}) {
      if(account?.provider === "google"){
        await connectDb();
        const existingUser = await User.findOne({email: user.email});
        if(!existingUser){
          const newUser = await User.create({
            name: user.name,
            email: user.email,
            role: user.role,
          });
        }
        user.id = existingUser._id
        user.role = existingUser.role
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
      }
      return session;
    }
  },
  pages:{
    signIn: "/signin",
    error: "/signin"
  },
  session: {
    strategy: "jwt",
    maxAge: 10 * 24 * 60 * 60, // 10 days
  },
  secret: process.env.AUTH_SECRET,
})