/**
 * Core rendering types and interfaces
 * 核心渲染类型和接口
 */

import { Fixed, FixedVector2, FixedRect } from '@esengine/nova-ecs-math';

/**
 * Color representation with RGBA components
 * RGBA颜色表示
 */
export interface Color {
  r: number; // 0-1
  g: number; // 0-1
  b: number; // 0-1
  a: number; // 0-1
}

/**
 * Color utility class
 * 颜色工具类
 */
export class ColorUtils {
  static readonly WHITE: Color = { r: 1, g: 1, b: 1, a: 1 };
  static readonly BLACK: Color = { r: 0, g: 0, b: 0, a: 1 };
  static readonly RED: Color = { r: 1, g: 0, b: 0, a: 1 };
  static readonly GREEN: Color = { r: 0, g: 1, b: 0, a: 1 };
  static readonly BLUE: Color = { r: 0, g: 0, b: 1, a: 1 };
  static readonly TRANSPARENT: Color = { r: 0, g: 0, b: 0, a: 0 };

  static fromHex(hex: string): Color {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(hex);
    if (!result) {
      throw new Error(`Invalid hex color: ${hex}`);
    }
    return {
      r: parseInt(result[1], 16) / 255,
      g: parseInt(result[2], 16) / 255,
      b: parseInt(result[3], 16) / 255,
      a: result[4] ? parseInt(result[4], 16) / 255 : 1
    };
  }

  static toHex(color: Color): string {
    const r = Math.round(color.r * 255).toString(16).padStart(2, '0');
    const g = Math.round(color.g * 255).toString(16).padStart(2, '0');
    const b = Math.round(color.b * 255).toString(16).padStart(2, '0');
    const a = Math.round(color.a * 255).toString(16).padStart(2, '0');
    return `#${r}${g}${b}${a}`;
  }

  static lerp(from: Color, to: Color, t: number): Color {
    return {
      r: from.r + (to.r - from.r) * t,
      g: from.g + (to.g - from.g) * t,
      b: from.b + (to.b - from.b) * t,
      a: from.a + (to.a - from.a) * t
    };
  }
}

/**
 * Line drawing style
 * 线条绘制样式
 */
export interface LineStyle {
  color: Color;
  thickness: Fixed;
  dashPattern?: Fixed[]; // Optional dash pattern
}

/**
 * Shape drawing style
 * 形状绘制样式
 */
export interface ShapeStyle {
  fillColor?: Color;
  strokeColor?: Color;
  strokeThickness?: Fixed;
  dashPattern?: Fixed[];
}

/**
 * Text drawing style
 * 文本绘制样式
 */
export interface TextStyle {
  color: Color;
  fontSize: Fixed;
  fontFamily?: string;
  fontWeight?: 'normal' | 'bold' | 'lighter' | 'bolder';
  fontStyle?: 'normal' | 'italic' | 'oblique';
  textAlign?: 'left' | 'center' | 'right';
  textBaseline?: 'top' | 'middle' | 'bottom' | 'alphabetic';
}

/**
 * Texture drawing style
 * 纹理绘制样式
 */
export interface TextureStyle {
  tint?: Color;
  scale?: FixedVector2;
  rotation?: Fixed;
  anchor?: FixedVector2; // 0,0 = top-left, 0.5,0.5 = center
  flipX?: boolean;
  flipY?: boolean;
  opacity?: number; // 0-1
}

/**
 * Grid drawing style
 * 网格绘制样式
 */
export interface GridStyle {
  lineStyle: LineStyle;
  majorLineStyle?: LineStyle;
  majorLineInterval?: number; // Every N lines is a major line
}

/**
 * 2D Transform representation
 * 2D变换表示
 */
export class Transform2D {
  public position: FixedVector2;
  public rotation: Fixed;
  public scale: FixedVector2;

  constructor(
    position: FixedVector2 = FixedVector2.ZERO,
    rotation: Fixed = Fixed.ZERO,
    scale: FixedVector2 = FixedVector2.ONE
  ) {
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }

  static identity(): Transform2D {
    return new Transform2D();
  }

  multiply(other: Transform2D): Transform2D {
    // Simplified transform multiplication
    // In a real implementation, this would use proper matrix math
    return new Transform2D(
      this.position.add(other.position),
      this.rotation.add(other.rotation),
      new FixedVector2(
        this.scale.x.multiply(other.scale.x),
        this.scale.y.multiply(other.scale.y)
      )
    );
  }

  inverse(): Transform2D {
    return new Transform2D(
      this.position.negate(),
      this.rotation.negate(),
      new FixedVector2(
        Fixed.ONE.divide(this.scale.x),
        Fixed.ONE.divide(this.scale.y)
      )
    );
  }

  transformPoint(point: FixedVector2): FixedVector2 {
    // Apply scale, rotation, then translation
    let result = new FixedVector2(
      point.x.multiply(this.scale.x),
      point.y.multiply(this.scale.y)
    );

    // Apply rotation (simplified - in real implementation use rotation matrix)
    if (!this.rotation.equals(Fixed.ZERO)) {
      // For now, use approximation since Fixed.cos/sin might not exist
      const angle = this.rotation.toNumber();
      const cos = new Fixed(Math.cos(angle));
      const sin = new Fixed(Math.sin(angle));
      const x = result.x.multiply(cos).subtract(result.y.multiply(sin));
      const y = result.x.multiply(sin).add(result.y.multiply(cos));
      result = new FixedVector2(x, y);
    }

    return result.add(this.position);
  }
}

/**
 * Texture interface
 * 纹理接口
 */
export interface ITexture {
  readonly width: number;
  readonly height: number;
  readonly isLoaded: boolean;
  readonly source: unknown; // Platform-specific texture data
}

/**
 * Render statistics
 * 渲染统计信息
 */
export interface RenderStatistics {
  drawCalls: number;
  triangles: number;
  vertices: number;
  textureBinds: number;
  frameTime: number; // milliseconds
}

/**
 * Viewport configuration
 * 视口配置
 */
export interface Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Render layer for depth sorting
 * 用于深度排序的渲染层
 */
export interface RenderLayer {
  id: string;
  depth: number;
  visible: boolean;
}

/**
 * Blend mode enumeration
 * 混合模式枚举
 */
export enum BlendMode {
  Normal = 'normal',
  Add = 'add',
  Multiply = 'multiply',
  Screen = 'screen',
  Overlay = 'overlay',
  Darken = 'darken',
  Lighten = 'lighten'
}

// Export individual values to avoid unused warnings
export const BLEND_MODE_NORMAL = BlendMode.Normal;
export const BLEND_MODE_ADD = BlendMode.Add;
export const BLEND_MODE_MULTIPLY = BlendMode.Multiply;
export const BLEND_MODE_SCREEN = BlendMode.Screen;
export const BLEND_MODE_OVERLAY = BlendMode.Overlay;
export const BLEND_MODE_DARKEN = BlendMode.Darken;
export const BLEND_MODE_LIGHTEN = BlendMode.Lighten;

/**
 * Render state configuration
 * 渲染状态配置
 */
export interface RenderState {
  blendMode: BlendMode;
  opacity: number; // 0-1
  clipRect?: FixedRect;
  layer?: RenderLayer;
}
