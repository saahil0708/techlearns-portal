import { Injectable, ForbiddenException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Role } from '@prisma/client';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { PrismaService } from '../prisma/prisma.service.js';
import type { CurrentUserPayload } from '../common/types/current-user.interface.js';
import { SendNotificationDto, NotificationCategory } from './dto/send-notification.dto.js';
import { randomUUID } from 'crypto';

export type NotificationAudienceType = 'GLOBAL' | 'INSTITUTION' | 'BATCH' | 'COURSE' | 'USERS';

export interface StoredNotification {
  id: string;
  title: string;
  desc: string;
  body?: string;
  category: NotificationCategory;
  actionUrl: string;
  time: string;
  timestamp: number;
  readBy: Set<string>;
  deletedBy?: Set<string>;
  senderId?: string;
  senderName?: string;
  senderRole?: Role;
  audienceType: NotificationAudienceType;
  targetRole?: Role;
  institutionId?: string;
  batchId?: string;
  courseId?: string;
  targetUserIds?: string[];
}

export interface UserVisibleNotification {
  id: string;
  title: string;
  desc: string;
  body?: string;
  category: NotificationCategory;
  actionUrl: string;
  time: string;
  timestamp: number;
  unread: boolean;
  senderId?: string;
  senderName?: string;
  senderRole?: Role;
}

interface UserContext {
  userInstIds: Set<string>;
  userBatchIds: Set<string>;
  userCourseIds: Set<string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  private readonly deviceTokens = new Map<string, Set<string>>(); // userId -> Set<fcmToken>
  private readonly notificationLedger: StoredNotification[] = [];

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Register or update an FCM token for a user session
   */
  async registerToken(userId: string, token: string): Promise<{ success: boolean }> {
    if (!this.deviceTokens.has(userId)) {
      this.deviceTokens.set(userId, new Set<string>());
    }
    this.deviceTokens.get(userId)!.add(token);
    this.logger.log(`Registered FCM token for user ${userId}`);
    return { success: true };
  }

  /**
   * Send / broadcast notification with hierarchical RBAC verification and explicit audience resolution
   */
  async sendNotification(
    currentUser: CurrentUserPayload,
    dto: SendNotificationDto,
  ): Promise<{ success: boolean; recipientCount: number; notification: UserVisibleNotification }> {
    // 1. Strict Role Validation: Students are strictly prohibited from sending notifications
    if (currentUser.globalRole === Role.STUDENT) {
      throw new ForbiddenException('Students do not have permission to send notifications.');
    }

    const isSuperAdmin =
      currentUser.globalRole === Role.SUPER_ADMIN ||
      currentUser.globalRole === Role.PLATFORM_ADMIN;

    let instIds: string[] = [];
    if (!isSuperAdmin) {
      instIds = (currentUser.memberships || [])
        .map((m) => m.institutionId)
        .filter(Boolean);

      if (instIds.length === 0) {
        throw new ForbiddenException('You do not belong to any active institution.');
      }

      if (dto.target?.institutionId && !instIds.includes(dto.target.institutionId)) {
        throw new ForbiddenException('You can only broadcast notifications within your assigned institution.');
      }
    }

    // 2. Resolve audience type and recipient count
    let audienceType: NotificationAudienceType = 'GLOBAL';
    let targetUserIds: string[] | undefined = undefined;
    let recipientCount = 0;
    let targetInstitutionId = dto.target?.institutionId;
    let targetBatchId = dto.target?.batchId;
    let targetCourseId = dto.target?.courseId;

    if (dto.target?.userIds && dto.target.userIds.length > 0) {
      audienceType = 'USERS';
      const userRoleFilter = dto.target?.targetRole ? { globalRole: dto.target.targetRole } : {};
      if (isSuperAdmin) {
        const validUsers = await this.prisma.user.findMany({
          where: {
            id: { in: dto.target.userIds },
            ...userRoleFilter,
          },
          select: { id: true },
        });
        targetUserIds = validUsers.map((u) => u.id);
      } else {
        const validUsers = await this.prisma.user.findMany({
          where: {
            id: { in: dto.target.userIds },
            ...userRoleFilter,
            memberships: { some: { institutionId: { in: instIds } } },
          },
          select: { id: true },
        });
        targetUserIds = validUsers.map((u) => u.id);
      }
      recipientCount = targetUserIds.length;
    } else if (targetBatchId) {
      audienceType = 'BATCH';
      if (!isSuperAdmin) {
        const batch = await this.prisma.batch.findUnique({
          where: { id: targetBatchId },
          select: { institutionId: true },
        });
        if (!batch || !instIds.includes(batch.institutionId)) {
          throw new ForbiddenException('You do not have access to this batch.');
        }
      }
      const userRoleFilter = dto.target?.targetRole ? { user: { globalRole: dto.target.targetRole } } : {};
      recipientCount = await this.prisma.batchStudent.count({
        where: {
          batchId: targetBatchId,
          ...userRoleFilter,
        },
      });
    } else if (targetCourseId) {
      audienceType = 'COURSE';
      const course = await this.prisma.course.findUnique({
        where: { id: targetCourseId },
        select: { institutionId: true, createdById: true },
      });
      if (!course) {
        throw new NotFoundException('Target course not found.');
      }
      if (!isSuperAdmin) {
        const isCreator = course.createdById === currentUser.id;
        const matchesInst = course.institutionId && instIds.includes(course.institutionId);
        if (!isCreator && !matchesInst) {
          throw new ForbiddenException('You do not have access to target this course.');
        }
      }
      const userRoleFilter = dto.target?.targetRole ? { user: { globalRole: dto.target.targetRole } } : {};
      recipientCount = await this.prisma.enrollment.count({
        where: {
          courseId: targetCourseId,
          ...userRoleFilter,
        },
      });
    } else if (targetInstitutionId || !isSuperAdmin) {
      audienceType = 'INSTITUTION';
      let resolvedInstId = targetInstitutionId;
      if (!resolvedInstId) {
        if (instIds.length > 1) {
          throw new BadRequestException('Target institutionId is required when you are associated with multiple institutions.');
        }
        resolvedInstId = instIds[0];
      }
      targetInstitutionId = resolvedInstId;
      recipientCount = await this.prisma.user.count({
        where: {
          memberships: { some: { institutionId: resolvedInstId } },
          ...(dto.target?.targetRole ? { globalRole: dto.target.targetRole } : {}),
        },
      });
    } else {
      audienceType = 'GLOBAL';
      recipientCount = await this.prisma.user.count({
        where: dto.target?.targetRole ? { globalRole: dto.target.targetRole } : {},
      });
    }

    // 3. Create and record the notification with explicit audience metadata
    const notification: StoredNotification = {
      id: randomUUID(),
      title: dto.title,
      desc: dto.body,
      body: dto.body,
      category: dto.category || NotificationCategory.SYSTEM,
      actionUrl: dto.actionUrl || '/students',
      time: 'Just now',
      timestamp: Date.now(),
      readBy: new Set<string>(),
      deletedBy: new Set<string>(),
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: currentUser.globalRole,
      audienceType,
      targetRole: dto.target?.targetRole,
      institutionId: targetInstitutionId,
      batchId: targetBatchId,
      courseId: targetCourseId,
      targetUserIds,
    };

    // Prepend to in-memory ledger (capped to last 500 records)
    this.notificationLedger.unshift(notification);
    if (this.notificationLedger.length > 500) {
      this.notificationLedger.pop();
    }

    // Trigger FCM Web Push dispatch in background
    this.dispatchPushToAudience(notification).catch((err) => {
      this.logger.warn(`Failed to dispatch FCM push notifications: ${err?.message || err}`);
    });

    this.logger.log(
      `Notification sent by ${currentUser.name} (${currentUser.globalRole}): "${dto.title}" (Audience: ${audienceType}, Recipients: ${recipientCount})`,
    );

    return {
      success: true,
      recipientCount,
      notification: {
        id: notification.id,
        title: notification.title,
        desc: notification.desc,
        body: notification.body,
        category: notification.category,
        actionUrl: notification.actionUrl,
        time: notification.time,
        timestamp: notification.timestamp,
        unread: true,
        senderId: notification.senderId,
        senderName: notification.senderName,
        senderRole: notification.senderRole,
      },
    };
  }

  /**
   * Retrieve notification ledger computed for the current user
   */
  async getUserNotifications(currentUser: CurrentUserPayload): Promise<UserVisibleNotification[]> {
    const context = await this.getUserContext(currentUser);
    const visibleNotifs: UserVisibleNotification[] = [];

    for (const notif of this.notificationLedger) {
      if (!notif.deletedBy?.has(currentUser.id) && this.isNotificationVisibleTo(notif, currentUser, context)) {
        visibleNotifs.push({
          id: notif.id,
          title: notif.title,
          desc: notif.desc,
          body: notif.body,
          category: notif.category,
          actionUrl: notif.actionUrl,
          time: notif.time,
          timestamp: notif.timestamp,
          unread: !notif.readBy.has(currentUser.id),
          senderId: notif.senderId,
          senderName: notif.senderName,
          senderRole: notif.senderRole,
        });
      }
    }

    return visibleNotifs;
  }

  /**
   * Mark a notification as read per user
   */
  async markAsRead(currentUser: CurrentUserPayload, notificationId: string): Promise<{ success: boolean }> {
    const notif = this.notificationLedger.find((n) => n.id === notificationId);
    if (!notif) {
      throw new NotFoundException('Notification not found.');
    }

    const context = await this.getUserContext(currentUser);
    if (!this.isNotificationVisibleTo(notif, currentUser, context)) {
      throw new ForbiddenException('You do not have access to this notification.');
    }

    notif.readBy.add(currentUser.id);
    return { success: true };
  }

  /**
   * Mark all visible notifications as read for current user
   */
  async markAllAsRead(currentUser: CurrentUserPayload): Promise<{ success: boolean }> {
    const context = await this.getUserContext(currentUser);
    for (const notif of this.notificationLedger) {
      if (!notif.deletedBy?.has(currentUser.id) && this.isNotificationVisibleTo(notif, currentUser, context)) {
        notif.readBy.add(currentUser.id);
      }
    }
    return { success: true };
  }

  /**
   * Delete / dismiss notification for current user
   */
  async deleteNotification(currentUser: CurrentUserPayload, notificationId: string): Promise<{ success: boolean }> {
    const notif = this.notificationLedger.find((n) => n.id === notificationId);
    if (!notif) {
      throw new NotFoundException('Notification not found.');
    }

    const context = await this.getUserContext(currentUser);
    if (!this.isNotificationVisibleTo(notif, currentUser, context)) {
      throw new ForbiddenException('You do not have access to this notification.');
    }

    if (!notif.deletedBy) {
      notif.deletedBy = new Set<string>();
    }
    notif.deletedBy.add(currentUser.id);
    return { success: true };
  }

  /**
   * Clear all visible notifications for current user
   */
  async deleteAllNotifications(currentUser: CurrentUserPayload): Promise<{ success: boolean }> {
    const context = await this.getUserContext(currentUser);
    for (const notif of this.notificationLedger) {
      if (this.isNotificationVisibleTo(notif, currentUser, context)) {
        if (!notif.deletedBy) {
          notif.deletedBy = new Set<string>();
        }
        notif.deletedBy.add(currentUser.id);
      }
    }
    return { success: true };
  }

  /**
   * Helper: Preload user memberships, batches, and course enrollments once per request
   */
  private async getUserContext(currentUser: CurrentUserPayload): Promise<UserContext> {
    const userInstIds = new Set(
      (currentUser.memberships || []).map((m) => m.institutionId).filter(Boolean),
    );

    const [batches, enrollments] = await Promise.all([
      this.prisma.batchStudent.findMany({
        where: { userId: currentUser.id },
        select: { batchId: true },
      }),
      this.prisma.enrollment.findMany({
        where: { userId: currentUser.id },
        select: { courseId: true },
      }),
    ]);

    const userBatchIds = new Set(batches.map((b) => b.batchId));
    const userCourseIds = new Set(enrollments.map((e) => e.courseId));

    return {
      userInstIds,
      userBatchIds,
      userCourseIds,
    };
  }

  /**
   * Helper: Check in-memory if a notification is visible to a given user
   */
  private isNotificationVisibleTo(
    notif: StoredNotification,
    currentUser: CurrentUserPayload,
    context: UserContext,
  ): boolean {
    // If targeted by role and user role doesn't match
    if (notif.targetRole && currentUser.globalRole !== notif.targetRole) {
      return false;
    }

    if (notif.audienceType === 'USERS') {
      return Boolean(notif.targetUserIds && notif.targetUserIds.includes(currentUser.id));
    }

    if (notif.audienceType === 'BATCH') {
      if (!notif.batchId) return false;
      return context.userBatchIds.has(notif.batchId) || notif.senderId === currentUser.id;
    }

    if (notif.audienceType === 'COURSE') {
      if (!notif.courseId) return false;
      return context.userCourseIds.has(notif.courseId) || notif.senderId === currentUser.id;
    }

    if (notif.audienceType === 'INSTITUTION') {
      if (!notif.institutionId) return false;
      return context.userInstIds.has(notif.institutionId);
    }

    // GLOBAL audience
    return true;
  }

  private getFirebaseAdmin(): App | null {
    const apps = getApps();
    if (apps.length > 0 && apps[0]) {
      return apps[0];
    }

    try {
      const projectId = process.env.FIREBASE_PROJECT_ID || 'techlearns-portal-22ff4';
      const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
      const privateKey = process.env.FIREBASE_PRIVATE_KEY;

      if (clientEmail && privateKey) {
        return initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey: privateKey.replace(/\\n/g, '\n'),
          }),
        });
      }
      return initializeApp({ projectId });
    } catch (err: any) {
      this.logger.warn(`Failed to initialize Firebase Admin app: ${err?.message || err}`);
      return null;
    }
  }

  /**
   * Helper: Dispatches FCM push notifications to target user devices
   */
  private async dispatchPushToAudience(notification: StoredNotification): Promise<void> {
    const adminApp = this.getFirebaseAdmin();
    if (!adminApp || this.deviceTokens.size === 0) {
      return;
    }

    const registeredUserIds = Array.from(this.deviceTokens.keys());
    if (registeredUserIds.length === 0) {
      return;
    }

    const tokensToSend: string[] = [];

    try {
      if (notification.audienceType === 'USERS' && notification.targetUserIds) {
        const targetSet = new Set(notification.targetUserIds);
        for (const userId of registeredUserIds) {
          if (targetSet.has(userId)) {
            const tokens = this.deviceTokens.get(userId);
            if (tokens) tokensToSend.push(...tokens);
          }
        }
      } else {
        // Batch-load registered users and their institution memberships
        const registeredUsers = await this.prisma.user.findMany({
          where: { id: { in: registeredUserIds } },
          select: {
            id: true,
            globalRole: true,
            memberships: { select: { institutionId: true } },
          },
        });

        let userBatchEnrollments = new Set<string>();
        let userCourseEnrollments = new Set<string>();

        if (notification.audienceType === 'BATCH' && notification.batchId) {
          const batchStudents = await this.prisma.batchStudent.findMany({
            where: {
              batchId: notification.batchId,
              userId: { in: registeredUserIds },
            },
            select: { userId: true },
          });
          userBatchEnrollments = new Set(batchStudents.map((b) => b.userId));
        } else if (notification.audienceType === 'COURSE' && notification.courseId) {
          const enrollments = await this.prisma.enrollment.findMany({
            where: {
              courseId: notification.courseId,
              userId: { in: registeredUserIds },
            },
            select: { userId: true },
          });
          userCourseEnrollments = new Set(enrollments.map((e) => e.userId));
        }

        for (const user of registeredUsers) {
          const userContext: UserContext = {
            userInstIds: new Set(user.memberships.map((m) => m.institutionId)),
            userBatchIds: userBatchEnrollments.has(user.id)
              ? new Set([notification.batchId!])
              : new Set(),
            userCourseIds: userCourseEnrollments.has(user.id)
              ? new Set([notification.courseId!])
              : new Set(),
          };

          const userPayload: CurrentUserPayload = {
            id: user.id,
            globalRole: user.globalRole,
            memberships: user.memberships,
          } as any;

          if (this.isNotificationVisibleTo(notification, userPayload, userContext)) {
            const tokens = this.deviceTokens.get(user.id);
            if (tokens) tokensToSend.push(...tokens);
          }
        }
      }
    } catch (err: any) {
      this.logger.warn(`Error resolving audience tokens: ${err?.message || err}`);
    }

    if (tokensToSend.length === 0) return;

    const uniqueTokens = Array.from(new Set(tokensToSend));
    const messaging = getMessaging(adminApp);
    let totalSuccess = 0;
    let totalFailure = 0;

    const BATCH_SIZE = 500;
    for (let i = 0; i < uniqueTokens.length; i += BATCH_SIZE) {
      const tokenBatch = uniqueTokens.slice(i, i + BATCH_SIZE);
      try {
        const response = await messaging.sendEachForMulticast({
          tokens: tokenBatch,
          notification: {
            title: notification.title,
            body: notification.body || notification.desc,
          },
          data: {
            notificationId: notification.id,
            title: notification.title,
            body: notification.body || notification.desc,
            category: notification.category,
            actionUrl: notification.actionUrl || '/students',
          },
        });

        totalSuccess += response.successCount;
        totalFailure += response.failureCount;

        // Clean up invalid or unregistered tokens from this.deviceTokens
        response.responses.forEach((resp, idx) => {
          if (!resp.success && resp.error) {
            const code = resp.error.code;
            if (
              code === 'messaging/invalid-registration-token' ||
              code === 'messaging/registration-token-not-registered'
            ) {
              const failedToken = tokenBatch[idx];
              for (const [userId, userTokens] of this.deviceTokens.entries()) {
                if (userTokens.has(failedToken)) {
                  userTokens.delete(failedToken);
                  if (userTokens.size === 0) {
                    this.deviceTokens.delete(userId);
                  }
                }
              }
            }
          }
        });
      } catch (err: any) {
        this.logger.warn(`FCM sendEachForMulticast batch error: ${err?.message || err}`);
      }
    }

    this.logger.log(
      `FCM push dispatched for "${notification.title}": ${totalSuccess} succeeded, ${totalFailure} failed`,
    );
  }
}
