import {Request} from "express";


export default function verifyAdmin(req: Request) {
    return getUsernameFromToken(req.get("token")) === "admin";
}

function getUsernameFromToken(token: string | undefined) {
    //TODO implement get Username from token logic
    return token;
}