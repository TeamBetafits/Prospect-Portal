import Link from "next/link";

interface Props {
  children?: React.ReactNode;
  message: string;
  onClose?: () => void;
  title: string;
  tone: "success" | "error" | "info";
}

const TONE_STYLES = {
  success: {
    wrapper: "bg-green-50 border-green-200",
    icon: "text-green-600",
    title: "text-green-900",
    message: "text-green-700",
    path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  error: {
    wrapper: "bg-red-50 border-red-200",
    icon: "text-red-600",
    title: "text-red-900",
    message: "text-red-700",
    path: "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  },
  info: {
    wrapper: "bg-blue-50 border-blue-200",
    icon: "text-blue-600",
    title: "text-blue-900",
    message: "text-blue-700",
    path: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z",
  },
};

export default function FormNotice({ children, message, onClose, title, tone }: Props) {
  const styles = TONE_STYLES[tone];

  return (
    <div className={`mb-6 p-4 border rounded-md flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${styles.wrapper}`}>
      <div className="flex-shrink-0 mt-0.5">
        <svg className={`w-5 h-5 ${styles.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={styles.path} />
        </svg>
      </div>
      <div className="flex-1">
        <h3 className={`text-sm font-bold mb-1 ${styles.title}`}>{title}</h3>
        <p className={`text-sm ${styles.message}`}>{message}</p>
        {children}
      </div>
      {onClose && (
        <button onClick={onClose} className="flex-shrink-0 text-red-400 hover:text-red-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

export function ReturnToDashboardButton() {
  return (
    <Link href="/">
      <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
        Return to Dashboard
      </button>
    </Link>
  );
}
