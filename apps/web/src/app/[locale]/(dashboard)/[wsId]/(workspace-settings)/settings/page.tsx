import WorkspaceAvatarSettings from './avatar';
import BasicInfo from './basic-info';
import FeatureToggles from './feature-toggles';
import WorkspaceLogoSettings from './logo';
import Security from './security';
import { DEV_MODE, ROOT_WORKSPACE_ID } from '@/constants/common';
import { getSecrets, getWorkspace } from '@/lib/workspace-helper';
import FeatureSummary from '@repo/ui/components/ui/custom/feature-summary';
import { Separator } from '@repo/ui/components/ui/separator';
import { getTranslations } from 'next-intl/server';

interface Props {
  params: Promise<{
    wsId: string;
  }>;
}

export default async function WorkspaceSettingsPage({ params }: Props) {
  const { wsId } = await params;
  const t = await getTranslations();
  const ws = await getWorkspace(wsId);
  const secrets = await getSecrets({ wsId });

  const preventWorkspaceDeletion =
    secrets
      .find((s) => s.name === 'PREVENT_WORKSPACE_DELETION')
      ?.value?.toLowerCase() === 'true';

  const enableAvatar = Boolean(
    secrets.find((s) => s.name === 'ENABLE_AVATAR')?.value
  );

  const enableLogo = Boolean(
    secrets.find((s) => s.name === 'ENABLE_LOGO')?.value
  );

  const isRootWorkspace = ws?.id === ROOT_WORKSPACE_ID;
  const isWorkspaceOwner = ws?.role === 'OWNER';

  const enableSecurity =
    !isRootWorkspace && isWorkspaceOwner && !preventWorkspaceDeletion;

  return (
    <>
      <FeatureSummary
        pluralTitle={t('common.settings')}
        description={t('ws-settings.description')}
      />
      <Separator className="my-4" />

      <div className="grid gap-4 lg:grid-cols-2">
        <BasicInfo
          workspace={ws}
          allowEdit={!isRootWorkspace && ws?.role !== 'MEMBER'}
        />

        {enableAvatar && (
          <WorkspaceAvatarSettings
            workspace={ws}
            allowEdit={ws?.role === 'OWNER'}
          />
        )}

        {enableLogo && (
          <WorkspaceLogoSettings
            workspace={ws}
            allowEdit={ws?.role === 'OWNER'}
          />
        )}

        {enableSecurity && <Security workspace={ws} />}

        {DEV_MODE && (
          <>
            <Separator className="col-span-full" />

            <div className="border-border bg-foreground/5 col-span-full flex flex-col rounded-lg border p-4">
              <div className="mb-1 text-2xl font-bold">
                {t('ws-settings.features')}
              </div>
              <div className="text-foreground/80 mb-4 font-semibold">
                {t('ws-settings.features_description')}
              </div>

              <div className="grid h-full items-end gap-2 text-center md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                <FeatureToggles />
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
