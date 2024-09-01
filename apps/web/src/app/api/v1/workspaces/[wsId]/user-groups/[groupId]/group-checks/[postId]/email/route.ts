import { createClient } from '@/utils/supabase/server';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import juice from 'juice';
import { NextRequest, NextResponse } from 'next/server';

const sesClient = new SESClient({
  region: process.env.AWS_REGION as string,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
  },
});

export async function POST(
  req: NextRequest,
  {
    params: { wsId, postId },
  }: {
    params: { wsId: string; postId: string };
  }
) {
  const isWSIDAllowed = wsId === process.env.MAILBOX_ALLOWED_WS_ID;

  if (!isWSIDAllowed) {
    return NextResponse.json(
      { message: 'Workspace ID is not allowed' },
      { status: 403 }
    );
  }

  const data = (await req.json()) as {
    users: {
      id: string;
      email: string;
      content: string;
      username: string;
      notes: string;
      is_completed: boolean;
    }[];
  };

  if (!data.users) {
    return NextResponse.json(
      { message: 'Invalid request body' },
      { status: 400 }
    );
  }

  const results = await Promise.all(
    data.users.map(async (user) => {
      const subject = `Easy Center | Báo cáo tiến độ ngày ${new Date().toLocaleDateString()} của ${user.username}`;
      return sendEmail({
        receiverId: user.id,
        recipient: user.email,
        subject,
        content: user.content,
        postId,
      });
    })
  );

  const successCount = results.filter((result) => result).length;
  const failureCount = results.filter((result) => !result).length;

  return NextResponse.json({
    message: 'Emails sent and logged',
    successCount,
    failureCount,
  });
}

const sendEmail = async ({
  receiverId,
  recipient,
  subject,
  content,
  postId,
}: {
  receiverId: string;
  recipient: string;
  subject: string;
  content: string;
  postId: string;
}) => {
  try {
    const inlinedHtmlContent = juice(content);

    const params = {
      Source: `${process.env.SOURCE_NAME} <${process.env.SOURCE_EMAIL}>`,
      Destination: {
        ToAddresses: [recipient],
      },
      Message: {
        Subject: { Data: subject },
        Body: {
          Html: { Data: inlinedHtmlContent },
        },
      },
    };

    const command = new SendEmailCommand(params);
    await sesClient.send(command);

    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    if (!process.env.SOURCE_NAME || !process.env.SOURCE_EMAIL) {
      return false;
    }

    const { error } = await supabase.from('sent_emails').insert([
      {
        post_id: postId,
        sender_id: user.id,
        receiver_id: receiverId,
        email: recipient,
        subject,
        content: inlinedHtmlContent,
        source_name: process.env.SOURCE_NAME,
        source_email: process.env.SOURCE_EMAIL,
      },
    ]);

    if (error) {
      console.error('Error logging sent email:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error sending email:', err);
    return false;
  }
};