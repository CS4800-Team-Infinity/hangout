import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-center gap-2">
            <h1 className="text-xl font-bold">welcome to hangout!</h1>
            <div className="text-center text-sm">
              already have an account?{" "}
              <a href="/login" className="underline underline-offset-4 hover:text-zinc-300 transition-all duration-200">
                log in
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-6">
            <div className="grid gap-3">
              <Label htmlFor="email">email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="username">username</Label>
              <Input
                id="username"
                type="text"
                placeholder="johndoe"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="name">name</Label>
              <Input
                id="name"
                type="text"
                placeholder="john doe"
                required
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">password</Label>
              <Input
                id="password"
                type="password"
                placeholder="password"
                required
              />
            </div>
            <Button type="submit" className="w-full hover:cursor-pointer" style={{ boxShadow: '0 0 16px rgba(226, 205, 205, 0.8)' }}>
              signup
            </Button>
          </div>
        </div>
      </form>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        by clicking continue, you agree to our <a href="#">terms of service</a>{" "}
        and <a href="#">privacy policy</a>.
      </div>
    </div>
  )
}
