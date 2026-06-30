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

        <div>
          <input
            className={`input w-full ${errors.full_name ? 'border-red-500' : ''}`}
            placeholder="Full name"
            {...register('full_name', {
              required: "Full name is required",
              minLength: { value: 2, message: "Minimum 2 characters required" },
            })}
          />
          {errors.full_name && <p className="text-xs text-red-600 mt-1">{errors.full_name.message}</p>}
        </div>

        <div>
          <input
            className={`input w-full ${errors.email ? 'border-red-500' : ''}`}
            placeholder="Email"
            type="email"
            {...register('email', {
              required: "Email is required",
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address"
              }
            })}
          />
          {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input
            className={`input w-full ${errors.phone_number ? 'border-red-500' : ''}`}
            placeholder="Phone number"
            {...register('phone_number', {
              required: "Phone number is required",
              pattern: {
                value: /^\+?[0-9\-\s()]{7,20}$/,
                message: "Invalid phone number format"
              }
            })}
          />
          {errors.phone_number && <p className="text-xs text-red-600 mt-1">{errors.phone_number.message}</p>}
        </div>

        <div>
          <input
            className={`input w-full ${errors.password ? 'border-red-500' : ''}`}
            placeholder="Password"
            type="password"
            {...register('password', {
              required: "Password is required",
              minLength: { value: 8, message: "Minimum 8 characters required" },
              pattern: {
                value: /^(?=.*[A-Za-z])(?=.*\d).+$/,
                message: "Password must contain at least one letter and one number"
              }
            })}
          />
          {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password.message}</p>}
        </div>

        <div className="md:col-span-2">
          <textarea
            className={`input w-full ${errors.address ? 'border-red-500' : ''}`}
            placeholder="Address"
            {...register('address', {
              required: "Address is required",
              minLength: { value: 5, message: "Minimum 5 characters required" },
            })}
          />
          {errors.address && <p className="text-xs text-red-600 mt-1">{errors.address.message}</p>}
        </div>

        <button
          disabled={isSubmitting}
          className="btn-primary md:col-span-2"
        >
          Register
        </button>
      </form>

      <Toast
        message={err}
        type="error"
        onClose={() => setErr('')}
      />
    </div>
  );
}