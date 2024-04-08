import { createClient } from '@/utils/supabase/client';
import { NextApiRequest, NextApiResponse } from 'next';

export default async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    let supabase = createClient();
    const { id, newData } = req.body;
    // データベースの更新処理を行います
    const { data, error } = await supabase
    .from('profiles')
    .update(newData)
    .eq(id, 'id');

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ data });
  } else {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}