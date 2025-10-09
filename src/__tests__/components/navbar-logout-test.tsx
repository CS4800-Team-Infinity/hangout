import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Navbar } from "@/components/layout/Navbar"

const mockLogout = jest.fn()

const mockUseAuth: {
  login: jest.Mock,
  isLoading: boolean,
  user: { name: string; email: string } | null,
  isAuthenticated: boolean,
  register: jest.Mock,
  logout: jest.Mock
} = {
  login: jest.fn(),
  isLoading: false,
  user: { name: 'Test User', email: 'test@example.com' },
  isAuthenticated: true,
  register: jest.fn(),
  logout: mockLogout
}

jest.mock('@/contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth
}))

jest.mock('next/router', () => ({
  useRouter: jest.fn()
}))

describe('Navbar - Logout', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render logout button when user is authenticated', () => {
    render(<Navbar />)
    expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument()
  })

  it('should display welcome message with user name when authenticated', () => {
    render(<Navbar />)
    expect(screen.getByText(/welcome, Test User!/i)).toBeInTheDocument()
  })

  it('should call logout function when logout button is clicked', async () => {
    const user = userEvent.setup()
    render(<Navbar />)

    const logoutButton = screen.getByRole('button', { name: /logout/i })
    await user.click(logoutButton)

    expect(mockLogout).toHaveBeenCalledTimes(1)
  })

  it('should not render logout button when user is not authenticated', () => {
    mockUseAuth.isAuthenticated = false
    mockUseAuth.user = null

    render(<Navbar />)

    expect(screen.queryByRole('button', { name: /logout/i })).not.toBeInTheDocument()
    expect(screen.getByText(/login/i)).toBeInTheDocument()
  })
})
