type BookingNavigationProps = {
  currentStep: number;
  onNext: () => void | Promise<void>;
  onPrevious: () => void;
  isSubmitting?: boolean;
};

function BookingNavigation({
  currentStep,
  onNext,
  onPrevious,
  isSubmitting = false,
}: BookingNavigationProps) {
  const isLastStep = currentStep === 4;
  const isFirstStep = currentStep === 1;

  return (
    <div className="border-t bg-background z-50 border-border/15 px-4 py-4 pb-[max(1rem,env(safe-area-inset-bottom))] flex items-center justify-between fixed bottom-0 left-0 w-full min-h-[75px]">
      <button
        type="button"
        onClick={onPrevious}
        disabled={isFirstStep || isSubmitting}
        className={`bg-transparent border border-border cursor-pointer touch-manipulation text-text-primary font-medium px-8 py-3 rounded-full disabled:cursor-not-allowed disabled:border-text-secondary/30 disabled:text-text-secondary/80 ${
          isFirstStep ? "hidden" : "block"
        }`}>
        Back
      </button>

      <button
        type="button"
        onClick={onNext}
        disabled={isSubmitting}
        className={`bg-text-primary cursor-pointer touch-manipulation text-background font-medium px-8 py-3 rounded-full hover:bg-text-primary/90 disabled:cursor-not-allowed disabled:bg-text-secondary/30 disabled:text-text-secondary/80 ml-auto`}>
        {isSubmitting
          ? "Booking..."
          : isLastStep
          ? "Book appointment"
          : "Continue"}
      </button>
    </div>
  );
}

export default BookingNavigation;
