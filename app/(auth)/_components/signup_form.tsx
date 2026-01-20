"use client";

import { useEffect, useRef, useState } from "react";
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
import { ArrowLeft, ArrowRight, User, Mail, Phone, Lock, Check, ChevronDown } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import logo from "../../../public/logo.png";
import { handleRegister } from "@/lib/actions/auth-action";

type SignupData = SignupStep1Data & SignupStep2Data & SignupStep3Data;

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

const COUNTRY_CODES = [
  { value: "+977", label: "Nepal (+977)" },
] as const;

const DISTRICTS = ["Kathmandu", "Bhaktapur", "Lalitpur"] as const;

const KATHMANDU_MUNICIPALITIES = [
  "Kathmandu Metropolitan City",
  "Kirtipur",
  "Tokha",
  "Budhanilkantha",
  "Tarakeshwar",
] as const;

const BHAKTAPUR_MUNICIPALITIES = [
  "Bhaktapur",
  "Madhyapur Thimi",
  "Suryabinayak",
  "Changunarayan",
] as const;

const LALITPUR_MUNICIPALITIES = [
  "Lalitpur Metropolitan City",
  "Godawari",
  "Mahalaxmi",
  "Konjyosom",
  "Bagmati",
] as const;

const MUNICIPALITIES_BY_DISTRICT: Record<string, readonly string[]> = {
  Kathmandu: KATHMANDU_MUNICIPALITIES,
  Bhaktapur: BHAKTAPUR_MUNICIPALITIES,
  Lalitpur: LALITPUR_MUNICIPALITIES,
} as const;

const FALLBACK_MUNICIPALITIES = [
  "Kathmandu Metropolitan City",
  "Bhaktapur",
  "Lalitpur Metropolitan City",
] as const;

function wardRange(maxInclusive: number) {
  return Array.from({ length: maxInclusive }, (_, i) => String(i + 1));
}

const WARD_COUNT_BY_MUNICIPALITY: Record<string, number> = {
  // Kathmandu
  "Kathmandu Metropolitan City": 12,
  Kirtipur: 10,
  Tokha: 10,
  Budhanilkantha: 11,
  Tarakeshwar: 11,

  // Bhaktapur
  Bhaktapur: 10,
  "Madhyapur Thimi": 11,
  Suryabinayak: 12,
  Changunarayan: 10,

  // Lalitpur
  "Lalitpur Metropolitan City": 12,
  Godawari: 11,
  Mahalaxmi: 10,
  Konjyosom: 10,
  Bagmati: 10,
};

function getMunicipalityOptions(district: string) {
  if (!district) return FALLBACK_MUNICIPALITIES;
  return MUNICIPALITIES_BY_DISTRICT[district] ?? FALLBACK_MUNICIPALITIES;
}

function getWardOptions(_district: string, municipality: string) {
  if (!municipality) return [] as string[];

  const wardCount = WARD_COUNT_BY_MUNICIPALITY[municipality] ?? 12;
  return wardRange(Math.min(Math.max(wardCount, 10), 12));
}

export default function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<Partial<SignupData>>({
    phoneCountryCode: "+977",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string>("");

  // Step 1 form
  const step1Form = useForm<SignupStep1Data>({
    resolver: zodResolver(signupStep1Schema),
    defaultValues: {
      fullName: signupData.fullName || "",
      email: signupData.email || "",
      phoneCountryCode: signupData.phoneCountryCode || "+977",
      phoneNationalNumber: signupData.phoneNationalNumber || "",
    },
  });

  // Step 2 form
  const step2Form = useForm<SignupStep2Data>({
    resolver: zodResolver(signupStep2Schema),
    defaultValues: {
      wardNumber: signupData.wardNumber || "",
      municipality: signupData.municipality || "",
      district: signupData.district || "",
      tole: signupData.tole || "",
    },
  });

  const watchedDistrict = step2Form.watch("district") ?? "";
  const watchedMunicipality = step2Form.watch("municipality") ?? "";
  const municipalityOptions = getMunicipalityOptions(watchedDistrict);
  const wardOptions = getWardOptions(watchedDistrict, watchedMunicipality);

  const prevDistrictRef = useRef<string>(watchedDistrict);
  const prevMunicipalityRef = useRef<string>(watchedMunicipality);

  useEffect(() => {
    if (prevDistrictRef.current !== watchedDistrict) {
      step2Form.setValue("municipality", "", { shouldValidate: true });
      step2Form.setValue("wardNumber", "", { shouldValidate: true });
      prevDistrictRef.current = watchedDistrict;
    }
  }, [step2Form, watchedDistrict]);

  useEffect(() => {
    if (prevMunicipalityRef.current !== watchedMunicipality) {
      step2Form.setValue("wardNumber", "", { shouldValidate: true });
      prevMunicipalityRef.current = watchedMunicipality;
    }
  }, [step2Form, watchedMunicipality]);

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
    setApiError("");
    const derivedRole = deriveRoleFromEmail(data.email);
    if (derivedRole !== "citizen") {
      setApiError(
        derivedRole === "authority"
          ? "Authority accounts cannot self-register. Please contact an admin."
          : "Admin accounts cannot self-register from here."
      );
      return;
    }
    setSignupData({ ...signupData, ...data });
    setCurrentStep(2);
  };

  const onStep2Submit = (data: SignupStep2Data) => {
    setApiError("");
    setSignupData({ ...signupData, ...data });
    setCurrentStep(3);
  };

  const onStep3Submit = async (data: SignupStep3Data) => {
    setIsLoading(true);
    setApiError("");
    const finalData = { ...signupData, ...data };

    try {
      const derivedRole = deriveRoleFromEmail(String(finalData.email ?? ""));
      if (derivedRole !== "citizen") {
        setApiError("Only citizens can self-register. Authority accounts are created by admin.");
        return;
      }

      const result = await handleRegister(finalData as SignupData);
      if (!result.success) {
        setApiError(result.message || "Registration failed");
        return;
      }

      router.push("/login");
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      setApiError(message || "Registration failed");
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

      {/* Error Message */}
      {apiError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{apiError}</p>
        </div>
      )}

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
          {/* Role (email-derived) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-700">
              Role is derived from your email (citizen-only self registration).
            </p>
            <p className="text-sm font-semibold text-gray-900 mt-1">
              Detected role: {deriveRoleFromEmail(step1Form.watch("email") || "")}
            </p>
            <p className="text-xs text-gray-600 mt-1">
              Authority accounts are created by admin. Admin email: admin@sajilofix.com
            </p>
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
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-1">
                <label className="block text-xs font-medium text-gray-700 mb-1">Country code</label>
                <div className="relative">
                  <select
                    {...step1Form.register("phoneCountryCode")}
                    id="phoneCountryCode"
                    className="block w-full h-12 appearance-none px-4 pr-10 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  >
                    {COUNTRY_CODES.map((c) => (
                      <option key={c.value} value={c.value}>
                        {c.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    size={18}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                  />
                </div>
                {step1Form.formState.errors.phoneCountryCode && (
                  <p className="mt-1 text-xs text-red-600">
                    {step1Form.formState.errors.phoneCountryCode.message}
                  </p>
                )}
                <div className="h-4" />
              </div>

              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    {...step1Form.register("phoneNationalNumber")}
                    type="tel"
                    inputMode="numeric"
                    id="phone"
                    className="block w-full h-12 pl-10 pr-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="10-digit number"
                  />
                </div>
                {step1Form.formState.errors.phoneNationalNumber && (
                  <p className="mt-1 text-xs text-red-600">
                    {step1Form.formState.errors.phoneNationalNumber.message}
                  </p>
                )}
                <div className="h-4" />
              </div>
            </div>
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
        <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-gray-800 font-medium">Location details</p>
            <p className="text-sm text-gray-700 mt-1">
              We use this to route your reports to the right authorities.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* District */}
            <div>
              <label htmlFor="district" className="block text-sm font-medium text-gray-900 mb-2">
                District
              </label>
              <div className="relative">
                <select
                  {...step2Form.register("district")}
                  id="district"
                  className="block w-full h-12 appearance-none px-4 pr-10 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                >
                  <option value="">Select district (optional)</option>
                  {DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {step2Form.formState.errors.district && (
                <p className="mt-1 text-sm text-red-600">
                  {step2Form.formState.errors.district.message}
                </p>
              )}
              <div className="h-5" />
            </div>

            {/* Municipality */}
            <div>
              <label htmlFor="municipality" className="block text-sm font-medium text-gray-900 mb-2">
                Municipality/City
              </label>
              <div className="relative">
                <select
                  {...step2Form.register("municipality")}
                  id="municipality"
                  disabled={municipalityOptions.length === 0}
                  className="block w-full h-12 appearance-none px-4 pr-10 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-60"
                >
                  <option value="">
                    {watchedDistrict === "Kathmandu"
                      ? "Select municipality (Kathmandu)"
                      : "Select municipality/city"}
                  </option>
                  {municipalityOptions.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {step2Form.formState.errors.municipality && (
                <p className="mt-1 text-sm text-red-600">
                  {step2Form.formState.errors.municipality.message}
                </p>
              )}
              {watchedDistrict === "Kathmandu" && (
                <p className="mt-1 text-xs text-gray-600">
                  Selecting Kathmandu filters municipalities automatically.
                </p>
              )}
              <div className="h-5" />
            </div>

            {/* Ward Number */}
            <div>
              <label htmlFor="wardNumber" className="block text-sm font-medium text-gray-900 mb-2">
                Ward Number
              </label>
              <div className="relative">
                <select
                  {...step2Form.register("wardNumber")}
                  id="wardNumber"
                  disabled={!watchedMunicipality}
                  className="block w-full h-12 appearance-none px-4 pr-10 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all disabled:opacity-60"
                >
                  <option value="">{watchedMunicipality ? "Select ward" : "Select municipality first"}</option>
                  {wardOptions.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={18}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                />
              </div>
              {step2Form.formState.errors.wardNumber && (
                <p className="mt-1 text-sm text-red-600">
                  {step2Form.formState.errors.wardNumber.message}
                </p>
              )}
              <div className="h-5" />
            </div>

            {/* Tole */}
            <div>
              <label htmlFor="tole" className="block text-sm font-medium text-gray-900 mb-2">
                Tole (optional)
              </label>
              <input
                {...step2Form.register("tole")}
                type="text"
                id="tole"
                className="block w-full h-12 px-4 bg-white border border-gray-200 rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="e.g., New Baneshwor"
              />
              {step2Form.formState.errors.tole && (
                <p className="mt-1 text-sm text-red-600">
                  {step2Form.formState.errors.tole.message}
                </p>
              )}
              <div className="h-5" />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleBack}
              className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-gray-300 rounded-lg text-base font-semibold text-gray-700 hover:bg-gray-50 transition-all"
            >
              <ArrowLeft size={20} />
              Back
            </button>
            <button
              type="submit"
              className="flex-1 flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
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
