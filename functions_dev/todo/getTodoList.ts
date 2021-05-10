import { headers } from './helpers';
import faunadb, { query } from 'faunadb';
import error from './error';
import { Todo } from './interfaces';

const q = faunadb.query;
const client = new faunadb.Client({
  secret: process.env.FAUNADB_SECRET || '',
});

interface Response {
  data: Todo[];
  afterRefId?: string;
  beforeRefId?: string;
}

interface PaginateSettings {
  size: number;
  after?: unknown;
  before?: unknown;
}

export default async function (ref: {
  size: number;
  afterRefId?: string;
  beforeRefId?: string;
}) {
  const settings: PaginateSettings = {
    size: ref.size || 10,
  };

  const after = ref.afterRefId
    ? q.Ref(q.Collection('todo'), ref.afterRefId)
    : null;
  if (after) settings.after = after;
  const before = ref.beforeRefId
    ? q.Ref(q.Collection('todo'), ref.beforeRefId)
    : null;
  if (before) settings.before = before;

  return client
    .query(
      q.Let(
        {
          resp: q.Paginate(q.Documents(q.Collection('todo')), settings),
        },
        {
          afterRefId: q.If(
            q.IsArray(q.Select(['after'], q.Var('resp'), false)),
            q.Select(
              ['id'],
              q.Select(0, q.Select(['after'], q.Var('resp'), false))
            ),
            null
          ),
          beforeRefId: q.If(
            q.IsArray(q.Select(['before'], q.Var('resp'), false)),
            q.Select(
              ['id'],
              q.Select(0, q.Select(['before'], q.Var('resp'), false))
            ),
            null
          ),
          data: q.Map(
            q.Select(['data'], q.Var('resp')),
            q.Lambda(
              'todo_ref',
              q.Let(
                {
                  element: q.Get(q.Var('todo_ref')),
                },
                {
                  id: q.Select(['ref', 'id'], q.Var('element')),
                  text: q.Select(['data', 'text'], q.Var('element')),
                  done: q.Select(['data', 'done'], q.Var('element')),
                }
              )
            )
          ),
        }
      )
    )
    .then((response) => {
      const { data, afterRefId, beforeRefId } = response as Response;

      return {
        statusCode: 200,
        body: JSON.stringify({
          data,
          afterRefId,
          beforeRefId,
          message: 'todo Array sended',
          statusCode: 200,
        }),
        headers,
      };
    })
    .catch((e) => {
      console.log('e', e);
      return error({ statusCode: 500, message: 'Database Error' });
    });
}
