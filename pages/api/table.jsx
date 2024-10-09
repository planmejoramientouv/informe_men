import { getDataTable } from '../../libs/googlesheet';

export default async function handler(req, res) {
    if (req.method === 'GET') {
        try {
            const {
                sheetId,
                gid
            } = req.params
            const tableResponse = await getDataTable({ 
                sheetId: sheetId,
                gid: gid
            });
            return res.status(200).json({ data: tableResponse });
        } catch (error) {
            console.log(error,'errr')
            return res.status(500).json({ a: error, error: 'Error fetching data' });
        }
    } else {
        res.setHeader('Allow', ['GET']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}