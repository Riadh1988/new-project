import { mongooseConnect } from '../../lib/mongoose';
import { Admin, Supervisor, Recruitment } from '../../models/Access';

export default async function handler(req, res) {
  await mongooseConnect();

  if (req.method === 'GET') {
    try { 
      const admins = await Admin.find();
      const supervisors = await Supervisor.find();
      const recruitments = await Recruitment.find();
      const users = [...admins, ...supervisors, ...recruitments];
      res.status(200).json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Error fetching users' });
    }
  } else if (req.method === 'POST') {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email and role are required' });
    }

    try {
      let user;
      if (role === 'admin') {
        user = await Admin.create({ email, role });
      } else if (role === 'supervisor') {
        user = await Supervisor.create({ email, role });
      } else if (role === 'recruitment') {
        user = await Recruitment.create({ email, role });
      } else {
        return res.status(400).json({ error: 'Invalid role' });
      }
      res.status(201).json(user);
    } catch (error) {
      console.error('Error adding user:', error);
      res.status(400).json({ error: 'User already exists or invalid data' });
    }
  } else if (req.method === 'DELETE') {
    const { email } = req.body;
    try {
      await Admin.deleteOne({ email });
      await Supervisor.deleteOne({ email });
      await Recruitment.deleteOne({ email });
      res.status(200).json({ message: 'User deleted' });
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(400).json({ error: 'Error deleting user' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
