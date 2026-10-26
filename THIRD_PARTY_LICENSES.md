# 第三方许可证清单

> 生成方式：读取 `node_modules/*/package.json` 的 `license` 字段 + `package-lock.json` 的版本号，
> 共扫描 142 个包（含传递依赖）。生成时间：2026-10-26。
> 复核命令见文末。

---

## 1. 运行时依赖（直接）

| 包 | 版本 | 许可证 | 用途 | 商用 |
| --- | --- | --- | --- | --- |
| `next` | 15.5.28 | MIT | 应用框架（SSR、路由、API） | ✅ |
| `react` | 19.3.1 | MIT | UI 运行时 | ✅ |
| `react-dom` | 19.3.1 | MIT | DOM 渲染 | ✅ |
| `lunar-typescript` | 1.8.6 | MIT | 公农历转换、节气、四柱、十神、大运、黄历 | ✅ |
| `true-solar-time` | 1.2.1 | MIT | 真太阳时校正（均时差 + 经度时差） | ✅ |
| `zod` | 3.25.76 | MIT | API 入参校验 | ✅ |
| `tailwindcss` | 3.4.19 | MIT | 样式工具链（构建期） | ✅ |

## 2. 开发依赖

| 包 | 版本 | 许可证 |
| --- | --- | --- |
| `typescript` | 5.9.3 | Apache-2.0 |
| `vitest` | 2.1.9 | MIT |
| `postcss` | 8.5.31 | MIT |
| `autoprefixer` | 10.6.1 | MIT |
| `@types/node` | 22.20.5 | MIT |
| `@types/react` / `@types/react-dom` | 19.x | MIT |

## 3. 许可证分布（全部 142 个包）

| 许可证 | 数量 |
| --- | --- |
| MIT | 122 |
| Apache-2.0 | 8 |
| ISC | 7 |
| BSD-3-Clause | 1 |
| 0BSD | 1 |
| CC-BY-4.0 | 1 |
| Apache-2.0 AND LGPL-3.0-or-later（± MIT） | 2 |

**无 GPL / AGPL / SSPL。**

## 4. 需要单独说明的三项

### 4.1 `@img/sharp-*`（Apache-2.0 AND LGPL-3.0-or-later）

- **来源**：Next.js 的图片优化可选依赖，随 `next` 安装。
- **本项目是否使用**：**否**。全站没有使用 `next/image`，也没有位图资源；图片、图标、纹理全部是 SVG / CSS 生成。运行时不会加载 sharp。
- **商用结论**：
  - SaaS（用户只通过网络访问，不获得软件副本）：LGPL 义务基本不触发。
  - 分发产物（Docker 镜像 / 安装包）：需允许用户替换该库，并提供其源码获取方式。做法是附上上游仓库地址与版本。
  - 想彻底规避：`npm uninstall sharp`（确认不使用图片优化即可）。
- **上游**：https://github.com/lovell/sharp

### 4.2 `caniuse-lite`（CC-BY-4.0）

- **来源**：`browserslist` → `autoprefixer` / `postcss` 的构建期数据。
- **是否进入产物**：否，只在构建时决定 CSS 前缀。
- **义务**：CC-BY-4.0 要求署名。此处署名：*caniuse-lite, CC-BY-4.0, https://github.com/browserslist/caniuse-lite*。

### 4.3 算法交叉校验来源：`Zijian-Ni/tianji`（MIT）

- **使用方式**：**未引入任何代码**。仅将其公开测试中的已知日期断言（`tests/test_bazi/test_known_dates.py`）转写为 `src/lib/bazi/engine.test.ts` 的期望值，用于交叉校验 `lunar-typescript` 的输出。
- **性质**：测试数据属于事实性信息（某日期的干支），不构成对代码的复制；即便如此，仍在测试文件注释与调研文档中标注来源与许可证。

---

## 5. 非代码资源

| 资源 | 来源 | 授权状态 |
| --- | --- | --- |
| 《周易》卦辞、爻辞 | 通行本原文（先秦成书，公有领域） | ✅ 可用，未改写 |
| 卦名、卦序 | 通行本卦序（公有领域） | ✅ |
| 卦旨、白话解读 | 本项目原创撰写 | ✅ |
| 术语释义、流派介绍、节气简介、文化卡片 | 本项目原创撰写 | ✅ |
| 星野、山影、印章、图标（7 个）、纹理 | 本项目手写 SVG / CSS（`feTurbulence`） | ✅ 原创 |
| 字体 | 不打包字体文件，使用系统字体栈 | ✅ 无授权问题 |
| 黄历宜忌 / 彭祖百忌 | `lunar-typescript` 内置（传统通书条目整理） | ✅ 随库 MIT；数据性质已在 UI 标注 |

**未使用**：第三方插画、商业字体、来源不明的古籍数据库、其他命理站点的文案、他人前端模板。

---

## 6. 被明确排除的项目

| 项目 | 许可证 | 排除原因 |
| --- | --- | --- |
| `shetengteng/tt-qimen` | **无**（GitHub API `license: null`，LICENSE 请求 404） | 无许可证 = 保留所有权利，不得复制、修改、分发 |
| `tianma-if/zhaoming` | **AGPL-3.0** | 第 13 条要求网络交互即提供完整源码，与闭源商用冲突 |
| `Travelspace/BuSuan` | MIT（代码可用） | 无测试、提交了 `node_modules`、字典数据授权不明；仅参考其依赖组合，代码一行未取 |

详见 `docs/OPEN_SOURCE_RESEARCH.md`。

---

## 7. MIT 义务的落地方式

MIT 要求「在软件的副本或实质性部分中保留版权声明与许可声明」。本项目做法：

1. 本文件列出所有依赖的名称、版本、许可证与上游地址。
2. 应用内 `/settings#credits` 提供「开源致谢」，向最终用户展示主要依赖与许可证类型。
3. 分发可执行产物时，将本文件一并放入产物目录。

各依赖的完整许可证原文可在其 npm 包内 `LICENSE` 文件或上游仓库查看，本项目不再重复抄录全文（避免版本更新后文本不一致）。

---

## 8. 复核命令

```bash
# 列出所有依赖的许可证分布
node -e "
const fs=require('fs'),path=require('path');
const dirs=fs.readdirSync('node_modules').filter(d=>!d.startsWith('.'));
const rows=[];
for(const d of dirs){
  const p=path.join('node_modules',d,'package.json');
  if(!fs.existsSync(p))continue;
  if(d.startsWith('@')){for(const s of fs.readdirSync(path.join('node_modules',d))){const q=path.join('node_modules',d,s,'package.json');if(fs.existsSync(q)){const j=require('./'+q);rows.push([j.name,j.version,j.license||'UNKNOWN'])}}}
  else{const j=require('./'+p);rows.push([j.name,j.version,j.license||'UNKNOWN'])}
}
const c={};for(const r of rows)c[r[2]]=(c[r[2]]||0)+1;
console.log(c);
"
```

发现新的非 MIT/Apache/BSD 许可证时，先查上游许可证原文，再决定是否引入——不要只看 npm 页面的标签。
