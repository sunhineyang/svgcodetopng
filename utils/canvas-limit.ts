import canvasSize from 'canvas-size';

// 浏览器画布上限的缓存结果，避免每次导出都重跑检测（检测本身要创建测试画布，有开销）
interface CanvasLimit {
  maxWidth: number;
  maxHeight: number;
  maxArea: number;
}

let cachedLimit: CanvasLimit | null = null;

// 获取当前浏览器的画布能力上限（宽、高、总面积三条，任一超限都会画空白）
// 结果带缓存：同一浏览器会话期间上限不变，只测一次
export async function getCanvasLimit(): Promise<CanvasLimit> {
  if (cachedLimit) return cachedLimit;

  // canvas-size 的 maxArea/maxWidth/maxHeight 都是异步测试，返回 Promise
  // 默认测试上限很大，这里给 max 参数收紧到合理范围，加快检测速度
  const [areaResult, widthResult, heightResult] = await Promise.all([
    canvasSize.maxArea({ max: 16384 }),
    canvasSize.maxWidth({ max: 16384 }),
    canvasSize.maxHeight({ max: 16384 }),
  ]);

  cachedLimit = {
    maxWidth: widthResult.width,
    maxHeight: heightResult.height,
    // maxArea 返回的是 { width, height } 组合，面积 = 两者乘积
    maxArea: areaResult.width * areaResult.height,
  };

  return cachedLimit;
}

// 校验一组目标尺寸是否在浏览器能力范围内
// 返回 { ok: true } 或 { ok: false, reason, limit }
export interface SizeCheckResult {
  ok: boolean;
  reason?: 'width_exceeded' | 'height_exceeded' | 'area_exceeded';
  limit?: CanvasLimit;
}

export async function checkExportSize(
  targetWidth: number,
  targetHeight: number
): Promise<SizeCheckResult> {
  const limit = await getCanvasLimit();

  if (targetWidth > limit.maxWidth) {
    return { ok: false, reason: 'width_exceeded', limit };
  }
  if (targetHeight > limit.maxHeight) {
    return { ok: false, reason: 'height_exceeded', limit };
  }
  if (targetWidth * targetHeight > limit.maxArea) {
    return { ok: false, reason: 'area_exceeded', limit };
  }

  return { ok: true };
}

// 计算"按浏览器最大能力等比缩小"后的尺寸
// 保持宽高比，把目标尺寸缩到同时满足宽、高、面积三条上限
export async function getMaxSupportedSize(
  targetWidth: number,
  targetHeight: number
): Promise<{ width: number; height: number }> {
  const limit = await getCanvasLimit();

  // 三条上限分别算出缩放比，取最严格的那个（最小的 ratio）
  const ratioByWidth = limit.maxWidth / targetWidth;
  const ratioByHeight = limit.maxHeight / targetHeight;
  const ratioByArea = Math.sqrt(limit.maxArea / (targetWidth * targetHeight));

  const ratio = Math.min(ratioByWidth, ratioByHeight, ratioByArea, 1);

  return {
    width: Math.floor(targetWidth * ratio),
    height: Math.floor(targetHeight * ratio),
  };
}
