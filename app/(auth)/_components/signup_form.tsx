"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  signupStep1Schema,
  signupStep2Schema,
  signupStep3Schema,
  type SignupStep1Data,
  type SignupStep2Data,
  type SignupStep3Data,
} from "../schema";
import { ArrowLeft, ArrowRight, User, Mail, Phone, Lock, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo.png";

type SignupData = SignupStep1Data & SignupStep2Data & SignupStep3Data;

export default function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<Partial<SignupData>>({
    role: "citizen",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Step 1 form
  const step1Form = useForm<SignupStep1Data>({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: {
      role: "citizen",
      fullName: signupData.fullName || "",
      email: signupData.email || "",
      phone: signupData.phone || "",
    },
  });

  // Step 2 form
  const step2Form = useForm<SignupStep2Data>({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: {
      wardNumber: signupData.wardNumber || "",
      municipality: signupData.municipality || "",
    },
  });

  // Step 3 form
  const step3Form = useForm<SignupStep3Data>({
    resolver: zodResolver(signupStep3Schema),
    defaultValues: {
      password: "",
      confirmPassword: "",
      agreeToTerms: false,
    },
  });

  const onStep1Submit = (data: SignupStep1Data) => {
    setSignupData({ ...signupData, ...data });
    setCurrentStep(2);
  };

  const onStep2Submit = (data: SignupStep2Data) => {
    setSignupData({ ...signupData, ...data });
    setCurrentStep(3);
  };

  const onStep3Submit = async (data: SignupStep3Data) => {
    setIsLoading(true);
    const finalData = { ...signupData, ...data };

    try {
      // TODO: Replace with actual API call
      console.log("Signup data:", finalData);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      router.push("/login");
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Signup failed:", error.message);
      } else {
        console.error("Signup failed:", error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
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

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Account</h1>
        <p className="text-gray-600">Join the community making a difference</p>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center mb-8 gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold ${
            currentStep >= 1
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {currentStep > 1 ? <Check size={20} /> : "1"}
        </div>
        <div className="w-16 h-0.5 bg-gray-300"></div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold ${
            currentStep >= 2
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          {currentStep > 2 ? <Check size={20} /> : "2"}
        </div>
        <div className="w-16 h-0.5 bg-gray-300"></div>
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center font-semibold ${
            currentStep >= 3
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-500"
          }`}
        >
          3
        </div>
      </div>

      {/* Step 1: Basic Info */}
      {currentStep === 1 && (
        <form onSubmit={step1Form.handleSubmit(onStep1Submit)} className="space-y-5">
          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-3">
              I am a
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label
                className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  step1Form.watch("role") === "citizen"
                    ? "border-blue-600 bg-blue-600/20"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  {...step1Form.register("role")}
                  type="radio"
                  value="citizen"
                  className="sr-only"
                />
                <User
                  className={`mb-2 ${
                    step1Form.watch("role") === "citizen"
                      ? "text-blue-500"
                      : "text-gray-400"
                  }`}
                  size={32}
                />
                <p className="font-semibold text-gray-900">Citizen</p>
                <p className="text-sm text-gray-500">Report & track issues</p>
              </label>

              <label
                className={`relative flex flex-col items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  step1Form.watch("role") === "authority"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 hover:border-gray-400"
                }`}
              >
                <input
                  {...step1Form.register("role")}
                  type="radio"
                  value="authority"
                  className="sr-only"
                />
                <User
                  className={`mb-2 ${
                    step1Form.watch("role") === "authority"
                      ? "text-blue-600"
                      : "text-gray-400"
                  }`}
                  size={32}
                />
                <p className="font-semibold text-gray-900">Authority</p>
                <p className="text-sm text-gray-500">Manage & resolve</p>
              </label>
            </div>
            {step1Form.formState.errors.role && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.role.message}
              </p>
            )}
          </div>

          {/* Full Name */}
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-900 mb-2">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...step1Form.register("fullName")}
                type="text"
                id="fullName"
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="Ram"
              />
            </div>
            {step1Form.formState.errors.fullName && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...step1Form.register("email")}
                type="email"
                id="email"
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="r@gmail.com"
              />
            </div>
            {step1Form.formState.errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...step1Form.register("phone")}
                type="tel"
                id="phone"
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="9999999999"
              />
            </div>
            {step1Form.formState.errors.phone && (
              <p className="mt-1 text-sm text-red-600">
                {step1Form.formState.errors.phone.message}
              </p>
            )}
          </div>

          {/* Continue Button */}
          <button
            type="submit"
            className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
          >
            Continue
            <ArrowRight size={20} />
          </button>
        </form>
      )}

      {/* Step 2: Location */}
      {currentStep === 2 && (
        <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-5">
          {/* Ward Number */}
          <div>
            <label htmlFor="wardNumber" className="block text-sm font-medium text-gray-900 mb-2">
              Ward Number
            </label>
            <input
              {...step2Form.register("wardNumber")}
              type="text"
              id="wardNumber"
              className="block w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="Ward 16"
            />
            {step2Form.formState.errors.wardNumber && (
              <p className="mt-1 text-sm text-red-600">
                {step2Form.formState.errors.wardNumber.message}
              </p>
            )}
          </div>

          {/* Municipality */}
          <div>
            <label htmlFor="municipality" className="block text-sm font-medium text-gray-900 mb-2">
              Municipality/City
            </label>
            <input
              {...step2Form.register("municipality")}
              type="text"
              id="municipality"
              className="block w-full px-4 py-3 bg-gray-50 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
              placeholder="Kathmandu"
            />
            {step2Form.formState.errors.municipality && (
              <p className="mt-1 text-sm text-red-600">
                {step2Form.formState.errors.municipality.message}
              </p>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              This helps us route your reports to the right authorities and show you relevant issues in your area.
            </p>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border-2 border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="submit"
              className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all"
            >
              Continue
              <ArrowRight size={20} />
            </button>
          </div>
        </form>
      )}

      {/* Step 3: Password */}
      {currentStep === 3 && (
        <form onSubmit={step3Form.handleSubmit(onStep3Submit)} className="space-y-5">
          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-900 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...step3Form.register("password")}
                type="password"
                id="password"
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Must be at least 8 characters with a mix of letters and numbers
            </p>
            {step3Form.formState.errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {step3Form.formState.errors.password.message}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-900 mb-2">
              Confirm Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                {...step3Form.register("confirmPassword")}
                type="password"
                id="confirmPassword"
                className="block w-full pl-10 pr-3 py-3 bg-gray-50 border border-transparent rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent focus:bg-white transition-all"
                placeholder="••••••••"
              />
            </div>
            {step3Form.formState.errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-600">
                {step3Form.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>

          {/* Terms Agreement */}
          <div className="flex items-start">
            <input
              {...step3Form.register("agreeToTerms")}
              type="checkbox"
              id="agreeToTerms"
              className="h-4 w-4 text-blue-600 focus:ring-blue-600 border-gray-300 rounded mt-1"
            />
            <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-700">
              I agree to the{" "}
              <a href="#" className="text-red-600 hover:text-red-700">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-red-600 hover:text-red-700">
                Privacy Policy
              </a>
            </label>
          </div>
          {step3Form.formState.errors.agreeToTerms && (
            <p className="text-sm text-red-600">
              {step3Form.formState.errors.agreeToTerms.message}
            </p>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border-2 border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </div>
        </form>
      )}

      {/* Sign In Link */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-red-500 hover:text-red-700 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
