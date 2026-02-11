"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../schema";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import logo from "../../../public/logo.png";
import Image from "next/image";
import { handleLogin } from "@/lib/actions/auth-action";
import { toast } from "sonner";
import { setFlashToast } from "@/lib/toast/flash";

type DerivedRole = "citizen" | "authority" | "admin";

const ROLE_RULES = {
  adminEmails: ["admin@sajilofix.com"],
  authorityEmailDomains: ["sajilofix.gov.np"],
} as const;

function deriveRoleFromEmail(emailRaw: string): DerivedRole {
  const email = emailRaw.trim().toLowerCase();
  if (!email.includes("@")) return "citizen";

  if (ROLE_RULES.adminEmails.map((e) => e.toLowerCase()).includes(email)) return "admin";
  const domain = email.split("@")[1] ?? "";
  if (ROLE_RULES.authorityEmailDomains.map((d) => d.toLowerCase()).includes(domain)) return "authority";
  return "citizen";
}

type LoginMode = "user" | "citizen" | "authority" | "admin";

type Props = {
  mode?: LoginMode;
};

export default function LoginForm({ mode = "user" }: Props) {
  const router = useRouter();
  
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setApiError("");

    try {
      const derivedRole = deriveRoleFromEmail(data.email);

      // Optional portal restrictions. Core behavior is always email-derived.
      if (mode === "admin" && derivedRole !== "admin") {
        const msg = "This email is not detected as admin.";
        setApiError(msg);
        toast.error(msg);
        return;
      }
      if (mode === "authority" && derivedRole !== "authority") {
        const msg = "This email is not detected as authority.";
        setApiError(msg);
        toast.error(msg);
        return;
      }
      if (mode === "citizen" && derivedRole !== "citizen") {
        const msg = "This email is not detected as citizen.";
        setApiError(msg);
        toast.error(msg);
        return;
      }
      if (mode === "user" && derivedRole === "admin") {
        const msg = "Admin accounts must use the admin portal.";
        setApiError(msg);
        toast.error(msg);
        return;
      }

      const result = await handleLogin(data);
      if (!result.success) {
        const msg = result.message || "Login failed";
        setApiError(msg);
        toast.error(msg);
        return;
      }

      setFlashToast({ type: "success", message: "Logged in successfully" });

      router.push(
        derivedRole === "admin"
          ? "/admin"
          : derivedRole === "authority"
            ? "/authority"
            : "/citizen",
      );
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        const msg = message || "Login failed. Please try again.";
        setApiError(msg);
        toast.error(msg);
      } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8">
      {/* Back to Home */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-5 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Logo */}
      <div className="mb-5">
        <Image
          src={logo}
          alt="Sajilo Fix"
          width={120}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Welcome Text */}
      <div className="mb-6">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1.5">Welcome Back</h1>
        <p className="text-gray-600 text-sm sm:text-base">Sign in to continue making a difference</p>
      </div>

      {/* {mode === "user" && (
        <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-xs sm:text-sm text-gray-700">
            Citizen and Authority can login here. Admin uses the Admin portal.
          </p>
        </div>
      )} */}

      {/* Error Message */}
      {apiError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 mb-1.5"
          >
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
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        {/* Password Field */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-900 mb-1.5"
          >
            Password
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
              placeholder="••••••••"
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
          {errors.password && (
            <p className="mt-1 text-sm text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Remember Me & Forgot Password */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-green-500 focus:ring-green-500 border-gray-300 rounded"
            />
            <label
              htmlFor="remember-me"
              className="ml-2 block text-sm text-gray-700"
            >
              Remember me
            </label>
          </div>

          <div className="text-sm">
            <a
              href="#"
              className="font-medium text-red-500 hover:text-red-600 transition-colors"
            >
              Forgot password?
            </a>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </button>
      </form>

      {/* Sign Up Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Dont have an account?{" "}
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="font-medium text-blue-500 hover:text-blue-800 transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}