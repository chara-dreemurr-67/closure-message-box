export default new class {
    public BaseAPIURL: string = "https://www.arknights.global/api/resource/news/";

    public async FetchLatest(Index: number, PageSize: number): Promise<Response> {
        return await fetch(
            this.BaseAPIURL + `list?index=${Index}&size=${PageSize}&type=latest`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0"
                }
            }
        );
    }

    public async FetchEvent(Index: number, PageSize: number): Promise<Response> {
        return await fetch(
            this.BaseAPIURL + `list?index=${Index}&size=${PageSize}&type=event`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0"
                }
            }
        );
    }

    public async FetchContest(Index: number, PageSize: number): Promise<Response> {
        return await fetch(
            this.BaseAPIURL + `list?index=${Index}&size=${PageSize}&type=contest`,
            {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:157.0) Gecko/20100101 Firefox/157.0"
                }
            }
        );
    }
}();