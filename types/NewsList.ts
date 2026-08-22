type NewsType = { label: string; value: string; };

export interface News {
    publishTime: number;
    offlineTime: number;
    id: number;
    title: string;
    type: string;
    content: string;
    bigImage: string;
    smallImage: string;
    link: string;
}

export interface NewsList {
    code: number;
    message: string;
    data: {
        count: number;
        rows: News[];
        options: {  type: NewsType[]; };
    };
    timestamp: number;
}