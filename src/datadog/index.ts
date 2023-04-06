import { customAxios as axios } from '../axios/index.js';

type Tags = Record<string, string | boolean | number | null>;

type Options = {
    app: string;
    prefix: string;
    env: string;
};

export function datadogFactory(options: Options) {
    const datadog = {
        increment(name: string, tags: Tags = {}) {
            const payload = {
                prefix: options.prefix,
                app: options.app,
                name,
                tags,
            };
            if (options.env !== 'production') {
                console.log('datadog:', payload);
                return;
            }
            axios
                .post('https://datadog.appsample.workers.dev/', payload)
                // eslint-disable-next-line
                .then(() => {})
                // eslint-disable-next-line
                .catch(() => {});
        },

        increment10(name: string, tags: Tags = {}) {
            if (Math.random() * 10 < 1) this.increment(`${name}.x10`, tags);
        },

        increment100(name: string, tags: Tags = {}) {
            if (Math.random() * 100 < 1) this.increment(`${name}.x100`, tags);
        },

        increment1000(name: string, tags: Tags = {}) {
            if (Math.random() * 1000 < 1) this.increment(`${name}.x1000`, tags);
        },
    };

    return datadog;
}
