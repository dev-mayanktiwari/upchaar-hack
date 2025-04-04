"use client";

import type React from "react";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Shield,
  Calendar,
  Pill,
  MessageSquare,
  ArrowRight,
} from "lucide-react";

export function LandingPage() {
  const router = useRouter();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-4 lg:px-6 h-16 flex items-center justify-between border-b">
        <div className="flex items-center gap-2 font-bold text-xl text-primary">
          <Heart className="h-6 w-6 text-rose-500" />
          <span>Upchaar</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/auth/login">
            <Button variant="ghost" size="sm">
              Log in
            </Button>
          </Link>
          <Link href="/auth/signup">
            <Button size="sm">Sign up</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-b from-white to-slate-50 dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Your Health, Our Priority
              </h1>
              <p className="max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Manage your healthcare journey with our comprehensive dashboard.
                Book appointments, track medications, and get personalized
                medical advice.
              </p>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/auth/signup">
                  <Button size="lg" className="gap-1.5">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="#features">
                  <Button size="lg" variant="outline">
                    Learn More
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex justify-center">
              <img
                src="/image.png"
                alt="Healthcare Dashboard"
                className="rounded-lg object-cover aspect-video"
                width={500}
                height={400}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Comprehensive Healthcare Management
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Our platform offers a range of features designed to simplify
                your healthcare experience.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <FeatureCard
              icon={<Calendar className="h-10 w-10 text-primary" />}
              title="Appointment Booking"
              description="Schedule appointments with your healthcare providers with just a few clicks."
            />
            <FeatureCard
              icon={<Pill className="h-10 w-10 text-primary" />}
              title="Medication Management"
              description="Keep track of your medications and get alerts for potential drug interactions."
            />
            <FeatureCard
              icon={<MessageSquare className="h-10 w-10 text-primary" />}
              title="MedAI Assistant"
              description="Get instant answers to your medical questions from our AI-powered assistant."
            />
            <FeatureCard
              icon={<Shield className="h-10 w-10 text-primary" />}
              title="Secure & Private"
              description="Your health data is encrypted and protected with the highest security standards."
            />
            <FeatureCard
              icon={<Heart className="h-10 w-10 text-rose-500" />}
              title="Health Tracking"
              description="Monitor your health metrics and track your progress over time."
            />
            <FeatureCard
              icon={<ArrowRight className="h-10 w-10 text-primary" />}
              title="Seamless Experience"
              description="Enjoy a user-friendly interface designed for simplicity and efficiency."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-slate-50 dark:bg-gray-900">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Ready to Take Control of Your Health?
              </h2>
              <p className="max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-400">
                Join thousands of users who are already managing their
                healthcare journey with our platform.
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/auth/signup">
                <Button size="lg" className="gap-1.5">
                  Sign Up Now
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  Log In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 border-t">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-center justify-center gap-4 md:flex-row md:justify-between">
            <div className="flex items-center gap-2 font-bold text-xl">
              <Heart className="h-6 w-6 text-rose-500" />
              <span>Upchaar</span>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              © 2025 Upchaar. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="#"
                className="text-sm text-gray-500 hover:underline dark:text-gray-400"
              >
                Privacy Policy
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:underline dark:text-gray-400"
              >
                Terms of Service
              </Link>
              <Link
                href="#"
                className="text-sm text-gray-500 hover:underline dark:text-gray-400"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center text-center p-6 space-y-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 rounded-full bg-slate-100 dark:bg-gray-800">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}
