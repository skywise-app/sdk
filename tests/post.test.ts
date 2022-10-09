import defaultAxios from 'axios';
import { axios } from '../src/index';

describe('Cache', () => {
    let postSpy: jest.SpyInstance;
    const dummyParams = { id: 1 };
    const dummyPayload = { name: 'Tom' };

    beforeEach(() => {
        jest.clearAllMocks();
        postSpy = jest.spyOn(defaultAxios, 'post').mockResolvedValue({ data: 'mock value' });
    });

    it('passes undefined to default Axios', async () => {
        await axios.post('/test');
        expect(postSpy).toBeCalledWith('/test', undefined, undefined);
    });

    it('passes payload to default Axios', async () => {
        await axios.post('/test', undefined, { params: dummyParams });
        expect(postSpy).toBeCalledWith('/test', undefined, { params: dummyParams });
    });

    it('passes params to default Axios', async () => {
        await axios.post('/test', dummyPayload);
        expect(postSpy).toBeCalledWith('/test', dummyPayload, undefined);
    });
});
