const { User, Role, Package } = require('../models');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll({
      include: [
        { model: Role, attributes: ['name'] },
        { model: Package, as: 'package', attributes: ['name', 'duration_days'] }
      ],
      order: [['created_at', 'DESC']],
    });
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load users' });
  }
};
