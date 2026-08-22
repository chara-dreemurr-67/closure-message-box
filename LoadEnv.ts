import dotenv from "dotenv";

dotenv.config();

const ParseNumber = (Env?: string, Default: number = -1): number => Number(Env) || Default;

export default {
    BOT_TOKEN: process.env.BOT_TOKEN ?? "",
    CHATID: ParseNumber(process.env.CHATID),
    FETCH_SIZE: ParseNumber(process.env.FETCH_SIZE, 50)
};