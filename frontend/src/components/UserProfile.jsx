import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { User, Mail, Phone, MapPin, Save, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Toast from './Toast';

const PHONE_PATTERN = /^\+?[0-9\-\s()]{7,20}$/;

export default function UserProfile() {
  const { user, setUser } = useAuth();
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      full_name: user?.full_name || '',
      email: user?.email || '',
      phone_number: user?.phone_number || '',
      address: user?.address || ''
    }
  });


  useEffect(() => {
    if (user) {
      reset({
        full_name: user.full_name,
        email: user.email,
        phone_number: user.phone_number,
        address: user.address
      });
    }
  }, [user, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setMsg('');
    setErr('');
    try {
      
      const payload = {
        full_name: data.full_name,
        phone_number: data.phone_number,
        address: data.address
      };
      
      const response = await api.put('/auth/me', payload);
      
      
      setUser(response.data);
      setMsg('Profile updated successfully.');
    } catch (e) {
      setErr(e.response?.data?.detail || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-4">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5 text-stone-400" /> Full Name
          </label>
          <input
            className={`input ${errors.full_name ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="John Doe"
            {...register('full_name', { required: 'Full name is required.', minLength: { value: 2, message: 'Name must be at least 2 characters.' } })}
          />
          {errors.full_name && (
            <p className="text-xs text-red-500 font-medium">{errors.full_name.message}</p>
          )}
        </div>

        
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-stone-400" /> Email Address
          </label>
          <input
            className="input bg-stone-100 border-stone-200 text-stone-500 cursor-not-allowed"
            type="email"
            disabled
            title="Email cannot be changed"
            {...register('email')}
          />
          <p className="text-[10px] text-stone-400 font-medium">Email address is used for login and cannot be changed.</p>
        </div>

        
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
            <Phone className="w-3.5 h-3.5 text-stone-400" /> Phone Number
          </label>
          <input
            className={`input ${errors.phone_number ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="+1 234 567 8900"
            {...register('phone_number', { 
              required: 'Phone number is required.',
              pattern: { value: PHONE_PATTERN, message: 'Please enter a valid phone number.' }
            })}
          />
          {errors.phone_number && (
            <p className="text-xs text-red-500 font-medium">{errors.phone_number.message}</p>
          )}
        </div>

        
        <div className="space-y-1">
          <label className="text-xs font-bold text-stone-600 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400" /> Address
          </label>
          <textarea
            rows="3"
            className={`input ${errors.address ? 'border-red-500 focus:border-red-500' : ''}`}
            placeholder="123 Main St, City, Country"
            {...register('address', { 
              required: 'Address is required.',
              minLength: { value: 5, message: 'Address must be at least 5 characters.' }
            })}
          />
          {errors.address && (
            <p className="text-xs text-red-500 font-medium">{errors.address.message}</p>
          )}
        </div>

        
        <button
          type="submit"
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 flex items-center justify-center gap-2 font-bold transition shadow-soft"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" /> Updating...
            </>
          ) : (
            <>
              <Save className="w-4 h-4" /> Save Profile
            </>
          )}
        </button>
      </form>

      <Toast message={msg || err} type={err ? 'error' : 'success'} onClose={() => { setMsg(''); setErr(''); }} />
    </div>
  );
}
