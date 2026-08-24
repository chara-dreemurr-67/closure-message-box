import type { News } from "../types/NewsList.js"
import { JSDOM } from "jsdom";

const Tags: Set<string> = new Set([
    "a",
    "b",
    "strong",
    "i",
    "em",
    "u",
    "ins",
    "s",
    "strike",
    "del",
    "mark",
    "small",
    "big",
    "code",
    "pre",
    "blockquote",
    "details",
    "summary",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "p",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "br",
    "hr",
    "sub",
    "sup",
    "img"
]);

const Block: Set<string> = new Set([
    "p",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "table",
    "thead",
    "tbody",
    "tfoot",
    "tr",
    "th",
    "td",
    "blockquote",
    "pre",
    "details",
    "hr"
]);

enum NodeTypes {
    ELEMENT_NODE = 1,
    ATTRIBUTE_NODE = 2,
    TEXT_NODE = 3,
    CDATA_SECTION_NODE = 4,
    ENTITY_REFERENCE_NODE = 5,
    ENTITY_NODE = 6,
    PROCESSING_INSTRUCTION_NODE = 7,
    COMMENT_NODE = 8,
    DOCUMENT_NODE = 9,
    DOCUMENT_TYPE_NODE = 10,
    DOCUMENT_FRAGMENT_NODE = 11,
    NOTATION_NODE = 12
}

const IsBlockNode = (node: Node): boolean => 
    node.nodeType === 1 &&
    Block.has((node as Element).tagName.toLowerCase())
;

const IsElement = (Node: unknown): Node is Element => 
    typeof Node === "object" &&
    Node !== null &&
    "nodeType" in Node &&
    (Node as Node).nodeType === 1
;

const ModifyImage = (Element: Element, document: Document, Media: TelegramRichMedia[], FormData: FormData[]): HTMLImageElement | undefined => {
    const src: string | null = Element.getAttribute("src");

    if(!src) 
        return;

    const id: string = `media_${Media.length}`;

    Media.push({
        id,
        media: {
            type: "photo",
            media: `attach://${id}`
        }
    });

    FormData.push({
        ID: id,
        Link: src,
        FileName: `${id}.png`
    });

    const Img: HTMLImageElement = document.createElement("img");
    Img.src = `tg://photo?id=${id}`;

    return Img;
};

const ModifyContainer = (Node: Element, document: Document, Media: TelegramRichMedia[], FormData: FormData[]): DocumentFragment => {
    const Fragment: DocumentFragment = document.createDocumentFragment();
    const InlineBuffer: Node[] = [];

    const FlushInlineBuffer = (): void => {
        if(!InlineBuffer.length)
            return;
        Fragment.append(...InlineBuffer.map(N => {
            const P: HTMLParagraphElement = document.createElement("p");
            P.appendChild(N);
            return P;
        }));
        InlineBuffer.length = 0;
    };

    for(const Child of [...Node.childNodes]) {
        const Modified: DocumentFragment | undefined = ModifyNode(Child, document, Media, FormData);
        
        if(!Modified) 
            continue;
        
        if(IsBlockNode(Child)) {
            FlushInlineBuffer();
            Fragment.append(Modified);
        }
        else InlineBuffer.push(Modified);
    }

    FlushInlineBuffer();
    return Fragment;
};

const ModifyNode = (Node: Node, document: Document, Media: TelegramRichMedia[], FormData: FormData[]): DocumentFragment | undefined => {
    const Fragment: DocumentFragment = document.createDocumentFragment();
    if(Node.nodeType === Node.TEXT_NODE) {
        if(!Node.textContent)
            return;

        Fragment.appendChild(document.createTextNode(Node.textContent));
        return Fragment;
    }

    if(Node.nodeType === NodeTypes.COMMENT_NODE)
        return;

    if(!IsElement(Node))
        return;

    const TagName: string = Node.tagName.toLowerCase();

    if(TagName === "img") {
        const Img: HTMLImageElement | undefined = ModifyImage(Node, document, Media, FormData);

        if(!Img)
            return;

        Fragment.appendChild(Img);
        return Fragment;
    }

    if(TagName === "a") {
        const href: string | null = Node.getAttribute("href");

        if(!href)
            return;

        const a: HTMLAnchorElement = document.createElement("a");

        Fragment.appendChild(a);

        return Fragment;
    }

    if(!Tags.has(TagName)) {
        const Modified: DocumentFragment = ModifyContainer(Node, document, Media, FormData);
        if(!Modified.childNodes.length)
            return;
        return Modified;
    }

    if(Block.has(TagName)) {
        if(TagName === "hr") {
            Fragment.appendChild(document.createElement("hr"));
            return Fragment;
        }

        const Children: DocumentFragment = ModifyContainer(Node, document, Media, FormData);

        if(!Children.childNodes.length)
            return;
        return Children;
    }

    [...Node.childNodes]
        .map(N => ModifyNode(N, document, Media, FormData))
        .filter(F => !!F)
        .forEach(F => Fragment.appendChild(F))
    ;
    return Fragment;
};

const ToTelegramRichHTML = (HTML: string, Media: TelegramRichMedia[], FormData: FormData[]): HTMLBodyElement => {
    const DOM: JSDOM = new JSDOM(`<body></body>`);
    const document: Document = DOM.window.document;

    document.body.innerHTML = new JSDOM(HTML).window.document.body.innerHTML.replaceAll("\n", "");

    const Root: HTMLBodyElement = document.createElement("body");

    [...document.body.childNodes]
        .map(N => ModifyNode(N, document, Media, FormData))
        .filter(F => !!F)
        .forEach(F => Root.appendChild(F))
    ;

    return Root;
};

export interface ParsedNewsPage {
    Timestamp: number;
    Link: string;
    ID: number;
    Media: TelegramRichMedia[];
    FormData: FormData[];
    Content: string;
}

export interface TelegramRichMedia {
    id: string;
    media: {
        type: string;
        media: string;
    };
}

export interface FormData {
    ID: string;
    Link: string;
    FileName: string;
}

export default (News: News[]): ParsedNewsPage[] => News.map(N => {
    const DOM: JSDOM = new JSDOM(`<body>${N.content}</body>`);        
    const document: Document = DOM.window.document;
    const Media: TelegramRichMedia[] = [];
    const FormData: FormData[] = [];

    return {
        Timestamp: N.publishTime,
        Link: N.link,
        ID: N.id,
        Media,
        FormData,
        Content: ToTelegramRichHTML(document.body.innerHTML, Media, FormData).innerHTML.replaceAll("\n", "")
    };
});