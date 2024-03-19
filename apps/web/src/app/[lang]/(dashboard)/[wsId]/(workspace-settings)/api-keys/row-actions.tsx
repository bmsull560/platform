'use client';

import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Row } from '@tanstack/react-table';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import useTranslation from 'next-translate/useTranslation';
import { WorkspaceApiKey } from '@/types/primitives/WorkspaceApiKey';
import { toast } from '@/components/ui/use-toast';
import ApiKeyEditDialog from './edit-dialog';

interface ApiKeyRowActionsProps {
  row: Row<WorkspaceApiKey>;
}

export function ApiKeyRowActions({ row }: ApiKeyRowActionsProps) {
  const router = useRouter();
  const { t } = useTranslation('ws-api-keys');

  const apiKey = row.original;

  const deleteApiKey = async () => {
    const res = await fetch(
      `/api/v1/workspaces/${apiKey.ws_id}/api-keys/${apiKey.id}`,
      {
        method: 'DELETE',
      }
    );

    if (res.ok) {
      router.refresh();
    } else {
      const data = await res.json();
      toast({
        title: 'Failed to delete workspace api key',
        description: data.message,
      });
    }
  };

  const [showEditDialog, setShowEditDialog] = useState(false);

  if (!apiKey.id || !apiKey.ws_id) return null;

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
          >
            <DotsHorizontalIcon className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem onClick={() => setShowEditDialog(true)}>
            Edit
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={deleteApiKey}>Delete</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ApiKeyEditDialog
        data={apiKey}
        open={showEditDialog}
        setOpen={setShowEditDialog}
        submitLabel={t('edit_key')}
      />
    </>
  );
}