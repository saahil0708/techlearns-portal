import { Metadata } from 'next';
import NotificationCenterClient from '@/components/notifications/NotificationCenterClient';

export const metadata: Metadata = {
  title: 'Notification Center | CodePlatform',
  description: 'View real-time notifications, academic broadcasts, contest alerts, submission evaluation verdicts, and platform messages in structured list table format.',
};

export default function NotificationsPage() {
  return <NotificationCenterClient />;
}
