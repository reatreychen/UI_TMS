export function PortalFooter() {
  return (
    <footer className="flex flex-col items-center justify-between gap-stack-md border-t border-outline-variant bg-surface-container-high px-container-margin py-stack-lg text-label-md text-on-surface-variant md:flex-row dark:border-outline dark:bg-on-tertiary-fixed-variant dark:text-surface-container-lowest">
      <div className="flex flex-col items-center gap-base md:items-start">
        <span className="text-headline-sm font-bold text-primary dark:text-primary-fixed">
          Kinetic Enterprise
        </span>
        <p className="opacity-80">
          © 2024 Kinetic Enterprise Support. All rights reserved.
        </p>
      </div>
      <div className="flex gap-gutter">
        <a href="#" className="decoration-primary hover:underline hover:opacity-80">
          Privacy Policy
        </a>
        <a href="#" className="decoration-primary hover:underline hover:opacity-80">
          Terms of Service
        </a>
        <a href="#" className="decoration-primary hover:underline hover:opacity-80">
          Contact Us
        </a>
        <a
          href="#"
          className="font-bold text-primary decoration-primary hover:underline hover:opacity-80 dark:text-primary-fixed"
        >
          System Status
        </a>
      </div>
    </footer>
  );
}
