"use client";

import { useTranslations } from "next-intl";

/**
 * I18nDemo component.
 *
 * Demonstrates next-intl integration by rendering translated strings
 * from multiple namespaces: Navigation, Error, Common, Status.
 *
 * Used to verify the i18n setup works correctly.
 */
export function I18nDemo() {
  const tNav = useTranslations("Navigation");
  const tError = useTranslations("Error");
  const tCommon = useTranslations("Common");
  const tStatus = useTranslations("Status");

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">I18n Demo</h1>

      {/* Navigation section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Navigation</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>{tNav("dashboard")}</li>
          <li>{tNav("wallets")}</li>
          <li>{tNav("transfer")}</li>
        </ul>
      </section>

      {/* Error section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Error</h2>
        <p>{tError("somethingWentWrong")}</p>
        <button type="button">{tError("retry")}</button>
      </section>

      {/* Common section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Common Actions</h2>
        <div className="space-x-2">
          <button type="button">{tCommon("cancel")}</button>
          <button type="button">{tCommon("confirm")}</button>
        </div>
      </section>

      {/* Status section */}
      <section>
        <h2 className="text-lg font-semibold mb-2">Status</h2>
        <div className="flex gap-2">
          <span>{tStatus("COMPLETED")}</span>
          <span>{tStatus("PENDING")}</span>
          <span>{tStatus("FAILED")}</span>
          <span>{tStatus("PROCESSING")}</span>
        </div>
      </section>
    </div>
  );
}
