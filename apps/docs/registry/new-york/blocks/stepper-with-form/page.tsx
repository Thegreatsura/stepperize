import { StepperWithForm } from "@/registry/new-york/blocks/stepper-with-form/components/stepper-with-form";

export default async function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-2xl px-4">
        <StepperWithForm />
      </div>
    </div>
  );
}
