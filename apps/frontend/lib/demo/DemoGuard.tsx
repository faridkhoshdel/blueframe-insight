"use client";
import { useDemo } from "./DemoContext";

export function useDemoGuard() {
  const { isDemo, canEdit, canDelete, canExport } = useDemo();

  const guardAction = (action: string, callback: () => void) => {
    if (isDemo) {
      alert(
        "🎭 حالت نمایشی\n\n" +
        "این عملیات در نسخه دمو غیرفعال است.\n\n" +
        "برای دسترسی کامل:\n" +
        "📧 sales@blueframe.ir\n" +
        "📞 021-XXXXXXXX"
      );
      return;
    }
    callback();
  };

  const filterButtons = () => {
    if (!isDemo) return;
    setTimeout(() => {
      const dangerousSelectors = [
        'button[title*="حذف"]',
        'button[title*="delete"]',
        'button[title*="Delete"]',
        '[data-action="delete"]',
        '[data-action="export"]',
      ];
      dangerousSelectors.forEach((sel) => {
        document.querySelectorAll(sel).forEach((el) => {
          (el as HTMLElement).style.opacity = "0.3";
          (el as HTMLElement).style.pointerEvents = "none";
          (el as HTMLElement).title = "در حالت دمو غیرفعال است";
        });
      });
    }, 500);
  };

  return {
    isDemo,
    canEdit,
    canDelete,
    canExport,
    guardAction,
    filterButtons,
  };
}
