/**
 * Physics debug renderer interface for visualizing physics simulation
 * 用于可视化物理模拟的物理调试渲染器接口
 */

import { Fixed, FixedVector2 } from '@esengine/nova-ecs-math';
import { IDebugRenderer } from './IDebugRenderer';
import { Color } from '../types/RenderTypes';

/**
 * Physics debug configuration
 * 物理调试配置
 */
export interface PhysicsDebugConfig {
  // Body visualization
  showBodies: boolean;
  showSleepingBodies: boolean;
  showStaticBodies: boolean;
  showKinematicBodies: boolean;
  showDynamicBodies: boolean;
  
  // Shape visualization
  showShapes: boolean;
  showWireframes: boolean;
  showAABBs: boolean;
  showCenterOfMass: boolean;
  
  // Joint visualization
  showJoints: boolean;
  showJointLimits: boolean;
  showJointAnchors: boolean;
  
  // Contact visualization
  showContacts: boolean;
  showContactNormals: boolean;
  showContactImpulses: boolean;
  showFrictionImpulses: boolean;
  
  // Force visualization
  showForces: boolean;
  showVelocities: boolean;
  showAccelerations: boolean;
  
  // Transform visualization
  showTransforms: boolean;
  showLocalAxes: boolean;
  
  // Colors for different elements
  colors: {
    staticBody: Color;
    kinematicBody: Color;
    dynamicBody: Color;
    sleepingBody: Color;
    shape: Color;
    wireframe: Color;
    aabb: Color;
    centerOfMass: Color;
    joint: Color;
    jointLimit: Color;
    jointAnchor: Color;
    contact: Color;
    contactNormal: Color;
    contactImpulse: Color;
    frictionImpulse: Color;
    force: Color;
    velocity: Color;
    acceleration: Color;
    transform: Color;
    localAxis: Color;
  };
  
  // Scale factors for visualization
  forceScale: Fixed;
  velocityScale: Fixed;
  accelerationScale: Fixed;
  impulseScale: Fixed;
  
  // Size parameters
  contactPointSize: Fixed;
  jointAnchorSize: Fixed;
  centerOfMassSize: Fixed;
  arrowHeadSize: Fixed;
}

/**
 * Default physics debug configuration
 * 默认物理调试配置
 */
export const DEFAULT_PHYSICS_DEBUG_CONFIG: PhysicsDebugConfig = {
  showBodies: true,
  showSleepingBodies: true,
  showStaticBodies: true,
  showKinematicBodies: true,
  showDynamicBodies: true,
  showShapes: true,
  showWireframes: false,
  showAABBs: false,
  showCenterOfMass: false,
  showJoints: true,
  showJointLimits: true,
  showJointAnchors: true,
  showContacts: false,
  showContactNormals: false,
  showContactImpulses: false,
  showFrictionImpulses: false,
  showForces: false,
  showVelocities: false,
  showAccelerations: false,
  showTransforms: false,
  showLocalAxes: false,
  colors: {
    staticBody: { r: 0.5, g: 0.9, b: 0.5, a: 0.8 },
    kinematicBody: { r: 0.5, g: 0.5, b: 0.9, a: 0.8 },
    dynamicBody: { r: 0.9, g: 0.7, b: 0.7, a: 0.8 },
    sleepingBody: { r: 0.6, g: 0.6, b: 0.6, a: 0.8 },
    shape: { r: 0.9, g: 0.9, b: 0.9, a: 0.8 },
    wireframe: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
    aabb: { r: 1.0, g: 0.0, b: 1.0, a: 0.8 },
    centerOfMass: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
    joint: { r: 0.5, g: 0.8, b: 0.8, a: 1.0 },
    jointLimit: { r: 0.8, g: 0.8, b: 0.3, a: 1.0 },
    jointAnchor: { r: 0.0, g: 1.0, b: 0.0, a: 1.0 },
    contact: { r: 1.0, g: 0.0, b: 0.0, a: 1.0 },
    contactNormal: { r: 0.9, g: 0.9, b: 0.4, a: 1.0 },
    contactImpulse: { r: 0.9, g: 0.3, b: 0.3, a: 1.0 },
    frictionImpulse: { r: 0.9, g: 0.9, b: 0.3, a: 1.0 },
    force: { r: 1.0, g: 0.4, b: 0.4, a: 1.0 },
    velocity: { r: 0.4, g: 0.4, b: 1.0, a: 1.0 },
    acceleration: { r: 1.0, g: 0.4, b: 1.0, a: 1.0 },
    transform: { r: 1.0, g: 1.0, b: 1.0, a: 1.0 },
    localAxis: { r: 0.8, g: 0.8, b: 0.8, a: 1.0 }
  },
  forceScale: new Fixed(0.1),
  velocityScale: new Fixed(0.5),
  accelerationScale: new Fixed(0.1),
  impulseScale: new Fixed(1.0),
  contactPointSize: new Fixed(0.1),
  jointAnchorSize: new Fixed(0.1),
  centerOfMassSize: new Fixed(0.1),
  arrowHeadSize: new Fixed(0.1)
};

/**
 * Contact point information
 * 接触点信息
 */
export interface ContactPoint {
  position: FixedVector2;
  normal: FixedVector2;
  normalImpulse: Fixed;
  tangentImpulse: Fixed;
  separation: Fixed;
}

/**
 * Physics debug renderer interface
 * 物理调试渲染器接口
 */
export interface IPhysicsDebugRenderer extends IDebugRenderer {
  // ===== Physics Debug Configuration =====
  // 物理调试配置

  /**
   * Set physics debug configuration
   * 设置物理调试配置
   */
  setPhysicsDebugConfig(config: Partial<PhysicsDebugConfig>): void;

  /**
   * Get physics debug configuration
   * 获取物理调试配置
   */
  getPhysicsDebugConfig(): PhysicsDebugConfig;

  // ===== Rigid Body Visualization =====
  // 刚体可视化

  /**
   * Draw a rigid body with all its fixtures
   * 绘制刚体及其所有夹具
   */
  drawRigidBody(body: unknown): void; // Platform-specific body type

  /**
   * Draw body center of mass
   * 绘制刚体质心
   */
  drawCenterOfMass(position: FixedVector2): void;

  /**
   * Draw body transform (position and rotation)
   * 绘制刚体变换（位置和旋转）
   */
  drawBodyTransform(position: FixedVector2, rotation: Fixed): void;

  /**
   * Draw body AABB (Axis-Aligned Bounding Box)
   * 绘制刚体AABB（轴对齐边界框）
   */
  drawBodyAABB(min: FixedVector2, max: FixedVector2): void;

  // ===== Collider Visualization =====
  // 碰撞器可视化

  /**
   * Draw a collider/fixture
   * 绘制碰撞器/夹具
   */
  drawCollider(collider: unknown): void; // Platform-specific collider type

  /**
   * Draw circle collider
   * 绘制圆形碰撞器
   */
  drawCircleCollider(center: FixedVector2, radius: Fixed, filled: boolean): void;

  /**
   * Draw box collider
   * 绘制盒形碰撞器
   */
  drawBoxCollider(center: FixedVector2, size: FixedVector2, rotation: Fixed, filled: boolean): void;

  /**
   * Draw polygon collider
   * 绘制多边形碰撞器
   */
  drawPolygonCollider(vertices: FixedVector2[], filled: boolean): void;

  /**
   * Draw edge collider
   * 绘制边缘碰撞器
   */
  drawEdgeCollider(start: FixedVector2, end: FixedVector2): void;

  // ===== Joint Visualization =====
  // 关节可视化

  /**
   * Draw a joint
   * 绘制关节
   */
  drawJoint(joint: unknown): void; // Platform-specific joint type

  /**
   * Draw joint anchors
   * 绘制关节锚点
   */
  drawJointAnchors(anchorA: FixedVector2, anchorB: FixedVector2): void;

  /**
   * Draw joint limits (for revolute/prismatic joints)
   * 绘制关节限制（用于旋转/平移关节）
   */
  drawJointLimits(center: FixedVector2, minAngle: Fixed, maxAngle: Fixed, radius: Fixed): void;

  // ===== Contact Visualization =====
  // 接触可视化

  /**
   * Draw contact points between bodies
   * 绘制刚体间的接触点
   */
  drawContactPoints(contacts: ContactPoint[]): void;

  /**
   * Draw contact normal
   * 绘制接触法线
   */
  drawContactNormal(point: FixedVector2, normal: FixedVector2, length: Fixed): void;

  /**
   * Draw contact impulse
   * 绘制接触冲量
   */
  drawContactImpulse(point: FixedVector2, impulse: FixedVector2): void;

  // ===== Force and Motion Visualization =====
  // 力和运动可视化

  /**
   * Draw forces acting on a body
   * 绘制作用在刚体上的力
   */
  drawForces(body: unknown): void; // Platform-specific body type

  /**
   * Draw velocity vector
   * 绘制速度向量
   */
  drawVelocity(position: FixedVector2, velocity: FixedVector2): void;

  /**
   * Draw acceleration vector
   * 绘制加速度向量
   */
  drawAcceleration(position: FixedVector2, acceleration: FixedVector2): void;

  /**
   * Draw angular velocity indicator
   * 绘制角速度指示器
   */
  drawAngularVelocity(position: FixedVector2, angularVelocity: Fixed): void;

  // ===== Utility Drawing Functions =====
  // 实用绘制功能

  /**
   * Draw vector arrow
   * 绘制向量箭头
   */
  drawVector(start: FixedVector2, vector: FixedVector2, color: Color, scale?: Fixed): void;

  /**
   * Draw physics statistics overlay
   * 绘制物理统计覆盖层
   */
  drawPhysicsStats(stats: {
    bodyCount: number;
    contactCount: number;
    jointCount: number;
    stepTime: number;
    [key: string]: number;
  }): void;
}
