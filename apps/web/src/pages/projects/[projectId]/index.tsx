import { useRouter } from 'next/router';
import { ReactElement, useEffect } from 'react';
import useSWR from 'swr';
import NestedLayout from '../../../components/layouts/NestedLayout';
import { useAppearance } from '../../../hooks/useAppearance';
import HeaderX from '../../../components/metadata/HeaderX';

const ProjectOverviewPage = () => {
  const router = useRouter();
  const { projectId } = router.query;

  const { data: project } = useSWR(
    projectId ? `/api/projects/${projectId}` : null
  );

  const { setRootSegment } = useAppearance();

  useEffect(() => {
    setRootSegment(
      project?.orgs?.id
        ? [
            {
              content: project?.orgs?.name || 'Unnamed Organization',
              href: `/orgs/${project?.orgs?.id}`,
            },
            {
              content: 'Projects',
              href: `/orgs/${project?.orgs?.id}/projects`,
            },
            {
              content: project?.name || 'Untitled Project',
              href: `/projects/${projectId}`,
            },
            { content: 'Overview', href: `/projects/${projectId}` },
          ]
        : []
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, project?.orgs?.id, project?.orgs?.name, project?.name]);

  return (
    <>
      <HeaderX
        label={`Overview – ${project?.name || 'Untitled Project'}`}
      />
      <div className="grid gap-4">
        <div className="rounded-lg bg-zinc-900 p-4">
          <h1 className="font-bold">Overview</h1>
          <p className="text-zinc-400">
            This is the overview page for the{' '}
            <span className="font-semibold text-white">{project?.name}</span>{' '}
            project.
          </p>
        </div>
      </div>
    </>
  );
};

ProjectOverviewPage.getLayout = function getLayout(page: ReactElement) {
  return <NestedLayout orgMode={false}>{page}</NestedLayout>;
};

export default ProjectOverviewPage;
