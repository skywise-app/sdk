type Params = Record<string, string | number>;

const CACHE_DB: Record<string, { createdAt: number; value: any }> = {};

const getCacheKey = (url: string, params: Params, method: 'GET' = 'GET'): string => {
    const orderedParams = Object.keys(params)
        .sort()
        .reduce((obj, key) => {
            obj[key] = params[key];
            return obj;
        }, {} as Params);

    return `${method},${url},${JSON.stringify(orderedParams)}`;
};

export const getCache = <T = any>(ttl: number, url: string, params: Params): { data: T } | undefined => {
    const cacheKey = getCacheKey(url, params || {});

    const cached = (CACHE_DB[cacheKey]?.createdAt || 0) > getCurrentTime() - ttl ? CACHE_DB[cacheKey].value : undefined;

    if (cached) {
        if (process?.env?.NODE_ENV === 'development') {
            console.log('cache hit', cacheKey, cached);
        }
        return cached;
    } else {
        return undefined;
    }
};

export const setCache = (value: any, url: string, params: Params): void => {
    const cacheKey = getCacheKey(url, params || {});

    CACHE_DB[cacheKey] = {
        createdAt: getCurrentTime(),
        value,
    };
};

const getCurrentTime = (): number => {
    return Math.floor(new Date().getTime() / 1000);
};
