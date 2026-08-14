"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Lock, Shield, KeyRound, ArrowRight, Info } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiClientError } from "@/lib/api/client";

const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "admin",
      password: "adminpassword123",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      await login(data);
      toast.success("Successfully authenticated to AWS Console");
    } catch (err: any) {
      if (err instanceof ApiClientError) {
        setErrorMessage(err.message);
      } else if (err?.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage("Authentication failed. Please check your credentials.");
      }
      toast.error("Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const fillDefaultCredentials = () => {
    setValue("username", "admin");
    setValue("password", "adminpassword123");
  };

  return (
    <div className="min-h-screen bg-[#eaeded] flex flex-col justify-between">
      {/* Top Bar */}
      <div className="h-12 bg-[#232f3e] flex items-center px-6 text-white shadow-xs">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xs bg-[#ff9900] text-[#232f3e] font-black text-xs">
            AWS
          </div>
          <span className="text-xs font-bold tracking-tight">
            Amazon Web Services Sign-In
          </span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white border border-[#d5dbdb] rounded-xs shadow-md p-8">
          {/* Service Title */}
          <div className="text-center mb-6">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#ebf3fb] text-[#0073bb] mb-3">
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="text-lg font-bold text-[#16191f]">
              AWS Route 53 Console Sign-In
            </h1>
            <p className="text-xs text-[#545b64] mt-1">
              Sign in to manage DNS hosted zones and traffic routing
            </p>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="mb-4 p-3 bg-[#fdf2f2] border-l-4 border-[#d13212] rounded-xs text-xs text-[#d13212] font-medium">
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username or account alias"
              required
              placeholder="e.g. admin"
              error={errors.username?.message}
              {...register("username")}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••••••"
              error={errors.password?.message}
              {...register("password")}
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full justify-center mt-2"
            >
              Sign In to Console
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </form>

          {/* Mock Credentials Hint */}
          <div className="mt-6 pt-4 border-t border-[#eaeded] bg-[#fafafa] -mx-8 -mb-8 p-6 rounded-b-xs">
            <div className="flex items-start gap-2.5 text-xs text-[#545b64]">
              <Info className="h-4 w-4 text-[#0073bb] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-[#16191f]">
                  Default Mock Credentials:
                </p>
                <div className="font-mono text-[11px] text-[#16191f] bg-white p-2 rounded-xs border border-[#eaeded]">
                  <p>Username: <strong>admin</strong></p>
                  <p>Password: <strong>adminpassword123</strong></p>
                </div>
                <button
                  type="button"
                  onClick={fillDefaultCredentials}
                  className="text-[11px] text-[#0073bb] hover:underline font-medium cursor-pointer"
                >
                  Auto-fill mock credentials
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] text-[#545b64] border-t border-[#d5dbdb] bg-[#fafafa]">
        <p>© 2026, Amazon Web Services, Inc. or its affiliates. All rights reserved.</p>
      </footer>
    </div>
  );
}
