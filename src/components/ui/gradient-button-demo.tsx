import { GradientButton } from "@/components/ui/gradient-button"

function GradientButtonDemo() {
  return (
    <div className="flex gap-8 items-center justify-center min-h-[200px]">
      <GradientButton>Get Started</GradientButton>
      <GradientButton variant="variant">Get Started</GradientButton>
    </div>
  )
}

export { GradientButtonDemo }
