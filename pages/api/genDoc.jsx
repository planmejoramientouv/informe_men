import { createDocumentFromTemplate } from '../../libs/googledocs';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        try {
            const {
                data
            } = req.body
            console.log(req.body,"data_data_data_data_data_data_data_")
            await createDocumentFromTemplate({ 
                dataKey: data?.data,
                res: res
            });
        } catch (error) {
            console.log(error,'errr')
            return res.status(500).json({ a: error, error: 'Error fetching data' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}