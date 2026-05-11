import AccountSettingsClient from "@/components/AccountSettingsClient";

export default function AccountSettingsPage({ user }: { user: any }) {
  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  return (
    <div className="min-h-screen bg-white">
      <div className="p-4 flex items-center">
        <div className="w-8 h-8 bg-neutral-500 rounded-md flex items-center justify-center text-white">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
          </svg>
        </div>
      </div>

      <div className="relative h-48 bg-gradient-to-r from-[#dcfce7] via-[#bbf7d0] to-[#86efac]">
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
          <div className="w-24 h-24 rounded-full bg-primary-500 border-4 border-white shadow-elevated flex items-center justify-center text-white text-3xl font-bold">
            {userInitials}
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto pt-16 pb-20 px-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-neutral-900 mb-1">Account settings</h1>
        <p className="text-sm text-neutral-500 mb-10">Manage your account</p>
        <AccountSettingsClient user={user} />
      </div>
    </div>
  );
}
