import { updateDataField } from '../../libs/googlesheet';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const {
                sheetId,
                gid,
                data
            } = req.body
            const tableResponse = await updateDataField({ 
                sheetId: sheetId,
                gid: gid,
                data: data
            });
            return res.status(200).json({ data: tableResponse });
        } catch (error) {
            console.log(error,'errr')
            return res.status(500).json({ a: error, error: 'Error fetching data' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}