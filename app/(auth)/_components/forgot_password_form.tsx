"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import logo from "../../../public/logo.png";
import { forgotPasswordSchema, type ForgotPasswordFormData } from "../schema";
import { handleForgotPassword } from "@/lib/actions/auth-action";

export default function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!isSubmitted) return;
    const timeoutId = window.setTimeout(() => setIsSubmitted(false), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [isSubmitted]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setIsSubmitted(false);
    setApiError("");

    try {
      const result = await handleForgotPassword(data);

      if (!result.success) {
        const msg = result.message || "Unable to send reset link";
        setApiError(msg);
        toast.error(msg);
        return;
      }

      setIsSubmitted(true);
      reset({ email: "" });
      toast.success(result.message || "If the email exists, a reset link has been sent");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unable to send reset link";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}


  return (
    <div className="w-full max-w-md px-8">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-5 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Login</span>
      </Link>

      <div className="mb-5 flex items-center gap-3">
        <Image src={logo} alt="Sajilo Fix" width={120} height={60} className="object-contain" />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1.5">Forgot Password?</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          No worries. Enter your email address and we will send you a link to reset your password.
        </p>
      </div>

      {isSubmitted && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <p className="text-sm text-green-700">
            If the email exists, a reset link will be sent shortly.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("email")}
              type="email"
              id="email"
              className={`block w-full pl-10 pr-3 py-2.5 bg-gray-50 border ${
                errors.email ? "border-red-300" : "border-transparent"
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all`}
              placeholder="you@example.com"
            />
          </div>
          {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
          <p className="mt-2 text-xs text-gray-500">
            Enter the email address associated with your account.
          </p>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-green-600 hover:text-green-700 transition-colors">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm font-semibold text-blue-700 mb-1">Need Help?</p>
        <p className="text-xs text-blue-700">
          If you are having trouble resetting your password, contact our support team at
          {" "}
          <span className="font-medium">support@sajilofix.com</span>.
        </p>
      </div>
    </div>
  );
}
