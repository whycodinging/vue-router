// 将b的属性合并到a上
export function extend (a, b) {
  for (const key in b) {
    a[key] = b[key]
  }
  return a
}
