import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "设置与关于",
  description:
    "观星录的排盘默认口径、本地数据管理、AI 服务配置说明、隐私政策与开源致谢。",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
