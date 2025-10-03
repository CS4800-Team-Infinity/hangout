import { http, HttpResponse } from 'msw'

export const handlers = [
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as any
    
    if (email === 'test@example.com' && password === 'password123') {
      return HttpResponse.json({
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'fake-jwt-token'
      })
    }

    return HttpResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  http.post('/api/auth/register', async ({ request }) => {
    const body = await request.json() as any
    
    return HttpResponse.json({
      user: { 
        id: '2', 
        email: body.email || 'new@example.com', 
        name: body.name || 'New User' 
      },
      token: 'fake-jwt-token'
    })
  }),

  http.get('/api/auth/me', ({ request }) => {
    const authHeader = request.headers.get('authorization')
    
    if (authHeader?.includes('fake-jwt-token')) {
      return HttpResponse.json({
        user: { id: '1', email: 'test@example.com', name: 'Test User' }
      })
    }

    return HttpResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    )
  })
]