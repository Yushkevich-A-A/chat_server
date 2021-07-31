class Subscriptions {
  constructor() {
    this.data = [];
  }

  add(newUser) {
    this.data.push(newUser);
  }

  update(id, nickname) {
    const item = this.data.find(item => item.id === id);
    item.nickname = nickname;
  }

  existUser(user) {
    const itemIndex = this.data.find(item => item.nickname === user);
    if (itemIndex) {
      return true;
    } else {
      return false;
    }
  }

  delete(id) {
    const itemIndex = this.data.findIndex(item => item.id === id);
    if(itemIndex !== -1){
      this.data.splice(itemIndex, 1);
      return true;
    } else {
      return false;
    }
  }

  getAllUsers() {
    return this.data.map(item => item.nickname);
  }
}

module.exports = {
  Subscriptions,
}