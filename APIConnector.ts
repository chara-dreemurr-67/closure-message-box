import LoadEnv from "./LoadEnv.js";

export default new class {
    public BaseAPIURL: string = "https://www.arknights.global/api/resource/news/";

    public async FetchLatest(Index: number): Promise<Response> {
        return await fetch(this.BaseAPIURL + `list?index=${Index}&size=${LoadEnv.FETCH_SIZE}&type=latest`);
    }

    public async FetchEvent(Index: number): Promise<Response> {
        return await fetch(this.BaseAPIURL + `list?index=${Index}&size=${LoadEnv.FETCH_SIZE}&type=event`);
    }

    public async FetchContest(Index: number): Promise<Response> {
        return await fetch(this.BaseAPIURL + `list?index=${Index}&size=${LoadEnv.FETCH_SIZE}&type=contest`);
    }
}();