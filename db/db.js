class Subscriptions {
  constructor() {
    this.data = [];
  }

  add(newUser) {
    this.data.push(newUser);
  }

  existUser(user) {
    const value = this.data.find(item => item === user);
    if (value) {
      return true;
    } else {
      return false;
    }
  }

  delete(user) {
    const value = this.data.findIndex(item => item === user);
    if(value !== -1){
      this.data.splice(value, 1);
      return true;
    } else {
      return false;
    }
  }
}

module.exports = {
  Subscriptions,
}