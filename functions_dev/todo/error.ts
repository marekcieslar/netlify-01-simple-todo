import { headers } from './helpers';

export default function ({
  statusCode,
  message,
}: {
  statusCode: number;
  message: string;
}) {
  return {
    statusCode,
    body: JSON.stringify({
      statusCode,
      message,
    }),
    headers,
  };
}
