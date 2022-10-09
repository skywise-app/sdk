export const kvdb = {
    get(key: string) {
        try {
            if (typeof localStorage === 'undefined') return null;
        } catch (err) {
            return null;
        }

        const result = localStorage.getItem(key);
        if (result === null) return null;

        try {
            const json = JSON.parse(result);
            return json ? json : result;
        } catch (e) {
            return result;
        }
    },

    set(key: string, value: object | string | number) {
        try {
            switch (typeof value) {
                case 'object': {
                    localStorage.setItem(key, JSON.stringify(value));
                    return true;
                }
                case 'string':
                case 'number': {
                    localStorage.setItem(key, String(value));
                    return true;
                }
            }
        } catch (e) {
            return false;
        }
    },

    addToList(key: string, value: string | number) {
        let arr = this.get(key) || [];
        if (!Array.isArray(arr)) {
            arr = [];
        }
        if (!arr.includes(value)) {
            arr.push(value);
        }
        this.set(key, arr);
    },

    removeFromList(key: string, value: string | number) {
        const arr = this.get(key);
        if (Array.isArray(arr)) {
            const index = arr.indexOf(value);
            if (index > -1) {
                arr.splice(index, 1);
                this.set(key, arr);
            }
        } else {
            this.set(key, []);
        }
    },
};
