# @esengine/nova-ecs-render-core

Universal rendering abstraction layer for NovaECS, providing a unified interface for different rendering backends.

NovaECS通用渲染抽象层，为不同的渲染后端提供统一接口。

[![npm version](https://badge.fury.io/js/%40esengine%2Fnova-ecs-render-core.svg)](https://badge.fury.io/js/%40esengine%2Fnova-ecs-render-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features | 特性

- 🎨 **Universal Abstraction**: Unified rendering interface for multiple backends
  **通用抽象**: 为多个后端提供统一的渲染接口
- 🐛 **Debug Rendering**: Comprehensive debug visualization tools
  **调试渲染**: 全面的调试可视化工具
- 🎮 **Game Features**: Advanced game rendering capabilities
  **游戏功能**: 高级游戏渲染能力
- ⚡ **Physics Debug**: Specialized physics simulation visualization
  **物理调试**: 专门的物理模拟可视化
- 🔧 **TypeScript**: Complete type safety and excellent developer experience
  **TypeScript**: 完整的类型安全和优秀的开发体验
- 📐 **Fixed-Point Math**: Integration with NovaECS math library for deterministic rendering
  **定点数学**: 与NovaECS数学库集成，实现确定性渲染

## Installation | 安装

```bash
npm install @esengine/nova-ecs-render-core
```

## Architecture | 架构

```
├── IRenderer (Core rendering interface)
│   ├── IDebugRenderer (Debug rendering extensions)
│   ├── IGameRenderer (Game rendering extensions)
│   └── IPhysicsDebugRenderer (Physics debug rendering)
│
├── BaseRenderer (Base implementation)
│   ├── BaseDebugRenderer (Debug renderer base)
│   ├── BaseGameRenderer (Game renderer base)
│   └── BasePhysicsDebugRenderer (Physics debug base)
```

## API Documentation | API 文档

For complete API documentation, visit: [https://esengine.github.io/nove-ecs-render-core/](https://esengine.github.io/nova-ecs-render-core/)

完整的API文档请访问：[https://esengine.github.io/nove-ecs-render-core/](https://esengine.github.io/nova-ecs-render-core/)

## Quick Start | 快速开始

### Basic Renderer Implementation | 基础渲染器实现

```typescript
import { BaseRenderer, Color, FixedVector2, LineStyle } from '@esengine/nova-ecs-render-core';
import { Fixed, FixedRect, FixedMatrix2x2 } from '@esengine/nova-ecs-math';

class MyRenderer extends BaseRenderer {
  protected onBeginFrame(): void {
    // Initialize frame rendering
  }

  protected onEndFrame(): void {
    // Finalize and present frame
  }

  protected onClear(color: Color): void {
    // Clear render target with color
  }

  protected onDrawLine(start: FixedVector2, end: FixedVector2, style: LineStyle): void {
    // Implement line drawing
  }

  // ... implement other abstract methods
}
```

### Debug Renderer | 调试渲染器

```typescript
import { BaseDebugRenderer, DebugMode, GridStyle } from '@esengine/nova-ecs-render-core';

class MyDebugRenderer extends BaseDebugRenderer {
  // ... implement base renderer methods

  // Debug-specific functionality is already implemented in BaseDebugRenderer
  
  // Usage example:
  render(): void {
    this.beginFrame();
    
    // Draw debug grid
    this.drawGrid(new Fixed(1), {
      lineStyle: { color: { r: 0.3, g: 0.3, b: 0.3, a: 0.5 }, thickness: Fixed.ONE }
    });
    
    // Draw coordinate axes
    this.drawAxis(FixedVector2.ZERO, new Fixed(2));
    
    // Draw performance stats
    this.drawPerformanceStats({
      fps: 60,
      frameTime: 16.67,
      drawCalls: 150,
      triangles: 5000,
      vertices: 15000
    });
    
    this.endFrame();
  }
}
```

### Game Renderer | 游戏渲染器

```typescript
import { BaseGameRenderer, SpriteAnimation, CameraConfig } from '@esengine/nova-ecs-render-core';

class MyGameRenderer extends BaseGameRenderer {
  // ... implement base renderer methods

  setupGame(): void {
    // Setup camera
    this.setCamera({
      position: new FixedVector2(0, 0),
      zoom: Fixed.ONE,
      rotation: Fixed.ZERO
    });

    // Create render layers
    this.createLayer('background', -10);
    this.createLayer('gameplay', 0);
    this.createLayer('ui', 10);

    // Setup lighting
    this.setLightingEnabled(true);
    this.setAmbientLight({ r: 0.2, g: 0.2, b: 0.3, a: 1.0 });
  }

  renderGame(deltaTime: Fixed): void {
    this.beginFrame();
    
    // Render sprites with animation
    this.drawSprite(playerAnimation, playerPosition, currentTime);
    
    // Render particles
    this.updateParticleSystem(explosionParticles, deltaTime);
    this.drawParticleSystem(explosionParticles);
    
    this.endFrame();
  }
}
```

### Physics Debug Renderer | 物理调试渲染器

```typescript
import { BasePhysicsDebugRenderer, PhysicsDebugConfig } from '@esengine/nova-ecs-render-core';

class MyPhysicsDebugRenderer extends BasePhysicsDebugRenderer {
  // ... implement base renderer methods

  setupPhysicsDebug(): void {
    this.setPhysicsDebugConfig({
      showBodies: true,
      showContacts: true,
      showVelocities: true,
      showForces: true,
      colors: {
        dynamicBody: { r: 0.9, g: 0.7, b: 0.7, a: 0.8 },
        staticBody: { r: 0.5, g: 0.9, b: 0.5, a: 0.8 },
        contact: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 }
      }
    });
  }

  renderPhysicsDebug(world: PhysicsWorld): void {
    this.beginFrame();
    
    // Draw all rigid bodies
    for (const body of world.getBodies()) {
      this.drawRigidBody(body);
    }
    
    // Draw all joints
    for (const joint of world.getJoints()) {
      this.drawJoint(joint);
    }
    
    // Draw contact points
    const contacts = world.getContacts();
    this.drawContactPoints(contacts);
    
    // Draw physics statistics
    this.drawPhysicsStats({
      bodyCount: world.getBodyCount(),
      contactCount: contacts.length,
      jointCount: world.getJointCount(),
      stepTime: world.getLastStepTime()
    });
    
    this.endFrame();
  }
}
```

## Core Interfaces | 核心接口

### IRenderer
- Basic rendering operations (lines, shapes, text, textures)
- Transform management
- Render state management
- Viewport control

### IDebugRenderer
- Debug overlays and information display
- Grid and axis rendering
- Performance monitoring
- Screenshot capabilities

### IGameRenderer
- Sprite animation system
- Particle systems
- Lighting system
- Layer management
- Camera system
- Post-processing effects

### IPhysicsDebugRenderer
- Rigid body visualization
- Collider rendering
- Joint visualization
- Contact point display
- Force and velocity vectors

## Integration with Rendering Backends | 与渲染后端集成

This core library provides the abstraction layer. Specific implementations for different rendering backends:

- **Canvas 2D**: `@esengine/nova-ecs-render-canvas`
- **WebGL**: `@esengine/nova-ecs-render-webgl`
- **Pixi.js**: `@esengine/nova-ecs-render-pixi`
- **Three.js**: `@esengine/nova-ecs-render-three`

## License | 许可证

MIT License - See [LICENSE](LICENSE) file for details.

## Contributing | 贡献

Issues and Pull Requests are welcome!
欢迎提交 Issue 和 Pull Request！
