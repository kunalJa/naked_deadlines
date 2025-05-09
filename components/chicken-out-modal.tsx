"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

interface ChickenOutModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export function ChickenOutModal({ isOpen, onClose, onConfirm }: ChickenOutModalProps) {
  const [confirmed, setConfirmed] = useState(false)

  const handleConfirm = () => {
    onConfirm()
    setConfirmed(false) // Reset for next time
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-1 pb-2">
          <DialogTitle className="text-center text-xl font-bold text-yellow-500">🐔 BAWK BAWK BAWK! 🐔</DialogTitle>
          <DialogDescription className="text-center text-base">
            Are you REALLY going to chicken out right now?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
            <p className="font-bold text-center text-sm">Your photo is THIS CLOSE to being tweeted!</p>
            <div className="flex justify-center my-2">
              <div className="relative w-16 h-16 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-2xl">🙈</div>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-transparent to-background"
                  style={{ height: "60%" }}
                ></div>
              </div>
            </div>
            <p className="text-center italic text-xs">
              Its gonna cost you...
            </p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="confirm"
              checked={confirmed}
              onCheckedChange={(checked) => setConfirmed(!!checked)}
              className="mt-1"
            />
            <Label
              htmlFor="confirm"
              className="text-xs font-medium leading-tight peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Yes, I'm a chicken. Bawk bawk. 🐔 I can't finish this goal and accept eternal shame.
            </Label>
          </div>
        </div>

        <DialogFooter className="pt-2">
          <div className="flex flex-col sm:flex-row w-full gap-2 sm:justify-between">
            <Button type="button" variant="outline" onClick={onClose} className="sm:flex-1">
              I'll finish my goal! 💪
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!confirmed}
              onClick={handleConfirm}
              className="sm:flex-1"
            >
              I'm chickening out 🐔
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
