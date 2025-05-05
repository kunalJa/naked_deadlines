"use client"

import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, Users } from "lucide-react"

interface FriendEmailFormProps {
  email: string
  setEmail: (email: string) => void
}

export function FriendEmailForm({ email, setEmail }: FriendEmailFormProps) {
  return (
    <div className="bg-secondary/20 p-4 rounded-lg">
      <div className="flex items-center gap-2">
        <Label htmlFor="friendEmail" className="text-lg font-bold flex items-center gap-2">
          <Users className="h-5 w-5 text-secondary" />
          Friend's Email
        </Label>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <HelpCircle className="h-4 w-4 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              <p>
                Your friend will receive an email with a link to confirm your goal completion. Only they can stop the
                timer - you can't do it yourself! Choose wisely! 😉
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Input
        id="friendEmail"
        type="email"
        placeholder="friend@example.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mt-2"
      />
      <p className="text-sm text-muted-foreground mt-2 italic">
        Choose a friend who won't let you down! They're your only hope! 🦸‍♂️
      </p>
    </div>
  )
}
