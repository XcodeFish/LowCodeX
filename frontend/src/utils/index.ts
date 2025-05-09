/**
 * 格式化日期
 * @param date 日期对象或时间戳
 * @param format 格式字符串，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export function formatDate(
  date: Date | number | string,
  format: string = 'YYYY-MM-DD HH:mm:ss'
): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hour = d.getHours();
  const minute = d.getMinutes();
  const second = d.getSeconds();

  return format
    .replace(/YYYY/g, year.toString())
    .replace(/MM/g, month < 10 ? `0${month}` : month.toString())
    .replace(/DD/g, day < 10 ? `0${day}` : day.toString())
    .replace(/HH/g, hour < 10 ? `0${hour}` : hour.toString())
    .replace(/mm/g, minute < 10 ? `0${minute}` : minute.toString())
    .replace(/ss/g, second < 10 ? `0${second}` : second.toString());
}

/**
 * 深拷贝对象
 * @param obj 要拷贝的对象
 * @returns 拷贝后的新对象
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as unknown as T;
  }

  if (obj instanceof Object) {
    const copy = {} as Record<string, any>;
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone((obj as Record<string, any>)[key]);
    });
    return copy as T;
  }

  return obj;
}

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间，默认300ms
 * @returns 防抖处理后的函数
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: NodeJS.Timeout | null = null;

  return function(this: any, ...args: Parameters<T>) {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args);
      timer = null;
    }, delay);
  };
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 延迟时间，默认300ms
 * @returns 节流处理后的函数
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let last = 0;

  return function(this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - last >= delay) {
      fn.apply(this, args);
      last = now;
    }
  };
}
