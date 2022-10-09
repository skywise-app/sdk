import { JsonApiSuccessfulResponse } from '@skywise-app/types';
import { customAxios as axios } from '../axios';

// ====================

const API = 'https://data.mongodb-api.com/app/skywise-sl-lptdr/endpoint/rating/v1';
const API_PROXY = 'https://cache-proxy.lemonapi.com/skywise/rating/v1';

// ====================

export interface ApiResRatings extends JsonApiSuccessfulResponse {
    data: Record<
        string,
        {
            count: number;
            rating: string;
        }
    >;
}

// ====================

export async function LoadRatings(collection: string, ids: string[], proxyTtl = 300) {
    try {
        const { data } = await axios.get<ApiResRatings>(
            `${proxyTtl ? API_PROXY : API}?action=load&ttl=${proxyTtl}&collection=${collection}&keys=${ids.join(',')}`,
            { cacheTtl: 3600 }
        );
        return data.data;
    } catch (e) {
        console.error('Failed to load ratings:', e);
        return {};
    }
}

export function postRating(collection: string, id: string, rating: number) {
    return axios.post<{ rating: number }, ApiResRatings>(
        `${API}?action=rate&collection=${collection}&keys=${id}&rating=${rating}`,
        { rating }
    );
}
