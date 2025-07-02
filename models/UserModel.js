// models/UserModel.js
let users = [];

export default class UserModel {
  static async findAll() {
    return [...users];
  }

  static async findById(id) {
    const userId = parseInt(id, 10);
    return users.find(u => u.id === userId) || null;
  }

  static async create(data) {
    const newUser = {
      id: users.length + 1,
      active: true,
      permissions: [],
      ...data,
    };
    users.push(newUser);
    return newUser;
  }

  static async update(id, data) {
    const userId = parseInt(id, 10);
    const idx = users.findIndex(u => u.id === userId);
    if (idx === -1) return null;
    users[idx] = { ...users[idx], ...data };
    return users[idx];
  }
}
