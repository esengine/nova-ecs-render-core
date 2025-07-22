/**
 * Base physics debug renderer implementation
 * 基础物理调试渲染器实现
 */

import { Fixed, FixedVector2, FixedRect } from '@esengine/nova-ecs-math';
import { BaseDebugRenderer } from './BaseDebugRenderer';
import {
  IPhysicsDebugRenderer,
  PhysicsDebugConfig,
  DEFAULT_PHYSICS_DEBUG_CONFIG,
  ContactPoint
} from '../interfaces/IPhysicsDebugRenderer';
import { Color, ShapeStyle } from '../types/RenderTypes';

/**
 * Abstract base physics debug renderer class
 * 抽象基础物理调试渲染器类
 */
export abstract class BasePhysicsDebugRenderer extends BaseDebugRenderer implements IPhysicsDebugRenderer {
  protected physicsConfig: PhysicsDebugConfig = { ...DEFAULT_PHYSICS_DEBUG_CONFIG };

  // ===== Physics Debug Configuration =====
  // 物理调试配置

  setPhysicsDebugConfig(config: Partial<PhysicsDebugConfig>): void {
    this.physicsConfig = { ...this.physicsConfig, ...config };
    if (config.colors) {
      this.physicsConfig.colors = { ...this.physicsConfig.colors, ...config.colors };
    }
    this.onPhysicsDebugConfigChanged(this.physicsConfig);
  }

  getPhysicsDebugConfig(): PhysicsDebugConfig {
    return { ...this.physicsConfig };
  }

  // ===== Rigid Body Visualization =====
  // 刚体可视化

  drawRigidBody(body: unknown): void {
    if (!this.physicsConfig.showBodies) return;

    // Extract body information - this would be implemented by specific physics engine renderers
    const bodyInfo = this.extractBodyInfo(body);
    if (!bodyInfo) return;

    // Draw body based on type
    let bodyColor: Color;
    switch (bodyInfo.type) {
      case 'static':
        if (!this.physicsConfig.showStaticBodies) return;
        bodyColor = this.physicsConfig.colors.staticBody;
        break;
      case 'kinematic':
        if (!this.physicsConfig.showKinematicBodies) return;
        bodyColor = this.physicsConfig.colors.kinematicBody;
        break;
      case 'dynamic':
        if (!this.physicsConfig.showDynamicBodies) return;
        bodyColor = bodyInfo.sleeping && this.physicsConfig.showSleepingBodies
          ? this.physicsConfig.colors.sleepingBody
          : this.physicsConfig.colors.dynamicBody;
        break;
      default:
        return;
    }

    // Draw body transform
    if (this.physicsConfig.showTransforms) {
      this.drawBodyTransform(bodyInfo.position, bodyInfo.rotation);
    }

    // Draw center of mass
    if (this.physicsConfig.showCenterOfMass) {
      this.drawCenterOfMass(bodyInfo.centerOfMass);
    }

    // Draw AABB
    if (this.physicsConfig.showAABBs && bodyInfo.aabb) {
      this.drawBodyAABB(bodyInfo.aabb.min, bodyInfo.aabb.max);
    }

    // Draw velocity
    if (this.physicsConfig.showVelocities && bodyInfo.velocity) {
      this.drawVelocity(bodyInfo.position, bodyInfo.velocity);
    }

    // Draw forces
    if (this.physicsConfig.showForces && bodyInfo.force) {
      this.drawForceVector(bodyInfo.position, bodyInfo.force);
    }

    // Draw fixtures/colliders
    if (this.physicsConfig.showShapes && bodyInfo.fixtures) {
      for (const fixture of bodyInfo.fixtures) {
        this.drawFixture(fixture, bodyColor);
      }
    }
  }

  drawCenterOfMass(position: FixedVector2): void {
    const size = this.physicsConfig.centerOfMassSize;
    this.drawCrosshair(position, size, this.physicsConfig.colors.centerOfMass);
  }

  drawBodyTransform(position: FixedVector2, rotation: Fixed): void {
    const scale = this.physicsConfig.centerOfMassSize.multiply(new Fixed(2));
    
    // Draw local axes
    if (this.physicsConfig.showLocalAxes) {
      const angle = rotation.toNumber();
      const cos = new Fixed(Math.cos(angle));
      const sin = new Fixed(Math.sin(angle));

      // X-axis (local right)
      const xAxis = new FixedVector2(cos, sin).multiply(scale);
      this.drawArrow(position, position.add(xAxis), this.physicsConfig.colors.localAxis);

      // Y-axis (local up)
      const yAxis = new FixedVector2(sin.negate(), cos).multiply(scale);
      this.drawArrow(position, position.add(yAxis), this.physicsConfig.colors.localAxis);
    }
  }

  drawBodyAABB(min: FixedVector2, max: FixedVector2): void {
    const bounds = new FixedRect(min.x, min.y, max.x.subtract(min.x), max.y.subtract(min.y));
    this.drawRect(bounds, {
      strokeColor: this.physicsConfig.colors.aabb,
      strokeThickness: Fixed.ONE
    });
  }

  // ===== Collider Visualization =====
  // 碰撞器可视化

  drawCollider(collider: unknown): void {
    const fixtureInfo = this.extractFixtureInfo(collider);
    if (fixtureInfo) {
      this.drawFixture(fixtureInfo, this.physicsConfig.colors.shape);
    }
  }

  drawCircleCollider(center: FixedVector2, radius: Fixed, filled: boolean): void {
    const style: ShapeStyle = filled
      ? { fillColor: this.physicsConfig.colors.shape }
      : { strokeColor: this.physicsConfig.colors.shape, strokeThickness: Fixed.ONE };
    
    this.drawCircle(center, radius, style);
  }

  drawBoxCollider(center: FixedVector2, size: FixedVector2, rotation: Fixed, filled: boolean): void {
    const halfSize = new FixedVector2(size.x.divide(new Fixed(2)), size.y.divide(new Fixed(2)));
    
    // Calculate box corners
    const angle = rotation.toNumber();
    const cos = new Fixed(Math.cos(angle));
    const sin = new Fixed(Math.sin(angle));

    const corners = [
      new FixedVector2(halfSize.x.negate(), halfSize.y.negate()),
      new FixedVector2(halfSize.x, halfSize.y.negate()),
      new FixedVector2(halfSize.x, halfSize.y),
      new FixedVector2(halfSize.x.negate(), halfSize.y)
    ];

    // Rotate and translate corners
    const worldCorners = corners.map(corner => {
      const rotated = new FixedVector2(
        corner.x.multiply(cos).subtract(corner.y.multiply(sin)),
        corner.x.multiply(sin).add(corner.y.multiply(cos))
      );
      return center.add(rotated);
    });

    const style: ShapeStyle = filled
      ? { fillColor: this.physicsConfig.colors.shape }
      : { strokeColor: this.physicsConfig.colors.shape, strokeThickness: Fixed.ONE };

    this.drawPolygon(worldCorners, style);
  }

  drawPolygonCollider(vertices: FixedVector2[], filled: boolean): void {
    const style: ShapeStyle = filled
      ? { fillColor: this.physicsConfig.colors.shape }
      : { strokeColor: this.physicsConfig.colors.shape, strokeThickness: Fixed.ONE };

    this.drawPolygon(vertices, style);
  }

  drawEdgeCollider(start: FixedVector2, end: FixedVector2): void {
    this.drawLine(start, end, {
      color: this.physicsConfig.colors.shape,
      thickness: Fixed.TWO
    });
  }

  // ===== Joint Visualization =====
  // 关节可视化

  drawJoint(joint: unknown): void {
    if (!this.physicsConfig.showJoints) return;

    const jointInfo = this.extractJointInfo(joint);
    if (!jointInfo) return;

    // Draw joint connection
    this.drawLine(jointInfo.anchorA, jointInfo.anchorB, {
      color: this.physicsConfig.colors.joint,
      thickness: Fixed.TWO
    });

    // Draw anchors
    if (this.physicsConfig.showJointAnchors) {
      this.drawJointAnchors(jointInfo.anchorA, jointInfo.anchorB);
    }

    // Draw limits if applicable
    if (this.physicsConfig.showJointLimits && jointInfo.limits) {
      this.drawJointLimits(
        jointInfo.anchorA,
        jointInfo.limits.minAngle,
        jointInfo.limits.maxAngle,
        this.physicsConfig.jointAnchorSize.multiply(new Fixed(3))
      );
    }
  }

  drawJointAnchors(anchorA: FixedVector2, anchorB: FixedVector2): void {
    const size = this.physicsConfig.jointAnchorSize;
    this.drawCircle(anchorA, size, { fillColor: this.physicsConfig.colors.jointAnchor });
    this.drawCircle(anchorB, size, { fillColor: this.physicsConfig.colors.jointAnchor });
  }

  drawJointLimits(center: FixedVector2, minAngle: Fixed, maxAngle: Fixed, radius: Fixed): void {
    // Draw arc representing joint limits
    const segments = 16;
    const angleRange = maxAngle.subtract(minAngle);
    const angleStep = angleRange.divide(new Fixed(segments));

    const points: FixedVector2[] = [center];
    
    for (let i = 0; i <= segments; i++) {
      const angle = minAngle.add(angleStep.multiply(new Fixed(i))).toNumber();
      const point = center.add(new FixedVector2(
        new Fixed(Math.cos(angle)).multiply(radius),
        new Fixed(Math.sin(angle)).multiply(radius)
      ));
      points.push(point);
    }

    this.drawPolygon(points, {
      fillColor: { ...this.physicsConfig.colors.jointLimit, a: 0.3 },
      strokeColor: this.physicsConfig.colors.jointLimit,
      strokeThickness: Fixed.ONE
    });
  }

  // ===== Contact Visualization =====
  // 接触可视化

  drawContactPoints(contacts: ContactPoint[]): void {
    if (!this.physicsConfig.showContacts) return;

    for (const contact of contacts) {
      // Draw contact point
      this.drawCircle(contact.position, this.physicsConfig.contactPointSize, {
        fillColor: this.physicsConfig.colors.contact
      });

      // Draw contact normal
      if (this.physicsConfig.showContactNormals) {
        this.drawContactNormal(contact.position, contact.normal, new Fixed(0.5));
      }

      // Draw impulses
      if (this.physicsConfig.showContactImpulses) {
        const impulse = contact.normal.multiply(contact.normalImpulse.multiply(this.physicsConfig.impulseScale));
        this.drawVector(contact.position, impulse, this.physicsConfig.colors.contactImpulse);
      }

      if (this.physicsConfig.showFrictionImpulses && !contact.tangentImpulse.equals(Fixed.ZERO)) {
        const tangent = new FixedVector2(contact.normal.y.negate(), contact.normal.x);
        const frictionImpulse = tangent.multiply(contact.tangentImpulse.multiply(this.physicsConfig.impulseScale));
        this.drawVector(contact.position, frictionImpulse, this.physicsConfig.colors.frictionImpulse);
      }
    }
  }

  drawContactNormal(point: FixedVector2, normal: FixedVector2, length: Fixed): void {
    const end = point.add(normal.multiply(length));
    this.drawArrow(point, end, this.physicsConfig.colors.contactNormal);
  }

  drawContactImpulse(point: FixedVector2, impulse: FixedVector2): void {
    this.drawVector(point, impulse, this.physicsConfig.colors.contactImpulse);
  }

  // ===== Force and Motion Visualization =====
  // 力和运动可视化

  drawForces(body: unknown): void {
    if (!this.physicsConfig.showForces) return;

    const bodyInfo = this.extractBodyInfo(body);
    if (bodyInfo?.force) {
      this.drawForceVector(bodyInfo.position, bodyInfo.force);
    }
  }

  drawVelocity(position: FixedVector2, velocity: FixedVector2): void {
    const scaledVelocity = velocity.multiply(this.physicsConfig.velocityScale);
    this.drawVector(position, scaledVelocity, this.physicsConfig.colors.velocity);
  }

  drawAcceleration(position: FixedVector2, acceleration: FixedVector2): void {
    const scaledAcceleration = acceleration.multiply(this.physicsConfig.accelerationScale);
    this.drawVector(position, scaledAcceleration, this.physicsConfig.colors.acceleration);
  }

  drawAngularVelocity(position: FixedVector2, _angularVelocity: Fixed): void {
    // Draw circular arrow to represent angular velocity
    const radius = this.physicsConfig.centerOfMassSize.multiply(new Fixed(1.5));
    const segments = 12;
    const angleStep = new Fixed(2 * Math.PI).divide(new Fixed(segments));
    
    for (let i = 0; i < segments; i++) {
      const angle1 = angleStep.multiply(new Fixed(i)).toNumber();
      const angle2 = angleStep.multiply(new Fixed(i + 1)).toNumber();

      const point1 = position.add(new FixedVector2(
        new Fixed(Math.cos(angle1)).multiply(radius),
        new Fixed(Math.sin(angle1)).multiply(radius)
      ));
      const point2 = position.add(new FixedVector2(
        new Fixed(Math.cos(angle2)).multiply(radius),
        new Fixed(Math.sin(angle2)).multiply(radius)
      ));
      
      this.drawLine(point1, point2, {
        color: this.physicsConfig.colors.velocity,
        thickness: Fixed.ONE
      });
    }
  }

  // ===== Utility Drawing Functions =====
  // 实用绘制功能

  drawVector(start: FixedVector2, vector: FixedVector2, color: Color, scale?: Fixed): void {
    const scaledVector = scale ? vector.multiply(scale) : vector;
    const end = start.add(scaledVector);
    this.drawArrow(start, end, color, this.physicsConfig.arrowHeadSize);
  }

  drawPhysicsStats(stats: {
    bodyCount: number;
    contactCount: number;
    jointCount: number;
    stepTime: number;
    [key: string]: number;
  }): void {
    const debugInfo = {
      title: 'Physics Stats',
      items: [
        { label: 'Bodies', value: stats.bodyCount },
        { label: 'Contacts', value: stats.contactCount },
        { label: 'Joints', value: stats.jointCount },
        { label: 'Step Time', value: `${stats.stepTime.toFixed(2)}ms` }
      ],
      position: new FixedVector2(new Fixed(10), new Fixed(200))
    };

    // Add custom stats
    for (const [key, value] of Object.entries(stats)) {
      if (!['bodyCount', 'contactCount', 'jointCount', 'stepTime'].includes(key)) {
        debugInfo.items.push({ label: key, value: value.toString() });
      }
    }

    this.drawDebugOverlay(debugInfo);
  }

  // ===== Protected Helper Methods =====
  // 受保护的辅助方法

  protected drawForceVector(position: FixedVector2, force: FixedVector2): void {
    const scaledForce = force.multiply(this.physicsConfig.forceScale);
    this.drawVector(position, scaledForce, this.physicsConfig.colors.force);
  }

  protected drawFixture(_fixture: any, _color: Color): void {
    // This would be implemented by specific physics engine renderers
    // based on the fixture shape type
  }

  protected onPhysicsDebugConfigChanged(_config: PhysicsDebugConfig): void {
    // Override in subclasses if needed
  }

  // ===== Abstract Methods for Subclasses =====
  // 子类的抽象方法

  protected abstract extractBodyInfo(body: unknown): any;
  protected abstract extractFixtureInfo(fixture: unknown): any;
  protected abstract extractJointInfo(joint: unknown): any;
}
