import { generateVarSaveDoc } from '../../libs/googlesheet';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const { sheetId, gid } = req.query;

            if (!sheetId || !gid) {
                return res.status(400).json({ error: 'Missing sheetId or gid parameter' });
            }

            const keysValues = await generateVarSaveDoc({
                sheetId: sheetId, 
                gid: gid
            });

            return res.status(200).json({ data: keysValues });
        } catch (error) {
            console.log(error,'errr')
            return res.status(500).json({ a:error, error: 'Error fetching data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}