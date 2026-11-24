// 数据读取助手：遇到瞬时网络中断时自动重试一次，避免整页报错
export async function loadWithRetry(run, fallback = null, retries = 1) {
  try {
    return await run();
  } catch (error) {
    if (retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 500));
      return loadWithRetry(run, fallback, retries - 1);
    }
    console.warn('[data] load failed after retry', error);
    return fallback;
  }
}