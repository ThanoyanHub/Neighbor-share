import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Toast from '../components/Toast';

export default function Register() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const { register: signup } = useAuth();
  const nav = useNavigate();
  const [err, setErr] = useState('');

  async function submit(data) {
    try {
      await signup(data);
      nav('/dashboard');
    } catch (e) {
      setErr(e.response?.data?.detail || 'Registration failed');
    }
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form
        onSubmit={handleSubmit(submit)}
        className="card grid gap-4 p-6 md:grid-cols-2"
      >
        <h1 className="text-2xl font-black text-primary md:col-span-2">
          Create your account
        </h1>

        <input
          className="input"
          placeholder="Full name"
          {...register('full_name', {
            required: true,
            minLength: 2,
          })}
        />

        <input
          className="input"
          placeholder="Email"
          type="email"
          {...register('email', {
            required: true,
          })}
        />

        <input
          className="input"
          placeholder="Phone number"
          {...register('phone_number', {
            required: true,
            pattern: /^\+?[0-9\-\s()]{7,20}$/,
          })}
        />

        <input
          className="input"
          placeholder="Password"
          type="password"
          {...register('password', {
            required: true,
            minLength: 8,
          })}
        />

        <textarea
          className="input md:col-span-2"
          placeholder="Address"
          {...register('address', {
            required: true,
            minLength: 5,
          })}
        />

        <button
          disabled={isSubmitting}
          className="btn-primary md:col-span-2"
        >
          Register
        </button>

        {Object.keys(errors).length > 0 && (
          <p className="text-sm text-red-600 md:col-span-2">
            Please check the required fields.
          </p>
        )}
      </form>

      <Toast
        message={err}
        type="error"
        onClose={() => setErr('')}
      />
    </div>
  );
}