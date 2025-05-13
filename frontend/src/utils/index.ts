import { message as antdMessage } from 'antd';

// 全局消息控制
let activeMessages: Record<string, any> = {};

// 控制全局消息数量和间隔
antdMessage.config({
  maxCount: 1, // 只允许显示一条消息
  duration: 3,
  top: 64, // 距顶部位置
});

// 定义一个全局定时器，用于确保消息一定会被关闭
let autoHideTimer: NodeJS.Timeout | null = null;

// 强制关闭所有消息
const destroyAllMessages = () => {
  // 关闭所有已有消息
  antdMessage.destroy();
  // 重置活跃消息记录
  activeMessages = {};

  // 清除可能存在的自动隐藏定时器
  if (autoHideTimer) {
    clearTimeout(autoHideTimer);
    autoHideTimer = null;
  }
};

/**
 * 全局消息提示工具
 */
export const message = {
  /**
   * 显示成功消息
   * @param content 消息内容
   * @param duration 显示时长，默认3秒
   * @returns 关闭函数
   */
  success(content: string, duration: number = 3): () => void {
    // 先销毁所有现有消息
    destroyAllMessages();

    const key = `success_${Date.now()}`;

    // 确保设置了duration
    if (duration === 0) {
      duration = 3; // 强制设置一个默认值，确保消息会自动消失
    }

    const hide = antdMessage.success({
      content,
      duration,
      key,
      style: {
        width: 'auto',
        maxWidth: '80vw', // 最大宽度为视口宽度的80%
        padding: '10px 16px',
      }
    });
    activeMessages[key] = hide;

    // 设置安全定时器确保消息会消失（比正常时间多0.5秒）
    const timer = setTimeout(() => {
      if (activeMessages[key]) {
        hide();
        delete activeMessages[key];
      }
    }, (duration + 0.5) * 1000);

    // 设置最长显示时间保险
    if (autoHideTimer) clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(() => {
      destroyAllMessages();
    }, 10000); // 最长10秒后强制清除所有消息

    return () => {
      clearTimeout(timer);
      hide();
      delete activeMessages[key];
    };
  },

  /**
   * 显示错误消息
   * @param content 消息内容
   * @param duration 显示时长，默认3秒
   * @returns 关闭函数
   */
  error(content: string, duration: number = 3): () => void {
    // 先销毁所有现有消息
    destroyAllMessages();

    const key = `error_${Date.now()}`;

    // 确保设置了duration且不为0
    if (duration <= 0) {
      duration = 3; // 强制设置一个默认值，确保消息会自动消失
    }

    // 直接在控制台打印，方便调试
    console.log(`显示错误消息: ${content}，设置的显示时间: ${duration}秒`);

    const hide = antdMessage.error({
      content,
      duration,
      key,
      style: {
        width: 'auto',
        maxWidth: '80vw', // 最大宽度为视口宽度的80%
        padding: '10px 16px',
        whiteSpace: 'normal', // 允许文本换行
        wordBreak: 'break-word' // 在任何可能的断字点换行
      },
      onClose: () => {
        console.log(`错误消息关闭: ${content}`);
        delete activeMessages[key];
      }
    });
    activeMessages[key] = hide;

    // 设置安全定时器确保消息会消失
    const timer = setTimeout(() => {
      console.log(`定时器触发关闭消息: ${content}`);
      if (activeMessages[key]) {
        hide();
        delete activeMessages[key];
      }
    }, (duration + 0.5) * 1000);

    // 设置最长显示时间保险
    if (autoHideTimer) clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(() => {
      console.log('强制清除所有消息');
      destroyAllMessages();
    }, 10000); // 最长10秒后强制清除所有消息

    return () => {
      clearTimeout(timer);
      hide();
      delete activeMessages[key];
    };
  },

  /**
   * 显示警告消息
   * @param content 消息内容
   * @param duration 显示时长，默认3秒
   * @returns 关闭函数
   */
  warning(content: string, duration: number = 3): () => void {
    // 先销毁所有现有消息
    destroyAllMessages();

    const key = `warning_${Date.now()}`;

    // 确保设置了duration且不为0
    if (duration <= 0) {
      duration = 3; // 强制设置一个默认值，确保消息会自动消失
    }

    const hide = antdMessage.warning({
      content,
      duration,
      key,
      style: {
        width: 'auto',
        maxWidth: '80vw', // 最大宽度为视口宽度的80%
        padding: '10px 16px',
      },
      onClose: () => {
        delete activeMessages[key];
      }
    });
    activeMessages[key] = hide;

    // 设置安全定时器确保消息会消失
    const timer = setTimeout(() => {
      if (activeMessages[key]) {
        hide();
        delete activeMessages[key];
      }
    }, (duration + 0.5) * 1000);

    // 设置最长显示时间保险
    if (autoHideTimer) clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(() => {
      destroyAllMessages();
    }, 10000); // 最长10秒后强制清除所有消息

    return () => {
      clearTimeout(timer);
      hide();
      delete activeMessages[key];
    };
  },

  /**
   * 显示信息消息
   * @param content 消息内容
   * @param duration 显示时长，默认3秒
   * @returns 关闭函数
   */
  info(content: string, duration: number = 3): () => void {
    // 先销毁所有现有消息
    destroyAllMessages();

    const key = `info_${Date.now()}`;

    // 确保设置了duration且不为0
    if (duration <= 0) {
      duration = 3; // 强制设置一个默认值，确保消息会自动消失
    }

    const hide = antdMessage.info({
      content,
      duration,
      key,
      style: {
        width: 'auto',
        maxWidth: '80vw', // 最大宽度为视口宽度的80%
        padding: '10px 16px',
      },
      onClose: () => {
        delete activeMessages[key];
      }
    });
    activeMessages[key] = hide;

    // 设置安全定时器确保消息会消失
    const timer = setTimeout(() => {
      if (activeMessages[key]) {
        hide();
        delete activeMessages[key];
      }
    }, (duration + 0.5) * 1000);

    // 设置最长显示时间保险
    if (autoHideTimer) clearTimeout(autoHideTimer);
    autoHideTimer = setTimeout(() => {
      destroyAllMessages();
    }, 10000); // 最长10秒后强制清除所有消息

    return () => {
      clearTimeout(timer);
      hide();
      delete activeMessages[key];
    };
  },

  /**
   * 显示加载消息
   * @param content 消息内容
   * @param duration 显示时长，默认0秒（不自动关闭）
   * @returns 关闭函数
   */
  loading(content: string, duration: number = 0): () => void {
    // 先销毁所有现有消息
    destroyAllMessages();

    const key = `loading_${Date.now()}`;

    // loading消息特殊处理：如果明确设置了duration，则使用该值；否则loading默认不自动关闭
    const actualDuration = duration;

    const hide = antdMessage.loading({
      content,
      duration: actualDuration,
      key,
      style: {
        width: 'auto',
        maxWidth: '80vw', // 最大宽度为视口宽度的80%
        padding: '10px 16px',
      },
      onClose: () => {
        delete activeMessages[key];
      }
    });
    activeMessages[key] = hide;

    // 如果设置了duration大于0，添加定时器确保消息会消失
    let timer: NodeJS.Timeout | null = null;
    if (duration > 0) {
      timer = setTimeout(() => {
        if (activeMessages[key]) {
          hide();
          delete activeMessages[key];
        }
      }, (duration + 0.5) * 1000);

      // 设置最长显示时间保险
      if (autoHideTimer) clearTimeout(autoHideTimer);
      autoHideTimer = setTimeout(() => {
        destroyAllMessages();
      }, 10000); // 最长10秒后强制清除所有消息
    }

    return () => {
      if (timer) clearTimeout(timer);
      hide();
      delete activeMessages[key];
    };
  },

  /**
   * 销毁所有消息
   */
  destroy: destroyAllMessages
};

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

// 导出utils中的所有工具
// export * from './message';
