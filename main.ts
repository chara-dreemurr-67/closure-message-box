import { Telegraf } from "telegraf";
import type { ParsedNewsPage } from "./helpers/ParseTodaysNews.js";
import type { News } from "./types/NewsList.js";
import LoadEnv from "./LoadEnv.js";
import ParseTodaysNews from "./helpers/ParseTodaysNews.js";
import FetchTodaysNewsList from "./helpers/FetchTodaysNewsList.js";

export default async (): Promise<void> => {
    const Client: Telegraf = new Telegraf(LoadEnv.BOT_TOKEN);

    const News: News[] | undefined = await FetchTodaysNewsList();
    if(!News) {
        await Client.telegram.sendMessage(LoadEnv.CHATID, "Something went wrong.");
        return;
    }
    
    await Client.telegram.sendMessage(LoadEnv.CHATID, `Fetched ${News.length} articles.`);

    const Parsed: ParsedNewsPage[] = await ParseTodaysNews(News);

    for(const News of Parsed) {
        try {
            const Form: FormData = new FormData();
            Form.append("chat_id", String(LoadEnv.CHATID));
            Form.append("rich_message", JSON.stringify({
                html: `${News.Content}\n` +
                    `<p>[Link] ${News.Link}</p>\n` +
                    `<p>[Timestamp] ${new Date(News.Timestamp).toUTCString()}</p>`
                ,
                media: News.Media
            }));
            News.FormData.forEach(F => Form.append(F.ID, F.Blob, F.FileName));

            await fetch(
                `https://api.telegram.org/bot${LoadEnv.BOT_TOKEN}/sendRichMessage`,
                {
                    method: "POST",
                    body: Form
                }
            );

            await Client.telegram.sendMessage(LoadEnv.CHATID, new Array(3).fill("=".repeat(50)).join("\n"));
        }
        catch(Err) {
            console.error(Err);
            console.log(News.Link);
        }
    }
};