"use client";
import styles from "@/styles/admin.module.css";
import React, { useState, useEffect } from "react";
import { useMessages } from "@/contexts/MessagesContext";
import Link from "next/link";
import useAuth from "@/hooks/UseAuth";
import { auth } from "@/configuration/firebase-config";
import { signOut } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import ArrowDropDownSharpIcon from "@mui/icons-material/ArrowDropDownSharp";
import ArrowDropUpSharpIcon from "@mui/icons-material/ArrowDropUpSharp";
import MenuOpenRoundedIcon from "@mui/icons-material/MenuOpenRounded";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import MessageOutlinedIcon from "@mui/icons-material/MessageOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import { DescriptionOutlined } from "@mui/icons-material";
import MailOutlineOutlinedIcon from "@mui/icons-material/MailOutlineOutlined";
import EventOutlinedIcon from "@mui/icons-material/EventOutlined";
import MenuBookOutlinedIcon from "@mui/icons-material/MenuBookOutlined";
import EmojiEventsOutlinedIcon from "@mui/icons-material/EmojiEventsOutlined";
import Loading from "@/components/Loading";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import SmartToyOutlinedIcon from "@mui/icons-material/SmartToyOutlined";

export default function AdminAccount({ children }) {
  const locale = useLocale();
  const router = useRouter();
  const { unreadMessages } = useMessages();
  const pathName = usePathname();
  const { loading, user, isAdmin } = useAuth();
  const [showContentDropdown, setShowContentDropdown] = useState(false);
  const [showAchievers, setShowAchievers] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const toggleContentDropdown = () => {
    setShowContentDropdown(!showContentDropdown);
  };

  const toggleAchieversDropdown = () => {
    setShowAchievers(!showAchievers);
  };

  const t = useTranslations("layout");

  const badgeCounts = {
    unreadMessages,
  };

  const navItems = [
    {
      key: "articles",
      url: "/admin/articles",
      icon: <ArticleOutlinedIcon />,
    },
    {
      key: "messages",
      url: "/admin/messages",
      icon: <MessageOutlinedIcon />,
      badgeKey: "unreadMessages",
    },
    {
      key: "caseStudies",
      url: "/admin/case-studies",
      icon: <MenuBookOutlinedIcon />,
    },
    {
      key: "events",
      url: "/admin/events",
      icon: <EventOutlinedIcon />,
    },
    {
      key: "newsletter",
      url: "/admin/newsletter",
      icon: <MailOutlineOutlinedIcon/>,
    },
    {
      key: "admins",
      url: "/admin/admins",
      icon: <SupervisorAccountIcon />,
    },
    {
      key: "metadata",
      url: "/admin/seo-metadata",
      icon: <ManageSearchIcon />,
    },
    {
      key: "aiChat",
      url: "/admin/ai-chat",
      icon: <SmartToyOutlinedIcon />,
    },
  ];

  const contentSubPages = [
    {
      key: "contactInfo",
      url: "/admin/content/contact-info",
    },
    {
      key: "partners",
      url: "/admin/content/partners",
    },
    {
      key: "technologies",
      url: "/admin/content/technologies",
    },
    {
      key: "faq",
      url: "/admin/content/faq",
    },
    {
      key: "terms",
      url: "/admin/content/terms-and-conditions",
    },
    {
      key: "privacy",
      url: "/admin/content/privacy-policy",
    },
    {
      key: "about",
      url: "/admin/content/about-us",
    },
    {
      key: "contact",
      url: "/admin/content/contact-us",
    },
    {
      key: "portfolio",
      url: "/admin/content/portfolio",
    },
    {
      key: "services",
      url: "/admin/content/services",
    },
    {
      key: "home",
      url: "/admin/content/home",
    },
    {
      key: "newsletter",
      url: "/admin/content/newsletter",
    },
    {
      key: "caseStudies",
      url: "/admin/content/case-studies",
    },
    {
      key: "achievers",
      url: "/admin/content/achievers",
    },
  ];

  const achieversSubPages = [
    {
      key: "quarterly",
      url: "/admin/achievers/quarterly",
    },
    {
      key: "monthly",
      url: "/admin/achievers/monthly",
    },
  ];

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      router.push(`/login`);
    }
  }, [loading, user, isAdmin]);

  if (loading) {
    return <Loading />;
  }

  return user && isAdmin ? (
    <>
      <div
        className="d-flex align-items-center justify-content-between px-4 py-3"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          backgroundColor: "#fff",
        }}
      >
        <img
          src="/logo.png"
          alt="logo"
          style={{ width: "120px" }}
          className="d-none d-lg-flex"
        />

        <MenuOpenRoundedIcon
          style={{ width: "56px", height: "56px", cursor: "pointer" }}
          data-bs-toggle="offcanvas"
          data-bs-target="#offcanvasMenu"
          className={`${styles.menuIcon} d-lg-none`}
        />

        <div className="d-flex align-items-center">
          <LanguageSwitcher locale={locale} className="w-100" />
        </div>
      </div>
      <div className="d-flex bg-light">
        <div
          className={`offcanvas-lg offcanvas-${
            locale === "ar" ? "end" : "start"
          }`}
          tabIndex="-1"
          id="offcanvasMenu"
          aria-labelledby="offcanvasMenuLabel"
        >
          <div className="offcanvas-header">
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="offcanvas"
              data-bs-target="#offcanvasMenu"
              aria-label="Close"
            ></button>
          </div>
          <div className="offcanvas-body">
            <div
              className="navigation bg-white p-3"
              style={{
                position: "fixed",
                top: "76.84px",
                bottom: 0,
                overflowY: "auto",
                width: "260px",
              }}
            >
              {navItems.map(({ key, url, icon, badgeKey }) => {
                const badgeCount = badgeKey ? badgeCounts[badgeKey] : 0;

                return (
                  <div
                    key={key}
                    data-bs-dismiss="offcanvas"
                    data-bs-target="#offcanvasMenu"
                    style={{ position: "relative" }}
                  >
                    <Link
                      className={`${styles["account-nav-item"]} mb-1 mb-xl-2 ${
                        pathName === url ? styles["active-route"] : ""
                      }`}
                      href={url}
                    >
                      {icon}
                      <h5
                        className={`m-0 ${locale === "en" ? "ms-3" : "me-3"}`}
                      >
                        {t(key)}
                      </h5>

                      {badgeCount > 0 && (
                        <div
                          className="badge rounded-pill bg-danger"
                          style={{
                            position: "absolute",
                            top: 17,
                            right: locale === "en" ? 0 : "",
                            left: locale === "ar" ? 0 : "",
                          }}
                        >
                          {badgeCount}
                        </div>
                      )}
                    </Link>
                  </div>
                );
              })}
              <div
                className={`${styles["account-nav-item"]} mb-1 mb-xl-2 cursor-pointer`}
                onClick={toggleAchieversDropdown}
              >
                <EmojiEventsOutlinedIcon
                  className={locale === "en" ? "me-3" : "ms-3"}
                />
                <h5 className="m-0 w-100">{t("achievers")}</h5>
                {showAchievers === false ? (
                  <ArrowDropDownSharpIcon />
                ) : (
                  <ArrowDropUpSharpIcon />
                )}
              </div>
              <div>
                {showAchievers && (
                  <div
                    style={{
                      paddingLeft: locale === "en" ? "40px" : "",
                      paddingRight: locale === "ar" ? "40px" : "",
                    }}
                  >
                    {achieversSubPages.map(({ key, url }) => (
                      <div
                        key={key}
                        data-bs-dismiss="offcanvas"
                        data-bs-target="#offcanvasMenu"
                      >
                        <Link
                          className={`${
                            styles["account-nav-item"]
                          } mb-1 mb-xl-2 ${
                            pathName === url ? styles["active-route"] : ""
                          }`}
                          href={url}
                          style={{ fontWeight: "500" }}
                        >
                          {t(key)}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`${styles["account-nav-item"]} mb-1 mb-xl-2 cursor-pointer`}
                onClick={toggleContentDropdown}
              >
                <DescriptionOutlined
                  className={locale === "en" ? "me-3" : "ms-3"}
                />
                <h5 className="m-0 w-100">{t("content")}</h5>
                {showContentDropdown === false ? (
                  <ArrowDropDownSharpIcon />
                ) : (
                  <ArrowDropUpSharpIcon />
                )}
              </div>
              <div>
                {showContentDropdown && (
                  <div
                    style={{
                      paddingLeft: locale === "en" ? "40px" : "",
                      paddingRight: locale === "ar" ? "40px" : "",
                    }}
                  >
                    {contentSubPages.map(({ key, url }) => (
                      <div
                        key={key}
                        data-bs-dismiss="offcanvas"
                        data-bs-target="#offcanvasMenu"
                      >
                        <Link
                          className={`${
                            styles["account-nav-item"]
                          } mb-1 mb-xl-2 ${
                            pathName === url ? styles["active-route"] : ""
                          }`}
                          href={url}
                          style={{ fontWeight: "500" }}
                        >
                          {t(key)}
                        </Link>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div
                className={`${styles["sign-out"]} ${styles["account-nav-item"]} mt-5 cursor-pointer`}
                onClick={handleLogout}
                data-bs-dismiss="offcanvas"
                data-bs-target="#offcanvasMenu"
              >
                <LogoutOutlinedIcon />
                <h5 className={`m-0 ${locale === "en" ? "ms-3" : "me-3"}`}>
                  {t("signOut")}
                </h5>
              </div>
            </div>
          </div>
        </div>
        <div className={`p-3 ${styles["account-child-container"]}`}>
          {children}
        </div>
      </div>
    </>
  ) : (
    <Loading />
  );
}
