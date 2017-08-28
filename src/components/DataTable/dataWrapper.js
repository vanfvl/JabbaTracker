export default class DataWrapper {
  constructor(data) {
    this._data = data;
  }

  getSize() {
    return this._data.length;
  }

  getObjectAt(index) {
    return this._data[index];
  }

  replace(data) {
    this._data = data;
  }
}
