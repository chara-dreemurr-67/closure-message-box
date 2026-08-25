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

const Void: Set<string> = new Set(["hr", "br"]);

const ToTelegramRichHTML = (HTML: string, Media: TelegramRichMedia[], FormData: FormData[]): string => 
    [...new JSDOM(`<body>${HTML}</body>`).window.document.childNodes]
        .map(Node => SerializeNode(Node, Media, FormData))
        .join("").trim()
;

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

const SerializeContainer = (Parent: ParentNode, Media: TelegramRichMedia[], FormData: FormData[]): string => {
    const Parts: string[] = [];
    let InlineBuffer: string[] = [];

    const FlushInlineBuffer = () => {
        const Content: string = InlineBuffer.join("").trim();

        if(Content) 
            Parts.push(`<p>${Content}</p>`);

        InlineBuffer = [];
    };

    for(const Node of Array.from(Parent.childNodes)) {
        const Serialized: string = SerializeNode(Node, Media, FormData);
        
        if(!Serialized) 
            continue;
        
        if(IsBlockNode(Node)) {
            FlushInlineBuffer();
            Parts.push(Serialized);
        }
        else InlineBuffer.push(Serialized);
    }

    FlushInlineBuffer();

    return Parts.join("");
};

const SerializeNode = (Node: Node, Media: TelegramRichMedia[], FormData: FormData[]): string => {
    if(Node.nodeType === 3) 
        return EscapeText(Node.textContent ?? "");

    if(Node.nodeType === 8) 
        return "";

    if(!IsElement(Node)) 
        return "";

    const Element: Element = Node as Element;
    const Tag: string = Element.tagName.toLowerCase();

    if(Tag === "img") 
        return SerializeImage(Element, Media, FormData);

    if(!Tags.has(Tag))
        return SerializeContainer(Element, Media, FormData);

    if(Block.has(Tag)) {
        const Children: string = SerializeContainer(Element, Media, FormData);

        return Tag === "hr"
            ? "<hr>"
            : `<${Tag}>${Children}</${Tag}>`
        ;
    }

    const Children: string = [...Element.childNodes].map(N => SerializeNode(N, Media, FormData)).join("");

    if(!Tags.has(Tag)) 
        return Children;

    const Attributes: string = SerializeAttributes(Element, Media, FormData);

    return Void.has(Tag)
        ? `<${Tag}${Attributes}>`
        : `<${Tag}${Attributes}>${Children}</${Tag}>`
    ;
};

const SerializeAttributes = (Element: Element, Media: TelegramRichMedia[], FormData: FormData[]): string => {
    const TagName: string = Element.tagName.toLowerCase();

    switch(TagName) {
        case "a":
            return SerializeAnchorAttributes(Element);

        case "img":
            return SerializeImage(Element, Media, FormData);

        default:
            return "";
    }
};

const SerializeAnchorAttributes = (Element: Element): string => {
    const href: string | null = Element.getAttribute("href");

    return !href 
        ? ""
        : ` href="${EscapeAttribute(href)}"`
    ;
};

const SerializeImage = (Element: Element, Media: TelegramRichMedia[], FormData: FormData[]): string => {
    const src: string | null = Element.getAttribute("src");

    if(!src) 
        return "";

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

    return `<img src="tg://photo?id=${id}">`;
};

const EscapeText = (Value: string): string => 
    Value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
;

const EscapeAttribute = (Value: string): string => 
    Value
        .replace(/&/g, "&amp;")
        .replace(/"/g, "&quot;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
;

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
        Content: ToTelegramRichHTML(document.body.innerHTML, Media, FormData)
    };
});