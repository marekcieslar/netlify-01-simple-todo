import { headers } from './helpers';
import faunadb from 'faunadb';
import error from './error';
import { Todo } from './interfaces';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET || '',
});

interface Response {
  data: Todo;
  ref: any;
}

export default async function (id: string) {
  return client
    .query(q.Get(q.Ref(q.Collection('todo'), id)))
    .then((response) => {
      const todoResponse = response as Response;
      todoResponse.data.id = id;

      return {
        statusCode: 200,
        body: JSON.stringify({
          todo: todoResponse.data,
          statusCode: 200,
          message: 'todo sended OK!',
        }),
        headers,
      };
    })
    .catch((e) => {
      console.log('e', e);
      if (e.requestResult.statusCode === 404) {
        return error({ statusCode: 404, message: 'Todo not existed!' });
      }
      return error({ statusCode: 500, message: 'Database Error' });
    });
}
