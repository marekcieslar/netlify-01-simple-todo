import { headers } from './helpers';

export default function () {
  return {
    statusCode: 200,
    headers,
    body: 'OPTIONS',
  };
}
