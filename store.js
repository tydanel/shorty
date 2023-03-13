import Fs from 'fs';

export default class extends Map {
    #path = null;

    constructor({ path }) {
        super();
        this.#path ||= path;
    }
    toArray() {
        return Array.from(this.entries());
    }
    fromArray(array) {
        for (const [key, value] of array) {
            this.set(key, value);
        }
    }
    hasValue(value) {
        return Array.from(this.values()).find(v => v === value);
    }
    set(key, value) {
        // No duplicate urls or keys
        if (!this.hasValue(value) && !this.has(key)) {
            super.set(key, value);
        }
    }
    async save() {
        await Fs.writeFile(this.#path, JSON.stringify(this.toArray()));
    }
    async load() {
        const rawData = await Fs.readFile(this.#path);
        const data = JSON.parse(rawData.toString());
        this.fromArray(data);
    }
}