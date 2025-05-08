import logo from "@/assets/logo.png"
import authcover from "@/assets/auth-cover.png"

import { LoginForm } from "@/components/login-form"

export default function AuthPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <img src={logo} alt="logo" className="size-4" />
            </div>
            Connect
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <LoginForm />
          </div>
        </div>
      </div>
      <div className="relative bg-muted h-full overflow-hidden lg:block">
      <img
        src={authcover}
        alt="cover"
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
    </div>
  )
}
