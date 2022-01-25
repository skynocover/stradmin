export default class Api {
  #pluralName;

  #CollectionName;

  #apiAttributes;

  #keys;

  #populate;

  interface;

  constructor(jsonData) {
    this.#pluralName = jsonData.info.pluralName;
    this.#CollectionName = jsonData.info.displayName;
    this.#apiAttributes = jsonData.attributes;
    this.#keys = Object.keys(jsonData.attributes);

    this.#populate = [];
    this.interface = {};

    this.#keys.forEach((key) => {
      switch (this.#apiAttributes[key].type) {
        case 'richtext':
        case 'date':
        case 'datetime':
        case 'time':
        case 'json':
          this.interface[key] = 'string';
          break;

        case 'integer':
          this.interface[key] = 'number';
          break;

        case 'media':
        case 'relation':
          this.#populate.push(key);
          break;

        default:
          this.interface[key] = this.#apiAttributes[key].type;
          break;
      }
    });
  }

  pluralName() {
    return this.#pluralName;
  }

  CollectionName() {
    return this.#CollectionName;
  }

  apiAttributes() {
    return this.#apiAttributes;
  }

  keys() {
    return this.#keys;
  }

  populate() {
    return this.#populate;
  }
}
