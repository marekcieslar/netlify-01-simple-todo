import { headers } from './helpers';
import { Todo } from './interfaces';
import faunadb from 'faunadb';
import error from './error';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET || '',
});

export default function (todo: Todo) {
  return client
    .query(
      q.Let(
        {
          newTodo: q.Create(q.Collection('todo'), {
            data: {
              text: todo.text,
              done: false,
            },
          }),
        },
        {
          id: q.Select(['ref', 'id'], q.Var('newTodo')),
          text: q.Select(['data', 'text'], q.Var('newTodo')),
          done: q.Select(['data', 'done'], q.Var('newTodo')),
        }
      )
    )
    .then((response) => {
      const todoResponse = response as Todo;

      return {
        statusCode: 201,
        body: JSON.stringify({
          newTodo: todoResponse,
          message: 'todo created!',
          statusCode: 201,
        }),
        headers,
      };
    })
    .catch((e) => {
      console.log('e', e);
      return error({ statusCode: 500, message: 'Database Error' });
    });
}
