// 根据id查询返回每一级数据
export function findPathbyKey(tree:any, key:any, path?:any):any {
  if (typeof path === "undefined") {
    path = [];
  }
  for (let i = 0; i < tree.length; i++) {
    const tempPath = [...path];
    tempPath.push(tree[i]);
    if (tree[i].key == key) {
      return tempPath;
    }
    if (tree[i].children) {
      const reuslt = findPathbyKey(tree[i].children, key, tempPath);
      if (reuslt) {
        return reuslt;
      }
    }
  }
}