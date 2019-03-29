module.exports = class ApplicationPolicy {
  constructor(user, record) {
    this.user = user;
    this.record = record;
  }

  _isMember() {
    return this.user != null;
  }

  _isOwner() {
    if (this._isMember()) {
      return this.record && (this.record.userId == this.user.id);
    } else {false}
  }

  _isAdmin() {
    return this.user && (this.user.role == 'admin');
  }

  new() {
    return this.user != null;
  }

  create() {
    return this.new();
  }

  show() {
    return true;
  }

  edit() {
    return (this.new() &&
      this.record && (this._isOwner() || this._isAdmin()));
  }

  update() {
    return this.edit();
  }

  destroy() {
    return this.update();
  }

}
