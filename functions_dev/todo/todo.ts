import { Handler } from '@netlify/functions';
import getSingleTodo from './getSingleTodo';
import getTodoList from './getTodoList';
import postTodo from './postTodo';
import putTodo from './putTodo';
import error from './error';
import deleteTodo from './deleteTodo';
import options from './options';

const handler: Handler = async (event, context) => {
  const id = event.path.split('/')[3];
  // it is used to get elements from collection that are after given one - WITH this one
  const afterRefId = event?.queryStringParameters?.afterRefId;
  // it is used to get elements from collection that are before given one - WITHOUT this one - the some as You can send first element of array...
  const beforeRefId = event?.queryStringParameters?.beforeRefId;
  // array size
  const size = event?.queryStringParameters?.size || 10;
  if (event.body === '[object Object]' || !event.body) {
    event.body = '{}';
  }
  const body = JSON.parse(event.body);

  switch (event.httpMethod) {
    case 'GET':
      if (id) {
        return await getSingleTodo(id);
      }
      return await getTodoList({
        size: +size,
        afterRefId,
        beforeRefId,
      });

    case 'POST':
      if (body.text) {
        return postTodo({
          text: body.text,
          done: false,
        });
      }
      break;

    case 'PUT':
      if (id) {
        return await putTodo(body, id);
      }
      break;

    case 'DELETE':
      if (id) {
        return await deleteTodo(id);
      }
      break;

    case 'OPTIONS':
      return options();

    default:
      return error({ statusCode: 404, message: 'No endpoint!' });
  }

  return error({ statusCode: 500, message: 'Server error - sorry for that!' });
};

export { handler };
