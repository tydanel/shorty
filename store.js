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
    toJson() {
        return JSON.stringify(this.toArray());
    }
    fromArray(array) {
        return array.forEach(([key, value]) => {
            return this.set(key, value);
        });
    }
    hasValue(value) {
        return Array.from(this.values()).find(v => v === value);
    }
    set(key, value) {
        // No duplicate urls or keys
        if (this.hasValue(value) || this.has(key)) {
            throw new Error('Key and value should be unique,');
        }
        return super.set(key, value);
    }
    async save() {
        return await Fs.writeFile(this.#path, this.toJson());
    }
    async load() {
        const rawData = await Fs.readFile(this.#path);
        const data = JSON.parse(rawData.toString());
        return this.fromArray(data);
    }
}