import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export function LoginForm({ className, ...props }: React.ComponentProps<"form">) {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();  // <-- added for navigation
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await signIn(email, password);
      navigate("/");  // navigate to home after successful sign-in
      toast.success("Successfully signed in!: " + email);
    } catch (err: any) {
      if (err.status === 400 || err.message.includes("Invalid login credentials")) {
        // If user not found, try sign-up
        toast("User not found, attempting to sign up...");
        try {
          await signUp(email, password);
          navigate("/");  // navigate to home after successful sign-up
          toast("Successfully signed up and signed in!: " + email);
        } catch (signupErr: any) {
          setError(signupErr.message);
          toast("Sign-up failed: " + signupErr.message);
        }
      } else {
        setError(err.message);
        toast("Sign-in failed: " + err.message);
      }
    } finally {
      setLoading(false);
      toast("Loading complete");
    }
  };

  

  return (
    <form
      className={cn("flex flex-col gap-6", className)}
      onSubmit={handleSubmit}
      {...props}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">Sign in to your account</h1>
        <p className="text-muted-foreground text-sm text-balance">
          Enter your email below to sign in or create an account
        </p>
      </div>
      <div className="grid gap-6">
        <div className="grid gap-3">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="grid gap-3">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot your password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Sign In"}
        </Button>
        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        
      </div>
    </form>
  );
}