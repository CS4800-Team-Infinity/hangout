import { IncomingMessage, ServerResponse } from 'http';
import handler from '@/pages/api/notifications';

// Minimal mock request/response to test Next.js API handler
function mockReq(method: string, url = '/api/notifications') {
  const req = new IncomingMessage(null as any);
  req.method = method;
  // @ts-ignore Add url for handlers that inspect it
  req.url = url;
  return req as any;
}

function mockRes() {
  const res = new ServerResponse({} as any) as any;
  let _status = 200;
  let _body: any = null;
  res.status = (code: number) => {
    _status = code;
    res.statusCode = code;
    return res;
  };
  res.json = (body: any) => {
    _body = body;
    res._getJSON = () => _body;
    return res;
  };
  res.end = (val?: any) => {
    if (val) _body = val;
    res._ended = true;
    return res;
  };
  res.setHeader = jest.fn();
  res._getStatus = () => _status;
  return res;
}

describe('API /api/notifications', () => {
  test('GET returns 200 and message', async () => {
    const req = mockReq('GET');
    const res = mockRes();

    await handler(req, res);

    expect(res._getStatus()).toBe(200);
    expect(res._getJSON()).toEqual({ message: 'Fetched notifications successfully' });
  });

  test('POST returns 201 and message', async () => {
    const req = mockReq('POST');
    const res = mockRes();

    await handler(req, res);

    expect(res._getStatus()).toBe(201);
    expect(res._getJSON()).toEqual({ message: 'Notification created' });
  });

  test('Unsupported method returns 405 and Allow header', async () => {
    const req = mockReq('DELETE');
    const res = mockRes();

    await handler(req, res);

    expect(res._getStatus()).toBe(405);
    expect(res.setHeader).toHaveBeenCalledWith('Allow', ['GET', 'POST']);
  });
});
