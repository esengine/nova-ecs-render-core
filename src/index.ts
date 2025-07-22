/**
 * @esengine/nova-ecs-render-core - Universal rendering abstraction layer for NovaECS
 * NovaECS通用渲染抽象层
 *
 * @packageDocumentation
 */

// ===== Core Types and Interfaces =====
// 核心类型和接口

export type {
  Color,
  LineStyle,
  ShapeStyle,
  TextStyle,
  TextureStyle,
  GridStyle,
  ITexture,
  RenderStatistics,
  Viewport,
  RenderState,
  RenderLayer
} from './types/RenderTypes';

export {
  ColorUtils,
  Transform2D,
  BlendMode
} from './types/RenderTypes';

// ===== Renderer Interfaces =====
// 渲染器接口

export type { IRenderer } from './interfaces/IRenderer';

export type {
  IDebugRenderer,
  DebugInfo,
  PerformanceStats,
  DebugConfig
} from './interfaces/IDebugRenderer';

export {
  DebugMode,
  DEFAULT_DEBUG_CONFIG
} from './interfaces/IDebugRenderer';

export type {
  IGameRenderer,
  AnimationFrame,
  SpriteAnimation,
  ParticleConfig,
  LightConfig,
  PostProcessEffect,
  CameraConfig
} from './interfaces/IGameRenderer';

export type {
  IPhysicsDebugRenderer,
  PhysicsDebugConfig,
  ContactPoint
} from './interfaces/IPhysicsDebugRenderer';

export {
  DEFAULT_PHYSICS_DEBUG_CONFIG
} from './interfaces/IPhysicsDebugRenderer';

// ===== Base Implementations =====
// 基础实现

export { BaseRenderer } from './base/BaseRenderer';
export { BaseDebugRenderer } from './base/BaseDebugRenderer';
export { BaseGameRenderer } from './base/BaseGameRenderer';
export { BasePhysicsDebugRenderer } from './base/BasePhysicsDebugRenderer';

// ===== Re-export Dependencies =====
// 重新导出依赖

export type { Component, ComponentPool } from '@esengine/nova-ecs';
export type {
  Fixed,
  FixedVector2,
  FixedRect,
  FixedMatrix2x2
} from '@esengine/nova-ecs-math';
