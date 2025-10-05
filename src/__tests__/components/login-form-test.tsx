import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { LoginForm } from "@/components/login-form"

const mockUseAuth = {
  login: jest.fn(),
  isLoading: false,
  user: null,
  isAuthenticated: false,
  register: jest.fn(),
  logout: jest.fn()
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}))

describe('LoginForm - Simple', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render email input', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
  })

  it('should render password input', () => {
    render(<LoginForm />)
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
  })

  it('should render login button', () => {
    render(<LoginForm />)
    expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument()
  })

  it('should accept user input in email field', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const emailInput = screen.getByLabelText(/email/i)
    await user.type(emailInput, 'test@example.com')
    
    expect(emailInput).toHaveValue('test@example.com')
  })

  it('should accept user input in password field', async () => {
    const user = userEvent.setup()
    render(<LoginForm />)
    
    const passwordInput = screen.getByLabelText(/password/i)
    await user.type(passwordInput, 'password123')
    
    expect(passwordInput).toHaveValue('password123')
  })
})