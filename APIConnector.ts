export default new class {
    public BaseAPIURL: string = "https://www.arknights.global/api/resource/news/";

    public async FetchLatest(Index: number, PageSize: number): Promise<Response> {
        return await fetch(this.BaseAPIURL + `list?index=${Index}&size=${PageSize}&type=latest`);
    }

    public async FetchEvent(Index: number, PageSize: number): Promise<Response> {
        return await fetch(this.BaseAPIURL + `list?index=${Index}&size=${PageSize}&type=event`);
    }

    public async FetchContest(Index: number, PageSize: number): Promise<Response> {
        return await fetch(this.BaseAPIURL + `list?index=${Index}&size=${PageSize}&type=contest`);
    }
}();