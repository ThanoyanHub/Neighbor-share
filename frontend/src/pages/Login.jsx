import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const { login } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');

  async function submit(data) {
    try {
      await login(data);
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.detail || 'Login failed');
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <form
        onSubmit={handleSubmit(submit)}
        className="card space-y-4 p-6"
      >
        <h1 className="text-2xl font-black text-primary">
          Welcome back
        </h1>

        <div>
          <label>Email</label>
          <input
            className="input"
            type="email"
            {...register('email', { required: true })}
          />

          {errors.email && (
            <p className="text-sm text-red-600">
              Email is required.
            </p>
          )}
        </div>

        <div>
          <label>Password</label>
          <input
            className="input"
            type="password"
            {...register('password', { required: true })}
          />
        </div>

        <button
          disabled={isSubmitting}
          className="btn-primary w-full"
        >
          Login
        </button>

        <p className="text-sm">
          New here?{' '}
          <Link
            className="font-bold text-primary"
            to="/register"
          >
            Create an account
          </Link>
        </p>
      </form>

      <Toast
        message={err}
        type="error"
        onClose={() => setErr('')}
      />
    </div>
  );
}