/**
 * Core renderer interface - the foundation of all rendering
 * 核心渲染器接口 - 所有渲染的基础
 */

import { Fixed, FixedVector2, FixedRect, FixedMatrix2x2 } from '@esengine/nova-ecs-math';
import {
  Color,
  LineStyle,
  ShapeStyle,
  TextStyle,
  TextureStyle,
  Transform2D,
  ITexture,
  RenderStatistics,
  Viewport,
  RenderState
} from '../types/RenderTypes';

/**
 * Base renderer interface providing fundamental rendering operations
 * 提供基础渲染操作的基础渲染器接口
 */
export interface IRenderer {
  // ===== Lifecycle Management =====
  // 生命周期管理

  /**
   * Begin a new frame - call this before any drawing operations
   * 开始新帧 - 在任何绘制操作之前调用
   */
  beginFrame(): void;

  /**
   * End the current frame and present to screen
   * 结束当前帧并呈现到屏幕
   */
  endFrame(): void;

  /**
   * Clear the current render target
   * 清除当前渲染目标
   */
  clear(_color?: Color): void;

  /**
   * Dispose of renderer resources
   * 释放渲染器资源
   */
  dispose(): void;

  // ===== Transform Management =====
  // 变换管理

  /**
   * Set the view matrix for camera transformation
   * 设置用于相机变换的视图矩阵
   */
  setViewMatrix(_matrix: FixedMatrix2x2): void;

  /**
   * Push a transform onto the transform stack
   * 将变换推入变换栈
   */
  pushTransform(_transform: Transform2D): void;

  /**
   * Pop the last transform from the transform stack
   * 从变换栈弹出最后一个变换
   */
  popTransform(): void;

  /**
   * Get the current combined transform
   * 获取当前组合变换
   */
  getCurrentTransform(): Transform2D;

  // ===== Basic Drawing Primitives =====
  // 基础绘制原语

  /**
   * Draw a line between two points
   * 在两点之间绘制线条
   */
  drawLine(_start: FixedVector2, _end: FixedVector2, _style: LineStyle): void;

  /**
   * Draw a circle at the specified center with given radius
   * 在指定中心绘制给定半径的圆
   */
  drawCircle(_center: FixedVector2, _radius: Fixed, _style: ShapeStyle): void;

  /**
   * Draw a rectangle with the specified bounds
   * 绘制指定边界的矩形
   */
  drawRect(_bounds: FixedRect, _style: ShapeStyle): void;

  /**
   * Draw a polygon defined by vertices
   * 绘制由顶点定义的多边形
   */
  drawPolygon(_vertices: FixedVector2[], _style: ShapeStyle): void;

  /**
   * Draw an ellipse within the specified bounds
   * 在指定边界内绘制椭圆
   */
  drawEllipse(_bounds: FixedRect, _style: ShapeStyle): void;

  // ===== Text Rendering =====
  // 文本渲染

  /**
   * Draw text at the specified position
   * 在指定位置绘制文本
   */
  drawText(_text: string, _position: FixedVector2, _style: TextStyle): void;

  /**
   * Measure text dimensions without drawing
   * 测量文本尺寸而不绘制
   */
  measureText(_text: string, _style: TextStyle): FixedVector2;

  // ===== Texture Rendering =====
  // 纹理渲染

  /**
   * Draw a texture at the specified position
   * 在指定位置绘制纹理
   */
  drawTexture(_texture: ITexture, _position: FixedVector2, _style?: TextureStyle): void;

  /**
   * Draw a portion of a texture (sprite from atlas)
   * 绘制纹理的一部分（从图集中的精灵）
   */
  drawTextureRegion(
    _texture: ITexture,
    _sourceRect: FixedRect,
    _destRect: FixedRect,
    _style?: TextureStyle
  ): void;

  // ===== Render Target Management =====
  // 渲染目标管理

  /**
   * Get the current render target
   * 获取当前渲染目标
   */
  getRenderTarget(): unknown;

  /**
   * Set the render target (null for screen)
   * 设置渲染目标（null表示屏幕）
   */
  setRenderTarget(_target: unknown): void;

  // ===== State Management =====
  // 状态管理

  /**
   * Set the current render state
   * 设置当前渲染状态
   */
  setRenderState(_state: RenderState): void;

  /**
   * Get the current render state
   * 获取当前渲染状态
   */
  getRenderState(): RenderState;

  /**
   * Push current render state onto stack
   * 将当前渲染状态推入栈
   */
  pushRenderState(): void;

  /**
   * Pop render state from stack
   * 从栈弹出渲染状态
   */
  popRenderState(): void;

  // ===== Viewport Management =====
  // 视口管理

  /**
   * Set the viewport for rendering
   * 设置渲染视口
   */
  setViewport(_viewport: Viewport): void;

  /**
   * Get the current viewport
   * 获取当前视口
   */
  getViewport(): Viewport;

  // ===== Statistics and Information =====
  // 统计信息

  /**
   * Get rendering statistics for the current frame
   * 获取当前帧的渲染统计信息
   */
  getStatistics(): RenderStatistics;

  /**
   * Reset statistics counters
   * 重置统计计数器
   */
  resetStatistics(): void;

  // ===== Utility Methods =====
  // 工具方法

  /**
   * Check if the renderer supports a specific feature
   * 检查渲染器是否支持特定功能
   */
  supportsFeature(_feature: string): boolean;

  /**
   * Get renderer information
   * 获取渲染器信息
   */
  getRendererInfo(): {
    name: string;
    version: string;
    vendor?: string;
    capabilities: string[];
  };
}
