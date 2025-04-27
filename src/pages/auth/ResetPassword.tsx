import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useSupabase } from '../../lib/supabase/SupabaseProvider';
import { PiggyBank, Mail, ArrowLeft } from 'lucide-react';

interface ResetFormValues {
  email: string;
}

export default function ResetPassword() {
  const { supabase } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetSuccess, setResetSuccess] = useState<boolean>(false);
  
  const { register, handleSubmit, formState: { errors } } = useForm<ResetFormValues>();
  
  const onSubmit = async (data: ResetFormValues) => {
    setIsLoading(true);
    setResetError(null);
    setResetSuccess(false);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: window.location.origin + '/login',
      });
      
      if (error) {
        throw error;
      }
      
      setResetSuccess(true);
    } catch (error: any) {
      setResetError(error.message || 'Failed to send reset email. Please try again.');
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
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          We'll send you an email with a link to reset your password
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-xl sm:px-10">
          {resetSuccess ? (
            <div className="text-center">
              <div className="rounded-full bg-success-100 p-3 mx-auto w-16 h-16 flex items-center justify-center">
                <Mail className="h-8 w-8 text-success-600" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Check your email</h3>
              <p className="mt-2 text-sm text-gray-600">
                We've sent you an email with a link to reset your password. Please check your inbox.
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
                  {errors.email && (
                    <p className="mt-1 text-sm text-error-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="btn btn-primary w-full py-3"
                  disabled={isLoading}
                >
                  {isLoading ? 'Sending...' : 'Send reset link'}
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