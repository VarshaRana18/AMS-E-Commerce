import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Button, Input, Spinner } from "@heroui/react";
import DefaultLayout from "@/layouts/default";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">(
    token ? "loading" : "error"
  );
  const [message, setMessage] = useState(
    token ? "" : "No verification token found in URL."
  );

  // Resend form state
  const [resendEmail, setResendEmail] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendFeedback, setResendFeedback] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing. Please check your verification link.");
      return;
    }

    let isMounted = true;

    const performVerification = async () => {
      try {
        const response = await fetch("/api/auth/verify-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (!isMounted) return;

        if (response.ok && data.success) {
          setStatus("success");
          setMessage(data.message || "Your email address has been verified successfully!");
        } else {
          setStatus("error");
          setMessage(data.message || "The verification link is invalid or has expired.");
        }
      } catch (err: any) {
        if (!isMounted) return;
        setStatus("error");
        setMessage("Network error connecting to verification server. Please try again.");
      }
    };

    performVerification();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResendLoading(true);
    setResendFeedback(null);

    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resendEmail }),
      });

      const data = await response.json();
      setResendFeedback(data.message || "If an account exists, a verification email has been sent.");
    } catch {
      setResendFeedback("Failed to request verification link. Please check your network.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <DefaultLayout>
      <div className="flex min-h-[70vh] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-2xl border border-default-200/50 bg-content1/80 p-8 shadow-xl backdrop-blur-md">
          {status === "loading" && (
            <div className="flex flex-col items-center text-center">
              <Spinner size="lg" color="primary" />
              <h2 className="mt-6 text-xl font-bold text-foreground">
                Verifying Your Email...
              </h2>
              <p className="mt-2 text-sm text-default-500">
                Please wait while we validate your cryptographic verification token.
              </p>
            </div>
          )}

          {status === "success" && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-success-50 text-success">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-foreground">
                Email Verified!
              </h2>
              <p className="mt-2 text-sm text-default-500">{message}</p>
              <div className="mt-8 flex w-full flex-col gap-3">
                <Button
                  as={Link}
                  to="/"
                  color="primary"
                  className="w-full font-semibold"
                >
                  Continue to Store
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="flex flex-col items-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-danger-50 text-danger">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-foreground">
                Verification Failed
              </h2>
              <p className="mt-2 text-sm text-default-500">{message}</p>

              <div className="mt-8 w-full border-t border-default-200/50 pt-6 text-left">
                <h3 className="text-sm font-semibold text-foreground">
                  Need a new verification link?
                </h3>
                <form onSubmit={handleResend} className="mt-3 flex flex-col gap-3">
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="you@example.com"
                    size="sm"
                    value={resendEmail}
                    onChange={(e) => setResendEmail(e.target.value)}
                    required
                  />
                  <Button
                    type="submit"
                    color="secondary"
                    size="sm"
                    isLoading={resendLoading}
                    className="font-medium"
                  >
                    Resend Verification Email
                  </Button>
                </form>

                {resendFeedback && (
                  <p className="mt-3 text-xs text-secondary-500">
                    {resendFeedback}
                  </p>
                )}
              </div>

              <div className="mt-6 w-full">
                <Button
                  as={Link}
                  to="/"
                  variant="flat"
                  className="w-full text-xs text-default-600"
                >
                  Return to Home
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DefaultLayout>
  );
}
