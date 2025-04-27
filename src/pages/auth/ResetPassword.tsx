import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { PiggyBank, Mail, ArrowLeft, LockKeyhole } from 'lucide-react';

interface ResetFormValues {
  email: string;
  password?: string;
  confirmPassword?: string;
}

export default function ResetPassword() {
  const { supabase } = useSupabase();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  
  // Get access token from location state (passed from App.tsx)
  const accessToken = location.state?.accessToken;
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<ResetFormValues>();
  const password = watch('password');
  
  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setResetError(null);
    setResetSuccess(false);
    
    try {
      if (accessToken) {
        // Update password
        const { error } = await supabase.auth.updateUser({
          password: data.password as string
        });

        if (error) throw error;
        
        setResetSuccess(true);
        setTimeout(() => {
          navigate('/login', {
            state: { message: 'Password has been reset successfully. Please sign in with your new password.' }
          });
        }, 2000);
      } else {
        // Send reset email
        const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        
        if (error) throw error;
        setResetSuccess(true);
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      setResetError(error.message || 'Failed to process request. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-primary-50 to-white py-12">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <PiggyBank className="h-12 w-12 text-primary-600" />
        </div>
        <h2 className="mt-4 text-center text-3xl font-bold tracking-tight text-gray-900">
          {accessToken ? 'Set New Password' : 'Reset your password'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {accessToken 
            ? 'Enter your new password below'
            : 'We'll send you an email with a link to reset your password'
          }
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {resetSuccess ? (
            <div className="text-center">
              <div className="rounded-full bg-success-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                <Mail className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                {accessToken ? 'Password Updated!' : 'Check your email'}
              </h3>
              <p className="mt-2 text-sm text-gray-600">
                {accessToken
                  ? 'Your password has been changed successfully.'
                  : 'We've sent you an email with a link to reset your password. Please check your inbox.'
                }
              </p>
              <div className="mt-6">
                <Link
                  to="/login"
                  className="btn btn-primary w-full py-3"
                >
                  Return to login
                </Link>
              </div>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
              {resetError && (
                <div className="rounded-md bg-error-50 p-4">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-error-800">Reset Error</h3>
                      <div className="mt-2 text-sm text-error-700">
                        <p>{resetError}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {accessToken ? (
                <>
                  <div>
                    <label htmlFor="password" className="label">
                      New Password
                    </label>
                    <div className="relative mt-1">
                      <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        id="password"
                        type="password"
                        className="input pl-10"
                        placeholder="••••••••"
                        {...register('password', { 
                          required: 'New password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters' }
                        })}
                      />
                    </div>
                    {errors.password && (
                      <p className="mt-1 text-sm text-error-600">{errors.password.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="label">
                      Confirm New Password
                    </label>
                    <div className="relative mt-1">
                      <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        id="confirmPassword"
                        type="password"
                        className="input pl-10"
                        placeholder="••••••••"
                        {...register('confirmPassword', { 
                          required: 'Please confirm your password',
                          validate: value => value === password || 'Passwords do not match'
                        })}
                      />
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-error-600">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                </>
              ) : (
                <div>
                  <label htmlFor="email" className="label">
                    Email address
                  </label>
                  <div className="relative mt-1">
                    <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      id="email"
                      type="email"
                      autoComplete="email"
                      className="input pl-10"
                      placeholder="you@example.com"
                      {...register('email', { 
                        required: 'Email is required',
                        pattern: {
                          value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                          message: 'Invalid email address',
                        }
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="btn btn-primary w-full py-3"
                  disabled={isLoading}
                >
                  {isLoading 
                    ? 'Processing...' 
                    : accessToken 
                      ? 'Update Password'
                      : 'Send reset link'
                  }
                </button>
              </div>
              
              <div className="text-center">
                <Link
                  to="/login"
                  className="text-sm font-medium text-primary-600 hover:text-primary-500 flex items-center justify-center"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to login
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
