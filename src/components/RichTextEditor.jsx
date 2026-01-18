import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import './RichTextEditor.css';

const RichTextEditor = ({ content, onChange, onReady }) => {
    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            TextStyle,
            Color,
            Underline,
            Highlight.configure({ multicolor: true }),
            FontFamily.configure({
                types: ['textStyle'],
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        onCreate: ({ editor }) => {
            if (onReady) onReady(editor);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none',
            },
        },
    });

    // 工具栏组件
    const Toolbar = () => {
        if (!editor) return null;

        return (
            <div className="editor-toolbar">
                {/* 文字样式 */}
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={editor.isActive('bold') ? 'is-active' : ''}
                    title="加粗 (Ctrl+B)"
                >
                    <strong>B</strong>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={editor.isActive('italic') ? 'is-active' : ''}
                    title="斜体 (Ctrl+I)"
                >
                    <em>I</em>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={editor.isActive('strike') ? 'is-active' : ''}
                    title="删除线"
                >
                    <s>S</s>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleUnderline().run()}
                    className={editor.isActive('underline') ? 'is-active' : ''}
                    title="下划线 (Ctrl+U)"
                >
                    <u>U</u>
                </button>

                <div className="toolbar-divider"></div>

                {/* 字体选择器 */}
                <select
                    onChange={(e) => editor.chain().focus().setFontFamily(e.target.value).run()}
                    value={editor.getAttributes('textStyle').fontFamily || ''}
                    className="font-selector"
                    title="字体"
                >
                    <option value="">默认字体</option>
                    <option value="serif" style={{ fontFamily: 'serif' }}>衬线体 Serif</option>
                    <option value="'Courier New', monospace" style={{ fontFamily: "'Courier New', monospace" }}>等宽字体 Mono</option>
                    <option value="'Comic Sans MS', cursive" style={{ fontFamily: "'Comic Sans MS', cursive" }}>Comic Sans</option>
                    <option value="'Brush Script MT', cursive" style={{ fontFamily: "'Brush Script MT', cursive" }}>手写体 Brush</option>
                    <option value="'Lucida Handwriting', cursive" style={{ fontFamily: "'Lucida Handwriting', cursive" }}>花体字 Lucida</option>
                    <option value="'Papyrus', fantasy" style={{ fontFamily: "'Papyrus', fantasy" }}>纸莎草 Papyrus</option>
                    <option value="'Impact', fantasy" style={{ fontFamily: "'Impact', fantasy" }}>冲击体 Impact</option>
                </select>

                <div className="toolbar-divider"></div>

                {/* 标题 */}
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
                    title="一级标题"
                >
                    H1
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
                    title="二级标题"
                >
                    H2
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
                    title="三级标题"
                >
                    H3
                </button>

                <div className="toolbar-divider"></div>

                {/* 颜色 */}
                <button
                    onClick={() => editor.chain().focus().setColor('#ef4444').run()}
                    title="红色"
                    style={{ color: '#ef4444' }}
                    className="color-btn"
                >
                    A
                </button>
                <button
                    onClick={() => editor.chain().focus().setColor('#f97316').run()}
                    title="橙色"
                    style={{ color: '#f97316' }}
                    className="color-btn"
                >
                    A
                </button>
                <button
                    onClick={() => editor.chain().focus().setColor('#10b981').run()}
                    title="绿色"
                    style={{ color: '#10b981' }}
                    className="color-btn"
                >
                    A
                </button>
                <button
                    onClick={() => editor.chain().focus().setColor('#0ea5e9').run()}
                    title="蓝色"
                    style={{ color: '#0ea5e9' }}
                    className="color-btn"
                >
                    A
                </button>
                <button
                    onClick={() => editor.chain().focus().unsetColor().run()}
                    title="清除颜色"
                    className="color-btn"
                >
                    ✕
                </button>

                <div className="toolbar-divider"></div>

                {/* 列表和引用 */}
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={editor.isActive('bulletList') ? 'is-active' : ''}
                    title="无序列表"
                >
                    •
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    className={editor.isActive('orderedList') ? 'is-active' : ''}
                    title="有序列表"
                >
                    1.
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    className={editor.isActive('blockquote') ? 'is-active' : ''}
                    title="引用"
                >
                    "
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className={editor.isActive('code') ? 'is-active' : ''}
                    title="行内代码"
                >
                    {'<>'}
                </button>

                <div className="toolbar-divider"></div>

                {/* 撤销/重做 */}
                <button
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    title="撤销 (Ctrl+Z)"
                >
                    ↶
                </button>
                <button
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    title="重做 (Ctrl+Shift+Z)"
                >
                    ↷
                </button>
            </div>
        );
    };

    return (
        <div className="rich-text-editor">
            <Toolbar />
            <EditorContent editor={editor} className="editor-content-wrapper" />
        </div>
    );
};

export default RichTextEditor;
