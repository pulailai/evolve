import React, { useState, useEffect, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { Highlight } from '@tiptap/extension-highlight';
import { FontFamily } from '@tiptap/extension-font-family';
import TextAlign from '@tiptap/extension-text-align';
import ResizableImage from 'tiptap-extension-resize-image';
import FontSize from './FontSizeExtension';
import './RichTextEditor.css';

const RichTextEditor = ({ content, onChange, onReady }) => {
    const [isUploading, setIsUploading] = useState(false);
    const isUpdatingRef = useRef(false);

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
            ResizableImage.configure({
                inline: true,
                allowBase64: true,
            }),
            TextAlign.configure({
                types: ['heading', 'paragraph', 'image'],
                alignments: ['left', 'center', 'right'],
            }),
            FontSize,
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            if (!isUpdatingRef.current) {
                onChange(editor.getHTML());
            }
        },
        onCreate: ({ editor }) => {
            if (onReady) onReady(editor);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm focus:outline-none',
            },
            handlePaste: (view, event) => {
                const items = event.clipboardData?.items;
                if (!items) return false;

                // 遍历剪贴板项目，查找图片
                for (let i = 0; i < items.length; i++) {
                    const item = items[i];

                    // 检查是否为图片
                    if (item.type.indexOf('image') !== -1) {
                        event.preventDefault();

                        const file = item.getAsFile();
                        if (file) {
                            // 检查文件大小（限制 5MB）
                            if (file.size > 5 * 1024 * 1024) {
                                alert('图片大小不能超过 5MB，请选择更小的图片或压缩后上传');
                                return true;
                            }

                            // 显示加载提示
                            setIsUploading(true);
                            const fileSize = (file.size / 1024 / 1024).toFixed(2);
                            console.log(`正在粘贴图片 (${fileSize}MB)...`);

                            // 转换为 Base64 并插入
                            const reader = new FileReader();
                            reader.onload = () => {
                                // 使用 editor.chain() 插入图片
                                if (editor) {
                                    editor.chain()
                                        .focus()
                                        .setImage({ src: reader.result })
                                        .enter() // 在图片后插入新段落
                                        .run();
                                }
                                setIsUploading(false);
                                console.log('图片粘贴成功！');
                            };
                            reader.onerror = () => {
                                setIsUploading(false);
                                alert('图片粘贴失败，请重试');
                            };
                            reader.readAsDataURL(file);
                        }
                        return true;
                    }
                }
                return false;
            },
        },
    });

    // 当 content prop 变化时更新编辑器内容
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            isUpdatingRef.current = true;
            editor.commands.setContent(content || '');
            // 使用 setTimeout 确保 setContent 完成后再重置标志
            setTimeout(() => {
                isUpdatingRef.current = false;
            }, 0);
        }
    }, [content, editor]);

    // 图片上传处理
    const addImage = () => {
        if (!editor) {
            alert('编辑器未就绪，请稍后再试');
            return;
        }

        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files?.[0];
            if (file) {
                // 检查文件大小（限制 5MB）
                if (file.size > 5 * 1024 * 1024) {
                    alert('图片大小不能超过 5MB，请选择更小的图片或压缩后上传');
                    return;
                }

                // 显示加载提示
                setIsUploading(true);
                const fileSize = (file.size / 1024 / 1024).toFixed(2);
                console.log(`正在上传图片 (${fileSize}MB)...`);

                // 转换为 Base64
                const reader = new FileReader();
                reader.onload = () => {
                    editor.chain()
                        .focus()
                        .setImage({ src: reader.result })
                        .enter() // 在图片后插入新段落
                        .run();
                    setIsUploading(false);
                    console.log('图片上传成功！');
                };
                reader.onerror = () => {
                    setIsUploading(false);
                    alert('图片上传失败，请重试');
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

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

                {/* 字号选择器 */}
                <select
                    onChange={(e) => {
                        if (e.target.value) {
                            editor.chain().focus().setFontSize(e.target.value).run();
                        } else {
                            editor.chain().focus().unsetFontSize().run();
                        }
                    }}
                    value={editor.getAttributes('textStyle').fontSize || ''}
                    className="font-size-selector"
                    title="字号"
                >
                    <option value="">默认</option>
                    <option value="12px">12px (小)</option>
                    <option value="14px">14px (正常)</option>
                    <option value="16px">16px (大)</option>
                    <option value="18px">18px (较大)</option>
                    <option value="20px">20px (特大)</option>
                    <option value="24px">24px (巨大)</option>
                    <option value="32px">32px (超大)</option>
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

                {/* 对齐方式 */}
                <button
                    onClick={() => editor.chain().focus().setTextAlign('left').run()}
                    className={editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}
                    title="左对齐"
                >
                    ≡
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('center').run()}
                    className={editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}
                    title="居中对齐"
                >
                    ≣
                </button>
                <button
                    onClick={() => editor.chain().focus().setTextAlign('right').run()}
                    className={editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}
                    title="右对齐"
                >
                    ≡
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

                {/* 图片 */}
                <button
                    onClick={addImage}
                    title="插入图片"
                    className="image-btn"
                >
                    🖼️
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
            {isUploading && (
                <div className="upload-indicator">
                    <div className="upload-spinner"></div>
                    <span>正在上传图片，请稍候...</span>
                </div>
            )}
            <EditorContent editor={editor} className="editor-content-wrapper" />
        </div>
    );
};

export default RichTextEditor;
