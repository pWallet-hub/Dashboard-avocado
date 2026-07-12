import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from './Register';
import { register } from '../../services/authService';

vi.mock('../../services/authService', () => ({
  register: vi.fn(),
}));

function renderRegister() {
  return render(
    <MemoryRouter initialEntries={['/register']}>
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard/:role" element={<div>Dashboard loaded</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('Register page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('defaults to the Farmer role and shows farm-related fields', () => {
    renderRegister();
    expect(screen.getByLabelText(/Avocado Type/i)).toBeInTheDocument();
  });

  it('switches visible fields when a different role is selected', () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: 'Shop Manager' }));
    expect(screen.getByLabelText(/Shop Name/i)).toBeInTheDocument();
    expect(screen.queryByLabelText(/Avocado Type/i)).not.toBeInTheDocument();
  });

  it('blocks submission and shows an error when required fields are missing', async () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    expect(await screen.findByRole('alert')).toHaveTextContent(/required/i);
    expect(register).not.toHaveBeenCalled();
  });

  it('submits the farmer form and navigates to the dashboard on success', async () => {
    register.mockResolvedValue({
      token: 'tok',
      refreshToken: 'refresh',
      user: { id: '1', email: 'farmer@example.com', role: 'farmer', full_name: 'Test Farmer' },
    });

    renderRegister();

    fireEvent.change(screen.getByLabelText(/Full Name/i), { target: { value: 'Test Farmer' } });
    fireEvent.change(screen.getByLabelText(/^Email/i), { target: { value: 'farmer@example.com' } });
    fireEvent.change(screen.getByLabelText(/Phone/i), { target: { value: '+250788000000' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'TestPass123!' } });
    fireEvent.change(screen.getByLabelText(/Gender/i), { target: { value: 'Male' } });
    fireEvent.change(screen.getByLabelText(/^Province/i), { target: { value: 'Kigali' } });
    fireEvent.change(screen.getByLabelText(/^District/i), { target: { value: 'Gasabo' } });
    fireEvent.change(screen.getByLabelText(/Farm Size/i), { target: { value: '2.5' } });
    fireEvent.change(screen.getByLabelText(/Avocado Type/i), { target: { value: 'Hass' } });

    fireEvent.click(screen.getByRole('button', { name: 'Create account' }));

    await waitFor(() => expect(register).toHaveBeenCalledTimes(1));
    expect(await screen.findByText('Dashboard loaded')).toBeInTheDocument();
    expect(localStorage.getItem('token')).toBe('tok');
    expect(localStorage.getItem('role')).toBe('farmer');
  });
});
