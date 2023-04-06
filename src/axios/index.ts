import defaultAxios from 'axios';
import { CustomAxios } from './CustomAxios.js';
import { getCache, setCache } from './cache.js';

export const customAxios: CustomAxios = {
    async get(url, config) {
        const cacheTtl = config?.cacheTtl;
        const params = config?.params;

        if (cacheTtl) {
            const cached = getCache(cacheTtl, url, params);
            if (cached) {
                return cached;
            } else {
                delete config.cacheTtl;
            }

            const freshResponse = await defaultAxios.get(url, config);
            setCache({ data: freshResponse.data }, url, params);

            return freshResponse;
        }

        return defaultAxios.get(url, config);
    },

    post(url, payload, config) {
        return defaultAxios.post(url, payload, config);
    },

    postForm(url, payload, config) {
        return defaultAxios.postForm(url, payload, config);
    },

    put(url, payload, config) {
        return defaultAxios.put(url, payload, config);
    },

    putForm(url, payload, config) {
        return defaultAxios.putForm(url, payload, config);
    },
};
