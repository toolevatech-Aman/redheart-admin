import React, { useEffect, useRef, useState } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold, Italic, Link2, Unlink, List, ListOrdered, Heading1, Heading2, Heading3, Heading4, Pilcrow, Code2,
} from "lucide-react";
import "./RichHtmlEditor.css";

const btnCls = (active) =>
  `p-1.5 rounded border text-xs flex items-center justify-center ${
    active ? "bg-red-600 text-white border-red-600" : "border-gray-300 text-gray-600 hover:bg-gray-50"
  }`;

function Toolbar({ editor }) {
  if (!editor) return null;

  // "Heading" click: first use in the doc becomes H1 (and demotes any other
  // existing H1 to H2, so there is always at most one). Every use after that
  // is H2 — matches "large text at the top is H1, the rest below is H2".
  const setHeading = () => {
    // If the cursor is already inside the H1, clicking again demotes it to
    // H2 (a manual undo). Otherwise: the *first* heading ever created in
    // this doc becomes H1 and stays H1 — every heading after that is H2,
    // regardless of which one was clicked most recently.
    if (editor.isActive("heading", { level: 1 })) {
      editor.chain().focus().setNode("heading", { level: 2 }).run();
      return;
    }
    let hasH1 = false;
    editor.state.doc.descendants((node) => {
      if (node.type.name === "heading" && node.attrs.level === 1) hasH1 = true;
    });
    editor.chain().focus().setNode("heading", { level: hasH1 ? 2 : 1 }).run();
  };

  const setLink = () => {
    const prev = editor.getAttributes("link").href || "";
    const url = window.prompt("Link URL (e.g. /flowers/roses or https://...)", prev);
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  };

  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-gray-200 px-2 py-1.5 bg-gray-50 rounded-t-lg">
      <button type="button" title="Normal text" className={btnCls(editor.isActive("paragraph"))} onClick={() => editor.chain().focus().setParagraph().run()}>
        <Pilcrow size={14} />
      </button>
      <button type="button" title="Heading (auto H1 once, then H2)" className={btnCls(editor.isActive("heading", { level: 1 }) || editor.isActive("heading", { level: 2 }))} onClick={setHeading}>
        <Heading1 size={14} />
      </button>
      <button type="button" title="Heading 3" className={btnCls(editor.isActive("heading", { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        <Heading3 size={14} />
      </button>
      <button type="button" title="Heading 4" className={btnCls(editor.isActive("heading", { level: 4 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 4 }).run()}>
        <Heading4 size={14} />
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button type="button" title="Bold" className={btnCls(editor.isActive("bold"))} onClick={() => editor.chain().focus().toggleBold().run()}>
        <Bold size={14} />
      </button>
      <button type="button" title="Italic" className={btnCls(editor.isActive("italic"))} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <Italic size={14} />
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button type="button" title="Bullet list" className={btnCls(editor.isActive("bulletList"))} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        <List size={14} />
      </button>
      <button type="button" title="Numbered list" className={btnCls(editor.isActive("orderedList"))} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        <ListOrdered size={14} />
      </button>
      <span className="w-px h-5 bg-gray-300 mx-1" />
      <button type="button" title="Insert / edit link (interlinking)" className={btnCls(editor.isActive("link"))} onClick={setLink}>
        <Link2 size={14} />
      </button>
      <button type="button" title="Remove link" className={btnCls(false)} onClick={() => editor.chain().focus().unsetLink().run()}>
        <Unlink size={14} />
      </button>
    </div>
  );
}

/**
 * Two synced boxes for HTML content: a visual (WYSIWYG) editor on the left,
 * and the raw HTML source on the right. Editing either updates the other.
 * The "Heading" toolbar button auto-assigns H1 the first time (only one
 * H1 ever exists in the doc) and H2 every time after.
 */
export default function RichHtmlEditor({ value, onChange, minHeight = 320, placeholder }) {
  const [sourceText, setSourceText] = useState(value || "");
  const lastEmitted = useRef(value || "");
  const sourceFocused = useRef(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: false, HTMLAttributes: { rel: null, target: null } }),
      Placeholder.configure({ placeholder: placeholder || "Start writing…" }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmitted.current = html;
      setSourceText(html);
      onChange(html);
    },
    editorProps: {
      attributes: { class: "focus:outline-none px-3 py-2" },
    },
  });

  // Keep the visual editor in sync when `value` changes from outside
  // (e.g. an "insert link suggestion" button that writes straight to state).
  useEffect(() => {
    if (!editor) return;
    if (value === lastEmitted.current) return;
    editor.commands.setContent(value || "", false);
    lastEmitted.current = value || "";
    if (!sourceFocused.current) setSourceText(value || "");
  }, [value, editor]);

  const handleSourceChange = (e) => {
    const html = e.target.value;
    setSourceText(html);
    lastEmitted.current = html;
    onChange(html);
    if (editor) editor.commands.setContent(html, false);
  };

  return (
    <div className="rich-html-editor grid grid-cols-1 xl:grid-cols-2 gap-4">
      <div>
        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-gray-600">
          <Pilcrow size={12} /> Text
        </div>
        <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
          <Toolbar editor={editor} />
          <div style={{ minHeight }} className="overflow-y-auto">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 mb-1.5 text-xs font-semibold text-gray-600">
          <Code2 size={12} /> HTML Source
        </div>
        <textarea
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
          style={{ minHeight: minHeight + 41 }}
          value={sourceText}
          onFocus={() => { sourceFocused.current = true; }}
          onBlur={() => { sourceFocused.current = false; }}
          onChange={handleSourceChange}
          spellCheck={false}
        />
      </div>
    </div>
  );
}
