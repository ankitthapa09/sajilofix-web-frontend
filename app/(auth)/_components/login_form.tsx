"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../schema";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import Link from "next/link";
import logo from "../../../public/logo.png";
import Image from "next/image";

type UserType = "citizen" | "admin";

export default function LoginForm() {
  const router = useRouter();
  const [userType, setUserType] = useState<UserType>("citizen");
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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
      // TODO: Replace with actual API call
      console.log("Login data:", { ...data, userType });
      
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      // Redirect to dashboard based on user type
      if (userType === "citizen") {
      router.push("/citizen");  // ← Goes to citizen dashboard
    } else {
      router.push("/admin");     // ← Goes to admin dashboard
    }
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        setApiError(message || "Login failed. Please try again.");
      } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md px-8">
      {/* Back to Home */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8 transition-colors"
      >
        <ArrowLeft size={20} />
        <span className="font-medium">Back to Home</span>
      </Link>

      {/* Logo */}
      <div className="mb-8">
        <Image
          src={logo}
          alt="Sajilo Fix"
          width={120}
          height={60}
          className="object-contain"
        />
      </div>

      {/* Welcome Text */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Welcome Back</h1>
        <p className="text-gray-600">Sign in to continue making a difference</p>
      </div>

      {/* User Type Toggle */}
      <div className="flex gap-3 mb-6">
        <button
          type="button"
          onClick={() => setUserType("citizen")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            userType === "citizen"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Citizen
        </button>
        <button
          type="button"
          onClick={() => setUserType("admin")}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            userType === "admin"
              ? "bg-blue-500 text-white shadow-md"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          Admin
        </button>
      </div>

      {/* Error Message */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-900 mb-2"
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
              className={`block w-full pl-10 pr-3 py-3 bg-gray-50 border ${
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
            className="block text-sm font-medium text-gray-900 mb-2"
          >
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
            <input
              {...register("password")}
              type="password"
              id="password"
              className={`block w-full pl-10 pr-3 py-3 bg-gray-50 border ${
                errors.password ? "border-red-300" : "border-transparent"
              } rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all`}
              placeholder="••••••••"
            />
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
          className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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