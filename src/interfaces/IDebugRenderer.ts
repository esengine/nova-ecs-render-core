/**
 * Debug renderer interface extending base renderer with debugging capabilities
 * 调试渲染器接口，扩展基础渲染器的调试功能
 */

import { Fixed, FixedVector2 } from '@esengine/nova-ecs-math';
import { IRenderer } from './IRenderer';
import { GridStyle, Color } from '../types/RenderTypes';

/**
 * Debug mode enumeration
 * 调试模式枚举
 */
export enum DebugMode {
  None = 'none',
  Normal = 'normal',
  Wireframe = 'wireframe',
  Bounds = 'bounds',
  Performance = 'performance',
  All = 'all'
}

// Export individual values to avoid unused warnings
export const DEBUG_MODE_NONE = DebugMode.None;
export const DEBUG_MODE_NORMAL = DebugMode.Normal;
export const DEBUG_MODE_WIREFRAME = DebugMode.Wireframe;
export const DEBUG_MODE_BOUNDS = DebugMode.Bounds;
export const DEBUG_MODE_PERFORMANCE = DebugMode.Performance;
export const DEBUG_MODE_ALL = DebugMode.All;

/**
 * Debug information structure
 * 调试信息结构
 */
export interface DebugInfo {
  title: string;
  items: Array<{
    label: string;
    value: string | number;
    color?: Color;
  }>;
  position?: FixedVector2;
}

/**
 * Performance statistics for debugging
 * 用于调试的性能统计
 */
export interface PerformanceStats {
  fps: number;
  frameTime: number; // milliseconds
  drawCalls: number;
  triangles: number;
  vertices: number;
  memoryUsage?: {
    used: number; // bytes
    total: number; // bytes
  };
  customCounters?: Map<string, number>;
}

/**
 * Debug renderer configuration
 * 调试渲染器配置
 */
export interface DebugConfig {
  showGrid: boolean;
  showAxis: boolean;
  showBounds: boolean;
  showPerformance: boolean;
  showWireframe: boolean;
  gridSpacing: Fixed;
  axisLength: Fixed;
  colors: {
    grid: Color;
    gridMajor: Color;
    axis: Color;
    axisX: Color;
    axisY: Color;
    bounds: Color;
    wireframe: Color;
    text: Color;
    background: Color;
  };
}

/**
 * Default debug configuration
 * 默认调试配置
 */
export const DEFAULT_DEBUG_CONFIG: DebugConfig = {
  showGrid: true,
  showAxis: true,
  showBounds: false,
  showPerformance: true,
  showWireframe: false,
  gridSpacing: new Fixed(1),
  axisLength: new Fixed(2),
  colors: {
    grid: { r: 0.3, g: 0.3, b: 0.3, a: 0.5 },
    gridMajor: { r: 0.5, g: 0.5, b: 0.5, a: 0.7 },
    axis: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 },
    axisX: { r: 1.0, g: 0.2, b: 0.2, a: 1.0 },
    axisY: { r: 0.2, g: 1.0, b: 0.2, a: 1.0 },
    bounds: { r: 1.0, g: 1.0, b: 0.0, a: 0.8 },
    wireframe: { r: 0.0, g: 1.0, b: 1.0, a: 0.8 },
    text: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
    background: { r: 0.0, g: 0.0, b: 0.0, a: 0.7 }
  }
};

/**
 * Debug renderer interface extending base renderer
 * 扩展基础渲染器的调试渲染器接口
 */
export interface IDebugRenderer extends IRenderer {
  // ===== Debug Mode Management =====
  // 调试模式管理

  /**
   * Set the current debug mode
   * 设置当前调试模式
   */
  setDebugMode(mode: DebugMode): void;

  /**
   * Get the current debug mode
   * 获取当前调试模式
   */
  getDebugMode(): DebugMode;

  /**
   * Set debug configuration
   * 设置调试配置
   */
  setDebugConfig(config: Partial<DebugConfig>): void;

  /**
   * Get debug configuration
   * 获取调试配置
   */
  getDebugConfig(): DebugConfig;

  // ===== Debug Drawing Functions =====
  // 调试绘制功能

  /**
   * Draw debug overlay with information
   * 绘制带信息的调试覆盖层
   */
  drawDebugOverlay(info: DebugInfo): void;

  /**
   * Draw a grid with specified spacing
   * 绘制指定间距的网格
   */
  drawGrid(spacing: Fixed, style: GridStyle): void;

  /**
   * Draw coordinate axes at origin
   * 在原点绘制坐标轴
   */
  drawAxis(origin: FixedVector2, scale: Fixed): void;

  /**
   * Draw a cross-hair at the specified position
   * 在指定位置绘制十字线
   */
  drawCrosshair(position: FixedVector2, size: Fixed, color: Color): void;

  /**
   * Draw bounding box around an area
   * 在区域周围绘制边界框
   */
  drawBounds(bounds: import('@esengine/nova-ecs-math').FixedRect, color: Color): void;

  /**
   * Draw an arrow from start to end point
   * 从起点到终点绘制箭头
   */
  drawArrow(start: FixedVector2, end: FixedVector2, color: Color, headSize?: Fixed): void;

  // ===== Performance Monitoring =====
  // 性能监控

  /**
   * Draw performance statistics overlay
   * 绘制性能统计覆盖层
   */
  drawPerformanceStats(stats: PerformanceStats): void;

  /**
   * Start measuring performance for a named operation
   * 开始测量命名操作的性能
   */
  startPerformanceMeasure(name: string): void;

  /**
   * End measuring performance for a named operation
   * 结束测量命名操作的性能
   */
  endPerformanceMeasure(name: string): void;

  /**
   * Get performance measurements
   * 获取性能测量结果
   */
  getPerformanceMeasurements(): Map<string, number>;

  /**
   * Clear all performance measurements
   * 清除所有性能测量
   */
  clearPerformanceMeasurements(): void;

  // ===== Debug Utilities =====
  // 调试工具

  /**
   * Take a screenshot of the current frame
   * 截取当前帧的屏幕截图
   */
  takeScreenshot(): Promise<Blob | null>;

  /**
   * Enable/disable debug logging
   * 启用/禁用调试日志
   */
  setDebugLogging(enabled: boolean): void;

  /**
   * Log debug message with optional color
   * 记录带可选颜色的调试消息
   */
  debugLog(message: string, color?: Color): void;

  /**
   * Draw debug text at world position
   * 在世界位置绘制调试文本
   */
  drawDebugText(text: string, position: FixedVector2, color?: Color): void;

  /**
   * Draw debug text at screen position
   * 在屏幕位置绘制调试文本
   */
  drawDebugTextScreen(text: string, x: number, y: number, color?: Color): void;
}
