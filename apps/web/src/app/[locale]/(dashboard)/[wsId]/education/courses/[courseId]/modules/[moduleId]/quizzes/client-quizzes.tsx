'use client';

import QuizForm from '../../../../../quizzes/form';
import { cn } from '@/lib/utils';
import { createClient } from '@/utils/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui/components/ui/alert-dialog';
import { Button } from '@repo/ui/components/ui/button';
import { Separator } from '@repo/ui/components/ui/separator';
import { Pencil, Trash, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ClientQuizzes({
  wsId,
  moduleId,
  quizzes,
  previewMode = false,
}: {
  wsId: string;
  moduleId: string;
  quizzes: Array<{
    created_at: string;
    id: string;
    question: string;
    ws_id: string;
    quiz_options: {
      created_at: string;
      id: string;
      is_correct: boolean;
      points: number | null;
      quiz_id: string;
      value: string;
    }[];
  }>;
  previewMode?: boolean;
}) {
  const router = useRouter();
  const t = useTranslations();
  const supabase = createClient();
  const [editingQuizId, setEditingQuizId] = useState<string | null>(null);

  const onDelete = async (id: string) => {
    const { error } = await supabase
      .from('workspace_quizzes')
      .delete()
      .eq('id', id);

    if (error) {
      console.log(error);
      return;
    }

    router.refresh();
  };

  return (
    <>
      {quizzes.map((quiz) => (
        <div
          key={quiz.id}
          className={cn(
            'rounded-lg border p-4 shadow-md md:p-6',
            previewMode && 'bg-foreground/5'
          )}
        >
          {editingQuizId === quiz.id ? (
            <>
              <QuizForm
                wsId={wsId}
                moduleId={moduleId}
                data={{
                  id: quiz.id,
                  ws_id: wsId,
                  question: quiz.question,
                  quiz_options: quiz.quiz_options,
                }}
                onFinish={() => setEditingQuizId(null)}
              />
              <div className="mt-4 flex items-center justify-end gap-2">
                <Button variant="ghost" onClick={() => setEditingQuizId(null)}>
                  <X className="h-5 w-5" />
                  {t('common.cancel')}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="quiz-question">
                <h3 className="text-lg font-semibold">{quiz.question}</h3>
                <Separator className="my-2" />
                <ul className="mt-4 grid gap-2">
                  {quiz.quiz_options.map((option) => (
                    <li
                      key={option.id}
                      className={cn(
                        'rounded-md border p-2',
                        option.is_correct
                          ? 'bg-dynamic-green/10 text-dynamic-green border-dynamic-green'
                          : 'bg-foreground/5 border-foreground/5'
                      )}
                    >
                      {option.value} {option.is_correct && '(Correct)'}
                    </li>
                  ))}
                </ul>
              </div>
              {previewMode || (
                <div className="mt-4 flex items-center justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setEditingQuizId(quiz.id)}
                  >
                    <Pencil className="h-5 w-5" />
                    {t('common.edit')}
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Trash className="h-5 w-5" />
                        {t('common.delete')}
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          {t('common.confirm_delete_title')}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {t('common.confirm_delete_description')}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>
                          {t('common.cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={() => onDelete(quiz.id)}>
                          {t('common.continue')}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              )}
            </>
          )}
        </div>
      ))}
    </>
  );
}