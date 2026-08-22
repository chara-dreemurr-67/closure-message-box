import main from "../main.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async (_: VercelRequest, Res: VercelResponse): Promise<void> =>{
    await main();
    Res.status(200).send("OK");
};