'use client';

import { Transaction } from '@/types/primitives/Transaction';
import { createClient } from '@/utils/supabase/client';
import { Button } from '@repo/ui/components/ui/button';
import {
  DialogClose,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui/components/ui/dialog';
import { Progress } from '@repo/ui/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/ui/select';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { jsonToCSV } from 'react-papaparse';
import * as XLSX from 'xlsx';

export default function ExportDialogContent({
  wsId,
  exportType,
  searchParams,
}: {
  wsId: string;
  exportType: string;
  searchParams: { q?: string; page?: string; pageSize?: string };
}) {
  const t = useTranslations();

  const [exportFileType, setExportFileType] = useState('excel');
  const [progress, setProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);

  const downloadCSV = (data: Transaction[], filename: string) => {
    const csv = jsonToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadExcel = (data: Transaction[], filename: string) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);

    const allData: Transaction[] = [];
    let currentPage = 1;
    const pageSize = 100;

    while (true) {
      const { data, count } = await getData(wsId, {
        q: searchParams.q,
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      allData.push(...data);

      const totalPages = Math.ceil(count / pageSize);
      const progressValue = (currentPage / totalPages) * 100;
      setProgress(progressValue);

      if (data.length < pageSize) {
        break;
      }

      currentPage++;
    }

    // After data fetching is completed, set progress to 100%
    setProgress(100);

    // Export the file based on the selected file type
    if (exportFileType === 'csv') {
      downloadCSV(allData, `export_${exportType}.csv`);
    } else if (exportFileType === 'excel') {
      downloadExcel(allData, `export_${exportType}.xlsx`);
    }

    setIsExporting(false); // Stop the exporting process
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>{t('common.export')}</DialogTitle>
        <DialogDescription>{t('common.export-content')}</DialogDescription>
      </DialogHeader>

      <div className="grid gap-1">
        <Select
          value={exportFileType}
          onValueChange={setExportFileType}
          disabled={isExporting}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="File type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="excel">Excel</SelectItem>
            <SelectItem value="csv">CSV</SelectItem>
          </SelectContent>
        </Select>

        {isExporting && (
          <div>
            <Progress value={progress} className="h-2 w-full" />
          </div>
        )}
      </div>

      <DialogFooter className="justify-between">
        <DialogClose asChild>
          <Button type="button" variant="secondary">
            {t('common.cancel')}
          </Button>
        </DialogClose>
        <Button onClick={handleExport} disabled={isExporting}>
          {isExporting ? t('common.loading') : t('common.export')}
        </Button>
      </DialogFooter>
    </>
  );
}

async function getData(
  wsId: string,
  {
    q,
    page = '1',
    pageSize = '10',
  }: { q?: string; page?: string; pageSize?: string }
) {
  const supabase = createClient();

  const queryBuilder = supabase
    .from('wallet_transactions')
    .select(
      '*, workspace_wallets!inner(name, ws_id), transaction_categories(name)',
      {
        count: 'exact',
      }
    )
    .eq('workspace_wallets.ws_id', wsId)
    .order('taken_at', { ascending: false })
    .order('created_at', { ascending: false });

  if (q) queryBuilder.ilike('description', `%${q}%`);

  if (page && pageSize) {
    const parsedPage = parseInt(page);
    const parsedSize = parseInt(pageSize);
    const start = (parsedPage - 1) * parsedSize;
    const end = parsedPage * parsedSize - 1;
    queryBuilder.range(start, end);
  }

  const { data: rawData, error, count } = await queryBuilder;
  if (error) throw error;

  const data = rawData.map(
    ({ workspace_wallets, transaction_categories, ...rest }) => ({
      ...rest,
      wallet: workspace_wallets?.name,
      category: transaction_categories?.name,
    })
  );

  return { data, count } as {
    data: Transaction[];
    count: number;
  };
}