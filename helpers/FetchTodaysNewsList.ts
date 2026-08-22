import APIConnector from "../APIConnector.js";
import IsTodayUTC from "./IsTodayUTC.js";
import type { News, NewsList } from "../types/NewsList.js";

export default async (): Promise<News[]> => {
    const Output: News[] = [];
    let Index: number = 1;
    let Break: boolean = false;

    while(true) {
        const Response: Response = await APIConnector.FetchLatest(Index);

        if(!Response.ok)
            break;

        const NewsList: NewsList = await Response.json() as NewsList;
        const News: News[] = NewsList.data.rows;

        for(const N of News) {
            if(!IsTodayUTC(N.publishTime)) {
                Break = true;
                break;
            }

            Output.push(N);
        }
        
        if(Break)
            break;
        Index++;
    };

    return Output;
};