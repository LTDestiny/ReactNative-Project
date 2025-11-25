import { Request, Response } from 'express';
import { db } from '../database';
import OpenAI from 'openai';

function getOpenAIClient(): OpenAI | null {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return new OpenAI({ apiKey });
}

export async function chat(req: Request, res: Response) {
  try {
    const { messages, sessionId } = req.body as { messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>; sessionId?: string };
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages is required' });
    }

    const baseSystem = {
      role: 'system' as const,
      content:
        'Bạn là trợ lý bán hàng thân thiện và tự nhiên cho cửa hàng sản phẩm cơ khí/industrial, nói chuyện như người bình thường. Luôn lịch sự, ngắn gọn, dễ hiểu. Khi khách nói muốn mua, đặt vài câu hỏi làm rõ (mục đích sử dụng, vật liệu, môi trường, dùng pin hay điện, kích cỡ đầu kẹp, thương hiệu ưa thích, ngân sách). Sau đó gợi ý 2–3 sản phẩm phù hợp và giải thích lý do. Ngôn ngữ: tiếng Việt.',
    };

    function normalizeKeyword(text: string): string {
      const t = (text || '').toLowerCase();
      if (t.includes('máy khoan') || t.includes('khoan') || t.includes('drill')) return 'khoan';
      return '';
    }

    async function fetchSuggestions(keyword: string, limit = 6) {
      const kw = keyword.trim() ? `%${keyword.trim()}%` : '%khoan%';
      const result = await db.query(
        `SELECT p.id, p.name, p.price, p.sale_price,
                b.name as brand_name, b.slug as brand_slug,
                COALESCE(i.quantity, 0) as stock
         FROM products p
         LEFT JOIN brands b ON p.brand_id = b.id
         LEFT JOIN inventory i ON i.product_id = p.id
         WHERE p.is_active = true AND (p.name ILIKE $1 OR p.description ILIKE $1)
         ORDER BY COALESCE(i.quantity, 0) DESC, p.created_at DESC
         LIMIT $2`,
        [kw, Math.min(Math.max(limit, 1), 12)]
      );
      return result.rows;
    }

    const client = getOpenAIClient();

    // Persist last user message if session provided
    const lastUser = [...messages].reverse().find((m) => m.role === 'user');
    if (sessionId && lastUser) {
      try {
        await db.query(
          'INSERT INTO chat_messages (id, session_id, role, content) VALUES (gen_random_uuid(), $1, $2, $3)',
          [sessionId, 'user', lastUser.content]
        );
      } catch (e) {
        console.error('Failed to persist user message:', e);
      }
    }
    if (!client) {
      const userContent = lastUser?.content || '';
      const normalized = normalizeKeyword(userContent) || userContent.trim().slice(0, 64);
      const suggestions = await fetchSuggestions(normalized, 6);
      const reply = suggestions.length
        ? `Tôi chưa thể truy cập dịch vụ AI, nhưng dựa trên nhu cầu của bạn, đây là một số sản phẩm phù hợp.`
        : 'Chưa tìm thấy sản phẩm phù hợp theo từ khóa. Bạn có thể mô tả chi tiết hơn về yêu cầu, vật liệu, kích thước hoặc thương hiệu mong muốn.';
      return res.json({ reply, suggestions });
    }

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [baseSystem, ...messages],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '';

    // Try attach product suggestions based on user intent
    const userContent = lastUser?.content || '';
    const normalized = normalizeKeyword(userContent);
    let suggestions: any[] = [];
    if (normalized) {
      try {
        suggestions = await fetchSuggestions(normalized, 6);
      } catch (e) {
        suggestions = [];
      }
    }

    // Persist assistant reply if session provided
    if (sessionId && content) {
      try {
        await db.query(
          'INSERT INTO chat_messages (id, session_id, role, content) VALUES (gen_random_uuid(), $1, $2, $3)',
          [sessionId, 'assistant', content]
        );
      } catch (e) {
        console.error('Failed to persist assistant message:', e);
      }
    }

    return res.json({ reply: content, suggestions });
  } catch (error) {
    console.error('AI chat error:', error);
    return res.status(500).json({ error: 'AI chat failed' });
  }
}

export async function startSession(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    const result = await db.query(
      'INSERT INTO chat_sessions (id, user_id, title) VALUES (gen_random_uuid(), $1, $2) RETURNING id',
      [req.user.userId, 'Tư vấn cơ khí']
    );
    return res.json({ sessionId: result.rows[0].id });
  } catch (error) {
    console.error('Start session error:', error);
    return res.status(500).json({ error: 'Failed to start session' });
  }
}

export async function recommendations(req: Request, res: Response) {
  try {
    const { productId, limit = '8' } = req.query as { productId?: string; limit?: string };
    const limitNum = Math.min(Math.max(parseInt(limit || '8', 10), 1), 20);

    if (productId) {
      const base = await db.query(
        'SELECT id, name, brand_id, category_id FROM products WHERE id = $1 AND is_active = true',
        [productId]
      );
      if (base.rows.length === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      const p = base.rows[0];
      const similar = await db.query(
        `SELECT p.id, p.name, p.price, p.sale_price,
                b.name as brand_name, b.slug as brand_slug,
                c.name as category_name, c.slug as category_slug,
                COALESCE(i.quantity, 0) as stock,
                (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as image_url
         FROM products p
         LEFT JOIN brands b ON p.brand_id = b.id
         LEFT JOIN categories c ON p.category_id = c.id
         LEFT JOIN inventory i ON i.product_id = p.id
         WHERE p.is_active = true AND (p.category_id = $1 OR p.brand_id = $2) AND p.id <> $3
         ORDER BY COALESCE(i.quantity, 0) DESC, p.created_at DESC
         LIMIT $4`,
        [p.category_id, p.brand_id, p.id, limitNum]
      );
      return res.json({ success: true, data: similar.rows });
    }

    const latest = await db.query(
      `SELECT p.id, p.name, p.price, p.sale_price,
              b.name as brand_name, b.slug as brand_slug,
              c.name as category_name, c.slug as category_slug,
              COALESCE(i.quantity, 0) as stock,
              (SELECT url FROM product_images pi WHERE pi.product_id = p.id AND pi.is_primary = true LIMIT 1) as image_url
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN inventory i ON i.product_id = p.id
       WHERE p.is_active = true
       ORDER BY COALESCE(i.quantity, 0) DESC, p.created_at DESC
       LIMIT $1`,
      [limitNum]
    );
    return res.json({ success: true, data: latest.rows });
  } catch (error) {
    console.error('AI recommendations error:', error);
    return res.status(500).json({ error: 'Failed to get recommendations' });
  }
}
