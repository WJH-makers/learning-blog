"use client";

import type { Block, PartialBlock } from "@blocknote/core";
import { BlockNoteView } from "@blocknote/mantine";
import { useCreateBlockNote } from "@blocknote/react";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";

const DRAFT_KEY = "wjh-learning-blog:write-draft:v1";
const DEFAULT_TAGS = "Java, Git, MySQL, 复盘";

const KNOWLEDGE_CARD_TEMPLATE = [
  { type: "heading", props: { level: 2 }, content: "今天学习的概念" },
  { type: "paragraph", content: "用一句话写清楚今天真正理解了什么。" },
  { type: "heading", props: { level: 2 }, content: "为什么重要" },
  { type: "bulletListItem", content: "它解决的真实问题：" },
  { type: "bulletListItem", content: "以后可以复用的场景：" },
  { type: "heading", props: { level: 2 }, content: "核心知识点" },
  { type: "bulletListItem", content: "概念 / 原理：" },
  { type: "bulletListItem", content: "关键步骤：" },
  { type: "bulletListItem", content: "和旧知识的联系：" },
  { type: "heading", props: { level: 2 }, content: "示例 / 命令 / 代码" },
  { type: "paragraph", content: "把最小可运行示例、关键命令或代码片段放在这里。" },
  { type: "codeBlock", props: { language: "bash" }, content: "# command or code here" },
  { type: "heading", props: { level: 2 }, content: "易错点" },
  { type: "bulletListItem", content: "容易混淆：" },
  { type: "bulletListItem", content: "报错信号：" },
  { type: "bulletListItem", content: "避坑规则：" },
  { type: "heading", props: { level: 2 }, content: "练习与验证" },
  { type: "checkListItem", props: { checked: false }, content: "跑一次构建 / 测试 / 命令并记录结果。" },
  { type: "checkListItem", props: { checked: false }, content: "确认自己能不看笔记复述核心流程。" },
  { type: "heading", props: { level: 2 }, content: "明天继续" },
  { type: "bulletListItem", content: "下一步：" },
] satisfies PartialBlock[];

const TEMPLATE_MARKDOWN = `## 今天学习的概念

用一句话写清楚今天真正理解了什么。

## 为什么重要

- 它解决的真实问题：
- 以后可以复用的场景：

## 核心知识点

- 概念 / 原理：
- 关键步骤：
- 和旧知识的联系：

## 示例 / 命令 / 代码

把最小可运行示例、关键命令或代码片段放在这里。

\`\`\`bash
# command or code here
\`\`\`

## 易错点

- 容易混淆：
- 报错信号：
- 避坑规则：

## 练习与验证

- [ ] 跑一次构建 / 测试 / 命令并记录结果。
- [ ] 确认自己能不看笔记复述核心流程。

## 明天继续

- 下一步：`;

type PublishAction = (formData: FormData) => void | Promise<void>;

type WriteEditorClientProps = {
  initialDate: string;
  publishAction: PublishAction;
};

type Draft = {
  version: 1;
  title: string;
  summary: string;
  tags: string;
  date: string;
  blocks: Block[];
  updatedAt: string;
};

function readStoredDraft(): Draft | undefined {
  try {
    const raw = window.localStorage.getItem(DRAFT_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<Draft>;
    if (!Array.isArray(parsed.blocks)) return undefined;
    return {
      version: 1,
      title: String(parsed.title ?? ""),
      summary: String(parsed.summary ?? ""),
      tags: String(parsed.tags ?? DEFAULT_TAGS),
      date: String(parsed.date ?? ""),
      blocks: parsed.blocks as Block[],
      updatedAt: String(parsed.updatedAt ?? new Date().toISOString()),
    };
  } catch {
    return undefined;
  }
}

function formatDraftTime(value?: string | null): string {
  if (!value) return "尚未保存";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export default function WriteEditorClient({ initialDate, publishAction }: WriteEditorClientProps) {
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState(DEFAULT_TAGS);
  const [date, setDate] = useState(initialDate);
  const [markdown, setMarkdown] = useState(TEMPLATE_MARKDOWN);
  const [draftLoaded, setDraftLoaded] = useState(false);
  const [draftDirty, setDraftDirty] = useState(false);
  const [storedDraftAt, setStoredDraftAt] = useState<string | null>(null);
  const [draftStatus, setDraftStatus] = useState("正在准备本地写作台……");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);

  const contentInputRef = useRef<HTMLInputElement>(null);
  const programmaticChangeUntilRef = useRef(0);

  const editor = useCreateBlockNote({
    initialContent: KNOWLEDGE_CARD_TEMPLATE,
    placeholders: {
      default: "继续补充今天的心得、证据或下一步。",
      emptyDocument: "从知识卡片模板开始记录今天的学习成果。",
      heading: "知识卡片小节",
    },
  });

  const syncMarkdown = useCallback(() => {
    const nextMarkdown = editor.blocksToMarkdownLossy(editor.document);
    setMarkdown(nextMarkdown);
    if (contentInputRef.current) {
      contentInputRef.current.value = nextMarkdown;
    }
    return nextMarkdown;
  }, [editor]);

  const markDirty = useCallback(() => {
    if (!draftLoaded) return;
    setDraftDirty(true);
  }, [draftLoaded]);

  const replaceEditorContent = useCallback(
    (blocks: PartialBlock[]) => {
      programmaticChangeUntilRef.current = Date.now() + 600;
      editor.replaceBlocks(
        editor.document.map((block) => block.id),
        blocks,
      );
      window.setTimeout(syncMarkdown, 0);
    },
    [editor, syncMarkdown],
  );

  const restoreDraft = useCallback(
    (draft?: Draft) => {
      const stored = draft ?? readStoredDraft();
      if (!stored) {
        setDraftStatus("没有找到可恢复的本地草稿。");
        setStoredDraftAt(null);
        return false;
      }

      setTitle(stored.title);
      setSummary(stored.summary);
      setTags(stored.tags || DEFAULT_TAGS);
      setDate(stored.date || initialDate);
      replaceEditorContent(stored.blocks);
      setStoredDraftAt(stored.updatedAt);
      setDraftDirty(false);
      setValidationMessage(null);
      setDraftStatus(`已恢复 ${formatDraftTime(stored.updatedAt)} 的本地草稿。`);
      return true;
    },
    [initialDate, replaceEditorContent],
  );

  const resetToTemplate = useCallback(() => {
    setTitle("");
    setSummary("");
    setTags(DEFAULT_TAGS);
    setDate(initialDate);
    replaceEditorContent(KNOWLEDGE_CARD_TEMPLATE);
    setMarkdown(TEMPLATE_MARKDOWN);
    if (contentInputRef.current) {
      contentInputRef.current.value = TEMPLATE_MARKDOWN;
    }
    setValidationMessage(null);
  }, [initialDate, replaceEditorContent]);

  const saveDraft = useCallback(
    (status: string) => {
      try {
        const updatedAt = new Date().toISOString();
        const draft: Draft = {
          version: 1,
          title,
          summary,
          tags,
          date,
          blocks: editor.document,
          updatedAt,
        };
        window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
        setStoredDraftAt(updatedAt);
        setDraftDirty(false);
        setDraftStatus(status.replace("{time}", formatDraftTime(updatedAt)));
        return draft;
      } catch {
        setDraftStatus("草稿保存失败：浏览器可能禁用了 localStorage。");
        return undefined;
      }
    },
    [date, editor, summary, tags, title],
  );

  useEffect(() => {
    const stored = readStoredDraft();
    if (stored) {
      restoreDraft(stored);
    } else {
      syncMarkdown();
      setDraftStatus("已载入知识卡片模板；开始输入后会自动保存到本机。");
    }
    setDraftLoaded(true);
  }, [restoreDraft, syncMarkdown]);

  useEffect(() => {
    if (!draftLoaded || !draftDirty) return undefined;

    const timeoutId = window.setTimeout(() => {
      saveDraft("草稿已自动保存：{time}");
    }, 700);

    return () => window.clearTimeout(timeoutId);
  }, [draftDirty, draftLoaded, markdown, saveDraft]);

  function handleEditorChange() {
    syncMarkdown();
    if (Date.now() <= programmaticChangeUntilRef.current) return;
    markDirty();
  }

  function handleClearDraft() {
    window.localStorage.removeItem(DRAFT_KEY);
    setStoredDraftAt(null);
    setDraftDirty(false);
    resetToTemplate();
    setDraftStatus("本地草稿已清空；刷新后不会恢复旧内容。");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const nextMarkdown = syncMarkdown();
    const trimmedMarkdown = nextMarkdown.trim();

    if (!title.trim()) {
      event.preventDefault();
      setValidationMessage("标题不能为空。");
      return;
    }

    if (!trimmedMarkdown) {
      event.preventDefault();
      setValidationMessage("正文不能为空。");
      return;
    }

    const confirmed = window.confirm("发布后将写入 MongoDB，并公开到首页、文章页、标签页和 RSS。确认发布？");
    if (!confirmed) {
      event.preventDefault();
      setDraftStatus("已取消发布，本地草稿仍保留。");
      return;
    }

    setValidationMessage(null);
    saveDraft("发布前已保存本地草稿：{time}");
  }

  return (
    <div className="editor-layout">
      <form className="editor-form" action={publishAction} onSubmit={handleSubmit}>
        <label>
          <span>写入密钥 BLOG_ADMIN_TOKEN</span>
          <input name="token" type="password" autoComplete="off" required />
        </label>

        <div className="form-grid">
          <label>
            <span>日期</span>
            <input
              name="date"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                markDirty();
              }}
              required
            />
          </label>
          <label>
            <span>标签（英文逗号分隔）</span>
            <input
              name="tags"
              value={tags}
              onChange={(event) => {
                setTags(event.target.value);
                markDirty();
              }}
            />
          </label>
        </div>

        <label>
          <span>标题</span>
          <input
            name="title"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value);
              markDirty();
            }}
            placeholder="例如：今天把 Vercel 博客写作入口打通了"
            required
          />
        </label>

        <label>
          <span>摘要</span>
          <input
            name="summary"
            value={summary}
            onChange={(event) => {
              setSummary(event.target.value);
              markDirty();
            }}
            placeholder="一句话说明今天沉淀了什么"
          />
        </label>

        <input ref={contentInputRef} type="hidden" name="content" defaultValue={markdown} />

        <section className="block-editor-field" aria-label="正文块编辑器">
          <div className="field-head">
            <span>正文块编辑器</span>
            <em>输入 / 打开块菜单，内容会在发布前转换为 Markdown。</em>
          </div>
          <BlockNoteView editor={editor} theme="light" onChange={handleEditorChange} />
        </section>

        {validationMessage ? <p className="form-error">E43: {validationMessage}</p> : null}

        <div className="hero-actions">
          <button className="button primary" type="submit">发布今日心得</button>
          <button className="button" type="button" onClick={() => saveDraft("草稿已手动保存：{time}")}>保存草稿</button>
          <a className="button" href="/posts">查看归档</a>
        </div>
      </form>

      <aside className="editor-note" aria-label="知识卡片写作清单">
        <p className="eyebrow">Knowledge Card</p>
        <h2>写作清单</h2>
        <ul>
          <li><strong>概念</strong><span>今天学习的概念能否一句话说清楚？</span></li>
          <li><strong>价值</strong><span>它解决什么真实问题，在哪些场景复用？</span></li>
          <li><strong>知识点</strong><span>列出原理、步骤、边界和旧知识连接。</span></li>
          <li><strong>示例</strong><span>保留命令、代码、报错和最小复现。</span></li>
          <li><strong>易错</strong><span>写清楚误区、信号和下次避坑规则。</span></li>
          <li><strong>验证</strong><span>用构建、测试、截图或日志证明结论。</span></li>
          <li><strong>续写</strong><span>给明天留下一个明确的下一步。</span></li>
        </ul>

        <div className="draft-panel">
          <p className="eyebrow">Local Draft</p>
          <p>{draftStatus}</p>
          <dl>
            <div><dt>Key</dt><dd>{DRAFT_KEY}</dd></div>
            <div><dt>Updated</dt><dd>{formatDraftTime(storedDraftAt)}</dd></div>
            <div><dt>Markdown</dt><dd>{markdown.trim().length} chars</dd></div>
          </dl>
          <div className="draft-actions">
            <button className="button" type="button" onClick={() => saveDraft("草稿已手动保存：{time}")}>保存</button>
            <button className="button" type="button" onClick={() => restoreDraft()} disabled={!storedDraftAt}>恢复</button>
            <button className="button" type="button" onClick={handleClearDraft}>清空</button>
          </div>
        </div>

        <div className="markdown-panel">
          <div className="field-head">
            <span>Markdown 输出预览</span>
            <em>发布时保存到 MongoDB 的正文。</em>
          </div>
          <textarea className="markdown-preview" value={markdown} readOnly rows={14} />
        </div>
      </aside>
    </div>
  );
}
