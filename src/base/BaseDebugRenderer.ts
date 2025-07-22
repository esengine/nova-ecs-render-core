/**
 * Base debug renderer implementation providing common debug functionality
 * 提供通用调试功能的基础调试渲染器实现
 */

import { Fixed, FixedVector2, FixedRect } from '@esengine/nova-ecs-math';
import { BaseRenderer } from './BaseRenderer';
import {
  IDebugRenderer,
  DebugMode,
  DebugInfo,
  PerformanceStats,
  DebugConfig,
  DEFAULT_DEBUG_CONFIG
} from '../interfaces/IDebugRenderer';
import {
  Color,
  ColorUtils,
  TextStyle,
  GridStyle
} from '../types/RenderTypes';

/**
 * Abstract base debug renderer class
 * 抽象基础调试渲染器类
 */
export abstract class BaseDebugRenderer extends BaseRenderer implements IDebugRenderer {
  protected debugMode: DebugMode = DebugMode.Normal;
  protected debugConfig: DebugConfig = { ...DEFAULT_DEBUG_CONFIG };
  protected performanceCounters = new Map<string, number>();
  protected performanceMeasurements = new Map<string, number>();
  protected debugLoggingEnabled = false;

  // ===== Debug Mode Management =====
  // 调试模式管理

  setDebugMode(mode: DebugMode): void {
    this.debugMode = mode;
    this.onDebugModeChanged(mode);
  }

  getDebugMode(): DebugMode {
    return this.debugMode;
  }

  setDebugConfig(config: Partial<DebugConfig>): void {
    this.debugConfig = { ...this.debugConfig, ...config };
    if (config.colors) {
      this.debugConfig.colors = { ...this.debugConfig.colors, ...config.colors };
    }
    this.onDebugConfigChanged(this.debugConfig);
  }

  getDebugConfig(): DebugConfig {
    return { ...this.debugConfig };
  }

  // ===== Debug Drawing Functions =====
  // 调试绘制功能

  drawDebugOverlay(info: DebugInfo): void {
    const position = info.position || new FixedVector2(new Fixed(10), new Fixed(10));
    let currentY = position.y;
    
    // Draw title
    const titleStyle: TextStyle = {
      color: ColorUtils.WHITE,
      fontSize: new Fixed(16),
      fontWeight: 'bold'
    };
    this.drawText(info.title, new FixedVector2(position.x, currentY), titleStyle);
    currentY = currentY.add(new Fixed(20));

    // Draw items
    const itemStyle: TextStyle = {
      color: ColorUtils.WHITE,
      fontSize: new Fixed(12)
    };

    for (const item of info.items) {
      const text = `${item.label}: ${item.value}`;
      const color = item.color || ColorUtils.WHITE;
      this.drawText(text, new FixedVector2(position.x, currentY), {
        ...itemStyle,
        color
      });
      currentY = currentY.add(new Fixed(16));
    }
  }

  drawGrid(spacing: Fixed, style: GridStyle): void {
    if (!this.debugConfig.showGrid) return;

    const bounds = this.getViewBounds();
    const startX = bounds.x.divide(spacing).floor().multiply(spacing);
    const startY = bounds.y.divide(spacing).floor().multiply(spacing);
    const endX = bounds.x.add(bounds.width);
    const endY = bounds.y.add(bounds.height);

    let lineCount = 0;

    // Draw vertical lines
    for (let x = startX; x.lessThanOrEqual(endX); x = x.add(spacing)) {
      const isMainLine = style.majorLineStyle && 
                        style.majorLineInterval && 
                        lineCount % style.majorLineInterval === 0;
      
      const lineStyle = isMainLine && style.majorLineStyle ? style.majorLineStyle : style.lineStyle;
      
      this.drawLine(
        new FixedVector2(x, bounds.y),
        new FixedVector2(x, bounds.y.add(bounds.height)),
        lineStyle
      );
      lineCount++;
    }

    lineCount = 0;

    // Draw horizontal lines
    for (let y = startY; y.lessThanOrEqual(endY); y = y.add(spacing)) {
      const isMainLine = style.majorLineStyle && 
                        style.majorLineInterval && 
                        lineCount % style.majorLineInterval === 0;
      
      const lineStyle = isMainLine && style.majorLineStyle ? style.majorLineStyle : style.lineStyle;
      
      this.drawLine(
        new FixedVector2(bounds.x, y),
        new FixedVector2(bounds.x.add(bounds.width), y),
        lineStyle
      );
      lineCount++;
    }
  }

  drawAxis(origin: FixedVector2, scale: Fixed): void {
    if (!this.debugConfig.showAxis) return;

    // X-axis (red)
    this.drawArrow(
      origin,
      origin.add(new FixedVector2(scale, Fixed.ZERO)),
      this.debugConfig.colors.axisX,
      new Fixed(0.2)
    );

    // Y-axis (green)
    this.drawArrow(
      origin,
      origin.add(new FixedVector2(Fixed.ZERO, scale)),
      this.debugConfig.colors.axisY,
      new Fixed(0.2)
    );
  }

  drawCrosshair(position: FixedVector2, size: Fixed, color: Color): void {
    const halfSize = size.divide(new Fixed(2));
    
    // Horizontal line
    this.drawLine(
      new FixedVector2(position.x.subtract(halfSize), position.y),
      new FixedVector2(position.x.add(halfSize), position.y),
      { color, thickness: Fixed.ONE }
    );

    // Vertical line
    this.drawLine(
      new FixedVector2(position.x, position.y.subtract(halfSize)),
      new FixedVector2(position.x, position.y.add(halfSize)),
      { color, thickness: Fixed.ONE }
    );
  }

  drawBounds(bounds: FixedRect, color: Color): void {
    if (!this.debugConfig.showBounds) return;

    this.drawRect(bounds, {
      strokeColor: color,
      strokeThickness: Fixed.ONE
    });
  }

  drawArrow(start: FixedVector2, end: FixedVector2, color: Color, headSize?: Fixed): void {
    const arrowHeadSize = headSize || this.debugConfig.axisLength.divide(new Fixed(10));
    
    // Draw main line
    this.drawLine(start, end, { color, thickness: Fixed.ONE });

    // Calculate arrow head
    const direction = end.subtract(start).normalize();
    const perpendicular = new FixedVector2(direction.y.negate(), direction.x);
    
    const headBase = end.subtract(direction.multiply(arrowHeadSize));
    const headLeft = headBase.add(perpendicular.multiply(arrowHeadSize.divide(new Fixed(2))));
    const headRight = headBase.subtract(perpendicular.multiply(arrowHeadSize.divide(new Fixed(2))));

    // Draw arrow head
    this.drawLine(end, headLeft, { color, thickness: Fixed.ONE });
    this.drawLine(end, headRight, { color, thickness: Fixed.ONE });
  }

  // ===== Performance Monitoring =====
  // 性能监控

  drawPerformanceStats(stats: PerformanceStats): void {
    if (!this.debugConfig.showPerformance) return;

    const debugInfo: DebugInfo = {
      title: 'Performance Stats',
      items: [
        { label: 'FPS', value: stats.fps.toFixed(1) },
        { label: 'Frame Time', value: `${stats.frameTime.toFixed(2)}ms` },
        { label: 'Draw Calls', value: stats.drawCalls },
        { label: 'Triangles', value: stats.triangles },
        { label: 'Vertices', value: stats.vertices }
      ],
      position: new FixedVector2(new Fixed(10), new Fixed(10))
    };

    if (stats.memoryUsage) {
      const memoryMB = (stats.memoryUsage.used / (1024 * 1024)).toFixed(1);
      const totalMB = (stats.memoryUsage.total / (1024 * 1024)).toFixed(1);
      debugInfo.items.push({
        label: 'Memory',
        value: `${memoryMB}/${totalMB} MB`
      });
    }

    if (stats.customCounters) {
      for (const [name, value] of stats.customCounters) {
        debugInfo.items.push({
          label: name,
          value: typeof value === 'number' ? value.toFixed(2) : value
        });
      }
    }

    this.drawDebugOverlay(debugInfo);
  }

  startPerformanceMeasure(name: string): void {
    this.performanceCounters.set(name, performance.now());
  }

  endPerformanceMeasure(name: string): void {
    const startTime = this.performanceCounters.get(name);
    if (startTime !== undefined) {
      const duration = performance.now() - startTime;
      this.performanceMeasurements.set(name, duration);
      this.performanceCounters.delete(name);
    }
  }

  getPerformanceMeasurements(): Map<string, number> {
    return new Map(this.performanceMeasurements);
  }

  clearPerformanceMeasurements(): void {
    this.performanceMeasurements.clear();
    this.performanceCounters.clear();
  }

  // ===== Debug Utilities =====
  // 调试工具

  async takeScreenshot(): Promise<Blob | null> {
    return this.onTakeScreenshot();
  }

  setDebugLogging(enabled: boolean): void {
    this.debugLoggingEnabled = enabled;
  }

  debugLog(message: string, color?: Color): void {
    if (this.debugLoggingEnabled) {
      const colorStr = color ? ColorUtils.toHex(color) : '#FFFFFF';
      // eslint-disable-next-line no-console
      console.log(`%c[DEBUG] ${message}`, `color: ${colorStr}`);
    }
  }

  drawDebugText(text: string, position: FixedVector2, color?: Color): void {
    const style: TextStyle = {
      color: color || this.debugConfig.colors.text,
      fontSize: new Fixed(12)
    };
    this.drawText(text, position, style);
  }

  drawDebugTextScreen(text: string, x: number, y: number, color?: Color): void {
    const worldPos = this.screenToWorld(new FixedVector2(new Fixed(x), new Fixed(y)));
    this.drawDebugText(text, worldPos, color);
  }

  // ===== Protected Methods for Subclasses =====
  // 子类的受保护方法

  protected onDebugModeChanged(_mode: DebugMode): void {
    // Override in subclasses if needed
  }

  protected onDebugConfigChanged(_config: DebugConfig): void {
    // Override in subclasses if needed
  }

  protected abstract onTakeScreenshot(): Promise<Blob | null>;
}
