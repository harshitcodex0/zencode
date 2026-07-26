"use server";
import {prisma} from "@/lib/db";
import {currentUser} from "@clerk/nextjs/server";
import {DbNull} from "@prisma/client/runtime/client";

export const onBoardUser = async () => {
    
    try {
        const user = await currentUser();

        if(!user) {
            return {success: false, error:"No authenticated user found"};
        }

        const {id, firstName, lastName, imageUrl, emailAddresses} = user;

        const newUser = await prisma.user.upsert({
            where:{
                clerkId: id
            },
            update: {
                // clerkId:id,
                firstName:firstName || null,
                lastName:lastName || null,
                imageUrl:imageUrl || null,
                email:emailAddresses[0].emailAddress || ""
            },
            create: {
                clerkId:id,
                firstName:firstName || null,
                lastName:lastName || null,
                imageUrl:imageUrl || null,
                email:emailAddresses[0].emailAddress || "",
            }
        })
        return { success: true, user: newUser };
    } catch (error) {
        console.error("Error saving user:", error);
        return { success: false, error: "Failed to save user" };
    }
}


export const currentUserRole = async () => {
    try {

        const user = await currentUser();

        if(!user) {
            return {success: false, error:"No authenticated user found"};
        }

        const {id}= user;

        const userRole = await prisma.user.findUnique({
            where:{
                clerkId: id
            },
            select: {
                role:true
            }
        })

        return  userRole?.role;
    } catch (e) {
        
    }
}


export const getCurrentUserData = async () => {
    try {
        const user = await currentUser();

        if(!user) {
            return {success: false, error:"No authenticated user found"};
        }

        const data = await prisma.user.findUnique({
            where: {
                clerkId:user.id
            },
            select:{

            }
        })
        return data;
    } catch(error) {

    }
}