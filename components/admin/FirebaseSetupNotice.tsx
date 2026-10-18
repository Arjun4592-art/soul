import { AlertTriangle } from "lucide-react";

export default function FirebaseSetupNotice() {
  return (
    <div className="flex items-start gap-3 rounded-none border border-amber-200 bg-amber-50 px-5 py-4 text-amber-900">
      <AlertTriangle className="mt-0.5 h-4.5 w-4.5 shrink-0" />
      <div className="text-sm leading-relaxed">
        <p className="font-medium">Firebase is not connected yet.</p>
        <p className="mt-0.5 text-amber-800">
          Add your Firebase project keys to the <code className="rounded bg-amber-100 px-1.5 py-0.5">.env.local</code> file
          (see <code className="rounded bg-amber-100 px-1.5 py-0.5">.env.local.example</code>{" "}
          ), then restart the server. Login and data won&apos;t work until then.
        </p>
      </div>
    </div>
  );
}
