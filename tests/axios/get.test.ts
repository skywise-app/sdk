import defaultAxios from 'axios';
import { axios } from '../../src';

describe('Cache', () => {
    let getSpy: jest.SpyInstance;
    const dummyParams = { id: 1 };

    beforeEach(() => {
        jest.clearAllMocks();
        getSpy = jest.spyOn(defaultAxios, 'get').mockResolvedValue({ data: 'mock value' });
    });

    it('passes config = undefined to default Axios', async () => {
        await axios.get('/test-1a');
        expect(getSpy).toBeCalledWith('/test-1a', undefined);
    });

    it('passes config to default Axios', async () => {
        await axios.get('/test-2a', { params: dummyParams });
        expect(getSpy).toBeCalledWith('/test-2a', { params: dummyParams });
    });

    it('caches response when cacheTtl is present', async () => {
        await axios.get('/test-3a', { cacheTtl: 10, params: dummyParams });
        expect(getSpy).toBeCalledWith('/test-3a', { params: dummyParams });
        expect(getSpy).toHaveBeenCalledTimes(1);

        const cached = await axios.get('/test-3a', { cacheTtl: 10, params: dummyParams }); // should return from cache
        expect(getSpy).toHaveBeenCalledTimes(1);
        expect(cached).toEqual({ data: 'mock value' });
    });

    it('brusts cache when cache expires', async () => {
        await axios.get('/test-4a', { cacheTtl: 1 });
        expect(getSpy).toHaveBeenCalledTimes(1);

        await new Promise(rs => setTimeout(rs, 2000)); // wait for 2s
        await axios.get('/test-4a', { cacheTtl: 1 }); // should return fresh data
        expect(getSpy).toHaveBeenCalledTimes(2);
    });

    it('should not cache if params change', async () => {
        await axios.get('/test-5a', { cacheTtl: 10, params: { id: 2 } });
        expect(getSpy).toBeCalledWith('/test-5a', { params: { id: 2 } });
        expect(getSpy).toHaveBeenCalledTimes(1);

        await axios.get('/test-5a', { cacheTtl: 10, params: { id: 3 } });
        expect(getSpy).toBeCalledWith('/test-5a', { params: { id: 3 } });
        expect(getSpy).toHaveBeenCalledTimes(2);
    });
});
