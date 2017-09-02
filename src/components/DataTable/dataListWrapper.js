export default class DataListWrapper {
  constructor(indexMap, data) {
    this._indexMap = indexMap;
    this._data = data;
  }

  getSize() {
    return this._indexMap.length;
  }

  getObjectAt(index) {
    return this._data.getObjectAt(
      this._indexMap[index],
    );
  }

  getArrayData() {
    if (this.getSize() < 1) return false;

    const returnArr = [];
    for (let x = 0; x < this.getSize(); x++) {
      returnArr.push(this.getObjectAt(x));
    }
    return returnArr;
  }
}
