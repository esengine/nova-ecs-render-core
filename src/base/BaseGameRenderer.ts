/**
 * Base game renderer implementation providing common game rendering functionality
 * 提供通用游戏渲染功能的基础游戏渲染器实现
 */

import { Fixed, FixedVector2, FixedRect } from '@esengine/nova-ecs-math';
import { BaseRenderer } from './BaseRenderer';
import {
  IGameRenderer,
  AnimationFrame,
  SpriteAnimation,
  ParticleConfig,
  LightConfig,
  PostProcessEffect,
  CameraConfig
} from '../interfaces/IGameRenderer';
import {
  Color,
  ITexture,
  TextureStyle,
  RenderLayer
} from '../types/RenderTypes';

/**
 * Abstract base game renderer class
 * 抽象基础游戏渲染器类
 */
export abstract class BaseGameRenderer extends BaseRenderer implements IGameRenderer {
  protected lights = new Map<string, LightConfig>();
  protected layers = new Map<string, RenderLayer>();
  protected postProcessEffects = new Map<string, PostProcessEffect>();
  protected camera: CameraConfig = {
    position: FixedVector2.ZERO,
    zoom: Fixed.ONE,
    rotation: Fixed.ZERO
  };
  protected ambientLight: Color = { r: 0.2, g: 0.2, b: 0.2, a: 1.0 };
  protected lightingEnabled = false;
  protected batchingEnabled = false;
  protected lightIdCounter = 0;

  // ===== Sprite and Animation System =====
  // 精灵和动画系统

  drawSprite(
    animation: SpriteAnimation,
    position: FixedVector2,
    currentTime: Fixed,
    style?: TextureStyle
  ): void {
    const frame = this.getCurrentAnimationFrame(animation, currentTime);
    if (frame) {
      this.drawSpriteFromAtlas(frame.texture, frame.sourceRect, position, style);
    }
  }

  drawSpriteFromAtlas(
    texture: ITexture,
    sourceRect: FixedRect,
    position: FixedVector2,
    style?: TextureStyle
  ): void {
    const destRect = new FixedRect(
      position.x,
      position.y,
      sourceRect.width,
      sourceRect.height
    );
    this.drawTextureRegion(texture, sourceRect, destRect, style);
  }

  createAnimation(
    name: string,
    texture: ITexture,
    frameRects: FixedRect[],
    frameDuration: Fixed,
    loop: boolean
  ): SpriteAnimation {
    const frames: AnimationFrame[] = frameRects.map(rect => ({
      texture,
      sourceRect: rect,
      duration: frameDuration
    }));

    return {
      name,
      frames,
      loop,
      playbackSpeed: Fixed.ONE
    };
  }

  protected getCurrentAnimationFrame(animation: SpriteAnimation, currentTime: Fixed): AnimationFrame | null {
    if (animation.frames.length === 0) return null;

    let totalDuration = Fixed.ZERO;
    for (const frame of animation.frames) {
      totalDuration = totalDuration.add(frame.duration.divide(animation.playbackSpeed));
    }

    if (totalDuration.equals(Fixed.ZERO)) return animation.frames[0];

    let animTime = currentTime;
    if (animation.loop) {
      // Simple modulo implementation for Fixed
      const quotient = currentTime.divide(totalDuration).floor();
      animTime = currentTime.subtract(quotient.multiply(totalDuration));
    } else if (currentTime.greaterThan(totalDuration)) {
      return animation.frames[animation.frames.length - 1];
    }

    let accumulatedTime = Fixed.ZERO;
    for (const frame of animation.frames) {
      const frameDuration = frame.duration.divide(animation.playbackSpeed);
      if (animTime.lessThan(accumulatedTime.add(frameDuration))) {
        return frame;
      }
      accumulatedTime = accumulatedTime.add(frameDuration);
    }

    return animation.frames[animation.frames.length - 1];
  }

  // ===== Particle System =====
  // 粒子系统

  createParticleSystem(config: ParticleConfig): unknown {
    return this.onCreateParticleSystem(config);
  }

  updateParticleSystem(system: unknown, deltaTime: Fixed): void {
    this.onUpdateParticleSystem(system, deltaTime);
  }

  drawParticleSystem(system: unknown): void {
    this.onDrawParticleSystem(system);
  }

  destroyParticleSystem(system: unknown): void {
    this.onDestroyParticleSystem(system);
  }

  // ===== Lighting System =====
  // 光照系统

  addLight(light: LightConfig): string {
    const id = `light_${this.lightIdCounter++}`;
    this.lights.set(id, { ...light });
    this.onLightAdded(id, light);
    return id;
  }

  removeLight(lightId: string): void {
    if (this.lights.has(lightId)) {
      this.lights.delete(lightId);
      this.onLightRemoved(lightId);
    }
  }

  updateLight(lightId: string, config: Partial<LightConfig>): void {
    const existing = this.lights.get(lightId);
    if (existing) {
      const updated = { ...existing, ...config };
      this.lights.set(lightId, updated);
      this.onLightUpdated(lightId, updated);
    }
  }

  setAmbientLight(color: Color): void {
    this.ambientLight = { ...color };
    this.onAmbientLightChanged(color);
  }

  setLightingEnabled(enabled: boolean): void {
    this.lightingEnabled = enabled;
    this.onLightingEnabledChanged(enabled);
  }

  // ===== Layer Management =====
  // 层管理

  createLayer(id: string, depth: number): RenderLayer {
    const layer: RenderLayer = {
      id,
      depth,
      visible: true
    };
    this.layers.set(id, layer);
    this.onLayerCreated(layer);
    return layer;
  }

  removeLayer(id: string): void {
    if (this.layers.has(id)) {
      this.layers.delete(id);
      this.onLayerRemoved(id);
    }
  }

  setLayerVisible(id: string, visible: boolean): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.visible = visible;
      this.onLayerVisibilityChanged(id, visible);
    }
  }

  setLayerDepth(id: string, depth: number): void {
    const layer = this.layers.get(id);
    if (layer) {
      layer.depth = depth;
      this.onLayerDepthChanged(id, depth);
    }
  }

  getLayers(): RenderLayer[] {
    return Array.from(this.layers.values()).sort((a, b) => a.depth - b.depth);
  }

  // ===== Camera System =====
  // 相机系统

  setCamera(config: CameraConfig): void {
    this.camera = { ...config };
    this.onCameraChanged(config);
  }

  getCamera(): CameraConfig {
    return { ...this.camera };
  }

  worldToScreen(worldPos: FixedVector2): FixedVector2 {
    // Apply camera transform
    const cameraRelative = worldPos.subtract(this.camera.position);
    
    // Apply zoom
    const scaled = new FixedVector2(
      cameraRelative.x.multiply(this.camera.zoom),
      cameraRelative.y.multiply(this.camera.zoom)
    );

    // Apply rotation if needed
    let rotated = scaled;
    if (!this.camera.rotation.equals(Fixed.ZERO)) {
      const angle = this.camera.rotation.toNumber();
      const cos = new Fixed(Math.cos(angle));
      const sin = new Fixed(Math.sin(angle));
      rotated = new FixedVector2(
        scaled.x.multiply(cos).subtract(scaled.y.multiply(sin)),
        scaled.x.multiply(sin).add(scaled.y.multiply(cos))
      );
    }

    // Convert to screen coordinates (center of viewport)
    const screenCenter = new FixedVector2(
      new Fixed(this.viewport.width / 2),
      new Fixed(this.viewport.height / 2)
    );

    return screenCenter.add(rotated);
  }

  screenToWorld(screenPos: FixedVector2): FixedVector2 {
    // Convert from screen coordinates to camera-relative
    const screenCenter = new FixedVector2(
      new Fixed(this.viewport.width / 2),
      new Fixed(this.viewport.height / 2)
    );
    const cameraRelative = screenPos.subtract(screenCenter);

    // Apply inverse rotation if needed
    let unrotated = cameraRelative;
    if (!this.camera.rotation.equals(Fixed.ZERO)) {
      const angle = this.camera.rotation.negate().toNumber();
      const cos = new Fixed(Math.cos(angle));
      const sin = new Fixed(Math.sin(angle));
      unrotated = new FixedVector2(
        cameraRelative.x.multiply(cos).subtract(cameraRelative.y.multiply(sin)),
        cameraRelative.x.multiply(sin).add(cameraRelative.y.multiply(cos))
      );
    }

    // Apply inverse zoom
    const unscaled = new FixedVector2(
      unrotated.x.divide(this.camera.zoom),
      unrotated.y.divide(this.camera.zoom)
    );

    // Add camera position
    return unscaled.add(this.camera.position);
  }

  isVisible(bounds: FixedRect): boolean {
    // Get camera view bounds in world space
    const viewBounds = this.getViewBounds();
    
    // Check if bounds intersect with view bounds
    return bounds.intersects(viewBounds);
  }

  // ===== Post-Processing =====
  // 后处理

  addPostProcessEffect(effect: PostProcessEffect): void {
    this.postProcessEffects.set(effect.name, { ...effect });
    this.onPostProcessEffectAdded(effect);
  }

  removePostProcessEffect(name: string): void {
    if (this.postProcessEffects.has(name)) {
      this.postProcessEffects.delete(name);
      this.onPostProcessEffectRemoved(name);
    }
  }

  setPostProcessEffectEnabled(name: string, enabled: boolean): void {
    const effect = this.postProcessEffects.get(name);
    if (effect) {
      effect.enabled = enabled;
      this.onPostProcessEffectEnabledChanged(name, enabled);
    }
  }

  updatePostProcessEffect(name: string, parameters: Record<string, unknown>): void {
    const effect = this.postProcessEffects.get(name);
    if (effect) {
      effect.parameters = { ...effect.parameters, ...parameters };
      this.onPostProcessEffectUpdated(name, effect);
    }
  }

  // ===== Batch Rendering =====
  // 批量渲染

  beginBatch(): void {
    this.batchingEnabled = true;
    this.onBeginBatch();
  }

  endBatch(): void {
    this.batchingEnabled = false;
    this.onEndBatch();
  }

  flushBatch(): void {
    this.onFlushBatch();
  }

  // ===== Advanced Features =====
  // 高级功能

  createRenderTexture(width: number, height: number): ITexture {
    return this.onCreateRenderTexture(width, height);
  }

  setRenderTexture(texture: ITexture | null): void {
    this.setRenderTarget(texture);
  }

  captureFrame(): ITexture {
    return this.onCaptureFrame();
  }

  // ===== Abstract Methods for Subclasses =====
  // 子类的抽象方法

  protected abstract onCreateParticleSystem(config: ParticleConfig): unknown;
  protected abstract onUpdateParticleSystem(system: unknown, deltaTime: Fixed): void;
  protected abstract onDrawParticleSystem(system: unknown): void;
  protected abstract onDestroyParticleSystem(system: unknown): void;
  protected abstract onLightAdded(id: string, light: LightConfig): void;
  protected abstract onLightRemoved(id: string): void;
  protected abstract onLightUpdated(id: string, light: LightConfig): void;
  protected abstract onAmbientLightChanged(color: Color): void;
  protected abstract onLightingEnabledChanged(enabled: boolean): void;
  protected abstract onLayerCreated(layer: RenderLayer): void;
  protected abstract onLayerRemoved(id: string): void;
  protected abstract onLayerVisibilityChanged(id: string, visible: boolean): void;
  protected abstract onLayerDepthChanged(id: string, depth: number): void;
  protected abstract onCameraChanged(config: CameraConfig): void;
  protected abstract onPostProcessEffectAdded(effect: PostProcessEffect): void;
  protected abstract onPostProcessEffectRemoved(name: string): void;
  protected abstract onPostProcessEffectEnabledChanged(name: string, enabled: boolean): void;
  protected abstract onPostProcessEffectUpdated(name: string, effect: PostProcessEffect): void;
  protected abstract onBeginBatch(): void;
  protected abstract onEndBatch(): void;
  protected abstract onFlushBatch(): void;
  protected abstract onCreateRenderTexture(width: number, height: number): ITexture;
  protected abstract onCaptureFrame(): ITexture;
}
