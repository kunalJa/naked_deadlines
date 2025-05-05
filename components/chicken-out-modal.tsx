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
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-yellow-500">🐔 BAWK BAWK BAWK! 🐔</DialogTitle>
          <DialogDescription className="text-center text-lg">
            Are you REALLY going to chicken out right now?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-yellow-100 dark:bg-yellow-900/30 p-4 rounded-lg border-2 border-yellow-300 dark:border-yellow-700">
            <p className="font-bold text-center">Your photo is THIS CLOSE to being tweeted!</p>
            <div className="flex justify-center my-4">
              <div className="relative w-24 h-24 bg-muted rounded-full overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-4xl">🙈</div>
                <div
                  className="absolute inset-0 bg-gradient-to-t from-transparent to-background"
                  style={{ height: "60%" }}
                ></div>
              </div>
            </div>
            <p className="text-center italic">You could just... you know... actually FINISH your goal instead? 💪</p>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="confirm" checked={confirmed} onCheckedChange={(checked) => setConfirmed(!!checked)} />
            <Label
              htmlFor="confirm"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Yes, I'm a chicken. Bawk bawk. 🐔 I give up on my goals and accept eternal shame.
            </Label>
          </div>
        </div>
        <DialogFooter className="sm:justify-between gap-2">
          <Button type="button" variant="outline" onClick={onClose}>
            Wait, I'll finish my goal! 💪
          </Button>
          <Button type="button" variant="destructive" disabled={!confirmed} onClick={handleConfirm}>
            Yes, I'm chickening out 🐔
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
