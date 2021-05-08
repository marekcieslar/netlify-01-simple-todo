import { headers } from './helpers';
import { Todo } from './interfaces';
import faunadb from 'faunadb';
import error from './error';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET || '',
});

export default async function (todo: Todo, id: string) {
  const data: Todo = {};

  if (todo.hasOwnProperty('text')) data.text = todo.text;
  if (todo.hasOwnProperty('done')) data.done = todo.done;

  console.log('jestem tu');

  console.log('data', data);

  return client
    .query(
      q.Let(
        {
          updatedTodo: q.Update(q.Ref(q.Collection('todo'), id), {
            data,
          }),
        },

        {
          id: q.Select(['ref', 'id'], q.Var('updatedTodo')),
          text: q.Select(['data', 'text'], q.Var('updatedTodo')),
          done: q.Select(['data', 'done'], q.Var('updatedTodo')),
        }
      )
    )
    .then((response) => {
      const todoResponse = response as Todo;

      return {
        statusCode: 200,
        body: JSON.stringify({
          updatedTodo: todoResponse,
          message: 'todo updated!',
          statusCode: 200,
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
