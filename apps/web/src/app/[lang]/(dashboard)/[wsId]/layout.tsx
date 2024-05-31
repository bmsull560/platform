import { Navigation, NavLink } from '@/components/navigation';
import { Separator } from '@/components/ui/separator';
import { getSecret, getSecrets } from '@/lib/workspace-helper';
import useTranslation from 'next-translate/useTranslation';
import FleetingNavigator from './fleeting-navigator';

import { ReactNode } from 'react';

export const dynamic = 'force-dynamic';

interface LayoutProps {
  params: {
    wsId: string;
  };
  children: ReactNode;
}

export default async function Layout({
  children,
  params: { wsId },
}: LayoutProps) {
  const { t } = useTranslation('sidebar-tabs');

  const secrets = await getSecrets({
    wsId,
    requiredSecrets: [
      'ENABLE_AI',
      'ENABLE_CHAT',
      'ENABLE_CALENDAR',
      'ENABLE_USERS',
      'ENABLE_PROJECTS',
      'ENABLE_DOCS',
      'ENABLE_DRIVE',
      'ENABLE_INVENTORY',
      'ENABLE_HEALTHCARE',
    ],
    forceAdmin: true,
  });

  const verifySecret = (secret: string, value: string) =>
    getSecret(secret, secrets)?.value === value;

  const navLinks: NavLink[] = [
    {
      name: t('chat'),
      href: `/${wsId}/chat`,
      disabled: !verifySecret('ENABLE_CHAT', 'true'),
    },
    {
      name: t('common:dashboard'),
      href: `/${wsId}`,
      matchExact: true,
    },
    {
      name: t('ai'),
      href: `/${wsId}/ai`,
      disabled: !verifySecret('ENABLE_AI', 'true'),
    },
    {
      name: t('blackbox'),
      href: `/${wsId}/blackbox`,
      disabled: true,
    },
    {
      name: t('calendar'),
      href: `/${wsId}/calendar`,
      disabled: !verifySecret('ENABLE_CALENDAR', 'true'),
    },
    {
      name: t('projects'),
      href: `/${wsId}/projects`,
      disabled: !verifySecret('ENABLE_PROJECTS', 'true'),
    },
    {
      name: t('documents'),
      href: `/${wsId}/documents`,
      disabled: !verifySecret('ENABLE_DOCS', 'true'),
    },
    {
      name: t('drive'),
      href: `/${wsId}/drive`,
      disabled: !verifySecret('ENABLE_DRIVE', 'true'),
    },
    {
      name: t('users'),
      href: `/${wsId}/users`,
      disabled: !verifySecret('ENABLE_USERS', 'true'),
    },
    {
      name: t('inventory'),
      href: `/${wsId}/inventory`,
      disabled: !verifySecret('ENABLE_INVENTORY', 'true'),
    },
    {
      name: t('healthcare'),
      href: `/${wsId}/healthcare`,
      disabled: !verifySecret('ENABLE_HEALTHCARE', 'true'),
    },
    {
      name: t('finance'),
      href: `/${wsId}/finance`,
    },
    {
      name: t('common:settings'),
      href: `/${wsId}/settings`,
      aliases: [
        `/${wsId}/members`,
        `/${wsId}/teams`,
        `/${wsId}/secrets`,
        `/${wsId}/infrastructure`,
        `/${wsId}/migrations`,
        `/${wsId}/activities`,
      ],
    },
  ];

  return (
    <>
      <div className="px-4 py-2 font-semibold md:px-8 lg:px-16 xl:px-32">
        <div className="scrollbar-none flex gap-1 overflow-x-auto">
          <Navigation currentWsId={wsId} navLinks={navLinks} />
        </div>
      </div>
      <Separator className="opacity-50" />

      <div className="p-4 pt-2 md:px-8 lg:px-16 xl:px-32">{children}</div>
      {verifySecret('ENABLE_CHAT', 'true') && <FleetingNavigator wsId={wsId} />}
    </>
  );
}
