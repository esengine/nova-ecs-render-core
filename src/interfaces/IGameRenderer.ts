/**
 * Game renderer interface extending base renderer with game-specific features
 * 游戏渲染器接口，扩展基础渲染器的游戏特定功能
 */

import { Fixed, FixedVector2, FixedRect } from '@esengine/nova-ecs-math';
import { IRenderer } from './IRenderer';
import { Color, ITexture, TextureStyle, RenderLayer } from '../types/RenderTypes';

/**
 * Sprite animation frame
 * 精灵动画帧
 */
export interface AnimationFrame {
  texture: ITexture;
  sourceRect: FixedRect;
  duration: Fixed; // in seconds
  offset?: FixedVector2;
}

/**
 * Sprite animation definition
 * 精灵动画定义
 */
export interface SpriteAnimation {
  name: string;
  frames: AnimationFrame[];
  loop: boolean;
  playbackSpeed: Fixed; // multiplier for frame durations
}

/**
 * Particle system configuration
 * 粒子系统配置
 */
export interface ParticleConfig {
  texture: ITexture;
  maxParticles: number;
  emissionRate: Fixed; // particles per second
  lifetime: Fixed; // seconds
  startColor: Color;
  endColor: Color;
  startSize: Fixed;
  endSize: Fixed;
  startVelocity: FixedVector2;
  velocityVariation: FixedVector2;
  gravity: FixedVector2;
  fadeIn: Fixed; // fade in duration
  fadeOut: Fixed; // fade out duration
}

/**
 * Lighting configuration
 * 光照配置
 */
export interface LightConfig {
  position: FixedVector2;
  color: Color;
  intensity: Fixed;
  radius: Fixed;
  falloff: 'linear' | 'quadratic' | 'constant';
  castShadows: boolean;
}

/**
 * Post-processing effect configuration
 * 后处理效果配置
 */
export interface PostProcessEffect {
  name: string;
  enabled: boolean;
  parameters: Record<string, unknown>;
}

/**
 * Camera configuration
 * 相机配置
 */
export interface CameraConfig {
  position: FixedVector2;
  zoom: Fixed;
  rotation: Fixed;
  bounds?: FixedRect; // world bounds for camera limits
  followTarget?: FixedVector2;
  followSpeed?: Fixed;
  deadZone?: FixedRect; // area where target can move without camera following
}

/**
 * Game renderer interface with advanced game features
 * 具有高级游戏功能的游戏渲染器接口
 */
export interface IGameRenderer extends IRenderer {
  // ===== Sprite and Animation System =====
  // 精灵和动画系统

  /**
   * Draw an animated sprite
   * 绘制动画精灵
   */
  drawSprite(
    animation: SpriteAnimation,
    position: FixedVector2,
    currentTime: Fixed,
    style?: TextureStyle
  ): void;

  /**
   * Draw a static sprite from texture atlas
   * 从纹理图集绘制静态精灵
   */
  drawSpriteFromAtlas(
    texture: ITexture,
    sourceRect: FixedRect,
    position: FixedVector2,
    style?: TextureStyle
  ): void;

  /**
   * Create sprite animation from texture atlas
   * 从纹理图集创建精灵动画
   */
  createAnimation(
    name: string,
    texture: ITexture,
    frameRects: FixedRect[],
    frameDuration: Fixed,
    loop: boolean
  ): SpriteAnimation;

  // ===== Particle System =====
  // 粒子系统

  /**
   * Create a particle system
   * 创建粒子系统
   */
  createParticleSystem(config: ParticleConfig): unknown; // Returns platform-specific particle system

  /**
   * Update particle system
   * 更新粒子系统
   */
  updateParticleSystem(system: unknown, deltaTime: Fixed): void;

  /**
   * Draw particle system
   * 绘制粒子系统
   */
  drawParticleSystem(system: unknown): void;

  /**
   * Destroy particle system
   * 销毁粒子系统
   */
  destroyParticleSystem(system: unknown): void;

  // ===== Lighting System =====
  // 光照系统

  /**
   * Add a light to the scene
   * 向场景添加光源
   */
  addLight(light: LightConfig): string; // Returns light ID

  /**
   * Remove a light from the scene
   * 从场景移除光源
   */
  removeLight(lightId: string): void;

  /**
   * Update light properties
   * 更新光源属性
   */
  updateLight(lightId: string, config: Partial<LightConfig>): void;

  /**
   * Set ambient light color
   * 设置环境光颜色
   */
  setAmbientLight(color: Color): void;

  /**
   * Enable/disable lighting system
   * 启用/禁用光照系统
   */
  setLightingEnabled(enabled: boolean): void;

  // ===== Layer Management =====
  // 层管理

  /**
   * Create a render layer
   * 创建渲染层
   */
  createLayer(id: string, depth: number): RenderLayer;

  /**
   * Remove a render layer
   * 移除渲染层
   */
  removeLayer(id: string): void;

  /**
   * Set layer visibility
   * 设置层可见性
   */
  setLayerVisible(id: string, visible: boolean): void;

  /**
   * Set layer depth
   * 设置层深度
   */
  setLayerDepth(id: string, depth: number): void;

  /**
   * Get all layers sorted by depth
   * 获取按深度排序的所有层
   */
  getLayers(): RenderLayer[];

  // ===== Camera System =====
  // 相机系统

  /**
   * Set camera configuration
   * 设置相机配置
   */
  setCamera(config: CameraConfig): void;

  /**
   * Get current camera configuration
   * 获取当前相机配置
   */
  getCamera(): CameraConfig;

  /**
   * Convert world position to screen position
   * 将世界位置转换为屏幕位置
   */
  worldToScreen(worldPos: FixedVector2): FixedVector2;

  /**
   * Convert screen position to world position
   * 将屏幕位置转换为世界位置
   */
  screenToWorld(screenPos: FixedVector2): FixedVector2;

  /**
   * Check if a world bounds is visible in camera
   * 检查世界边界是否在相机中可见
   */
  isVisible(bounds: FixedRect): boolean;

  // ===== Post-Processing =====
  // 后处理

  /**
   * Add post-processing effect
   * 添加后处理效果
   */
  addPostProcessEffect(effect: PostProcessEffect): void;

  /**
   * Remove post-processing effect
   * 移除后处理效果
   */
  removePostProcessEffect(name: string): void;

  /**
   * Enable/disable post-processing effect
   * 启用/禁用后处理效果
   */
  setPostProcessEffectEnabled(name: string, enabled: boolean): void;

  /**
   * Update post-processing effect parameters
   * 更新后处理效果参数
   */
  updatePostProcessEffect(name: string, parameters: Record<string, unknown>): void;

  // ===== Batch Rendering =====
  // 批量渲染

  /**
   * Begin batch rendering for optimization
   * 开始批量渲染以进行优化
   */
  beginBatch(): void;

  /**
   * End batch rendering and flush
   * 结束批量渲染并刷新
   */
  endBatch(): void;

  /**
   * Flush current batch immediately
   * 立即刷新当前批次
   */
  flushBatch(): void;

  // ===== Advanced Features =====
  // 高级功能

  /**
   * Create render texture for off-screen rendering
   * 创建用于离屏渲染的渲染纹理
   */
  createRenderTexture(width: number, height: number): ITexture;

  /**
   * Set render texture as target
   * 设置渲染纹理为目标
   */
  setRenderTexture(texture: ITexture | null): void;

  /**
   * Save current frame to texture
   * 将当前帧保存到纹理
   */
  captureFrame(): ITexture;
}
