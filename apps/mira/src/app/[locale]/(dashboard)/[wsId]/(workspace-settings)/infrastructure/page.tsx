import StatisticCard from '../../../../../../components/cards/StatisticCard';
import tzs from '@/data/timezones.json';
import { enforceRootWorkspaceAdmin } from '@/lib/workspace-helper';
import { createAdminClient } from '@/utils/supabase/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{
    wsId: string;
  }>;
}

export default async function InfrastructureOverviewPage({ params }: Props) {
  const { wsId } = await params;
  await enforceRootWorkspaceAdmin(wsId, {
    redirectTo: `/${wsId}/settings`,
  });

  const t = await getTranslations();

  const users = await getUserCount();
  const workspaces = await getWorkspaceCount();
  const timezones = tzs.length;
  const aiWhitelistedEmails = await getAIWhitelistedEmailsCount();

  return (
    <div className="grid flex-col gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatisticCard
        title={t('infrastructure-tabs.users')}
        value={users}
        href={`/${wsId}/infrastructure/users`}
      />

      <StatisticCard
        title={t('infrastructure-tabs.workspaces')}
        value={workspaces}
        href={`/${wsId}/infrastructure/workspaces`}
      />

      <StatisticCard
        title={t('infrastructure-tabs.timezones')}
        value={timezones}
        href={`/${wsId}/infrastructure/timezones`}
      />

      <StatisticCard
        title={t('infrastructure-tabs.ai_whitelisted_emails')}
        value={aiWhitelistedEmails}
        href={`/${wsId}/infrastructure/ai/whitelist`}
      />
    </div>
  );
}

async function getUserCount() {
  const supabaseAdmin = await createAdminClient();
  if (!supabaseAdmin) notFound();

  const { count } = await supabaseAdmin.from('users').select('*', {
    count: 'exact',
    head: true,
  });

  return count;
}

async function getWorkspaceCount() {
  const supabaseAdmin = await createAdminClient();
  if (!supabaseAdmin) notFound();

  const { count } = await supabaseAdmin.from('workspaces').select('*', {
    count: 'exact',
    head: true,
  });

  return count;
}

async function getAIWhitelistedEmailsCount() {
  const supabaseAdmin = await createAdminClient();
  if (!supabaseAdmin) notFound();

  const { count } = await supabaseAdmin
    .from('ai_whitelisted_emails')
    .select('*', {
      count: 'exact',
      head: true,
    });

  return count;
}