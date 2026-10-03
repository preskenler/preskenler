'use client';

import { useTranslations } from 'next-intl';
import {
  RiUserLine,
  RiLockPasswordLine,
  RiMailSettingsLine,
  RiHistoryLine,
  RiDeleteBinLine,
} from '@remixicon/react';

import { AccountInfo } from '@/components/account/account-info';
import { ChangeEmailForm } from '@/components/auth/change-email-form';
import { ChangePasswordForm } from '@/components/auth/change-password-form';
import { DeleteAccountForm } from '@/components/auth/delete-account-form';
import { SessionList } from '@/components/auth/session-list';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from '@/components/ui/sidebar';

const accountSections = [
  { key: 'info', icon: RiUserLine },
  { key: 'password', icon: RiLockPasswordLine },
  { key: 'email', icon: RiMailSettingsLine },
  { key: 'sessions', icon: RiHistoryLine },
  { key: 'delete', icon: RiDeleteBinLine },
] as const;

export type AccountSection = (typeof accountSections)[number]['key'];

/** Narrows an untrusted value (e.g. a `?account=` search param) to a section. */
export function isAccountSection(value: string): value is AccountSection {
  return accountSections.some((section) => section.key === value);
}

export type AccountDialogUser = {
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
};

/**
 * Account management rendered as a `sidebar-13` settings dialog: a section
 * sidebar on desktop, a section switcher on mobile, and the active section on
 * the right. Controlled by the caller so the sidebar and user menu can both
 * open it, and so `?account=<section>` deep links land on the right pane.
 */
export function AccountDialog({
  open,
  onOpenChange,
  section,
  onSectionChange,
  user,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: AccountSection;
  onSectionChange: (section: AccountSection) => void;
  user: AccountDialogUser;
}) {
  const t = useTranslations('Dashboard.accountDialog');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden p-0 md:max-h-[500px] md:max-w-[700px] lg:max-w-[800px]">
        <DialogTitle className="sr-only">{t('title')}</DialogTitle>
        <DialogDescription className="sr-only">
          {t('description')}
        </DialogDescription>
        <SidebarProvider className="items-start">
          <Sidebar collapsible="none" className="hidden md:flex">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {accountSections.map((item) => {
                      const Icon = item.icon;

                      return (
                        <SidebarMenuItem key={item.key}>
                          <SidebarMenuButton
                            isActive={section === item.key}
                            onClick={() => onSectionChange(item.key)}
                          >
                            <Icon aria-hidden="true" />
                            <span>{t(`sections.${item.key}`)}</span>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>
          </Sidebar>
          <main className="flex h-[480px] flex-1 flex-col overflow-hidden">
            <header className="flex shrink-0 flex-col gap-2 p-4">
              <Breadcrumb className="hidden md:block">
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <span>{t('title')}</span>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage>{t(`sections.${section}`)}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>

              <nav
                aria-label={t('title')}
                className="flex flex-wrap gap-2 md:hidden"
              >
                {accountSections.map((item) => (
                  <Button
                    key={item.key}
                    type="button"
                    size="sm"
                    variant={section === item.key ? 'secondary' : 'ghost'}
                    aria-current={section === item.key ? 'page' : undefined}
                    onClick={() => onSectionChange(item.key)}
                  >
                    {t(`sections.${item.key}`)}
                  </Button>
                ))}
              </nav>
            </header>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4 pt-0">
              {section === 'info' ? <AccountInfo user={user} /> : null}
              {section === 'password' ? (
                <ChangePasswordForm onBack={() => onSectionChange('info')} />
              ) : null}
              {section === 'email' ? (
                <ChangeEmailForm
                  currentEmail={user.email}
                  onBack={() => onSectionChange('info')}
                />
              ) : null}
              {section === 'sessions' ? <SessionList /> : null}
              {section === 'delete' ? <DeleteAccountForm /> : null}
            </div>
          </main>
        </SidebarProvider>
      </DialogContent>
    </Dialog>
  );
}
