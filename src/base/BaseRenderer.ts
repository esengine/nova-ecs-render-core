/**
 * Base renderer implementation providing common functionality
 * 提供通用功能的基础渲染器实现
 */

import { Fixed, FixedVector2, FixedRect, FixedMatrix2x2 } from '@esengine/nova-ecs-math';
import { IRenderer } from '../interfaces/IRenderer';
import {
  Color,
  ColorUtils,
  LineStyle,
  ShapeStyle,
  TextStyle,
  TextureStyle,
  Transform2D,
  ITexture,
  RenderStatistics,
  Viewport,
  RenderState,
  BlendMode
} from '../types/RenderTypes';

/**
 * Abstract base renderer class implementing common functionality
 * 实现通用功能的抽象基础渲染器类
 */
export abstract class BaseRenderer implements IRenderer {
  protected transformStack: Transform2D[] = [];
  protected currentTransform: Transform2D = Transform2D.identity();
  protected renderStateStack: RenderState[] = [];
  protected currentRenderState: RenderState = {
    blendMode: BlendMode.Normal,
    opacity: 1.0
  };
  protected statistics: RenderStatistics = {
    drawCalls: 0,
    triangles: 0,
    vertices: 0,
    textureBinds: 0,
    frameTime: 0
  };
  protected viewport: Viewport = { x: 0, y: 0, width: 800, height: 600 };
  protected frameStartTime: number = 0;

  // ===== Lifecycle Management =====
  // 生命周期管理

  beginFrame(): void {
    this.frameStartTime = performance.now();
    this.resetStatistics();
    this.onBeginFrame();
  }

  endFrame(): void {
    this.statistics.frameTime = performance.now() - this.frameStartTime;
    this.onEndFrame();
  }

  clear(color: Color = ColorUtils.BLACK): void {
    this.onClear(color);
  }

  abstract dispose(): void;

  // ===== Transform Management =====
  // 变换管理

  setViewMatrix(matrix: FixedMatrix2x2): void {
    this.onSetViewMatrix(matrix);
  }

  pushTransform(transform: Transform2D): void {
    this.transformStack.push(this.currentTransform);
    this.currentTransform = this.currentTransform.multiply(transform);
    this.applyTransform(this.currentTransform);
  }

  popTransform(): void {
    const previous = this.transformStack.pop();
    if (previous) {
      this.currentTransform = previous;
      this.applyTransform(this.currentTransform);
    }
  }

  getCurrentTransform(): Transform2D {
    return this.currentTransform;
  }

  // ===== Basic Drawing Primitives =====
  // 基础绘制原语

  drawLine(start: FixedVector2, end: FixedVector2, style: LineStyle): void {
    this.incrementDrawCall();
    this.onDrawLine(start, end, style);
  }

  drawCircle(center: FixedVector2, radius: Fixed, style: ShapeStyle): void {
    this.incrementDrawCall();
    this.onDrawCircle(center, radius, style);
  }

  drawRect(bounds: FixedRect, style: ShapeStyle): void {
    this.incrementDrawCall();
    this.onDrawRect(bounds, style);
  }

  drawPolygon(vertices: FixedVector2[], style: ShapeStyle): void {
    this.incrementDrawCall();
    this.statistics.vertices += vertices.length;
    this.statistics.triangles += Math.max(0, vertices.length - 2);
    this.onDrawPolygon(vertices, style);
  }

  drawEllipse(bounds: FixedRect, style: ShapeStyle): void {
    this.incrementDrawCall();
    this.onDrawEllipse(bounds, style);
  }

  // ===== Text Rendering =====
  // 文本渲染

  drawText(text: string, position: FixedVector2, style: TextStyle): void {
    this.incrementDrawCall();
    this.onDrawText(text, position, style);
  }

  measureText(text: string, style: TextStyle): FixedVector2 {
    return this.onMeasureText(text, style);
  }

  // ===== Texture Rendering =====
  // 纹理渲染

  drawTexture(texture: ITexture, position: FixedVector2, style?: TextureStyle): void {
    this.incrementDrawCall();
    this.incrementTextureBinding();
    this.onDrawTexture(texture, position, style);
  }

  drawTextureRegion(
    texture: ITexture,
    sourceRect: FixedRect,
    destRect: FixedRect,
    style?: TextureStyle
  ): void {
    this.incrementDrawCall();
    this.incrementTextureBinding();
    this.onDrawTextureRegion(texture, sourceRect, destRect, style);
  }

  // ===== Render Target Management =====
  // 渲染目标管理

  abstract getRenderTarget(): unknown;
  abstract setRenderTarget(target: unknown): void;

  // ===== State Management =====
  // 状态管理

  setRenderState(state: RenderState): void {
    this.currentRenderState = { ...state };
    this.onSetRenderState(state);
  }

  getRenderState(): RenderState {
    return { ...this.currentRenderState };
  }

  pushRenderState(): void {
    this.renderStateStack.push({ ...this.currentRenderState });
  }

  popRenderState(): void {
    const previous = this.renderStateStack.pop();
    if (previous) {
      this.setRenderState(previous);
    }
  }

  // ===== Viewport Management =====
  // 视口管理

  setViewport(viewport: Viewport): void {
    this.viewport = { ...viewport };
    this.onSetViewport(viewport);
  }

  getViewport(): Viewport {
    return { ...this.viewport };
  }

  // ===== Statistics and Information =====
  // 统计信息

  getStatistics(): RenderStatistics {
    return { ...this.statistics };
  }

  resetStatistics(): void {
    this.statistics = {
      drawCalls: 0,
      triangles: 0,
      vertices: 0,
      textureBinds: 0,
      frameTime: 0
    };
  }

  // ===== Utility Methods =====
  // 工具方法

  supportsFeature(feature: string): boolean {
    return this.onSupportsFeature(feature);
  }

  getRendererInfo(): {
    name: string;
    version: string;
    vendor?: string;
    capabilities: string[];
  } {
    return this.onGetRendererInfo();
  }

  // ===== Protected Helper Methods =====
  // 受保护的辅助方法

  protected incrementDrawCall(): void {
    this.statistics.drawCalls++;
  }

  protected incrementTextureBinding(): void {
    this.statistics.textureBinds++;
  }

  protected transformPoint(point: FixedVector2): FixedVector2 {
    return this.currentTransform.transformPoint(point);
  }

  protected getViewBounds(): FixedRect {
    // Convert viewport to world coordinates
    const topLeft = this.screenToWorld(new FixedVector2(this.viewport.x, this.viewport.y));
    const bottomRight = this.screenToWorld(
      new FixedVector2(this.viewport.x + this.viewport.width, this.viewport.y + this.viewport.height)
    );
    
    return new FixedRect(
      topLeft.x,
      topLeft.y,
      bottomRight.x.subtract(topLeft.x),
      bottomRight.y.subtract(topLeft.y)
    );
  }

  protected screenToWorld(screenPos: FixedVector2): FixedVector2 {
    // Default implementation - should be overridden by specific renderers
    return screenPos;
  }

  // ===== Abstract Methods for Subclasses =====
  // 子类的抽象方法

  protected abstract onBeginFrame(): void;
  protected abstract onEndFrame(): void;
  protected abstract onClear(color: Color): void;
  protected abstract onSetViewMatrix(matrix: FixedMatrix2x2): void;
  protected abstract applyTransform(transform: Transform2D): void;
  protected abstract onDrawLine(start: FixedVector2, end: FixedVector2, style: LineStyle): void;
  protected abstract onDrawCircle(center: FixedVector2, radius: Fixed, style: ShapeStyle): void;
  protected abstract onDrawRect(bounds: FixedRect, style: ShapeStyle): void;
  protected abstract onDrawPolygon(vertices: FixedVector2[], style: ShapeStyle): void;
  protected abstract onDrawEllipse(bounds: FixedRect, style: ShapeStyle): void;
  protected abstract onDrawText(text: string, position: FixedVector2, style: TextStyle): void;
  protected abstract onMeasureText(text: string, style: TextStyle): FixedVector2;
  protected abstract onDrawTexture(texture: ITexture, position: FixedVector2, style?: TextureStyle): void;
  protected abstract onDrawTextureRegion(
    texture: ITexture,
    sourceRect: FixedRect,
    destRect: FixedRect,
    style?: TextureStyle
  ): void;
  protected abstract onSetRenderState(state: RenderState): void;
  protected abstract onSetViewport(viewport: Viewport): void;
  protected abstract onSupportsFeature(feature: string): boolean;
  protected abstract onGetRendererInfo(): {
    name: string;
    version: string;
    vendor?: string;
    capabilities: string[];
  };
}
