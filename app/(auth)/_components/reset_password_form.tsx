"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import logo from "../../../public/logo.png";
import { resetPasswordSchema, type ResetPasswordFormData } from "../schema";
import { handleResetPassword } from "@/lib/actions/auth-action";

export default function ResetPasswordForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [apiError, setApiError] = useState("");
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

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
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setIsSubmitted(false);
    setApiError("");

    if (!token) {
      const msg = "Reset token is missing";
      setApiError(msg);
      toast.error(msg);
      setIsLoading(false);
      return;
    }

    try {
      const result = await handleResetPassword(token, data);

      if (!result.success) {
        const msg = result.message || "Unable to reset password";
        setApiError(msg);
        toast.error(msg);
        return;
      }

      setIsSubmitted(true);
      reset({ password: "", confirmPassword: "" });
      toast.success(result.message || "Password reset complete");
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Unable to reset password";
      setApiError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8">
      <Link
        href="/login"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-5 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Login</span>
      </Link>

      <div className="mb-5">
        <Image src={logo} alt="Sajilo Fix" width={120} height={60} className="object-contain" />
      </div>

      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1.5">Reset Password</h1>
        <p className="text-gray-600 text-sm sm:text-base">
          Create a new password to regain access to your account.
        </p>
      </div>

      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      {isSubmitted && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
          <p className="text-sm text-green-700">Your password has been updated. You can now sign in.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-1.5">
            New Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("password")}
              type={showPassword ? "text" : "password"}
              id="password"
              className={`block w-full pl-10 pr-10 py-2.5 bg-gray-50 border ${
                errors.password ? "border-red-300" : "border-transparent"
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all`}
              placeholder="New password"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-1.5">
            Confirm Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("confirmPassword")}
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className={`block w-full pl-10 pr-10 py-2.5 bg-gray-50 border ${
                errors.confirmPassword ? "border-red-300" : "border-transparent"
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all`}
              placeholder="Confirm password"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Updating..." : "Reset Password"}
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
    </div>
  );
}
