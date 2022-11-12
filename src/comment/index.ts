import { JsonApiSuccessfulResponse } from '@skywise-app/types';
import { customAxios as axios } from '../axios';

// ====================

const API = 'https://data.mongodb-api.com/app/skywise-sl-lptdr/endpoint/comment/v1';
const API_PROXY = 'https://cache-proxy.lemonapi.com/skywise/comment/v1';

// ====================

export interface ApiComment {
    auid: string; // 作者uid
    aname: string; // 作者
    content: string; // 正文
    time: string; // 发表时间
    vote: number; // 点赞数
    lang?: string; // 语言
    image: string; // 附件图片
}

export interface ApiResComments extends JsonApiSuccessfulResponse {
    data: {
        comments: ApiComment[];
    };
}

export interface Comment extends ApiComment {
    media: null | {
        type: 'image' | 'youtube';
        url: string; // 原始
        embed: string; // 最大尺寸
        preview: string; // 中等尺寸
        thumbnail: string; // 最小尺寸
    };
}

type LoadOptions = {
    useProxy: boolean;
    app: string;
    categoryId: string;
    docId: string;
    lang?: string;
    ttl?: number; // 浏览器缓存
    sort?: 'time';
};

// ========== 帮助函数 ==========

const getMongoUrl = (action: 'get' | 'post' | 'vote', app: string, categoryId: string, docId: string | number) => {
    let url = `${API}?action=${action}`;
    url += `&app=${app}`;
    url += `&categoryId=${categoryId}&docId=${docId}`;
    return url;
};

const getProxyUrl = (action: 'get', app: string, categoryId: string, docId: string | number, ttl: number) => {
    let url = `${API_PROXY}?action=${action}`;
    url += `&app=${app}`;
    url += `&ttl=${ttl}`;
    url += `&categoryId=${categoryId}&docId=${docId}`;
    return url;
};

const getTextMedia = (text: string): Comment['media'] | null => {
    const imgur = text.match(/https:\/\/imgur\.com\/([0-9a-zA-Z]+)$/);
    const imgurJpg = text.match(/https:\/\/i\.imgur\.com\/([0-9a-zA-Z]+)\.(jpg|png)/);
    const youtubeUnknow2 = text.match(/https:\/\/youtu\.be\/([_\-0-9a-zA-Z]+)/);
    if (imgur) {
        return {
            type: 'image',
            url: imgur[0],
            embed: `https://i.imgur.com/${imgur[1]}h.jpg`,
            preview: `https://i.imgur.com/${imgur[1]}h.jpg`,
            thumbnail: `https://i.imgur.com/${imgur[1]}s.jpg`,
        };
    }
    if (imgurJpg) {
        return {
            type: 'image',
            url: imgurJpg[0],
            embed: `https://i.imgur.com/${imgurJpg[1]}h.jpg`,
            preview: `https://i.imgur.com/${imgurJpg[1]}h.jpg`,
            thumbnail: `https://i.imgur.com/${imgurJpg[1]}s.jpg`,
        };
    }
    if (youtubeUnknow2) {
        return {
            type: 'youtube',
            url: youtubeUnknow2[0],
            embed: `https://www.youtube.com/embed/${youtubeUnknow2[1]}?autoplay=1`,
            preview: `https://game-cdn.appsample.com/gim/images/youtube-s.png`,
            thumbnail: `https://game-cdn.appsample.com/gim/images/youtube-s.png`,
        };
    }
    return null;
};

const getExtraVote = (comment: Comment, lang: string) => {
    let basic = 0;
    if (comment.media) {
        if (comment.media.type === 'image') basic += (2 + comment.vote) * 5;
        if (comment.media.type === 'youtube') basic += (2 + comment.vote) * 3;
    }
    if (lang !== 'en' && lang === comment.lang) {
        basic += (5 + comment.vote) * 2;
    }
    return basic;
};

// ========== 主函数 ==========

export async function loadComments(options: LoadOptions): Promise<Comment[]> {
    try {
        let url = options.useProxy
            ? getProxyUrl('get', options.app, options.categoryId, options.docId, options.ttl || 1800)
            : getMongoUrl('get', options.app, options.categoryId, options.docId);
        url += `&sort=${options.sort || ''}`;

        const { data } = await axios.get<ApiResComments>(url, {
            cacheTtl: options.useProxy ? 1800 : 0,
        });

        let transferedData: Comment[] = [];

        const rawComments = data.data.comments;

        rawComments.forEach(comment => {
            transferedData.push({
                ...comment,
                time: new Date(comment.time).toLocaleDateString(),
                media: comment.image
                    ? {
                          type: 'image',
                          url: `https://game-cdn.appsample.com${comment.image}`,
                          embed: `https://game-cdn.appsample.com${comment.image}?height=600&quality=85`,
                          preview: `https://game-cdn.appsample.com${comment.image}?height=300&quality=85`,
                          thumbnail: `https://game-cdn.appsample.com${comment.image}?aspect_ratio=1:1&height=90&quality=85`,
                      }
                    : getTextMedia(comment.content || ''),
            });
        });

        // 没有提供sort的话，启用默认排序
        if (!options.sort) {
            transferedData = transferedData.sort((a, b) => {
                const aVote = Math.floor((a.vote + getExtraVote(a, options.lang || 'en')) / 10);
                const bVote = Math.floor((b.vote + getExtraVote(b, options.lang || 'en')) / 10);
                if (aVote > bVote) {
                    return -1;
                } else if (aVote < bVote) {
                    return 1;
                } else {
                    return a.time > b.time ? -1 : 1;
                }
            });
        }

        transferedData = transferedData.slice(0, 50);
        return transferedData;
    } catch (err) {
        console.error('Failed to load comments:', err);
        if (options.useProxy) {
            return loadComments({
                ...options,
                useProxy: false, // false 十分重要！否则会陷入死循环
            });
        } else {
            return [];
        }
    }
}

export function postComment(options: {
    app: string;
    categoryId: string;
    docId: string;
    //
    authorUid: string;
    authorName: string;
    content: string;
    lang?: string;
    imageUrl?: string;
}) {
    const url = getMongoUrl('post', options.app, options.categoryId, options.docId);
    return axios.post(url, {
        auid: options.authorUid,
        aname: options.authorName,
        content: options.content,
        lang: options.lang || 'en',
        image: options.imageUrl || '',
    });
}

export function voteComment(options: {
    app: string;
    categoryId: string;
    docId: string | number;
    auid: string; // 作者uid
    // body
    vote: 'upVote' | 'downVote' | 'delete';
    content?: string;
    uid: string; // 投票用户uid
}) {
    const url = getMongoUrl('vote', options.app, options.categoryId, options.docId) + '&auid=' + options.auid;
    return axios.post(url, {
        action: options.vote,
        content: options.content,
        uid: options.uid,
    });
}
