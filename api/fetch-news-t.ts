import main from "../main.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (Req: VercelRequest, Res: VercelResponse): Promise<void> =>{
    const Index: number = Number(Req.query.index) || 1;
    const Size: number = Number(Req.query.size) || 5;

    await main(Index, Size);
    Res.status(200).send("OK");
};