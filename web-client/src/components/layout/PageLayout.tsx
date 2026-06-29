import React from "react";
import { Link } from "react-router-dom";

interface PageLayoutProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  filterSlot?: React.ReactNode;
  subtitleStyles?: string;
  className?: string;
  children: React.ReactNode;
  breadcrumbs?: { label: string; to?: string }[];
}

export default function PageLayout({
  title,
  subtitle,
  actions,
  filterSlot,
  subtitleStyles = "",
  className = "",
  children,
  breadcrumbs,
}: PageLayoutProps) {
  return (
    <div className={`w-full min-h-full flex flex-col gap-6 ${className}`}>
      {/* Page Header (Title, Subtitle, Breadcrumbs, and Toolbar) */}
      {(breadcrumbs || title || subtitle || actions || filterSlot) && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between shrink-0">
          {/* Left: Breadcrumbs OR Title & Subtitle */}
          <div className="flex flex-col gap-1 min-w-0">
            {breadcrumbs ? (
              <div className="flex items-center gap-1 text-[13px] font-semibold select-none text-slate-500 font-secondary-sans">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <React.Fragment key={idx}>
                      {idx > 0 && (
                        <span className="text-slate-300 mx-1.5 font-normal text-xs">&gt;</span>
                      )}
                      {isLast ? (
                        <span className="text-primary font-bold">
                          {crumb.label}
                        </span>
                      ) : crumb.to ? (
                        <Link
                          to={crumb.to}
                          className="text-muted-foreground hover:text-slate-800 transition"
                        >
                          {crumb.label}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">
                          {crumb.label}
                        </span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            ) : (
              <>
                {title && (
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-950">
                    {title}
                  </h1>
                )}
                {subtitle && (
                  <p className={`text-xs md:text-sm text-muted-foreground ${subtitleStyles}`}>
                    {subtitle}
                  </p>
                )}
              </>
            )}
          </div>

          {/* Right: Toolbar controls (Filters, Action buttons) */}
          <div className="flex items-center gap-3 shrink-0 self-start sm:self-center">
            {filterSlot && <div className="flex items-center">{filterSlot}</div>}
            {actions && <div className="flex items-center">{actions}</div>}
          </div>
        </div>
      )}

      {/* Page Content Body */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
