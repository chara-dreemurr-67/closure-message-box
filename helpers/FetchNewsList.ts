import APIConnector from "../APIConnector.js";
import type { News, NewsList } from "../types/NewsList.js";

export default async (Index: number, PageSize: number): Promise<News[] | undefined> => {
    const Response: Response = await APIConnector.FetchLatest(Index, PageSize);
    if(!Response.ok)
        return;

    const NewsList: NewsList = await Response.json() as NewsList;
    return NewsList.data.rows;
};