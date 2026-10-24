import { NextRequest, NextResponse } from "next/server";
import connectDb from "@/lib/db";
import User from "@/models/user.model";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
    try{
        const {name,email,password} = await req.json();
        await connectDb();

        if(!name || !email || !password){
            return new NextResponse(JSON.stringify({message:"Please fill all the fields"}),{status:400})
        }

        if(password.length < 6){
            return new NextResponse(JSON.stringify({message:"Password must be at least 6 characters"}),{status:400})
        }

        //Already existing user check
        let user = await User.findOne({email});
        if(user){
            return new NextResponse(JSON.stringify({message:"User already exists"}),{status:400})
        }

        const hashedPassword = await bcrypt.hash(password,10);
        user = await User.create({name,email,password:hashedPassword});
        return new NextResponse(JSON.stringify({message:"User created successfully", user}),{status:201}) 
    } catch(error){
        console.log("Error in register route:", error);
        return new NextResponse(JSON.stringify({message:"Internal Server Error"}),{status:500})
    }
}