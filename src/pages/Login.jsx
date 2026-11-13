import React, { useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, Mail, Lock, Loader2, MessageCircle, Smartphone } from "lucide-react";
import AuthLayout from "@/components/AuthLayout";
import { safeReturnTo } from "@/lib/authReturnTo";
import { useLang } from "@/lib/i18n";

export default function Login() {
  const [method, setMethod] = useState("phone");
  const [showEmailLogin, setShowEmailLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useLang();
  // Post-login destination (e.g. the MCP OAuth consent page sends users here
  // with returnTo so the grant flow can resume). Same-origin paths only.
  const returnTo = safeReturnTo();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await base44.auth.loginViaEmailPassword(email, password);
      window.location.href = returnTo;
    } catch (err) {
      setError(err.message || t("邮箱或密码不正确", "Invalid email or password"));
    } finally {
      setLoading(false);
    }
  };

  const handleWechat = () => {
    base44.auth.loginWithProvider("wechat", returnTo);
  };

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    setError(t(
      "手机号登录尚未接入，请使用邮箱和密码登录。",
      "Phone-number login is not connected yet. Use email and password for now."
    ));
  };

  return (
    <AuthLayout
      icon={LogIn}
      title={t("欢迎回来", "Welcome back")}
      subtitle={t("使用微信或手机号登录", "Log in with WeChat or your phone number")}
      footer={
        <>
          {t("还没有账户？", "Don't have an account?")}{" "}
          <Link
            to={"/register" + (returnTo !== "/" ? "?returnTo=" + encodeURIComponent(returnTo) : "")}
            className="text-primary font-medium hover:underline"
          >
            {t("注册新账户", "Create one")}
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2 mb-5" role="tablist" aria-label={t("登录方式", "Login method")}>
        <Button
          type="button"
          role="tab"
          aria-selected={method === "wechat"}
          variant={method === "wechat" ? "default" : "outline"}
          className="h-11 text-sm"
          onClick={() => { setMethod("wechat"); setShowEmailLogin(false); setError(""); }}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          WeChat
        </Button>
        <Button
          type="button"
          role="tab"
          aria-selected={method === "phone"}
          variant={method === "phone" ? "default" : "outline"}
          className="h-11 text-sm"
          onClick={() => { setMethod("phone"); setShowEmailLogin(false); setError(""); }}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          {t("手机号", "Phone number")}
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      {method === "wechat" && !showEmailLogin && (
        <Button
          type="button"
          className="w-full h-12 font-medium bg-[#07c160] hover:bg-[#06ad56] text-white"
          onClick={handleWechat}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          {t("使用微信登录", "Log in with WeChat")}
        </Button>
      )}

      {method === "phone" && !showEmailLogin && (
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">{t("手机号", "Phone number")}</Label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder={t("请输入手机号", "Enter your phone number")}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 h-12"
                required
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-12 font-medium">
            {t("使用手机号登录", "Log in with phone number")}
          </Button>
        </form>
      )}

      {showEmailLogin && (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t("邮箱", "Email")}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">{t("密码", "Password")}</Label>
            <Link to="/forgot-password" className="text-xs text-primary hover:underline">
              {t("忘记密码？", "Forgot password?")}
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-10 h-12"
              required
            />
          </div>
        </div>
        <Button type="submit" className="w-full h-12 font-medium" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              {t("登录中…", "Logging in...")}
            </>
          ) : (
            t("登录", "Log in")
          )}
        </Button>
      </form>
      )}

      <button
        type="button"
        className="mt-5 w-full text-center text-sm text-primary hover:underline"
        onClick={() => { setShowEmailLogin((visible) => !visible); setError(""); }}
      >
        {showEmailLogin
          ? t("返回微信或手机号登录", "Back to WeChat or phone login")
          : t("使用邮箱和密码登录", "Use email and password instead")}
      </button>
    </AuthLayout>
  );
}
