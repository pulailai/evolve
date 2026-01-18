import express from 'express';
import mindStorage from '../utils/mindStorage.js';

const router = express.Router();

/**
 * 获取分类下的所有笔记
 * GET /api/mind/notes/:category
 */
router.get('/notes/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const notes = await mindStorage.getNotesByCategory(category);
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 获取所有笔记
 * GET /api/mind/notes
 */
router.get('/notes', async (req, res) => {
    try {
        const notes = await mindStorage.getAllNotes();
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 保存笔记（新建或更新）
 * POST /api/mind/notes
 */
router.post('/notes', async (req, res) => {
    try {
        const note = req.body;

        // 验证必填字段
        if (!note.id || !note.category || !note.title) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const result = await mindStorage.saveNote(note);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 删除笔记
 * DELETE /api/mind/notes/:category/:id
 */
router.delete('/notes/:category/:id', async (req, res) => {
    try {
        const { category, id } = req.params;
        const result = await mindStorage.deleteNote(category, id);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 获取自定义心法卡片
 * GET /api/mind/cards/custom
 */
router.get('/cards/custom', async (req, res) => {
    try {
        const cards = await mindStorage.getCustomCards();
        res.json(cards);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 保存自定义心法卡片
 * POST /api/mind/cards/custom
 */
router.post('/cards/custom', async (req, res) => {
    try {
        const { cards } = req.body;

        if (!Array.isArray(cards)) {
            return res.status(400).json({ error: 'Cards must be an array' });
        }

        const result = await mindStorage.saveCustomCards(cards);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * 获取索引信息
 * GET /api/mind/index
 */
router.get('/index', async (req, res) => {
    try {
        const index = await mindStorage.getIndex();
        res.json(index);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

export default router;
