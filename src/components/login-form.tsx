import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      await login(email, password, remember);
      navigate("/admin/dashboard");
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError("Invalid credentials");
      } else if (err.response?.status === 403) {
        setError("Your account is inactive. Please contact the administrator.");
      } else {
        setError("Login failed. Please try again.");
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="px-10 py-6">
        <CardHeader>
          <CardTitle className="text-center text-xl font-semibold">Log in to your account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email" className="font-light">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password" className="font-light">Password</FieldLabel>
                <Input
                  id="password"
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && <p className="text-sm text-red-600">{error}</p>}
              </Field>
              <Field>
                <div className="flex items-center gap-1">
                  <Checkbox id="remember" onCheckedChange={(checked) => setRemember(checked === true)} />
                  <Label htmlFor="remember" className="select-none font-light ">Remember me</Label>
                </div>
              </Field>
              <Field>
                <Button type="submit" className="bg-red-800" disabled={isLoading}>Log in</Button>
                <FieldDescription className="text-center">
                  Forgot Password? <a href="/forgot-password" className="text-red-800">Reset it</a>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
